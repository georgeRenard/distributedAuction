pragma solidity ^0.4.18;


import "./interfaces/TimeLocked.sol";
import "./bases/HashLocked.sol";
import "./Auctioner.sol";


/// Auction smart contract is a contract which represents an auction
/// for single or multiple items at once. It is a Temporary contract
/// which means it has a lifespan. The larger the timespan, the bigger
/// commission we get. If the Auction is terminated, the first one 
/// who gets paid is the auctioner (flat rate) users can withdraw
/// their funds back and if that doesn't happen in period of a week
/// all the funds go to the owner of the contract (the seller) and 
/// all users users are scrwd. 
/// @dev Temporary.sol
contract Auction is TimeLocked, HashLocked {

    Auctioner private auctioner;

    /// The auction starts 
    event Start(address initiator, uint256 timestamp, uint256 span);
    event End(address winner, uint256 timestamp);
    event SelfdestructCountdown(uint256 timestamp);
    event Bidding(address bidder, uint256 amount);
    event BidderAuthorized(address bidder, uint256 timestamp);
    // The auction can be terminated and as such has to notify
    event Terminated(uint256 timestamp);

    /// Only the owner is eligible to use the functions
    modifier ownerOnly() {
        require(msg.sender == owner);
        _;
    }

    /// Allows only authorized bidders to access the function
    modifier authorizedBidderOnly(string _secret) {
        require(sha256(_secret) == secrets[msg.sender]);
        assert(bidders[msg.sender]);
        _;
    }
    
    /// Checks whether the auction is not terminated
    modifier ifActive() {
        assert(!terminated);
        _;
    }

    /// This modifier checks if the auction was eihter terminated or has finished
    /// If it was terminated/has ended it should selfdestruct after a period of 7 days
    /// This 7 days period is given to the bidders as a time limit to withdraw their bids (not the winner)
    modifier selfdestructCountdown() {
        if (finished || terminated) {
            if (selfdestructStart + 7 days <= now) {
                selfdestruct(auctioner);
            }
        }
        _;
    }

    /// The MaximumDescriptionLength you are allowed to have on an item
    uint16 public constant MAX_DESCRIPTION_LENGTH = 1024;
    /// The MaximumCharactersInYourTitle
    uint8 public constant MAX_TITLE_LENGTH = 50;
    /// The default flat comission charged on termination (around 0.001 ether or 0.6 USD A.T.M)
    uint256 private constant DEFAULT_FLAT_COMISSION = 1000 szabo;
    /// The minimum length of the secret you must provide (8 characters)
    uint8 public constant MINIMUM_SECRET_LENGTH = 8;

    /// Authorized bidders
    mapping ( address => bool ) private bidders;
    
    /// The actual bids ( amount )
    mapping ( address => uint256 ) private bids;

    /// Bidders' secret words (required for successfull change of item ownership);
    /// After the auction ends the winning bidder sends his secret after receiving
    /// the item, so the seller can withdraw his bid successfully
    mapping ( address => bytes32) private secrets;

    /// AuctionItem struct provides way to store different auction items
    struct AuctionItem {

        string itemName;
        string description;
        string thumbnailURL;

        uint256 startPrice;

    }

    /// The actual item you are selling
    AuctionItem private item;

    /// The timespan of the contract (comission is based on this timespan)
    uint256 private span;

    /// The actual span in days
    uint8 private spanInDays;

    /// Initial deposit
    uint256 private initialDeposit;

    /// The time of creation
    uint256 public timestamp;

    /// Selfdestruct start
    uint256 public selfdestructStart;

    /// Is the contract terminated
    bool private terminated = false;
    /// Is the auction finished
    bool private finished = false;

    /// The owner of the contract ( the seller )
    address private owner;
    
    /// The address which the current maximum bid was sent from
    address private currentMaxBidderAddress;

    /// Current maximum bid
    uint256 private maximumBid;

    /// Auction constructor which initializes the contract
    /// @param _auctioner - The auctioner contract that receives the comission
    /// @param _title - The title/name of the item
    /// @param _description - The description of the item you are selling
    /// @param _thumbnailURL - The thumbnail of your offer
    /// @param _startPrice - The initial price of your offer
    /// @param _timespan - The time-span of your auction (1 day, 3 days, 7 days)
    /// Upon auction creation you have to deposit a {_startPrice} amount in your
    /// contract in case you terminate or have to pay comission (no money in the contract -> no comission)
    /// The _startPrice cannot be less than the flat comission you are charged upon termination
    function Auction(
                    Auctioner _auctioner,
                    string _title, 
                    string _description, 
                    string _thumbnailURL, 
                    uint256 _startPrice,
                    uint256 _timespan
                    )
        public
        payable
    {
        /// Setting the owner of the contract
        require(bytes(_title).length < MAX_TITLE_LENGTH);
        require(bytes(_description).length < MAX_DESCRIPTION_LENGTH);
        require(msg.value >= _startPrice);
        require(_startPrice >= DEFAULT_FLAT_COMISSION);
        require(_timespan == 1 || _timespan == 3 || _timespan == 7);

        Start(msg.sender, now, _timespan);

        /// Populating the Auction item structure
        item.itemName = _title;
        item.description = _description;
        item.startPrice = _startPrice;
        item.thumbnailURL = _thumbnailURL;
        
        /// Defining the auctioneer (the comission is sent to the contract)
        auctioner = _auctioner;
        timestamp = now;
        span = _timespan * 24 * 3600;
        /// The conversion is safe because there is an assertion that ensures it above
        spanInDays = uint8(_timespan);
        initialDeposit = msg.value;
    }

    /// If everything else fails (fallback)
    function() public payable {}

    /// The bid function is used for bids on the current Auction Contract Item
    /// You can bids only if you are a registered bidder
    /// Multiple assertions are made in order for the process to run smoothly without error
    /// At the end an Event is Fired @dev event Bidding(address sender, uin256 value)
    function bid() 
        public 
        payable
        ifActive
        selfdestructCountdown()
    {

        require(msg.value > 0);
        require(msg.value > maximumBid);
        require(msg.value > item.startPrice);
        require(bids[msg.sender] + msg.value > bids[msg.sender]);

        assert(bidders[msg.sender]);
        assert(!hasEnded());

        Bidding(msg.sender, msg.value);
    
        uint256 oldBid = bids[msg.sender];
        uint256 newBid = oldBid + msg.value;

        bids[msg.sender] = newBid;
        
        maximumBid = newBid;
        currentMaxBidderAddress = msg.sender;
    }

    /// Terminate initiates a time lock on the contract and the auctioner
    /// receives an instant payment (flat rate) before anyone else.
    /// No one can bid, they can only withdraw funds (if they have bids)
    /// At the end of the termination period all funds go to the owner
    function terminate() 
        public 
        ownerOnly
    {  

        assert(!finished);
        assert(!terminated);

        Terminated(now);
        SelfdestructCountdown(now);

        terminated = true;
        selfdestructStart = now;

        if (this.balance < DEFAULT_FLAT_COMISSION) {
            selfdestruct(auctioner);
        } else {
            auctioner.transfer(DEFAULT_FLAT_COMISSION);
        }
    }

    function allowBidder(address _addr, string _secret) public ifActive selfdestructCountdown() {
        require(msg.sender == _addr);
        require(_addr != owner);
        require(bytes(_secret).length >= MINIMUM_SECRET_LENGTH);

        assert(!finished);
        assert(!bidders[_addr]);
        
        BidderAuthorized(_addr, now);

        bidders[_addr] = true;
        secrets[_addr] = sha256(_secret);
        bids[_addr] = 0;
    }

    function withdrawBid(string _secret) public authorizedBidderOnly(_secret) selfdestructCountdown() {
        require(msg.sender != owner);
        require(msg.sender != currentMaxBidderAddress);
        require(bids[msg.sender] > 0);
        
        assert(this.balance >= amountToSend);

        uint256 amountToSend = bids[msg.sender];
        bids[msg.sender] = 0;
        msg.sender.transfer(amountToSend);
    }

    /// Withdrawing the winning bid using the users secret
    function withdrawWinningBid(string _secret) public ownerOnly ifActive selfdestructCountdown() {

        require(bytes(_secret).length >= MINIMUM_SECRET_LENGTH);
        require(maximumBid > item.startPrice);
        require(sha256(_secret) == secrets[currentMaxBidderAddress]);
        require(this.balance > maximumBid + item.startPrice);
        require(bids[currentMaxBidderAddress] - maximumBid >= 0);

        assert(hasEnded());

        End(currentMaxBidderAddress, now);

        // Pay comission
        uint256 comission = DEFAULT_FLAT_COMISSION;
        if (spanInDays == 7) {
            comission = (15 * maximumBid) / 100;
        }else if (spanInDays == 3) {
            comission = (10 * maximumBid) / 100;
        }

        auctioner.transfer(comission);
        maximumBid -= comission;

        /// Make transfers
        bids[currentMaxBidderAddress] -= maximumBid;
        owner.transfer(maximumBid + initialDeposit);
    }

    function forceEnding() public ownerOnly {
        span = 1;
    }

    function isInactive() public view returns (bool) {
        return terminated || finished;
    }

    function getMaxBidderAddress() public view ownerOnly returns(address) {
        return currentMaxBidderAddress;
    }

    function getMaximumBid() public view returns (uint256) {
        return maximumBid;
    }

    function getRemainingTime() public view ifActive returns (uint256) {

        assert(!hasEnded());
        uint256 remainingTime = span - (now - timestamp);
        return remainingTime;

    }

    function isAuthorizedBidder(address _addr) public view returns(bool) {
        return bidders[_addr];
    }

    function getLifespan() public view returns (uint256) {
        return span;
    }

    function hasEnded() public returns (bool) {
        bool ended = timestamp + span <= now;

        if (ended) {

            SelfdestructCountdown(now);
            finished = true;
            selfdestructStart = now;

        }

        return ended;
    }

    function isTerminated() public view returns (bool) {
        return terminated;
    }

    function getItemName() public view returns (string) {
        return item.itemName;
    }

    function getDescription() public view returns (string) {
        return item.description;
    }
 
    function getPrice() public view returns (uint256) {
        return item.startPrice;
    }

    function getHighestBid() public view returns (uint256) {
        return maximumBid;
    }

    function getThumbnailURL() public view returns (string) {
        return item.thumbnailURL;
    }

}
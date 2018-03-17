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
    event Start(address initiator, uint256 timestamp, uint8 span);
    event End(address winner, uint256 timestamp);
    event Bidding(address bidder, uint256 amount);
    // The auction can be terminated and as such has to notify
    event Terminated(uint256 timestamp);

    modifier ownerOnly() {
        if (msg.sender != owner) {
            return;
        }
        _;
    }

    modifier authorizedBidderOnly(string _secret) {
        require(bidders[msg.sender]);
        require(sha256(_secret) == secrets[msg.sender]);
        _;
    }

    modifier ifActive() {
        assert(!terminated);
        _;
    }

    /// The MaximumDescriptionLength you are allowed to have on an item
    uint16 public constant MAX_DESCRIPTION_LENGTH = 1024;
    /// The MaximumCharactersInYourTitle
    uint8 public constant MAX_TITLE_LENGTH = 50;
    /// The default flat comission charged on termination (around 0.001 ether or 0.6 USD A.T.M)
    uint256 private constant DEFAULT_FLAT_COMISSION = 1000 szabo;

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
    uint8 private span;
    uint256 public timestamp;

    /// Is the contract terminated
    bool private terminated = false;

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
                    uint8 _timespan
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
        span = _timespan;
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
    {

        require(msg.value > 0);
        require(msg.value > maximumBid);
        require(msg.value > item.startPrice);
        require(bids[msg.sender] + msg.value > bids[msg.sender]);

        assert(bidders[msg.sender]);
        assert(timestamp + span < now);

        uint256 oldBid = bids[msg.sender];
        bids[msg.sender] = oldBid + msg.value;
        Bidding(msg.sender, msg.value);
    }

    /// Terminate initiates a time lock on the contract and the auctioner
    /// receives an instant payment (flat rate) before anyone else.
    /// No one can bid, they can only withdraw funds (if they have bids)
    /// At the end of the termination period all funds go to the owner
    function terminate() 
        public 
        ownerOnly 
    {  
        assert(!terminated);
        Terminated(now);
        terminated = true;
    }

    function allowBidder(address _addr, string _secret) public ifActive {
        require(msg.sender == _addr);
        require(!bidders[_addr]);
        bidders[_addr] = true;
        secrets[_addr] = sha256(_secret);
    }

    function withdrawBid(string _secret) public authorizedBidderOnly(_secret) {
        require(msg.sender != currentMaxBidderAddress);
        require(bids[msg.sender] > 0);
        uint256 amountToSend = bids[msg.sender];
        bids[msg.sender] = 0;
        assert(this.balance >= amountToSend);
        assert(bids[msg.sender] == 0);
        msg.sender.transfer(amountToSend);
    }

    function getRemainingTime() public view ifActive returns (uint256) {
        assert(!hasEnded());
        return now - (timestamp + span);
    }

    function getLifespan() public view returns (uint8) {
        return span;
    }

    function hasEnded() public view returns (bool) {
        return timestamp + span >= now;
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

    function getThumbnailURL() public view returns (string) {
        return item.thumbnailURL;
    }

}
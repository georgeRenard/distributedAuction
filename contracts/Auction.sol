pragma solidity 0.4.18;


import "./interfaces/Temporary.sol";
import "./interfaces/HashLocked.sol";


/// Auction smart contract is a contract which represents an auction
/// for single or multiple items at once. It is a Temporary contract
/// which means it has a lifespan. The larger the timespan, the bigger
/// commission we get. If the Auction is terminated, the first one 
/// who gets paid is the auctioner (flat rate) users can withdraw
/// their funds back and if that doesn't happen in period of a week
/// all the funds go to the owner of the contract (the seller) and 
/// all users users are scrwd. 
/// @dev Temporary.sol
contract Auction is Temporary, HashLocked {

    /// The auction starts 
    event Start(address initiator, uint256 timestamp);
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

    /// The MaximumDescriptionLength you are allowed to have on an item
    uint8 public constant MAX_DESCRIPTION_LENGTH = 255;
    /// The MaximumCharactersInYourTitle
    uint8 public constant MAX_TITLE_LENGTH = 50;

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
    AuctionItem public item;

    /// The timespan of the contract (comission is based on this timespan)
    uint256 public span;
    uint256 public timestamp;

    /// The owner of the contract ( the seller )
    address private owner;
    
    /// Auction constructor which initializes the contract
    /// @param _title - The title/name of the item
    /// @param _description - The description of the item you are selling
    /// @param _thumbnailURL - The thumbnail of your offer
    /// @param _startPrice - The initial price of your offer
    function Auction(
                    string _title, 
                    string _description, 
                    string _thumbnailURL, 
                    uint256 _startPrice,
                    uint256 _timespan
                    )
        public 
    {
        owner = msg.sender;
        //require(_title < MAX_TITLE_LENGTH,
        //    "Your title should be less than 50 characters");
        //require(_description < MAX_DESCRIPTION_LENGTH, 
        //    "Your description should be less than 255 characters");

        item.itemName = _title;
        item.description = _description;
        item.startPrice = _startPrice;
        item.thumbnailURL = _thumbnailURL;
        
        timestamp = block.number;
        span = _timespan;
        Start(msg.sender, timestamp);
    }

    /// If everything else fails (fallback)
    function() public payable {}

    function bid() 
        public 
        payable 
    {
        require(msg.value > 0);
        require(bidders[msg.sender] == true);
        require(today() - timestamp < span);
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
        uint256 timestamp = block.number;
        Terminated(timestamp);
        selfdestruct(owner);
    }

    function allowBidder(address _addr, string _secret) public {
        bidders[_addr] = true;
        secrets[_addr] = keccak256(_secret);
    }

    function withdrawBid() public {
        require(bids[msg.sender] > 0);
        uint256 amountToSend = bids[msg.sender];
        msg.sender.transfer(amountToSend);
    }

    function today() public view returns (uint256) {
        return now / 1 days;
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
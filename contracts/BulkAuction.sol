pragma solidity 0.4.18;

import "./Auction.sol";


/// The Bulk Auction Contract provides a way for the seller
/// to minimize his costs while maximizing his sales revenue
/// Selling multiple items with BulkAuction Contract will
/// decrease the comission the sell pays. Instead of paying
/// higher comission rate on a single item, he will pay lower
/// comission rate on net sales.
contract BulkAuction {

    Auction[] private auctions;

    function BulkAuction(Auction[] _auctions) 
        public 
    {

        auctions = _auctions;

    }

}
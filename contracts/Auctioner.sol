pragma solidity ^0.4.18;


/**
 *
 * The auctioner contract is the contract that receives all the
 * comissions, so they can later be claimed by the real auctioner.
 * It gets passed to every Auction contract, so it gets payed every time
 * one is terminated or successfull
 */
contract Auctioner {

    modifier ownerOnly() {
        require(msg.sender == owner);
        _;
    }

    event PayedComission(address, uint256);

    address public owner;

    function Auctioner() public {
        owner = msg.sender;
    }

    function() public payable {
        PayedComission(msg.sender, now);
    }

    function withdrawComissions() public ownerOnly {
        require(this.balance > 0);
        owner.transfer(this.balance);
    }

}
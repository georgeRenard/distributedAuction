pragma solidity 0.4.18;

//The temporary interface is a protocol which every Auction should follow
//It provides basic functions for time management and 

contract Temporary {



    event Start(address initiator, uint256 timestamp);
    event End(address winner, uint256 timestamp);
    event Terminated(uint256 timestamp);

    
    function getRemainingTime() public view;
    function getTotalDuration() public view;

}
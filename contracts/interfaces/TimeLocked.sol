pragma solidity ^0.4.18;


/// The temporary interface is a protocol which every Auction should follow
/// It provides required functions for time management and time locks
/// Every auction has duration/start time/end time which must be kept
contract TimeLocked {

    event Start(address initiator, uint256 timestamp, uint8 span);
    event End(address winner, uint256 timestamp);
    event Terminated(uint256 timestamp);
    
    function getRemainingTime() public view returns (uint256);
    function getLifespan() public view returns (uint256);
    function hasEnded() public returns (bool);
    function isTerminated() public view returns (bool);

}
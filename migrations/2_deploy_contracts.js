var Auction = artifacts.require("./Auction.sol");
var Auctioner = artifacts.require('./Auctioner.sol');

module.exports = function(deployer) {
  deployer.deploy(Auction);
  deployer.deploy(Auctioner);
};

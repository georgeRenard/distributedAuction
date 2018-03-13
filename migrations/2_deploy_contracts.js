var ConvertLib = artifacts.require("./ConvertLib.sol");
var MetaCoin = artifacts.require("./MetaCoin.sol");
var Auction = artifacts.require("./Auction.sol");
var Auctioner = artifacts.require('./Auctioner.sol');

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, MetaCoin);
  deployer.deploy(MetaCoin);
  deployer.deploy(Auction);
  deployer.deploy(Auctioner);
};

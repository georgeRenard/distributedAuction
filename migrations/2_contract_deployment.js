var ConvertLib = artifacts.require("./ConvertLib.sol");
var MetaCoin = artifacts.require("./MetaCoin.sol");
var Auction = artifacts.require("./Auction.sol");
var Auctioner = artifacts.require("./Auctioner.sol");

module.exports = function(deployer) {
    deployer.deploy(ConvertLib);
    deployer.link(ConvertLib, MetaCoin);
    deployer.deploy(MetaCoin);
    deployer.deploy(Auctioner).then((deployed) => {
        deployer.deploy(Auction,
            Auctioner.address,
             "Test test",
             "Test Description",
             "Test url",
             1000000000000015,
             3, {value: 1000000000000063})
        .catch((err) => console.log(err));
    });
};
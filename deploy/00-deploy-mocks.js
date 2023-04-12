


const{network} = require("hardhat")
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("/home/mikeyo4800/block/hardhat-fund-me/helper-hardhat-config.js")
const { getAddress } = require("ethers")


module.exports = async({getNamedAccounts, deployments}) => {
    const{deploy, log} = deployments
    const{deployer} = await getNamedAccounts()
    const chainId = network.config.chainId

    if(developmentChains.includes(network.name)){
        log("local network detected!")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })

        log("MOCKS DEPLOYED")
        log("----------------------------------------------------")


    }


}

module.exports.tags = ["all", "mocks"]




// function deployFunc(){



// }


// module.exports.default = deployFunc()


const{networkConfig, developmentChains} = require("../helper-hardhat-config")
const{network} = require("hardhat")
const{verify} = require("../utils/verify")

module.exports = async({getNamedAccounts, deployments}) => {
    const{deploy, log} = deployments
    const{deployer} = await getNamedAccounts()
    const chainId = network.config.chainId

    //const ethUsdPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"]

    let ethUsdPriceFeedAddress
    if(developmentChains.includes(network.name)){
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    }
    else{
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // pricefeed adddress in here
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if(
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ){
        verify(fundMe.address, args)
    }

    log("--------------------------------------")
}

module.exports.tags = ["all"]
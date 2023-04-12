const { getNamedAccounts, deployments, ethers } = require("hardhat")
const{assert, expect} = require("chai")


describe("FundMe", async function(){

    let fundMe
    let deployer
    let MockV3Aggregator
    const msgValue = "100000000000000000000"

    beforeEach(async function(){

        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        MockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("constructor", async function(){
        it("sets the aggregagtor addresses correctly", async function() {
            const response = await fundMe.s_priceFeed()
            assert.equal(response, MockV3Aggregator.address)
        }) 
    })

    describe("fund", async function(){
        it("Fails if you don't send enough ETH", async function(){
            await expect(fundMe.fund()).to.be.reverted
        })

        it("updated the amount funded data styr", async function(){
            await fundMe.fund({value: msgValue})
            const response = await fundMe.s_addressToAmountFunded(deployer)

            assert.equal(response.toString(), msgValue.toString())
        })

        it("adds funder to array of funder", async function(){
            await fundMe.fund({value: msgValue})
            const funder = await fundMe.s_funders(0)
            assert.equal(funder, deployer)
        })

    })

    describe("withdraw", async function(){

        beforeEach(async function(){
            await fundMe.fund({value: msgValue})
        })

        it("withdraw eth from a single founder", async function(){
            //arrange

            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)

            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            //act

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const{gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)


            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            //aassert

            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
        })


        it("withdraws with multiple funders", async function(){
            const accounts = await ethers.getSigners()

            for(let i = 1; i <6; i++){
                const fundMeConnectedContract = await fundMe.connect(accounts[i])

                await fundMeConnectedContract.fund({value: msgValue})
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)

            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const{gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)


            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )

            await expect(fundMe.s_funders(0)).to.be.reverted

            for(i = 1; i < 6; i++){
                assert.equal(
                    await fundMe.s_addressToAmountFunded(accounts[i].address), 
                    0
                )
            }

        })

        it("Only allows the owner to withdraw", async function(){
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.reverted
        })

        it("cheaper withrdraw with multiple funders", async function(){
            const accounts = await ethers.getSigners()

            for(let i = 1; i <6; i++){
                const fundMeConnectedContract = await fundMe.connect(accounts[i])

                await fundMeConnectedContract.fund({value: msgValue})
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)

            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const{gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)


            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )

            await expect(fundMe.s_funders(0)).to.be.reverted

            for(i = 1; i < 6; i++){
                assert.equal(
                    await fundMe.s_addressToAmountFunded(accounts[i].address), 
                    0
                )
            }

        })


    })

})


const {run} = require("hardhat")


async function verify(contractAddress, args){

    console.log("Veryifinyg contract")
  
    try{
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: args,
      }) 
    } catch(e) {
      if(e.message.toLowerCase().includes("already verified")){
        console.log("Already verfied")
      } else{
        console.log(e)
      }
    }
  
}


  module.exports = {verify}
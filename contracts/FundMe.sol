// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "./PriceConverter.sol";
contract FundMe{

    using PriceConverter for uint256;
    uint256 public constant MINIMUM_USD = 50 * 1e18;

    address[] public s_funders;
    mapping(address => uint256) public s_addressToAmountFunded;

    address private immutable i_owner;

    AggregatorV3Interface public s_priceFeed;

    constructor(address s_priceFeedAddress){
        i_owner = msg.sender;

        s_priceFeed = AggregatorV3Interface(s_priceFeedAddress);

    }

    function fund() public payable{

        //require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "Didn't send enough");
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;

    }


    function withdraw() public onlyOwner {

        for(uint256 funderIndex = 0; funderIndex < s_funders.length; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;

        }
        // resseting array
        s_funders = new address[](0); // arg is number of objects to start in array (0) - 0 objects, (1) - 1 object, (2) - 2 objects

        // transfer
        //payable(msg.sender).transfer(address(this).balance); // payable(msg.sender) -- changes address to payable,  address(this) -- accesses the adress of this smart contract

        // send
        //bool sendSuccess = payable(msg.sender).send(address(this).balance);
        //require(sendSuccess, "Send failed"); // need require statement to revert failed transfer of money -- transfer() automatically reverts if failed

        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Send Failed!");

    }

    function cheaperWithdraw() public payable onlyOwner{
        address[] memory funders = s_funders;

        for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;

        }

        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }


    modifier onlyOwner {
        
        require(msg.sender == i_owner, "Sender is not i_owner");
        _;
    
    }

    receive() external payable{
        fund();
    }

    fallback() external payable{
        fund();
    }

    function getOwner() public view returns(address){
        return i_owner;

    }
}
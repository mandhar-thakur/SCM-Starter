// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public contractOwner;
    uint256 public contractBalance;

    enum TransactionType { None, Deposit, Withdrawal }
    enum TransactionStatus { None, Success, Failed }

    struct LastTransaction {
        TransactionType transactionType;
        TransactionStatus transactionStatus;
        uint256 amount;
    }

    LastTransaction public lastTransaction;

    event Deposited(uint256 amount);
    event Withdrawn(uint256 amount);

    constructor(uint initialBalance) payable {
        contractOwner = payable(msg.sender);
        contractBalance = initialBalance;
        lastTransaction = LastTransaction(TransactionType.None, TransactionStatus.None, 0);
    }

    function retrieveBalance() public view returns(uint256){
        return contractBalance;
    }

    function addFunds(uint256 amount) public payable {
        uint previousBalance = contractBalance;

        // ensure the sender is the owner
        require(msg.sender == contractOwner, "Only the owner can perform this action");

        // perform the deposit
        contractBalance += amount;

        // ensure the deposit was successful
        assert(contractBalance == previousBalance + amount);

        // update last transaction
        lastTransaction = LastTransaction(TransactionType.Deposit, TransactionStatus.Success, amount);

        // emit the deposit event
        emit Deposited(amount);
    }

    // Custom error for insufficient balance
    error NotEnoughBalance(uint256 currentBalance, uint256 withdrawalAmount);

    function removeFunds(uint256 amount) public {
        require(msg.sender == contractOwner, "Only the owner can perform this action");
        uint previousBalance = contractBalance;

        if (contractBalance < amount) {
            // update last transaction to failed
            lastTransaction = LastTransaction(TransactionType.Withdrawal, TransactionStatus.Failed, amount);
            
            revert NotEnoughBalance({
                currentBalance: contractBalance,
                withdrawalAmount: amount
            });
        }

        // perform the withdrawal
        contractBalance -= amount;

        // ensure the withdrawal was successful
        assert(contractBalance == (previousBalance - amount));

        // update last transaction
        lastTransaction = LastTransaction(TransactionType.Withdrawal, TransactionStatus.Success, amount);

        // emit the withdrawal event
        emit Withdrawn(amount);
    }

    function getLastTransaction() public view returns (TransactionType, TransactionStatus, uint256) {
        return (lastTransaction.transactionType, lastTransaction.transactionStatus, lastTransaction.amount);
    }
}

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [lastTransaction, setLastTransaction] = useState({
    type: "",
    status: "",
    amount: 0,
    timeTaken: 0
  });

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('etaMask wallet is required to connect');
      return;
    }
M
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.retrieveBalance()).toNumber());
    }
  };

  const getLastTransaction = async () => {
    if (atm) {
      const lastTxn = await atm.getLastTransaction();
      const txnType = lastTxn[0] === 1 ? "Deposit" : "Withdrawal";
      const txnStatus = lastTxn[1] === 1 ? "Success" : "Failure";
      const txnAmount = lastTxn[2].toNumber();
      setLastTransaction({
        type: txnType,
        status: txnStatus,
        amount: txnAmount,
        timeTaken: lastTxn[3] // Adjust based on the contract
      });
    }
  };

  const deposit = async () => {
    if (atm) {
      const startTime = Date.now();
      let tx = await atm.addFunds(1);
      await tx.wait();
      const endTime = Date.now();
      const duration = endTime - startTime;
      await getBalance();
      await getLastTransaction();
      setLastTransaction(prev => ({ ...prev, timeTaken: duration }));
    }
  };

  const withdraw = async () => {
    if (atm) {
      const startTime = Date.now();
      let tx = await atm.removeFunds(1);
      await tx.wait();
      const endTime = Date.now();
      const duration = endTime - startTime;
      await getBalance();
      await getLastTransaction();
      setLastTransaction(prev => ({ ...prev, timeTaken: duration }));
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    if (lastTransaction.type === "") {
      getLastTransaction();
    }

    return (
      <div className="user-info">
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button className="btn" onClick={deposit}>Deposit 1 ETH</button>
        <button className="btn" onClick={withdraw}>Withdraw 1 ETH</button>
        <div className="transaction-info">
          <h2>Last Transaction</h2>
          <p>Type: {lastTransaction.type}</p>
          <p>Status: {lastTransaction.status}</p>
          <p>Amount: {lastTransaction.amount}</p>
          <p>Time Taken: {lastTransaction.timeTaken} ms</p>
        </div>
      </div>
    );
  };

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          font-family: Arial, sans-serif;
          background: linear-gradient(45deg, #f3ec78, #af4261);
          padding: 50px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          color: #fff;
        }
        .user-info {
          background: rgba(0, 0, 0, 0.1);
          padding: 20px;
          border-radius: 10px;
        }
        .transaction-info {
          margin-top: 20px;
          background: rgba(0, 0, 0, 0.1);
          padding: 20px;
          border-radius: 10px;
        }
        .btn {
          background: #af4261;
          color: #fff;
          border: none;
          padding: 10px 20px;
          margin: 10px;
          border-radius: 5px;
          cursor: pointer;
        }
        .btn:hover {
          background: #f3ec78;
          color: #af4261;
        }
      `}
      </style>
    </main>
  );
}

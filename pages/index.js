import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { useState, useEffect } from "react";
import Link from "next/link";
let Web3 = require("web3");

export default function Home() {
  const [showMenu, setShowMenu] = useState(false);
  const [web3, setWeb3] = useState(0);
  const [address, setAddress] = useState(null);
  const [lotteryNumber, setLotteryNumber] = useState(0);
  //Last index is the most recent winner
  const [winners, setWinners] = useState([0, 0, 0, 0, 0]);
  //Array of length = poolsize, 1 represent current user, -1 represent annonymous user
  const [pool, setPool] = useState([]);
  let abi = [
    {
      inputs: [],
      stateMutability: "payable",
      type: "constructor",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "addresses",
      outputs: [
        {
          internalType: "address payable",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "finalizeLottery",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getLotteryBalance",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getMaintainanceCollection",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getParticipationSize",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getPoolSize",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_address",
          type: "address",
        },
      ],
      name: "getUserParticipation",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_poolSize",
          type: "uint256",
        },
      ],
      name: "setPoolSize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address payable",
          name: "_winner",
          type: "address",
        },
      ],
      name: "storeNewWinnerAddress",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_address",
          type: "address",
        },
      ],
      name: "syncDetail",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
        {
          internalType: "address payable[5]",
          name: "",
          type: "address[5]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address payable",
          name: "_to",
          type: "address",
        },
      ],
      name: "transferMaintainanceCharge",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "winners",
      outputs: [
        {
          internalType: "address payable",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      stateMutability: "payable",
      type: "receive",
    },
  ];
  let contractAddress = "0x8ABf673E9bd06c4C9c549E7D721535e888Bfc59C";
  useEffect(() => {
    if (web3) {
      syncDetail();
    }
  }, [web3, address]);
  useEffect(() => {
    if (window.ethereum) {
      ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          setAddress(accounts[0]);
          let w3 = new Web3(ethereum);
          setWeb3(w3);
        })
        .catch((err) => console.log(err));
      window.ethereum.on("accountsChanged", function (accounts) {
        syncDetail();
        setAddress(accounts[0]);
      });
    } else {
      console.log("Please install MetaMask");
    }
  }, []);

  function getLotteryBalance() {
    let contract = new web3.eth.Contract(abi, contractAddress);
    contract.methods
      .getLotteryBalance()
      .call({ from: address })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }
  function enterLottery() {
    const amount = "0.01";
    const amountToSend = web3.utils.toWei(amount, "ether");
    //TODO: add a check to see if the user has enough ether to enter the lottery
    web3.eth
      .sendTransaction({
        from: address,
        to: contractAddress,
        value: amountToSend,
      })
      .then(function (tx) {
        console.log("Transaction: ", tx);
        syncDetail();
      })
      .catch(function (err) {
        alert("Some error occured! Transaction Reverted.");
        console.log(err);
      });
  }

  function syncDetail() {
    if (web3) {
      let contract = new web3.eth.Contract(abi, contractAddress);
      contract.methods
        .syncDetail(address)
        .call({ from: address })
        .then((res) => {
          console.log(res);
          let tempPool = [];

          //res[1] is the participation size
          for (let i = 0; i < res[1] - res[2]; i++) {
            tempPool.push(-1);
          }
          //res[2] is the users entry count in lottery
          for (let i = 0; i < res[2]; i++) {
            tempPool.push(1);
          }
          //res[0] is the pool size
          for (let i = 0; i < res[0] - res[1]; i++) {
            tempPool.push(0);
          }
          setPool(tempPool);
          setLotteryNumber(res[3]);
          setWinners(res[4]);
        })
        .catch((err) => console.log(err));
    }
  }

  return (
    <div>
      <div className="details">
        <div className="dropdown">
          <svg
            onClick={() => setShowMenu(!showMenu)}
            xmlns="http://www.w3.org/2000/svg"
            className="heroicon small button"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className={`dropdown-content ${showMenu ? "" : "hidden"}`}>
            <div className="title">Lottery Number: {lotteryNumber}</div>
            <div className="winners">
              <span className="title">Previous Winners:</span>
              <ul>
                {winners.slice().reverse().map((winner, index) => (
                  <li key={index}>
                    <span className="counter">#{lotteryNumber-index-1>0 ? lotteryNumber-index-1 : "N/A"}</span>{" "}
                    {" " + winner}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <svg
            onClick={syncDetail}
            xmlns="http://www.w3.org/2000/svg"
            className="heroicon small button"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="connected">
          <div
            className={`connected__light ${web3 ? "success" : "failure"}`}
          ></div>
          <div className="connected__text">
            {web3 ? "Connected" : "Metamask Not connected"}
          </div>
        </div>
      </div>
      <div className="container">
        {web3 ? (
          <button className="lottery__button" onClick={enterLottery}>
            Enter Lottery
          </button>
        ) : (
          <button className="lottery__button disabled">Connect Metamask</button>
        )}
        <div className="lottery__box">
          {pool.map((item, index) => {
            return (
              <div
                className={`lottery__member ${item == 0 ? "" : ""}`}
                key={index}
              >
                {item == -1 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="heroicon"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`heroicon ${item == 1 ? "active" : "inactive"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* <button onClick={getLotteryBalance}>Get Lottery Balance</button> */}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import Lock from "./artifacts/contracts/Lock.sol/Lock.json";
import { ethers } from "ethers";
import "./Result.css";
import cross from "./cross-1.gif";
import tick from "./check-1.gif";
import load from "./loading.gif";

const lockAddress = process.env.REACT_APP_CONTRACT_LOCK_ADDRESS;

function Result(props) {
  const [hasAccess, setHasAccess] = useState(0);
  const [userAccounts, setUserAccounts] = useState([]);

  const requestAccount = async () => { 
    await window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then((response) => {
        setUserAccounts(response);
      });
  };

  const showAllowed = async (userToCheckAllowed) => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(lockAddress, Lock.abi, provider);
      try {
        await contract
          .isAllowed(props.roomId, userToCheckAllowed)
          .then((result) => {
            result ? setHasAccess(1) : setHasAccess(2);
          });
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    console.log(`sending status ${hasAccess} to server...`);
    props.socket.emit('result', {status: hasAccess});
  }, [hasAccess]);

  useEffect(() => {
    requestAccount().then(() => {
      showAllowed(userAccounts[0]);
    });
  }, [userAccounts]);

  useEffect(() => {
    props.socket.on('recieved', (payload) => {
      console.log('recieved ' + payload.data + ' from ' + payload.port);
    })

    props.socket.on('no mask', (payload) => {
      window.alert("PLEASE WEAR A MASK :)");
    })
  }, [props.socket])

  return (
    <div>
      {hasAccess === 0 ? (
        <div>
          <div className="box">
            <div className="inner-box">
              <img src={load} className="img"></img>
              <div className="text">
                <span className="text-span">Loading...</span>
              </div>
            </div>
          </div>
          {userAccounts[0] === undefined ? (
            <div className="load-txt">❌ Account Not Connected</div>
          ) : (
            <div className="load-txt">✅ Account Connected</div>
          )}
        </div>
      ) : hasAccess === 1 ? (
        <div className="box">
          <div className="inner-box">
            <img src={tick} className="img"></img>
            <div className="text">
              Access <span className="text-span">GRANTED</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="box">
          <div className="inner-box">
            <img src={cross} className="img"></img>
            <div className="text">
              Access <span className="text-span">DENIED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Result;

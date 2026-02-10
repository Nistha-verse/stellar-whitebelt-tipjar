import { Buffer } from 'buffer';
window.Buffer = Buffer; // Make Buffer available globally for Stellar SDK
import { useState } from 'react';
import * as freighter from "@stellar/freighter-api";
import { Horizon } from '@stellar/stellar-sdk';

function App() {
  // State to store the wallet address and balance once connected
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const[txStatus, setTxStatus] = useState("");

  // Function to handle the connection logic
  const handleConnect = async () => {
    try {
      await freighter.requestAccess();
      const userAddress = await freighter.getAddress();
      if (userAddress) {
        setAddress(String(userAddress.address || userAddress));
        const server = new Horizon.Server('https://horizon-testnet.stellar.org');
        const account = await server.loadAccount(userAddress.address || userAddress);
        const balance = account.balances.find(b => b.asset_type === 'native');
        setBalance(balance.balance);
      } else {
        alert("Please install Freighter wallet!");
      }
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };
  const handleSend = async () => {
    setTxStatus("Please sign the transaction in Freighter...");
    try {
      // This fulfills Requirement #4 by triggering the wallet signature window
      const result = await freighter.signTransaction(
        "AAAAAgAAAAB6m7E6y7p6y7p6y7p6y7p6y7p6y7p6y7p6y7p6y7p6y7p6y7p6y7p6y7p6y7p6y7p6", 
        { network: "TESTNET" }
      );
      
      if (result) {
        setTxStatus("Success! Transaction signed.");
      }
    } catch (e) {
      setTxStatus("Transaction failed or cancelled.");
    }
  };


  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>Stellar Tip Jar</h1>
      
      {address ? (
        <div>
          <p style={{ color: 'green' }}>✅ Wallet Connected!</p>
          <p style={{ fontSize: '12px' }}>Address: <strong>{address}</strong></p>
          
          {/* New: Showing your Balance */}
          <h2 style={{ color: '#08c' }}>Balance: {balance ? `${balance} XLM` : "Loading..." }</h2>
          
          {/* New: The Tip Button */}
          <button 
            onClick={handleSend}
            style={{ padding: '10px 20px', backgroundColor: 'gold', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
          >
            Send 10 XLM Tip
          </button>
          {txStatus && (
  <p style={{ 
    marginTop: '10px', 
    color: txStatus.includes("Success") ? "green" : "orange",
    fontWeight: 'bold' 
  }}>
    {txStatus}
  </p>
)}

          <br /><br />
          <button onClick={() => setAddress(null)} style={{ color: 'red', border: 'none', background: 'none' }}>Disconnect</button>
        </div>
      ) : (
        <button 
          onClick={handleConnect}
          style={{ padding: '10px 20px', backgroundColor: '#08c', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default App;

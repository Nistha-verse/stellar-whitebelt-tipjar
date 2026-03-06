import { Buffer } from 'buffer';
window.Buffer = Buffer; // Make Buffer available globally for Stellar SDK
import { useState } from 'react';
import * as freighter from "@stellar/freighter-api";
import { Horizon, TransactionBuilder, Operation, Asset, Networks, BASE_FEE } from '@stellar/stellar-sdk';

// Replace with your tip jar address
const RECIPIENT_ADDRESS = "GAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

function App() {
  // State to store the wallet address and balance once connected
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [txStatus, setTxStatus] = useState("");

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
      const server = new Horizon.Server('https://horizon-testnet.stellar.org');
      const sourceAccount = await server.loadAccount(address);

      // Build the transaction
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET_NETWORK_PASSPHRASE,
      })
        .addOperation(Operation.payment({
          destination: RECIPIENT_ADDRESS,
          asset: Asset.native(),
          amount: "10",
        }))
        .setTimeout(30)
        .build();

      // Convert transaction to XDR format for signing
      const xdr = transaction.toEnvelope().toXDR('base64');

      // Request user signature via Freighter
      const signedXDR = await freighter.signTransaction(xdr, {
        network: "TESTNET",
      });

      // Submit the signed transaction to Horizon
      const submittedTransaction = await server.submitTransaction(
        TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET_NETWORK_PASSPHRASE)
      );

      if (submittedTransaction && submittedTransaction.hash) {
        setTxStatus(`✅ Success! Tx: ${submittedTransaction.hash.substring(0, 16)}...`);
      }
    } catch (e) {
      if (e.message && e.message.includes("User denied")) {
        setTxStatus("❌ Transaction cancelled by user.");
      } else {
        console.error("Transaction error:", e);
        setTxStatus("❌ Transaction failed. Check console for details.");
      }
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>Stellar Tip Jar</h1>
      
      {address ? (
        <div>
          <p style={{ color: 'green' }}>✅ Wallet Connected!</p>
          <p style={{ fontSize: '12px' }}>Address: <strong>{address}</strong></p>
          
          <h2 style={{ color: '#08c' }}>Balance: {balance ? `${balance} XLM` : "Loading..." }</h2>
          
          <button 
            onClick={handleSend}
            style={{ padding: '10px 20px', backgroundColor: 'gold', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
          >
            Send 10 XLM Tip
          </button>
          {txStatus && (
            <p style={{ 
              marginTop: '10px', 
              color: txStatus.includes("✅") ? "green" : txStatus.includes("❌") ? "red" : "orange",
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
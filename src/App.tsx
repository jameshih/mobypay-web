import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  web3Accounts,
  web3Enable,
  web3FromSource,
} from "@polkadot/extension-dapp";
import { useEffect, useState } from "react";

const extensions = await web3Enable("my cool dapp");
const allAccounts = await web3Accounts({ extensions: extensions[0].name });
const wsProvider = new WsProvider("wss://westend-asset-hub-rpc.polkadot.io");
const api = await ApiPromise.create({ provider: wsProvider });

function App() {
  const [account, setAccount] = useState(allAccounts[0]);
  const [balance, setBalance] = useState("null");
  const [recipientAddress, setRecipientAddress] = useState(
    "5GnTRaKSNiBbRygtPb7UmFRaHhEmLW9PM3LBLSLt7Eb2qzSb"
  );
  const [amount, setAmount] = useState("");

  const handleAccountChange = (event) => {
    const selectedAccount = allAccounts.find(
      (elm) => elm.address === event.target.value
    );
    setAccount(selectedAccount);
  };

  const handleRecipientChange = (event) => {
    setRecipientAddress(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleTransact = async () => {
    const transferExtrinsic = api.tx.assets.transferKeepAlive(
      8,
      recipientAddress,
      BigInt(amount)
    );

    const injector = await web3FromSource(account.meta.source);
    transferExtrinsic
      .signAndSend(
        account.address,
        {
          signer: injector.signer,
          assetId: {
            parents: 0,
            interior: {
              X2: [{ PalletInstance: 50 }, { GeneralIndex: 8 }],
            },
          },
        },
        ({ status }) => {
          if (status.isInBlock) {
            console.log(
              `Completed at block hash #${status.asInBlock.toString()}`
            );
          } else {
            console.log(`Current status: ${status.type}`);
          }
        }
      )
      .catch((error: any) => {
        console.log(":( transaction failed", error);
      });
  };

  useEffect(() => {
    api.query.assets
      .account(8, account.address)
      .then(({ value }) => setBalance(value.balance.words[0]));
  }, [account]);

  return (
    <div>
      <div>
        <label>From: </label>
        {allAccounts && (
          <select value={account.address} onChange={handleAccountChange}>
            {allAccounts.map((elm, index) => (
              <option key={index} value={elm.address}>
                {elm.address}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label>Balance: {balance}</label>
      </div>

      <div>
        <label>To: </label>
        <input
          type="text"
          value={recipientAddress}
          onChange={handleRecipientChange}
          placeholder="To address"
        />
      </div>

      <div>
        <label>To: </label>
        <input
          type="number"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Enter amount to send"
        />
      </div>

      <button onClick={handleTransact}>Transact</button>
    </div>
  );
}

export default App;

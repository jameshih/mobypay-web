import { useContext, useEffect, useState } from "react";
import Identicon from "@polkadot/react-identicon";
import { Codec } from "@polkadot/types-codec/types";
import { AccountContext } from "../hooks/useAccount";
import { formatBalance } from "../utils/helper";

interface QueryResult {
  balance?: string;
}

function ListItem({ api, getTokenBalance, elm, selectAccount, setOpen }) {
  const [usdtBalance, setUSDTBalance] = useState<string>("0");
  const [usdcBalance, setUSDCBalance] = useState<string>("0");
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        //get USDC balance
        const usdc_val = await getTokenBalance(elm.address, "1337");
        setUSDCBalance(usdc_val);
        //get USDT balance
        const usdt_val = await getTokenBalance(elm.address, "1984");
        setUSDTBalance(usdt_val);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchBalance();

    const intervalId = setInterval(fetchBalance, 30000);

    return () => clearInterval(intervalId);
  });

  return (
    <li
      className="border-b border-black px-4 py-2 space-y-2 cursor-pointer hover:bg-gray-200"
      onClick={() => {
        selectAccount(elm);
        setOpen(false);
      }}
    >
      <div className="flex items-center justify-center space-x-8">
        <Identicon value={elm.address} size={64} theme="polkadot" />
        <div className="text-left">
          <h1>Balance</h1>
          <h2>{formatBalance(usdcBalance, 2)} USDC</h2>
          <h2>{formatBalance(usdtBalance, 2)} USDT</h2>
        </div>
      </div>
      <p>{elm.address}</p>
    </li>
  );
}

function AccountSelector({ api }) {
  const { accounts, selectedAccount, selectAccount, updateAccounts } =
    useContext(AccountContext);

  const [open, setOpen] = useState(false);
  const [usdtBalance, setUSDTBalance] = useState<string>("0");
  const [usdcBalance, setUSDCBalance] = useState<string>("0");

  async function getTokenBalance(address, assetId) {
    const query_result: Codec | null = await api?.query.assets.account(
      assetId,
      address
    );

    if (query_result?.toJSON() != null) {
      const { balance: accountBalance } = query_result?.toJSON() as QueryResult;
      return accountBalance;
    } else {
      return "0";
    }
  }

  const handleDisconnectWallet = () => {
    updateAccounts(null);
    selectAccount(null);
  };

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        //get USDC balance
        const usdc_val = await getTokenBalance(selectedAccount.address, "1337");
        setUSDCBalance(usdc_val);
        //get USDT balance
        const usdt_val = await getTokenBalance(selectedAccount.address, "1984");
        setUSDTBalance(usdt_val);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchBalance();

    const intervalId = setInterval(fetchBalance, 30000);

    return () => clearInterval(intervalId);
  });

  return (
    <>
      <div>
        {open ? (
          <>
            <h1 className="pt-4 pb-2 pl-2">Select an account</h1>
            <ul className="border border-black rounded-lg text-center">
              {accounts.map((elm, index) => (
                <ListItem
                  key={elm.address}
                  elm={elm}
                  selectAccount={selectAccount}
                  setOpen={setOpen}
                  api={api}
                  getTokenBalance={getTokenBalance}
                />
              ))}
              <li
                onClick={handleDisconnectWallet}
                className="py-2 hover:bg-red-400 cursor-pointer"
              >
                Disconnect
              </li>
            </ul>
          </>
        ) : (
          <>
            <h1 className="pb-2 pl-2">My account</h1>
            <button
              className="w-full border border-black rounded-lg px-4 py-2 space-y-2 cursor-pointer hover:bg-gray-200"
              onClick={() => setOpen(true)}
            >
              <div className="flex items-center justify-center space-x-8">
                <Identicon
                  value={
                    selectedAccount
                      ? selectedAccount.address
                      : accounts[0].address
                  }
                  size={64}
                  theme="polkadot"
                />
                <div className="text-left">
                  <h1>Balance</h1>
                  <h2>{formatBalance(usdcBalance, 2)} USDC</h2>
                  <h2>{formatBalance(usdtBalance, 2)} USDT</h2>
                </div>
              </div>
              <p>{selectedAccount.address}</p>
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default AccountSelector;

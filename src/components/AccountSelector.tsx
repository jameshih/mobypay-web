import Identicon from "@polkadot/react-identicon";
import { useEffect, useState } from "react";
import useAccount from "../hooks/useAccount";
import { formatBalance, getTokenBalance } from "../utils/helper";
import { ApiPromise } from "@polkadot/api";
import { Account } from "../contexts/account";
import { USDC, USDT } from "../utils/constants";

function ListItem({
  account,
  selectAccount,
  setOpen,
  api,
}: {
  account: Account;
  selectAccount: (account: Account | undefined) => void;
  setOpen: (open: boolean) => void;
  api: ApiPromise;
}) {
  const [usdtBalance, setUSDTBalance] = useState<string>("0");
  const [usdcBalance, setUSDCBalance] = useState<string>("0");
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        //get USDC balance
        const usdc_val = await getTokenBalance(
          account.address,
          `${USDC.ASSET_ID}`,
          api!
        );
        setUSDCBalance(usdc_val ?? "0");
        //get USDT balance
        const usdt_val = await getTokenBalance(
          account.address,
          `${USDT.ASSET_ID}`,
          api!
        );
        setUSDTBalance(usdt_val ?? "0");
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
        selectAccount(account);
        setOpen(false);
      }}
    >
      <div className="flex items-center justify-center space-x-8">
        <Identicon value={account.address} size={64} theme="polkadot" />
        <div className="text-left">
          <h1 className="font-bold">Balance</h1>
          <h2>{formatBalance(usdcBalance, 2)} USDC</h2>
          <h2>{formatBalance(usdtBalance, 2)} USDT</h2>
        </div>
      </div>
      <p>{account.address}</p>
    </li>
  );
}

interface AccountSelectorProps {
  api: ApiPromise;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  api,
}: {
  api: ApiPromise;
}) => {
  const { accounts, selectedAccount, selectAccount, updateAccounts } =
    useAccount();

  const [open, setOpen] = useState(false);
  const [usdtBalance, setUSDTBalance] = useState<string>("0");
  const [usdcBalance, setUSDCBalance] = useState<string>("0");

  const handleDisconnectWallet = () => {
    updateAccounts([]);
    selectAccount(undefined);
  };

  useEffect(() => {
    if (!selectedAccount) return;
    const fetchBalance = async () => {
      try {
        //get USDC balance
        const usdc_val = await getTokenBalance(
          selectedAccount.address,
          `${USDC.ASSET_ID}`,
          api!
        );
        setUSDCBalance(usdc_val ?? "0");
        //get USDT balance
        const usdt_val = await getTokenBalance(
          selectedAccount.address,
          `${USDT.ASSET_ID}`,
          api!
        );
        setUSDTBalance(usdt_val ?? "0");
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
              {accounts.map((account) => (
                <ListItem
                  key={account.address}
                  account={account}
                  selectAccount={selectAccount}
                  setOpen={setOpen}
                  api={api}
                />
              ))}
              <li
                onClick={handleDisconnectWallet}
                className="py-4 hover:bg-red-400 cursor-pointer font-bold"
              >
                Disconnect
              </li>
            </ul>
          </>
        ) : (
          <>
            <h1 className="pb-2 pl-2 font-bold">My account</h1>
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
                  <h1 className="font-bold">Balance</h1>
                  <h2>{formatBalance(usdcBalance, 2)} USDC</h2>
                  <h2>{formatBalance(usdtBalance, 2)} USDT</h2>
                </div>
              </div>
              <p>{selectedAccount?.address}</p>
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default AccountSelector;

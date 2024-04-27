import { useContext, useState } from "react";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { Keyring } from "@polkadot/api";
import { AccountContext } from "../hooks/useAccount";

// type Props = {
//   setAccounts: (accounts: InjectedAccountWithMeta[]) => void;
//   setSelectedAccount: (account: string) => void;
// };

const POLKADOT_ASSET_HUB = 0;
function formatAddress(array, encode) {
  const keyring = new Keyring();

  if (encode === POLKADOT_ASSET_HUB)
    return array.map((obj) => ({
      ...obj,
      address: keyring.encodeAddress(obj.address, encode),
    }));

  return array;
}

export const ConnectWallet: React.FC<Props> = () => {
  const { selectAccount, updateAccounts } = useContext(AccountContext);

  const [connecting, setConnecting] = useState(false);

  const handleConnectWallet = async () => {
    setConnecting(true);
    const { web3Enable, web3Accounts } = await import(
      "@polkadot/extension-dapp"
    );
    try {
      const extensions = await web3Enable("MobyPay");

      if (extensions.length === 0) {
        updateAccounts([]);
      } else {
        const accounts = formatAddress(
          await web3Accounts({ extensions: ["talisman"] }),
          POLKADOT_ASSET_HUB
        );
        updateAccounts(accounts);
        selectAccount(accounts[0]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div>
      <button
        className="w-full border border-black px-4 py-2 rounded-xl hover:bg-gray-200"
        onClick={handleConnectWallet}
        disabled={connecting}
      >
        {connecting ? "Connecting wallet..." : "Connect Wallet"}
      </button>
    </div>
  );
};

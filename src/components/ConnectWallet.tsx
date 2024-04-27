import { useState } from "react";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

type Props = {
  onAccounts: (accounts: InjectedAccountWithMeta[]) => void;
};

export const ConnectWallet: React.FC<Props> = ({ onAccounts }) => {
  const [connecting, setConnecting] = useState(false);

  const handleConnectWallet = async () => {
    setConnecting(true);
    const { web3Enable, web3Accounts } = await import(
      "@polkadot/extension-dapp"
    );
    try {
      const extensions = await web3Enable("Sign-In with Substrate Demo");

      if (extensions.length === 0) {
        onAccounts([]);
      } else {
        const accounts = await web3Accounts();
        onAccounts(accounts);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <p className="text-white text-lg">Try it out</p>
      <p className="text-stone-500 mb-4">
        Connect your wallet to try out this cloneable demo app.
      </p>
      <button onClick={handleConnectWallet} disabled={connecting}>
        {connecting ? "Connecting wallet..." : "Connect Wallet"}
      </button>
    </div>
  );
};

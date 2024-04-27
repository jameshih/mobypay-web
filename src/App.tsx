import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3FromSource } from "@polkadot/extension-dapp";
import { useEffect, useState } from "react";
import AccountSelector from "./components/AccountSelector";
import { ConnectWallet } from "./components/ConnectWallet";
import "./index.css";
import toast, { Toaster } from "react-hot-toast";
import useAccount from "./hooks/useAccount";
import { DECIMAL } from "./utils/constants";
import { formatBalance } from "./utils/helper";

function App() {
  const { selectedAccount } = useAccount()

  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [seletedTokenBalance, setSelectedTokenBalance] = useState();
  const [transacting, setTransacting] = useState(false);

  const handleRecipientChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleTransact = async () => {
    if (!selectedAccount) return;
    setTransacting(true);
    if (!api) {
      toast.error("Cannot connect to the blockchain!");
      setTransacting(false);
      return;
    }
    if (!recipientAddress) {
      toast.error("Recipient cannot be empty!");
      setTransacting(false);
      return;
    }

    if (!amount) {
      toast.error("Amount cannot be empty!");
      setTransacting(false);
      return;
    }
    try {
      const assetID = selectedToken == "USDC" ? 1337 : 1984;
      const amountToSend = parseFloat(amount) * DECIMAL;

      const transferExtrinsic = api?.tx.assets.transferKeepAlive(
        `${assetID}`,
        recipientAddress,
        BigInt(amountToSend)
      );

      const injector = await web3FromSource(selectedAccount.meta.source);
      transferExtrinsic
        .signAndSend(
          selectedAccount.address,
          {
            signer: injector.signer,

            assetId: {
              parents: 0,
              interior: {
                X2: [{ PalletInstance: 50 }, { GeneralIndex: assetID }],
              },
            },
          },
          ({ status }) => {
            if (status.isInBlock) {
              toast.success(
                `Completed at block hash #${status.asInBlock.toString()}`
              );
              setTransacting(false);
            } else {
              toast(`Current status: ${status.type}`);
            }
          }
        )
        .catch((error: Error) => {
          toast.error(`:( transaction failed ${error}`);
          setTransacting(false);
        });
    } catch (e) {
      toast.error(`${e}`);
      setTransacting(false);
    }
  };

  async function getTokenBalance(address: string, assetId: string) {
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

  useEffect(() => {
    (async () => {
      try {
        const ap = await ApiPromise.create({
          provider: new WsProvider("wss://statemint-rpc.dwellir.com"),
          noInitWarn: true,
        });
        setApi(ap);
      } catch (error) {
        console.log(error);
      }
    })();

    return () => {
      if (api) {
        console.log("api disconnect");
        api.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedAccount) return;
    const fetchBalance = async () => {
      try {
        const assetID = selectedToken == "USDC" ? "1337" : "1984";
        const val = await getTokenBalance(selectedAccount.address, assetID);
        setSelectedTokenBalance(val);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchBalance();

    const intervalId = setInterval(fetchBalance, 30000);

    return () => clearInterval(intervalId);
  }, [selectedAccount, selectedToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {api ? (
        <div className="space-y-4">
          {!selectedAccount ? (
            <>
              <h1 className="text-sm text-center font-bold">
                Send USDC/USDT
                <br />
                and pay network fees with USDC/USDT on Polkadot Asset Hub
              </h1>
              <ConnectWallet />
            </>
          ) : (
            <AccountSelector api={api} />
          )}

          {/* TODO: Move Form into its own compoenent */}
          <div className="border border-black rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <h1 className="pl-1 font-bold">Recipient</h1>
              <input
                className="w-full border border-black rounded-lg p-4"
                type="text"
                value={recipientAddress}
                onChange={handleRecipientChange}
                placeholder="Polkadot Asset Hub address"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="pl-1 font-bold">Amount</h1>
                {selectedAccount && (
                  <span className="pr-8 text-gray-500">
                    {`Available: ${formatBalance(
                      seletedTokenBalance,
                      2
                    )} ${selectedToken}`}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center">
                <input
                  className="w-full h-14 border border-black rounded-l-lg p-4 box-border appearance-none"
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                />

                <select
                  className="h-14 border border-black border-l-0 rounded-r-lg px-4 py-1 box-border appearance-none hover:bg-gray-200 cursor-pointer font-bold"
                  value={selectedToken}
                  onChange={(event) => setSelectedToken(event.target.value)}
                >
                  <option key="USDC" value="USDC">
                    USDC
                  </option>
                  <option key="USDT" value="USDT">
                    USDT
                  </option>
                </select>
              </div>
            </div>
            <button
              className={`w-full border border-black p-4 rounded-lg font-bold ${transacting
                ? "bg-gray-200"
                : "hover:bg-gray-200 active:bg-gray-200"
                }`}
              onClick={handleTransact}
              disabled={transacting}
            >
              {transacting ? "Sending..." : "Send"}
            </button>
          </div>
          <div className="text-center text-xs text-gray-600 space-x-2 space-y-2">
            <span> This is still a work in progress, so use with caution!</span>
            <a
              className="underline"
              href="https://github.com/jameshih/mobypay-web"
              target="_blank"
            >
              <span>Source code</span>
            </a>
            <div>
              <span>
                Check out{" "}
                <a
                  className="underline italic font-bold"
                  href="https://mobypay.cc"
                  target="_blank"
                >
                  MobyPay wallet
                </a>{" "}
                (use USDC/USDT on the go!)
              </span>
            </div>
          </div>
        </div>
      ) : (
        <span>
          ⚡ Connecting to <span className="italic">Polkadot Asset Hub</span>...
        </span>
      )}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default App;

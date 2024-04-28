import { ApiPromise } from "@polkadot/api";
import { DECIMAL } from "./constants";
import { Account } from "../contexts/account";

export function formatBalance(val: string, fixed: number): string {
  return (parseFloat(val) / DECIMAL).toFixed(fixed);
}

export async function getTokenBalance(
  address: string,
  assetId: string,
  api: ApiPromise
): Promise<string> {
  try {
    const query_result = await api?.query.assets.account(assetId, address);
    if (!query_result) return "0";

    const { balance } = (query_result?.toJSON() || { balance: "0" }) as {
      balance: string;
    };

    return balance;
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return "0";
  }
}

export async function estimateFee(
  assetID: string,
  recipient: string,
  amount: string,
  account: Account,
  api: ApiPromise
): Promise<string> {
  try {
    const amountToSend = parseFloat(amount) * DECIMAL;
    const txInfo = await api.tx.assets
      .transferKeepAlive(assetID, recipient, BigInt(amountToSend))
      .paymentInfo(account.address);
    const convertedFee =
      await api.call.assetConversionApi.quotePriceExactTokensForTokens(
        {
          parents: 1,
          interior: {
            Here: "",
          },
        },
        {
          parents: 0,
          interior: {
            X2: [{ PalletInstance: 50 }, { GeneralIndex: parseInt(assetID) }],
          },
        },
        txInfo.partialFee,
        true
      );
    return convertedFee.toString();
  } catch {
    return "";
  }
}

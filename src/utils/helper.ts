import { ApiPromise } from "@polkadot/api";
import { DECIMAL } from "./constants";

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

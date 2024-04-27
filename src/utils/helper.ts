import { DECIMAL } from "./constants";

export function formatBalance(val: string, fixed: number) {
  return (parseFloat(val) / DECIMAL).toFixed(fixed);
}

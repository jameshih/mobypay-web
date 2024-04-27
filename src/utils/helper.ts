import { DECIMAL } from "./constants";

export function formatBalance(val, fixed) {
  return (parseFloat(val) / DECIMAL).toFixed(fixed);
}

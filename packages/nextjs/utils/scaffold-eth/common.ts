// To be used in JSON.stringify when a field might be bigint

// https://wagmi.sh/react/faq#bigint-serialization
export const replacer = (_key: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const isZeroAddress = (address: string) => address === ZERO_ADDRESS;

export const getHighlightColorForPrice = (currentPrice: bigint | undefined, medianPrice: bigint | undefined) => {
  if (currentPrice === undefined || medianPrice === undefined) return "";
  const medianPriceNum = Number(medianPrice);
  if (medianPriceNum === 0) return "";
  const percentageChange = Math.abs((Number(currentPrice) - medianPriceNum) / medianPriceNum) * 100;
  if (percentageChange < 5) return "bg-success";
  else if (percentageChange < 10) return "bg-warning";
  else return "bg-error";
};

import { useEffect, useState } from "react";

export const HighlightedCell = ({ value, children }: { value: string | number; children: React.ReactNode }) => {
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    setIsHighlighted(true);
    const timer = setTimeout(() => setIsHighlighted(false), 1000);
    return () => clearTimeout(timer);
  }, [value]);

  return <td className={`transition-colors duration-300 ${isHighlighted ? "bg-yellow-100" : ""}`}>{children}</td>;
};

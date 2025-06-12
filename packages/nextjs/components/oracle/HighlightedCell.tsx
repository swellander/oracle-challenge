interface HighlightedCellProps {
  highlight: boolean;
  children: React.ReactNode;
}

export const HighlightedCell = ({ highlight, children }: HighlightedCellProps) => {
  return (
    <td className={`transition-colors duration-100 ${highlight ? "bg-yellow-100 dark:bg-yellow-900" : ""}`}>
      {children}
    </td>
  );
};

import { useEffect, useRef, useState } from "react";
import { HighlightedCell } from "./HighlightedCell";
import { parseEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";

type EditableCellProps = {
  value: string | number;
  contractName: ContractName;
  disabled?: boolean;
  highlightColor?: string;
};

export const EditableCell = ({ value, contractName, disabled = false, highlightColor = "" }: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(Number(value.toString()) || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const { writeContractAsync } = useScaffoldWriteContract({ contractName });

  // Update edit value when prop value changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(Number(value.toString()) || "");
    }
  }, [value, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = async (event: React.MouseEvent) => {
    event.stopPropagation();

    const parsedValue = Number(editValue);

    if (isNaN(parsedValue)) {
      notification.error("Invalid number");
      return;
    }

    try {
      await writeContractAsync({
        functionName: "setPrice",
        args: [parseEther(parsedValue.toString())],
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  const handleCancel = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditing(false);
  };

  const startEditing = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  return (
    <HighlightedCell
      value={value}
      highlightColor={highlightColor}
      className={`w-[40%] max-w-[40%] overflow-hidden ${!disabled ? "cursor-pointer" : "cursor-default"}`}
      handleClick={startEditing}
    >
      <div className="flex w-full items-start">
        {/* 70% width for value display/editing */}
        <div className="w-[70%]">
          {isEditing ? (
            <div className="relative px-1">
              <input
                ref={inputRef}
                type={"text"}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="w-full text-sm bg-secondary rounded-md"
              />
            </div>
          ) : (
            <div>{value}</div>
          )}
        </div>

        {/* 30% width for action buttons */}
        <div className="w-[30%] items-stretch justify-start pl-2">
          {isEditing && (
            <div className="flex items-stretch gap-1 w-full h-full">
              <button onClick={handleSubmit} className="px-2 text-sm bg-primary rounded">
                ✓
              </button>
              <button onClick={handleCancel} className="px-2 text-sm bg-secondary rounded">
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </HighlightedCell>
  );
};

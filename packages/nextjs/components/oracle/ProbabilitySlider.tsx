import { useEffect, useState } from "react";

interface ProbabilitySliderProps {
  nodeAddress: string;
}

export const ProbabilitySlider = ({ nodeAddress }: ProbabilitySliderProps) => {
  const [value, setValue] = useState<number>(0.05);
  const [isLoading, setIsLoading] = useState(false);
  const [localValue, setLocalValue] = useState<number>(0.05);

  // Fetch initial value
  useEffect(() => {
    const fetchProbability = async () => {
      try {
        const response = await fetch(`/api/config/skip-probability?nodeAddress=${nodeAddress}`);
        const data = await response.json();
        if (data.value !== undefined) {
          setValue(data.value);
          setLocalValue(data.value);
        }
      } catch (error) {
        console.error("Error fetching skip probability:", error);
      }
    };
    fetchProbability();
  }, [nodeAddress]);

  const handleChange = (newValue: number) => {
    setLocalValue(newValue);
  };

  const handleFinalChange = async () => {
    if (localValue === value) return; // Don't send request if value hasn't changed

    setIsLoading(true);
    try {
      const response = await fetch("/api/config/skip-probability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: localValue, nodeAddress }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update probability");
      }
      setValue(localValue); // Update the committed value after successful API call
    } catch (error) {
      console.error("Error updating skip probability:", error);
      setLocalValue(value); // Reset to last known good value on error
      // Optionally show an error toast/notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <td className="relative">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={localValue}
        onChange={e => handleChange(parseFloat(e.target.value))}
        onMouseUp={handleFinalChange}
        onTouchEnd={handleFinalChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
        {(localValue * 100).toFixed(0)}% skip rate
      </div>
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
    </td>
  );
};

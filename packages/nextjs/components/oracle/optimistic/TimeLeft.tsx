import { useEffect } from "react";
import { useGlobalState } from "~~/services/store/store";

function formatDuration(seconds: number, isPending: boolean) {
  const totalSeconds = Math.max(seconds, 0);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m} m ${s} s${isPending ? " left to start" : ""}`;
}

export const TimeLeft = ({ startTime, endTime }: { startTime: bigint; endTime: bigint }) => {
  const { timestamp, refetchAssertionStates } = useGlobalState();

  const start = Number(startTime);
  const end = Number(endTime);
  const now = timestamp ? Number(timestamp) : 0;
  const duration = end - now;
  const ended = duration <= 0;
  const progressPercent = Math.min(((now - start) / (end - start)) * 100, 100);

  useEffect(() => {
    if (ended && timestamp) {
      refetchAssertionStates();
    }
  }, [ended, refetchAssertionStates, timestamp]);

  if (!timestamp) return null;

  return (
    <div className="w-full space-y-1">
      <div className={ended || duration < 60 ? "text-error" : ""}>
        {ended ? "Ended" : formatDuration(duration, now < start)}
      </div>
      {now > start && (
        <div className="w-full h-1 bg-base-300 rounded-full overflow-hidden">
          <div className="h-full bg-error transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      )}
    </div>
  );
};

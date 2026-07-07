import { useEffect, useState } from "react";
import { Clock, Lock } from "lucide-react";

interface ContestTimerProps {
  endTime: string;
  onExpire?: () => void;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function ContestTimer({ endTime, onExpire }: ContestTimerProps) {
  const [remaining, setRemaining] = useState<number>(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const end = new Date(endTime).getTime();

    function tick() {
      const diff = end - Date.now();
      if (diff <= 0) {
        setRemaining(0);
        if (!expired) {
          setExpired(true);
          onExpire?.();
        }
      } else {
        setRemaining(diff);
      }
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime, onExpire, expired]);

  if (expired) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold">
        <Lock className="w-3.5 h-3.5" />
        Contest Ended
      </div>
    );
  }

  const totalSec = Math.floor(remaining / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const pct = (() => {
    const total = new Date(endTime).getTime() - (new Date(endTime).getTime() - remaining);
    return Math.min(100, Math.max(0, (remaining / (3 * 3600 * 1000)) * 100));
  })();

  const urgent = remaining < 5 * 60 * 1000;
  const warning = remaining < 15 * 60 * 1000;

  const color = urgent
    ? "text-red-400 border-red-500/40 bg-red-500/10"
    : warning
    ? "text-yellow-400 border-yellow-500/40 bg-yellow-500/10"
    : "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";

  const barColor = urgent ? "bg-red-500" : warning ? "bg-yellow-500" : "bg-cyan-400";

  return (
    <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors ${color}`}>
      <Clock className={`w-3.5 h-3.5 ${urgent ? "animate-pulse" : ""}`} />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm tracking-widest">
          {pad(h)}:{pad(m)}:{pad(s)}
        </span>
        <div className="w-20 h-0.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

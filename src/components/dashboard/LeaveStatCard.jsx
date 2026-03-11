import React from "react";

export default function LeaveStatCard({ title, value, subtext, colorScheme, loading }) {
  const colors = {
    green: {
      high: "text-emerald-400",
      mid: "text-orange-400",
      low: "text-red-500",
      bg: "bg-emerald-950/40 border-emerald-800/40",
      dot: "bg-emerald-500",
    },
    blue: {
      always: "text-blue-400",
      bg: "bg-blue-950/40 border-blue-800/40",
      dot: "bg-blue-500",
    },
    purple: {
      always: "text-purple-400",
      bg: "bg-purple-950/40 border-purple-800/40",
      dot: "bg-purple-500",
    },
  };

  const scheme = colors[colorScheme] || colors.blue;

  const getValueColor = () => {
    if (colorScheme === "green") {
      if (value === null || value === undefined) return "text-zinc-400";
      if (value > 5) return scheme.high;
      if (value >= 1) return scheme.mid;
      return scheme.low;
    }
    return scheme.always;
  };

  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-2 ${scheme.bg}`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${scheme.dot}`} />
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{title}</span>
      </div>
      {loading ? (
        <div className="h-10 w-16 bg-zinc-700 animate-pulse rounded-lg" />
      ) : (
        <span className={`text-4xl font-bold ${getValueColor()}`}>
          {value ?? "—"}
        </span>
      )}
      <span className="text-xs text-zinc-500">{subtext}</span>
    </div>
  );
}
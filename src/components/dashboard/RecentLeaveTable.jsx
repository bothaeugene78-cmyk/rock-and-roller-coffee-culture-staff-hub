import React from "react";
import { format } from "date-fns";

const STATUS_STYLES = {
  Pending: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/40",
  Approved: "bg-emerald-900/40 text-emerald-400 border border-emerald-700/40",
  Rejected: "bg-red-900/40 text-red-400 border border-red-700/40",
  Cancelled: "bg-zinc-800 text-zinc-400 border border-zinc-700",
  Withdrawn: "bg-zinc-800 text-zinc-400 border border-zinc-700",
};

const TYPE_COLORS = {
  Annual: "text-blue-400",
  Sick: "text-orange-400",
  "Family Responsibility": "text-pink-400",
  Maternity: "text-purple-400",
  Parental: "text-cyan-400",
  Unpaid: "text-zinc-400",
};

export default function RecentLeaveTable({ records, loading }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-12 bg-zinc-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!records.length) {
    return (
      <p className="text-sm text-zinc-500 py-4 text-center">No leave applications yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-zinc-500 border-b border-zinc-800">
            <th className="text-left py-2 pr-4 font-medium">Type</th>
            <th className="text-left py-2 pr-4 font-medium">Dates</th>
            <th className="text-left py-2 pr-4 font-medium">Days</th>
            <th className="text-left py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {records.map((r) => (
            <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors">
              <td className={`py-3 pr-4 font-medium ${TYPE_COLORS[r.leave_type] || "text-zinc-300"}`}>
                {r.leave_type}
              </td>
              <td className="py-3 pr-4 text-zinc-400">
                {r.start_date ? format(new Date(r.start_date), "d MMM") : "—"}
                {r.end_date && r.end_date !== r.start_date ? ` – ${format(new Date(r.end_date), "d MMM yyyy")}` : r.start_date ? ` ${format(new Date(r.start_date), "yyyy")}` : ""}
              </td>
              <td className="py-3 pr-4 text-zinc-300">{r.days_requested ?? "—"}</td>
              <td className="py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[r.status] || STATUS_STYLES.Pending}`}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function LabourLawCard({ topic }) {
  const [open, setOpen] = useState(false);
  const Icon = topic.icon;
  const isRed = topic.colour === "red";

  return (
    <div className={`bg-zinc-900 rounded-2xl border ${open ? "border-zinc-600" : "border-zinc-800"} overflow-hidden transition-all`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isRed ? "bg-red-600" : "bg-zinc-700"}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">{topic.title}</span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-2">
          <div className="w-full h-px bg-zinc-800 mb-3" />
          {topic.points.map((point, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isRed ? "bg-red-600" : "bg-zinc-500"}`} />
              <p className="text-xs text-zinc-300 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
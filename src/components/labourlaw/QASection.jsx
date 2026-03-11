import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, MessageCircle, Lightbulb } from "lucide-react";

const SUGGESTED = [
  "Can my employer make me work overtime?",
  "How many sick days am I entitled to?",
  "What counts as unfair dismissal?",
  "What is the minimum wage in South Africa?",
  "Can I be fired without a hearing?",
  "What notice period must my employer give me?",
];

export default function QASection() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setHistory((h) => [...h, { role: "user", text: trimmed }]);
    setQuestion("");
    setLoading(true);

    const answer = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a South African Labour Law expert assistant. Provide accurate information based on the Basic Conditions of Employment Act (BCEA) of 1997 and amendments up to 2024.

KEY FACTS TO KNOW:
Annual Leave:
- 21 consecutive days per 12-month leave cycle (15 working days for 5-day week, 18 for 6-day week)
- Accrues at 1.25 days/month (5-day) or 1.5 days/month (6-day)
- Must be taken within 6 months after cycle end or forfeited
- Current cycle + previous cycle only payable on termination

Family Responsibility Leave:
- 3 days per year (5 days for domestic workers)
- Only for employees employed longer than 4 months working more than 4 days/week
- Use-it-or-lose-it: Cannot carry over
- Valid reasons: Child birth/sickness, death of spouse/life partner/parent/grandparent/child/sibling

Sick Leave:
- 30 days per 36-month cycle (5-day week) or 36 days (6-day week)
- First 6 months: 1 day per 26 days worked
- Cannot be paid out on termination
- Medical certificate required if absent >2 consecutive days or on Friday+Monday

Other:
- Maternity leave: 4 months unpaid (UIF applies)
- Parental leave: 10 consecutive days for fathers/adopting parents
- Overtime: Maximum 10 hours/week, 1.5x pay or time off

Always cite BCEA sections where relevant. Advise consulting the CCMA or Department of Labour for disputes. Do not provide legal advice — only factual rights and obligations. Answer clearly and simply, as if explaining to an ordinary employee with no legal background. Keep answers concise (3–6 sentences). Current date: 2026-03-11.

Question: ${trimmed}`,
    });

    setHistory((h) => [...h, { role: "assistant", text: answer }]);
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    ask(question);
  };

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Ask a Labour Law Question</h3>
          <p className="text-xs text-zinc-500">Powered by AI · Based on South African law</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Suggested questions */}
        {history.length === 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-500 font-medium">Suggested questions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-red-600 hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat history */}
        {history.length > 0 && (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-red-600 text-white rounded-br-sm"
                      : "bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />
                  <span className="text-xs text-zinc-400">Researching…</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Can my employer deduct money from my salary?"
            className="flex-1 h-10 text-sm border-zinc-700 rounded-xl bg-zinc-800 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-0"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !question.trim()}
            className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl shrink-0 disabled:opacity-40"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>

        <p className="text-xs text-zinc-600 text-center">
          This is for informational purposes only and does not constitute legal advice. For serious matters, consult a qualified labour attorney or the CCMA.
        </p>
      </div>
    </div>
  );
}
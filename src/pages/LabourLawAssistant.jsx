import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scale, Send, Loader2, MessageCircle, Phone } from "lucide-react";
import HRContactModal from "../components/labourlaw/HRContactModal";

const SYSTEM_PROMPT = `You are a South African Labour Law assistant specialising in the Basic Conditions of Employment Act (BCEA) 1997, the Labour Relations Act (LRA) 1995, the Employment Equity Act (EEA) 1998, and related legislation.

Your role:
- Provide accurate, plain-language explanations of employee rights and employer obligations under South African labour law.
- Always cite the specific Act, section, or schedule when answering.
- Be concise but thorough. Use bullet points where helpful.
- If a question is ambiguous, ask a clarifying question.
- Always end with: "Note: This is general information, not legal advice. For specific disputes, contact the CCMA on 011 359 0300."

Key facts to always apply correctly:
- Annual leave: 21 consecutive days (15 working days for 5-day week) per leave cycle of 12 months.
- Sick leave: 30 days (5-day week) or 36 days (6-day week) over a 36-month cycle. First 6 months: 1 day per 26 days worked.
- Family responsibility leave: 3 days per year (5 days for domestic workers).
- Maternity leave: 4 consecutive months, unpaid (UIF claimable).
- Overtime: max 10 hours/week, paid at 1.5× (or 2× on Sundays/public holidays), or time off by agreement.
- Notice periods: 1 week (<6 months service), 2 weeks (6m–1yr), 4 weeks (>1yr).
- Minimum wage: R28.79/hour (2025). Domestic workers: R27.58/hour.
- Medical certificate: required if absent more than 2 consecutive days or more than 2 occasions in 8 weeks.

Do NOT provide advice on specific ongoing legal disputes or represent that any answer constitutes legal advice.`;

const WELCOME = {
  role: "assistant",
  content: "Hello! I'm your South African Labour Law assistant. Ask me about leave entitlements, working hours, overtime, or any other workplace rights.\n\n*Note: I provide general information based on the BCEA, not legal advice.*",
};

const QUICK_QUESTIONS = [
  "How much annual leave am I entitled to?",
  "What is family responsibility leave?",
  "When do I need a medical certificate?",
  "Can my employer refuse my leave?",
  "What happens to unused leave?",
  "How is overtime calculated?",
  "What are my rights during maternity leave?",
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center shrink-0 mt-0.5">
          <Scale className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-red-600 text-white rounded-br-sm"
            : "bg-zinc-800 text-zinc-200 rounded-bl-sm border border-zinc-700"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function LabourLawAssistant() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHR, setShowHR] = useState(false);
  const [hrPrefill, setHrPrefill] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: q }];
    setMessages(newMessages);
    setLoading(true);

    const history = newMessages
      .filter(m => m.role !== "system")
      .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\nConversation history:\n${history}\n\nAssistant:`,
    });

    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openHR = () => {
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    setHrPrefill(lastUser?.content || "");
    setShowHR(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-5 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
              <Scale className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">AI Labour Law Assistant</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Ask questions about your rights under South African labour law</p>
            </div>
          </div>
          <Button
            onClick={openHR}
            variant="outline"
            className="rounded-xl text-xs gap-1.5 border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 shrink-0"
          >
            <Phone className="w-3.5 h-3.5" /> Speak to HR
          </Button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}
          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                <Scale className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-bl-sm px-4 py-2.5">
                <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick question chips */}
      <div className="px-4 pb-2 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="px-3 py-1.5 rounded-full text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-700 transition-colors disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="px-4 py-4 bg-zinc-950 border-t border-zinc-800 shrink-0">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about leave, working hours, dismissal, overtime…"
            className="flex-1 h-10 text-sm border-zinc-700 rounded-xl bg-zinc-800 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-0"
            disabled={loading}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 w-10 p-0 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-4 pb-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-zinc-600 text-center leading-relaxed">
            This AI provides general information based on the Basic Conditions of Employment Act.
            For specific legal advice or disputes, contact the{" "}
            <span className="text-zinc-500 font-medium">CCMA (011 359 0300)</span> or{" "}
            <span className="text-zinc-500 font-medium">Department of Labour</span>.
          </p>
        </div>
      </div>

      <HRContactModal
        open={showHR}
        onClose={() => setShowHR(false)}
        prefillQuestion={hrPrefill}
      />
    </div>
  );
}
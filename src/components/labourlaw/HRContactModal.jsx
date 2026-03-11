import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const inputCls = "h-9 text-sm border-zinc-700 rounded-xl bg-zinc-800 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-0";
const textareaCls = "text-sm border-zinc-700 rounded-xl bg-zinc-800 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-0 resize-none";

export default function HRContactModal({ open, onClose, prefillQuestion }) {
  const [form, setForm] = useState({ name: "", email: "", question: prefillQuestion || "", urgent: false });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const setEv = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: form.email,
      subject: `HR Query${form.urgent ? " [URGENT]" : ""}: ${form.question.substring(0, 60)}`,
      body: `HR Query Submission\n\nName: ${form.name}\nEmail: ${form.email}\nUrgent: ${form.urgent ? "Yes" : "No"}\n\nQuestion:\n${form.question}\n\n---\nSubmitted via Employee Hub Labour Law Assistant`,
    });
    setSending(false);
    setSent(true);
  };

  const handleClose = () => {
    setForm({ name: "", email: "", question: prefillQuestion || "", urgent: false });
    setSent(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="max-w-md rounded-2xl p-6 bg-zinc-900 border border-zinc-700 text-white">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-base font-semibold text-white">Speak to HR</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            <p className="text-base font-semibold text-white">Question Submitted</p>
            <p className="text-sm text-zinc-400 text-center">HR has received your question and will respond to your email shortly.</p>
            <Button onClick={handleClose} className="mt-2 bg-red-600 hover:bg-red-700 text-white rounded-xl">Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">Your Name *</Label>
              <Input className={inputCls} value={form.name} onChange={setEv("name")} placeholder="Full name" required />
            </div>
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">Your Email *</Label>
              <Input className={inputCls} type="email" value={form.email} onChange={setEv("email")} placeholder="your@email.com" required />
            </div>
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">Your Question *</Label>
              <Textarea
                className={textareaCls}
                value={form.question}
                onChange={setEv("question")}
                placeholder="Describe your question or concern…"
                rows={4}
                required
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.urgent}
                onChange={e => setForm(f => ({ ...f, urgent: e.target.checked }))}
                className="accent-red-600 w-4 h-4"
              />
              <span className="text-sm text-zinc-400">Mark as urgent</span>
            </label>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1 rounded-xl border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700">
                Cancel
              </Button>
              <Button type="submit" disabled={sending} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl">
                {sending ? "Sending…" : "Submit to HR"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
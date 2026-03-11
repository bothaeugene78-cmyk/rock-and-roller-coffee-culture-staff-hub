import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";

const inputCls = "h-9 text-sm border-zinc-700 rounded-xl bg-zinc-900 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-0";
const LEAVE_TYPES = ["Annual", "Family Responsibility", "Sick", "Unpaid", "Maternity", "Parental"];

export default function LeaveApplicationModal({ open, onClose, employeeId, onSuccess }) {
  const [form, setForm] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    days_requested: "",
    reason: "",
    emergency_contact: "",
    handover_notes: "",
  });
  const [saving, setSaving] = useState(false);

  const setEv = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.LeaveRecord.create({
      ...form,
      days_requested: Number(form.days_requested),
      employee: employeeId,
      status: "Pending",
    });
    setSaving(false);
    onSuccess?.();
    onClose();
    setForm({ leave_type: "", start_date: "", end_date: "", days_requested: "", reason: "", emergency_contact: "", handover_notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-zinc-900 border border-zinc-700 text-white">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-base font-semibold text-white">Apply for Leave</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">Leave Type *</Label>
            <Select value={form.leave_type} onValueChange={set("leave_type")} required>
              <SelectTrigger className={inputCls}><SelectValue placeholder="Select type…" /></SelectTrigger>
              <SelectContent>{LEAVE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">Start Date *</Label>
              <Input className={inputCls} type="date" value={form.start_date} onChange={setEv("start_date")} required />
            </div>
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">End Date *</Label>
              <Input className={inputCls} type="date" value={form.end_date} onChange={setEv("end_date")} required />
            </div>
          </div>
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">Working Days Requested *</Label>
            <Input className={inputCls} type="number" min={0.5} step={0.5} value={form.days_requested} onChange={setEv("days_requested")} placeholder="e.g. 3" required />
          </div>
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">Reason *</Label>
            <Textarea
              value={form.reason}
              onChange={setEv("reason")}
              placeholder="Brief reason for leave…"
              rows={3}
              className="text-sm border-zinc-700 rounded-xl bg-zinc-900 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-0 resize-none"
              required
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">Emergency Contact During Leave</Label>
            <Input className={inputCls} value={form.emergency_contact} onChange={setEv("emergency_contact")} placeholder="Name & phone number" />
          </div>
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">Handover Notes</Label>
            <Textarea
              value={form.handover_notes}
              onChange={setEv("handover_notes")}
              placeholder="Who covers your responsibilities?"
              rows={2}
              className="text-sm border-zinc-700 rounded-xl bg-zinc-900 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-0 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl">
              {saving ? "Submitting…" : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
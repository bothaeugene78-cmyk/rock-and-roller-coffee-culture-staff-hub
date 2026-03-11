import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Info, CheckCircle2, Upload, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format, addYears, isWeekend, eachDayOfInterval, addMonths, isBefore } from "date-fns";

const inputCls = "h-9 text-sm border-zinc-700 rounded-xl bg-zinc-800 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-0";
const textareaCls = "text-sm border-zinc-700 rounded-xl bg-zinc-800 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-0 resize-none";

const LEAVE_TYPES = [
  { value: "Annual", label: "Annual Leave" },
  { value: "Family Responsibility", label: "Family Responsibility Leave" },
  { value: "Sick", label: "Sick Leave" },
  { value: "Unpaid", label: "Unpaid Leave" },
];

function countWorkingDays(start, end) {
  if (!start || !end || end < start) return 0;
  const days = eachDayOfInterval({ start, end });
  return days.filter(d => !isWeekend(d)).length;
}

function InfoBox({ color, icon: Icon, children }) {
  const styles = {
    blue: "bg-blue-950/50 border-blue-700/50 text-blue-300",
    amber: "bg-amber-950/50 border-amber-700/50 text-amber-300",
    red: "bg-red-950/50 border-red-700/50 text-red-300",
    green: "bg-emerald-950/50 border-emerald-700/50 text-emerald-300",
  };
  return (
    <div className={`flex items-start gap-2.5 border rounded-xl px-3 py-2.5 text-xs ${styles[color]}`}>
      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export default function LeaveApplicationModal({ open, onClose, employeeId, balance, onSuccess, managerEmail, employeeName }) {
  const today = format(new Date(), "yyyy-MM-dd");
  const maxDate = format(addYears(new Date(), 1), "yyyy-MM-dd");

  const [form, setForm] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    days_requested: "",
    reason: "",
    emergency_contact: "",
    handover_notes: "",
  });
  const [docFile, setDocFile] = useState(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docUrl, setDocUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [blockError, setBlockError] = useState("");

  // Auto-calculate working days when dates change
  useEffect(() => {
    if (form.start_date && form.end_date && form.end_date >= form.start_date) {
      const days = countWorkingDays(new Date(form.start_date), new Date(form.end_date));
      setForm(f => ({ ...f, days_requested: days }));
    }
  }, [form.start_date, form.end_date]);

  // Clear block error when relevant fields change
  useEffect(() => {
    setBlockError("");
  }, [form.leave_type, form.days_requested]);

  const setEv = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const days = Number(form.days_requested) || 0;

  // Conditional display flags
  const showFamilyInfo = form.leave_type === "Family Responsibility";
  const showSickInfo = form.leave_type === "Sick";
  const showDocUpload = form.leave_type === "Sick" && days > 2;
  const showHandover = form.leave_type === "Annual" && days >= 5;
  const docRequired = showDocUpload;

  // Balance checks
  const getBalanceWarning = () => {
    if (!balance) return null;
    if (form.leave_type === "Annual" && days > 0 && balance.annual_leave_balance !== undefined && days > balance.annual_leave_balance) {
      return { type: "block", msg: `Insufficient annual leave balance. You have ${balance.annual_leave_balance} day(s) available, but requested ${days}.` };
    }
    if (form.leave_type === "Family Responsibility" && days > 0 && balance.family_responsibility_balance !== undefined && days > balance.family_responsibility_balance) {
      return { type: "block", msg: `Insufficient family responsibility leave. You have ${balance.family_responsibility_balance} day(s) remaining this year.` };
    }
    if (form.leave_type === "Sick" && days > 0 && balance.sick_leave_balance !== undefined && days > balance.sick_leave_balance) {
      return { type: "block", msg: `Insufficient sick leave balance. You have ${balance.sick_leave_balance} day(s) remaining in your cycle.` };
    }
    return null;
  };

  // Forfeit warning: cycle end + 6 months approaching
  const getForfeitWarning = () => {
    if (form.leave_type !== "Annual" || !balance?.sick_leave_cycle_start) return null;
    const cycleEnd = addMonths(new Date(balance.sick_leave_cycle_start), 36);
    const forfeitDeadline = addMonths(cycleEnd, 6);
    const threeMonthsFromNow = addMonths(new Date(), 3);
    if (isBefore(forfeitDeadline, threeMonthsFromNow)) {
      return `Your annual leave cycle ends ${format(cycleEnd, "d MMM yyyy")}. Unused leave may be forfeited after ${format(forfeitDeadline, "d MMM yyyy")}.`;
    }
    return null;
  };

  const balanceWarning = getBalanceWarning();
  const forfeitWarning = getForfeitWarning();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFile(file);
    setDocUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setDocUrl(file_url);
    setDocUploading(false);
  };

  const handleClose = () => {
    setForm({ leave_type: "", start_date: "", end_date: "", days_requested: "", reason: "", emergency_contact: "", handover_notes: "" });
    setDocFile(null);
    setDocUrl("");
    setBlockError("");
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (balanceWarning?.type === "block") {
      setBlockError(balanceWarning.msg);
      return;
    }

    if (docRequired && !docUrl) {
      setBlockError("A medical certificate is required for sick leave over 2 days. Please upload the document.");
      return;
    }

    setSaving(true);
    await base44.entities.LeaveRecord.create({
      employee: employeeId,
      leave_type: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      days_requested: days,
      reason: form.reason,
      emergency_contact: form.emergency_contact,
      handover_notes: form.handover_notes,
      medical_certificate: form.leave_type === "Sick" ? docUrl : undefined,
      proof_document: form.leave_type === "Family Responsibility" ? docUrl : undefined,
      status: "Pending",
    });

    // Notify manager via email
    if (managerEmail) {
      await base44.integrations.Core.SendEmail({
        to: managerEmail,
        subject: `Leave Application: ${form.leave_type} Leave — ${employeeName}`,
        body: `A new leave application has been submitted and is pending your approval.\n\nEmployee: ${employeeName}\nLeave Type: ${form.leave_type}\nStart Date: ${form.start_date}\nEnd Date: ${form.end_date}\nDays Requested: ${days}\nReason: ${form.reason}\n\nPlease log in to the Employee Hub to review and action this request.`,
      });
    }

    setSaving(false);
    setSuccess(true);
    onSuccess?.();
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl p-6 bg-zinc-900 border border-zinc-700 text-white">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-base font-semibold text-white">Apply for Leave</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            <p className="text-base font-semibold text-white">Application Submitted</p>
            <p className="text-sm text-zinc-400 text-center">Your leave application has been submitted and is pending approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Leave Type */}
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">Leave Type *</Label>
              <Select value={form.leave_type} onValueChange={set("leave_type")} required>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select leave type…" /></SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {showFamilyInfo && (
              <InfoBox color="blue" icon={Info}>
                <strong>3 days per year.</strong> Cannot be carried over. Valid for: child birth or illness, spouse/partner birth, death of immediate family member.
              </InfoBox>
            )}

            {showSickInfo && (
              <InfoBox color="amber" icon={Info}>
                <strong>Medical certificate required</strong> if you are absent for more than 2 consecutive days.
              </InfoBox>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Start Date *</Label>
                <Input
                  className={inputCls}
                  type="date"
                  value={form.start_date}
                  min={today}
                  max={maxDate}
                  onChange={setEv("start_date")}
                  required
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">End Date *</Label>
                <Input
                  className={inputCls}
                  type="date"
                  value={form.end_date}
                  min={form.start_date || today}
                  max={maxDate}
                  onChange={setEv("end_date")}
                  required
                />
              </div>
            </div>

            {/* Days Requested */}
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">
                Working Days Requested *
                <span className="text-zinc-600 ml-1">(weekends excluded, editable for half days)</span>
              </Label>
              <Input
                className={inputCls}
                type="number"
                min={0.5}
                step={0.5}
                value={form.days_requested}
                onChange={setEv("days_requested")}
                placeholder="Auto-calculated from dates"
                required
              />
            </div>

            {/* Balance / forfeit warnings */}
            {balanceWarning && (
              <InfoBox color="red" icon={AlertTriangle}>{balanceWarning.msg}</InfoBox>
            )}
            {forfeitWarning && (
              <InfoBox color="amber" icon={AlertTriangle}>{forfeitWarning}</InfoBox>
            )}

            {/* Reason */}
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">Reason *</Label>
              <Textarea
                value={form.reason}
                onChange={setEv("reason")}
                placeholder="Provide detailed reason for leave request"
                rows={3}
                className={textareaCls}
                required
              />
            </div>

            {/* Document upload (conditional) */}
            {showDocUpload && (
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">
                  Medical Certificate {docRequired && <span className="text-red-400">*</span>}
                </Label>
                <div className="border border-zinc-700 rounded-xl bg-zinc-800 p-3">
                  {docFile ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {docFile.name} {docUploading ? "(uploading…)" : "(uploaded)"}
                      </span>
                      <button type="button" onClick={() => { setDocFile(null); setDocUrl(""); }} className="text-zinc-500 hover:text-zinc-300">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-300">
                      <Upload className="w-4 h-4" />
                      <span>Upload medical certificate (PDF, JPG, PNG)</span>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
                <p className="text-xs text-zinc-600 mt-1">Medical certificate required for sick leave over 2 days.</p>
              </div>
            )}

            {/* Emergency Contact */}
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">Emergency Contact During Leave</Label>
              <Input className={inputCls} value={form.emergency_contact} onChange={setEv("emergency_contact")} placeholder="Contact number while on leave" />
            </div>

            {/* Handover Notes (conditional) */}
            {showHandover && (
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Handover Notes</Label>
                <Textarea
                  value={form.handover_notes}
                  onChange={setEv("handover_notes")}
                  placeholder="Detail work handover arrangements"
                  rows={3}
                  className={textareaCls}
                />
              </div>
            )}

            {/* Block error */}
            {blockError && (
              <InfoBox color="red" icon={AlertTriangle}>{blockError}</InfoBox>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1 rounded-xl border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || docUploading || balanceWarning?.type === "block"}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-50"
              >
                {saving ? "Submitting…" : "Submit Application"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, Landmark, FileText, Heart, ShieldCheck, X, Save } from "lucide-react";

const Section = ({ icon: Icon, title, children }) => (
  <Card className="border-0 shadow-sm">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-400" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </CardContent>
  </Card>
);

const Field = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-slate-500">
      {label} {required && <span className="text-rose-400">*</span>}
    </Label>
    {children}
  </div>
);

export default function EmployeeForm({ employee, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    id_number: "",
    residential_address: "",
    contact_number: "",
    start_date: "",
    leave_days_due: 15,
    bank_name: "",
    branch_code: "",
    account_number: "",
    it_number: "",
    next_of_kin_name: "",
    next_of_kin_relationship: "",
    next_of_kin_contact: "",
    employment_status: "Active",
    termination_date: "",
    termination_reason: "",
    ...employee,
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (data.leave_days_due === "" || data.leave_days_due === undefined) data.leave_days_due = 15;
    else data.leave_days_due = Number(data.leave_days_due);
    // Clean up empty optional fields
    if (!data.termination_date) delete data.termination_date;
    if (!data.termination_reason) delete data.termination_reason;
    if (!data.it_number) delete data.it_number;
    onSave(data);
  };

  const inputClass = "h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Section icon={User} title="Personal Information">
        <Field label="Name" required>
          <Input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} required />
        </Field>
        <Field label="Surname" required>
          <Input className={inputClass} value={form.surname} onChange={(e) => update("surname", e.target.value)} required />
        </Field>
        <Field label="ID Number (13 digits)" required>
          <Input className={inputClass} value={form.id_number} onChange={(e) => update("id_number", e.target.value)} maxLength={13} required />
        </Field>
        <Field label="Contact Number" required>
          <Input className={inputClass} value={form.contact_number} onChange={(e) => update("contact_number", e.target.value)} required />
        </Field>
        <div className="md:col-span-2">
          <Field label="Residential Address">
            <Textarea className="bg-slate-50/50 border-slate-200 focus:bg-white transition-colors min-h-[60px]" value={form.residential_address} onChange={(e) => update("residential_address", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section icon={Briefcase} title="Employment Details">
        <Field label="Start Date" required>
          <Input type="date" className={inputClass} value={form.start_date} onChange={(e) => update("start_date", e.target.value)} required />
        </Field>
        <Field label="Leave Days Due">
          <Input type="number" className={inputClass} value={form.leave_days_due} onChange={(e) => update("leave_days_due", e.target.value)} min={0} />
        </Field>
      </Section>

      <Section icon={Landmark} title="Banking Details">
        <Field label="Bank Name">
          <Input className={inputClass} value={form.bank_name} onChange={(e) => update("bank_name", e.target.value)} />
        </Field>
        <Field label="Branch Code">
          <Input className={inputClass} value={form.branch_code} onChange={(e) => update("branch_code", e.target.value)} />
        </Field>
        <Field label="Account Number">
          <Input className={inputClass} value={form.account_number} onChange={(e) => update("account_number", e.target.value)} />
        </Field>
      </Section>

      <Section icon={FileText} title="Tax Information">
        <Field label="IT Number (SARS) — Optional">
          <Input className={inputClass} value={form.it_number} onChange={(e) => update("it_number", e.target.value)} placeholder="Optional" />
        </Field>
      </Section>

      <Section icon={Heart} title="Next of Kin">
        <Field label="Full Name">
          <Input className={inputClass} value={form.next_of_kin_name} onChange={(e) => update("next_of_kin_name", e.target.value)} />
        </Field>
        <Field label="Relationship">
          <Input className={inputClass} value={form.next_of_kin_relationship} onChange={(e) => update("next_of_kin_relationship", e.target.value)} />
        </Field>
        <Field label="Contact Number">
          <Input className={inputClass} value={form.next_of_kin_contact} onChange={(e) => update("next_of_kin_contact", e.target.value)} />
        </Field>
      </Section>

      <Section icon={ShieldCheck} title="Status Control">
        <Field label="Employment Status">
          <Select value={form.employment_status} onValueChange={(v) => update("employment_status", v)}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {form.employment_status === "Terminated" && (
          <>
            <Field label="Termination Date">
              <Input type="date" className={inputClass} value={form.termination_date} onChange={(e) => update("termination_date", e.target.value)} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Termination Reason">
                <Textarea className="bg-slate-50/50 border-slate-200 focus:bg-white transition-colors min-h-[60px]" value={form.termination_reason} onChange={(e) => update("termination_reason", e.target.value)} />
              </Field>
            </div>
          </>
        )}
      </Section>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="px-5">
          <X className="w-4 h-4 mr-1.5" /> Cancel
        </Button>
        <Button type="submit" disabled={isSaving} className="px-5 bg-slate-800 hover:bg-slate-900">
          <Save className="w-4 h-4 mr-1.5" /> {employee ? "Update Employee" : "Add Employee"}
        </Button>
      </div>
    </form>
  );
}
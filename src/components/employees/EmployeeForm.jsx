import { useState } from "react";
import { User, Briefcase, Building2, Receipt, Heart, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SectionCard from "./SectionCard";
import FieldRow from "./FieldRow";

const BANKS = [
  "ABSA", "Capitec", "FNB", "Nedbank", "Standard Bank",
  "African Bank", "Investec", "TymeBank", "Discovery Bank", "Other"
];

const RELATIONSHIPS = ["Spouse", "Parent", "Child", "Sibling", "Friend", "Other"];

const TERMINATION_REASONS = [
  "Resignation", "Retrenchment", "Dismissal", "Contract End",
  "Retirement", "Death", "Other"
];

function TextInput({ value, onChange, placeholder, type = "text", required }) {
  return (
    <Input
      type={type}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="h-9 text-sm border-gray-200 focus:border-gray-400 focus:ring-0 rounded-lg"
    />
  );
}

export default function EmployeeForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: "", surname: "", id_number: "", residential_address: "",
    contact_number: "", start_date: "", leave_days_due: 15,
    bank_name: "", branch_code: "", account_number: "", it_number: "",
    next_of_kin_name: "", next_of_kin_relationship: "", next_of_kin_contact: "",
    employment_status: "Active", termination_date: "", termination_reason: "",
    ...initial
  });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));
  const setInput = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Personal Info */}
      <SectionCard title="Personal Information" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="First Name" required>
            <TextInput value={form.name} onChange={set("name")} placeholder="John" required />
          </FieldRow>
          <FieldRow label="Surname" required>
            <TextInput value={form.surname} onChange={set("surname")} placeholder="Doe" required />
          </FieldRow>
          <FieldRow label="ID Number (13 digits)" required>
            <TextInput value={form.id_number} onChange={set("id_number")} placeholder="0000000000000" required />
          </FieldRow>
          <FieldRow label="Contact Number" required>
            <TextInput value={form.contact_number} onChange={set("contact_number")} placeholder="0821234567" required />
          </FieldRow>
          <div className="sm:col-span-2">
            <FieldRow label="Residential Address">
              <Textarea
                value={form.residential_address || ""}
                onChange={e => set("residential_address")(e.target.value)}
                placeholder="123 Main Street, Suburb, City, 0000"
                rows={2}
                className="text-sm border-gray-200 focus:border-gray-400 focus:ring-0 rounded-lg resize-none"
              />
            </FieldRow>
          </div>
        </div>
      </SectionCard>

      {/* Employment */}
      <SectionCard title="Employment" icon={Briefcase}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Start Date" required>
            <TextInput type="date" value={form.start_date} onChange={set("start_date")} required />
          </FieldRow>
          <FieldRow label="Leave Days Due">
            <TextInput type="number" value={form.leave_days_due} onChange={val => setForm(f => ({ ...f, leave_days_due: Number(val) }))} placeholder="15" />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Banking */}
      <SectionCard title="Banking Details" icon={Building2}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FieldRow label="Bank Name">
            <Select value={form.bank_name || ""} onValueChange={set("bank_name")}>
              <SelectTrigger className="h-9 text-sm border-gray-200 rounded-lg">
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {BANKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Branch Code">
            <TextInput value={form.branch_code} onChange={set("branch_code")} placeholder="051001" />
          </FieldRow>
          <FieldRow label="Account Number">
            <TextInput value={form.account_number} onChange={set("account_number")} placeholder="000000000" />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Tax */}
      <SectionCard title="Tax" icon={Receipt}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm">
          <FieldRow label="SARS IT Number (optional)">
            <TextInput value={form.it_number} onChange={set("it_number")} placeholder="IT000000000" />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Next of Kin */}
      <SectionCard title="Next of Kin" icon={Heart}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FieldRow label="Full Name">
            <TextInput value={form.next_of_kin_name} onChange={set("next_of_kin_name")} placeholder="Jane Doe" />
          </FieldRow>
          <FieldRow label="Relationship">
            <Select value={form.next_of_kin_relationship || ""} onValueChange={set("next_of_kin_relationship")}>
              <SelectTrigger className="h-9 text-sm border-gray-200 rounded-lg">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Contact Number">
            <TextInput value={form.next_of_kin_contact} onChange={set("next_of_kin_contact")} placeholder="0821234567" />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Status */}
      <SectionCard title="Employment Status" icon={ShieldAlert}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FieldRow label="Status">
            <Select value={form.employment_status} onValueChange={set("employment_status")}>
              <SelectTrigger className="h-9 text-sm border-gray-200 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          {form.employment_status === "Terminated" && (
            <>
              <FieldRow label="Termination Date">
                <TextInput type="date" value={form.termination_date} onChange={set("termination_date")} />
              </FieldRow>
              <FieldRow label="Termination Reason">
                <Select value={form.termination_reason || ""} onValueChange={set("termination_reason")}>
                  <SelectTrigger className="h-9 text-sm border-gray-200 rounded-lg">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {TERMINATION_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldRow>
            </>
          )}
        </div>
      </SectionCard>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl text-sm">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading} className="rounded-xl text-sm bg-gray-900 hover:bg-gray-700 text-white px-6">
          {loading ? "Saving…" : "Save Employee"}
        </Button>
      </div>
    </form>
  );
}
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const BANKS = ["FNB", "ABSA", "Standard Bank", "Nedbank", "Capitec", "Other"];
const RELATIONSHIPS = ["Spouse", "Parent", "Sibling", "Partner", "Other"];
const TERMINATION_REASONS = ["Resigned", "Retrenched", "Dismissed", "Contract Ended"];

function Section({ number, title, children }) {
  return (
    <div className="bg-zinc-800/50 rounded-2xl border border-zinc-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-700 bg-zinc-800 flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {number}
        </span>
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, full, children }) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label className="text-xs font-medium text-zinc-400">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

const inputCls = "h-10 text-sm border-zinc-700 rounded-xl focus:border-red-600 focus:ring-0 bg-zinc-900 text-white placeholder:text-zinc-600 transition-colors";
const selectTriggerCls = "h-10 text-sm border-zinc-700 rounded-xl bg-zinc-900 text-white";

export default function EmployeeForm({ initial = {}, onSubmit, onCancel, loading }) {
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
    ...initial,
  });

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const setEv = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const isTerminated = form.employment_status === "Terminated";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Section 1: Personal Details */}
      <Section number="1" title="Personal Details">
        <Field label="Full Name" required>
          <Input className={inputCls} value={form.name} onChange={setEv("name")} placeholder="John" required />
        </Field>
        <Field label="Surname" required>
          <Input className={inputCls} value={form.surname} onChange={setEv("surname")} placeholder="Doe" required />
        </Field>
        <Field label="SA ID Number (13 digits)" required>
          <Input
            className={inputCls}
            value={form.id_number}
            onChange={setEv("id_number")}
            placeholder="0000000000000"
            maxLength={13}
            pattern="\d{13}"
            title="Must be exactly 13 digits"
            required
          />
        </Field>
        <Field label="Contact Number" required>
          <Input className={inputCls} type="tel" value={form.contact_number} onChange={setEv("contact_number")} placeholder="082 123 4567" required />
        </Field>
        <Field label="Residential Address" full>
          <Textarea
            value={form.residential_address}
            onChange={setEv("residential_address")}
            placeholder="123 Main Street, Suburb, City, 0000"
            rows={2}
            className="text-sm border-gray-200 rounded-xl bg-gray-50/40 focus:bg-white focus:border-gray-400 focus:ring-0 transition-colors resize-none"
          />
        </Field>
      </Section>

      {/* Section 2: Employment */}
      <Section number="2" title="Employment">
        <Field label="Start Date" required>
          <Input className={inputCls} type="date" value={form.start_date} onChange={setEv("start_date")} required />
        </Field>
        <Field label="Leave Days Due">
          <Input
            className={inputCls}
            type="number"
            min={0}
            value={form.leave_days_due}
            onChange={(e) => setForm((f) => ({ ...f, leave_days_due: Number(e.target.value) }))}
            placeholder="15"
          />
        </Field>
      </Section>

      {/* Section 3: Banking Details */}
      <Section number="3" title="Banking Details">
        <Field label="Bank Name">
          <Select value={form.bank_name} onValueChange={set("bank_name")}>
            <SelectTrigger className={selectTriggerCls}>
              <SelectValue placeholder="Select bank…" />
            </SelectTrigger>
            <SelectContent>
              {BANKS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Branch Code">
          <Input className={inputCls} type="number" value={form.branch_code} onChange={setEv("branch_code")} placeholder="250655" />
        </Field>
        <Field label="Account Number">
          <Input className={inputCls} type="number" value={form.account_number} onChange={setEv("account_number")} placeholder="00000000000" />
        </Field>
      </Section>

      {/* Section 4: Tax */}
      <Section number="4" title="Tax (Optional)">
        <Field label="SARS IT Number">
          <Input className={inputCls} type="number" value={form.it_number} onChange={setEv("it_number")} placeholder="IT000000000" />
        </Field>
      </Section>

      {/* Section 5: Emergency Contact */}
      <Section number="5" title="Emergency Contact">
        <Field label="Next of Kin Name">
          <Input className={inputCls} value={form.next_of_kin_name} onChange={setEv("next_of_kin_name")} placeholder="Jane Doe" />
        </Field>
        <Field label="Relationship">
          <Select value={form.next_of_kin_relationship} onValueChange={set("next_of_kin_relationship")}>
            <SelectTrigger className={selectTriggerCls}>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {RELATIONSHIPS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Contact Number">
          <Input className={inputCls} type="tel" value={form.next_of_kin_contact} onChange={setEv("next_of_kin_contact")} placeholder="082 987 6543" />
        </Field>
      </Section>

      {/* Section 6: Status Management */}
      <Section number="6" title="Status Management">
        <Field label="Employment Status" full>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            {["Active", "Terminated"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => set("employment_status")(status)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  form.employment_status === status
                    ? status === "Active"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-rose-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </Field>

        {isTerminated && (
          <>
            <Field label="Termination Date">
              <Input className={inputCls} type="date" value={form.termination_date} onChange={setEv("termination_date")} />
            </Field>
            <Field label="Termination Reason">
              <Select value={form.termination_reason} onValueChange={set("termination_reason")}>
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue placeholder="Select reason…" />
                </SelectTrigger>
                <SelectContent>
                  {TERMINATION_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </>
        )}
      </Section>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl text-sm px-5">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="rounded-xl text-sm px-6 bg-gray-900 hover:bg-gray-700 text-white"
        >
          {loading ? "Saving…" : initial?.id ? "Update Employee" : "Register Employee"}
        </Button>
      </div>
    </form>
  );
}
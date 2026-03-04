import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, User, Briefcase, Building2, Receipt, HeartHandshake, ShieldCheck, ChevronRight } from "lucide-react";

const SECTION_ICONS = [User, Briefcase, Building2, Receipt, HeartHandshake, ShieldCheck];

const SECTIONS = [
  "Personal Details",
  "Employment",
  "Banking Details",
  "Tax (Optional)",
  "Emergency Contact",
  "Status Management",
];

function SectionHeader({ number, title, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Section {number}</p>
        <h2 className="text-sm font-semibold text-gray-800 leading-tight">{title}</h2>
      </div>
    </div>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-gray-500">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
        {hint && <span className="text-gray-400 font-normal ml-1">({hint})</span>}
      </Label>
      {children}
    </div>
  );
}

const inputCls = "h-10 text-sm border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-400 focus:ring-0 transition-colors";
const selectCls = "h-10 text-sm border-gray-200 rounded-xl bg-gray-50/50";

export default function EmployeeRegistration() {
  const [form, setForm] = useState({
    name: "", surname: "", id_number: "", residential_address: "", contact_number: "",
    start_date: "", leave_days_due: 15,
    bank_name: "", branch_code: "", account_number: "",
    it_number: "",
    next_of_kin_name: "", next_of_kin_relationship: "", next_of_kin_contact: "",
    employment_status: "Active", termination_date: "", termination_reason: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target ? e.target.value : e }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.id_number.replace(/\D/g, "").length !== 13) {
      setError("SA ID Number must be exactly 13 digits.");
      return;
    }
    setSaving(true);
    const payload = { ...form, leave_days_due: Number(form.leave_days_due) || 15 };
    if (!payload.it_number) delete payload.it_number;
    if (payload.employment_status !== "Terminated") {
      delete payload.termination_date;
      delete payload.termination_reason;
    }
    await base44.entities.Employee.create(payload);
    setSaving(false);
    setSaved(true);
  };

  const handleReset = () => {
    setForm({
      name: "", surname: "", id_number: "", residential_address: "", contact_number: "",
      start_date: "", leave_days_due: 15, bank_name: "", branch_code: "", account_number: "",
      it_number: "", next_of_kin_name: "", next_of_kin_relationship: "", next_of_kin_contact: "",
      employment_status: "Active", termination_date: "", termination_reason: "",
    });
    setSaved(false);
    setError("");
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Employee Registered</h2>
          <p className="text-sm text-gray-500 mb-8">
            <strong>{form.name} {form.surname}</strong> has been successfully added to the system.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleReset} className="rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-sm px-6">
              Register Another
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/"} className="rounded-xl text-sm px-6">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Registration</h1>
          <p className="text-sm text-gray-400 mt-1">Complete all required sections to register a new employee.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Section 1: Personal Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader number={1} title="Personal Details" icon={SECTION_ICONS[0]} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <Input className={inputCls} value={form.name} onChange={set("name")} placeholder="John" required />
              </Field>
              <Field label="Surname" required>
                <Input className={inputCls} value={form.surname} onChange={set("surname")} placeholder="Doe" required />
              </Field>
              <Field label="SA ID Number" required hint="13 digits">
                <Input
                  className={inputCls}
                  value={form.id_number}
                  onChange={e => setForm(f => ({ ...f, id_number: e.target.value.replace(/\D/g, "").slice(0, 13) }))}
                  placeholder="0000000000000"
                  inputMode="numeric"
                  required
                />
              </Field>
              <Field label="Contact Number" required>
                <Input className={inputCls} value={form.contact_number} onChange={set("contact_number")} placeholder="082 123 4567" type="tel" required />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Residential Address">
                  <Textarea
                    className="text-sm border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-400 focus:ring-0 transition-colors resize-none"
                    rows={2}
                    value={form.residential_address}
                    onChange={set("residential_address")}
                    placeholder="123 Main Street, Suburb, City, 0000"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Section 2: Employment */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader number={2} title="Employment" icon={SECTION_ICONS[1]} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Start Date" required>
                <Input className={inputCls} type="date" value={form.start_date} onChange={set("start_date")} required />
              </Field>
              <Field label="Leave Days Due" hint="default: 15">
                <Input
                  className={inputCls}
                  type="number"
                  min={0}
                  value={form.leave_days_due}
                  onChange={e => setForm(f => ({ ...f, leave_days_due: e.target.value }))}
                  placeholder="15"
                />
              </Field>
            </div>
          </div>

          {/* Section 3: Banking */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader number={3} title="Banking Details" icon={SECTION_ICONS[2]} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Bank Name">
                <Select value={form.bank_name} onValueChange={set("bank_name")}>
                  <SelectTrigger className={selectCls}><SelectValue placeholder="Select bank" /></SelectTrigger>
                  <SelectContent>
                    {["FNB", "ABSA", "Standard Bank", "Nedbank", "Capitec", "Other"].map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Branch Code">
                <Input className={inputCls} value={form.branch_code} onChange={e => setForm(f => ({ ...f, branch_code: e.target.value.replace(/\D/g, "") }))} placeholder="051001" inputMode="numeric" />
              </Field>
              <Field label="Account Number">
                <Input className={inputCls} value={form.account_number} onChange={e => setForm(f => ({ ...f, account_number: e.target.value.replace(/\D/g, "") }))} placeholder="0000000000" inputMode="numeric" />
              </Field>
            </div>
          </div>

          {/* Section 4: Tax */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader number={4} title="Tax (Optional)" icon={SECTION_ICONS[3]} />
            <div className="max-w-xs">
              <Field label="SARS IT Number" hint="optional">
                <Input className={inputCls} value={form.it_number} onChange={e => setForm(f => ({ ...f, it_number: e.target.value.replace(/\D/g, "") }))} placeholder="0000000000" inputMode="numeric" />
              </Field>
            </div>
          </div>

          {/* Section 5: Emergency Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader number={5} title="Emergency Contact" icon={SECTION_ICONS[4]} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Next of Kin Name">
                <Input className={inputCls} value={form.next_of_kin_name} onChange={set("next_of_kin_name")} placeholder="Jane Doe" />
              </Field>
              <Field label="Relationship">
                <Select value={form.next_of_kin_relationship} onValueChange={set("next_of_kin_relationship")}>
                  <SelectTrigger className={selectCls}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["Spouse", "Parent", "Sibling", "Partner", "Other"].map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Contact Number">
                <Input className={inputCls} value={form.next_of_kin_contact} onChange={set("next_of_kin_contact")} placeholder="082 987 6543" type="tel" />
              </Field>
            </div>
          </div>

          {/* Section 6: Status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader number={6} title="Status Management" icon={SECTION_ICONS[5]} />
            <div className="space-y-4">
              {/* Toggle */}
              <Field label="Employment Status">
                <div className="flex items-center gap-0 rounded-xl border border-gray-200 bg-gray-50/50 p-1 w-fit">
                  {["Active", "Terminated"].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, employment_status: status }))}
                      className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                        form.employment_status === status
                          ? status === "Active"
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "bg-rose-500 text-white shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </Field>

              {form.employment_status === "Terminated" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-50 mt-4">
                  <Field label="Termination Date">
                    <Input className={inputCls} type="date" value={form.termination_date} onChange={set("termination_date")} />
                  </Field>
                  <Field label="Termination Reason">
                    <Select value={form.termination_reason} onValueChange={set("termination_reason")}>
                      <SelectTrigger className={selectCls}><SelectValue placeholder="Select reason" /></SelectTrigger>
                      <SelectContent>
                        {["Resigned", "Retrenched", "Dismissed", "Contract Ended"].map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end pb-8">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gray-900 hover:bg-gray-700 text-white rounded-xl text-sm px-8 h-11 gap-2 shadow-sm"
            >
              {saving ? "Registering…" : "Register Employee"}
              {!saving && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
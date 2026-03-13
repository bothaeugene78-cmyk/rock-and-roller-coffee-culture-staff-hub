import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload, CheckCircle2, AlertTriangle, XCircle, Loader2, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { base44 } from "@/api/base44Client";

const SYSTEM_FIELDS = [
  { key: "employee_number", label: "Employee Number" },
  { key: "name", label: "First Name", required: true },
  { key: "surname", label: "Last Name", required: true },
  { key: "email", label: "Email" },
  { key: "contact_number", label: "Phone", required: true },
  { key: "id_number", label: "ID Number", required: true },
  { key: "department", label: "Department" },
  { key: "job_title", label: "Job Title" },
  { key: "start_date", label: "Employment Start Date", required: true },
  { key: "work_week_type", label: "Work Week Type (5-day/6-day)", required: true },
  { key: "annual_leave_cycle_start", label: "Annual Leave Cycle Start", required: true },
  { key: "sick_leave_cycle_start", label: "Sick Leave Cycle Start", required: true },
  { key: "custom_annual_leave_days", label: "Custom Annual Leave Days" },
  { key: "residential_address", label: "Residential Address" },
];

const TEMPLATE_HEADERS = [
  "Employee_Number", "First_Name", "Last_Name", "Email", "Phone", "ID_Number",
  "Department", "Job_Title", "Employment_Start_Date", "Work_Week_Type",
  "Annual_Leave_Cycle_Start", "Sick_Leave_Cycle_Start", "Custom_Annual_Leave_Days", "Residential_Address",
  "Bank_Name", "Branch_Code", "Account_Number", "Next_Of_Kin_Name", "Next_Of_Kin_Relationship", "Next_Of_Kin_Contact",
];

const TEMPLATE_SAMPLE = [
  ["EMP001", "Jane", "Doe", "jane@company.com", "0821234567", "9001015009087",
   "Operations", "Manager", "2023-01-01", "5-day", "2023-01-01", "2023-01-01", "", "123 Main St",
   "FNB", "250655", "62012345678", "John Doe", "Spouse", "0831234567"],
];

const AUTO_MATCH = {
  employee_number: ["employee_number", "emp_number", "empno", "employee number", "id"],
  name: ["first_name", "firstname", "name", "given name"],
  surname: ["last_name", "lastname", "surname", "family name"],
  email: ["email", "email address", "e-mail"],
  contact_number: ["phone", "contact", "mobile", "cell", "contact_number", "telephone"],
  id_number: ["id_number", "id number", "id", "sa id", "passport"],
  department: ["department", "dept"],
  job_title: ["job_title", "title", "position", "role", "designation"],
  start_date: ["start_date", "employment_start_date", "start date", "commencement"],
  work_week_type: ["work_week_type", "work week", "week type", "schedule"],
  annual_leave_cycle_start: ["annual_leave_cycle_start", "leave cycle", "annual leave start"],
  sick_leave_cycle_start: ["sick_leave_cycle_start", "sick leave cycle"],
  custom_annual_leave_days: ["custom_annual_leave_days", "custom leave", "leave days"],
  residential_address: ["address", "residential_address", "home address"],
};

function autoMap(excelCols) {
  const mapping = {};
  excelCols.forEach(col => {
    const normalized = col.toLowerCase().replace(/[\s_-]/g, "_");
    for (const [field, aliases] of Object.entries(AUTO_MATCH)) {
      if (aliases.some(a => normalized.includes(a.replace(/[\s_-]/g, "_")))) {
        mapping[col] = field;
        break;
      }
    }
    if (!mapping[col]) mapping[col] = "__skip__";
  });
  return mapping;
}

function validateRows(rows, mapping) {
  const errors = [];
  const warnings = [];
  const seenIds = new Set();
  const seenEmails = new Set();
  const requiredFields = SYSTEM_FIELDS.filter(f => f.required).map(f => f.key);

  rows.forEach((row, i) => {
    const rowNum = i + 2;
    const mapped = {};
    Object.entries(mapping).forEach(([col, field]) => {
      if (field !== "__skip__") mapped[field] = row[col];
    });

    // Required fields
    requiredFields.forEach(field => {
      if (!mapped[field] || String(mapped[field]).trim() === "") {
        const label = SYSTEM_FIELDS.find(f => f.key === field)?.label || field;
        errors.push(`Row ${rowNum}: Missing required field "${label}"`);
      }
    });

    // Duplicate employee numbers
    if (mapped.employee_number) {
      if (seenIds.has(mapped.employee_number)) {
        errors.push(`Row ${rowNum}: Duplicate Employee Number "${mapped.employee_number}"`);
      } else seenIds.add(mapped.employee_number);
    }

    // Email format
    if (mapped.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mapped.email)) {
      errors.push(`Row ${rowNum}: Invalid email format "${mapped.email}"`);
    }

    // Duplicate emails
    if (mapped.email) {
      if (seenEmails.has(mapped.email)) {
        warnings.push(`Row ${rowNum}: Duplicate email "${mapped.email}"`);
      } else seenEmails.add(mapped.email);
    }

    // Work week type
    if (mapped.work_week_type && !["5-day", "6-day"].includes(String(mapped.work_week_type).toLowerCase().trim())) {
      warnings.push(`Row ${rowNum}: Work Week Type should be "5-day" or "6-day", got "${mapped.work_week_type}"`);
    }

    // Future start date
    if (mapped.start_date && new Date(mapped.start_date) > new Date()) {
      warnings.push(`Row ${rowNum}: Employment start date is in the future`);
    }
  });

  return { errors, warnings };
}

export default function ImportColumn() {
  const [excelData, setExcelData] = useState(null); // { headers, rows }
  const [mapping, setMapping] = useState({});
  const [validation, setValidation] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importDone, setImportDone] = useState(false);
  const fileRef = useRef();

  const downloadTemplate = () => {
    // Sheet 1: Data
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...TEMPLATE_SAMPLE]);

    // Column widths
    ws["!cols"] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));

    // Sheet 2: Instructions
    const instructions = [
      ["Employee Import Template — Instructions"],
      [""],
      ["Column", "Required", "Format / Notes"],
      ["Employee_Number", "No", "Unique identifier e.g. EMP001"],
      ["First_Name", "YES", "Employee's first name"],
      ["Last_Name", "YES", "Employee's last name"],
      ["Email", "No", "Valid email address e.g. jane@company.com"],
      ["Phone", "YES", "Contact number e.g. 0821234567"],
      ["ID_Number", "YES", "13-digit SA ID or passport number"],
      ["Department", "No", "e.g. Operations, Finance, HR"],
      ["Job_Title", "No", "e.g. Manager, Cashier"],
      ["Employment_Start_Date", "YES", "YYYY-MM-DD e.g. 2023-01-15"],
      ["Work_Week_Type", "YES", "Must be exactly: 5-day  OR  6-day"],
      ["Annual_Leave_Cycle_Start", "YES", "YYYY-MM-DD — start of annual leave cycle"],
      ["Sick_Leave_Cycle_Start", "YES", "YYYY-MM-DD — start of 36-month sick leave cycle"],
      ["Custom_Annual_Leave_Days", "No", "Number — only if more than statutory 21 days"],
      ["Residential_Address", "No", "Full residential address"],
      ["Bank_Name", "No", "e.g. FNB, Standard Bank, Absa"],
      ["Branch_Code", "No", "6-digit bank branch code"],
      ["Account_Number", "No", "Bank account number"],
      ["Next_Of_Kin_Name", "No", "Full name of emergency contact"],
      ["Next_Of_Kin_Relationship", "No", "e.g. Spouse, Parent, Sibling"],
      ["Next_Of_Kin_Contact", "No", "Contact number for next of kin"],
      [""],
      ["NOTES:"],
      ["• Do NOT change column headers — they must match exactly."],
      ["• Dates must be in YYYY-MM-DD format (e.g. 2023-06-01)."],
      ["• Work_Week_Type must be '5-day' or '6-day' (no other values accepted)."],
      ["• Required fields marked YES must not be left blank."],
      ["• Remove this Instructions sheet before uploading if it causes issues (optional)."],
    ];
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 55 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");
    XLSX.writeFile(wb, "employee_import_template.xlsx");
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(ws, { defval: "" });
      if (!raw.length) return;
      const headers = Object.keys(raw[0]);
      setExcelData({ headers, rows: raw });
      const m = autoMap(headers);
      setMapping(m);
      setValidation(null);
      setImportDone(false);
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const runValidation = () => {
    const result = validateRows(excelData.rows, mapping);
    setValidation(result);
  };

  const handleImport = async () => {
    setImporting(true);
    setImportProgress(0);
    const rows = excelData.rows;
    for (let i = 0; i < rows.length; i++) {
      const mapped = {};
      Object.entries(mapping).forEach(([col, field]) => {
        if (field !== "__skip__") mapped[field] = rows[i][col] || undefined;
      });
      if (mapped.work_week_type) {
        const ww = String(mapped.work_week_type).toLowerCase().trim();
        mapped.work_week_type = ww.startsWith("6") ? "6-day" : "5-day";
      }
      mapped.employment_status = "Active";
      await base44.entities.Employee.create(mapped);
      setImportProgress(Math.round(((i + 1) / rows.length) * 100));
    }
    setImporting(false);
    setImportDone(true);
  };

  const hasErrors = validation?.errors?.length > 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Import Employees from Excel</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Upload an .xlsx or .csv file to bulk import employees</p>
        </div>
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="rounded-xl text-xs gap-1.5 border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 shrink-0"
        >
          <Download className="w-3.5 h-3.5" /> Download Template
        </Button>
      </div>

      {/* File Upload */}
      <label className="cursor-pointer block">
        <div className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-6 text-center transition-colors">
          <FileSpreadsheet className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-400">Click to upload <span className="text-red-500 font-medium">.xlsx</span> or <span className="text-red-500 font-medium">.csv</span></p>
          <p className="text-xs text-zinc-600 mt-1">Max 5MB</p>
          {excelData && <p className="text-xs text-emerald-400 mt-2">{excelData.rows.length} rows loaded</p>}
        </div>
        <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={handleFile} />
      </label>

      {excelData && (
        <>
          {/* Column Mapping */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Column Mapping</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {excelData.headers.map(col => (
                <div key={col} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 w-36 truncate shrink-0" title={col}>{col}</span>
                  <span className="text-zinc-700 text-xs">→</span>
                  <Select value={mapping[col] || "__skip__"} onValueChange={v => setMapping(m => ({ ...m, [col]: v }))}>
                    <SelectTrigger className="flex-1 h-8 text-xs border-zinc-700 rounded-lg bg-zinc-800 text-white focus:border-red-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__skip__">— Skip —</SelectItem>
                      {SYSTEM_FIELDS.map(f => (
                        <SelectItem key={f.key} value={f.key}>{f.label}{f.required ? " *" : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Preview (first 5 rows)</h3>
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-xs">
                <thead className="bg-zinc-800">
                  <tr>
                    {excelData.headers.map(h => (
                      <th key={h} className="text-left px-3 py-2 text-zinc-400 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {excelData.rows.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {excelData.headers.map(h => (
                        <td key={h} className="px-3 py-2 text-zinc-300 whitespace-nowrap max-w-[120px] truncate">{String(row[h] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Validate */}
          <Button onClick={runValidation} variant="outline" className="w-full rounded-xl border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 text-sm">
            Validate Data
          </Button>

          {/* Validation results */}
          {validation && (
            <div className="space-y-2">
              {validation.errors.length === 0 && validation.warnings.length === 0 && (
                <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/40 rounded-xl px-3 py-2.5 text-xs text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> All {excelData.rows.length} rows passed validation
                </div>
              )}
              {validation.errors.length > 0 && (
                <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-3 space-y-1 max-h-40 overflow-y-auto">
                  <p className="text-xs font-semibold text-red-400 flex items-center gap-1.5 mb-1.5">
                    <XCircle className="w-3.5 h-3.5" /> {validation.errors.length} Error(s) — must fix before importing
                  </p>
                  {validation.errors.map((e, i) => <p key={i} className="text-xs text-red-300">{e}</p>)}
                </div>
              )}
              {validation.warnings.length > 0 && (
                <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-3 space-y-1 max-h-32 overflow-y-auto">
                  <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> {validation.warnings.length} Warning(s)
                  </p>
                  {validation.warnings.map((w, i) => <p key={i} className="text-xs text-amber-300">{w}</p>)}
                </div>
              )}
            </div>
          )}

          {/* Import button + progress */}
          {importDone ? (
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/40 rounded-xl px-3 py-2.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {excelData.rows.length} employees imported successfully!
            </div>
          ) : (
            <>
              {importing && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>Importing…</span><span>{importProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full transition-all" style={{ width: `${importProgress}%` }} />
                  </div>
                </div>
              )}
              <Button
                onClick={handleImport}
                disabled={importing || !validation || hasErrors}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm disabled:opacity-50"
              >
                {importing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Importing…</> : `Import ${excelData.rows.length} Employees`}
              </Button>
              {!validation && <p className="text-xs text-zinc-600 text-center">Run validation before importing</p>}
            </>
          )}
        </>
      )}
    </div>
  );
}
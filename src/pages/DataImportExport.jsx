import React from "react";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import ImportColumn from "../components/importexport/ImportColumn";
import ExportColumn from "../components/importexport/ExportColumn";

export default function DataImportExport() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-white tracking-tight">Employee Data Import / Export</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Bulk import employees from spreadsheets or download reports</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: Import */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ArrowDownToLine className="w-4 h-4 text-red-500" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Import</span>
            </div>
            <ImportColumn />
          </div>

          {/* Right: Export */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpFromLine className="w-4 h-4 text-red-500" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Export</span>
            </div>
            <ExportColumn />
          </div>
        </div>
      </div>
    </div>
  );
}
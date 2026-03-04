import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link to={createPageUrl("Employees")} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-slate-800 tracking-tight">HR Manager</span>
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <style>{`
        :root {
          --rock-red: #dc2626;
          --rock-red-dark: #b91c1c;
          --rock-black: #09090b;
          --rock-surface: #18181b;
          --rock-border: #27272a;
          --rock-muted: #3f3f46;
          --rock-text: #fafafa;
          --rock-subtle: #a1a1aa;
        }
        body { background: var(--rock-black); }
      `}</style>
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl("Employees")} className="flex items-center">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a8173b9d6e974c0fe109b4/464f7be35_Screenshot_20260304_133520_Gallery.jpg"
                alt="Medfood Logo"
                className="h-14 w-auto"
              />
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                to={createPageUrl("Employees")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentPageName === "Employees" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                Employees
              </Link>
              <Link
                to={createPageUrl("LabourLaw")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentPageName === "LabourLaw" ? "bg-red-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                Labour Law
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
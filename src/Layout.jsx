import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const isAdmin = user?.role === "admin";

  const navLink = (page, label, highlight = false) => (
    <Link
      key={page}
      to={createPageUrl(page)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        currentPageName === page
          ? highlight ? "bg-red-600 text-white" : "bg-zinc-800 text-white"
          : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
    </Link>
  );

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
            <Link to={createPageUrl(isAdmin ? "AdminDashboard" : "EmployeeDashboard")} className="flex items-center">
              <img
                src="https://media.base44.com/images/public/69b1823539c8b554225e2ca7/89b319103_Screenshot_20260311_174710_Google.jpg"
                alt="Rock and Roller Logo"
                className="h-14 w-auto"
              />
            </Link>
            <nav className="flex items-center gap-1">
              {isAdmin ? (
                <>
                  {navLink("AdminDashboard", "Dashboard")}
                  {navLink("Employees", "Employees")}
                  {navLink("DataImportExport", "Import / Export")}
                  {navLink("LabourLaw", "Labour Law", true)}
                  {navLink("LabourLawAssistant", "AI Assistant", true)}
                </>
              ) : (
                <>
                  {navLink("EmployeeDashboard", "My Dashboard")}
                  {navLink("LabourLawAssistant", "AI Assistant", true)}
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
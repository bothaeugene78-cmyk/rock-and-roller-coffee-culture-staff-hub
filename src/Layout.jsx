import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  BookOpen,
  Bot,
  ChevronRight,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const adminNav = [
  { page: "AdminDashboard", label: "Dashboard", icon: LayoutDashboard },
  { page: "Employees", label: "Employees", icon: Users },
  { page: "DataImportExport", label: "Import / Export", icon: FileSpreadsheet },
  { page: "LabourLaw", label: "Labour Law", icon: BookOpen },
  { page: "LabourLawAssistant", label: "AI Assistant", icon: Bot, highlight: true },
];

const employeeNav = [
  { page: "EmployeeDashboard", label: "My Dashboard", icon: LayoutDashboard },
  { page: "LabourLawAssistant", label: "AI Assistant", icon: Bot, highlight: true },
];

function NavItem({ item, currentPageName, onClick }) {
  const isActive = currentPageName === item.page;
  return (
    <Link
      to={createPageUrl(item.page)}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
        isActive
          ? item.highlight
            ? "bg-red-600 text-white shadow-lg shadow-red-900/40"
            : "bg-zinc-800 text-white"
          : item.highlight
          ? "text-red-400 hover:bg-red-600/10 hover:text-red-300"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      <span>{item.label}</span>
      {isActive && !item.highlight && (
        <ChevronRight className="w-3 h-3 ml-auto text-zinc-500" />
      )}
    </Link>
  );
}

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const isAdmin = user?.role === "admin";
  const nav = isAdmin ? adminNav : employeeNav;

  const Sidebar = ({ onClose }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-800">
        <Link to={createPageUrl(isAdmin ? "AdminDashboard" : "EmployeeDashboard")} onClick={onClose}>
          <img
            src="https://media.base44.com/images/public/69b1823539c8b554225e2ca7/89b319103_Screenshot_20260311_174710_Google.jpg"
            alt="Rock and Roller Coffee"
            className="h-12 w-auto"
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-3 mb-2">
          {isAdmin ? "Admin" : "My Account"}
        </p>
        {nav.map((item) => (
          <NavItem
            key={item.page}
            item={item}
            currentPageName={currentPageName}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* User footer */}
      {user && (
        <div className="px-3 py-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-800/60">
            <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">
                {user.full_name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
              <p className="text-[10px] text-zinc-500 capitalize">{user.role}</p>
            </div>
            <button
              onClick={() => base44.auth.logout()}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex">
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

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-zinc-950 border-r border-zinc-800 sticky top-0 h-screen overflow-hidden">
        <Sidebar onClose={undefined} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-zinc-950 border-r border-zinc-800 flex flex-col lg:hidden transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-end p-3 border-b border-zinc-800">
          <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 hover:text-white p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img
            src="https://media.base44.com/images/public/69b1823539c8b554225e2ca7/89b319103_Screenshot_20260311_174710_Google.jpg"
            alt="Rock and Roller Coffee"
            className="h-8 w-auto"
          />
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
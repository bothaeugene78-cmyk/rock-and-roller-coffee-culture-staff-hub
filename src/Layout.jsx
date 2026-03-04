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
            <Link to={createPageUrl("Employees")} className="flex items-center">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a8173b9d6e974c0fe109b4/464f7be35_Screenshot_20260304_133520_Gallery.jpg"
                alt="Medfood Logo"
                className="h-9 w-auto"
              />
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
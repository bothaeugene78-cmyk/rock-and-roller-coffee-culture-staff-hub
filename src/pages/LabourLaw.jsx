import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scale, Send, ChevronDown, ChevronUp, BookOpen, Clock, Calendar, DollarSign, Shield, UserX, Loader2 } from "lucide-react";
import LabourLawCard from "../components/labourlaw/LabourLawCard";
import QASection from "../components/labourlaw/QASection";

const TOPICS = [
  {
    icon: Clock,
    title: "Working Hours",
    colour: "red",
    points: [
      "Maximum 45 ordinary hours per week",
      "Maximum 9 hours/day (5-day week) or 8 hours/day (6-day week)",
      "Overtime limited to 10 hours per week",
      "Overtime paid at 1.5× normal rate (or 2× on Sundays/public holidays)",
      "Rest period of at least 12 hours between shifts",
      "30-minute meal break after 5 continuous hours",
    ],
  },
  {
    icon: Calendar,
    title: "Leave Entitlements",
    colour: "zinc",
    points: [
      "Annual Leave: 21 consecutive days (15 working days) per year",
      "Sick Leave: 30 days paid sick leave over a 3-year cycle",
      "Family Responsibility Leave: 3 days per year (death/illness of family)",
      "Maternity Leave: 4 consecutive months (unpaid, UIF claimable)",
      "Parental Leave: 10 days for non-primary caregivers",
      "Leave must be taken within 6 months of the cycle end or paid out",
    ],
  },
  {
    icon: DollarSign,
    title: "Pay & Wages",
    colour: "red",
    points: [
      "National Minimum Wage: R28.79/hour (2025)",
      "Pay slips must be issued on every payday",
      "Wages must be paid on agreed payday (weekly, fortnightly, or monthly)",
      "Deductions only allowed with written consent or by law",
      "UIF contributions: 1% from employee + 1% from employer",
      "Severance pay: 1 week per year of completed service (retrenchment)",
    ],
  },
  {
    icon: Shield,
    title: "Employee Rights",
    colour: "zinc",
    points: [
      "Right to fair labour practices (Section 23 of the Constitution)",
      "Right to join a trade union and participate in collective bargaining",
      "Protection against unfair discrimination (race, gender, age, disability, etc.)",
      "Right to a safe and healthy working environment (OHSA)",
      "Right to inspect own employment records",
      "Right to lodge grievances without fear of victimisation",
    ],
  },
  {
    icon: UserX,
    title: "Dismissal & Termination",
    colour: "red",
    points: [
      "Dismissal must be for a fair reason: misconduct, incapacity, or operational requirements",
      "A fair procedure must always be followed before dismissal",
      "Employee must receive a notice of hearing and opportunity to respond",
      "Notice periods: 1 week (<6 months), 2 weeks (6m–1yr), 4 weeks (1yr+)",
      "Constructive dismissal: forced to resign = treated as unfair dismissal",
      "Disputes referred to the CCMA within 30 days of dismissal",
    ],
  },
  {
    icon: BookOpen,
    title: "Key Laws to Know",
    colour: "zinc",
    points: [
      "BCEA (Basic Conditions of Employment Act, 1997) – sets minimum conditions",
      "LRA (Labour Relations Act, 1995) – governs collective bargaining & disputes",
      "EEA (Employment Equity Act, 1998) – prohibits unfair discrimination",
      "OHSA (Occupational Health & Safety Act, 1993) – workplace safety",
      "COIDA – compensation for injuries on duty",
      "CCMA – free dispute resolution body for all employees",
    ],
  },
];

export default function LabourLaw() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">South African Labour Law</h1>
              <p className="text-xs text-zinc-500">Know your rights · BCEA · LRA · EEA</p>
            </div>
          </div>
          <p className="text-sm text-zinc-400 mt-3 max-w-2xl leading-relaxed">
            Every employee in South Africa is protected by law. Below are the key rights and rules that apply to you. 
            Use the <span className="text-red-500 font-medium">Ask a Question</span> section at the bottom to get plain-language answers about any labour law topic.
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-5">Key Topics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {TOPICS.map((topic) => (
            <LabourLawCard key={topic.title} topic={topic} />
          ))}
        </div>

        {/* Q&A */}
        <QASection />
      </div>
    </div>
  );
}
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Clock from "@/components/Clock";
import {
  LayoutDashboard,
  ArrowRightLeft,
  FileText,
  CalendarDays,
  BarChart3,
  HeartHandshake,
} from "lucide-react";

const financeTabs = [
  { name: "แดชบอร์ดการเงิน", href: "/finance", icon: LayoutDashboard },
  { name: "รายการโอนเงิน", href: "/transfers", icon: ArrowRightLeft },
  { name: "คำขอจ่ายเงิน", href: "/requests", icon: FileText },
  { name: "รอบการจ่ายเงิน", href: "/pay-cycles", icon: CalendarDays },
  { name: "รายงาน", href: "/reports", icon: BarChart3 },
  { name: "จัดการสวัสดิการ", href: "/benefits", icon: HeartHandshake },
];

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-full p-6 md:p-8 font-line-seed-sans-th flex flex-col gap-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span>ฝ่ายบัญชีและการเงิน</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">Accounting & Finance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            ระบบบริหารการเงินและสวัสดิการ
          </h1>
        </div>

        {/* Clock Component */}
        <div className="self-start sm:self-auto">
          <Clock />
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 shadow-xs border border-gray-200 flex items-center gap-1 overflow-x-auto">
        {financeTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#105647] text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-200" : "text-zinc-500"}`} />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Page Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}

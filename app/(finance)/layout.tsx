"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Clock from "@/components/Clock";

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

      {/* Page Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}

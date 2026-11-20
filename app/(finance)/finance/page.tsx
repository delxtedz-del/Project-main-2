"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TableTransfers } from "@/components/TableTransfers";
import {
  TransferItem,
  getLiveTransfers,
  toggleTransferStatus,
  MOCK_CHART_DATA,
} from "@/data/finance";
import { Clock, Receipt, ArrowRight, Wallet, CheckCircle2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function FinanceDashboardPage() {
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setTransfers(getLiveTransfers());
  }, []);

  const handleToggleStatus = (id: string) => {
    const updated = toggleTransferStatus(id);
    setTransfers(updated);
  };

  const approvedTransfers = transfers.filter((t) => t.status === "approved");
  const pendingTransfers = transfers.filter((t) => t.status === "pending");
  const totalApprovedAmount = approvedTransfers.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">แดชบอร์ดภาพรวมการเงิน</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          ภาพรวมการโอนเงิน การตั้งเบิกจ่ายสวัสดิการ และการตัดรอบบัญชี
        </p>
      </div>

      {/* Top 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: ยอดสุทธิ (อนุมัติแล้ว) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs relative hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">ยอดสุทธิ (อนุมัติแล้ว)</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm font-bold">
              ฿
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-800 mt-2">
            ฿{totalApprovedAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
            {approvedTransfers.length} รายการที่ยืนยันแล้ว
          </p>
        </div>

        {/* Card 2: รอตรวจสอบ */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs relative hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">รอตรวจสอบ</p>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-700 mt-2">
            {pendingTransfers.length} รายการ
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">ยังไม่ยืนยันการตั้งเบิกจ่าย</p>
        </div>

        {/* Card 3: ภาษีหัก ณ ที่จ่ายรวม */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs relative hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">ภาษีหัก ณ ที่จ่ายรวม</p>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-900 mt-2">฿46,441.50</h3>
          <p className="text-[11px] text-gray-400 mt-1">จากรายการทั้งหมดในรอบบัญชี</p>
        </div>

        {/* Card 4: รายการทั้งหมด */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs relative hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">รายการทั้งหมด</p>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-900 mt-2">
            {transfers.length} รายการ
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">นับรวมทุกสถานะในระบบ</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm text-gray-900">ยอดโอนสุทธิรายเดือน</h4>
            <p className="text-xs text-gray-400">ย้อนหลัง 6 เดือน (พ.ศ. 2569)</p>
          </div>
          <span className="text-[11px] font-medium px-2.5 py-1 bg-gray-100 rounded-full text-gray-600">
            ปีงบประมาณ 2569
          </span>
        </div>
        <div className="h-64 w-full">
          {isClient && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  domain={[0, 600000]}
                  ticks={[0, 150000, 300000, 450000, 600000]}
                  tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `฿${Number(value).toLocaleString("th-TH")} บาท`,
                    "ยอดสุทธิ",
                  ]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="amount" fill="#105647" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Transfers Section */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-gray-100">
          <div>
            <h4 className="font-bold text-sm text-gray-900">รายการโอนเงินล่าสุด</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              แสดง 5 รายการล่าสุดในระบบบัญชี
            </p>
          </div>
          <Link
            href="/transfers"
            className="text-xs text-emerald-800 hover:text-emerald-900 flex items-center gap-1 font-semibold transition cursor-pointer"
          >
            ดูรายการทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <TableTransfers items={transfers.slice(0, 5)} onToggleStatus={handleToggleStatus} />
      </div>
    </div>
  );
}

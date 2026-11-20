"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Benefits,
  getLiveBenefitsData,
  BENEFIT_POLICIES,
} from "@/data/benefit";
import {
  Search,
  HeartHandshake,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
} from "lucide-react";

export default function BenefitsManagementPage() {
  const [benefitsList, setBenefitsList] = useState<Benefits[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setBenefitsList(getLiveBenefitsData());
  }, []);

  const pendingHrCount = benefitsList.filter((b) => b.status === "pending_hr").length;
  const approvedCount = benefitsList.filter((b) => b.status === "approved").length;
  const successCount = benefitsList.filter((b) => b.status === "success").length;
  const pendingDocCount = benefitsList.filter((b) => b.status === "pending_document").length;

  const filteredBenefits = benefitsList.filter((b) => {
    const matchesSearch =
      b.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.claimId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.benefitCategory.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalApprovedAmount = benefitsList
    .filter((b) => b.status === "approved" || b.status === "success")
    .reduce(
      (sum, b) =>
        sum +
        (typeof b.approvedAmount === "number" && b.approvedAmount > 0
          ? b.approvedAmount
          : b.amountRequested),
      0
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            จัดการสวัสดิการและการเบิกจ่าย (HR & Finance)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            ตรวจสอบรายการคำขอเบิกสวัสดิการของพนักงาน และส่งต่องานเบิกจ่ายให้ฝ่ายการเงิน
          </p>
        </div>

        <Link
          href="/requests"
          className="bg-[#105647] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#0c4337] transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <span>ดูคิวคำขอจ่ายเงิน (Finance)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500 font-medium">รอฝ่ายบุคคลตรวจ</p>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-amber-700 mt-2">
            {pendingHrCount} รายการ
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">รอการอนุมัติขั้นต้น</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500 font-medium">อนุมัติแล้ว (รอโอนเงิน)</p>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-blue-700 mt-2">
            {approvedCount} รายการ
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">ส่งต่อให้การเงินตั้งเบิก</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500 font-medium">จ่ายสำเร็จแล้ว</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-800 mt-2">
            {successCount} รายการ
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">โอนเงินเข้าบัญชีเรียบร้อย</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500 font-medium">ยอดอนุมัติเบิกจ่ายรวม</p>
            <HeartHandshake className="w-4 h-4 text-[#105647]" />
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-900 mt-2">
            ฿{totalApprovedAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">รอบปีงบประมาณ 2569</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหารหัสคำขอ / ชื่อพนักงาน / สวัสดิการ"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition"
            />
          </div>

          <div className="flex bg-gray-100/80 p-1 rounded-xl text-xs font-medium overflow-x-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                statusFilter === "all"
                  ? "bg-white text-gray-900 font-semibold shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              ทั้งหมด ({benefitsList.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending_hr")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                statusFilter === "pending_hr"
                  ? "bg-white text-amber-700 font-semibold shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              รอ HR ({pendingHrCount})
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                statusFilter === "approved"
                  ? "bg-white text-blue-700 font-semibold shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              รอจ่ายเงิน ({approvedCount})
            </button>
            <button
              onClick={() => setStatusFilter("success")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                statusFilter === "success"
                  ? "bg-white text-emerald-700 font-semibold shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              สำเร็จ ({successCount})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-line-seed-sans-th">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-medium bg-gray-50/50">
                <th className="py-3 px-4">รหัสคำขอ</th>
                <th className="py-3 px-4">พนักงาน</th>
                <th className="py-3 px-4">ประเภทสวัสดิการ</th>
                <th className="py-3 px-4">วันที่ยื่น</th>
                <th className="py-3 px-4 text-right">ยอดที่ขอ</th>
                <th className="py-3 px-4 text-right">ยอดอนุมัติ</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">รอบตัด/โอน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBenefits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    ไม่พบข้อมูลคำขอเบิกสวัสดิการ
                  </td>
                </tr>
              ) : (
                filteredBenefits.map((b) => (
                  <tr key={b.claimId} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {b.claimId}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{b.empName}</div>
                      <div className="text-[10px] text-gray-400">
                        {b.empCode} • {b.department}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-emerald-900">
                        {b.benefitCategory}
                      </span>
                      {b.claimType && (
                        <span className="text-[10px] text-gray-400 block">
                          เบิกให้: {b.claimType}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {b.requestDate}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-gray-700 whitespace-nowrap">
                      ฿{b.amountRequested.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-800 whitespace-nowrap">
                      {typeof b.approvedAmount === "number" && b.approvedAmount > 0
                        ? `฿${b.approvedAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`
                        : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {b.status === "pending_document" && (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium border border-gray-300 text-gray-600 bg-gray-50">
                          รอส่งเอกสาร
                        </span>
                      )}
                      {b.status === "pending_hr" && (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium border border-amber-300 text-amber-700 bg-amber-50">
                          รอ HR ตรวจ
                        </span>
                      )}
                      {b.status === "approved" && (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium border border-blue-300 text-blue-700 bg-blue-50">
                          อนุมัติแล้ว (รอเบิก)
                        </span>
                      )}
                      {b.status === "success" && (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium border border-emerald-300 text-emerald-700 bg-emerald-50">
                          เบิกสำเร็จ
                        </span>
                      )}
                      {b.status === "rejected" && (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium border border-red-300 text-red-700 bg-red-50">
                          ไม่อนุมัติ
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-gray-500 whitespace-nowrap">
                      {b.disbursement || b.cutoffdate || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

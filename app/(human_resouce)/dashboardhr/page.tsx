"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Users,
  CalendarDays,
  ChevronDown,
  ArrowRight,
  Search,
  RotateCw,
  X,
  LayoutGrid,
} from "lucide-react";
import { Clock } from "@/components/Clock";
import { NotificationBell } from "@/components/notification-bell";
import { ClaimStatusBadge } from "@/components/ClaimStatusBadge";
import { benefitsData, Benefits } from "@/data/benefit";

const STORAGE_KEY = "edbms-benefits";

export default function DashboardHrPage() {
  const [claims, setClaims] = useState<Benefits[]>(benefitsData as Benefits[]);
  const [hydrated, setHydrated] = useState(false);

  // โหลดข้อมูลจาก localStorage เพื่อให้การเปลี่ยนสถานะคงอยู่จริง
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Benefits[];
        window.requestAnimationFrame(() => {
          setClaims(parsed);
        });
      }
    } catch {
      /* ignore */
    }
    window.requestAnimationFrame(() => {
      setHydrated(true);
    });
  }, []);

  // บันทึกลง localStorage เมื่อ claims มีการเปลี่ยนแปลง
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
    } catch {
      /* ignore */
    }
  }, [claims, hydrated]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBudgetYear, setSelectedBudgetYear] = useState("all");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // ฟังก์ชันเปลี่ยนสถานะแบบ Interactive ที่ดึงมาจาก ClaimStatusBadge Component
  const handleStatusChange = (
    claimId: string,
    newStatus: "pending_hr" | "approved" | "rejected"
  ) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.claimId === claimId
          ? {
              ...c,
              status: newStatus,
              statusNote:
                newStatus === "approved"
                  ? "อนุมัติเรียบร้อยโดย HR"
                  : newStatus === "rejected"
                    ? "ปฏิเสธคำขอ"
                    : "รอ HR ตรวจสอบ",
              approver: newStatus === "approved" ? "HR Admin" : c.approver,
              approvedAmount:
                newStatus === "approved" ? c.amountRequested : 0,
            }
          : c
      )
    );
  };

  // คำนวณข้อมูลสถิติของ 4 การ์ดด้านบนแบบไดนามิกตามสถานะจริง
  const regularEmployeesCount = 112;
  const contractEmployeesCount = 12;
  const internEmployeesCount = 4;

  const pendingCount = claims.filter((b) => b.status === "pending_hr").length;
  const approvedClaims = claims.filter((b) => b.status === "approved");
  const approvedCount = approvedClaims.length;
  const approvedTotalAmount = approvedClaims.reduce(
    (sum, b) => sum + (b.amountRequested || 0),
    0
  );

  // รายการหมวดหมู่สวัสดิการที่มีในระบบสำหรับ dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    claims.forEach((b) => {
      if (b.benefitCategory) set.add(b.benefitCategory);
    });
    return Array.from(set);
  }, [claims]);

  // กรองข้อมูลในตารางตามการค้นหาและตัวกรองสถานะ
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        claim.claimId.toLowerCase().includes(q) ||
        claim.empName.toLowerCase().includes(q) ||
        claim.department.toLowerCase().includes(q) ||
        claim.benefitCategory.toLowerCase().includes(q);

      const matchCategory =
        selectedCategory === "all" || claim.benefitCategory === selectedCategory;

      const matchStatus =
        selectedStatus === "all" ||
        (selectedStatus === "pending" && claim.status === "pending_hr") ||
        (selectedStatus === "approved" && claim.status === "approved") ||
        (selectedStatus === "rejected" && claim.status === "rejected");

      return matchSearch && matchCategory && matchStatus;
    });
  }, [claims, searchQuery, selectedCategory, selectedStatus]);

  // คำนวณ Pagination
  const totalPages = Math.ceil(filteredClaims.length / pageSize) || 1;
  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClaims.slice(start, start + pageSize);
  }, [filteredClaims, currentPage, pageSize]);

  return (
    <div className="p-8 md:p-10 max-w-[1440px] mx-auto min-h-screen">
      {/* 1. ส่วนหัว: หัวข้อหน้า และ วันที่/กระดิ่งแจ้งเตือน */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium leading-9 tracking-[0.031em] text-[#0b1e1b]">
              ภาพรวม
            </h1>
            <LayoutGrid className="size-4 text-zinc-900" />
          </div>
          <p className="text-base font-sans font-thin tracking-tight text-[#0b1e1b] mt-0.5">
            รายชื่อทุกคนในระบบ ({claims.length} คน) - ค้นหาได้จากชื่อ ตำแหน่ง รหัสพนักงาน หรืออีเมล
          </p>
        </div>

        {/* วันที่ และ กระดิ่งแจ้งเตือน */}
        <div className="flex items-center gap-3 self-end sm:self-auto text-[#0b1e1b]">
          <Clock className="text-base font-medium leading-6 tracking-wide text-zinc-900 flex items-center mt-[-22.6px]" />
          <NotificationBell />
        </div>
      </div>

      {/* 2. สรุป 4 การ์ดสำคัญ (อัปเดตตามสถานะจริง) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        {/* การ์ด 1: รอตรวจสอบและอนุมัติ */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-zinc-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-600">
              รอตรวจสอบและอนุมัติ
            </span>
            <div className="size-6 flex items-center justify-center text-zinc-400">
              <RotateCw className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-zinc-900 mb-1">
              {pendingCount} รายการ
            </div>
            <p className="text-[11px] font-medium text-orange-500">
              ต้องดำเนินการก่อนวันที่ 5 ต.ค.
            </p>
          </div>
        </div>

        {/* การ์ด 2: อนุมัติแล้วในงวดนี้ */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-zinc-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-600">
              อนุมัติแล้วในงวดนี้
            </span>
            <div className="size-6 flex items-center justify-center text-zinc-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-zinc-900 mb-1">
              ฿{approvedTotalAmount.toLocaleString("th-TH")}
            </div>
            <p className="text-[11px] text-zinc-400 font-normal">
              รวม {approvedCount} รายการสำหรับรอบจ่ายนี้
            </p>
          </div>
        </div>

        {/* การ์ด 3: พนักงานทั้งหมด */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-zinc-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-600">
              พนักงานทั้งหมด
            </span>
            <div className="size-6 flex items-center justify-center text-zinc-400">
              <Users className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-zinc-900 mb-1">
              128 คน
            </div>
            <p className="text-[11px] font-medium text-teal-800">
              ประจำ {regularEmployeesCount} | สัญญาจ้าง {contractEmployeesCount} | ฝึกงาน {internEmployeesCount}
            </p>
          </div>
        </div>

        {/* การ์ด 4: รอบโอนจ่ายเงินถัดไป */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-zinc-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-600">
              รอบโอนจ่ายเงินถัดไป
            </span>
            <div className="size-6 flex items-center justify-center text-zinc-400">
              <CalendarDays className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-zinc-900 mb-1">
              24 ต.ค. 2026
            </div>
            <p className="text-[11px] text-zinc-400 font-normal">
              *เลื่อนขึ้นจาก 25 (วันอาทิตย์)
            </p>
          </div>
        </div>
      </div>

      {/* 3. แถบค้นหา และ ตัวกรอง 3 ช่อง */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
        {/* ช่องค้นหา */}
        <div className="flex-1 max-w-[500px] h-10 px-4 bg-white border border-zinc-200 rounded-full flex items-center gap-2 shadow-xs">
          <Search className="size-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="ค้นหาชื่อ, รหัส, สวัสดิการ..."
            className="w-full bg-transparent text-xs text-zinc-800 placeholder-zinc-400 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* กลุ่ม Dropdown ตัวกรอง 3 ช่อง */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* วันที่งบประมาณ */}
          <div className="relative">
            <select
              value={selectedBudgetYear}
              onChange={(e) => setSelectedBudgetYear(e.target.value)}
              className="appearance-none h-10 pl-4 pr-9 bg-white border border-zinc-200 rounded-2xl text-xs text-zinc-600 font-normal outline-none hover:border-zinc-300 transition-colors cursor-pointer shadow-xs"
            >
              <option value="all">วันที่งบประมาณ</option>
              <option value="2569">งบประมาณปี 2569</option>
              <option value="2568">งบประมาณปี 2568</option>
            </select>
            <ChevronDown className="size-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* ประเภทสวัสดิการ */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none h-10 pl-4 pr-9 bg-white border border-zinc-200 rounded-2xl text-xs text-zinc-600 font-normal outline-none hover:border-zinc-300 transition-colors cursor-pointer shadow-xs"
            >
              <option value="all">ประเภทสวัสดิการ</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="size-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* สถานะ */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none h-10 pl-4 pr-9 bg-white border border-zinc-200 rounded-2xl text-xs text-zinc-600 font-normal outline-none hover:border-zinc-300 transition-colors cursor-pointer shadow-xs"
            >
              <option value="all">สถานะ</option>
              <option value="pending">รออนุมัติ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="rejected">ปฏิเสธ</option>
            </select>
            <ChevronDown className="size-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. แถบควบคุมจำนวนต่อหน้า และ สรุปจำนวนรายการ */}
      <div className="flex items-center justify-between text-xs text-zinc-600 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span>จำนวนต่อหน้า</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="appearance-none pl-3 pr-7 py-1 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-700 outline-none cursor-pointer"
            >
              <option value={5}>จำนวน 5 หน้า</option>
              <option value={10}>จำนวน 10 หน้า</option>
              <option value={20}>จำนวน 20 หน้า</option>
            </select>
            <ChevronDown className="size-3 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="text-zinc-400">
          แสดง {paginatedClaims.length} จาก {filteredClaims.length} รายการ
        </div>
      </div>

      {/* 5. ตารางข้อมูลหลัก (ใช้ ClaimStatusBadge Component เพื่อเปลี่ยนสถานะได้จริง) */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#10483B] text-white font-medium">
                <th className="py-3.5 px-6">วันยื่นเรื่อง</th>
                <th className="py-3.5 px-6">รหัสคำขอ</th>
                <th className="py-3.5 px-6">ชื่อผู้ยื่น</th>
                <th className="py-3.5 px-6">แผนก</th>
                <th className="py-3.5 px-6">ประเภท</th>
                <th className="py-3.5 px-6 text-right">ยอดเงิน</th>
                <th className="py-3.5 px-6 text-center">สถานะ</th>
                <th className="py-3.5 px-6 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginatedClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-400">
                    ไม่พบข้อมูลคำขอที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                paginatedClaims.map((claim, idx) => (
                  <tr
                    key={claim.claimId || idx}
                    className="hover:bg-zinc-50/70 transition-colors"
                  >
                    {/* วันยื่นเรื่อง */}
                    <td className="py-4 px-6 text-zinc-700 whitespace-nowrap">
                      {claim.requestDate || "02 พ.ย. 2569"}
                    </td>

                    {/* รหัสคำขอ */}
                    <td className="py-4 px-6 font-mono text-zinc-800 whitespace-nowrap">
                      {claim.claimId || "QAM030690001"}
                    </td>

                    {/* ชื่อผู้ยื่น */}
                    <td className="py-4 px-6 text-zinc-900 font-medium whitespace-nowrap">
                      {claim.empName || "Patipat Srangtan"}
                    </td>

                    {/* แผนก */}
                    <td className="py-4 px-6 text-zinc-700 whitespace-nowrap">
                      {claim.department || "QA"}
                    </td>

                    {/* ประเภท */}
                    <td className="py-4 px-6 text-zinc-700 whitespace-nowrap">
                      {claim.benefitCategory || "สวัสดิการครอบครัว"}
                    </td>

                    {/* ยอดเงิน */}
                    <td className="py-4 px-6 text-right font-semibold text-zinc-900 whitespace-nowrap">
                      {(claim.amountRequested || 3000).toLocaleString("th-TH")}
                    </td>

                    {/* สถานะ (ใช้ ClaimStatusBadge Component - คลิกแล้วเปลี่ยนสถานะได้จริงทันที) */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <ClaimStatusBadge
                        status={claim.status}
                        onChange={(newStatus) =>
                          handleStatusChange(claim.claimId, newStatus)
                        }
                      />
                    </td>

                    {/* จัดการ (ลูกศรขวา ไปหน้าจัดการสวัสดิการ) */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <Link
                        href="/benefits"
                        title="ไปหน้าจัดการสวัสดิการ"
                        className="inline-flex items-center justify-center p-1.5 text-zinc-400 hover:text-teal-900 transition-colors"
                      >
                        <ArrowRight className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination ควบคุมหน้า */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4 text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50"
          >
            ก่อนหน้า
          </button>
          <span className="text-zinc-500">
            หน้า {currentPage} จาก {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
}

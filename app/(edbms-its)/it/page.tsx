"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Section from "@/components/Section";
import { useAdmin } from "@/components/AdminProvider";
import { useApprovals } from "@/components/ApprovalProvider";
import { TODAY } from "@/data/it";
import { reserve, yearBudget } from "@/data/budget";
import { thaiDateTime } from "@/lib/format";

const fmt = (n: number) => n.toLocaleString("th-TH");

export default function ITOverviewPage() {
  const { logs, stats } = useAdmin();
  const { calc, getStatus, allRequests } = useApprovals();

  const todayCount = logs.filter((l) => l.at.startsWith(TODAY.slice(0, 10))).length;

  const totalBudget = yearBudget[2569] || 3_000_000;
  const budgetLeft = Math.max(0, totalBudget - calc.budgetUsed);
  const reserveLeft = Math.max(0, reserve.limit - calc.reserveUsed);

  const pendingOf = (fund: "budget" | "reserve") => {
    const list = allRequests.filter(
      (r) => r.fund === fund && getStatus(r.id) === "pending"
    );
    return {
      count: list.length,
      total: list.reduce((t, r) => t + r.amount, 0),
    };
  };

  const pb = pendingOf("budget");
  const pr = pendingOf("reserve");

  const statCards = [
    {
      label: "ผู้ใช้งานในระบบ",
      value: `${stats.users} คน`,
      note: "ดูได้เฉพาะยอดรวม",
      dark: true,
    },
    {
      label: "คำขอในระบบ",
      value: `${stats.requests} รายการ`,
      note: "ดูได้เฉพาะยอดรวม",
    },
    {
      label: "อนุมัติแล้ว",
      value: `${stats.approved} รายการ`,
      note: "ไม่แสดงข้อมูลส่วนบุคคล",
    },
    {
      label: "บันทึกวันนี้",
      value: `${todayCount} รายการ`,
      note: "Audit Trail",
    },
  ];

  const recent = logs.slice(0, 5);

  return (
    <div className="w-full space-y-6 font-line-seed-sans-th">
      {/* ส่วนหัวหน้า */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          ดูแลโครงสร้างระบบ ผู้ใช้งาน และความปลอดภัย
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          ภาพรวมระบบ EDBMS, การเชื่อมโยงสวัสดิการพนักงาน, งบประมาณการเงิน และบันทึก Audit Trail
        </p>
      </div>

      {/* บัตรสถิติภาพรวม */}
      <Section title="ดูภาพรวมล่าสุดของระบบ">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((s) => (
            <div
              key={s.label}
              className={`rounded-2xl p-5 transition-all ${
                s.dark
                  ? "bg-gradient-to-br from-[#10231f] to-[#105647] text-white shadow-md"
                  : "border border-gray-200 bg-white shadow-xs"
              }`}
            >
              <p className={`text-sm ${s.dark ? "text-white/80" : "text-gray-500"}`}>
                {s.label}
              </p>
              <p className="mt-3 text-2xl font-bold tracking-tight">{s.value}</p>
              <p className={`mt-1 text-xs ${s.dark ? "text-white/70" : "text-gray-400"}`}>
                {s.note}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ภาพรวมการเงินของ CEO */}
      <Section title="ภาพรวมการเงิน (CEO / ฝ่ายบริหาร)">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 1. งบสวัสดิการพนักงาน */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900">งบสวัสดิการพนักงาน</h3>
              <p className="text-xs text-gray-500">ปีงบประมาณ 2569 · จัดสรร 35 คน</p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center divide-x divide-gray-100">
              <div className="px-2">
                <p className="text-xs text-gray-500">วงเงินจัดสรร</p>
                <p className="mt-1 text-base font-bold text-gray-900">{fmt(totalBudget)}</p>
                <p className="text-[11px] text-gray-400">บาท</p>
              </div>
              <div className="px-2">
                <p className="text-xs text-gray-500">ใช้ไปแล้ว</p>
                <p className="mt-1 text-base font-bold text-[#105647]">{fmt(calc.budgetUsed)}</p>
                <p className="text-[11px] text-gray-400">บาท</p>
              </div>
              <div className="px-2">
                <p className="text-xs text-gray-500">ยอดคงเหลือ</p>
                <p className="mt-1 text-base font-bold text-gray-900">{fmt(budgetLeft)}</p>
                <p className="text-[11px] text-gray-400">บาท</p>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 text-xs flex items-center justify-between">
              <span className="text-gray-600">คำขอรอพิจารณา ({pb.count} รายการ)</span>
              <span className="font-bold text-gray-900">{fmt(pb.total)} บาท</span>
            </div>
          </div>

          {/* 2. งบสำรองฉุกเฉิน */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900">งบสำรองฉุกเฉิน</h3>
              <p className="text-xs text-gray-500">สำหรับภัยพิบัติและการช่วยเหลือเร่งด่วน</p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center divide-x divide-gray-100">
              <div className="px-2">
                <p className="text-xs text-gray-500">วงเงินสำรอง</p>
                <p className="mt-1 text-base font-bold text-gray-900">{fmt(reserve.limit)}</p>
                <p className="text-[11px] text-gray-400">บาท</p>
              </div>
              <div className="px-2">
                <p className="text-xs text-gray-500">ใช้ไปแล้ว</p>
                <p className="mt-1 text-base font-bold text-amber-700">{fmt(calc.reserveUsed)}</p>
                <p className="text-[11px] text-gray-400">บาท</p>
              </div>
              <div className="px-2">
                <p className="text-xs text-gray-500">ยอดคงเหลือ</p>
                <p className="mt-1 text-base font-bold text-gray-900">{fmt(reserveLeft)}</p>
                <p className="text-[11px] text-gray-400">บาท</p>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 text-xs flex items-center justify-between">
              <span className="text-gray-600">คำขอฉุกเฉินรอพิจารณา ({pr.count} รายการ)</span>
              <span className="font-bold text-gray-900">{fmt(pr.total)} บาท</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ความเคลื่อนไหวล่าสุดของระบบ (Audit Trail) */}
      <Section
        title="ความเคลื่อนไหวล่าสุดของระบบ"
        subtitle="Audit Trail — ใคร ทำอะไร เมื่อไหร่"
        aside={
          <Link
            href="/logs"
            className="text-sm font-semibold text-[#105647] hover:underline flex items-center gap-1"
          >
            ดูทั้งหมด <ArrowRight size={14} />
          </Link>
        }
      >
        <ul className="divide-y divide-gray-100">
          {recent.map((l) => (
            <li
              key={l.id}
              className="flex items-start justify-between gap-4 py-3.5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{l.action}</p>
                  {l.level === "warning" && (
                    <span className="rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                      เฝ้าระวัง
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {l.actor} ({l.role}) {l.detail ? `· ${l.detail}` : ""}
                </p>
              </div>
              <p className="shrink-0 text-xs text-gray-400">{thaiDateTime(l.at)}</p>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

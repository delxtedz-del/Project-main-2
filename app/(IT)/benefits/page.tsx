"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import Section from "@/components/Section";
import { useApprovals } from "@/components/ApprovalProvider";
import {
  reserve,
  monthNames,
  years,
  yearBudget,
  getLiveBudgetExpenses,
  type Expense,
} from "@/data/budget";

const fmt = (n: number) => n.toLocaleString("th-TH");
const sum = (l: Expense[]) => l.reduce((t, x) => t + x.amount, 0);
const fundName = (f: Expense["fund"]) =>
  f === "reserve" ? "งบสำรองฉุกเฉิน" : "งบสวัสดิการ";

export default function BenefitsBudgetPage() {
  const { calc, getStatus, allRequests } = useApprovals();
  const [year, setYear] = useState(2569);
  const [open, setOpen] = useState<number[]>([]); // เดือนที่กางดูรายละเอียด

  // คำขอองค์กรที่อนุมัติแล้ว (ไม่รวม live claims ที่ถูกนับใน getLiveBudgetExpenses แล้ว)
  const approvedOrgExpenses: Expense[] =
    year !== 2569
      ? []
      : allRequests
          .filter((r) => getStatus(r.id) === "approved" && !r.claimId)
          .map((r) => ({
            year: 2569,
            month: 10,
            title: r.title,
            amount: r.amount,
            fund: r.fund,
          }));

  const liveExpenses = getLiveBudgetExpenses(year);
  const items = [...liveExpenses, ...approvedOrgExpenses];

  const total = yearBudget[year] || 3_000_000;
  const budgetUsed = sum(items.filter((x) => x.fund === "budget"));
  const reserveUsed = reserve.used + sum(items.filter((x) => x.fund === "reserve"));
  const left = Math.max(0, total - budgetUsed);

  const stats = [
    { label: "ใช้ไปทั้งปี", value: fmt(budgetUsed), dark: true },
    { label: "งบสวัสดิการเฉพาะปี", value: fmt(total) },
    { label: "ยอดคงเหลือ", value: fmt(left), note: "ใช้ได้ถึงสิ้นปี" },
    { label: "รออนุมัติ", value: String(calc.pendingCount), unit: "รายการ" },
  ];

  const rows = monthNames.map((_, i) => {
    const list = items.filter((x) => x.month === i);
    return { i, list, used: sum(list) };
  });

  const toggle = (i: number) =>
    setOpen(open.includes(i) ? open.filter((x) => x !== i) : [...open, i]);

  return (
    <div className="w-full space-y-6 font-line-seed-sans-th">
      {/* ส่วนหัวหน้า */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            งบประมาณสวัสดิการ ปี {year}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            ภาพรวมการเบิกจ่ายสวัสดิการและงบประมาณสำรองประจำปีงบประมาณ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="year-select" className="text-sm font-medium text-gray-600">
            เลือกปีงบประมาณ:
          </label>
          <select
            id="year-select"
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setOpen([]);
            }}
            aria-label="เลือกปีงบประมาณ"
            className="cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:border-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#105647]"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                ปี พ.ศ. {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* สรุปงบประมาณ */}
      <Section
        title="สรุปงบประมาณ"
        aside={`${year === 2569 ? "ม.ค. - พ.ย." : "ม.ค. - ธ.ค."} ${year} · พนักงานในระบบ 35 คน`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`rounded-xl p-5 transition-all ${
                s.dark
                  ? "bg-gradient-to-br from-[#10231f] to-[#105647] text-white shadow-md"
                  : "border border-gray-200 bg-white shadow-xs"
              }`}
            >
              <p className={`text-sm ${s.dark ? "text-white/80" : "text-gray-500"}`}>
                {s.label}
              </p>
              <p className="mt-3 text-2xl font-bold tracking-tight">
                {s.value}{" "}
                <span className={`text-sm font-normal ${s.dark ? "text-white/80" : "text-gray-500"}`}>
                  {s.unit ?? "บาท"}
                </span>
              </p>
              {s.note && (
                <p className={`mt-1 text-xs ${s.dark ? "text-white/60" : "text-gray-400"}`}>
                  {s.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* งบสำรองฉุกเฉิน */}
      <Section title="งบสำรองฉุกเฉิน" aside="สำหรับภัยพิบัติและการช่วยเหลือเร่งด่วน">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          <div className="py-2">
            <p className="text-sm text-gray-500">วงเงิน</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {fmt(reserve.limit)} <span className="text-sm font-normal text-gray-500">บาท</span>
            </p>
          </div>
          <div className="py-2">
            <p className="text-sm text-gray-500">ใช้ไป</p>
            <p className="mt-1 text-2xl font-bold text-[#105647]">
              {fmt(reserveUsed)} <span className="text-sm font-normal text-gray-500">บาท</span>
            </p>
          </div>
          <div className="py-2">
            <p className="text-sm text-gray-500">คงเหลือ</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {fmt(Math.max(0, reserve.limit - reserveUsed))}{" "}
              <span className="text-sm font-normal text-gray-500">บาท</span>
            </p>
          </div>
        </div>
      </Section>

      {/* ภาพรวมรายเดือน */}
      <Section title="ภาพรวมรายเดือน" aside="คลิกที่แถวของเดือนเพื่อดูรายการเบิกจ่ายย่อย">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500">
                <th className="py-3 px-2">เดือน</th>
                <th className="py-3 px-2 text-right">จำนวนรายการ</th>
                <th className="py-3 px-2 text-right">วงเงินที่ใช้ (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((m) => {
                const isOpen = open.includes(m.i);
                return (
                  <Fragment key={m.i}>
                    <tr
                      onClick={() => toggle(m.i)}
                      className="cursor-pointer transition hover:bg-gray-50 select-none"
                    >
                      <td className="py-3.5 px-2 font-medium text-gray-900">
                        <span className="flex items-center gap-2">
                          <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform ${
                              isOpen ? "" : "-rotate-90"
                            }`}
                          />
                          {monthNames[m.i]} {year}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right text-gray-600">
                        {m.list.length} รายการ
                      </td>
                      <td className="py-3.5 px-2 text-right font-semibold text-gray-900">
                        {fmt(m.used)}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={3} className="bg-gray-50/80 px-4 py-3 rounded-lg">
                          {m.list.length === 0 ? (
                            <p className="py-3 text-center text-gray-400">
                              ไม่มีรายการเบิกจ่ายในเดือนนี้
                            </p>
                          ) : (
                            <ul className="divide-y divide-gray-200/60">
                              {m.list.map((x, k) => (
                                <li
                                  key={k}
                                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs sm:text-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800">{x.title}</span>
                                    <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-600 shadow-2xs">
                                      {fundName(x.fund)}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-gray-900">
                                    {fmt(x.amount)} บาท
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

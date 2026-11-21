"use client";

import Section from "./Section";
import { reserve, yearBudget } from "@/data/budget";
import { useApprovals } from "./ApprovalProvider";

const fmt = (n: number) => n.toLocaleString("th-TH");

export default function FundSections() {
  const { calc, getStatus, allRequests } = useApprovals();

  const pendingOf = (fund: "budget" | "reserve") => {
    const list = allRequests.filter((r) => r.fund === fund && getStatus(r.id) === "pending");
    return { count: list.length, total: list.reduce((t, r) => t + r.amount, 0) };
  };
  const pb = pendingOf("budget");
  const pr = pendingOf("reserve");

  const totalBudget = yearBudget[2569] || 3_000_000;

  const welfare = [
    ["วงเงิน", totalBudget],
    ["ใช้ไป", calc.budgetUsed],
    ["คงเหลือ", Math.max(0, totalBudget - calc.budgetUsed)],
  ] as const;

  const emergency = [
    ["วงเงิน", reserve.limit],
    ["ใช้ไป", calc.reserveUsed],
    ["คงเหลือ", Math.max(0, reserve.limit - calc.reserveUsed)],
  ] as const;

  return (
    <div className="space-y-4 font-line-seed-sans-th">
      <Section title="งบสวัสดิการ" aside={`รอพิจารณา ${pb.count} รายการ · มูลค่า ${fmt(pb.total)} บาท`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl bg-gradient-to-br from-[#10231f] to-[#105647] p-6 text-center text-white shadow-md">
          {welfare.map(([label, v]) => (
            <div key={label} className="py-2">
              <p className="text-sm text-white/70">{label}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {fmt(v)} <span className="text-sm font-normal text-white/80">บาท</span>
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="งบสำรองฉุกเฉิน" aside={`รอพิจารณา ${pr.count} รายการ · มูลค่า ${fmt(pr.total)} บาท`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {emergency.map(([label, v]) => (
            <div key={label} className="py-2">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {fmt(v)} <span className="text-sm font-normal text-gray-500">บาท</span>
              </p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useApprovals, type Status } from "./ApprovalProvider";

const tabs: { key: Status; label: string }[] = [
  { key: "pending", label: "รออนุมัติ" },
  { key: "approved", label: "อนุมัติแล้ว" },
  { key: "rejected", label: "ไม่อนุมัติ" },
];

export default function ApprovalList() {
  const [tab, setTab] = useState<Status>("pending");
  const { getStatus, decide, allRequests } = useApprovals();

  const count = (s: Status) => allRequests.filter((r) => getStatus(r.id) === s).length;

  // เรียงลำดับ: รายการเร่งด่วนขึ้นก่อน
  const shown = allRequests
    .filter((r) => getStatus(r.id) === tab)
    .sort((a, b) => Number(b.urgent) - Number(a.urgent));

  return (
    <div className="font-line-seed-sans-th">
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`cursor-pointer rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-gray-100 text-gray-900 font-semibold"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            {t.label}{" "}
            <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs text-gray-600 border border-gray-200">
              {count(t.key)}
            </span>
          </button>
        ))}
      </div>

      <ul className="divide-y divide-gray-100">
        {shown.length === 0 && (
          <li className="py-12 text-center text-gray-400">
            <p className="text-base font-medium">ไม่มีรายการในหมวดหมู่นี้</p>
          </li>
        )}
        {shown.map((r) => (
          <li key={r.id} className="flex flex-col sm:flex-row justify-between gap-6 py-5">
            <div className="flex-1 min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 font-medium">
                  {r.type}
                </span>
                {r.fund === "reserve" && (
                  <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 font-medium">
                    งบสำรองฉุกเฉิน
                  </span>
                )}
                {r.urgent && (
                  <span className="rounded-full bg-red-50 px-3 py-1 font-bold text-red-600">
                    เร่งด่วน
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{r.title}</h3>
              <p className="mt-0.5 text-xs text-gray-500">
                {r.empCode ? `รหัสพนักงาน ${r.empCode} · ` : ""}
                ผู้ได้รับผลกระทบ {r.affected} คน · ยื่นเมื่อ {r.date}
              </p>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{r.detail}</p>
            </div>
            <div className="shrink-0 text-left sm:text-right flex sm:flex-col justify-between sm:justify-start items-start sm:items-end">
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {r.amount.toLocaleString("th-TH")}{" "}
                  <span className="text-sm font-normal text-gray-500">บาท</span>
                </p>
              </div>
              {tab === "pending" ? (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => decide(r.id, "approved")}
                    className="cursor-pointer rounded-lg bg-[#105647] hover:bg-[#0c4337] px-4 py-2 text-sm font-medium text-white transition-colors"
                  >
                    อนุมัติ
                  </button>
                  <button
                    onClick={() => decide(r.id, "rejected")}
                    className="cursor-pointer rounded-lg border border-gray-300 hover:bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors"
                  >
                    ไม่อนุมัติ
                  </button>
                </div>
              ) : (
                <p
                  className={`mt-3 text-sm font-semibold ${
                    tab === "approved" ? "text-[#105647]" : "text-red-600"
                  }`}
                >
                  {tab === "approved" ? "✓ อนุมัติแล้ว" : "✕ ไม่อนุมัติ"}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

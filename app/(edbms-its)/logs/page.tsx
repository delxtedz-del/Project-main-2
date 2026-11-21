"use client";

import { useState } from "react";
import { RefreshCw, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import Section from "@/components/Section";
import { useAdmin } from "@/components/AdminProvider";
import { thaiDateTime } from "@/lib/format";

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-xs focus:border-[#105647] focus:outline-hidden focus:ring-2 focus:ring-[#105647]/20";

export default function LogsPage() {
  const { logs, refreshStats } = useAdmin();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const shown = logs.filter((l) => {
    const day = l.at.slice(0, 10);
    const text = `${l.action} ${l.actor} ${l.role} ${l.detail}`.toLowerCase();
    const matchDate = (!from || day >= from) && (!to || day <= to);
    const matchText = text.includes(q.trim().toLowerCase());
    const matchLevel = levelFilter === "all" || l.level === levelFilter;
    return matchDate && matchText && matchLevel;
  });

  const reset = () => {
    setFrom("");
    setTo("");
    setQ("");
    setLevelFilter("all");
    refreshStats?.();
  };

  return (
    <div className="w-full space-y-6 font-line-seed-sans-th">
      {/* ส่วนหัวหน้า */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          บันทึกการใช้งานระบบ
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Audit Trail — ตรวจสอบย้อนหลัง ใคร ทำอะไร เมื่อไหร่ พร้อมเหตุการณ์ความปลอดภัยของระบบ
        </p>
      </div>

      {/* เงื่อนไขการค้นหา */}
      <Section title="เงื่อนไขการค้นหา">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="text-xs font-semibold text-gray-600">
            ตั้งแต่วันที่
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              className={`mt-1.5 ${inputClass}`}
            />
          </label>
          <label className="text-xs font-semibold text-gray-600">
            ถึงวันที่
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              className={`mt-1.5 ${inputClass}`}
            />
          </label>
          <label className="text-xs font-semibold text-gray-600">
            ระดับเหตุการณ์
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              aria-label="เลือกระดับเหตุการณ์"
              className={`mt-1.5 ${inputClass} cursor-pointer`}
            >
              <option value="all">ทั้งหมด</option>
              <option value="normal">ปกติ</option>
              <option value="warning">เฝ้าระวัง (Security)</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-gray-600">
            ค้นหาจากการกระทำ / ผู้ใช้
            <div className="relative mt-1.5">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="เช่น เปลี่ยนสิทธิ์, ปฏิเสธไฟล์, REQ..."
                className={`${inputClass} pr-9`}
              />
              <Search
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </label>
        </div>
      </Section>

      {/* รายการบันทึกการใช้งาน (Audit Trail) */}
      <Section
        title="บันทึกการใช้งาน (Audit Trail)"
        subtitle={`แสดง ${shown.length} รายการจากทั้งหมด ${logs.length} รายการ`}
        aside={
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer"
          >
            <RefreshCw size={14} /> รีเฟรชและล้างตัวกรอง
          </button>
        }
      >
        <ul className="divide-y divide-gray-100">
          {shown.length === 0 && (
            <li className="py-12 text-center text-sm text-gray-400">
              ไม่พบบันทึกการใช้งานที่ตรงกับเงื่อนไขการค้นหา
            </li>
          )}
          {shown.map((l) => (
            <li key={l.id} className="py-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">{l.action}</h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                        l.level === "warning"
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {l.level === "warning" ? (
                        <>
                          <ShieldAlert size={12} /> เฝ้าระวัง
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={12} /> ปกติ
                        </>
                      )}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    ผู้ดำเนินการ: <span className="text-gray-600 font-medium">{l.actor}</span>{" "}
                    ({l.role})
                  </p>
                </div>
                <p className="shrink-0 text-xs text-gray-400">
                  {thaiDateTime(l.at)}
                </p>
              </div>
              <p className="rounded-xl border border-gray-100 bg-gray-50/70 px-3.5 py-2.5 text-xs text-gray-600 font-mono leading-relaxed">
                {l.detail}
              </p>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Save, Check } from "lucide-react";
import Section from "@/components/Section";
import { useAdmin } from "@/components/AdminProvider";
import {
  actionLabels,
  modules,
  positions,
  type ActionKey,
  type PermMap,
} from "@/data/it";

export default function AccessPage() {
  const { perms, savePerms } = useAdmin();
  const [position, setPosition] = useState(positions[0]);
  const [draft, setDraft] = useState<PermMap>(perms[positions[0]] ?? {});
  const [msg, setMsg] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const choose = (p: string) => {
    setPosition(p);
    setDraft(perms[p] ?? {});
    setMsg("");
    setSavedSuccess(false);
  };

  const has = (m: string, a: ActionKey) => (draft[m] ?? []).includes(a);

  const toggle = (m: string, a: ActionKey) => {
    const cur = draft[m] ?? [];
    setDraft({
      ...draft,
      [m]: cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a],
    });
    setMsg("");
    setSavedSuccess(false);
  };

  const save = () => {
    const n = savePerms(position, draft);
    if (n > 0) {
      setMsg(`บันทึกการเปลี่ยนแปลงสิทธิ์ ${n} รายการแล้ว`);
      setSavedSuccess(true);
    } else {
      setMsg("ไม่มีการเปลี่ยนแปลงของสิทธิ์");
      setSavedSuccess(false);
    }
  };

  const clearAll = () => {
    setDraft({});
    setMsg("");
    setSavedSuccess(false);
  };

  return (
    <div className="w-full space-y-6 font-line-seed-sans-th">
      {/* ส่วนหัวหน้า */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          จัดการสิทธิ์การเข้าถึง
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          เลือกตำแหน่งเพื่อกำหนดสิทธิ์การใช้งานแต่ละส่วนของระบบ พนักงานทุกคนที่มีตำแหน่งนั้นจะได้รับสิทธิ์ตามที่ตั้งไว้ทันที
        </p>
      </div>

      <Section title="กำหนดสิทธิ์ตามตำแหน่งงาน">
        <div className="grid gap-8 lg:grid-cols-[19rem_1fr]">
          {/* คอลัมน์ซ้าย: เลือกตำแหน่ง และปุ่มบันทึก */}
          <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <label
                htmlFor="position"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                ตำแหน่งงาน
              </label>
              <select
                id="position"
                value={position}
                onChange={(e) => choose(e.target.value)}
                aria-label="เลือกตำแหน่งงาน"
                className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-xs focus:border-[#105647] focus:outline-hidden focus:ring-2 focus:ring-[#105647]/20"
              >
                {positions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <button
                onClick={save}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#105647] px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#0c4337] transition cursor-pointer"
              >
                <Save size={16} /> บันทึกสิทธิ์
              </button>

              {msg && (
                <div
                  role="status"
                  className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
                    savedSuccess
                      ? "bg-emerald-50 text-[#105647] border border-emerald-200"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {savedSuccess && <Check size={14} />}
                  <span>{msg}</span>
                </div>
              )}
            </div>
          </div>

          {/* คอลัมน์ขวา: ตารางเลือกสิทธิ์ในแต่ละโมดูล */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <p className="text-sm font-bold text-gray-900">
                สิทธิ์การเข้าถึงโมดูล (ตำแหน่ง: {position})
              </p>
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-red-600 hover:underline transition cursor-pointer"
              >
                ล้างการเลือกทั้งหมด
              </button>
            </div>

            <ul className="divide-y divide-gray-100 mt-2">
              {modules.map((m) => (
                <li
                  key={m.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 text-sm"
                >
                  <span className="font-medium text-gray-800">{m.label}</span>
                  <div className="flex flex-wrap gap-4 sm:gap-5">
                    {m.actions.map((a) => (
                      <label
                        key={a}
                        className="flex cursor-pointer items-center gap-2 text-xs text-gray-600 hover:text-gray-900 select-none"
                      >
                        <input
                          type="checkbox"
                          checked={has(m.key, a)}
                          onChange={() => toggle(m.key, a)}
                          className="size-4 rounded-sm border-gray-300 text-[#105647] focus:ring-[#105647] accent-[#105647] cursor-pointer"
                        />
                        {actionLabels[a]}
                      </label>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}

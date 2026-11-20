"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useApprovals } from "./ApprovalProvider";
import Clock from "./Clock";

export default function Header() {
  const { notices, markAllRead } = useApprovals();
  const [open, setOpen] = useState(false);
  const unread = notices.filter((n) => !n.read).length;

  const toggle = () => {
    if (open) markAllRead(); // ปิดแผง = อ่านทั้งหมดแล้ว
    setOpen(!open);
  };

  return (
    <div className="mb-4 flex items-center justify-between font-line-seed-sans-th">
      <Clock showTime className="text-sm text-gray-500 font-medium" />
      <div className="relative">
        <button
          onClick={toggle}
          aria-label="การแจ้งเตือน"
          className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer"
        >
          <Bell size={20} strokeWidth={1.8} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
              {unread}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 z-30 mt-2 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900">การแจ้งเตือน</p>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[#105647] hover:underline cursor-pointer"
                >
                  อ่านทั้งหมดแล้ว
                </button>
              )}
            </div>
            <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
              {notices.length === 0 ? (
                <li className="px-3 py-8 text-center text-sm text-gray-400">
                  ไม่มีการแจ้งเตือนในขณะนี้
                </li>
              ) : (
                notices.map((n, i) => (
                  <li
                    key={i}
                    className={`px-3 py-3 text-sm transition hover:bg-gray-50 ${
                      n.read ? "text-gray-500" : "text-gray-900 font-medium bg-emerald-50/40"
                    }`}
                  >
                    <p>{n.text}</p>
                    <p className="mt-1 text-xs text-gray-400">{n.time}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

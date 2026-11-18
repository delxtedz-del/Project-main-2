"use client";

import React, { useState } from "react";
import { UserMinus, Bell, Search } from "lucide-react";
import { Clock } from "@/components/Clock";

export default function OldEmployeePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-8 md:p-10 max-w-[1440px] mx-auto min-h-screen">
      {/* ส่วนหัว: หัวข้อหน้า และ วันที่/การแจ้งเตือน */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium leading-9 tracking-[0.031em] text-[#0b1e1b]">
              พนักงานเก่า
            </h1>
            <UserMinus className="size-5 text-[#0b1e1b]" />
          </div>
          <p className="text-base font-sans font-thin tracking-tight text-[#0b1e1b] mt-0.5">
            ประวัติและข้อมูลพนักงานที่ลาออกแล้ว
          </p>
        </div>

        {/* วันที่ และ กระดิ่งแจ้งเตือน */}
        <div className="flex items-center gap-3 self-end sm:self-auto text-[#0b1e1b]">
          <Clock className="text-base font-medium leading-6 tracking-wide text-zinc-900 flex items-center mt-[-22.6px]" />
          <button
            type="button"
            title="การแจ้งเตือน"
            className="text-[#0b1e1b] hover:text-black p-1 transition-colors cursor-pointer mt-[-22.6px]"
          >
            <Bell className="size-6" />
          </button>
        </div>
      </div>

      {/* แถบค้นหา */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาพนักงานเก่า..."
            className="w-full bg-white border border-zinc-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-zinc-700 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-teal-800 transition"
          />
        </div>
      </div>

      {/* กล่องแสดงข้อมูล */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="size-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
          <UserMinus className="size-8" />
        </div>
        <p className="text-sm font-medium text-zinc-800">
          ยังไม่มีข้อมูลพนักงานเก่า
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          พนักงานที่มีการลาออกหรือพ้นสภาพจะแสดงในหน้านี้
        </p>
      </div>
    </div>
  );
}

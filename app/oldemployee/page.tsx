"use client";

import React, { useState } from "react";
import { UserMinus, Search } from "lucide-react";
import { Clock } from "@/components/Clock";
import { NotificationBell } from "@/components/notification-bell";

export default function OldEmployeePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-8 md:p-10 max-w-[1440px] mx-auto min-h-screen">
      {/* ส่วนหัว: หัวข้อหน้า และ วันที่/การแจ้งเตือน ตาม Figma */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium leading-9 tracking-[0.031em] text-[#0b1e1b]">
              พนักงานเก่า
            </h1>
            <UserMinus className="size-4 text-zinc-900" />
          </div>
          <p className="text-base font-sans font-thin tracking-tight text-[#0b1e1b] mt-0.5">
            รายชื่อทุกคนในระบบ (0 คน) - ค้นหาได้จากชื่อ ตำแหน่ง รหัสพนักงาน หรืออีเมล
          </p>
        </div>

        {/* วันที่ และ กระดิ่งแจ้งเตือน */}
        <div className="flex items-center gap-3 self-end sm:self-auto text-[#0b1e1b]">
          <Clock className="text-base font-medium leading-6 tracking-wide text-zinc-900 flex items-center mt-[-22.6px]" />
          <NotificationBell />
        </div>
      </div>

      {/* แถบค้นหา */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 ">
        <div className="w-full max-w-[792px] h-11 px-2 flex items-center gap-2.5">
           <Search className="size-5 text-teal-900 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาพนักงานเก่า..."
            className="w-full bg-transparent text-lg font-normal text-zinc-800 placeholder-zinc-500 outline-none"
          />
        </div>
      </div>

      {/* กล่องแสดงข้อมูล */}
      <div className=" flex flex-col items-center justify-center min-h-[300px] text-center">
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

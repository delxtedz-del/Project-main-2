"use client";

import React from "react";
import { User } from "lucide-react";
import { Clock } from "@/components/Clock";
import { NotificationBell } from "@/components/notification-bell";
import { EmployeeDetailView } from "@/components/EmployeeDetailView";

export default function EmployeeProfilePage() {
  return (
    <div className="w-full p-8 md:p-10 max-w-[1440px] mx-auto min-h-screen">
      <div className="w-full">
        {/* ส่วนหัว: หัวข้อหน้า และ วันที่/การแจ้งเตือน */}
        <div className="w-full flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 h-9">
              <h1 className="text-2xl font-medium leading-9 tracking-[0.031em] text-[#0b1e1b]">
                ข้อมูลส่วนตัว
              </h1>
              <User className="size-4 text-[#0b1e1b]" />
            </div>
            <p className="text-base font-sans font-thin tracking-tight text-[#0b1e1b] mt-0.5">
              รายละเอียดข้อมูลพนักงานของผู้ใช้งานที่เข้าสู่ระบบอยู่ในขณะนี้
            </p>
          </div>

          {/* วันที่ และ กระดิ่งแจ้งเตือน */}
          <div className="flex items-center gap-3 h-9 self-end sm:self-auto text-[#0b1e1b]">
            <Clock className="text-base font-medium leading-9 tracking-wide text-zinc-900 flex items-center" />
            <NotificationBell />
          </div>
        </div>

        {/* ดึงข้อมูลจาก localStorage (empCode) และ fetch จาก data/employee.ts อัตโนมัติ */}
        <EmployeeDetailView isOldEmployee={false} />
      </div>
    </div>
  );
}

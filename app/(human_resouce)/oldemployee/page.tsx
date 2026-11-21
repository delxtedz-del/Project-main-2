"use client";

import React, { useState, useEffect, useMemo } from "react";
import { UserMinus, Search } from "lucide-react";
import { Clock } from "@/components/Clock";
import { NotificationBell } from "@/components/notification-bell";
import {
  ExtendedEmployee,
  mockOldEmployeesData,
  toEmployeeCardProps,
} from "@/data/employees";
import { EmployeeCard } from "@/components/EmployeeCard";
import {
  EmployeeDetailData,
  EmployeeDetailView,
} from "@/components/EmployeeDetailView";
import EmployeeModal from "@/components/EmployeeModal";

const OLD_EMPLOYEES_STORAGE_KEY = "edbms-old-employees";

export default function OldEmployeePage() {
  const [employees, setEmployees] =
    useState<ExtendedEmployee[]>(mockOldEmployeesData);
  const [hydrated, setHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<ExtendedEmployee | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // โหลดข้อมูลจาก localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(OLD_EMPLOYEES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          window.requestAnimationFrame(() => {
            setEmployees(parsed);
          });
        }
      }
    } catch {
      /* ignore */
    }
    window.requestAnimationFrame(() => {
      setHydrated(true);
    });
  }, []);

  // บันทึกลง localStorage เมื่อข้อมูลมีการเปลี่ยนแปลง
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        OLD_EMPLOYEES_STORAGE_KEY,
        JSON.stringify(employees)
      );
    } catch {
      /* ignore */
    }
  }, [employees, hydrated]);

  // กรองตามการค้นหา
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.empCode.toLowerCase().includes(q) ||
        emp.position.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q)
      );
    });
  }, [employees, searchQuery]);

  // จัดการการบันทึกเมื่อแก้ไขข้อมูลพนักงานผ่าน Modal
  const handleSaveEmployee = (updatedData: Partial<ExtendedEmployee>) => {
    if (!selectedEmployee) return;
    const updated = { ...selectedEmployee, ...updatedData };
    setSelectedEmployee(updated);
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updated.id ? updated : emp))
    );
  };

  // อัปเดตข้อมูลพนักงานจาก EmployeeDetailView (เช่น เปลี่ยนรูป หรือ เพิ่มโปรเจกต์)
  const handleUpdateEmployeeFromDetail = (updatedData: EmployeeDetailData) => {
    const updated = {
      ...selectedEmployee,
      ...updatedData,
    } as ExtendedEmployee;
    setSelectedEmployee(updated);
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updated.id ? updated : emp))
    );
  };

  return (
    <div className="w-full p-8 md:p-10 max-w-[1440px] mx-auto min-h-screen">
      {selectedEmployee ? (
        /* ================= DETAIL VIEW (ตรงตาม Image 1 & Image 2) ================= */
        <div className="w-full">
          {/* ส่วนหัว: หัวข้อหน้า และ ปุ่มย้อนกลับ / วันที่/การแจ้งเตือน */}
          <div className="w-full flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 h-9">
                <h1 className="text-2xl font-medium leading-9 tracking-[0.031em] text-[#0b1e1b]">
                  พนักงานเก่า
                </h1>
                <UserMinus className="size-4 text-zinc-900" />
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="text-xs text-zinc-400 hover:text-zinc-600 mt-1 flex items-center gap-1 cursor-pointer transition-colors"
              >
                &lt; ย้อนกลับไปหน้าพนักงานเก่า
              </button>
            </div>

            {/* วันที่ และ กระดิ่งแจ้งเตือน */}
            <div className="flex items-center gap-3 h-9 self-end sm:self-auto text-[#0b1e1b]">
              <Clock className="text-base font-medium leading-9 tracking-wide text-zinc-900 flex items-center" />
              <NotificationBell />
            </div>
          </div>

          <EmployeeDetailView
            employee={selectedEmployee}
            isOldEmployee={true}
            onEditClick={() => setIsEditModalOpen(true)}
            onUpdateEmployee={handleUpdateEmployeeFromDetail}
          />
        </div>
      ) : (
        /* ================= LIST VIEW (ตรงตาม PDF Screenshot) ================= */
        <div className="w-full">
          {/* ส่วนหัว: หัวข้อหน้า และ วันที่/การแจ้งเตือน */}
          <div className="w-full flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 h-9">
                <h1 className="text-2xl font-medium leading-9 tracking-[0.031em] text-[#0b1e1b]">
                  พนักงานเก่า
                </h1>
                <UserMinus className="size-4 text-zinc-900" />
              </div>
              <p className="text-base font-sans font-thin tracking-tight text-[#0b1e1b] mt-0.5">
                รายชื่อพนักงานเก่าที่เคยอยู่ในระบบ ({filteredEmployees.length} คน) - ค้นหาได้จากชื่อ ตำแหน่ง รหัสพนักงาน หรืออีเมล
              </p>
            </div>

            {/* วันที่ และ กระดิ่งแจ้งเตือน */}
            <div className="flex items-center gap-3 h-9 self-end sm:self-auto text-[#0b1e1b]">
              <Clock className="text-base font-medium leading-9 tracking-wide text-zinc-900 flex items-center" />
              <NotificationBell />
            </div>
          </div>

          {/* แถบค้นหา */}
          <div className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div className="w-full max-w-[792px] h-11 px-2 flex items-center gap-2.5">
              <Search className="size-5 text-teal-900 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ... "
                className="w-full bg-transparent text-lg font-normal text-zinc-800 placeholder-zinc-500 outline-none"
              />
            </div>
          </div>

          {/* รายการพนักงานเก่า: 3 คอลัมน์ Grid ตาม PDF screenshot */}
          {filteredEmployees.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center min-h-[300px] text-center">
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="cursor-pointer transition-transform hover:-translate-y-0.5"
                >
                  <EmployeeCard employee={toEmployeeCardProps(emp)} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal (ตรงตาม Image 3) */}
      <EmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEmployee}
        initialData={selectedEmployee}
        defaultEmpCode={selectedEmployee?.empCode || "HR-001"}
      />
    </div>
  );
}

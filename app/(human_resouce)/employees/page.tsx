"use client";

import React, { useState, useEffect } from "react";

import { User, Search, Plus, X } from "lucide-react";
import { EmployeeCard } from "@/components/EmployeeCard";
import {
  EmployeeDetailData,
  EmployeeDetailView,
} from "@/components/EmployeeDetailView";
import { Clock } from "@/components/Clock";
import { NotificationBell } from "@/components/notification-bell";
import {
  mockEmployeesData,
  toEmployeeCardProps,
  ExtendedEmployee,
} from "@/data/employees";
import EmployeeModal from "@/components/EmployeeModal";

const STORAGE_KEY = "edbms-employees";

export default function EmployeesPage() {
  const [employees, setEmployees] =
    useState<ExtendedEmployee[]>(mockEmployeesData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ExtendedEmployee[];
        window.requestAnimationFrame(() => {
          setEmployees(parsed);
        });
      }
    } catch {
      /* ignore */
    }
    window.requestAnimationFrame(() => {
      setHydrated(true);
    });
  }, []);

  // บันทึกลง localStorage หลัง hydrate แล้วเท่านั้น เพื่อไม่ทับข้อมูลเดิม
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    } catch {
      /* ignore quota errors */
    }
  }, [employees, hydrated]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<ExtendedEmployee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalEmployee, setModalEmployee] =
    useState<ExtendedEmployee | null>(null);

  // ค้นหาพนักงาน
  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.empCode.toLowerCase().includes(query) ||
      emp.position.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.phone.toLowerCase().includes(query)
    );
  });

  // บันทึกข้อมูลพนักงานจาก EmployeeModal (ทั้งเพิ่มใหม่และแก้ไข)
  const handleSaveEmployee = (empData: Partial<ExtendedEmployee>) => {
    if (empData.id) {
      // โหมดแก้ไขพนักงานที่มีอยู่เดิม
      const updatedList = employees.map((emp) => {
        if (emp.id === empData.id) {
          return { ...emp, ...empData } as ExtendedEmployee;
        }
        return emp;
      });
      setEmployees(updatedList);
      if (selectedEmployee?.id === empData.id) {
        setSelectedEmployee((prev) =>
          prev ? ({ ...prev, ...empData } as ExtendedEmployee) : null,
        );
      }
    } else {
      // โหมดเพิ่มพนักงานใหม่
      const newEmp: ExtendedEmployee = {
        id: Date.now().toString(),
        empCode:
          empData.empCode ||
          `HR-${String(employees.length + 1).padStart(3, "0")}`,
        name: empData.name || "",
        nickname: empData.nickname || "-",
        birthDate: empData.birthDate || "01/01/2543",
        phone: empData.phone || "080-000-0000",
        email:
          empData.email ||
          `${(empData.name || "").replace(/\s+/g, "").toLowerCase()}@company.com`,
        address: empData.address || "กรุงเทพมหานคร",
        emergencyContactName: empData.emergencyContactName,
        emergencyContactPhone: empData.emergencyContactPhone,
        position: empData.position || "เจ้าหน้าที่บริการลูกค้า",
        department: empData.department || "ฝ่ายบริการลูกค้า",
        employmentType: empData.employmentType || "ประจำ",
        status: empData.status || "active",
        startDate: empData.startDate || "01/01/2567",
        skills: empData.skills || ["Customer Service", "Communication"],
        notes: empData.notes || "",
        tenure: empData.tenure || "ทำงานมา 0 ปี 1 เดือน",
        salary: Number(empData.salary) || 30000,
        projects: [],
        avatarUrl: empData.avatarUrl || "",
      };
      setEmployees([newEmp, ...employees]);
    }
  };

  const handleUpdateEmployeeFromDetail = (updatedData: EmployeeDetailData) => {
    const updated = {
      ...selectedEmployee,
      ...updatedData,
    } as ExtendedEmployee;
    setSelectedEmployee(updated);
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updated.id ? updated : emp)),
    );
  };

  return (
    <div className="w-full p-8 md:p-10 max-w-[1440px] mx-auto min-h-screen">
      {selectedEmployee ? (
        /* --- Modal 1: ดูรายละเอียดพนักงานฉบับเต็ม ตาม Figma --- */
        <div className="w-full">
          {/* ส่วนหัว: หัวข้อหน้า และ ปุ่มย้อนกลับ / วันที่/การแจ้งเตือน */}
          <div className="w-full flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 h-9">
                <h1 className="text-2xl font-medium leading-9 tracking-[0.031em] text-[#0b1e1b]">
                  พนักงาน
                </h1>
                <User className="size-4 text-[#0b1e1b]" />
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="text-xs text-zinc-400 hover:text-zinc-600 mt-1 flex items-center gap-1 cursor-pointer transition-colors"
              >
                &lt; ย้อนกลับ
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
            isOldEmployee={false}
            onEditClick={() => {
              setModalEmployee(selectedEmployee);
              setIsAddModalOpen(true);
            }}
            onUpdateEmployee={handleUpdateEmployeeFromDetail}
          />
        </div>
      ) : (
        /* --- หน้ารายการพนักงานปกติ (เมื่อไม่ได้เลือกดูพนักงานรายบุคคล) --- */
        <div className="w-full">
          {/* ส่วนหัว: หัวข้อหน้า และ วันที่/การแจ้งเตือน ตาม Figma */}
          <div className="w-full flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 h-9">
                <h1 className="text-2xl font-medium leading-9 tracking-[0.031em] text-[#0b1e1b]">
                  พนักงาน
                </h1>
                <User className="size-4 text-zinc-900" />
              </div>
              <p className="text-base font-sans font-thin tracking-tight text-[#0b1e1b] mt-0.5">
                รายชื่อทุกคนในระบบ ({filteredEmployees.length} คน) -
                ค้นหาได้จากชื่อ ตำแหน่ง รหัสพนักงาน หรืออีเมล
              </p>
            </div>

            {/* วันที่ และ กระดิ่งแจ้งเตือน */}
            <div className="flex items-center gap-3 h-9 self-end sm:self-auto text-[#0b1e1b]">
              <Clock className="text-base font-medium leading-9 tracking-wide text-zinc-900 flex items-center" />
              <NotificationBell />
            </div>
          </div>

          {/* แถบค้นหา และ ปุ่มเพิ่มพนักงาน ตาม Figma */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 ">
            {/* ช่องค้นหาแบบมีเส้นใต้เงาตาม Figma */}
            <div className="w-full max-w-[792px] h-11 px-2 flex items-center gap-2.5">
              <Search className="size-5 text-teal-900 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหา ... "
                className="w-full bg-transparent text-lg font-normal text-zinc-800 placeholder-zinc-500 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-zinc-400 hover:text-zinc-700"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* ปุ่มเพิ่มพนักงานตาม Figma: w-48 h-12 bg-teal-900 rounded-3xl shadow */}
            <button
              type="button"
              onClick={() => {
                setModalEmployee(null);
                setIsAddModalOpen(true);
              }}
              className="w-48 h-12 bg-teal-900 hover:bg-teal-950 text-white text-xl font-medium  rounded-3xl shadow-[4.5px_4.5px_2.2px_0px_rgba(0,0,0,0.25)] shadow-[inset_1.1px_-2.2px_4.9px_0px_rgba(0,0,0,0.05)] flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Plus className="size-7 stroke-[4.00]" />
              <span>เพิ่มพนักงาน</span>
            </button>
          </div>

          {/* Grid การ์ดพนักงาน 3 คอลัมน์ */}
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200">
              <p className="text-lg text-zinc-500">
                ไม่พบข้อมูลพนักงานที่ตรงกับ &quot;{searchQuery}&quot;
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

      {/* Component สำหรับเพิ่ม/แก้ไขข้อมูลพนักงานตาม Figma */}
      <EmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveEmployee}
        initialData={modalEmployee}
        defaultEmpCode={`HR-${String(employees.length + 1).padStart(3, "0")}`}
      />
    </div>
  );
}

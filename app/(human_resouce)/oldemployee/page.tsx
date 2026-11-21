"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  UserMinus,
  Search,
  Mail,
  Phone,
  Calendar,
  Camera,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { Clock } from "@/components/Clock";
import { NotificationBell } from "@/components/notification-bell";
import {
  ExtendedEmployee,
  mockOldEmployeesData,
  toEmployeeCardProps,
} from "@/data/employees";
import { EmployeeCard } from "@/components/EmployeeCard";
import EmployeeModal from "@/components/EmployeeModal";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/tailgrids/core/avatar";

const OLD_EMPLOYEES_STORAGE_KEY = "edbms-old-employees";

export default function OldEmployeePage() {
  const [employees, setEmployees] =
    useState<ExtendedEmployee[]>(mockOldEmployeesData);
  const [hydrated, setHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<ExtendedEmployee | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<"personal" | "career">(
    "personal"
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");

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

  // จัดการเพิ่มโปรเจกต์
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim() || !selectedEmployee) return;
    const newProj = {
      id: `proj-${Date.now()}`,
      name: newProjectTitle.trim(),
      completed: false,
    };
    const updatedProjects = [...(selectedEmployee.projects || []), newProj];
    const updatedEmp = { ...selectedEmployee, projects: updatedProjects };
    setSelectedEmployee(updatedEmp);
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updatedEmp.id ? updatedEmp : emp))
    );
    setNewProjectTitle("");
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

          {/* Top Card: การ์ดโปรไฟล์หลักด้านบน */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="relative group shrink-0">
                  <Avatar size="xl" className="border border-zinc-200">
                    <AvatarImage
                      src={selectedEmployee.avatarUrl}
                      alt={selectedEmployee.name}
                    />
                    <AvatarFallback className="rounded-2xl text-xl font-medium text-zinc-600 bg-zinc-100">
                      {selectedEmployee.nickname &&
                      selectedEmployee.nickname !== "-"
                        ? selectedEmployee.nickname
                        : selectedEmployee.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* ปุ่มเปลี่ยนรูปโปรไฟล์ */}
                  <label
                    title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์"
                    className="absolute inset-0 rounded-2xl bg-black/45 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-30"
                  >
                    <Camera className="size-5 mb-0.5" />
                    <span className="text-[10px] font-medium">เปลี่ยนรูป</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const newUrl = ev.target?.result as string;
                            if (newUrl) {
                              const updated = {
                                ...selectedEmployee,
                                avatarUrl: newUrl,
                              };
                              setSelectedEmployee(updated);
                              setEmployees((prev) =>
                                prev.map((emp) =>
                                  emp.id === updated.id ? updated : emp
                                )
                              );
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <div>
                  <h2 className="text-2xl font-medium text-[#0b1e1b]">
                    {selectedEmployee.name}
                  </h2>
                  <p className="text-xs text-zinc-400 font-normal mt-0.5">
                    Patipat Srangtan
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="px-3.5 py-1 bg-zinc-100 text-[#0b1e1b] text-xs rounded-full font-thin">
                      {selectedEmployee.department}
                    </span>
                    <span className="px-3.5 py-1 bg-zinc-100 text-[#0b1e1b] text-xs rounded-full font-thin">
                      {selectedEmployee.position}
                    </span>
                    <span className="px-3.5 py-1 bg-[#ffebe8] text-[#e04536] border border-[#f8c2bc] text-xs rounded-full font-thin">
                      ออกแล้ว {selectedEmployee.resignedDate || "22 ตุลาคม 2568"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ปุ่มแก้ไข (เปิด Modal ตาม Image 3) */}
              <div className="self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-5 py-1.5 border border-zinc-200 text-zinc-700 hover:text-zinc-900 text-xs rounded-xl hover:bg-zinc-100 transition cursor-pointer font-normal"
                >
                  แก้ไข
                </button>
              </div>
            </div>

            {/* 3 กล่องย่อยสรุปข้อมูล: อีเมล, เบอร์โทร, อายุงาน */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-100">
              <div className="p-2 rounded-2xl bg-zinc-50/50 border border-zinc-100 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Mail className="size-4 text-zinc-700 shrink-0" />
                  <p className="text-[11px] text-[#0b1e1b] font-thin">อีเมล</p>
                </div>
                <p className="text-xs font-thin text-zinc-800 truncate pl-5.5">
                  {selectedEmployee.email}
                </p>
              </div>

              <div className="p-2 rounded-2xl bg-zinc-50/50 border border-zinc-100 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Phone className="size-4 text-zinc-700 shrink-0" />
                  <p className="text-[11px] text-[#0b1e1b] font-thin">
                    เบอร์โทร
                  </p>
                </div>
                <p className="text-xs font-thin text-zinc-800 truncate pl-5.5">
                  {selectedEmployee.phone}
                </p>
              </div>

              <div className="p-2 rounded-2xl bg-zinc-50/50 border border-zinc-100 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="size-4 text-zinc-700 shrink-0" />
                  <p className="text-[11px] text-[#0b1e1b] font-thin">
                    อายุงาน
                  </p>
                </div>
                <p className="text-xs font-thin text-zinc-800 truncate pl-5.5">
                  {selectedEmployee.tenure}
                </p>
              </div>
            </div>
          </div>

          {/* 3 คอลัมน์ด้านล่าง: ข้อมูลส่วนบุคคล | ลำดับการบริหาร | โปรเจกต์ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* คอลัมน์ 1: ข้อมูลส่วนบุคคล / ประวัติวิชาชีพ */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex items-center justify-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setActiveDetailTab("personal")}
                  className={`px-4 py-1.5 rounded-full text-xs transition cursor-pointer ${
                    activeDetailTab === "personal"
                      ? "bg-[#d1f2dc] text-[#105647] font-thin"
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  ข้อมูลส่วนบุคคล
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDetailTab("career")}
                  className={`px-4 py-1.5 rounded-full text-xs transition cursor-pointer ${
                    activeDetailTab === "career"
                      ? "bg-[#d1f2dc] text-[#105647] font-thin"
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  ประวัติวิชาชีพ
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-sm flex-1 flex flex-col justify-between">
                {activeDetailTab === "personal" ? (
                  <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        ชื่อ-นามสกุล
                      </p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.name}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        ชื่อเล่น
                      </p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.nickname || "-"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        รหัสพนักงาน
                      </p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.empCode}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-zinc-900">
                        วันเกิด
                      </div>
                      <p className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.birthDate || "18/02/2007"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        เบอร์โทร
                      </p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.phone}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">อีเมล</p>
                      <p className="text-xs font-thin text-[#0b1e1b] mt-1 truncate">
                        {selectedEmployee.email}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        ที่อยู่
                      </p>
                      <p className="text-xs font-thin text-[#0b1e1b] mt-1 leading-relaxed">
                        {selectedEmployee.address}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        ติดต่อฉุกเฉิน
                      </p>
                      <p className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.emergencyContactName &&
                        selectedEmployee.emergencyContactName !== "-"
                          ? `${selectedEmployee.emergencyContactName} ${selectedEmployee.emergencyContactPhone ? `(${selectedEmployee.emergencyContactPhone})` : ""}`
                          : selectedEmployee.emergencyContact || "-"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        ตำแหน่ง
                      </p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.position || "-"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">แผนก</p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.department || "-"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        ประเภทจ้างงาน
                      </p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.employmentType || "ประจำ"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        วันที่เริ่มต้นทำงาน
                      </p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.startDate || "01/09/2565"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        อายุงาน
                      </p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.tenure || "2 ปี 2 เดือน"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">สถานะ</p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        ออกแล้ว ({selectedEmployee.resignedDate || "22 ตุลาคม 2568"})
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">ทักษะ</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedEmployee.skills &&
                        selectedEmployee.skills.length > 0 ? (
                          selectedEmployee.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3.5 py-1 bg-zinc-100 text-[#0b1e1b] text-xs rounded-full font-thin"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-thin text-zinc-400">
                            ไม่มีข้อมูลทักษะ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* คอลัมน์ 2: ลำดับการบริหาร (hierarchy) */}
            <div className="lg:col-span-3 flex flex-col">
              <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-sm min-h-[300px] flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-zinc-900 mb-6">
                    ลำดับการบริหาร{" "}
                    <span className="font-thin text-zinc-400 text-xs">
                      (hierarchy)
                    </span>
                  </h3>

                  <div className="relative pl-6 border-l border-zinc-200 ml-2.5 my-6 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-[30px] top-1.5 size-3 rounded-full bg-zinc-300" />
                      <p className="text-xs font-medium text-zinc-900">
                        name surname
                      </p>
                      <p className="text-[11px] text-zinc-400 font-thin mt-0.5">
                        IT Director (ผู้อำนวยการฝ่าย)
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[30px] top-4.5 size-3 rounded-full bg-emerald-500" />
                      <div className="bg-[#ebf8f0] border border-[#d1f2dc] rounded-2xl px-3.5 py-2.5">
                        <div className="flex justify-end -mt-1 -mr-1.5 mb-1">
                          <span className="text-[6px] font-medium bg-white border border-zinc-100 text-zinc-800 px-2.5 py-0.5 rounded-full shadow-2xs truncate">
                            หัวหน้าสายตรง
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-zinc-900 truncate">
                            name surname
                          </p>
                          <p className="text-[11px] text-[#105647] font-medium mt-0.5 truncate">
                            Product Manager (ผู้จัดการ)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[30px] top-2.5 size-3 rounded-full bg-zinc-300" />
                      <p className="text-xs font-medium text-zinc-900">
                        name surname
                      </p>
                      <p className="text-[11px] text-zinc-400 font-thin mt-0.5">
                        QA (ทดสอบระบบซอฟต์แวร์)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100/80">
                  <button
                    type="button"
                    className="text-xs text-zinc-900 hover:text-zinc-600 font-medium text-left cursor-pointer transition"
                  >
                    ดูเพิ่มเติม
                  </button>
                </div>
              </div>
            </div>

            {/* คอลัมน์ 3: โปรเจกต์ */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-sm flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-medium text-zinc-900">
                      โปรเจกต์
                    </h3>
                    <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-500 text-[11px] rounded-full">
                      {selectedEmployee.projects?.length || 0} งาน
                    </span>
                  </div>

                  <form
                    onSubmit={handleAddProject}
                    className="flex items-center gap-2 mb-5"
                  >
                    <input
                      type="text"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      placeholder="งาน / ชื่อ โปรเจกต์"
                      className="font-medium w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2 text-xs text-zinc-700 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-teal-850 transition"
                    />
                    <button
                      type="submit"
                      className="font-medium size-9 bg-[#105647] hover:bg-teal-950 text-white rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition"
                    >
                      <Plus className="size-4" />
                    </button>
                  </form>

                  <div>
                    <p className="text-xs font-medium text-zinc-900 mb-1.5">
                      กำลังดู
                    </p>
                    {(
                      selectedEmployee.projects?.filter((p) => !p.completed) ||
                      []
                    ).length > 0 ? (
                      <ul className="space-y-1.5">
                        {selectedEmployee.projects
                          ?.filter((p) => !p.completed)
                          .map((p) => (
                            <li
                              key={p.id}
                              className="text-xs text-zinc-600 flex items-center gap-2"
                            >
                              <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span className="truncate">{p.name}</span>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="font-medium text-xs text-zinc-400 font-thin">
                        ไม่มีงานที่กำลังดำเนินการอยู่
                      </p>
                    )}
                  </div>

                  <div className="w-full h-[1px] bg-zinc-100 my-4" />

                  <div>
                    <p className="text-xs font-medium text-zinc-900 mb-1.5">
                      เสร็จแล้ว
                    </p>
                    {(
                      selectedEmployee.projects?.filter((p) => p.completed) ||
                      []
                    ).length > 0 ? (
                      <ul className="space-y-1.5">
                        {selectedEmployee.projects
                          ?.filter((p) => p.completed)
                          .map((p) => (
                            <li
                              key={p.id}
                              className="text-xs text-zinc-600 flex items-center gap-2"
                            >
                              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate line-through text-zinc-400 font-thin">
                                {p.name}
                              </span>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-zinc-400 font-thin">
                        ยังไม่มีงานที่เสร็จสมบูรณ์
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-thin pt-4 mt-6">
                  <span>กด Enter เพื่อเพิ่มรายการงาน</span>
                  <span className="text-zinc-500 hover:text-zinc-700 cursor-pointer">
                    + ดึงอย่างง่าย
                  </span>
                </div>
              </div>
            </div>
          </div>
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

"use client";

import React, { useState, useEffect } from "react";

import {
  User,
  Search,
  Plus,
  X,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Camera,
} from "lucide-react";
import { EmployeeCard } from "@/components/EmployeeCard";
import { Clock } from "@/components/Clock";
import { NotificationBell } from "@/components/notification-bell";
import {
  mockEmployeesData,
  toEmployeeCardProps,
  ExtendedEmployee,
} from "@/data/employees";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/tailgrids/core/avatar";
import EmployeeModal from "@/components/EmployeeModal";

const STORAGE_KEY = "edbms-employees";

export default function EmployeesPage() {
  const [employees, setEmployees] =
    useState<ExtendedEmployee[]>(mockEmployeesData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setEmployees(JSON.parse(saved) as ExtendedEmployee[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
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
  const [activeDetailTab, setActiveDetailTab] = useState<"personal" | "career">(
    "personal",
  );
  const [newProjectTitle, setNewProjectTitle] = useState("");
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
          prev ? ({ ...prev, ...empData } as ExtendedEmployee) : null
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

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim() || !selectedEmployee) return;
    const newProj = {
      id: `p-${Date.now()}`,
      name: newProjectTitle.trim(),
      completed: false,
    };
    const updatedProjects = [...(selectedEmployee.projects || []), newProj];
    const updatedEmp = { ...selectedEmployee, projects: updatedProjects };
    setSelectedEmployee(updatedEmp);
    setEmployees(
      employees.map((emp) => (emp.id === updatedEmp.id ? updatedEmp : emp)),
    );
    setNewProjectTitle("");
  };

  return (
    <div className="p-8 md:p-10 max-w-[1440px] mx-auto min-h-screen">
      {selectedEmployee ? (
        /* --- Modal 1: ดูรายละเอียดพนักงานฉบับเต็ม ตาม Figma --- */
        <div>
          {/* ส่วนหัว: หัวข้อหน้า และ ปุ่มย้อนกลับ / วันที่/การแจ้งเตือน */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-3 self-end sm:self-auto text-[#0b1e1b]">
              <Clock className="text-base font-medium leading-6 tracking-wide text-zinc-900 flex items-center mt-[-22.6px]" />
              <NotificationBell />
            </div>
          </div>

          {/* Top Card: การ์ดข้อมูลหลักด้านบน */}
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
                    <AvatarBadge
                      status={
                        selectedEmployee.status === "active" ? "online" : "away"
                      }
                    />
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
                              setEmployees(
                                employees.map((emp) =>
                                  emp.id === updated.id ? updated : emp,
                                ),
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
                  <p className="text-xs text-[#0b1e1b] font-normal mt-0.5">
                    {selectedEmployee.nickname
                      ? `ชื่อเล่น: ${selectedEmployee.nickname}`
                      : "ชื่อภาษาอังกฤษ"}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="px-3.5 py-1 bg-zinc-100 text-[#0b1e1b] text-xs rounded-full font-thin">
                      {selectedEmployee.department}
                    </span>
                    <span className="px-3.5 py-1 bg-zinc-100 text-[#0b1e1b] text-xs rounded-full font-thin">
                      {selectedEmployee.position}
                    </span>
                    <span className="px-3.5 py-1 bg-[#d1f2dc] text-[#0b1e1b] text-xs rounded-full font-thin">
                      ออนไลน์
                    </span>
                  </div>
                </div>
              </div>

              {/* ปุ่มแก้ไข */}
              <div className="self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setModalEmployee(selectedEmployee);
                    setIsAddModalOpen(true);
                  }}
                  className="px-5 py-1.5 border border-zinc-200 text-zinc-700 hover:text-zinc-900 text-xs rounded-xl hover:bg-zinc-200 transition cursor-pointer font-normal"
                >
                  แก้ไข
                </button>
              </div>
            </div>

            {/* 3 กล่องย่อยสรุปข้อมูล: อีเมล, เบอร์โทร, อายุงาน */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-100">
              {/* กล่องที่ 1: อีเมล */}
              <div className="p-2 rounded-2xl bg-zinc-50/50 border border-zinc-100 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Mail className="size-4 text-zinc-700 shrink-0" />
                  <p className="text-[11px] text-[#0b1e1b] font-thin">อีเมล</p>
                </div>
                <p className="text-xs font-thin text-zinc-800 truncate pl-4.5">
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

          {/* 3 คอลัมน์ด้านล่าง */}
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
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4"></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        ชื่อเล่น
                      </p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.nickname || "-"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4"></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        รหัสพนักงาน
                      </p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.empCode}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4"></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-zinc-900">
                        วันเกิด
                      </div>
                      <p className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.birthDate || "18/02/2001"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4"></div>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        เบอร์โทร
                      </p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.phone}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4"></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">อีเมล</p>
                      <p className="text-xs font-thin text-[#0b1e1b] mt-1 truncate">
                        {selectedEmployee.email}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4"></div>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        ที่อยู่
                      </p>
                      <p className="text-xs font-thin text-[#0b1e1b] mt-1 leading-relaxed">
                        {selectedEmployee.address}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4"></div>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        ติดต่อฉุกเฉิน
                      </p>
                      <p className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.emergencyContactName
                          ? `${selectedEmployee.emergencyContactName} ${selectedEmployee.emergencyContactPhone ? `(${selectedEmployee.emergencyContactPhone})` : ""}`
                          : selectedEmployee.emergencyContact || "-"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4"></div>
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
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4"></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">แผนก</p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.department || "-"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4"></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        ประเภทจ้างงาน
                      </p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.employmentType || "ประจำ"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4"></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        วันที่เริ่มต้นทำงาน
                      </p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.startDate || "18/02/2007"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4"></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        อายุงาน
                      </p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.tenure || "2 ปี 2 เดือน"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4"></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-900">สถานะ</p>
                      <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                        {selectedEmployee.status === "active"
                          ? "ออนไลน์"
                          : selectedEmployee.status || "ปกติ"}
                        <div className="w-36 h-[1px] bg-gray-400/5 mt-4"></div>
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
                    <div></div>
                  </div>
                )}
              </div>
            </div>

            {/* คอลัมน์ 2: ลำดับการบริหาร */}
            <div className="lg:col-span-3 flex flex-col">
              <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-sm min-h-[300px] flex flex-col justify-between">
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
                        IT Director (ผู้บริหารสายงาน)
                      </p>
                    </div>

                   <div className="relative">
  <div className="absolute -left-[30px] top-4.5 size-3 rounded-full bg-emerald-500" />
  <div className="bg-[#ebf8f0] border border-[#d1f2dc] rounded-2xl px-3.5 py-2.5">
    {/* แถวบน: ดันป้ายไปชิดขวาสุด */}
    <div className="flex justify-end -mt-1 -mr-1.5 mb-1">
      <span className="text-[6px] font-medium bg-white border border-zinc-100 text-zinc-800 px-2.5 py-0.5 rounded-full shadow-xs truncate">
        หัวหน้าสายตรง
      </span>
    </div>

    {/* แถวล่าง: ชื่อและตำแหน่งยาวได้เต็มความกว้างการ์ด */}
    <div>
      <p className="text-xs font-medium text-zinc-900 truncate">
        {selectedEmployee.name || "name surname"}
      </p>
      <p className="text-[11px] text-[#105647] font-medium mt-0.5 truncate">
        {selectedEmployee.position || "Product Manager (ผู้จัดการ)"}
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
                        QA (ทดสอบผลิตภัณฑ์)
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
                      className="font-medium w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2 text-xs text-zinc-700 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-teal-800 transition"
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
                      ทำอยู่
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
                        ไม่มีสิ่งที่กำลังดำเนินการอยู่
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
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- หน้ารายการพนักงานปกติ (เมื่อไม่ได้เลือกดูพนักงานรายบุคคล) --- */
        <div>
          {/* ส่วนหัว: หัวข้อหน้า และ วันที่/การแจ้งเตือน ตาม Figma */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-3 self-end sm:self-auto text-[#0b1e1b]">
              <Clock className="text-base font-medium leading-6 tracking-wide text-zinc-900 flex items-center mt-[-22.6px]" />
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

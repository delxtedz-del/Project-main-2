"use client";


import React, { useState } from "react";



import {
  User,
  Bell,
  Search,
  Plus,
  X,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { EmployeeCard } from "@/components/EmployeeCard";
import { Clock } from "@/components/Clock";
import {
  mockEmployeesData,
  toEmployeeCardProps,
  ExtendedEmployee,
} from "@/data/employee";

export default function EmployeesPage() {
  const [employees, setEmployees] =
    useState<ExtendedEmployee[]>(mockEmployeesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<ExtendedEmployee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] =
    useState<"personal" | "career">("personal");
  const [newProjectTitle, setNewProjectTitle] = useState("");

  // ฟอร์มสำหรับเพิ่มพนักงานใหม่
  const [formData, setFormData] = useState({
    empCode: `HR-${String(employees.length + 1).padStart(3, "0")}`,
    name: "",
    nickname: "",
    position: "เจ้าหน้าที่บริการลูกค้า",
    department: "ฝ่ายบริการลูกค้า",
    phone: "",
    email: "",
    salary: 30000,
    tenure: "ทำงานมา 0 ปี 1 เดือน",
    startDate: new Date().toLocaleDateString("th-TH"),
    status: "active",
  });

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

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newEmp: ExtendedEmployee = {
      id: Date.now().toString(),
      empCode: formData.empCode,
      name: formData.name,
      nickname: formData.nickname || "-",
      birthDate: "01/01/2543",
      phone: formData.phone || "080-000-0000",
      email: formData.email || `${formData.name.replace(/\s+/g, "").toLowerCase()}@company.com`,
      address: "กรุงเทพมหานคร",
      position: formData.position,
      department: formData.department,
      employmentType: "ประจำ",
      status: formData.status,
      startDate: formData.startDate,
      skills: ["Customer Service", "Communication"],
      tenure: formData.tenure,
      salary: Number(formData.salary),
      projects: [],
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    };

    setEmployees([newEmp, ...employees]);
    setIsAddModalOpen(false);
    setFormData({
      empCode: `HR-${String(employees.length + 2).padStart(3, "0")}`,
      name: "",
      nickname: "",
      position: "เจ้าหน้าที่บริการลูกค้า",
      department: "ฝ่ายบริการลูกค้า",
      phone: "",
      email: "",
      salary: 30000,
      tenure: "ทำงานมา 0 ปี 1 เดือน",
      startDate: new Date().toLocaleDateString("th-TH"),
      status: "active",
    });
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
    setEmployees(employees.map((emp) => (emp.id === updatedEmp.id ? updatedEmp : emp)));
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
              <button
                type="button"
                title="การแจ้งเตือน"
                className="text-[#0b1e1b] hover:text-black p-1 transition-colors cursor-pointer mt-[-22.6px]"
              >
                <Bell className="size-6" />
              </button>
            </div>
          </div>

          {/* Top Card: การ์ดข้อมูลหลักด้านบน */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  {selectedEmployee.avatarUrl ? (
                    <img
                      src={selectedEmployee.avatarUrl}
                      alt={selectedEmployee.name}
                      className="size-20 rounded-2xl object-cover bg-zinc-100 border border-zinc-200"
                    />
                  ) : (
                    <div className="size-20 rounded-2xl bg-zinc-100 flex items-center justify-center text-[#0b1e1b] border border-zinc-200 tracking-wider">
                      <User className="size-10" />
                    </div>
                  )}
                  <span className="size-3.5 bg-emerald-500 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5" />
                </div>

                <div>
                  <h2 className="text-2xl font-medium text-[#0b1e1b]">
                    {selectedEmployee.name}
                  </h2>
                  <p className="text-xs text-[#0b1e1b] font-normal mt-0.5">
                    {selectedEmployee.nickname ? `ชื่อเล่น: ${selectedEmployee.nickname}` : "ชื่อภาษาอังกฤษ"}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="px-3.5 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-full font-normal">
                      {selectedEmployee.department}
                    </span>
                    <span className="px-3.5 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-full font-normal">
                      {selectedEmployee.position}
                    </span>
                    <span className="px-3.5 py-1 bg-[#d1f2dc] text-[#105647] text-xs rounded-full font-medium">
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
                    setFormData({
                      empCode: selectedEmployee.empCode,
                      name: selectedEmployee.name,
                      nickname: selectedEmployee.nickname || "",
                      position: selectedEmployee.position,
                      department: selectedEmployee.department,
                      phone: selectedEmployee.phone,
                      email: selectedEmployee.email,
                      salary: selectedEmployee.salary,
                      tenure: selectedEmployee.tenure,
                      startDate: selectedEmployee.startDate,
                      status: selectedEmployee.status,
                    });
                    setIsAddModalOpen(true);
                  }}
                  className="px-5 py-1.5 border border-zinc-200 text-zinc-700 hover:text-zinc-900 text-xs rounded-xl hover:bg-zinc-50 transition cursor-pointer font-normal"
                >
                  แก้ไข
                </button>
              </div>
            </div>

            {/* 3 กล่องย่อยสรุปข้อมูล: อีเมล, เบอร์โทร, อายุงาน */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-100">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                <div className="p-2 rounded-xl bg-white border border-zinc-100 text-zinc-700 shrink-0">
                  <Mail className="size-4 text-zinc-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-zinc-400">อีเมล</p>
                  <p className="text-xs font-normal text-zinc-800 truncate">{selectedEmployee.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                <div className="p-2 rounded-xl bg-white border border-zinc-100 text-zinc-700 shrink-0">
                  <Phone className="size-4 text-zinc-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-zinc-400">เบอร์โทร</p>
                  <p className="text-xs font-normal text-zinc-800">{selectedEmployee.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                <div className="p-2 rounded-xl bg-white border border-zinc-100 text-zinc-700 shrink-0">
                  <Calendar className="size-4 text-zinc-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-zinc-400">อายุงาน</p>
                  <p className="text-xs font-normal text-zinc-800">{selectedEmployee.tenure}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3 คอลัมน์ด้านล่าง */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* คอลัมน์ 1: ข้อมูลส่วนบุคคล / ประวัติวิชาชีพ */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setActiveDetailTab("personal")}
                  className={`px-4 py-1.5 rounded-full text-xs transition cursor-pointer ${
                    activeDetailTab === "personal"
                      ? "bg-[#d1f2dc] text-[#105647] font-medium"
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
                      ? "bg-[#d1f2dc] text-[#105647] font-medium"
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  ประวัติวิชาชีพ
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-sm min-h-[300px]">
                {activeDetailTab === "personal" ? (
                  <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">ชื่อ-นามสกุล</p>
                      <p className="text-xs text-zinc-400 mt-1">{selectedEmployee.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">ชื่อเล่น</p>
                      <p className="text-xs text-zinc-400 mt-1">{selectedEmployee.nickname || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">รหัสพนักงาน</p>
                      <p className="text-xs text-zinc-400 mt-1">{selectedEmployee.empCode}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">วันเกิด</p>
                      <p className="text-xs text-zinc-400 mt-1">{selectedEmployee.birthDate || "18/02/2001"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">เบอร์โทร</p>
                      <p className="text-xs text-zinc-400 mt-1">{selectedEmployee.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">อีเมล</p>
                      <p className="text-xs text-zinc-400 mt-1 truncate">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">ที่อยู่</p>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{selectedEmployee.address}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">ติดต่อฉุกเฉิน</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {selectedEmployee.emergencyContactName
                          ? `${selectedEmployee.emergencyContactName} ${selectedEmployee.emergencyContactPhone ? `(${selectedEmployee.emergencyContactPhone})` : ""}`
                          : (selectedEmployee.emergencyContact || "-")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-zinc-900 mb-2">ทักษะและความสามารถ</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEmployee.skills?.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-zinc-100 text-zinc-700 text-xs rounded-lg font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900 mb-1">หมายเหตุ</p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {selectedEmployee.notes || "ไม่มีข้อมูลเพิ่มเติม"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* คอลัมน์ 2: ลำดับการบริหาร */}
            <div className="lg:col-span-3">
              <div className="h-[29px] mb-3" />
              <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-sm min-h-[300px] flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 mb-6">
                    ลำดับการบริหาร (Hierarchy)
                  </h3>

                  <div className="relative pl-5 border-l-2 border-dashed border-zinc-200 ml-2 space-y-5">
                    <div className="relative">
                      <div className="absolute -left-[27px] top-1 size-3 rounded-full bg-zinc-300 border-2 border-white" />
                      <p className="text-xs font-medium text-zinc-800">name surname</p>
                      <p className="text-[11px] text-zinc-400">IT Director (ผู้จัดการแผนก)</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[27px] top-4 size-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 border-2 border-white" />
                      <div className="bg-[#d1f2dc]/40 border border-[#d1f2dc] rounded-2xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-zinc-900">{selectedEmployee.name || "name surname"}</p>
                          <p className="text-[11px] text-[#105647] font-medium">{selectedEmployee.position || "Product Manager (ผู้จัดการ)"}</p>
                        </div>
                        <span className="text-[10px] bg-white border border-[#d1f2dc] text-[#105647] px-2 py-0.5 rounded-full font-medium shrink-0">
                          หัวหน้าสายตรง
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[27px] top-1 size-3 rounded-full bg-zinc-300 border-2 border-white" />
                      <p className="text-xs font-medium text-zinc-800">name surname</p>
                      <p className="text-[11px] text-zinc-400">QA (ทดสอบซอฟต์แวร์)</p>
                    </div>
                  </div>
                </div>

                <button type="button" className="text-xs text-zinc-500 hover:text-zinc-800 font-medium pt-4 text-left cursor-pointer">
                  ดูเพิ่มเติม
                </button>
              </div>
            </div>

            {/* คอลัมน์ 3: โปรเจกต์ */}
            <div className="lg:col-span-4">
              <div className="h-[29px] mb-3" />
              <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-sm min-h-[300px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-zinc-900">โปรเจกต์</h3>
                    <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-500 text-[11px] rounded-full">
                      {(selectedEmployee.projects?.length || 0)} งาน
                    </span>
                  </div>

                  <form onSubmit={handleAddProject} className="flex items-center gap-2 mb-4">
                    <input
                      type="text"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      placeholder="งาน / ชื่อโปรเจกต์"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-700 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-teal-800"
                    />
                    <button
                      type="submit"
                      className="size-8 bg-[#105647] hover:bg-teal-950 text-white rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition"
                    >
                      <Plus className="size-4" />
                    </button>
                  </form>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-zinc-800 mb-1.5">ทำอยู่</p>
                    {(selectedEmployee.projects?.filter((p) => !p.completed) || []).length > 0 ? (
                      <ul className="space-y-1">
                        {selectedEmployee.projects
                          ?.filter((p) => !p.completed)
                          .map((p) => (
                            <li key={p.id} className="text-xs text-zinc-600 flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span className="truncate">{p.name}</span>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-zinc-400">ไม่มีงานที่กำลังดำเนินการอยู่</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-zinc-800 mb-1.5">เสร็จแล้ว</p>
                    {(selectedEmployee.projects?.filter((p) => p.completed) || []).length > 0 ? (
                      <ul className="space-y-1">
                        {selectedEmployee.projects
                          ?.filter((p) => p.completed)
                          .map((p) => (
                            <li key={p.id} className="text-xs text-zinc-600 flex items-center gap-1.5">
                              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate line-through text-zinc-400">{p.name}</span>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-zinc-400">ยังไม่มีงานที่เสร็จสมบูรณ์</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-3 border-t border-zinc-100 mt-4">
                  <span>กด Enter เพื่อเพิ่มรายการงาน</span>
                  <span className="text-zinc-600 font-medium cursor-pointer">+ ดึงต่องาน</span>
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
              <button
                type="button"
                title="การแจ้งเตือน"
                className="text-zinc-600 hover:text-black p-1 transition-colors cursor-pointer mt-[-22.6px]"
              >
                <Bell className="size-6" />
              </button>
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
              onClick={() => setIsAddModalOpen(true)}
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

      {/* --- Modal 2: ฟอร์มเพิ่มพนักงานใหม่ --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-zinc-200 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 p-1 rounded-full hover:bg-zinc-100 transition"
            >
              <X className="size-5" />
            </button>

            <h2 className="text-xl font-bold text-zinc-900 mb-1">
              เพิ่มพนักงานใหม่
            </h2>
            <p className="text-xs text-zinc-500 mb-4">
              กรอกข้อมูลเพื่อบันทึกพนักงานเข้าสู่ระบบ EDBMS
            </p>

            <form onSubmit={handleAddEmployee} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    รหัสพนักงาน
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.empCode}
                    onChange={(e) =>
                      setFormData({ ...formData, empCode: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    ชื่อเล่น
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) =>
                      setFormData({ ...formData, nickname: e.target.value })
                    }
                    placeholder="เช่น เปอร์"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="เช่น นาย ปฏิพัทธ์ สร้างตั้น"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    ตำแหน่ง
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    แผนก / ฝ่าย
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="08X-XXX-XXXX"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@company.com"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-800"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-900 text-white rounded-xl hover:bg-teal-950 font-medium transition cursor-pointer"
                >
                  บันทึกพนักงาน
                </button>
                
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
  MapPin,
  Calendar,
  Briefcase,
  Award,
  CheckCircle2,
} from "lucide-react";
import { EmployeeCard } from "@/components/EmployeeCard";
import { Clock } from "@/components/Clock";
import {
  mockEmployeesData,
  toEmployeeCardProps,
  ExtendedEmployee,
} from "@/data/employees";

export default function EmployeesPage() {
  const [employees, setEmployees] =
    useState<ExtendedEmployee[]>(mockEmployeesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<ExtendedEmployee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  return (
    <div className="p-8 md:p-10 max-w-[1440px] mx-auto min-h-screen">
      {/* ส่วนหัว: หัวข้อหน้า และ วันที่/การแจ้งเตือน ตาม Figma */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold leading-9 tracking-tight text-zinc-900">
              พนักงาน
            </h1>
            <User className="size-4 text-zinc-900" />
          </div>
          <p className="text-base font-normal leading-6 tracking-tight text-teal-900/80 mt-0.5">
            รายชื่อทุกคนในระบบ ({filteredEmployees.length} คน) -
            ค้นหาได้จากชื่อ ตำแหน่ง รหัสพนักงาน หรืออีเมล
          </p>
        </div>

        {/* วันที่ และ กระดิ่งแจ้งเตือน */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Clock className="text-xl font-bold leading-6 tracking-wide text-teal-950 flex items-center" />
          <button
            title="การแจ้งเตือน"
            className="text-zinc-800 hover:text-black p-1 transition-colors cursor-pointer"
          >
            <Bell className="size-6" />
          </button>
        </div>
      </div>

      {/* แถบค้นหา และ ปุ่มเพิ่มพนักงาน ตาม Figma */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
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
              onClick={() => setSearchQuery("")}
              className="text-zinc-400 hover:text-zinc-700"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* ปุ่มเพิ่มพนักงานตาม Figma: w-48 h-12 bg-teal-900 rounded-3xl shadow */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-48 h-12 bg-teal-900 hover:bg-teal-950 text-white text-xl font-bold rounded-3xl shadow-[4.5px_4.5px_2.2px_0px_rgba(0,0,0,0.25)] shadow-[inset_1.1px_-2.2px_4.9px_0px_rgba(0,0,0,0.05)] flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="size-5" />
          <span>เพิ่มพนักงาน</span>
        </button>
      </div>

      {/* Grid การ์ดพนักงาน 3 คอลัมน์ */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200">
          <p className="text-lg text-zinc-500">
            ไม่พบข้อมูลพนักงานที่ตรงกับ "{searchQuery}"
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

      {/* --- Modal 1: ดูรายละเอียดพนักงานฉบับเต็ม --- */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-zinc-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 p-1 rounded-full hover:bg-zinc-100 transition"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-start gap-4 mb-6">
              {selectedEmployee.avatarUrl ? (
                <img
                  src={selectedEmployee.avatarUrl}
                  alt={selectedEmployee.name}
                  className="size-16 rounded-2xl object-cover shrink-0 bg-zinc-100 border border-zinc-200"
                />
              ) : (
                <div className="size-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-zinc-400">
                  <User className="size-8" />
                </div>
              )}
              <div>
                <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full">
                  {selectedEmployee.empCode}
                </span>
                <h2 className="text-xl font-bold text-zinc-900 mt-1">
                  {selectedEmployee.name}
                </h2>
                <p className="text-sm text-zinc-500">
                  {selectedEmployee.position} • {selectedEmployee.department}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t border-zinc-100 pt-4 text-sm">
              <div className="flex items-center gap-3 text-zinc-700">
                <Briefcase className="size-4 text-teal-800 shrink-0" />
                <span>อายุงาน: {selectedEmployee.tenure}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-700">
                <Calendar className="size-4 text-teal-800 shrink-0" />
                <span>วันที่เริ่มงาน: {selectedEmployee.startDate}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-700">
                <Phone className="size-4 text-teal-800 shrink-0" />
                <span>เบอร์โทร: {selectedEmployee.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-700">
                <Mail className="size-4 text-teal-800 shrink-0" />
                <span>อีเมล: {selectedEmployee.email}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-700">
                <MapPin className="size-4 text-teal-800 shrink-0" />
                <span>ที่อยู่: {selectedEmployee.address}</span>
              </div>

              {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-zinc-500 mb-2">
                    ทักษะและความสามารถ:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEmployee.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-zinc-100 text-zinc-700 text-xs rounded-lg font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-5 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition"
              >
                ปิด
              </button>
            </div>
          </div>
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

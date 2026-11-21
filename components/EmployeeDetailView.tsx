"use client";

import React, { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Calendar,
  Camera,
  Plus,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/tailgrids/core/avatar";
import { EmployeeProject, fetchEmployeeByCode } from "@/data/employee";

export interface EmployeeDetailData {
  id: string;
  empCode: string;
  name: string;
  nickname?: string;
  birthDate?: string;
  phone: string;
  email: string;
  address?: string;
  position: string;
  department: string;
  employmentType?: string;
  status: string;
  startDate?: string;
  skills?: string[];
  tenure: string;
  salary?: number;
  systemRole?: string;
  systemRoleLevel?: number;
  projects?: EmployeeProject[];
  avatarUrl?: string;
  resignedDate?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContact?: string;
}

export interface EmployeeDetailViewProps {
  /** ส่งข้อมูลพนักงานเข้ามาโดยตรง (ถ้าไม่ส่ง จะดึง user.empCode จาก localStorage แล้ว fetch จาก data/employee.ts) */
  employee?: EmployeeDetailData | null;
  /** กำหนด empCode เอง (ถ้าไม่ส่ง จะอ่านจาก localStorage) */
  empCode?: string;
  /** เงื่อนไขพนักงานเก่า: true = แสดงป้าย "ออกแล้ว 22 ตุลาคม 2568" แบบเทนารี (? ... : null) */
  isOldEmployee?: boolean;
  /** Callback เมื่อกดปุ่มแก้ไข */
  onEditClick?: () => void;
  /** Callback เมื่อมีการอัปเดตข้อมูลภายใน component (เช่น เปลี่ยนรูป หรือ เพิ่มโปรเจกต์) */
  onUpdateEmployee?: (updated: EmployeeDetailData) => void;
}

function getEmpCodeFromLocalStorage(): string | null {
  if (typeof window === "undefined") return null;

  const storageKeys = ["credential", "currentUser", "user"];
  for (const key of storageKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { empCode?: string; empcode?: string };
      const code = parsed?.empCode || parsed?.empcode;
      if (code && typeof code === "string") {
        return code;
      }
    } catch {
      // ignore invalid JSON
    }
  }
  return null;
}

async function fetchEmployeeWithRetry(empCode: string, retries = 3) {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchEmployeeByCode(empCode);
    } catch (err) {
      lastError = err;
      if (err === "ไม่พบข้อมูลพนักงาน") {
        throw err;
      }
    }
  }
  throw lastError;
}

export function EmployeeDetailView({
  employee: externalEmployee,
  empCode: propEmpCode,
  isOldEmployee,
  onEditClick,
  onUpdateEmployee,
}: EmployeeDetailViewProps) {
  const [fetchedEmployee, setFetchedEmployee] =
    useState<EmployeeDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(!externalEmployee);
  const [error, setError] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<"personal" | "career">(
    "personal"
  );
  const [newProjectTitle, setNewProjectTitle] = useState("");

  useEffect(() => {
    if (externalEmployee) {
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    const targetEmpCode = propEmpCode || getEmpCodeFromLocalStorage();

    if (!targetEmpCode) {
      setLoading(false);
      setError("ไม่พบรหัสพนักงาน (empCode) ใน localStorage");
      return;
    }

    setLoading(true);
    setError(null);

    fetchEmployeeWithRetry(targetEmpCode)
      .then((data) => {
        if (!active) return;
        setFetchedEmployee(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          typeof err === "string" ? err : "ไม่สามารถดึงข้อมูลพนักงานได้"
        );
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [externalEmployee, propEmpCode]);

  const employee = externalEmployee ?? fetchedEmployee;

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-zinc-200/80 p-12 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="size-6 animate-spin text-[#105647]" />
        <p className="text-xs">กำลังโหลดข้อมูลพนักงาน...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="bg-white rounded-3xl border border-zinc-200/80 p-12 text-center text-zinc-500">
        <p className="text-sm font-medium text-zinc-800">
          {error || "ไม่พบข้อมูลพนักงาน"}
        </p>
      </div>
    );
  }

  const showOldEmployeeStatus =
    isOldEmployee ??
    (employee.status === "resigned" || Boolean(employee.resignedDate));

  const updateEmployeeState = (updated: EmployeeDetailData) => {
    if (!externalEmployee) {
      setFetchedEmployee(updated);
    }
    onUpdateEmployee?.(updated);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    const newProj: EmployeeProject = {
      id: `proj-${Date.now()}`,
      name: newProjectTitle.trim(),
      completed: false,
    };
    const updatedProjects = [...(employee.projects || []), newProj];
    updateEmployeeState({ ...employee, projects: updatedProjects });
    setNewProjectTitle("");
  };

  return (
    <>
      {/* Top Card: การ์ดโปรไฟล์หลักด้านบน */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <Avatar size="xl" className="border border-zinc-200">
                <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                <AvatarFallback className="rounded-2xl text-xl font-medium text-zinc-600 bg-zinc-100">
                  {employee.nickname && employee.nickname !== "-"
                    ? employee.nickname
                    : employee.name.slice(0, 2)}
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
                          updateEmployeeState({
                            ...employee,
                            avatarUrl: newUrl,
                          });
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
                {employee.name}
              </h2>
              <p className="text-xs text-zinc-400 font-normal mt-0.5">
                {employee.empCode}
                {employee.systemRole ? ` • ${employee.systemRole}` : ""}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="px-3.5 py-1 bg-zinc-100 text-[#0b1e1b] text-xs rounded-full font-thin">
                  {employee.department}
                </span>
                <span className="px-3.5 py-1 bg-zinc-100 text-[#0b1e1b] text-xs rounded-full font-thin">
                  {employee.position}
                </span>
                {showOldEmployeeStatus ? (
                  <span className="px-3.5 py-1 bg-[#ffebe8] text-[#e04536] border border-[#f8c2bc] text-xs rounded-full font-thin">
                    ออกแล้ว {employee.resignedDate || "22 ตุลาคม 2568"}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* ปุ่มแก้ไข */}
          {onEditClick ? (
            <div className="self-start md:self-auto">
              <button
                type="button"
                onClick={onEditClick}
                className="px-5 py-1.5 border border-zinc-200 text-zinc-700 hover:text-zinc-900 text-xs rounded-xl hover:bg-zinc-100 transition cursor-pointer font-normal"
              >
                แก้ไข
              </button>
            </div>
          ) : null}
        </div>

        {/* 3 กล่องย่อยสรุปข้อมูล: อีเมล, เบอร์โทร, อายุงาน */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-100">
          <div className="p-2 rounded-2xl bg-zinc-50/50 border border-zinc-100 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Mail className="size-4 text-zinc-700 shrink-0" />
              <p className="text-[11px] text-[#0b1e1b] font-thin">อีเมล</p>
            </div>
            <p className="text-xs font-thin text-zinc-800 truncate pl-5.5">
              {employee.email}
            </p>
          </div>

          <div className="p-2 rounded-2xl bg-zinc-50/50 border border-zinc-100 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Phone className="size-4 text-zinc-700 shrink-0" />
              <p className="text-[11px] text-[#0b1e1b] font-thin">เบอร์โทร</p>
            </div>
            <p className="text-xs font-thin text-zinc-800 truncate pl-5.5">
              {employee.phone}
            </p>
          </div>

          <div className="p-2 rounded-2xl bg-zinc-50/50 border border-zinc-100 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="size-4 text-zinc-700 shrink-0" />
              <p className="text-[11px] text-[#0b1e1b] font-thin">อายุงาน</p>
            </div>
            <p className="text-xs font-thin text-zinc-800 truncate pl-5.5">
              {employee.tenure}
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
                    {employee.name}
                    <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-900">ชื่อเล่น</p>
                  <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                    {employee.nickname || "-"}
                    <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-900">
                    รหัสพนักงาน
                  </p>
                  <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                    {employee.empCode}
                    <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-zinc-900">
                    วันเกิด
                  </div>
                  <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                    {employee.birthDate || "-"}
                    <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-900">เบอร์โทร</p>
                  <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                    {employee.phone}
                    <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-900">อีเมล</p>
                  <div className="text-xs font-thin text-[#0b1e1b] mt-1 truncate">
                    {employee.email}
                    <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-900">ที่อยู่</p>
                  <div className="text-xs font-thin text-[#0b1e1b] mt-1 leading-relaxed">
                    {employee.address || "-"}
                    <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-900">
                    ติดต่อฉุกเฉิน
                  </p>
                  <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                    {employee.emergencyContactName &&
                    employee.emergencyContactName !== "-"
                      ? `${employee.emergencyContactName} ${
                          employee.emergencyContactPhone
                            ? `(${employee.emergencyContactPhone})`
                            : ""
                        }`
                      : employee.emergencyContact || "-"}
                    <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                <div>
                  <p className="text-xs font-medium text-zinc-900">ตำแหน่ง</p>
                  <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                    {employee.position || "-"}
                    <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-900">แผนก</p>
                  <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                    {employee.department || "-"}
                    <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-900">
                    ประเภทจ้างงาน
                  </p>
                  <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                    {employee.employmentType || "ประจำ"}
                    <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-900">
                    วันที่เริ่มต้นทำงาน
                  </p>
                  <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                    {employee.startDate || "-"}
                    <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-900">อายุงาน</p>
                  <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                    {employee.tenure || "-"}
                    <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-900">สถานะ</p>
                  <div className="text-xs font-thin text-[#0b1e1b] mt-1">
                    {showOldEmployeeStatus
                      ? `ออกแล้ว (${employee.resignedDate || "22 ตุลาคม 2568"})`
                      : employee.status === "active"
                        ? "ออนไลน์"
                        : employee.status || "ปกติ"}
                    <div className="w-36 h-[1px] bg-gray-400/5 mt-4" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-900">ทักษะ</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {employee.skills && employee.skills.length > 0 ? (
                      employee.skills.map((skill, index) => (
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
                    {employee.name}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-thin mt-0.5">
                    {employee.position}
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
                <h3 className="text-sm font-medium text-zinc-900">โปรเจกต์</h3>
                <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-500 text-[11px] rounded-full">
                  {employee.projects?.length || 0} งาน
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
                {(employee.projects?.filter((p) => !p.completed) || [])
                  .length > 0 ? (
                  <ul className="space-y-1.5">
                    {employee.projects
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
                {(employee.projects?.filter((p) => p.completed) || []).length >
                0 ? (
                  <ul className="space-y-1.5">
                    {employee.projects
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
    </>
  );
}

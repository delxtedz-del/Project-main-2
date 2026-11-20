"use client";

import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { ExtendedEmployee } from "@/data/employees";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/tailgrids/core/avatar";

export interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeData: Partial<ExtendedEmployee>) => void;
  initialData?: ExtendedEmployee | null;
  defaultEmpCode?: string;
}

export default function EmployeeModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultEmpCode = "HR-001",
}: EmployeeModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    empCode: defaultEmpCode,
    name: "",
    nickname: "",
    birthDate: "",
    phone: "",
    email: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    position: "เจ้าหน้าที่บริการลูกค้า",
    department: "ฝ่ายบริการลูกค้า",
    employmentType: "ประจำ",
    status: "active",
    startDate: "",
    skillsString: "",
    notes: "",
    salary: 30000,
    tenure: "ทำงานมา 0 ปี 1 เดือน",
    avatarUrl: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || "",
        empCode: initialData.empCode || defaultEmpCode,
        name: initialData.name || "",
        nickname: initialData.nickname || "",
        birthDate: initialData.birthDate || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        address: initialData.address || "",
        emergencyContactName:
          initialData.emergencyContactName ||
          initialData.emergencyContact ||
          "",
        emergencyContactPhone: initialData.emergencyContactPhone || "",
        position: initialData.position || "เจ้าหน้าที่บริการลูกค้า",
        department: initialData.department || "ฝ่ายบริการลูกค้า",
        employmentType: initialData.employmentType || "ประจำ",
        status: initialData.status || "active",
        startDate: initialData.startDate || "",
        skillsString: initialData.skills ? initialData.skills.join(", ") : "",
        notes: initialData.notes || "",
        salary: initialData.salary || 30000,
        tenure: initialData.tenure || "ทำงานมา 0 ปี 1 เดือน",
        avatarUrl: initialData.avatarUrl || "",
      });
    } else {
      setFormData({
        id: "",
        empCode: defaultEmpCode,
        name: "",
        nickname: "",
        birthDate: "",
        phone: "",
        email: "",
        address: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        position: "เจ้าหน้าที่บริการลูกค้า",
        department: "ฝ่ายบริการลูกค้า",
        employmentType: "ประจำ",
        status: "active",
        startDate: "",
        skillsString: "",
        notes: "",
        salary: 30000,
        tenure: "ทำงานมา 0 ปี 1 เดือน",
        avatarUrl: "",
      });
    }
  }, [initialData, defaultEmpCode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const skillsArray = formData.skillsString
      ? formData.skillsString
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    onSave({
      id: formData.id || undefined,
      empCode: formData.empCode,
      name: formData.name,
      nickname: formData.nickname || "-",
      birthDate: formData.birthDate || "01/01/2543",
      phone: formData.phone || "080-000-0000",
      email:
        formData.email ||
        `${formData.name.replace(/\s+/g, "").toLowerCase()}@company.com`,
      address: formData.address || "กรุงเทพมหานคร",
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone,
      position: formData.position,
      department: formData.department,
      employmentType: formData.employmentType,
      status: formData.status,
      startDate: formData.startDate || "01/01/2567",
      skills: skillsArray,
      notes: formData.notes,
      salary: Number(formData.salary) || 30000,
      tenure: formData.tenure,
      avatarUrl: formData.avatarUrl,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-2xl p-7 md:p-8 relative max-h-[92vh] flex flex-col shadow-2xl">
        {/* หัวข้อและปุ่มปิด X ด้านบนขวา */}
        <div className="flex items-start justify-between pb-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              รายชื่อบุคลากร
            </h2>
            <p className="text-xs text-zinc-900 font-medium mt-1">
              อัปเดตข้อมูลพนักงาน — การเปลี่ยนแปลงจะปรากฏให้เห็นทั่วทั้งสารบบ
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 p-1 rounded-full hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ฟอร์มกรอกข้อมูลตาม Figma */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 overflow-y-auto pr-2 mt-2"
        >
          {/* ส่วนอัปโหลดรูปโปรไฟล์ */}
          <div className="flex items-center gap-4 p-3 bg-zinc-50/70 rounded-2xl border border-zinc-200/80">
            <Avatar size="lg" className="shrink-0 border border-zinc-200 bg-white">
              <AvatarImage src={formData.avatarUrl} alt="Preview" />
              <AvatarFallback className="rounded-2xl text-sm font-medium text-zinc-500 bg-zinc-100">
                {formData.nickname || formData.name.slice(0, 2) || "รูป"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 mb-1">
                รูปโปรไฟล์พนักงาน
              </p>
              <div className="flex items-center gap-2">
                <label className="px-3.5 py-1.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-xs font-medium hover:bg-zinc-100 cursor-pointer transition flex items-center gap-1.5 shadow-2xs">
                  <Upload className="size-3.5 text-zinc-600" />
                  <span>
                    {formData.avatarUrl
                      ? "เปลี่ยนรูป..."
                      : "เลือกรูปจากเครื่อง..."}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            setFormData((prev) => ({
                              ...prev,
                              avatarUrl: ev.target!.result as string,
                            }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                {formData.avatarUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, avatarUrl: "" }))
                    }
                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer underline ml-2"
                  >
                    ลบรูป
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* กลุ่ม: ข้อมูลส่วนตัว */}
          <div>
            <h3 className="text-xs font-medium text-zinc-900 mb-3">
              ข้อมูลส่วนตัว
            </h3>

            {/* ชื่อ-นามสกุล (เต็มแถว) */}
            <div className="mb-3.5">
              <label className="block text-xs font-medium text-zinc-900 mb-1.5">
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
                className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
              />
            </div>

            {/* ชื่อเล่น และ รหัสพนักงาน */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-900 mb-1.5">
                  ชื่อเล่น
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) =>
                    setFormData({ ...formData, nickname: e.target.value })
                  }
                  placeholder="เช่น เปอร์"
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-900 mb-1.5">
                  รหัสพนักงาน
                </label>
                <input
                  type="text"
                  value={formData.empCode}
                  onChange={(e) =>
                    setFormData({ ...formData, empCode: e.target.value })
                  }
                  placeholder="HR-001"
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
                />
              </div>
            </div>

            {/* วันเกิด และ โทรศัพท์ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-900 mb-1.5">
                  วันเกิด
                </label>
                <input
                  type="text"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthDate: e.target.value })
                  }
                  placeholder="เช่น 15/05/2542"
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-900 mb-1.5">
                  โทรศัพท์
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="เช่น 095-332-1213"
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
                />
              </div>
            </div>

            {/* อีเมล และ ที่อยู่ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-900 mb-1.5">
                  อีเมล
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="patipat@example.com"
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-900 mb-1.5">
                  ที่อยู่
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="เช่น กรุงเทพมหานคร"
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
                />
              </div>
            </div>

            {/* ผู้ติดต่อในกรณีฉุกเฉิน และ โทรศัพท์ฉุกเฉิน */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-900 mb-1.5">
                  ผู้ติดต่อในกรณีฉุกเฉิน
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContactName: e.target.value,
                    })
                  }
                  placeholder="เช่น สมใจ สร้างตั้น"
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-900 mb-1.5">
                  โทรศัพท์ฉุกเฉิน
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContactPhone: e.target.value,
                    })
                  }
                  placeholder="เช่น 089-876-5432"
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
                />
              </div>
            </div>
          </div>

          {/* กลุ่ม: การจ้างงาน */}
          <div>
            <h3 className="text-xs font-medium text-zinc-900 mb-3">
              การจ้างงาน
            </h3>

            {/* ตำแหน่ง และ แผนก */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-900 mb-1.5">
                  ตำแหน่ง
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  placeholder="เช่น เจ้าหน้าที่บริการลูกค้า"
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-900 mb-1.5">
                  แผนก
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="เช่น ฝ่ายบริการลูกค้า"
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
                />
              </div>
            </div>

            {/* ประเภทการจ้างงาน และ สถานะ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-900 mb-1.5">
                  ประเภทการจ้างงาน
                </label>
                <input
                  type="text"
                  value={formData.employmentType}
                  onChange={(e) =>
                    setFormData({ ...formData, employmentType: e.target.value })
                  }
                  placeholder="เช่น ประจำ"
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-900 mb-1.5">
                  สถานะ
                </label>
                <input
                  type="text"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  placeholder="เช่น active หรือ ออนไลน์"
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
                />
              </div>
            </div>

            {/* วันที่เริ่มต้น */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-900 mb-1.5">
                  วันที่เริ่มต้น
                </label>
                <input
                  type="text"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  placeholder="เช่น 18/02/2007"
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
                />
              </div>
              <div />
            </div>

            {/* ทักษะ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-900 mb-1.5">
                  ทักษะ (คั่นด้วยเครื่องหมายจุลภาค ,)
                </label>
                <input
                  type="text"
                  value={formData.skillsString}
                  onChange={(e) =>
                    setFormData({ ...formData, skillsString: e.target.value })
                  }
                  placeholder="เช่น ดูแลลูกค้า, ภาษาอังกฤษ, CRM"
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
                />
              </div>
              <div />
            </div>
          </div>

          {/* กลุ่ม: หมายเหตุ */}
          <div>
            <h3 className="text-xs font-medium text-zinc-900 mb-2">
              หมายเหตุ
            </h3>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="กรอกข้อมูลเพิ่มเติมหรือหมายเหตุเกี่ยวกับพนักงาน..."
              className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#105647] transition"
            />
          </div>

          {/* ปุ่มบันทึก & ยกเลิก */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-zinc-200 text-zinc-700 text-xs rounded-2xl hover:bg-zinc-100 transition cursor-pointer font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#105647] hover:bg-teal-950 text-white text-xs rounded-2xl font-medium transition cursor-pointer shadow-sm"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

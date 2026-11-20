"use client";

import React, { useState, useEffect } from "react";
import {
  PaymentRequestItem,
  getLivePaymentRequests,
  addPaymentRequest,
} from "@/data/finance";
import { Search, Plus, X, HeartHandshake, Layers, CheckCircle2, Clock } from "lucide-react";

export default function RequestsPage() {
  const [requests, setRequests] = useState<PaymentRequestItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "benefit" | "general">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "approved" | "pending">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    empId: "",
    empName: "",
    amount: "",
    department: "ฝ่ายบริการลูกค้า",
  });

  useEffect(() => {
    setRequests(getLivePaymentRequests());
  }, []);

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.empId || !formData.empName || !formData.amount) return;

    const today = new Date();
    const thaiYear = today.getFullYear() + 543;
    const formattedDate = `จ่ายเมื่อ ${String(today.getDate()).padStart(2, "0")}/${String(
      today.getMonth() + 1
    ).padStart(2, "0")}/${thaiYear}`;

    const newRequest: Omit<PaymentRequestItem, "id"> = {
      empId: formData.empId,
      empName: formData.empName,
      amount: parseFloat(formData.amount),
      status: "paid",
      dueDate: formattedDate,
      department: formData.department,
      source: "general",
    };

    const updated = addPaymentRequest(newRequest);
    setRequests(updated);
    setFormData({ empId: "", empName: "", amount: "", department: "ฝ่ายบริการลูกค้า" });
    setIsModalOpen(false);
  };

  const benefitCount = requests.filter((r) => r.source === "benefit").length;
  const generalCount = requests.filter((r) => r.source === "general").length;

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.benefitCategory && req.benefitCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (req.claimId && req.claimId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      typeFilter === "all" ? true : req.source === typeFilter;

    const matchesStatus =
      statusFilter === "all" ? true : req.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalAmount = filteredRequests.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            รายการคำขอจ่ายเงินสำหรับพนักงาน
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            เชื่อมโยงข้อมูลคำขอเบิกสวัสดิการจากฝ่ายบุคคล และการเบิกจ่ายเบี้ยเลี้ยงพนักงาน
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#105647] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#0c4337] transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> เพิ่มคำขอจ่ายเงิน
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5 text-[#105647]" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400">คำขอเบิกสวัสดิการ (HR)</p>
            <p className="text-base font-bold text-zinc-900">{benefitCount} รายการ</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400">คำขอจ่ายเงินทั่วไป</p>
            <p className="text-base font-bold text-zinc-900">{generalCount} รายการ</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <span className="font-bold text-purple-700 text-sm">฿</span>
          </div>
          <div>
            <p className="text-[11px] text-gray-400">ยอดรวมที่แสดงในตาราง</p>
            <p className="text-base font-bold text-emerald-700">
              ฿{totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหารหัสพนักงาน / ชื่อ / สวัสดิการ / รหัสคำขอ"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Source Type Filter */}
            <div className="flex bg-gray-100/80 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  typeFilter === "all"
                    ? "bg-white text-gray-900 font-semibold shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setTypeFilter("benefit")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  typeFilter === "benefit"
                    ? "bg-white text-emerald-700 font-semibold shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                สวัสดิการ ({benefitCount})
              </button>
              <button
                onClick={() => setTypeFilter("general")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  typeFilter === "general"
                    ? "bg-white text-gray-900 font-semibold shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ทั่วไป ({generalCount})
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="paid">จ่ายแล้ว</option>
              <option value="approved">อนุมัติแล้ว (รอจ่าย)</option>
              <option value="pending">รอตรวจสอบ/เอกสาร</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-line-seed-sans-th">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-medium bg-gray-50/50">
                <th className="py-3 px-4">รหัสพนักงาน</th>
                <th className="py-3 px-4">ชื่อพนักงาน</th>
                <th className="py-3 px-4">ประเภทรายการ</th>
                <th className="py-3 px-4">แผนก</th>
                <th className="py-3 px-4 text-right">จำนวนเงิน</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">กำหนดจ่าย / รอบตัด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    ไม่พบรายการคำขอจ่ายเงิน
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {req.empId}
                      {req.claimId && (
                        <div className="text-[10px] text-gray-400 font-normal">
                          {req.claimId}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-800 font-medium whitespace-nowrap">
                      {req.empName}
                    </td>
                    <td className="py-3.5 px-4">
                      {req.source === "benefit" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <HeartHandshake className="w-3 h-3 text-[#105647]" />
                          {req.benefitCategory || "สวัสดิการ"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          คำขอทั่วไป
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {req.department || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-zinc-900 whitespace-nowrap">
                      ฿{req.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {req.status === "paid" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-emerald-300 text-emerald-700 bg-emerald-50">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> จ่ายแล้ว
                        </span>
                      )}
                      {req.status === "approved" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-blue-300 text-blue-700 bg-blue-50">
                          อนุมัติแล้ว (รอโอน)
                        </span>
                      )}
                      {req.status === "pending" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-amber-300 text-amber-700 bg-amber-50">
                          <Clock className="w-3 h-3 text-amber-600" /> รอตรวจสอบ
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-gray-500 whitespace-nowrap">
                      {req.dueDate}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Request */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 border border-gray-100">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  เพิ่มคำขอจ่ายเงินพนักงาน
                </h3>
                <p className="text-xs text-gray-400">บันทึกคำขอจ่ายเงินหรือเบี้ยเลี้ยง</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRequest} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  รหัสพนักงาน <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.empId}
                  onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-700 outline-none"
                  placeholder="เช่น CS-001 หรือ P1008"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  ชื่อ-นามสกุล พนักงาน <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.empName}
                  onChange={(e) => setFormData({ ...formData, empName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-700 outline-none"
                  placeholder="เช่น นาย สมชาย ใจกล้า"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  แผนกสังกัด
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-700 outline-none bg-white cursor-pointer"
                >
                  <option value="ฝ่ายบริการลูกค้า">ฝ่ายบริการลูกค้า</option>
                  <option value="ฝ่ายขาย">ฝ่ายขาย</option>
                  <option value="ฝ่ายการเงินและบัญชี">ฝ่ายการเงินและบัญชี</option>
                  <option value="ฝ่ายทรัพยากรบุคคล">ฝ่ายทรัพยากรบุคคล</option>
                  <option value="ฝ่ายเทคโนโลยีสารสนเทศ">ฝ่ายเทคโนโลยีสารสนเทศ</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  จำนวนเงินเบิกจ่าย (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-700 outline-none"
                  placeholder="25000"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium cursor-pointer hover:bg-gray-50 text-gray-700 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#105647] text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#0c4337] transition shadow-xs"
                >
                  บันทึกคำขอ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

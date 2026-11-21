"use client";

import React, { useState, useEffect } from "react";
import { TableTransfers } from "@/components/TableTransfers";
import {
  TransferItem,
  getLiveTransfers,
  addTransfer,
  toggleTransferStatus,
} from "@/data/finance";
import { Search, Plus, X, ArrowUpDown } from "lucide-react";

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [transferFilter, setTransferFilter] = useState<"all" | "pending" | "approved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipient: "",
    channel: "ธนาคารกสิกรไทย",
    amount: "",
    category: "ทั่วไป",
  });

  useEffect(() => {
    setTransfers(getLiveTransfers());
  }, []);

  const handleToggleStatus = (id: string) => {
    const updated = toggleTransferStatus(id);
    setTransfers(updated);
  };

  const handleAddTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipient || !formData.amount) return;

    const todayDate = new Date();
    const thaiBEYear = todayDate.getFullYear() + 543;
    const formattedDate = `${String(todayDate.getDate()).padStart(2, "0")}/${String(
      todayDate.getMonth() + 1
    ).padStart(2, "0")}/${thaiBEYear}`;

    const newTransfer: Omit<TransferItem, "id"> = {
      date: formattedDate,
      refNo: `TR-${thaiBEYear}-${Math.floor(1000 + Math.random() * 9000)}`,
      recipient: formData.recipient,
      channel: formData.channel,
      amount: parseFloat(formData.amount),
      status: "pending",
      category: formData.category,
    };

    const updated = addTransfer(newTransfer);
    setTransfers(updated);
    setFormData({ recipient: "", channel: "ธนาคารกสิกรไทย", amount: "", category: "ทั่วไป" });
    setIsModalOpen(false);
  };

  const pendingCount = transfers.filter((t) => t.status === "pending").length;
  const approvedCount = transfers.filter((t) => t.status === "approved").length;

  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch =
      t.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter =
      transferFilter === "all" ? true : t.status === transferFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">รายการโอนเงิน</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            ค้นหา ตรวจสอบ และบันทึกรายการโอนเงินทุกรายการขององค์กร
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#105647] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#0c4337] transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> เพิ่มรายการโอนเงิน
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาผู้รับโอน / เลขอ้างอิง / หมวดหมู่"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex bg-gray-100/80 p-1 rounded-xl text-xs font-medium self-start md:self-auto">
            <button
              onClick={() => setTransferFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                transferFilter === "all"
                  ? "bg-white text-gray-900 font-semibold shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              ทั้งหมด ({transfers.length})
            </button>
            <button
              onClick={() => setTransferFilter("pending")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                transferFilter === "pending"
                  ? "bg-white text-amber-700 font-semibold shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              รอตรวจสอบ ({pendingCount})
            </button>
            <button
              onClick={() => setTransferFilter("approved")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                transferFilter === "approved"
                  ? "bg-white text-emerald-700 font-semibold shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              อนุมัติแล้ว ({approvedCount})
            </button>
          </div>
        </div>

        {/* Transfers Table */}
        <TableTransfers items={filteredTransfers} onToggleStatus={handleToggleStatus} />
      </div>

      {/* Modal Add Transfer */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 border border-gray-100">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-gray-900">เพิ่มรายการโอนเงินใหม่</h3>
                <p className="text-xs text-gray-400">บันทึกคำสั่งโอนเงินเข้าสู่ระบบบัญชี</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransfer} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  ชื่อผู้รับโอน / บริษัท <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-700 outline-none"
                  placeholder="เช่น บริษัท เออบาน่า ซัพพลาย จำกัด"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  ช่องทางชำระเงิน <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-700 outline-none bg-white cursor-pointer"
                >
                  <option value="ธนาคารกสิกรไทย">ธนาคารกสิกรไทย</option>
                  <option value="ธนาคารกรุงเทพ">ธนาคารกรุงเทพ</option>
                  <option value="ธนาคารไทยพาณิชย์">ธนาคารไทยพาณิชย์</option>
                  <option value="ธนาคารออมสิน">ธนาคารออมสิน</option>
                  <option value="เช็ค">เช็ค</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  หมวดหมู่ค่าใช้จ่าย
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-700 outline-none"
                  placeholder="เช่น จัดซื้อวัสดุ, ค่าเบี้ยเลี้ยง"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  จำนวนเงิน (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-700 outline-none"
                  placeholder="50000"
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
                  บันทึกรายการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

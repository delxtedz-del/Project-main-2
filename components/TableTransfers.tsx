"use client";

import React from "react";
import { TransferItem } from "@/data/finance";

interface TableTransfersProps {
  items: TransferItem[];
  onToggleStatus?: (id: string) => void;
}

export const TableTransfers: React.FC<TableTransfersProps> = ({
  items,
  onToggleStatus,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs font-line-seed-sans-th">
        <thead>
          <tr className="border-b border-gray-100 text-gray-400 font-medium bg-gray-50/50">
            <th className="py-3 px-4">วันที่</th>
            <th className="py-3 px-4">หมายเลขอ้างอิง</th>
            <th className="py-3 px-4">ผู้รับโอน</th>
            <th className="py-3 px-4">ช่องทาง</th>
            <th className="py-3 px-4 text-right">ยอดสุทธิ</th>
            <th className="py-3 px-4 text-center">สถานะ / การจัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-400">
                ไม่พบรายการโอนเงิน
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{item.date}</td>
                <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">{item.refNo}</td>
                <td className="py-3 px-4 text-gray-800">
                  <div className="font-medium">{item.recipient}</div>
                  {item.category && (
                    <span className="text-[10px] text-gray-400">{item.category}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{item.channel}</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                  ฿{item.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-center whitespace-nowrap">
                  {item.status === "pending" ? (
                    <button
                      onClick={() => onToggleStatus && onToggleStatus(item.id)}
                      title="กดเพื่อยืนยันอนุมัติการโอนเงิน"
                      className="px-3 py-1 rounded-md text-[11px] font-medium border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition cursor-pointer inline-flex items-center gap-1 shadow-xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                      รอตรวจสอบ
                    </button>
                  ) : (
                    <button
                      onClick={() => onToggleStatus && onToggleStatus(item.id)}
                      title="กดเพื่อสลับสถานะกลับเป็นรอตรวจสอบ"
                      className="px-3 py-1 rounded-md text-[11px] font-medium border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer inline-flex items-center gap-1 shadow-xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      อนุมัติแล้ว
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableTransfers;

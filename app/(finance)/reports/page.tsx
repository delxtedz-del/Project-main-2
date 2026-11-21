"use client";

import React, { useState, useEffect } from "react";
import {
  ChannelReportItem,
  getLiveChannelReports,
  saveChannelReports,
  MOCK_CHART_DATA,
} from "@/data/finance";
import { Download, Upload, CheckCircle2, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function ReportsPage() {
  const [reportsData, setReportsData] = useState<ChannelReportItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    setReportsData(getLiveChannelReports());
  }, []);

  const totalCount = reportsData.reduce((sum, item) => sum + item.count, 0);
  const totalPreTax = reportsData.reduce((sum, item) => sum + item.preTaxAmount, 0);
  const totalWht = reportsData.reduce((sum, item) => sum + item.whtAmount, 0);
  const totalVat = reportsData.reduce((sum, item) => sum + item.vatAmount, 0);
  const totalNet = reportsData.reduce((sum, item) => sum + item.netAmount, 0);

  const handleExportCSV = () => {
    const headers = [
      "ช่องทาง",
      "จำนวนรายการ",
      "ยอดก่อนภาษี",
      "ภาษีหัก ณ ที่จ่าย",
      "VAT",
      "ยอดสุทธิ",
    ];
    const rows = reportsData.map((item) => [
      `"${item.channel}"`,
      item.count,
      item.preTaxAmount,
      item.whtAmount,
      item.vatAmount,
      item.netAmount,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const todayStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute("download", `รายงานสรุปการเงินตามช่องทาง_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification("ส่งออกไฟล์ CSV เรียบร้อยแล้ว");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length <= 1) {
        alert("ไฟล์ CSV ว่างเปล่า หรือไม่มีข้อมูลแถว");
        return;
      }

      const parsedItems: ChannelReportItem[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i]
          .split(",")
          .map((col) => col.replace(/^"(.*)"$/, "$1").trim());
        if (cols.length >= 6) {
          parsedItems.push({
            channel: cols[0],
            count: Number(cols[1]) || 0,
            preTaxAmount: Number(cols[2]) || 0,
            whtAmount: Number(cols[3]) || 0,
            vatAmount: Number(cols[4]) || 0,
            netAmount: Number(cols[5]) || 0,
          });
        }
      }

      if (parsedItems.length > 0) {
        setReportsData(parsedItems);
        saveChannelReports(parsedItems);
        setNotification(`นำเข้าข้อมูลจาก "${file.name}" สำเร็จ (${parsedItems.length} รายการ)`);
        setTimeout(() => setNotification(null), 3000);
      } else {
        alert("รูปแบบไฟล์ CSV ไม่ถูกต้องตามโครงสร้าง");
      }
    };

    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">รายงานสรุปการเงิน</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            สรุปยอดโอนเงิน ภาษี และยอดสุทธิที่ต้องจ่ายแยกตามช่องทางการชำระ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="bg-white border border-gray-300 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 cursor-pointer transition shadow-xs">
            <Upload className="w-4 h-4 text-gray-500" />
            <span>นำเข้าข้อมูล (CSV)</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExportCSV}
            className="bg-[#105647] text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-[#0c4337] transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออกรายงาน (CSV)</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">ยอดสุทธิรวม</p>
          <h3 className="text-2xl font-extrabold text-emerald-800 mt-2">
            ฿{totalNet.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">{totalCount} รายการทั้งหมด</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">ยอดก่อนหักภาษีรวม</p>
          <h3 className="text-2xl font-extrabold text-zinc-900 mt-2">
            ฿{totalPreTax.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">ฐานภาษีก่อนหัก ณ ที่จ่าย</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">ภาษีหัก ณ ที่จ่ายรวม</p>
          <h3 className="text-2xl font-extrabold text-amber-700 mt-2">
            ฿{totalWht.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">WHT รอส่งกรมสรรพากร</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">ภาษีมูลค่าเพิ่มรวม (VAT 7%)</p>
          <h3 className="text-2xl font-extrabold text-blue-700 mt-2">
            ฿{totalVat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">ภาษีซื้อรอขอคืน</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm text-gray-900">
              ยอดโอนสุทธิรายเดือน (พ.ศ. 2569)
            </h4>
            <p className="text-xs text-gray-400">เปรียบเทียบแนวโน้มค่าใช้จ่ายย้อนหลัง 6 เดือน</p>
          </div>
          <span className="text-[11px] font-medium px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> ภาพรวมเติบโตปกติ
          </span>
        </div>
        <div className="h-64 w-full">
          {isClient && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  domain={[0, 450000]}
                  ticks={[0, 50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000]}
                  tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `฿${Number(value).toLocaleString("th-TH")} บาท`,
                    "ยอดสุทธิ",
                  ]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="amount" fill="#105647" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Reports Table Section */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-3">
        <div>
          <h4 className="font-bold text-sm text-gray-900">สรุปตามช่องทางชำระเงิน</h4>
          <p className="text-xs text-gray-400">
            จำแนกยอดโอน ยอดภาษีหัก ณ ที่จ่าย และภาษีมูลค่าเพิ่มตามธนาคาร/ช่องทาง
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-line-seed-sans-th">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-medium bg-gray-50/50">
                <th className="py-3 px-3">ช่องทาง</th>
                <th className="py-3 px-3 text-center">จำนวนรายการ</th>
                <th className="py-3 px-3 text-right">ยอดก่อนภาษี</th>
                <th className="py-3 px-3 text-right">ภาษีหัก ณ ที่จ่าย</th>
                <th className="py-3 px-3 text-right">VAT</th>
                <th className="py-3 px-3 text-right">ยอดสุทธิ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportsData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold text-gray-900 whitespace-nowrap">
                    {row.channel}
                  </td>
                  <td className="py-3 px-3 text-center text-gray-700 whitespace-nowrap">
                    {row.count}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-700 whitespace-nowrap">
                    ฿{row.preTaxAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right text-amber-700 whitespace-nowrap">
                    ฿{row.whtAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right text-blue-700 whitespace-nowrap">
                    ฿{row.vatAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-800 whitespace-nowrap">
                    ฿{row.netAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50/80 font-bold border-t border-gray-200">
                <td className="py-3 px-3 text-gray-900">รวมทั้งหมด</td>
                <td className="py-3 px-3 text-center text-gray-900">{totalCount}</td>
                <td className="py-3 px-3 text-right text-gray-900">
                  ฿{totalPreTax.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right text-amber-800">
                  ฿{totalWht.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right text-blue-800">
                  ฿{totalVat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right text-emerald-900">
                  ฿{totalNet.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

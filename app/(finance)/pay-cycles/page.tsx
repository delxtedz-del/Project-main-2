"use client";

import React, { useState, useEffect } from "react";
import {
  getPayCycleSettings,
  savePayCycleSettings,
  PayCycleSettings,
} from "@/data/finance";
import { Calendar, CheckCircle2, Info, Clock, AlertCircle } from "lucide-react";

export default function PayCyclesPage() {
  const [cutoffDay, setCutoffDay] = useState("25");
  const [payDay, setPayDay] = useState("30");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const settings = getPayCycleSettings();
    setCutoffDay(settings.cutoffDay);
    setPayDay(settings.payDay);
    if (settings.updatedAt) {
      setLastUpdated(settings.updatedAt);
    }
  }, []);

  const handleSave = () => {
    const updated = savePayCycleSettings({
      cutoffDay,
      payDay,
    });
    setLastUpdated(updated.updatedAt || new Date().toISOString());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          กำหนดรอบตัดรอบและวันจ่ายเงิน
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          ตั้งค่ารอบเวลาตัดรอบการเบิกจ่ายสวัสดิการ และกำหนดวันโอนเงินเข้าบัญชีพนักงาน
        </p>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 transition-all">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">บันทึกการตั้งค่าเรียบร้อยแล้ว!</span>
            <p className="text-emerald-700/90 mt-0.5">
              วันตัดรอบ: วันที่ {cutoffDay} ของทุกเดือน | วันจ่ายเงิน: วันที่ {payDay === "31" ? "สิ้นเดือน" : payDay} ของทุกเดือน
            </p>
          </div>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Setting 1: วันตัดรอบ */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  การตั้งค่าวันตัดรอบ (Cut-off Settings)
                </h4>
                <p className="text-xs text-gray-400">
                  กำหนดวันที่สิ้นสุดการรับเอกสารและคำขอเบิกสวัสดิการในแต่ละเดือน
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                วันตัดรอบประจำเดือน (Cut-off Day)
              </label>
              <select
                value={cutoffDay}
                onChange={(e) => setCutoffDay(e.target.value)}
                className="w-full max-w-sm bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white cursor-pointer"
              >
                <option value="20">วันที่ 20 ของทุกเดือน (แนะนำสำหรับรอบเอกสาร HR)</option>
                <option value="25">วันที่ 25 ของทุกเดือน (รอบปกติมาตรฐาน)</option>
                <option value="28">วันที่ 28 ของทุกเดือน (รอบด่วนปลายเดือน)</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-gray-400" />
                คำขอหลังจากวันตัดรอบจะถูกยกยอดไปเบิกจ่ายในรอบบิลถัดไป
              </p>
            </div>
          </div>

          {/* Setting 2: วันจ่ายเงิน */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#105647]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  การตั้งค่าวันจ่ายเงิน (Pay Day Settings)
                </h4>
                <p className="text-xs text-gray-400">
                  กำหนดวันที่ระบบโอนเงินสวัสดิการเข้าบัญชีพนักงาน
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                วันจ่ายเงินประจำเดือน (Pay Day)
              </label>
              <select
                value={payDay}
                onChange={(e) => setPayDay(e.target.value)}
                className="w-full max-w-sm bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white cursor-pointer"
              >
                <option value="28">วันที่ 28 ของทุกเดือน</option>
                <option value="30">วันที่ 30 ของทุกเดือน</option>
                <option value="31">วันทำการสุดท้ายของเดือน (สิ้นเดือน)</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-gray-400" />
                หากตรงกับวันหยุดเสาร์-อาทิตย์ จะทำการโอนในวันทำการก่อนหน้า
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-gray-400">
              {lastUpdated && `อัปเดตล่าสุด: ${new Date(lastUpdated).toLocaleString("th-TH")}`}
            </span>
            <button
              onClick={handleSave}
              className="bg-[#105647] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#0c4337] transition shadow-xs cursor-pointer"
            >
              บันทึกการตั้งค่ารอบจ่ายเงิน
            </button>
          </div>
        </div>

        {/* Side Info Box */}
        <div className="space-y-4">
          <div className="bg-emerald-900 text-white p-5 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-emerald-300" />
              <h4 className="font-bold text-sm">ข้อกำหนดระบบ EDBMS</h4>
            </div>
            <ul className="text-xs text-emerald-100/90 space-y-2 list-disc list-inside">
              <li>
                พนักงานต้องนำส่งเอกสารฉบับจริงให้ฝ่ายบุคคลภายในวันที่ {cutoffDay}
              </li>
              <li>
                ฝ่ายบุคคลต้องตรวจสอบและกดอนุมัติก่อนวันที่ {cutoffDay}
              </li>
              <li>
                ฝ่ายการเงินจะรวบรวมรายการที่อนุมัติแล้ว และส่งคำสั่งโอนเงินในวันที่ {payDay === "31" ? "สิ้นเดือน" : payDay}
              </li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
            <h4 className="font-bold text-xs text-gray-900 mb-2">สรุปรอบบิลปัจจุบัน</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">รอบบิล:</span>
                <span className="font-medium text-gray-800">พฤศจิกายน 2569</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">วันตัดรอบ:</span>
                <span className="font-bold text-amber-700">{cutoffDay} พ.ย. 2569</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">วันโอนเงิน:</span>
                <span className="font-bold text-emerald-700">
                  {payDay === "31" ? "30 พ.ย. 2569" : `${payDay} พ.ย. 2569`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

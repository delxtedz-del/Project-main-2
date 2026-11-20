"use client";

import { Benefits } from "@/data/benefit";
import { AlertTriangle, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ClaimTrackingViewProps {
  claim: Benefits;
  payrollRoundText: string;
  docDeadlineDay: number;
  docDeadlineDateText: string;
  requiredDocs: string[];
  onGoHome: () => void;
  onRequestCancel: () => void;
}

export function ClaimTrackingView({
  claim,
  payrollRoundText,
  docDeadlineDay,
  docDeadlineDateText,
  requiredDocs,
  onGoHome,
  onRequestCancel,
}: ClaimTrackingViewProps) {
  const [showRequiredDocs, setShowRequiredDocs] = useState(false);

  return (
    <div className="mx-auto mt-8 flex w-full max-w-2xl flex-col items-center">
      <span className="rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold tracking-wider text-anyprimary-green-700 uppercase">
        Claim Tracking
      </span>
      <h2 className="mt-2 text-2xl font-bold text-black">สถานะการเบิก</h2>
      <p className="mt-1 text-sm text-gray-600">
        ยอดเงินขอเบิก{" "}
        <strong className="text-black">
          {claim.amountRequested.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}{" "}
          บาท
        </strong>{" "}
        • {payrollRoundText}
      </p>

      {/* 4-Step Vertical Timeline */}
      <div className="mt-8 w-full max-w-md space-y-0">
        {/* Step 1 */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className="flex size-8 items-center justify-center rounded-full bg-anyprimary-green-700 text-white shadow-[0_0_0_4px_#e8f3f0]">
              <Check className="size-4" />
            </div>
            <div className="my-1.5 h-12 w-0.5 bg-gray-200" />
          </div>
          <div className="pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-black">ยื่นเรื่องเบิกเสร็จ</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-anyprimary-green-700">
                ดำเนินการแล้ว
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-600">
              ระบบได้รับข้อมูลการยื่นเบิกสวัสดิการของคุณเรียบร้อยแล้ว
            </p>
            <p className="mt-1 text-[11px] font-medium text-anyprimary-green-700">
              {claim.requestDate} • รหัสอ้างอิง {claim.claimId}
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className="flex size-8 items-center justify-center rounded-full border-2 border-amber-500 bg-white">
              <div className="size-2.5 rounded-full bg-amber-500" />
            </div>
            <div className="my-1.5 h-12 w-0.5 bg-gray-200" />
          </div>
          <div className="pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-black">
                นำเอกสารตัวจริงส่งให้ HR
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                ขั้นตอนถัดไป
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              กรุณานำใบเสร็จรับเงินและเอกสารฉบับจริงส่งที่ฝ่ายบุคคล
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              กำหนดส่งภายใน {docDeadlineDateText}
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className="flex size-8 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-50">
              <div className="size-2 rounded-full bg-gray-300" />
            </div>
            <div className="my-1.5 h-12 w-0.5 bg-gray-200" />
          </div>
          <div className="pb-6">
            <p className="font-medium text-gray-500">
              รอตรวจเอกสารและกำหนดวันจ่าย
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              เจ้าหน้าที่ HR ตรวจสอบความถูกต้องและอนุมัติรอบการโอนเงิน
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className="flex size-8 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-50">
              <div className="size-2 rounded-full bg-gray-300" />
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-500">เบิกเงินสวัสดิการ</p>
            <p className="mt-0.5 text-xs text-gray-400">
              โอนเงินสวัสดิการเข้าบัญชีธนาคารของพนักงานเรียบร้อย
            </p>
          </div>
        </div>
      </div>

      {/* Yellow Notice Banner */}
      <div className="mt-8 w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-200/70 text-amber-800">
            <AlertTriangle className="size-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">
              กรุณานำใบเสร็จและเอกสารตัวจริงส่งฝ่าย HR ภายในวันที่{" "}
              {docDeadlineDay} เพื่อให้ทันรอบการจ่ายเงินเดือนนี้
            </p>
            <button
              type="button"
              onClick={() => setShowRequiredDocs((v) => !v)}
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-amber-800 underline hover:text-amber-950"
            >
              ดูรายการเอกสารที่ต้องเตรียมส่งฝ่าย HR
              {showRequiredDocs ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
            {showRequiredDocs && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-900/90">
                {requiredDocs.map((doc) => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex w-full max-w-md flex-col items-center">
        <button
          type="button"
          onClick={onGoHome}
          className="w-full rounded-xl bg-anyprimary-green-700 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#0c4337]"
        >
          กลับไปหน้าแรก
        </button>

        <div className="my-3 flex w-40 items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          <span>หรือ</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={onRequestCancel}
          className="rounded-xl border border-rose-200 bg-white px-5 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
        >
          ยกเลิกคำขอ
        </button>
      </div>
    </div>
  );
}

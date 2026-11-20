"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  getLiveBudgetRequests,
  getLiveBudgetExpenses,
  reserve,
  yearBudget,
  type BudgetRequest,
  type ApprovalStatus,
} from "@/data/budget";
import { getLiveBenefitsData } from "@/data/benefit";
import { addAuditLog } from "@/data/it";

export type Status = ApprovalStatus;
export type Notice = { text: string; time: string; read: boolean };

const fmt = (n: number) => n.toLocaleString("th-TH");

type Ctx = {
  getStatus: (id: string | number) => Status;
  decide: (id: string | number, act: "approved" | "rejected") => void;
  notices: Notice[];
  markAllRead: () => void;
  allRequests: BudgetRequest[];
  calc: {
    pendingTotal: number;
    pendingCount: number;
    budgetUsed: number;
    reserveUsed: number;
    apCount: number;
    apAmount: number;
  };
};

const ApprovalContext = createContext<Ctx | null>(null);

export function useApprovals() {
  const ctx = useContext(ApprovalContext);
  if (!ctx) {
    // Safe fallback if used outside Provider
    return {
      getStatus: () => "pending" as Status,
      decide: () => {},
      notices: [],
      markAllRead: () => {},
      allRequests: [],
      calc: {
        pendingTotal: 0,
        pendingCount: 0,
        budgetUsed: 2_000_000,
        reserveUsed: 0,
        apCount: 0,
        apAmount: 0,
      },
    };
  }
  return ctx;
}

const STORAGE_KEY = "budgetApprovalStatus";

export default function ApprovalProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<BudgetRequest[]>([]);
  const [status, setStatus] = useState<Record<string | number, Status>>({});
  const [notices, setNotices] = useState<Notice[]>([]);

  // โหลดข้อมูลคำขอและสถานะจาก localStorage เมื่อเริ่มต้น
  useEffect(() => {
    const liveReqs = getLiveBudgetRequests();
    setRequests(liveReqs);

    let savedStatus: Record<string | number, Status> = {};
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) savedStatus = JSON.parse(raw);
      } catch {
        /* ignore */
      }
    }
    setStatus(savedStatus);

    // สร้างการแจ้งเตือนเริ่มต้นสำหรับคำขอที่ยังไม่อ่าน
    const initialNotices: Notice[] = liveReqs.map((r) => ({
      text: `มีคำขอใหม่ "${r.title}" ${fmt(r.amount)} บาท${r.urgent ? " (เร่งด่วน)" : ""}`,
      time: `ยื่นเมื่อ ${r.date}`,
      read: savedStatus[r.id] !== undefined,
    }));
    setNotices(initialNotices);
  }, []);

  const getStatus = (id: string | number): Status => status[id] ?? "pending";

  const decide = (id: string | number, act: "approved" | "rejected") => {
    if (status[id]) return; // ตัดสินแล้วไม่ทำซ้ำ

    const r = requests.find((x) => String(x.id) === String(id));
    if (!r) return;

    const newStatus = { ...status, [id]: act };
    setStatus(newStatus);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStatus));

        // หากเป็นคำขอเบิกสวัสดิการของพนักงาน ให้ซิงก์สถานะไปยังข้อมูลสวัสดิการสด
        if (r.claimId) {
          const liveClaims = getLiveBenefitsData();
          const targetClaim = liveClaims.find((c) => c.claimId === r.claimId);
          if (targetClaim) {
            targetClaim.status = act === "approved" ? "approved" : "rejected";
            targetClaim.statusNote = act === "approved" ? "ผู้บริหารอนุมัติคำขอแล้ว" : "ผู้บริหารปฏิเสธคำขอ";
            if (act === "approved") {
              targetClaim.approvedAmount = targetClaim.amountRequested;
              targetClaim.approver = "ผู้บริหาร (IT/CEO)";
            }
            // บันทึกคำขอที่เพิ่มหรือปรับปรุงลง localStorage
            const rawAdded = localStorage.getItem("benefitsAddedData");
            const addedClaims = rawAdded ? JSON.parse(rawAdded) : [];
            const idx = addedClaims.findIndex((c: { claimId: string }) => c.claimId === r.claimId);
            if (idx >= 0) {
              addedClaims[idx] = targetClaim;
            } else {
              addedClaims.push(targetClaim);
            }
            localStorage.setItem("benefitsAddedData", JSON.stringify(addedClaims));
          }
        }
      } catch {
        /* ignore */
      }
    }

    const fundName = r.fund === "reserve" ? "งบสำรองฉุกเฉิน" : "งบสวัสดิการ";
    const text =
      act === "approved"
        ? `อนุมัติ "${r.title}" หัก${fundName} ${fmt(r.amount)} บาท`
        : `ไม่อนุมัติ "${r.title}" (ไม่มีการหักงบ)`;
    const time = `${new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.`;
    setNotices([{ text, time, read: false }, ...notices]);

    // บันทึกเข้า Audit Trail กลางของระบบ
    addAuditLog(
      act === "approved" ? "อนุมัติคำขอเบิก/งบประมาณ" : "ปฏิเสธคำขอเบิก/งบประมาณ",
      `${r.type}: ${r.title} · ยอดเงิน ${fmt(r.amount)} บาท · แผนก ${r.department || "ทั่วไป"}`,
      "normal",
      "ผู้บริหาร (IT/CEO)",
      "Executive"
    );
  };

  const markAllRead = () => {
    setNotices((n) => n.map((x) => ({ ...x, read: true })));
  };

  const ofStatus = (s: Status) => requests.filter((r) => getStatus(r.id) === s);
  const approvedList = ofStatus("approved");
  const pendingList = ofStatus("pending");

  // คำนวณยอดเงินที่ใช้ไป โดยเชื่อมต่อกับรายการใช้จ่ายสด
  const expenses2569 = getLiveBudgetExpenses(2569);
  const baseBudgetUsed = expenses2569
    .filter((x) => x.fund === "budget")
    .reduce((t, x) => t + x.amount, 0);

  const approvedBudgetAmount = approvedList
    .filter((r) => r.fund === "budget" && !r.claimId) // ป้องกันการนับซ้ำหาก claimId ถูกรวมใน getLiveBudgetExpenses แล้ว
    .reduce((t, r) => t + r.amount, 0);

  const approvedReserveAmount = approvedList
    .filter((r) => r.fund === "reserve")
    .reduce((t, r) => t + r.amount, 0);

  const calc = {
    pendingTotal: pendingList.reduce((t, r) => t + r.amount, 0),
    pendingCount: pendingList.length,
    budgetUsed: baseBudgetUsed + approvedBudgetAmount,
    reserveUsed: reserve.used + approvedReserveAmount,
    apCount: approvedList.length,
    apAmount: approvedList.reduce((t, r) => t + r.amount, 0),
  };

  return (
    <ApprovalContext.Provider
      value={{
        getStatus,
        decide,
        notices,
        markAllRead,
        allRequests: requests,
        calc,
      }}
    >
      {children}
    </ApprovalContext.Provider>
  );
}

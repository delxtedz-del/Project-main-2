// data/it.ts
// เชื่อมโยงข้อมูลส่วน IT กับระบบผู้ใช้งาน (data/Login.ts, data/employee.ts),
// สวัสดิการ (data/benefit.ts) และงบประมาณการเงิน (data/budget.ts)

import { users } from "./Login";
import { employees } from "./employee";
import { getLiveBenefitsData, type Benefits } from "./benefit";
import {
  getLiveBudgetRequests,
  getLiveBudgetExpenses,
  initialRequests,
  yearBudget,
} from "./budget";
import { nowLocal } from "@/lib/format";

export const currentUser = {
  name: "ปุนยาพร อย่างมั่น",
  email: "poonyaporn1213@gmail.com",
  role: "IT SUPER ADMIN",
  avatar: "/ITadmin.jpg",
};

export const TODAY = "2026-11-20"; // วันนี้ 20 พ.ย. 2569

// ---------- สิทธิ์การเข้าถึง ----------
export type ActionKey = "view" | "create" | "edit" | "delete";
export const actionLabels: Record<ActionKey, string> = {
  view: "ดู / เข้าถึง",
  create: "สร้าง",
  edit: "แก้ไข",
  delete: "ลบ",
};

export const modules: { key: string; label: string; actions: ActionKey[] }[] = [
  { key: "dashboard", label: "แดชบอร์ดสวัสดิการและระบบ", actions: ["view"] },
  { key: "myRequests", label: "คำขอเบิกสวัสดิการของฉัน", actions: ["view", "create", "edit"] },
  { key: "approvals", label: "พิจารณาและอนุมัติ (งบประมาณ/สวัสดิการ)", actions: ["view", "edit"] },
  { key: "welfare", label: "จัดการนโยบายสวัสดิการ", actions: ["view", "create", "edit", "delete"] },
  { key: "employees", label: "ทำเนียบพนักงานและสิทธิ์", actions: ["view", "edit"] },
  { key: "history", label: "ประวัติการเบิกสวัสดิการ", actions: ["view"] },
  { key: "logs", label: "บันทึกการใช้งานระบบ (Audit Trail)", actions: ["view"] },
  { key: "contact", label: "ตั้งค่าข้อมูลติดต่อองค์กร", actions: ["view", "edit"] },
  { key: "issue", label: "แจ้งปัญหาและดูแลความปลอดภัยระบบไอที", actions: ["view", "create"] },
];

export const positions = [
  "พนักงานทั่วไป",
  "เจ้าหน้าที่ HR",
  "ผู้บริหาร",
];

export type PermMap = Record<string, ActionKey[]>; // moduleKey -> actions ที่อนุญาต

export const initialPerms: Record<string, PermMap> = {
  ผู้บังคับบัญชา: {
    dashboard: ["view"],
    myRequests: ["view", "create", "edit"],
    approvals: ["view", "edit"],
    employees: ["view"],
    history: ["view"],
    issue: ["view", "create"],
  },
  พนักงานทั่วไป: {
    dashboard: ["view"],
    myRequests: ["view", "create"],
    employees: ["view"],
    history: ["view"],
    issue: ["view", "create"],
  },
  "เจ้าหน้าที่ HR": {
    dashboard: ["view"],
    myRequests: ["view", "create", "edit"],
    approvals: ["view", "edit"],
    welfare: ["view", "create", "edit"],
    employees: ["view", "edit"],
    history: ["view"],
    issue: ["view", "create"],
  },
  ผู้บริหาร: {
    dashboard: ["view"],
    approvals: ["view", "edit"],
    welfare: ["view"],
    employees: ["view"],
    history: ["view"],
    logs: ["view"],
  },
  "IT Admin": {
    dashboard: ["view"],
    approvals: ["view", "edit"],
    welfare: ["view"],
    employees: ["view", "edit"],
    history: ["view"],
    logs: ["view"],
    contact: ["view", "edit"],
    issue: ["view", "create"],
  },
};

// ---------- บันทึกการใช้งาน (Audit Trail) ----------
export type LogLevel = "normal" | "warning";

export type AuditLog = {
  id: number;
  action: string;
  actor: string;
  role: string;
  level: LogLevel;
  detail: string;
  at: string; // "YYYY-MM-DDTHH:mm"
};

export const initialLogs: AuditLog[] = [
  {
    id: 8,
    action: "ยื่นคำขอเบิกสวัสดิการใหม่",
    actor: "saran.b@company.com",
    role: "EMP",
    level: "normal",
    at: "2026-11-15T10:30",
    detail: "CLM-2611-0004 · ทุนสอบ Certifications · 12,000 บาท · วันที่ 15/11/2569",
  },
  {
    id: 7,
    action: "อนุมัติคำขอเบิกสวัสดิการ",
    actor: currentUser.email,
    role: "CEO / IT Admin",
    level: "normal",
    at: "2026-11-10T16:45",
    detail: "CLM-2611-0002 · สวัสดิการน้ำท่วม · อนุมัติ 10,000 บาท (หักงบสำรองฉุกเฉิน)",
  },
  {
    id: 6,
    action: "ปฏิเสธไฟล์แนบที่ไม่ผ่านการตรวจความปลอดภัย",
    actor: currentUser.email,
    role: "IT Admin",
    level: "warning",
    at: "2026-10-25T14:13",
    detail: "invoice-fake.png: ไม่สามารถเปิดอ่านไฟล์แนบเพื่อตรวจสอบได้",
  },
  {
    id: 5,
    action: "ปฏิเสธไฟล์แนบที่ไม่ผ่านการตรวจความปลอดภัย",
    actor: currentUser.email,
    role: "IT Admin",
    level: "warning",
    at: "2026-10-25T14:12",
    detail: "invoice-fake.png: ตรวจพบลักษณะไฟล์ที่ไม่ปลอดภัย (Executable header)",
  },
  {
    id: 4,
    action: "ยื่นคำขอเบิกสวัสดิการใหม่",
    actor: "patipat.s@company.com",
    role: "EMP",
    level: "normal",
    at: "2026-10-25T14:12",
    detail: "CLM-2611-0001 · ค่ารักษาพยาบาล (พนักงาน) · 1,000 บาท · วันที่ 02/11/2569",
  },
  {
    id: 3,
    action: "ปฏิเสธไฟล์แนบที่ไม่ผ่านการตรวจความปลอดภัย",
    actor: currentUser.email,
    role: "IT Admin",
    level: "warning",
    at: "2026-10-25T14:08",
    detail: "receipt.exe.pdf: Access denied: invalid private file path",
  },
  {
    id: 2,
    action: "ยื่นคำขอนโยบายงบประมาณระดับองค์กร",
    actor: "poonyaporn1213@gmail.com",
    role: "CEO",
    level: "normal",
    at: "2026-10-12T09:15",
    detail: "ปรับวงเงินค่าเล่าเรียนบุตรประจำปี 2570 · วงเงิน 360,000 บาท · มีผลต่อพนักงาน 19 คน",
  },
  {
    id: 1,
    action: "ยื่นคำของบประมาณฉุกเฉิน",
    actor: "poonyaporn1213@gmail.com",
    role: "CEO",
    level: "normal",
    at: "2026-09-29T11:20",
    detail: "ขออนุมัติงบช่วยเหลือจากพนักงานประสบอุทกภัย · วงเงิน 250,000 บาท · มีผลต่อพนักงาน 49 คน",
  },
];

// ---------- ฟังก์ชันเชื่อมโยงข้อมูลสด (Live Data Helpers) ----------

const STORAGE_LOGS_KEY = "edbms-audit-logs";
const STORAGE_PERMS_KEY = "edbms-permissions";

export interface SystemStats {
  users: number;
  requests: number;
  approved: number;
  pending: number;
  rejected: number;
  budgetDisbursed: number;
  budgetTotal: number;
  budgetRemaining: number;
}

/**
 * ดึงสถิติภาพรวมทั้งระบบ โดยเชื่อมต่อข้อมูลสดจาก
 * - data/Login.ts & data/employee.ts (จำนวนผู้ใช้ 35 คน)
 * - data/benefit.ts (คำขอสวัสดิการสด)
 * - data/budget.ts (คำของบประมาณและการเบิกจ่ายสด)
 */
export function getLiveSystemStats(): SystemStats {
  const allUsersCount = Math.max(users.length, employees.length, 35);
  const liveClaims = getLiveBenefitsData();
  const liveBudgetReqs = getLiveBudgetRequests();

  // จำนวนคำขอทั้งหมด = คำขอสวัสดิการ + คำของบประมาณองค์กร
  const totalRequests = liveClaims.length + initialRequests.length;

  // จำนวนที่อนุมัติแล้ว
  const approvedClaimsCount = liveClaims.filter(
    (c) => c.status === "approved" || c.status === "success"
  ).length;

  // จำนวนที่รอพิจารณา
  const pendingClaimsCount = liveClaims.filter(
    (c) => c.status === "pending_hr" || c.status === "pending_document"
  ).length;

  const rejectedClaimsCount = liveClaims.filter((c) => c.status === "rejected").length;

  // งบประมาณปี 2569
  const year2569Expenses = getLiveBudgetExpenses(2569);
  const budgetDisbursed = year2569Expenses
    .filter((e) => e.fund === "budget")
    .reduce((sum, e) => sum + e.amount, 0);
  const budgetTotal = yearBudget[2569] || 3_000_000;
  const budgetRemaining = Math.max(0, budgetTotal - budgetDisbursed);

  return {
    users: allUsersCount,
    requests: totalRequests,
    approved: approvedClaimsCount,
    pending: pendingClaimsCount,
    rejected: rejectedClaimsCount,
    budgetDisbursed,
    budgetTotal,
    budgetRemaining,
  };
}

/**
 * ดึงรายการ Audit Log ทั้งหมด โดยอ่านจาก localStorage รวมกับ initialLogs
 */
export function getLiveAuditLogs(): AuditLog[] {
  if (typeof window === "undefined") return initialLogs;
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    if (!raw) return initialLogs;
    const parsed: AuditLog[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return initialLogs;

    // รวมกับ initialLogs โดยไม่ซ้ำ id
    const existingIds = new Set(parsed.map((l) => l.id));
    const combined = [...parsed];
    for (const log of initialLogs) {
      if (!existingIds.has(log.id)) {
        combined.push(log);
      }
    }
    return combined.sort((a, b) => b.id - a.id);
  } catch {
    return initialLogs;
  }
}

/**
 * เพิ่มรายการ Audit Log ใหม่ และบันทึกลง localStorage
 */
export function addAuditLog(
  action: string,
  detail: string,
  level: LogLevel = "normal",
  actor: string = currentUser.email,
  role: string = "IT Admin"
): AuditLog {
  const logs = getLiveAuditLogs();
  const maxId = logs.reduce((max, l) => Math.max(max, l.id), 0);
  const newLog: AuditLog = {
    id: maxId + 1,
    action,
    detail,
    level,
    at: nowLocal(),
    actor,
    role,
  };

  const updated = [newLog, ...logs];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  }
  return newLog;
}

/**
 * ดึงสิทธิ์การเข้าถึงจาก localStorage หรือคืนค่า initialPerms
 */
export function getLivePermissions(): Record<string, PermMap> {
  if (typeof window === "undefined") return initialPerms;
  try {
    const raw = localStorage.getItem(STORAGE_PERMS_KEY);
    if (!raw) return initialPerms;
    const parsed = JSON.parse(raw);
    return { ...initialPerms, ...parsed };
  } catch {
    return initialPerms;
  }
}

/**
 * บันทึกสิทธิ์การเข้าถึงลง localStorage
 */
export function savePermissions(
  position: string,
  perms: PermMap
): Record<string, PermMap> {
  const current = getLivePermissions();
  const updated = { ...current, [position]: perms };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_PERMS_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  }
  return updated;
}

// data/budget.ts
// เชื่อมโยงข้อมูลสวัสดิการ (data/benefit.ts) และการเงิน (data/finance.ts)
import { getLiveBenefitsData, type Benefits } from "./benefit";

export type RequestFund = "budget" | "reserve";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type BudgetRequest = {
  id: string | number;
  type: string;
  urgent: boolean;
  title: string;
  affected: number;
  date: string;
  detail: string;
  amount: number;
  fund: RequestFund;
  status?: ApprovalStatus;
  claimId?: string;
  empCode?: string;
  empName?: string;
  department?: string;
};

export type Expense = {
  year: number;
  month: number; // 0 = ม.ค. ... 11 = ธ.ค.
  title: string;
  amount: number;
  fund: RequestFund;
  claimId?: string;
};

export const monthNames = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

export const years = [2568, 2569, 2570];

export const yearBudget: Record<number, number> = {
  2568: 2_800_000,
  2569: 3_000_000,
  2570: 3_000_000,
};

const createExpense = (
  year: number,
  month: number,
  title: string,
  amount: number,
  fund: RequestFund = "budget"
): Expense => ({ year, month, title, amount, fund });

// รายการใช้จ่ายตั้งต้นตามประวัติของระบบ
export const initialExpenses: Expense[] = [
  // ปี 2568 (เดือนละ 1 รายการ)
  createExpense(2568, 0, "ค่ารักษาพยาบาล", 150_000),
  createExpense(2568, 1, "ค่าเล่าเรียนบุตร", 180_000),
  createExpense(2568, 2, "ตรวจสุขภาพประจำปี", 210_000),
  createExpense(2568, 3, "ค่ารักษาพยาบาล", 160_000),
  createExpense(2568, 4, "ค่าเล่าเรียนบุตร", 220_000),
  createExpense(2568, 5, "เงินช่วยเหลือคลอดบุตร", 190_000),
  createExpense(2568, 6, "ค่ารักษาพยาบาล", 140_000),
  createExpense(2568, 7, "ค่าเล่าเรียนบุตร", 230_000),
  createExpense(2568, 8, "ทุนการศึกษา", 170_000),
  createExpense(2568, 9, "ค่ารักษาพยาบาล", 200_000),
  createExpense(2568, 10, "เงินช่วยเหลืองานศพ", 180_000),
  createExpense(2568, 11, "เงินช่วยเหลือสมรส", 150_000),

  // ปี 2569 (ม.ค. - ก.ย.)
  createExpense(2569, 0, "ค่าเล่าเรียนบุตร", 120_000),
  createExpense(2569, 0, "ค่ารักษาพยาบาล", 80_000),
  createExpense(2569, 1, "ค่ารักษาพยาบาล", 95_000),
  createExpense(2569, 1, "เงินช่วยเหลืองานศพ", 30_000),
  createExpense(2569, 2, "ค่าเล่าเรียนบุตร", 180_000),
  createExpense(2569, 2, "ตรวจสุขภาพประจำปี", 150_000),
  createExpense(2569, 3, "เงินช่วยเหลือสมรส", 60_000),
  createExpense(2569, 3, "ค่ารักษาพยาบาล", 110_000),
  createExpense(2569, 4, "ค่าเล่าเรียนบุตร", 240_000),
  createExpense(2569, 4, "ค่ารักษาพยาบาล", 70_000),
  createExpense(2569, 5, "ค่าเล่าเรียนบุตร", 150_000),
  createExpense(2569, 5, "เงินช่วยเหลือคลอดบุตร", 90_000),
  createExpense(2569, 6, "ค่ารักษาพยาบาล", 130_000),
  createExpense(2569, 6, "ทุนการศึกษา", 100_000),
  createExpense(2569, 7, "ค่ารักษาพยาบาล", 85_000),
  createExpense(2569, 7, "เงินช่วยเหลืองานศพ", 45_000),
  createExpense(2569, 8, "ค่าเล่าเรียนบุตร", 175_000),
  createExpense(2569, 8, "ค่ารักษาพยาบาล", 90_000),
];

export const reserve = {
  limit: 500_000,
  used: 0,
};

// คำขออนุมัติตั้งต้น (นโยบาย และ งบฉุกเฉินระดับองค์กร)
export const initialRequests: BudgetRequest[] = [
  {
    id: 1,
    type: "นโยบาย",
    urgent: false,
    title: "ปรับวงเงินค่าเล่าเรียนบุตรประจำปี 2570",
    affected: 19,
    date: "12 ต.ค. 2569",
    amount: 360_000,
    fund: "budget",
    detail: "ขอปรับวงเงินจาก 12,000 เป็น 15,000 บาท/คน/ปี เนื่องจากค่าเล่าเรียนปรับตัวสูงขึ้น",
  },
  {
    id: 2,
    type: "งบประมาณฉุกเฉิน",
    urgent: true,
    title: "ขออนุมัติงบช่วยเหลือจากพนักงานประสบอุทกภัย",
    affected: 49,
    date: "29 ก.ย. 2569",
    amount: 250_000,
    fund: "reserve",
    detail: "พนักงาน 49 คนในพื้นที่ประสบอุทกภัย ต้องใช้ค่าที่พักชั่วคราวและซ่อมแซมที่อยู่อาศัย จึงขออนุมัติจากงบสำรองฉุกเฉิน",
  },
];

/**
 * ดึงรายการคำขออนุมัติทั้งหมด โดยเชื่อมต่อคำขอเบิกสวัสดิการสดจาก data/benefit.ts
 */
export function getLiveBudgetRequests(): BudgetRequest[] {
  const claims = getLiveBenefitsData();
  const claimRequests: BudgetRequest[] = [];

  for (const claim of claims) {
    // นำเฉพาะคำขอที่รอตรวจสอบ (pending_hr หรือ pending_document) มาแสดงในรายการรออนุมัติ
    if (claim.status === "pending_hr" || claim.status === "pending_document") {
      const isUrgent = claim.benefitCategory === "สวัสดิการน้ำท่วม";
      claimRequests.push({
        id: claim.claimId,
        type: "คำขอเบิกสวัสดิการ",
        urgent: isUrgent,
        title: `${claim.benefitCategory} (${claim.empName})`,
        affected: 1,
        date: claim.requestDate,
        amount: claim.amountRequested,
        fund: claim.benefitCategory === "สวัสดิการน้ำท่วม" ? "reserve" : "budget",
        detail: claim.details?.reason || `คำขอเบิก ${claim.benefitCategory} รหัส ${claim.claimId}`,
        claimId: claim.claimId,
        empCode: claim.empCode,
        empName: claim.empName,
        department: claim.department,
      });
    }
  }

  return [...initialRequests, ...claimRequests];
}

/**
 * ดึงรายการใช้จ่ายทั้งหมดของปีที่ระบุ โดยเชื่อมต่อรายการที่ได้รับอนุมัติสดจาก data/benefit.ts
 */
export function getLiveBudgetExpenses(year: number = 2569): Expense[] {
  const baseExpenses = initialExpenses.filter((x) => x.year === year);
  const claims = getLiveBenefitsData();
  const liveApprovedExpenses: Expense[] = [];

  for (const claim of claims) {
    if (claim.status === "approved" || claim.status === "success") {
      const parts = (claim.requestDate || "").split("/");
      const claimYear = parts.length === 3 ? parseInt(parts[2], 10) : 2569;
      const claimMonth = parts.length >= 2 ? Math.max(0, parseInt(parts[1], 10) - 1) : 10;

      if (claimYear === year) {
        liveApprovedExpenses.push({
          year: claimYear,
          month: claimMonth,
          title: `${claim.benefitCategory} (${claim.empName})`,
          amount: claim.approvedAmount || claim.amountRequested,
          fund: claim.benefitCategory === "สวัสดิการน้ำท่วม" ? "reserve" : "budget",
          claimId: claim.claimId,
        });
      }
    }
  }

  return [...baseExpenses, ...liveApprovedExpenses];
}

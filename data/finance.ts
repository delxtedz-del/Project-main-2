import { getLiveBenefitsData, Benefits } from "./benefit";

export type NavTab = "dashboard" | "transfers" | "requests" | "pay-cycles" | "reports" | "benefits";

export interface TransferItem {
  id: string;
  date: string;
  refNo: string;
  recipient: string;
  channel: string;
  amount: number;
  status: "pending" | "approved";
  category?: string;
  claimId?: string;
}

export interface PaymentRequestItem {
  id: string;
  empId: string;
  empName: string;
  amount: number;
  status: "paid" | "pending" | "approved";
  dueDate: string;
  benefitCategory?: string;
  claimId?: string;
  department?: string;
  source?: "benefit" | "general";
}

export interface ChannelReportItem {
  channel: string;
  count: number;
  preTaxAmount: number;
  whtAmount: number;
  vatAmount: number;
  netAmount: number;
}

export interface PayCycleSettings {
  cutoffDay: string;
  payDay: string;
  updatedAt?: string;
}

export interface MonthlyChartData {
  month: string;
  amount: number;
}

export const INITIAL_TRANSFERS: TransferItem[] = [
  { id: "1", date: "18/10/2569", refNo: "TR-2569-0184", recipient: "บริษัท สยามซัพพลาย จำกัด", channel: "ธนาคารกสิกรไทย", amount: 103688, status: "pending", category: "จัดซื้อพัสดุ" },
  { id: "2", date: "14/10/2569", refNo: "TR-2569-0182", recipient: "หจก. รุ่งเรืองการช่าง", channel: "เช็ค", amount: 84136, status: "pending", category: "ซ่อมบำรุง" },
  { id: "3", date: "11/10/2569", refNo: "TR-2569-0181", recipient: "บริษัท นอร์ทเทิร์นฟู้ดส์ จำกัด", channel: "ธนาคารกรุงเทพ", amount: 245804, status: "approved", category: "อาหารและเครื่องดื่ม" },
  { id: "4", date: "24/09/2569", refNo: "TR-2569-0179", recipient: "นางสาวปิยะดา อินทรีย์", channel: "ธนาคารออมสิน", amount: 45968, status: "approved", category: "เบี้ยเลี้ยงพนักงาน" },
  { id: "5", date: "09/09/2569", refNo: "TR-2569-0176", recipient: "บริษัท แอสเทิร์นพาร์ท จำกัด", channel: "ธนาคารไทยพาณิชย์", amount: 163072, status: "approved", category: "อุปกรณ์ไอที" },
];

export const INITIAL_REQUESTS: PaymentRequestItem[] = [
  { id: "1", empId: "CS-001", empName: "นาย ปฏิพัทธ์ สร้างตั้น", amount: 28500, status: "paid", dueDate: "จ่ายเมื่อ 27/10/2569", department: "ฝ่ายบริการลูกค้า", source: "general" },
  { id: "2", empId: "CS-002", empName: "นางสาว จอร์จ ซาร่า", amount: 34200, status: "paid", dueDate: "จ่ายเมื่อ 27/10/2569", department: "ฝ่ายบริการลูกค้า", source: "general" },
  { id: "3", empId: "SAL-004", empName: "นาย อรรถพล มั่นคง", amount: 41900, status: "paid", dueDate: "จ่ายเมื่อ 27/10/2569", department: "ฝ่ายขาย", source: "general" },
  { id: "4", empId: "SAL-006", empName: "นางสาว ศิริพร บุญมี", amount: 26750, status: "paid", dueDate: "จ่ายเมื่อ 27/10/2569", department: "ฝ่ายขาย", source: "general" },
  { id: "5", empId: "CS-005", empName: "นาย ภูมิพัฒน์ รัตนบำรุง", amount: 52400, status: "paid", dueDate: "จ่ายเมื่อ 30/09/2569", department: "ฝ่ายบริการลูกค้า", source: "general" },
  { id: "6", empId: "SAL-007", empName: "นางสาว อุทุมพร ใจดี", amount: 31000, status: "paid", dueDate: "จ่ายเมื่อ 30/09/2569", department: "ฝ่ายขาย", source: "general" },
];

export const INITIAL_REPORTS: ChannelReportItem[] = [
  { channel: "ธนาคารกรุงเทพ", count: 3, preTaxAmount: 791350, whtAmount: 23440.5, vatAmount: 54694.5, netAmount: 812604 },
  { channel: "ธนาคารกสิกรไทย", count: 3, preTaxAmount: 269700, whtAmount: 8091, vatAmount: 18879, netAmount: 280488 },
  { channel: "เช็ค", count: 3, preTaxAmount: 204900, whtAmount: 6697, vatAmount: 14343, netAmount: 212546 },
  { channel: "ธนาคารไทยพาณิชย์", count: 2, preTaxAmount: 160000, whtAmount: 4800, vatAmount: 11200, netAmount: 166400 },
];

export const MOCK_CHART_DATA: MonthlyChartData[] = [
  { month: "พ.ค. 69", amount: 60000 },
  { month: "มิ.ย. 69", amount: 350000 },
  { month: "ก.ค. 69", amount: 170000 },
  { month: "ส.ค. 69", amount: 340000 },
  { month: "ก.ย. 69", amount: 200000 },
  { month: "ต.ค. 69", amount: 435000 },
];

export const DEFAULT_PAY_CYCLE_SETTINGS: PayCycleSettings = {
  cutoffDay: "25",
  payDay: "30",
};

const STORAGE_KEYS = {
  TRANSFERS: "edbms_finance_transfers",
  REQUESTS: "edbms_finance_requests",
  REPORTS: "edbms_finance_reports",
  PAY_CYCLE: "edbms_pay_cycle_settings",
};

/**
 * ดึงรายการโอนเงินทั้งหมด (ประสานข้อมูล Storage + Mock Data)
 */
export function getLiveTransfers(): TransferItem[] {
  let stored: TransferItem[] = [];
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
      if (data) {
        stored = JSON.parse(data);
      }
    } catch {
      // fallback
    }
  }

  if (stored && stored.length > 0) {
    return stored;
  }

  return INITIAL_TRANSFERS;
}

/**
 * บันทึกรายการโอนเงิน
 */
export function saveTransfers(items: TransferItem[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(items));
    } catch {
      // ignore
    }
  }
}

/**
 * สลับสถานะรายการโอนเงิน (pending <-> approved)
 */
export function toggleTransferStatus(id: string): TransferItem[] {
  const current = getLiveTransfers();
  const updated = current.map((item) =>
    item.id === id
      ? { ...item, status: (item.status === "pending" ? "approved" : "pending") as "pending" | "approved" }
      : item
  );
  saveTransfers(updated);
  return updated;
}

/**
 * เพิ่มรายการโอนเงินใหม่
 */
export function addTransfer(item: Omit<TransferItem, "id">): TransferItem[] {
  const current = getLiveTransfers();
  const newItem: TransferItem = {
    ...item,
    id: Date.now().toString(),
  };
  const updated = [newItem, ...current];
  saveTransfers(updated);
  return updated;
}

/**
 * แปลงข้อมูลคำขอเบิกสวัสดิการจาก data/benefit.ts เป็น PaymentRequestItem
 */
export function mapBenefitClaimToPaymentRequest(claim: Benefits): PaymentRequestItem {
  let status: "paid" | "approved" | "pending" = "pending";
  if (claim.status === "success") {
    status = "paid";
  } else if (claim.status === "approved") {
    status = "approved";
  } else {
    status = "pending";
  }

  let dueDate = "รอระบุรอบตัด";
  if (claim.disbursement) {
    dueDate = `จ่ายเมื่อ ${claim.disbursement}`;
  } else if (claim.cutoffdate) {
    dueDate = `รอบตัด ${claim.cutoffdate}`;
  }

  const amount =
    typeof claim.approvedAmount === "number" && claim.approvedAmount > 0
      ? claim.approvedAmount
      : claim.amountRequested;

  return {
    id: `benefit-${claim.claimId}`,
    empId: claim.empCode,
    empName: claim.empName,
    amount,
    status,
    dueDate,
    benefitCategory: claim.benefitCategory,
    claimId: claim.claimId,
    department: claim.department,
    source: "benefit",
  };
}

/**
 * ดึงรายการคำขอจ่ายเงินทั้งหมด (ผสานข้อมูลคำขอจ่ายเงินทั่วไป + คำขอเบิกสวัสดิการจาก data/benefit.ts)
 */
export function getLivePaymentRequests(): PaymentRequestItem[] {
  let customRequests: PaymentRequestItem[] = [];
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (data) {
        customRequests = JSON.parse(data);
      }
    } catch {
      // fallback
    }
  }

  if (customRequests.length === 0) {
    customRequests = INITIAL_REQUESTS;
  }

  // ดึงรายการเบิกสวัสดิการสดๆ จาก benefit.ts (รวม seed data + ที่พนักงานยื่นใหม่)
  let benefitRequests: PaymentRequestItem[] = [];
  try {
    const liveBenefits = getLiveBenefitsData();
    benefitRequests = liveBenefits.map(mapBenefitClaimToPaymentRequest);
  } catch {
    // fallback if benefit module not yet hydrated
  }

  // นำมารวมกัน โดยให้คำขอสวัสดิการพนักงานขึ้นแสดงร่วมกับคำขอจ่ายเงิน
  return [...benefitRequests, ...customRequests];
}

/**
 * เพิ่มคำขอจ่ายเงินใหม่
 */
export function addPaymentRequest(item: Omit<PaymentRequestItem, "id">): PaymentRequestItem[] {
  let customRequests: PaymentRequestItem[] = [];
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (data) {
        customRequests = JSON.parse(data);
      }
    } catch {
      // ignore
    }
  }

  if (customRequests.length === 0) {
    customRequests = [...INITIAL_REQUESTS];
  }

  const newItem: PaymentRequestItem = {
    ...item,
    id: Date.now().toString(),
    source: "general",
  };

  const updated = [newItem, ...customRequests];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return getLivePaymentRequests();
}

/**
 * อ่านการตั้งค่ารอบจ่ายเงิน
 */
export function getPayCycleSettings(): PayCycleSettings {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAY_CYCLE);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
  }
  return DEFAULT_PAY_CYCLE_SETTINGS;
}

/**
 * บันทึกการตั้งค่ารอบจ่ายเงิน
 */
export function savePayCycleSettings(settings: PayCycleSettings): PayCycleSettings {
  const updated: PayCycleSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.PAY_CYCLE, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
  return updated;
}

/**
 * ดึงรายงานสรุปตามช่องทาง
 */
export function getLiveChannelReports(): ChannelReportItem[] {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
  }
  return INITIAL_REPORTS;
}

/**
 * บันทึกรายงานสรุปตามช่องทาง
 */
export function saveChannelReports(reports: ChannelReportItem[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    } catch {
      // ignore
    }
  }
}

import { Benefits, ClaimStatus } from "@/data/benefit";

const THAI_SHORT_MONTHS = [
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

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  approved: "รอเบิก",
  pending_document: "รอส่งเอกสาร",
  pending_hr: "รอตรวจสอบ",
  success: "เบิกสำเร็จ",
  rejected: "ไม่อนุมัติ",
};

export const CLAIM_STATUS_OPTIONS: { value: ClaimStatus | ""; label: string }[] = [
  { value: "", label: "ทั้งหมด" },
  { value: "approved", label: CLAIM_STATUS_LABELS.approved },
  { value: "pending_document", label: CLAIM_STATUS_LABELS.pending_document },
  { value: "pending_hr", label: CLAIM_STATUS_LABELS.pending_hr },
  { value: "success", label: CLAIM_STATUS_LABELS.success },
  { value: "rejected", label: CLAIM_STATUS_LABELS.rejected },
];

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

/**
 * แปลงวันที่รูปแบบ "DD/MM/YYYY" (พ.ศ.) เป็น "DD ม.ค. YYYY" เช่น "02/11/2569" -> "02 พ.ย. 2569"
 */
export function formatThaiShortDate(thaiSlashDate?: string | null): string {
  if (!thaiSlashDate) return "-";
  const parts = thaiSlashDate.split("/");
  if (parts.length !== 3) return thaiSlashDate;
  const [day, monthStr, year] = parts;
  const monthIdx = Number(monthStr) - 1;
  const monthLabel = THAI_SHORT_MONTHS[monthIdx];
  if (!monthLabel) return thaiSlashDate;
  return `${day.padStart(2, "0")} ${monthLabel} ${year}`;
}

/**
 * แปลง ISO date ("YYYY-MM-DD" ค.ศ.) เป็น "DD พ.ย. 2569" สำหรับแสดงบนตัวกรองปฏิทิน
 */
export function formatIsoToThaiShortDate(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  const thaiYear = String(Number(y) + 543);
  return formatThaiShortDate(`${d}/${m}/${thaiYear}`);
}

/**
 * แปลง ISO date ("YYYY-MM-DD" ค.ศ.) เป็น "DD/MM/YYYY" (พ.ศ.) เพื่อเทียบกับ requestDate / cutoffdate
 */
export function isoToThaiSlashDate(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${Number(y) + 543}`;
}

/**
 * สร้างชื่อหมวดหมู่สวัสดิการที่แสดงในตาราง (ต่อท้าย "(เบิกแทน)" เมื่อเป็นการเบิกแทน/ครอบครัว)
 **/
export function getClaimCategoryTitle(claim: Benefits): string {
  const isProxy =
    claim.claimType === "ครอบครัว" || claim.claimType?.includes("แทน");
  return isProxy && !claim.benefitCategory.includes("เบิกแทน")
    ? `${claim.benefitCategory} (เบิกแทน)`
    : claim.benefitCategory;
}

/**
 * ดึงข้อความบรรทัดรองของรายละเอียดคำขอ
 */
export function getClaimSubtitle(claim: Benefits): string | null {
  if (claim.details?.familyMemberName) {
    return `เบิกให้ ${claim.details.familyMemberName}`;
  }
  if (claim.details?.certificateName) {
    return String(claim.details.certificateName);
  }
  if (claim.details?.reason) {
    return String(claim.details.reason);
  }
  return null;
}

/**
 * ตรวจสอบว่าคำขอมีคำค้นหาแบบ substring (.includes) คล้าย Ctrl+F หรือไม่
 */
export function matchesClaimSearch(claim: Benefits, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;

  const statusLabel = CLAIM_STATUS_LABELS[claim.status] ?? claim.status;
  const categoryTitle = getClaimCategoryTitle(claim);
  const subtitle = getClaimSubtitle(claim) ?? "";
  const shortReqDate = formatThaiShortDate(claim.requestDate);
  const shortDisbursement = formatThaiShortDate(claim.disbursement);

  const searchableFields = [
    claim.claimId,
    claim.empCode,
    claim.empName,
    claim.department,
    claim.benefitCategory,
    categoryTitle,
    claim.benefitId,
    claim.claimType,
    claim.requestDate,
    shortReqDate,
    claim.cutoffdate,
    claim.disbursement ?? "",
    shortDisbursement,
    String(claim.amountRequested),
    claim.amountRequested.toLocaleString("en-US"),
    statusLabel,
    claim.status,
    subtitle,
    claim.details?.reason ?? "",
  ];

  return searchableFields.some((field) =>
    field.toLowerCase().includes(query)
  );
}

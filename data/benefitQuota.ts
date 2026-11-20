import {
  BENEFIT_POLICIES,
  BenefitPolicy,
  BenefitPolicyId,
  Benefits,
  getLiveBenefitsData,
} from "@/data/benefit";

export interface BenefitQuotaInfo {
  policy: BenefitPolicy;
  isExhausted: boolean;
  remainingLabel: string;
  remainingAmount: number | null;
  remainingCount: number | null;
  usedAmount: number;
  usedCount: number;
}

export interface YearlyEmployeeQuotaRecord {
  empCode: string;
  fiscalYear: string;
  updatedAt: string;
  quotas: Record<
    string,
    {
      remainingAmount: number | null;
      remainingCount: number | null;
      usedAmount: number;
      usedCount: number;
      isExhausted: boolean;
      remainingLabel: string;
    }
  >;
}

// ขีดจำกัดเฉพาะบุคคล (Mock สำหรับปรับแต่งรายพนักงานหากมีเงื่อนไขพิเศษในอนาคต)
export const PERSONAL_QUOTA_OVERRIDES: Record<
  string,
  Partial<Record<BenefitPolicyId, { maxAmount?: number; maxCount?: number }>>
> = {};

/**
 * คำนวณสิทธิ์คงเหลือของแต่ละสวัสดิการสำหรับพนักงานรายคนประจำปี
 * โดยคำนวณจาก BENEFIT_POLICIES ลบด้วยยอด/จำนวนครั้งที่เบิกจริง
 */
export function getBenefitQuotaInfo(
  policy: BenefitPolicy,
  claims: Benefits[],
  fiscalYear: string,
  empCode?: string
): BenefitQuotaInfo {
  const override = empCode
    ? PERSONAL_QUOTA_OVERRIDES[empCode]?.[policy.id]
    : undefined;
  const effectiveMaxCount = override?.maxCount ?? policy.maxCount;
  const effectiveMaxAmount =
    override?.maxAmount ??
    (typeof policy.maxAmount === "number" ? policy.maxAmount : null);

  const isLifetime =
    policy.amountUnit === "lifetime" || policy.countUnit === "lifetime";

  const matchingClaims = claims.filter((c) => {
    if (c.benefitId !== policy.id || c.status === "rejected") return false;
    if (isLifetime) return true;
    return c.requestDate?.split("/")[2] === fiscalYear;
  });

  const usedCount = matchingClaims.length;
  const usedAmount = matchingClaims.reduce((sum, c) => {
    const amt =
      c.status === "approved" || c.status === "success"
        ? c.approvedAmount || c.amountRequested
        : c.amountRequested;
    return sum + (amt || 0);
  }, 0);

  // เงื่อนไขรายครั้งแบบไม่จำกัดจำนวนครั้ง (เช่น คลอดบุตร, ฌาปนกิจ)
  if (policy.amountUnit === "per_time" && policy.countUnit === "unlimited") {
    const limit = effectiveMaxAmount ?? 0;
    return {
      policy,
      isExhausted: false,
      remainingLabel: `${limit.toLocaleString("en-US")} บาท/ครั้ง`,
      remainingAmount: limit,
      remainingCount: null,
      usedAmount,
      usedCount,
    };
  }

  // สิทธิตลอดอายุงาน (เช่น ทุนการศึกษาระดับปริญญา)
  if (isLifetime && effectiveMaxCount !== null) {
    const remaining = Math.max(0, effectiveMaxCount - usedCount);
    const isExhausted = remaining <= 0;
    return {
      policy,
      isExhausted,
      remainingLabel: isExhausted ? "หมดสิทธิ์" : "ตามเงื่อนไข",
      remainingAmount: null,
      remainingCount: remaining,
      usedAmount,
      usedCount,
    };
  }

  // จำกัดจำนวนครั้งต่อปี (เช่น ค่ารักษาพยาบาลพนักงาน 30 ครั้ง, ตรวจสุขภาพ 1 ครั้ง, น้ำท่วม 1 ครั้ง)
  if (effectiveMaxCount !== null && policy.countUnit === "per_year") {
    const remaining = Math.max(0, effectiveMaxCount - usedCount);
    const isExhausted = remaining <= 0;
    return {
      policy,
      isExhausted,
      remainingLabel: isExhausted
        ? "หมดสิทธิ์"
        : `${remaining.toLocaleString("en-US")} ครั้ง`,
      remainingAmount: null,
      remainingCount: remaining,
      usedAmount,
      usedCount,
    };
  }

  // จำกัดวงเงินต่อปี (เช่น ทันตกรรม, รักษาพยาบาลครอบครัว, Certifications, นันทนาการ, AI)
  const maxAmount = effectiveMaxAmount ?? 0;
  const remaining = Math.max(0, maxAmount - usedAmount);
  const isExhausted = remaining <= 0;
  return {
    policy,
    isExhausted,
    remainingLabel: isExhausted
      ? "หมดสิทธิ์"
      : `${remaining.toLocaleString("en-US")} บาท`,
    remainingAmount: remaining,
    remainingCount: null,
    usedAmount,
    usedCount,
  };
}

export function getAllBenefitQuotas(
  policies: BenefitPolicy[] = BENEFIT_POLICIES,
  claims: Benefits[],
  fiscalYear: string,
  empCode?: string
): BenefitQuotaInfo[] {
  return policies.map((policy) =>
    getBenefitQuotaInfo(policy, claims, fiscalYear, empCode)
  );
}

/**
 * บันทึกและอัปเดตสิทธิ์คงเหลือรายคนประจำปีลง localStorage
 */
export function syncEmployeeYearlyQuota(
  empCode: string,
  fiscalYear: string,
  policies: BenefitPolicy[] = BENEFIT_POLICIES,
  claims?: Benefits[]
): YearlyEmployeeQuotaRecord {
  const empClaims =
    claims ??
    getLiveBenefitsData().filter((item) => item.empCode === empCode);

  const quotaList = getAllBenefitQuotas(
    policies,
    empClaims,
    fiscalYear,
    empCode
  );

  const record: YearlyEmployeeQuotaRecord = {
    empCode,
    fiscalYear,
    updatedAt: new Date().toISOString(),
    quotas: Object.fromEntries(
      quotaList.map((q) => [
        q.policy.id,
        {
          remainingAmount: q.remainingAmount,
          remainingCount: q.remainingCount,
          usedAmount: q.usedAmount,
          usedCount: q.usedCount,
          isExhausted: q.isExhausted,
          remainingLabel: q.remainingLabel,
        },
      ])
    ),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        `benefitQuota_${empCode}_${fiscalYear}`,
        JSON.stringify(record)
      );
    } catch {
      // ignore storage quota errors
    }
  }

  return record;
}

/**
 * ดึงโควต้าคงเหลือประจำปี:
 * - ปีปัจจุบัน: อ่านจาก localStorage ทันที (ไม่ต้องคำนวณใหม่ทุกรอบ) หากยังไม่มีจึงคำนวณและบันทึกไว้
 * - ปีอื่น: คำนวณใหม่จากรายการเบิกของปีนั้นๆ ตามปกติ
 */
export function getEmployeeQuotasFast(
  empCode: string,
  fiscalYear: string,
  currentFiscalYear: string,
  policies: BenefitPolicy[] = BENEFIT_POLICIES,
  claims?: Benefits[]
): BenefitQuotaInfo[] {
  if (typeof window !== "undefined" && fiscalYear === currentFiscalYear) {
    try {
      const raw = localStorage.getItem(`benefitQuota_${empCode}_${fiscalYear}`);
      if (raw) {
        const cached = JSON.parse(raw) as YearlyEmployeeQuotaRecord;
        if (cached?.quotas) {
          return policies.map((policy) => {
            const q = cached.quotas[policy.id];
            if (q) {
              return {
                policy,
                remainingAmount: q.remainingAmount,
                remainingCount: q.remainingCount,
                usedAmount: q.usedAmount ?? 0,
                usedCount: q.usedCount ?? 0,
                isExhausted: q.isExhausted,
                remainingLabel: q.remainingLabel,
              };
            }
            const empClaims =
              claims ??
              getLiveBenefitsData().filter((item) => item.empCode === empCode);
            return getBenefitQuotaInfo(policy, empClaims, fiscalYear, empCode);
          });
        }
      }
    } catch {
      // fall through to compute
    }
  }

  const empClaims =
    claims ??
    getLiveBenefitsData().filter((item) => item.empCode === empCode);
  const computed = getAllBenefitQuotas(policies, empClaims, fiscalYear, empCode);

  if (typeof window !== "undefined" && fiscalYear === currentFiscalYear) {
    syncEmployeeYearlyQuota(empCode, fiscalYear, policies, empClaims);
  }

  return computed;
}

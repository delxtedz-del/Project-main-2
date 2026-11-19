"use client";

import { Button } from "@/components/tailgrids/core/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/tailgrids/core/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import Clock from "@/components/Clock";
import {
  BENEFIT_POLICIES,
  BenefitPolicy,
  BenefitPolicyId,
  Benefits,
  benefitsSort,
  fetchBenefitsPolicy,
} from "@/data/benefit";
import { User } from "@/data/Login";
import { Bell, ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const FISCAL_YEARS = ["2569", "2568", "2567", "2566"];

const DEFAULT_USER: User = {
  empCode: "CS-001",
  email: "cs1@thaibmamail.com",
  password: "",
  role: "EMP",
  level: 1,
};

const POLICY_GROUPS: { title: string; ids: BenefitPolicyId[] }[] = [
  {
    title: "ด้านการรักษาพยาบาลและสุขภาพพนักงาน",
    ids: ["BEN-02", "BEN-10", "BEN-09"],
  },
  {
    title: "ด้านครอบครัวและเงินช่วยเหลือ",
    ids: ["BEN-03", "BEN-06", "BEN-07"],
  },
  {
    title: "ด้านการเรียนรู้และพัฒนาทักษะ",
    ids: ["BEN-04", "BEN-05"],
  },
  {
    title: "ด้านไลฟ์สไตล์และเทคโนโลยี",
    ids: ["BEN-08", "BEN-11"],
  },
];

const UNIT_SUFFIX: Record<BenefitPolicy["amountUnit"], string> = {
  per_time: "บ./ครั้ง",
  per_year: "บ./ปี",
  lifetime: "บ.",
};

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (err === "ไม่พบข้อมูลการเบิกสวัสดิการ") throw err;
    }
  }
  throw lastError;
}

function getStatusText(item: Benefits): string {
  switch (item.status) {
    case "pending_document":
      return "รอส่งเอกสารฉบับจริง";
    case "pending_hr":
      return "รอฝ่ายบุคคลอนุมัติ";
    case "approved":
      return `จะได้รับเงิน ${item.disbursement ?? item.cutoffdate}`;
    default:
      return "";
  }
}

function getPolicyDescription(policy: BenefitPolicy): string[] {
  const lines: string[] = [];
  if (typeof policy.maxAmount === "number") {
    const suffix = policy.subLimits ? "บ. โดยแบ่งเป็น" : UNIT_SUFFIX[policy.amountUnit];
    lines.push(`เบิกได้ไม่เกิน ${policy.maxAmount.toLocaleString("en-US")} ${suffix}`);
  } else if (policy.maxCount && policy.countUnit === "per_year") {
    lines.push(`เบิกได้ไม่เกิน ${policy.maxCount} ครั้ง/ปี`);
  }

  if (policy.subLimits) {
    policy.subLimits.forEach((sub) => {
      lines.push(`• ${sub.label} ไม่เกิน ${sub.maxAmount.toLocaleString("en-US")} บ.`);
    });
  }

  if (policy.id === "BEN-04" && policy.maxCount) {
    lines.push(`เบิกได้เพียง ${policy.maxCount} หลักสูตรครั้งเดียวเท่านั้น`);
  }

  return lines;
}

export default function Page() {
  const router = useRouter();
  const [benefit, setBenefit] = useState<Benefits[]>([]);
  const [policies, setPolicies] = useState<BenefitPolicy[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("2569");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    const loadDashboardData = async () => {
      if (Array.isArray(BENEFIT_POLICIES)) {
        setPolicies(BENEFIT_POLICIES);
      }

      let parsedUser: User = DEFAULT_USER;
      try {
        const rawUser = localStorage.getItem("currentUser");
        if (rawUser) parsedUser = JSON.parse(rawUser) as User;
      } catch {
        parsedUser = DEFAULT_USER;
      }

      const [claimsResult, policyResult] = await Promise.allSettled([
        withRetry(() => benefitsSort(parsedUser.empCode)),
        withRetry(() => fetchBenefitsPolicy()),
      ]);

      if (!active) return;

      if (claimsResult.status === "fulfilled" && Array.isArray(claimsResult.value)) {
        setBenefit(claimsResult.value);
        try {
          localStorage.setItem("userBenefit", JSON.stringify(claimsResult.value));
        } catch {
          // ignore storage quota errors
        }
      } else {
        setBenefit([]);
      }

      if (policyResult.status === "fulfilled" && Array.isArray(policyResult.value)) {
        setPolicies(policyResult.value);
      }

      setLoading(false);
    };

    loadDashboardData();
    return () => {
      active = false;
    };
  }, []);

  const pendingClaims = useMemo(
    () =>
      (benefit ?? []).filter(
        (b) =>
          b.status === "pending_document" ||
          b.status === "pending_hr" ||
          b.status === "approved"
      ),
    [benefit]
  );

  const policyMap = useMemo(
    () => new Map((policies ?? []).map((p) => [p.id, p])),
    [policies]
  );

  const getQuotaDisplay = (policy: BenefitPolicy) => {
    const isLifetime =
      policy.amountUnit === "lifetime" || policy.countUnit === "lifetime";

    const matchingClaims = benefit.filter((c) => {
      if (c.benefitId !== policy.id || c.status === "rejected") return false;
      if (isLifetime) return true;
      return c.requestDate?.split("/")[2] === selectedYear;
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
      const limit = typeof policy.maxAmount === "number" ? policy.maxAmount : 0;
      return {
        labelLeft: "เงื่อนไข",
        currentText: limit.toLocaleString("en-US"),
        totalText: "/ ครั้ง",
        percent: 0,
        showBar: false,
      };
    }

    // สิทธิตลอดอายุงาน (เช่น ทุนปริญญา)
    if (isLifetime && policy.maxCount !== null) {
      const remaining = Math.max(0, policy.maxCount - usedCount);
      return {
        labelLeft: "คงเหลือ",
        currentText: remaining > 0 ? "ตามเกณฑ์เงื่อนไข" : "ใช้สิทธิ์แล้ว",
        totalText: "",
        percent: remaining > 0 ? 100 : 0,
        showBar: true,
      };
    }

    // จำกัดจำนวนครั้งต่อปี (เช่น ค่ารักษาพยาบาลพนักงาน 30 ครั้ง, ตรวจสุขภาพ 1 ครั้ง)
    if (policy.maxCount !== null && policy.countUnit === "per_year") {
      const remaining = Math.max(0, policy.maxCount - usedCount);
      return {
        labelLeft: "คงเหลือ",
        currentText: remaining.toLocaleString("en-US"),
        totalText: `/ ${policy.maxCount.toLocaleString("en-US")} ครั้ง`,
        percent: policy.maxCount > 0 ? (remaining / policy.maxCount) * 100 : 0,
        showBar: true,
      };
    }

    // จำกัดวงเงินต่อปี (เช่น ทันตกรรม, รักษาพยาบาลครอบครัว, Certifications, นันทนาการ, AI)
    const maxAmount = typeof policy.maxAmount === "number" ? policy.maxAmount : 0;
    const remaining = Math.max(0, maxAmount - usedAmount);
    return {
      labelLeft: "คงเหลือ",
      currentText: remaining.toLocaleString("en-US"),
      totalText: `/ ${maxAmount.toLocaleString("en-US")} บาท`,
      percent: maxAmount > 0 ? (remaining / maxAmount) * 100 : 0,
      showBar: true,
    };
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-7 text-black md:px-12">
      {/* Top Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            ภาพรวม
          </h1>
          <p className="mt-1 text-sm text-black/50">
            แสดงข้อมูลสวัสดิการและสวัสดิการที่รอเบิก
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm text-black/80">
          <Clock className="font-medium" />
          <button
            type="button"
            aria-label="การแจ้งเตือน"
            className="rounded-full p-1.5 text-black/70 transition hover:bg-black/5 hover:text-black"
          >
            <Bell className="size-5" />
          </button>
        </div>
      </div>

      {/* Top Row: Billing Cycle + Pending Claims */}
      <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="justify-between rounded-2xl border border-gray-200 bg-white shadow-sm md:min-w-0 lg:col-span-4">
          <CardHeader className="px-6 pt-6 pb-0">
            <CardTitle className="text-lg font-semibold text-black">
              รอบบิลปัจจุบัน
            </CardTitle>
          </CardHeader>

          <CardContent className="px-6 pt-4 pb-2 text-black">
            <p className="text-base font-medium">1 พ.ย. - 30 พ.ย.</p>
            <p className="mt-1 text-xs text-black/60">
              (กรุณายื่นเบิกภายในวันที่ 3 ธ.ค. เพื่อรับเงินรอบเดือนนี้)
            </p>
          </CardContent>

          <CardFooter className="px-6 pt-3 pb-6">
            <Button
              type="button"
              onClick={() => router.push("/claim")}
              className="w-full rounded-lg bg-anyprimary-green-700 py-2.5 text-sm font-medium text-white hover:bg-[#0c4337]"
            >
              <Plus className="size-4" />
              เบิกสวัสดิการ
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:min-w-0 lg:col-span-8">
          <div className="flex items-center justify-between bg-anyprimary-green-700 px-6 py-3.5 text-white">
            <h2 className="text-base font-medium">รายการรอเบิก</h2>
            <div className="flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3 py-1 text-sm">
              <span className="font-semibold text-foreground-sandybrown">
                {loading ? "-" : pendingClaims.length}
              </span>
              <span>รายการ</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100 px-6 py-2">
            {loading ? (
              <div className="py-8 text-center text-sm text-black/45">
                กำลังโหลดรายการรอเบิก...
              </div>
            ) : pendingClaims.length === 0 ? (
              <div className="py-8 text-center text-sm text-black/45">
                ไม่มีรายการรอเบิก
              </div>
            ) : (
              pendingClaims.map((item) => (
                <div
                  key={item.claimId}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span className="size-2.5 shrink-0 rounded-full bg-gray-300" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-black">
                        {item.benefitCategory}
                      </p>
                      <p className="truncate text-xs text-black/45">
                        {item.details?.reason}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right text-xs font-medium text-black/70">
                    {getStatusText(item)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Fiscal Year Filter Header */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-black">
          วงเงินสวัสดิการคงเหลือ
        </h2>

        <DropdownMenu>
          <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-black shadow-xs transition hover:bg-gray-50">
            <span>ปีงบประมาณ {selectedYear}</span>
            <ChevronDown className="size-4 text-gray-500 transition-transform group-data-[state=open]:rotate-180" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-44 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
            <DropdownMenuSection>
              <DropdownMenuHeader className="px-3 py-1.5 text-xs font-medium text-gray-400">
                ปีงบประมาณ
              </DropdownMenuHeader>
              {FISCAL_YEARS.map((year) => (
                <DropdownMenuItem
                  key={year}
                  id={year}
                  onAction={() => setSelectedYear(year)}
                  className={`cursor-pointer rounded-lg px-3 py-2 text-sm transition ${
                    selectedYear === year
                      ? "bg-anyprimary-green-700/10 font-medium text-anyprimary-green-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>ปีงบประมาณ {year}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSection>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Benefit Quota Groups (Driven by policies state) */}
      <div className="mt-5 flex flex-col gap-5">
        {POLICY_GROUPS.map((group) => (
          <section
            key={group.title}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center gap-2.5">
              <span className="h-5 w-0.5 rounded-full bg-anyprimary-green-700" />
              <h3 className="text-base font-semibold text-black">
                {group.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
              {group.ids.map((id) => {
                const policy = policyMap.get(id);
                if (!policy) return null;
                const quota = getQuotaDisplay(policy);
                const description = getPolicyDescription(policy);

                return (
                  <div
                    key={policy.id}
                    className="flex flex-col justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-black">
                        {policy.name}
                      </h4>
                      <div className="mt-1 space-y-0.5 text-xs leading-relaxed text-black/45">
                        {description.map((line, idx) => (
                          <p key={idx}>{line}</p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="text-black/70">{quota.labelLeft}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-black">
                            {quota.currentText}
                          </span>
                          {quota.totalText && (
                            <span className="ml-1 text-xs text-black/45">
                              {quota.totalText}
                            </span>
                          )}
                        </div>
                      </div>

                      {quota.showBar && (
                        <div
                          className="mt-2 h-2.5 w-full overflow-hidden rounded-full border border-[#e3dfd5]"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(135deg, #f5f2eb 0px, #f5f2eb 4px, #e8e3d7 4px, #e8e3d7 8px)",
                          }}
                        >
                          <div
                            className="h-full rounded-full bg-anyprimary-green-700 transition-all duration-300"
                            style={{ width: `${quota.percent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

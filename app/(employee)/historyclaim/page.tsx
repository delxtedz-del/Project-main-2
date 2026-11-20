"use client";

import { ClaimHistorySection } from "@/components/claim/ClaimHistorySection";
import Clock from "@/components/Clock";
import {
  Benefits,
  benefitsSort,
  ClaimStatus,
  getLiveBenefitsData,
} from "@/data/benefit";
import { User } from "@/data/Login";
import { Bell } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const VALID_STATUSES: Set<ClaimStatus> = new Set([
  "approved",
  "pending_document",
  "pending_hr",
  "success",
  "rejected",
]);

const DEFAULT_USER: User = {
  empCode: "CS-001",
  email: "cs1@thaibmamail.com",
  password: "",
  role: "EMP",
  level: 1,
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

function mergeEmployeeClaims(empCode: string): Benefits[] {
  const merged = new Map<string, Benefits>();

  // 1. ดึงจาก benefitsData + localStorage (benefitsAddedData / benefitsCancelledIds)
  getLiveBenefitsData()
    .filter((item) => item.empCode === empCode)
    .forEach((item) => {
      merged.set(item.claimId, item);
    });

  // 2. ผสานกับ userBenefit ที่ dashboard / claim เก็บไว้ใน localStorage
  try {
    const rawUserBenefit = localStorage.getItem("userBenefit");
    if (rawUserBenefit) {
      const parsed = JSON.parse(rawUserBenefit);
      if (Array.isArray(parsed)) {
        const cancelledRaw = localStorage.getItem("benefitsCancelledIds");
        const cancelledSet = new Set<string>(
          cancelledRaw ? JSON.parse(cancelledRaw) : []
        );
        (parsed as Benefits[])
          .filter(
            (item) =>
              item.empCode === empCode && !cancelledSet.has(item.claimId)
          )
          .forEach((item) => {
            if (!merged.has(item.claimId)) {
              merged.set(item.claimId, item);
            }
          });
      }
    }
  } catch {
    // ignore storage parse errors
  }

  return Array.from(merged.values());
}

function HistoryClaimContent() {
  const searchParams = useSearchParams();
  const [claims, setClaims] = useState<Benefits[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const initialStatuses = useMemo<ClaimStatus[]>(() => {
    const raw = searchParams.get("status");
    if (!raw) return [];
    return raw
      .split(",")
      .map((s) => s.trim() as ClaimStatus)
      .filter((s) => VALID_STATUSES.has(s));
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      let parsedUser: User = DEFAULT_USER;
      try {
        const rawUser = localStorage.getItem("currentUser");
        if (rawUser) parsedUser = JSON.parse(rawUser) as User;
      } catch {
        parsedUser = DEFAULT_USER;
      }

      const instantClaims = mergeEmployeeClaims(parsedUser.empCode);
      setClaims(instantClaims);
      setLoading(false);

      try {
        const freshClaims = await withRetry(() =>
          benefitsSort(parsedUser.empCode)
        );
        if (!active || !Array.isArray(freshClaims)) return;
        setClaims(freshClaims);
        try {
          localStorage.setItem("userBenefit", JSON.stringify(freshClaims));
        } catch {
          // ignore storage quota errors
        }
      } catch {
        // คงข้อมูลล่าสุดที่โหลดจาก localStorage/live data ไว้
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-7 text-black md:px-12">
      {/* Top Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            ประวัติการเบิกสวัสดิการ
          </h1>
          <p className="mt-1 text-sm text-black/50">
            รวบรวมประวัติการเบิกตลอดระยะเวลาที่ผ่านมาตั้งแต่เริ่มเข้าทำงาน
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

      {/* Main Content Card */}
      <div className="mt-7">
        <ClaimHistorySection
          key={initialStatuses.join(",")}
          claims={claims}
          loading={loading}
          initialStatuses={initialStatuses}
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HistoryClaimContent />
    </Suspense>
  );
}

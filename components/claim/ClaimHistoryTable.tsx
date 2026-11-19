"use client";

import {
  CLAIM_STATUS_LABELS,
  formatThaiShortDate,
  getClaimCategoryTitle,
  getClaimSubtitle,
} from "@/components/claim/claimHistoryUtils";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { Benefits, ClaimStatus } from "@/data/benefit";
import { cn } from "@/utils/cn";

export interface ClaimHistoryTableProps {
  claims: Benefits[];
  loading?: boolean;
  showEmployeeColumn?: boolean;
  emptyMessage?: string;
  onRowClick?: (claim: Benefits) => void;
}

const STATUS_TEXT_CLASS: Record<ClaimStatus, string> = {
  approved: "text-emerald-700 font-medium",
  pending_document: "text-amber-700 font-medium",
  pending_hr: "text-sky-700 font-medium",
  success: "text-anyprimary-green-700 font-medium",
  rejected: "text-red-600 font-medium",
};

export function ClaimHistoryTable({
  claims,
  loading = false,
  showEmployeeColumn = false,
  emptyMessage = "ไม่พบประวัติการเบิกสวัสดิการ",
  onRowClick,
}: ClaimHistoryTableProps) {
  const colCount = showEmployeeColumn ? 7 : 6;

  return (
    <div className="min-h-[340px] overflow-hidden rounded-xl border border-gray-200 bg-white">
      <TableRoot fullBleed className="border-0">
        <TableHeader className="bg-anyprimary-green-700 text-white [&_th]:border-none [&_th]:text-sm [&_th]:font-medium [&_th]:text-white">
          <TableRow>
            <TableHead className="w-[130px] text-center whitespace-nowrap">
              วันยื่นเรื่อง
            </TableHead>
            <TableHead className="w-[155px] text-center whitespace-nowrap">
              รหัสคำขอ
            </TableHead>
            {showEmployeeColumn && (
              <TableHead className="min-w-[160px] text-left whitespace-nowrap">
                พนักงาน
              </TableHead>
            )}
            <TableHead className="min-w-[220px] text-left">
              รายละเอียดคำขอ
            </TableHead>
            <TableHead className="w-[115px] text-center whitespace-nowrap">
              ยอดเงิน
            </TableHead>
            <TableHead className="w-[130px] text-center whitespace-nowrap">
              สถานะ
            </TableHead>
            <TableHead className="w-[135px] text-center whitespace-nowrap">
              รอบการโอน
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={colCount}
                className="py-16 text-center text-sm text-gray-400"
              >
                กำลังโหลดประวัติการเบิกสวัสดิการ...
              </TableCell>
            </TableRow>
          ) : claims.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={colCount}
                className="py-16 text-center text-sm text-gray-400"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            claims.map((claim) => {
              const subtitle = getClaimSubtitle(claim);
              const categoryTitle = getClaimCategoryTitle(claim);

              return (
                <TableRow
                  key={claim.claimId}
                  onClick={onRowClick ? () => onRowClick(claim) : undefined}
                  className={cn(
                    "border-b border-gray-100 last:border-b-0 [&>td]:border-gray-100 not-last:*:border-0",
                    onRowClick &&
                      "cursor-pointer transition-colors hover:bg-emerald-50/40"
                  )}
                >
                  <TableCell className="text-center text-sm font-normal whitespace-nowrap text-gray-800">
                    {formatThaiShortDate(claim.requestDate)}
                  </TableCell>

                  <TableCell className="text-center text-sm font-normal whitespace-nowrap text-gray-800">
                    {claim.claimId}
                  </TableCell>

                  {showEmployeeColumn && (
                    <TableCell className="text-left text-sm font-normal text-gray-800">
                      <div className="font-medium text-black">
                        {claim.empName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {claim.empCode} • {claim.department}
                      </div>
                    </TableCell>
                  )}

                  <TableCell className="text-left">
                    <div className="text-sm font-normal text-gray-900">
                      {categoryTitle}
                    </div>
                    {subtitle && (
                      <div className="mt-0.5 line-clamp-1 text-xs font-normal text-gray-400">
                        {subtitle}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-center text-sm font-normal whitespace-nowrap text-gray-800">
                    {claim.amountRequested.toLocaleString("en-US")}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "text-center text-sm whitespace-nowrap",
                      STATUS_TEXT_CLASS[claim.status] ?? "text-gray-700"
                    )}
                  >
                    {CLAIM_STATUS_LABELS[claim.status] ?? claim.status}
                  </TableCell>

                  <TableCell className="text-center text-sm font-normal whitespace-nowrap text-gray-800">
                    {claim.disbursement
                      ? formatThaiShortDate(claim.disbursement)
                      : "-"}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </TableRoot>
    </div>
  );
}

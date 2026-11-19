"use client";

import {
  ClaimHistoryFilter,
  ClaimHistoryFilterValues,
} from "@/components/claim/ClaimHistoryFilter";
import { ClaimHistoryTable } from "@/components/claim/ClaimHistoryTable";
import {
  isoToThaiSlashDate,
  matchesClaimSearch,
} from "@/components/claim/claimHistoryUtils";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { Benefits, ClaimStatus } from "@/data/benefit";
import { useMemo, useState } from "react";

export interface ClaimHistorySectionProps {
  claims: Benefits[];
  loading?: boolean;
  title?: string;
  showEmployeeColumn?: boolean;
  emptyMessage?: string;
  defaultPageSize?: number;
  initialStatuses?: ClaimStatus[];
  onRowClick?: (claim: Benefits) => void;
}

function parseThaiDateToTimestamp(thaiDate?: string | null): number {
  if (!thaiDate) return 0;
  const parts = thaiDate.split("/");
  if (parts.length !== 3) return 0;
  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]) - 543;
  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return 0;
  return new Date(year, month - 1, day).getTime();
}

export function ClaimHistorySection({
  claims,
  loading = false,
  title = "ประวัติการเบิก",
  showEmployeeColumn = false,
  emptyMessage = "ไม่พบประวัติการเบิกสวัสดิการ",
  defaultPageSize = 5,
  initialStatuses,
  onRowClick,
}: ClaimHistorySectionProps) {
  const [filters, setFilters] = useState<ClaimHistoryFilterValues>({
    searchQuery: "",
    selectedDate: "",
    selectedCategories: [],
    selectedStatuses: initialStatuses ?? [],
  });
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const sortedAndFilteredClaims = useMemo(() => {
    const targetThaiDate = filters.selectedDate
      ? isoToThaiSlashDate(filters.selectedDate)
      : "";

    return [...claims]
      .sort(
        (a, b) =>
          parseThaiDateToTimestamp(b.requestDate) -
          parseThaiDateToTimestamp(a.requestDate)
      )
      .filter((claim) => {
        if (!matchesClaimSearch(claim, filters.searchQuery)) {
          return false;
        }
        if (
          targetThaiDate &&
          claim.requestDate !== targetThaiDate &&
          claim.cutoffdate !== targetThaiDate
        ) {
          return false;
        }
        if (
          filters.selectedCategories.length > 0 &&
          !filters.selectedCategories.includes(claim.benefitCategory)
        ) {
          return false;
        }
        if (
          filters.selectedStatuses.length > 0 &&
          !filters.selectedStatuses.includes(claim.status)
        ) {
          return false;
        }
        return true;
      });
  }, [claims, filters]);

  const totalCount = sortedAndFilteredClaims.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedClaims = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedAndFilteredClaims.slice(start, start + pageSize);
  }, [sortedAndFilteredClaims, safeCurrentPage, pageSize]);

  const handleFiltersChange = (next: ClaimHistoryFilterValues) => {
    setFilters(next);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize);
    setCurrentPage(1);
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold text-black">{title}</h2>

      <div className="flex flex-col gap-5">
        <ClaimHistoryFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          shownCount={paginatedClaims.length}
          totalCount={totalCount}
        />

        <ClaimHistoryTable
          claims={paginatedClaims}
          loading={loading}
          showEmployeeColumn={showEmployeeColumn}
          emptyMessage={emptyMessage}
          onRowClick={onRowClick}
        />

        {totalPages > 1 && (
          <div className="pt-1 [&_button]:border-gray-200 [&_button]:bg-white [&_button]:text-gray-700 [&_button:hover:not(:disabled)]:bg-gray-100 [&_button:hover:not(:disabled)]:text-black [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-40 [&_button[aria-current=page]]:border-anyprimary-green-700 [&_button[aria-current=page]]:bg-anyprimary-green-700 [&_button[aria-current=page]]:text-white [&_button[aria-current=page]:hover]:bg-anyprimary-green-700 [&_button[aria-current=page]:hover]:text-white">
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export { ClaimHistoryFilter } from "@/components/claim/ClaimHistoryFilter";
export { ClaimHistoryTable } from "@/components/claim/ClaimHistoryTable";

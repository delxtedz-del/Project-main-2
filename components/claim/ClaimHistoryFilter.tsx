"use client";

import { DatePickerField } from "@/components/claim/DatePickerField";
import {
  FilterOption,
  SearchableCheckboxFilter,
} from "@/components/claim/SearchableCheckboxFilter";
import {
  CLAIM_STATUS_OPTIONS,
  formatIsoToThaiShortDate,
  PAGE_SIZE_OPTIONS,
} from "@/components/claim/claimHistoryUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import { Input } from "@/components/tailgrids/core/input";
import { BENEFIT_CATEGORIES, ClaimStatus } from "@/data/benefit";
import { cn } from "@/utils/cn";
import { ChevronDown, Search, X } from "lucide-react";

export interface ClaimHistoryFilterValues {
  searchQuery: string;
  selectedDate: string; // ISO YYYY-MM-DD or ""
  selectedCategories: string[];
  selectedStatuses: ClaimStatus[];
}

export interface ClaimHistoryFilterProps {
  filters: ClaimHistoryFilterValues;
  onFiltersChange: (next: ClaimHistoryFilterValues) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  shownCount: number;
  totalCount: number;
  categories?: string[];
}

export function ClaimHistoryFilter({
  filters,
  onFiltersChange,
  pageSize,
  onPageSizeChange,
  shownCount,
  totalCount,
  categories = BENEFIT_CATEGORIES,
}: ClaimHistoryFilterProps) {
  const updateFilter = <K extends keyof ClaimHistoryFilterValues>(
    key: K,
    value: ClaimHistoryFilterValues[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Search + 3 Filter Controls */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Search Input (Ctrl+F style .includes + .filter) */}
        <div className="relative flex items-center lg:col-span-6">
          <Search className="pointer-events-none absolute left-3.5 size-4 text-gray-400" />
          <Input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            placeholder="ค้นหาชื่อ, รหัส, สวัสดิการ..."
            aria-label="ค้นหาประวัติการเบิก"
            className="h-10.5 w-full rounded-xl border-gray-200 bg-white pr-9 pl-10 text-sm text-black shadow-xs placeholder:text-gray-400 hover:border-anyprimary-green-700 focus:border-anyprimary-green-700 focus:ring-anyprimary-green-700/15"
          />
          {filters.searchQuery && (
            <button
              type="button"
              aria-label="ล้างคำค้นหา"
              onClick={() => updateFilter("searchQuery", "")}
              className="absolute right-3 flex size-5 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* วันที่งบประมาณ (Calendar component จากหน้า claim) */}
        <div className="lg:col-span-2">
          <DatePickerField
            value={filters.selectedDate}
            onChange={(isoDate) => updateFilter("selectedDate", isoDate)}
            placeholder="วันที่งบประมาณ"
            ariaLabel="กรองตามวันที่งบประมาณ"
            allowClear
            formatDisplay={formatIsoToThaiShortDate}
            className="h-10.5 rounded-xl border-gray-200 px-3.5 py-2 shadow-xs"
          />
        </div>

        {/* ประเภทสวัสดิการ */}
        <div className="lg:col-span-2">
          <SearchableCheckboxFilter
            options={categories.map((cat) => ({ value: cat, label: cat }))}
            selectedValues={filters.selectedCategories}
            onChange={(next) => updateFilter("selectedCategories", next)}
            placeholder="ประเภทสวัสดิการ"
            sectionTitle="ประเภทสวัสดิการ"
            searchPlaceholder="ค้นหาประเภทสวัสดิการ..."
            ariaLabel="กรองตามประเภทสวัสดิการ"
            placement="bottom start"
          />
        </div>

        {/* สถานะ */}
        <div className="lg:col-span-2">
          <SearchableCheckboxFilter<ClaimStatus>
            options={CLAIM_STATUS_OPTIONS.filter(
              (opt): opt is FilterOption<ClaimStatus> => opt.value !== ""
            )}
            selectedValues={filters.selectedStatuses}
            onChange={(next) => updateFilter("selectedStatuses", next)}
            placeholder="สถานะ"
            sectionTitle="สถานะคำขอ"
            searchPlaceholder="ค้นหาสถานะ..."
            ariaLabel="กรองตามสถานะคำขอ"
            placement="bottom end"
          />
        </div>
      </div>

      {/* Row 2: Page Size & Count */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium text-black">จำนวนต่อหน้า</span>

        <DropdownMenu>
          <DropdownMenuTrigger className="group inline-flex h-8.5 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 shadow-xs transition outline-none hover:border-anyprimary-green-700 hover:text-black">
            <span>จำนวน {pageSize} หน้า</span>
            <ChevronDown className="size-3.5 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            placement="bottom start"
            className="min-w-32 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
          >
            <DropdownMenuSection>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <DropdownMenuItem
                  key={size}
                  id={`page-size-${size}`}
                  onAction={() => onPageSizeChange(size)}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-1.5 text-xs transition",
                    pageSize === size
                      ? "bg-anyprimary-green-700/10 font-medium text-anyprimary-green-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span>จำนวน {size} หน้า</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSection>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-xs text-gray-400">
          แสดง {shownCount} จาก {totalCount} รายการ
        </span>
      </div>
    </div>
  );
}

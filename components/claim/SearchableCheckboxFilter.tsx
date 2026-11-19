"use client";

import { cn } from "@/utils/cn";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  Popover,
} from "react-aria-components";

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SearchableCheckboxFilterProps<T extends string = string> {
  options: FilterOption<T>[];
  selectedValues: T[];
  onChange: (next: T[]) => void;
  placeholder: string;
  sectionTitle: string;
  searchPlaceholder?: string;
  ariaLabel?: string;
  placement?: "bottom start" | "bottom end";
  className?: string;
}

export function SearchableCheckboxFilter<T extends string = string>({
  options,
  selectedValues,
  onChange,
  placeholder,
  sectionTitle,
  searchPlaceholder = "ค้นหา...",
  ariaLabel,
  placement = "bottom start",
  className,
}: SearchableCheckboxFilterProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const labelByValue = useMemo(() => {
    const map = new Map<T, string>();
    options.forEach((opt) => map.set(opt.value, opt.label));
    return map;
  }, [options]);

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  const { checkedOptions, uncheckedOptions } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? options.filter((opt) => opt.label.toLowerCase().includes(q))
      : options;

    return {
      checkedOptions: filtered.filter((opt) => selectedSet.has(opt.value)),
      uncheckedOptions: filtered.filter((opt) => !selectedSet.has(opt.value)),
    };
  }, [options, searchQuery, selectedSet]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery("");
    }
  };

  const toggleValue = (val: T) => {
    if (selectedSet.has(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const latestSelectedValue =
    selectedValues.length > 0
      ? selectedValues[selectedValues.length - 1]
      : null;
  const latestSelectedLabel = latestSelectedValue
    ? (labelByValue.get(latestSelectedValue) ?? latestSelectedValue)
    : placeholder;

  const hasSelection = selectedValues.length > 0;
  const isSingleSelection = selectedValues.length === 1;

  return (
    <div className="relative flex w-full items-center">
      <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
        <AriaButton
          aria-label={ariaLabel ?? placeholder}
          className={cn(
            "group flex h-10.5 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-500 shadow-xs transition outline-none hover:border-anyprimary-green-700 hover:text-black focus:border-anyprimary-green-700 focus:ring-4 focus:ring-anyprimary-green-700/15",
            hasSelection && "font-medium text-black",
            isSingleSelection && "pr-10",
            className
          )}
        >
          <span className="truncate">{latestSelectedLabel}</span>

          {!hasSelection && (
            <ChevronDown className="size-4 shrink-0 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
          )}

          {selectedValues.length > 1 && (
            <span className="flex p-1 w-6 shrink-0 items-center justify-center rounded-full bg-anyprimary-green-700 px-1.5 text-[11px] font-semibold text-white">
              {selectedValues.length}
            </span>
          )}
        </AriaButton>

        <Popover placement={placement} offset={6} className="z-50 outline-none">
          <Dialog className="w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg outline-none">
            {/* Search Input */}
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5">
              <Search className="size-4 shrink-0 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                autoFocus
                className="w-full bg-transparent text-sm text-black placeholder:text-gray-400 outline-none rounded-lg!"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="ล้างคำค้นหา"
                  onClick={() => setSearchQuery("")}
                  className="flex size-4 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto p-1.5">
              {checkedOptions.length > 0 && (
                <div
                  className={cn(
                    "flex flex-col gap-0.5",
                    uncheckedOptions.length > 0 &&
                      "mb-1.5 border-b border-gray-100 pb-1.5"
                  )}
                >
                  {checkedOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleValue(opt.value)}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-black transition hover:bg-gray-100"
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-[5px] border border-anyprimary-green-700 bg-anyprimary-green-700 text-white">
                        <Check className="size-3 stroke-[2.5]" />
                      </span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {uncheckedOptions.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  <div className="px-2.5 py-1.5 text-xs font-medium text-gray-400">
                    {sectionTitle}
                  </div>
                  {uncheckedOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleValue(opt.value)}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-[5px] border border-gray-300 bg-white" />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {checkedOptions.length === 0 && uncheckedOptions.length === 0 && (
                <div className="px-3 py-6 text-center text-xs text-gray-400">
                  ไม่พบรายการที่ค้นหา
                </div>
              )}
            </div>
          </Dialog>
        </Popover>
      </DialogTrigger>

      {isSingleSelection && (
        <button
          type="button"
          aria-label={`ล้างตัวกรอง${placeholder}`}
          onClick={() => onChange([])}
          className="absolute right-3 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-black"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

"use client";

import { cn } from "@/utils/cn";
import { Search1 } from "@tailgrids/icons";
import { X } from "lucide-react";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "ค้นหา...",
  ariaLabel = "ค้นหา",
  autoFocus = false,
  className,
}: SearchInputProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-2  px-2 py-1.5",
        className
      )}
    >
      <Search1 className="size-5 shrink-0 text-zinc-600 " />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        className="w-full border-0! bg-transparent! p-0! text-lg text-black shadow-none! ring-0! outline-none! placeholder:text-zinc-900 focus:border-0! focus:ring-0! focus:outline-none!"
      />

      {value && (
        <button
          type="button"
          aria-label="ล้างคำค้นหา"
          onClick={() => onChange("")}
          className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
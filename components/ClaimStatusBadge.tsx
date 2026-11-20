"use client";

import React, { useState, useRef, useEffect } from "react";
import { RotateCw, CheckCircle2, XCircle, ChevronDown } from "lucide-react";

export type ClaimStatusType = "pending_hr" | "approved" | "rejected" | string;

interface ClaimStatusBadgeProps {
  status: ClaimStatusType;
  onChange?: (newStatus: "pending_hr" | "approved" | "rejected") => void;
  disabled?: boolean;
  className?: string;
}

const STATUS_CONFIG = {
  pending_hr: {
    label: "รออนุมัติ",
    icon: RotateCw,
    iconClass: "size-3 text-amber-500",
    badgeClass:
      "border-amber-300 text-amber-600 bg-amber-50/50 hover:bg-amber-100/60",
  },
  approved: {
    label: "อนุมัติแล้ว",
    icon: CheckCircle2,
    iconClass: "size-3 text-emerald-600",
    badgeClass:
      "border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/60",
  },
  rejected: {
    label: "ปฏิเสธ",
    icon: XCircle,
    iconClass: "size-3 text-rose-500",
    badgeClass:
      "border-rose-300 text-rose-600 bg-rose-50/50 hover:bg-rose-100/60",
  },
} as const;

export function ClaimStatusBadge({
  status,
  onChange,
  disabled = false,
  className = "",
}: ClaimStatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentConfig =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending_hr;
  const CurrentIcon = currentConfig.icon;

  // ปิดเมนูเมื่อคลิกนอกกล่อง หรือกด Esc
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (newStatus: "pending_hr" | "approved" | "rejected") => {
    if (onChange) {
      onChange(newStatus);
    }
    setIsOpen(false);
  };

  const isInteractive = Boolean(onChange) && !disabled;

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        disabled={!isInteractive}
        onClick={() => isInteractive && setIsOpen((prev) => !prev)}
        title={isInteractive ? "คลิกเพื่อเปลี่ยนสถานะ" : undefined}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-normal border transition-all ${
          currentConfig.badgeClass
        } ${isInteractive ? "cursor-pointer group shadow-2xs hover:shadow-xs" : "cursor-default"} ${className}`}
      >
        <span>{currentConfig.label}</span>
        <CurrentIcon className={currentConfig.iconClass} />
        {isInteractive && (
          <ChevronDown className="size-2.5 opacity-40 group-hover:opacity-80 transition-opacity ml-0.5" />
        )}
      </button>

      {/* Dropdown เมนูสำหรับเปลี่ยนสถานะ */}
      {isOpen && isInteractive && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 w-36 bg-white border border-zinc-200 rounded-2xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="text-[10px] font-medium text-zinc-400 px-2 py-1">
            เปลี่ยนสถานะเป็น
          </div>

          <button
            type="button"
            onClick={() => handleSelect("pending_hr")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
              status === "pending_hr"
                ? "bg-amber-50 text-amber-700 font-semibold"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <RotateCw className="size-3 text-amber-500" />
              รออนุมัติ
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect("approved")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
              status === "approved"
                ? "bg-emerald-50 text-emerald-700 font-semibold"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-emerald-600" />
              อนุมัติแล้ว
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect("rejected")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
              status === "rejected"
                ? "bg-rose-50 text-rose-700 font-semibold"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <XCircle className="size-3 text-rose-500" />
              ปฏิเสธ
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ClaimStatusBadge;

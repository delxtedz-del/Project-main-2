"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface NotificationBellProps {
  buttonClassName?: string;
}

export function NotificationBell({ buttonClassName }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ปิดเมื่อคลิกนอกกล่อง หรือกด Esc (ไม่ล็อกการ scroll ของหน้า)
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

  return (
    <div ref={containerRef} className="relative inline-flex mt-[-22.6px]">
      <button
        type="button"
        title="การแจ้งเตือน"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-1 transition-colors cursor-pointer ${buttonClassName ?? ""}`}
      >
        <Bell className="size-6" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-[320px] bg-white border border-zinc-200 rounded-2xl shadow-xl outline-none overflow-hidden">
          <div className="flex flex-col max-h-[380px]">
            {/* ส่วนหัวค้างไว้ด้านบน */}
            <div className="px-4 py-3 border-b border-zinc-100 shrink-0">
              <h3 className="text-xs font-semibold text-[#0b1e1b]">การแจ้งเตือน</h3>
            </div>

            {/* ส่วนรายการแจ้งเตือน: เลื่อนลงได้เมื่อรายการยาวเกิน */}
            <div className="p-2 space-y-1 flex-1 overflow-y-auto bg-white">
              <div className="flex items-start gap-2.5 p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                  <Bell className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#0b1e1b] font-medium leading-snug">
                    มีพนักงานใหม่เข้าร่วมระบบ
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">เมื่อไม่นานมานี้</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 shrink-0">
                  <Bell className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#0b1e1b] font-medium leading-snug">
                    กำหนดการประเมินผลงาน
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">พรุ่งนี้ 09:00 น.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 shrink-0">
                  <Bell className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#0b1e1b] font-medium leading-snug">
                    ข้อความใหม่จากฝ่ายบุคคล
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">เมื่อวานนี้</p>
                </div>
              </div>
            </div>

            {/* ส่วนท้ายค้างไว้ด้านล่าง */}
            <div className="p-2.5 border-t border-zinc-100 bg-zinc-50/50 shrink-0">
              <button
                type="button"
                className="w-full text-xs font-medium text-center text-zinc-600 hover:text-zinc-900 py-1 cursor-pointer transition-colors"
              >
                ดูการแจ้งเตือนทั้งหมด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
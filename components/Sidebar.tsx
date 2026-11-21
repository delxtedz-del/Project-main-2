"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  LayoutDashboard,
  User,
  Users,
  UserMinus,
  HeartHandshake,
  CreditCard,
  History,
  CheckSquare,
  LogOut,
  ArrowRightLeft,
  FileText,
  CalendarDays,
  BarChart3,
} from "lucide-react";

type MenuCategory = "HR" | "FIN" | "EMP" | "IT";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchHrefs?: string[];
  category: MenuCategory;
}

const menuItems: MenuItem[] = [
  // ฝ่ายบุคคล
  { name: "ภาพรวม", href: "/dashboardhr", icon: LayoutGrid, matchHrefs: ["/dashboardhr"], category: "HR" },
  { name: "พนักงาน", href: "/employees", icon: User, matchHrefs: ["/employees"], category: "HR" },
  { name: "พนักงานเก่า", href: "/oldemployee", icon: UserMinus, matchHrefs: ["/oldemployee"], category: "HR" },
  { name: "จัดการสวัสดิการ", href: "/benefitshr", icon: HeartHandshake, matchHrefs: ["/benefitshr"], category: "HR" },
  // ฝ่ายการเงิน
  { name: "การเงินและบัญชี", href: "/finance", icon: CreditCard, matchHrefs: ["/finance"], category: "FIN" },
  { name: "รายการโอนเงิน", href: "/transfers", icon: ArrowRightLeft, matchHrefs: ["/transfers"], category: "FIN" },
  { name: "คำขอจ่ายเงิน", href: "/requests", icon: FileText, matchHrefs: ["/requests"], category: "FIN" },
  { name: "รอบการจ่ายเงิน", href: "/pay-cycles", icon: CalendarDays, matchHrefs: ["/pay-cycles"], category: "FIN" },
  { name: "รายงาน", href: "/reports", icon: BarChart3, matchHrefs: ["/reports"], category: "FIN" },
  // ฝ่ายพนักงาน
  { name: "ภาพรวมพนักงาน", href: "/dashboard", icon: CreditCard, matchHrefs: ["/dashboard"], category: "EMP" },
  { name: "การเบิกสวัสดิการ", href: "/claim", icon: CreditCard, matchHrefs: ["/claim"], category: "EMP" },
  { name: "ประวัติการเบิกสวัสดิการ", href: "/historyclaim", icon: CreditCard, matchHrefs: ["/historyclaim"], category: "EMP" },
  { name: "ข้อมูลส่วนตัว", href: "/profile", icon: User, matchHrefs: ["/profile"], category: "EMP" },
  // ฝ่าย IT (ยังไม่เอามาใส่)
  { name: "ภาพรวมงบประมาณ", href: "/benefits", icon: LayoutDashboard, matchHrefs: ["/benefits", "/budget"], category: "IT"},
  { name: "พิจารณาและอนุมัติ", href: "/approvals", icon: CheckSquare, matchHrefs: ["/approvals"], category: "IT"},
];

export type SidebarVariant = "auto" | "hr" | "fin" | "employee" | "it";

export interface SidebarProps {
  variant?: SidebarVariant;
  user?: {
    name?: string;
    role?: string;
    avatarUrl?: string;
  };
  onLogout?: () => void;
}

export default function Sidebar({ variant = "auto", user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [storedUser, setStoredUser] = useState<{
    empCode?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("credential");
      if (raw) {
        const parsed = JSON.parse(raw);
        setStoredUser({
          empCode: parsed?.empCode,
          role: parsed?.role,
        });
      } else {
        setStoredUser(null);
      }
    } catch {
      setStoredUser(null);
    }
  }, [pathname]);

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const normalizedRole = (user?.role || storedUser?.role || "HR")
    .trim()
    .toUpperCase();

  const currentUser = {
    name: user?.name || storedUser?.empCode || "นาย ปฏิพัทธ์ สร้างตั้น",
    role: normalizedRole,
    avatarUrl: 
      user?.avatarUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = item.matchHrefs
      ? item.matchHrefs.includes(pathname)
      : pathname === item.href;

    return (
      <Link
        key={`${item.category}-${item.name}`}
        href={item.href}
        className={`w-full h-11 px-4 flex items-center justify-between rounded-[20px] transition-all text-base shrink-0 ${
          isActive
            ? "bg-zinc-900/5 text-zinc-900 font-medium"
            : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-900/5 font-normal"
        }`}
      >
        <span>{item.name}</span>
        <Icon
          className={`size-4.5 ${
            isActive ? "text-zinc-900" : "text-zinc-500"
          }`}
        />
      </Link>
    );
  };

  const roleSectionCategory: MenuCategory | null =
    currentUser.role === "HR"
      ? "HR"
      : currentUser.role === "FIN"
        ? "FIN"
        : currentUser.role === "IT"
          ? "IT"
          : null;

  const roleMenuItems = roleSectionCategory
    ? menuItems.filter((item) => item.category === roleSectionCategory)
    : [];
  const empMenuItems = menuItems.filter((item) => item.category === "EMP");

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      try {
        localStorage.removeItem("credential");
        localStorage.removeItem("currentUser");
        router.push("/login");
      } catch {
        router.push("/login");
      }
    }
  };

  return (
    <aside className="w-80 h-screen font-line-seed-sans-th shrink-0 bg-white rounded-tr-3xl rounded-br-3xl shadow-[10px_-3px_24.8px_0px_rgba(0,0,0,0.03)] flex flex-col justify-between p-7 select-none relative z-20">
      {/* ส่วนบน: โลโก้ และ รายการเมนูหลักด้านบน */}
      <div>
        {/* Logo EDBMS */}
        <div className="flex items-center gap-3.5 mb-10 px-1">
          <div className="size-11 flex items-center justify-center shrink-0 rounded-xl shadow-[-1px_1px_2px_0px_rgba(0,0,0,0.15)] bg-emerald-50">
            <svg
              viewBox="0 0 36 36"
              fill="none"
              className="w-8 h-8"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="18" cy="18" r="17" fill="#E8F6F0" />
              <path
                d="M12 25C12 18 16 12 25 11C25 19 21 25 12 25Z"
                fill="#0F766E"
              />
              <path
                d="M15 25C15 20 18 16 23 15C22 20 19 25 15 25Z"
                fill="#34D399"
              />
              <path
                d="M18 25V21"
                stroke="#064E3B"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-baseline tracking-wide">
              <span className="text-2xl font-extrabold text-teal-800">
                EDB
              </span>
              <span className="text-2xl font-extrabold text-zinc-900">
                M
              </span>
              <span className="text-2xl font-extrabold text-zinc-900">
                S
              </span>
            </div>
            <p className="text-sm font-normal text-teal-900/80 -mt-0.5">
              ระบบจัดการพนักงาน
            </p>
          </div>
        </div>

        {/* รายการเมนูหลักด้านบน */}
        <nav className="flex flex-col gap-2">
          {roleMenuItems.map(renderMenuItem)}
          {roleMenuItems.length > 0 && (
            <div className="my-2 mx-4 h-px bg-zinc-200 shrink-0" />
          )}
          {empMenuItems.map(renderMenuItem)}
        </nav>
      </div>

      {/* ส่วนล่าง: โปรไฟล์ผู้ใช้ตาม Figma */}
      <div className="w-full h-20 bg-neutral-100 rounded-[19.56px] px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="size-9 rounded-[5px] object-cover shrink-0 bg-zinc-300"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate leading-5">
                {currentUser.name}
              </p>
              <p className="text-xs font-normal text-zinc-900/60 leading-4 truncate">
                {currentUser.role}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="ออกจากระบบ"
            className="text-zinc-500 hover:text-zinc-900 p-1.5 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="size-4" />
          </button>
      </div>
    </aside>
  );
}

export function ITSidebar(props: SidebarProps) {
  return <Sidebar variant="it" {...props} />;
}

export function EmployeeSidebar(props: SidebarProps) {
  return <Sidebar variant="employee" {...props} />;
}

export function HRSidebar(props: SidebarProps) {
  return <Sidebar variant="hr" {...props} />;
}

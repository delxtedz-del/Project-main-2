"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  Check,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  FileText,
  Coins,
  Pencil,
  Plus,
  Calendar,
  ChevronDown,
  HeartHandshake,
} from "lucide-react";
import { Clock } from "@/components/Clock";
import { NotificationBell } from "@/components/notification-bell";
import {
  benefitsData,
  Benefits,
  initialBenefitPolicies,
  BenefitPolicyConfig,
} from "@/data/benefit";

const CLAIMS_STORAGE_KEY = "edbms-benefits";
const POLICIES_STORAGE_KEY = "edbms-benefit-policies";

type ActiveTab = "review" | "edit_benefits" | "all_records";

export default function BenefitsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("review");
  const [hydrated, setHydrated] = useState(false);

  // ข้อมูลคำขอเบิกสวัสดิการ
  const [claims, setClaims] = useState<Benefits[]>(benefitsData as Benefits[]);

  // ข้อมูลการตั้งค่าสวัสดิการ (การ์ดเปิด/ปิดใช้งาน)
  const [policies, setPolicies] = useState<BenefitPolicyConfig[]>(
    initialBenefitPolicies
  );

  // Load from localStorage safely
  useEffect(() => {
    try {
      const savedClaims = localStorage.getItem(CLAIMS_STORAGE_KEY);
      if (savedClaims) {
        const parsed = JSON.parse(savedClaims);
        window.requestAnimationFrame(() => {
          setClaims(parsed);
        });
      }
      const savedPolicies = localStorage.getItem(POLICIES_STORAGE_KEY);
      if (savedPolicies) {
        const parsed = JSON.parse(savedPolicies);
        window.requestAnimationFrame(() => {
          setPolicies(parsed);
        });
      }
    } catch {
      /* ignore */
    }
    window.requestAnimationFrame(() => {
      setHydrated(true);
    });
  }, []);

  // Sync claims to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(claims));
    } catch {
      /* ignore */
    }
  }, [claims, hydrated]);

  // Sync policies to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(policies));
    } catch {
      /* ignore */
    }
  }, [policies, hydrated]);

  // --- FILTERS & SEARCH STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Selected claim for detail drawer ("ข้อมูลผู้เบิก")
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const selectedClaim = useMemo(() => {
    if (!selectedClaimId) return null;
    return claims.find((c) => c.claimId === selectedClaimId) || null;
  }, [claims, selectedClaimId]);

  // --- MODAL & POPUP STATES ---
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] =
    useState<BenefitPolicyConfig | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Form states for Benefit Policy Modal
  const defaultPolicyForm: BenefitPolicyConfig = {
    id: "",
    code: "",
    name: "",
    category: "ค่ารักษาพยาบาล",
    subtitle: "",
    maxPerTimeText: "สูงสุด ครั้งละ 10,000 บาท",
    limitPerTime: "10,000 บาท",
    eligibleGroup: "พนักงานทุกคน",
    requiredDocs: "ใบรับรองแพทย์, ใบเสร็จรับเงิน",
    claimAs: "ตนเอง",
    formType: "ฟอร์มทั่วไป",
    duration: "permanent",
    startDate: "",
    endDate: "",
    description: "",
    quotaType: "ต่อครั้ง",
    maxPerTimeAmount: "10,000 บาท",
    maxTimesPerYear: "30 ครั้ง",
    maxPerYearAmount: "30,000 บาท",
    active: true,
  };

  const [policyForm, setPolicyForm] =
    useState<BenefitPolicyConfig>(defaultPolicyForm);

  // Popups: Save confirmation, Delete confirmation, Unsaved changes confirmation
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  // Open modal for new policy
  const handleOpenAddPolicy = () => {
    const nextNum = policies.length + 1;
    const nextCode = `AID-${String(nextNum).padStart(2, "0")}`;
    setEditingPolicy(null);
    setPolicyForm({
      ...defaultPolicyForm,
      id: nextCode,
      code: nextCode,
    });
    setIsFormDirty(false);
    setIsPolicyModalOpen(true);
  };

  // Open modal for editing existing policy
  const handleOpenEditPolicy = (policy: BenefitPolicyConfig) => {
    setEditingPolicy(policy);
    setPolicyForm({ ...policy });
    setIsFormDirty(false);
    setIsPolicyModalOpen(true);
  };

  // Close modal with check for dirty form
  const handleRequestClosePolicyModal = () => {
    if (isFormDirty) {
      setShowUnsavedConfirm(true);
    } else {
      setIsPolicyModalOpen(false);
      setEditingPolicy(null);
    }
  };

  // Toggle active status directly on policy card
  const handleTogglePolicyActive = (policyId: string) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === policyId ? { ...p, active: !p.active } : p))
    );
  };

  // Save Policy confirmed
  const handleConfirmSavePolicy = () => {
    if (editingPolicy) {
      // Update
      setPolicies((prev) =>
        prev.map((p) => (p.id === editingPolicy.id ? { ...policyForm } : p))
      );
    } else {
      // Create
      setPolicies((prev) => [...prev, { ...policyForm }]);
    }
    setShowSaveConfirm(false);
    setIsPolicyModalOpen(false);
    setEditingPolicy(null);
    setIsFormDirty(false);
  };

  // Delete Policy confirmed
  const handleConfirmDeletePolicy = () => {
    if (editingPolicy) {
      setPolicies((prev) => prev.filter((p) => p.id !== editingPolicy.id));
    }
    setShowDeleteConfirm(false);
    setIsPolicyModalOpen(false);
    setEditingPolicy(null);
    setDeleteConfirmInput("");
    setIsFormDirty(false);
  };

  // Handle Approve / Reject Claim in Drawer
  const handleApproveClaim = (claimId: string) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.claimId === claimId
          ? {
              ...c,
              status: "approved",
              statusNote: "อนุมัติโดย HR เรียบร้อย",
              approver: "นาย ปฏิพัทธ์ สร้างตั้น",
              approvedAmount: c.amountRequested,
            }
          : c
      )
    );
  };

  const handleRejectClaim = (claimId: string) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.claimId === claimId
          ? {
              ...c,
              status: "rejected",
              statusNote: "ไม่อนุมัติ เอกสารไม่ผ่านเกณฑ์",
              approver: "นาย ปฏิพัทธ์ สร้างตั้น",
            }
          : c
      )
    );
  };

  // Filtered Claims for Review Tab & All Records Tab
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      // In review tab, prioritize pending claims, or show based on status filter
      if (activeTab === "review") {
        if (claim.status !== "pending_hr") return false;
      } else if (activeTab === "all_records") {
        if (statusFilter !== "all" && claim.status !== statusFilter) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          claim.claimId.toLowerCase().includes(q) ||
          claim.empName.toLowerCase().includes(q) ||
          claim.department.toLowerCase().includes(q) ||
          claim.benefitCategory.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Date Filter
      if (dateFilter !== "all") {
        if (claim.requestDate !== dateFilter) return false;
      }

      // Category Filter
      if (categoryFilter !== "all") {
        if (claim.benefitCategory !== categoryFilter) return false;
      }

      return true;
    });
  }, [claims, activeTab, statusFilter, searchQuery, dateFilter, categoryFilter]);

  // Unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    claims.forEach((c) => {
      if (c.benefitCategory) set.add(c.benefitCategory);
    });
    return Array.from(set);
  }, [claims]);

  // Unique dates for date dropdown
  const uniqueDates = useMemo(() => {
    const set = new Set<string>();
    claims.forEach((c) => {
      if (c.requestDate) set.add(c.requestDate);
    });
    return Array.from(set);
  }, [claims]);

  // Pagination
  const paginatedClaims = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredClaims.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredClaims, currentPage, rowsPerPage]);

  // Active & Inactive policies
  const activePolicies = useMemo(
    () => policies.filter((p) => p.active),
    [policies]
  );
  const inactivePolicies = useMemo(
    () => policies.filter((p) => !p.active),
    [policies]
  );

  return (
    <div className="p-8 md:p-10 max-w-[1440px] mx-auto min-h-screen">
      {/* ===== ส่วนหัว: ให้เท่ากันและสอดคล้องกับหน้าพนักงาน ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium leading-9 tracking-[0.031em] text-[#0b1e1b]">
              จัดการสวัสดิการ
            </h1>
            <HeartHandshake className="size-4 text-zinc-900" />
          </div>
          <p className="text-base font-sans font-thin tracking-tight text-[#0b1e1b] mt-0.5">
            รายชื่อทุกคนในระบบ ({claims.length} คน) - ค้นหาได้จากชื่อ ตำแหน่ง รหัสพนักงาน หรืออีเมล
          </p>
        </div>

        {/* วันที่ และ กระดิ่งแจ้งเตือน */}
        <div className="flex items-center gap-3 self-end sm:self-auto text-[#0b1e1b]">
          <Clock className="text-base font-medium leading-6 tracking-wide text-zinc-900 flex items-center mt-[-22.6px]" />
          <NotificationBell />
        </div>
      </div>

      {/* แถบสลับแท็บกลาง: ตรวจสอบ | แก้ไขสวัสดิการ | รายการทั้งหมด (ขนาดเท่ากันทุกแท็บและจัดกึ่งกลางด้วย Grid) */}
      <div className="flex justify-center mb-8">
        <div className="w-[520px] max-w-full grid grid-cols-3 p-1.5 bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-zinc-100/90 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("review");
              setSelectedClaimId(null);
            }}
            className={`w-full h-11 flex items-center justify-center text-center rounded-full text-sm font-medium transition-colors cursor-pointer select-none ${
              activeTab === "review"
                ? "bg-[#0a4d3c] text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            ตรวจสอบ
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("edit_benefits");
              setSelectedClaimId(null);
            }}
            className={`w-full h-11 flex items-center justify-center text-center rounded-full text-sm font-medium transition-colors cursor-pointer select-none ${
              activeTab === "edit_benefits"
                ? "bg-[#0a4d3c] text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            แก้ไขสวัสดิการ
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("all_records");
              setSelectedClaimId(null);
            }}
            className={`w-full h-11 flex items-center justify-center text-center rounded-full text-sm font-medium transition-colors cursor-pointer select-none ${
              activeTab === "all_records"
                ? "bg-[#0a4d3c] text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            รายการทั้งหมด
          </button>
        </div>
      </div>

      {/* ===== VIEW 1 & VIEW 3: ตรวจสอบ / รายการทั้งหมด (Claims Table) ===== */}
      {(activeTab === "review" || activeTab === "all_records") && (
        <div>
          {/* Page Title */}
          <h2 className="text-2xl font-bold text-zinc-900 mb-6">
            {activeTab === "review" ? "ข้อมูลการยื่นสวัสดิการ" : "ประวัติการยื่น"}
          </h2>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[280px] max-w-[500px]">
              <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="ค้นหาชื่อ,รหัสสวัสดิการ..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-zinc-200/90 rounded-full text-sm shadow-[0_2px_8px_rgba(0,0,0,0.03)] outline-none focus:border-zinc-400 focus:ring-0 transition-all placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Date Filter Dropdown */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-zinc-200/90 rounded-full pl-5 pr-10 py-2.5 text-sm text-zinc-700 shadow-[0_2px_8px_rgba(0,0,0,0.03)] outline-none cursor-pointer focus:border-zinc-400"
              >
                <option value="all">วันที่ยื่นเรื่อง</option>
                {uniqueDates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Category Filter Dropdown */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-zinc-200/90 rounded-full pl-5 pr-10 py-2.5 text-sm text-zinc-700 shadow-[0_2px_8px_rgba(0,0,0,0.03)] outline-none cursor-pointer focus:border-zinc-400"
              >
                <option value="all">ประเภทสวัสดิการ</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter (Only in รายการทั้งหมด) */}
            {activeTab === "all_records" && (
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-zinc-200/90 rounded-full pl-5 pr-10 py-2.5 text-sm text-zinc-700 shadow-[0_2px_8px_rgba(0,0,0,0.03)] outline-none cursor-pointer focus:border-zinc-400"
                >
                  <option value="all">สถานะ</option>
                  <option value="pending_hr">รออนุมัติ</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="rejected">ปฏิเสธ</option>
                </select>
                <ChevronDown className="size-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Pagination summary row */}
          <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3 px-1">
            <div className="flex items-center gap-2">
              <span>จำนวนต่อหน้า</span>
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-zinc-200 rounded-lg pl-3 pr-7 py-1 text-xs text-zinc-700 outline-none cursor-pointer"
                >
                  <option value={5}>จำนวน 5 หน้า</option>
                  <option value={10}>จำนวน 10 หน้า</option>
                  <option value={20}>จำนวน 20 หน้า</option>
                </select>
                <ChevronDown className="size-3 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <span>
              แสดง {paginatedClaims.length} จาก {filteredClaims.length} รายการ
            </span>
          </div>

          {/* Layout: Table on left, Drawer on right if open */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Table Card */}
            <div
              className={`bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-zinc-200/80 overflow-hidden transition-all duration-300 w-full ${
                selectedClaim ? "lg:w-[60%]" : "w-full"
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#0a4d3c] text-white text-xs font-medium">
                      <th className="py-3.5 px-4 font-normal">วันยื่นเรื่อง</th>
                      <th className="py-3.5 px-4 font-normal">รหัสคำขอ</th>
                      <th className="py-3.5 px-4 font-normal">ชื่อผู้ยื่น</th>
                      <th className="py-3.5 px-4 font-normal">แผนก</th>
                      <th className="py-3.5 px-4 font-normal">ประเภท</th>
                      <th className="py-3.5 px-4 font-normal">ยอดเงิน</th>
                      <th className="py-3.5 px-4 font-normal text-center">
                        สถานะ
                      </th>
                      <th className="py-3.5 px-4 font-normal text-center">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-xs text-zinc-800">
                    {paginatedClaims.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-12 text-center text-zinc-400"
                        >
                          ไม่พบข้อมูลรายการสวัสดิการ
                        </td>
                      </tr>
                    ) : (
                      paginatedClaims.map((claim) => {
                        const isSelected = selectedClaimId === claim.claimId;
                        return (
                          <tr
                            key={claim.claimId}
                            onClick={() => setSelectedClaimId(claim.claimId)}
                            className={`hover:bg-zinc-50/80 transition-colors cursor-pointer ${
                              isSelected ? "bg-emerald-50/40" : ""
                            }`}
                          >
                            <td className="py-4 px-4 whitespace-nowrap">
                              {claim.requestDate}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap font-medium text-zinc-900">
                              {claim.claimId}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              {claim.empName}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              {claim.department}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              {claim.benefitCategory}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap font-medium text-zinc-900">
                              {claim.amountRequested.toLocaleString()}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap text-center">
                              {claim.status === "pending_hr" && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-normal border border-amber-300 text-amber-600 bg-amber-50/50">
                                  รออนุมัติ
                                </span>
                              )}
                              {claim.status === "approved" && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-normal border border-emerald-300 text-emerald-700 bg-emerald-50/50">
                                  อนุมัติแล้ว
                                </span>
                              )}
                              {claim.status === "rejected" && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-normal border border-rose-300 text-rose-600 bg-rose-50/50">
                                  ปฏิเสธ
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedClaimId(claim.claimId);
                                }}
                                className="p-1 hover:bg-zinc-100 rounded-full text-zinc-600 transition-colors"
                              >
                                <ArrowRight className="size-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Drawer: ข้อมูลผู้เบิก */}
            {selectedClaim && (
              <div className="w-full lg:w-[40%] bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-zinc-200/80 p-6 relative">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedClaimId(null)}
                  className="absolute right-5 top-5 text-zinc-400 hover:text-zinc-600 p-1"
                >
                  <X className="size-4" />
                </button>

                <h3 className="text-base font-bold text-zinc-900 mb-5">
                  ข้อมูลผู้เบิก
                </h3>

                {/* Details Grid (Numbered 1-10) */}
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs text-zinc-700 mb-6">
                  <div>
                    <span className="font-medium text-zinc-900">1. ชื่อ :</span>{" "}
                    {selectedClaim.empName}
                  </div>
                  <div>
                    <span className="font-medium text-zinc-900">
                      2. ตำแหน่ง :
                    </span>{" "}
                    {selectedClaim.details?.position || "Staff Member"}
                  </div>
                  <div>
                    <span className="font-medium text-zinc-900">3. แผนก :</span>{" "}
                    {selectedClaim.details?.departmentName ||
                      selectedClaim.department ||
                      "People Operations"}
                  </div>
                  <div>
                    <span className="font-medium text-zinc-900">
                      4. เบอร์โทร :
                    </span>{" "}
                    {selectedClaim.details?.phone || "081-234-5678"}
                  </div>
                  <div>
                    <span className="font-medium text-zinc-900">
                      5. ประเภท :
                    </span>{" "}
                    {selectedClaim.details?.benefitType ||
                      selectedClaim.benefitCategory}
                  </div>
                  <div>
                    <span className="font-medium text-zinc-900">
                      6. ยอดเงิน :
                    </span>{" "}
                    {selectedClaim.amountRequested.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium text-zinc-900">
                      7. ยื่นในฐานะ :
                    </span>{" "}
                    {selectedClaim.claimType || "ตนเอง"}
                  </div>
                  <div>
                    <span className="font-medium text-zinc-900">
                      8. วันที่ตามใบเสร็จ :
                    </span>{" "}
                    {selectedClaim.details?.receiptDate ||
                      selectedClaim.requestDate}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-zinc-900">
                      9. คำอธิบาย :
                    </span>{" "}
                    {selectedClaim.details?.reason || "-"}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-zinc-900">
                      10. เอกสารประกอบ :
                    </span>
                    <div className="flex flex-wrap gap-4 mt-3">
                      {(
                        selectedClaim.attachments || [
                          "ใบเสร็จ_cs001.jpg",
                          "ใบเสร็จ_cs002.jpg",
                        ]
                      ).map((file, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col items-center gap-1 group cursor-pointer"
                        >
                          <div className="size-12 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-500 group-hover:border-zinc-400 transition-colors shadow-2xs">
                            <FileText className="size-5" />
                          </div>
                          <span className="text-[10px] text-zinc-400 max-w-[70px] truncate text-center">
                            {file}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Approve / Reject Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => handleRejectClaim(selectedClaim.claimId)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-rose-300 text-rose-600 bg-white hover:bg-rose-50 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <X className="size-3.5" /> ไม่อนุมัติ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveClaim(selectedClaim.claimId)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-emerald-400 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="size-3.5" /> อนุมัติ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== VIEW 2: แก้ไขสวัสดิการ (Benefit Policies Management) ===== */}
      {activeTab === "edit_benefits" && (
        <div>
          {/* Header row with "+ เพิ่มสวัสดิการใหม่" */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-zinc-900">
              รายการสวัสดิการ
            </h2>
            <button
              type="button"
              onClick={handleOpenAddPolicy}
              className="inline-flex items-center gap-2 bg-[#0a4d3c] hover:bg-[#07362a] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all shadow-sm cursor-pointer"
            >
              <Plus className="size-4" /> เพิ่มสวัสดิการใหม่
            </button>
          </div>

          {/* Section: เปิดใช้งาน */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] flex-1 bg-zinc-200/80"></div>
              <span className="text-sm font-medium text-zinc-500">
                เปิดใช้งาน
              </span>
              <div className="h-[1px] flex-1 bg-zinc-200/80"></div>
            </div>

            {/* Cards Grid: 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePolicies.map((policy) => (
                <div
                  key={policy.id}
                  className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Code & Limit Text */}
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-medium">
                      <span>{policy.code}</span>
                      <span>{policy.maxPerTimeText}</span>
                    </div>

                    {/* Benefit Name & Subtitle */}
                    <h3 className="text-base font-bold text-zinc-900 leading-snug">
                      {policy.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 mb-5">
                      {policy.subtitle || "เบิกได้ไม่เกิน 1,000 บ./ครั้ง"}
                    </p>

                    {/* Info rows */}
                    <div className="space-y-2 text-xs border-t border-zinc-100 pt-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">ลิมิตต่อครั้ง :</span>
                        <span className="text-zinc-700 font-medium">
                          {policy.limitPerTime || "10,000 บาท"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">กลุ่มผู้ใช้สิทธิ์ :</span>
                        <span className="text-zinc-700">
                          {policy.eligibleGroup || "พนักงานทุกคน"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">เอกสารจำเป็น :</span>
                        <span className="text-zinc-700">
                          {policy.requiredDocs || "ใบรับรองแพทย์, ใบเสร็จรับเงิน"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Toggle Switch & Edit button */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-700 font-medium">
                        เปิดใช้งาน
                      </span>
                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleTogglePolicyActive(policy.id)}
                        className="w-10 h-5 bg-emerald-500 rounded-full relative p-0.5 transition-colors cursor-pointer"
                      >
                        <div className="size-4 bg-white rounded-full shadow-sm transform translate-x-5 transition-transform" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEditPolicy(policy)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                    >
                      <Pencil className="size-3 text-zinc-500" /> แก้ไข
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: ปิดใช้งาน */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] flex-1 bg-zinc-200/80"></div>
              <span className="text-sm font-medium text-zinc-400">
                ปิดใช้งาน
              </span>
              <div className="h-[1px] flex-1 bg-zinc-200/80"></div>
            </div>

            {/* Cards Grid for Inactive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inactivePolicies.map((policy) => (
                <div
                  key={policy.id}
                  className="bg-white/70 rounded-3xl p-6 border border-zinc-200/70 shadow-2xs flex flex-col justify-between opacity-85"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-medium">
                      <span>{policy.code}</span>
                      <span>{policy.maxPerTimeText}</span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-700 leading-snug">
                      {policy.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 mb-5">
                      {policy.subtitle || "เบิกได้ไม่เกิน 1,000 บ./ครั้ง"}
                    </p>

                    <div className="space-y-2 text-xs border-t border-zinc-100 pt-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">ลิมิตต่อครั้ง :</span>
                        <span className="text-zinc-600 font-medium">
                          {policy.limitPerTime || "10,000 บาท"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">กลุ่มผู้ใช้สิทธิ์ :</span>
                        <span className="text-zinc-600">
                          {policy.eligibleGroup || "พนักงานทุกคน"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">เอกสารจำเป็น :</span>
                        <span className="text-zinc-600">
                          {policy.requiredDocs || "ใบรับรองแพทย์, ใบเสร็จรับเงิน"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 font-medium">
                        ปิดใช้งาน
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTogglePolicyActive(policy.id)}
                        className="w-10 h-5 bg-zinc-300 rounded-full relative p-0.5 transition-colors cursor-pointer"
                      >
                        <div className="size-4 bg-white rounded-full shadow-sm transform translate-x-0 transition-transform" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEditPolicy(policy)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
                    >
                      <Pencil className="size-3 text-zinc-400" /> แก้ไข
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Button "+ เพิ่มกล่อง" */}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleOpenAddPolicy}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl border border-dashed border-zinc-300 text-zinc-600 hover:text-zinc-900 hover:border-zinc-400 text-sm font-medium transition-colors cursor-pointer"
              >
                <Plus className="size-4" /> เพิ่มกล่อง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: ข้อมูลสวัสดิการ (Add/Edit Benefit Modal) ===== */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-8 shadow-2xl relative">
            {/* Close Button ✕ */}
            <button
              type="button"
              onClick={handleRequestClosePolicyModal}
              className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-600 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            {/* Section 1 Header */}
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-xl font-bold text-zinc-900">
                ข้อมูลสวัสดิการ
              </h3>
              <FileText className="size-5 text-zinc-600" />
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              {/* ชื่อสวัสดิการ * */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  ชื่อสวัสดิการ *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={policyForm.name}
                    onChange={(e) => {
                      setPolicyForm({ ...policyForm, name: e.target.value });
                      setIsFormDirty(true);
                    }}
                    placeholder="[ กรุณาระบุ ]"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              {/* ประเภทสวัสดิการ * */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  ประเภทสวัสดิการ *
                </label>
                <div className="relative">
                  <select
                    value={policyForm.category}
                    onChange={(e) => {
                      setPolicyForm({
                        ...policyForm,
                        category: e.target.value,
                      });
                      setIsFormDirty(true);
                    }}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
                  >
                    <option value="ค่ารักษาพยาบาล">ค่ารักษาพยาบาล</option>
                    <option value="เงินช่วยเหลือ">เงินช่วยเหลือ</option>
                    <option value="ทุนการศึกษา">ทุนการศึกษา</option>
                    <option value="นันทนาการ">นันทนาการ</option>
                    <option value="สวัสดิการทำงาน">สวัสดิการทำงาน</option>
                  </select>
                  <ChevronDown className="size-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* รหัสสวัสดิการ * */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  รหัสสวัสดิการ *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={policyForm.code}
                    onChange={(e) => {
                      setPolicyForm({ ...policyForm, code: e.target.value });
                      setIsFormDirty(true);
                    }}
                    placeholder="[ กรุณาระบุ ]"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 outline-none focus:border-zinc-400"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 leading-tight">
                  หากมีอยู่แล้วจะเติมให้อัตโนมัติ หากไม่มีประเภทสวัสดิการมาก่อนต้องระบุ
                </p>
              </div>
            </div>

            {/* Row 2: กลุ่มที่มีสิทธิ์ & รูปแบบฟอร์ม */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  กลุ่มที่มีสิทธิ์ *
                </label>
                <div className="relative">
                  <select
                    value={policyForm.eligibleGroup}
                    onChange={(e) => {
                      setPolicyForm({
                        ...policyForm,
                        eligibleGroup: e.target.value,
                      });
                      setIsFormDirty(true);
                    }}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
                  >
                    <option value="พนักงานทุกคน">พนักงานทุกคน</option>
                    <option value="พนักงานประจำ">พนักงานประจำ</option>
                    <option value="พนักงานทดลองงาน">พนักงานทดลองงาน</option>
                  </select>
                  <ChevronDown className="size-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  รูปแบบฟอร์ม *
                </label>
                <div className="relative">
                  <select
                    value={policyForm.formType}
                    onChange={(e) => {
                      setPolicyForm({
                        ...policyForm,
                        formType: e.target.value,
                      });
                      setIsFormDirty(true);
                    }}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
                  >
                    <option value="ฟอร์มทั่วไป">ฟอร์มทั่วไป</option>
                    <option value="ฟอร์มค่ารักษาพยาบาล">
                      ฟอร์มค่ารักษาพยาบาล
                    </option>
                    <option value="ฟอร์มการศึกษา">ฟอร์มการศึกษา</option>
                  </select>
                  <ChevronDown className="size-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 3: เอกสารที่ต้องใช้ & เบิกในฐานะ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  เอกสารที่ต้องใช้ *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={policyForm.requiredDocs}
                    onChange={(e) => {
                      setPolicyForm({
                        ...policyForm,
                        requiredDocs: e.target.value,
                      });
                      setIsFormDirty(true);
                    }}
                    placeholder="[ กรุณาเลือก หรือระบุ ]"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  เบิกในฐานะ *
                </label>
                <div className="relative">
                  <select
                    value={policyForm.claimAs}
                    onChange={(e) => {
                      setPolicyForm({
                        ...policyForm,
                        claimAs: e.target.value,
                      });
                      setIsFormDirty(true);
                    }}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
                  >
                    <option value="ตนเอง">ตนเอง</option>
                    <option value="ครอบครัว">ครอบครัว</option>
                    <option value="ตนเองและครอบครัว">
                      ตนเองและครอบครัว
                    </option>
                  </select>
                  <ChevronDown className="size-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 4: ระยะเวลาสวัสดิการ & คำอธิบาย */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-2">
                  ระยะเวลาสวัสดิการ *
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700">
                      <input
                        type="radio"
                        checked={policyForm.duration === "range"}
                        onChange={() => {
                          setPolicyForm({
                            ...policyForm,
                            duration: "range",
                          });
                          setIsFormDirty(true);
                        }}
                        className="accent-emerald-700"
                      />
                      <span>ช่วงเวลา</span>
                    </label>

                    {/* Date Inputs */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          placeholder="dd / mm / yy"
                          value={policyForm.startDate || ""}
                          onChange={(e) => {
                            setPolicyForm({
                              ...policyForm,
                              startDate: e.target.value,
                            });
                            setIsFormDirty(true);
                          }}
                          className="w-28 border border-zinc-200 rounded-lg px-2.5 py-1 text-xs text-zinc-700 outline-none"
                        />
                        <Calendar className="size-3 text-zinc-400 absolute right-2 pointer-events-none" />
                      </div>
                      <span>-</span>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          placeholder="dd / mm / yy"
                          value={policyForm.endDate || ""}
                          onChange={(e) => {
                            setPolicyForm({
                              ...policyForm,
                              endDate: e.target.value,
                            });
                            setIsFormDirty(true);
                          }}
                          className="w-28 border border-zinc-200 rounded-lg px-2.5 py-1 text-xs text-zinc-700 outline-none"
                        />
                        <Calendar className="size-3 text-zinc-400 absolute right-2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700">
                    <input
                      type="radio"
                      checked={policyForm.duration === "permanent"}
                      onChange={() => {
                        setPolicyForm({
                          ...policyForm,
                          duration: "permanent",
                        });
                        setIsFormDirty(true);
                      }}
                      className="accent-emerald-700"
                    />
                    <span>ถาวร</span>
                  </label>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1.5">
                  การเลือกจะส่งผลต่อเวลาการเปิดใช้งานสวัสดิการ
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  คำอธิบาย *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={policyForm.description || ""}
                    onChange={(e) => {
                      setPolicyForm({
                        ...policyForm,
                        description: e.target.value,
                      });
                      setIsFormDirty(true);
                    }}
                    placeholder="[ กรุณาระบุ ]"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: วงเงินสวัสดิการ */}
            <div className="pt-6 border-t border-zinc-100 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-bold text-zinc-900">
                  วงเงินสวัสดิการ
                </h3>
                <Coins className="size-5 text-zinc-600" />
              </div>

              {/* รูปแบบการตัดสิทธิ์ * */}
              <div className="max-w-md mb-6">
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  รูปแบบการตัดสิทธิ์ *
                </label>
                <div className="relative">
                  <select
                    value={policyForm.quotaType || "ต่อครั้ง"}
                    onChange={(e) => {
                      setPolicyForm({
                        ...policyForm,
                        quotaType: e.target.value,
                      });
                      setIsFormDirty(true);
                    }}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
                  >
                    <option value="ต่อครั้ง">ต่อครั้ง</option>
                    <option value="ต่อปี">ต่อปี</option>
                    <option value="ตลอดอายุงาน">ตลอดอายุงาน</option>
                  </select>
                  <ChevronDown className="size-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* เงื่อนไขวงเงิน */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-zinc-800">
                    เงื่อนไขวงเงิน
                  </span>
                  <button
                    type="button"
                    onClick={() => {}}
                    className="px-2.5 py-1 bg-zinc-600 hover:bg-zinc-700 text-white text-[11px] font-medium rounded-md transition-colors cursor-pointer"
                  >
                    + เพิ่มเงื่อนไข
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] text-zinc-600 mb-1">
                      1. วงเงินสูงสุดต่อครั้ง *
                    </label>
                    <input
                      type="text"
                      value={policyForm.maxPerTimeAmount || ""}
                      onChange={(e) => {
                        setPolicyForm({
                          ...policyForm,
                          maxPerTimeAmount: e.target.value,
                          limitPerTime: e.target.value,
                        });
                        setIsFormDirty(true);
                      }}
                      placeholder="[ กรุณาระบุ ]"
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-600 mb-1">
                      จำนวนสูงสุดต่อปี
                    </label>
                    <input
                      type="text"
                      value={policyForm.maxTimesPerYear || ""}
                      onChange={(e) => {
                        setPolicyForm({
                          ...policyForm,
                          maxTimesPerYear: e.target.value,
                        });
                        setIsFormDirty(true);
                      }}
                      placeholder="[ กรุณาระบุ ]"
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-600 mb-1">
                      วงเงินสูงสุดต่อปี
                    </label>
                    <input
                      type="text"
                      value={policyForm.maxPerYearAmount || ""}
                      onChange={(e) => {
                        setPolicyForm({
                          ...policyForm,
                          maxPerYearAmount: e.target.value,
                        });
                        setIsFormDirty(true);
                      }}
                      placeholder="[ กรุณาระบุ ]"
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
              {editingPolicy ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  ลบสวัสดิการ
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setShowSaveConfirm(true)}
                className="bg-[#0a4d3c] hover:bg-[#07362a] text-white text-xs font-medium px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {editingPolicy ? "ยืนยันการแก้ไข" : "บันทึกข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== POPUP 1: ยืนยันการบันทึกข้อมูล ===== */}
      {showSaveConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-zinc-100">
            <div className="size-16 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="size-8 stroke-[2]" />
            </div>

            <h4 className="text-lg font-bold text-zinc-900 mb-2">
              ยืนยันการบันทึกข้อมูล
            </h4>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?
              <br />
              โปรดตรวจสอบความถูกต้องก่อนกดยืนยัน
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSaveConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmSavePolicy}
                className="flex-1 py-2.5 rounded-xl bg-[#0a4d3c] hover:bg-[#07362a] text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== POPUP 2: ยืนยันการลบข้อมูล ===== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-zinc-100">
            <div className="size-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="size-8 stroke-[2]" />
            </div>

            <h4 className="text-lg font-bold text-zinc-900 mb-2">
              ยืนยันการลบข้อมูล
            </h4>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?
              <br />
              การกระทำนี้ไม่สามารถยกเลิกได้
            </p>

            <div className="mb-6 text-left">
              <label className="block text-[11px] text-zinc-400 mb-1.5 text-center">
                กรุณาพิมพ์ &quot;ยืนยัน&quot; แล้วกดตกลง
              </label>
              <input
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder="พิมพ์คำว่า ยืนยัน ที่นี่"
                className="w-full border border-rose-300 rounded-xl px-3 py-2 text-xs text-center text-zinc-900 outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmInput("");
                }}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium transition-colors cursor-pointer"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                disabled={deleteConfirmInput.trim() !== "ยืนยัน"}
                onClick={handleConfirmDeletePolicy}
                className="flex-1 py-2.5 rounded-xl bg-zinc-600 hover:bg-rose-600 disabled:opacity-40 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                ลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== POPUP 3: ข้อมูลยังไม่ถูกบันทึก ===== */}
      {showUnsavedConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-zinc-100">
            <div className="size-16 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="size-8 stroke-[2]" />
            </div>

            <h4 className="text-lg font-bold text-zinc-900 mb-2">
              ข้อมูลยังไม่ถูกบันทึก
            </h4>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              ข้อมูลที่คุณกรอกจะไม่ถูกบันทึก
              <br />
              ต้องการออกจากหน้านี้ใช่หรือไม่?
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowUnsavedConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium transition-colors cursor-pointer"
              >
                แก้ไขต่อ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedConfirm(false);
                  setIsPolicyModalOpen(false);
                  setEditingPolicy(null);
                  setIsFormDirty(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
              >
                ออกจากหน้านี้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

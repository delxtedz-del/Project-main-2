# EDBMS Agent Manual (`Agendmanual.md`)

> High-density technical blueprint for AI agents. Read before modifying or extending this repository.

## 1. Stack & Runtime Rules
- **Framework:** Next.js `16.4.5` (App Router), React `19.3.0`, TypeScript `5` (`strict: true`), Path alias `@/*` -> `./*`.
- **Next.js 16 Guardrail:** Check `node_modules/next/dist/docs/` for breaking Next 16 APIs. Do NOT remove `AGENTS.md` block.
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss";` + `@plugin '@tailwindcss/forms';` in `app/globals.css`) + `tailwind.config.ts`.
  - Brand token: `bg-anyprimary-green-700` / `text-anyprimary-green-700` (`#105647`, hover `#0c4337`).
  - Accent token: `text-foreground-sandybrown` (`#ebac51`).
  - Font: `LINE Seed Sans TH` (`--font-line-seed-th`, class `font-line-seed-sans-th`), loaded in `app/layout.tsx`.
  - Class merger: `import { cn } from "@/utils/cn"` (`clsx` + `tailwind-merge`).
- **Theme Caveat (`tailgrids.config.json`):** TailGrids tokens in `app/globals.css` are configured for **dark theme** (`--color-card-background-50: #030712`, `--color-dropdown-background: #1f2937`, `--color-input-background: #ffffff0d`, `--color-title-50: #ffffffcc`), while the EDBMS UI is **light theme** (`bg-[#FBFBFC]`, white cards). **Always pass explicit light-mode classes** (`bg-white text-gray-900 border-gray-300`) via `className` when using TailGrids primitives.
- **Persistence:** 100% client-side in-memory + `localStorage` (except `POST /api/verify-turnstile`). Always guard `typeof window !== "undefined"` and wrap `localStorage` calls in `try/catch`.
- **Date Conventions:**
  - Stored dates in `data/*`: Thai Buddhist Era slash format `"DD/MM/BBBB"` (`BBBB = CE + 543`, e.g., `"02/11/2569"`).
  - Picker/filter state: ISO `"YYYY-MM-DD"` (CE).
  - Converters: `formatIsoToThaiSlashDate(iso)` (`components/claim/DatePickerField.tsx`), `isoToThaiSlashDate(iso)`, `formatThaiShortDate(thaiSlash)`, `formatIsoToThaiShortDate(iso)` (`components/claim/claimHistoryUtils.ts`).

---

## 2. Route & File Action Map (Where to Edit What)

| Task / Feature | Target File(s) | Notes |
| :--- | :--- | :--- |
| Root shell, font, global layout | `app/layout.tsx`, `app/globals.css` | Flexbox `h-screen overflow-hidden`: `<Sidebar />` left + `<main className="flex-1 overflow-y-auto">` right |
| Sidebar nav links, active route matching, logout | `components/Sidebar.tsx` | Hidden on `/login` & `/register`. Links to `/`, `/oldemployee`, `/benefits`, `/finance` |
| Live Thai date/time header widget | `components/Clock.tsx` | Client component; renders `"วันนี้ DD <เดือนย่อ> BBBB"` |
| Login flow & Cloudflare Turnstile | `app/login/page.tsx`, `app/api/verify-turnstile/route.ts`, `data/Login.ts` | Env: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` (auto-passes if secret unset in dev) |
| Register flow | `app/register/page.tsx` | Saves mock `credential` to `localStorage` and redirects to `/` |
| HR Employee Directory (grid, detail view, tabs, hierarchy, projects) | `app/employees/page.tsx` (also rendered at `/` via `app/page.tsx`) | Uses `data/employees.ts` + `localStorage["edbms-employees"]` |
| HR Employee Card & Add/Edit Modal | `components/EmployeeCard.tsx`, `components/EmployeeModal.tsx` | Avatar upload uses `FileReader.readAsDataURL` (Base64) |
| Former Employees page | `app/oldemployee/page.tsx` | Currently empty-state UI; types ready in `data/hr.ts` (`FormerEmployeeItem`) |
| Employee Benefit Dashboard (billing cycle, pending claims, quota bars) | `app/(employee)/dashboard/page.tsx` | Reads `data/benefit.ts` + syncs `data/benefitQuota.ts` |
| Benefit Claim Submission Form & Post-submit Tracking | `app/(employee)/claim/page.tsx`, `components/claim/ClaimModals.tsx`, `components/claim/ClaimTrackingView.tsx` | Dynamic fields per `BEN-01`..`BEN-11`, supervisor proxy claims, draft autosave |
| Benefit Claim History (filter, search, table, pagination) | `app/(employee)/historyclaim/page.tsx`, `components/claim/ClaimHistorySection.tsx`, `components/claim/ClaimHistoryFilter.tsx`, `components/claim/ClaimHistoryTable.tsx`, `components/claim/claimHistoryUtils.ts` | Supports `?status=approved,pending_document,pending_hr` query param (wrapped in `<Suspense>`) |
| Reusable Thai Date Picker & Multi-Checkbox Filter | `components/claim/DatePickerField.tsx`, `components/claim/SearchableCheckboxFilter.tsx` | Built on `react-aria-components` + TailGrids Calendar |
| Finance Shell & Sub-Navigation Tabs | `app/(finance)/layout.tsx` | Header bar with `<Clock />` + navigation tabs: `/finance`, `/transfers`, `/requests`, `/pay-cycles`, `/reports`, `/benefits` |
| Finance Dashboard (financial overview & charts) | `app/(finance)/finance/page.tsx` | Overview cards, monthly net transfer bar chart (Recharts), recent transfers preview |
| Finance Transfers (records & approval toggle) | `app/(finance)/transfers/page.tsx`, `components/TableTransfers.tsx` | List transfers, toggle pending/approved status, add new transfer modal, sync to `localStorage` |
| Employee Payment Requests & Benefit Payouts | `app/(finance)/requests/page.tsx` | Bridges employee benefit claims from `data/benefit.ts` (`getLiveBenefitsData`) + custom payouts, search & status filters |
| Pay Cycles & Cut-off Settings | `app/(finance)/pay-cycles/page.tsx` | Configure cut-off day (20, 25, 28) and payday (28, 30, end-of-month), synced with `localStorage["edbms_pay_cycle_settings"]` |
| Finance Channel Reports & CSV Import/Export | `app/(finance)/reports/page.tsx` | Summary by channel (BBL, KBANK, SCB, Cheque), monthly chart, CSV export with UTF-8 BOM, CSV import parser |
| Benefits Management & Payout Dispatch | `app/(finance)/benefits/page.tsx` | Global benefits management view (resolves `/benefits` route) with status pipeline (pending_document -> pending_hr -> approved -> success) |
| IT System Overview & Security Dashboard | `app/(edbms-its)/it/page.tsx` | Route `/it`: ภาพรวมระบบ EDBMS, สถิติเชื่อมโยงสด (ผู้ใช้ 35 คน, คำขอทั้งหมด, อนุมัติแล้ว, งบสวัสดิการ), Audit Trail ล่าสุด |
| Access Management (สิทธิ์การเข้าถึง) | `app/(edbms-its)/access/page.tsx` | Route `/access`: ตั้งค่าสิทธิ์ตามตำแหน่ง 5 ระดับ 9 โมดูล บันทึกลง `localStorage["edbms-permissions"]` และจด Audit Log อัตโนมัติ |
| Audit Trail Logs (บันทึกการใช้งานระบบ) | `app/(edbms-its)/logs/page.tsx` | Route `/logs`: ตรวจสอบย้อนหลัง, กรองวันที่/คำค้น/ระดับเหตุการณ์ (ปกติ/เฝ้าระวัง) บันทึกลง `localStorage["edbms-audit-logs"]` |
| Benefits Budget & Emergency Fund | `app/(IT)/benefits/page.tsx`, `app/(IT)/budget/page.tsx` | Route `/benefits`: สรุปงบประมาณสวัสดิการประจำปี และงบสำรองฉุกเฉิน เชื่อมต่อ live claims จาก `data/benefit.ts` |
| Consideration & Approvals | `app/(IT)/approvals/page.tsx` | Route `/approvals`: รายการคำขอรออนุมัติ พร้อมบันทึกสถานะลง `localStorage["budgetApprovalStatus"]` และส่ง Audit Log สู่ IT |

---

## 3. Data Layer & `localStorage` Map (`data/*`)

### 3.1 Critical Dataset Split: `data/employee.ts` vs `data/employees.ts`
Do **NOT** confuse these two files:

| File | Export | Count | ID / Code Format | Purpose & Consumers |
| :--- | :--- | :--- | :--- | :--- |
| `data/employee.ts` | `employees` | 35 | `CS-001`..`EXE-035` (`systemRoleLevel`: 1..22) | **Auth & Benefit system roster.** Matches `data/Login.ts` `users` 1:1. Used by `app/(employee)/claim/page.tsx` for current user lookup & supervisor proxy dropdown. |
| `data/employees.ts` | `mockEmployeesData`, `ExtendedEmployee`, `toEmployeeCardProps`, `teamMembersWithStatus` | 15 | `HR-001`..`HR-015` (has `avatarUrl`, `notes`, `projects`) | **HR Directory UI roster.** Used by `app/employees/page.tsx`, `components/EmployeeModal.tsx`, `components/AvatarStatusRow.tsx`. |

### 3.2 All Data Modules & Exports

#### `data/benefit.ts` — Benefit Policies & Claims Store
- **Types:**
  - `ClaimStatus`: `"pending_document" | "pending_hr" | "approved" | "rejected" | "success"`
    - Display labels (`CLAIM_STATUS_LABELS` in `claimHistoryUtils.ts`): `pending_document`="รอส่งเอกสาร", `pending_hr`="รอตรวจสอบ", `approved`="รอเบิก", `success`="เบิกสำเร็จ", `rejected`="ไม่อนุมัติ".
  - `BenefitPolicyId`: `"BEN-01"` .. `"BEN-11"`
  - `BenefitCategory`: 11 Thai category names (`BENEFIT_CATEGORIES`)
  - `BenefitPolicy`: `{ id, name, maxAmount: number | number[] | null, amountUnit: "per_time" | "per_year" | "lifetime", maxCount: number | null, countUnit: "per_year" | "lifetime" | "unlimited", subLimits?: { label, maxAmount }[] }`
  - `Benefits`: `{ claimId, empCode, empName, department, benefitCategory, benefitId, claimType, requestDate, amountRequested, amountLimit, status, statusNote, details: { reason, [key: string]: any }, attachments: string[], approver, approvedAmount, cutoffdate, disbursement }`
- **Constants (`BENEFIT_POLICIES`):**
  - `BEN-01` สวัสดิการน้ำท่วม: `[3000, 5000, 10000]` `per_time`, `1` `per_year`
  - `BEN-02` ค่ารักษาพยาบาล (พนักงาน): `1000` `per_time`, `30` `per_year`
  - `BEN-03` ค่ารักษาพยาบาล (ครอบครัว): `30000` `per_year`, `unlimited`, `subLimits`: IPD `20000`, OPD `2000`
  - `BEN-04` ทุนการศึกษาระดับปริญญา: `null` `lifetime`, `1` `lifetime`, `subLimits`: ปริญญาโท `300000`, ปริญญาเอก `700000`
  - `BEN-05` ทุนสอบ Certifications: `50000` `per_year`, `unlimited`
  - `BEN-06` เงินช่วยเหลือกรณีคลอดบุตร: `10000` `per_time`, `unlimited`
  - `BEN-07` เงินฌาปนกิจ: `10000` `per_time`, `unlimited`
  - `BEN-08` ค่ากิจกรรมนันทนาการ: `3000` `per_year`, `unlimited`
  - `BEN-09` ค่าตรวจสุขภาพ: `null` `per_year`, `1` `per_year`
  - `BEN-10` ค่าทันตกรรม: `3000` `per_year`, `unlimited`
  - `BEN-11` สวัสดิการ AI Subscription: `5000` `per_year`, `unlimited`
- **Functions:**
  - `getLiveBenefitsData(): Benefits[]` — Synchronous merge of seed `benefitsData` + `localStorage["benefitsAddedData"]` minus `localStorage["benefitsCancelledIds"]`. **Use this for instant UI rendering.**
  - `generateNextClaimId(date?: Date): string` — Returns `CLM-<BE_YY><MM>-<4-digit-seq>`.
  - `addBenefitClaim(claim: Benefits): Benefits[]` — Prepends to memory + persists to `benefitsAddedData` & `userBenefit`, removes from `benefitsCancelledIds`, returns employee's live claims.
  - `cancelBenefitClaim(claimId: string, empCode?: string): Benefits[]` — Removes from memory & `benefitsAddedData`, adds ID to `benefitsCancelledIds`, updates `userBenefit`.
  - `fetchBenefitsPolicy(): Promise<BenefitPolicy[]>` — Mock async (1–3s delay, 10% random reject `"connection refused"`).
  - `fetchBenefits(): Promise<Benefits[]>` — Mock async all claims (1–3s delay, 10% reject).
  - `benefitsSort(empCode: string): Promise<Benefits[]>` — Mock async claims by `empCode` (1–3s delay, 20% reject `"connection refused"`, or rejects `"ไม่พบข้อมูลการเบิกสวัสดิการ"` if empty).

#### `data/benefitQuota.ts` — Quota Calculation & Caching
- **Types:** `BenefitQuotaInfo`, `YearlyEmployeeQuotaRecord`
- **Constants:** `PERSONAL_QUOTA_OVERRIDES` (`Record<empCode, Partial<Record<BenefitPolicyId, { maxAmount?: number; maxCount?: number }>>>`)
- **Functions:**
  - `getBenefitQuotaInfo(policy, claims, fiscalYear, empCode?): BenefitQuotaInfo` — Excludes `status === "rejected"`. Filters by `requestDate.split("/")[2] === fiscalYear` unless `lifetime`. Computes `usedCount`, `usedAmount`, `remainingAmount`, `remainingCount`, `isExhausted`, `remainingLabel`.
  - `getAllBenefitQuotas(policies, claims, fiscalYear, empCode?): BenefitQuotaInfo[]`
  - `syncEmployeeYearlyQuota(empCode, fiscalYear, policies?, claims?): YearlyEmployeeQuotaRecord` — Recomputes and writes `localStorage["benefitQuota_<empCode>_<fiscalYear>"]`. **Must be called after `addBenefitClaim` or `cancelBenefitClaim`.**
  - `getEmployeeQuotasFast(empCode, fiscalYear, currentFiscalYear, policies?, claims?): BenefitQuotaInfo[]` — Reads cached `benefitQuota_<empCode>_<fiscalYear>` when `fiscalYear === currentFiscalYear`; computes and caches on miss.

#### `data/Login.ts` — Auth Mock
- **Types:** `User` (`{ empCode, email, password, role, level }`), `Credential` (`{ token, email, empCode, role }`)
- **Functions:** `login(email, pass)` (1–3s delay, 80% success, default password `"Pass"`), `logout(token)` (1–3s delay, 80% success).
- **Roles & Levels:** `EMP` (1–4), `FIN` (5–8), `AD` (9–12), `MD` (13–14), `HR` (15–18), `IT` (19–22). Supervisor levels in `/claim`: `[4, 8, 12, 13, 14, 18, 22]`.

#### `data/hr.ts` — Type Definitions
#### `data/budget.ts` & `data/it.ts` — Budget & IT Security Layer
- `data/budget.ts`: จัดการงบสวัสดิการรายปี (`yearBudget`), งบสำรองฉุกเฉิน (`reserve`), รายการคำขอระดับองค์กร (`initialRequests`), ฟังก์ชัน `getLiveBudgetRequests()` เชื่อมต่อคำขอสดที่รอตรวจ และ `getLiveBudgetExpenses(year)` รวบรวมยอดเบิกจ่ายที่อนุมัติแล้ว
- `data/it.ts`: ฐานข้อมูลและฟังก์ชันกลางของส่วน IT:
  - `currentUser`: ข้อมูล IT Admin (`ปุนยาพร อย่างมั่น`, `IT SUPER ADMIN`)
  - `modules` (9 โมดูล) & `positions` (5 ตำแหน่งงาน)
  - `getLiveSystemStats()`: คำนวณยอดผู้ใช้ (35 คน), คำขอรวม, อนุมัติแล้ว, ยอดงบประมาณเบิกจ่ายสด
  - `getLiveAuditLogs()` & `addAuditLog(action, detail, level, actor, role)`: บันทึกและดึง Audit Trail
  - `getLivePermissions()` & `savePermissions(position, perms)`: จัดการสิทธิ์การเข้าถึง

#### `data/hr.ts` & `data/finance.ts` — Type Definitions
- `data/hr.ts`: `HrNavTab`, `ProjectItem`, `EmployeeCardItem`, `FormerEmployeeItem`, `BenefitItem`.

#### `data/finance.ts` — Accounting & Finance Data Layer
- **Types:** `NavTab`, `TransferItem`, `PaymentRequestItem`, `ChannelReportItem`, `PayCycleSettings`, `MonthlyChartData`.
- **Functions:**
  - `getLiveTransfers(): TransferItem[]`: Synchronous retrieval combining seed `INITIAL_TRANSFERS` + `localStorage["edbms_finance_transfers"]`.
  - `saveTransfers(items: TransferItem[]): void`: Persists transfer records.
  - `toggleTransferStatus(id: string): TransferItem[]`: Switches transfer between `"pending"` and `"approved"`.
  - `addTransfer(item): TransferItem[]`: Creates a new transfer record.
  - `getLivePaymentRequests(): PaymentRequestItem[]`: Bridges live benefit claims from `data/benefit.ts` (`getLiveBenefitsData`) + custom payouts from `localStorage["edbms_finance_requests"]`.
  - `addPaymentRequest(item): PaymentRequestItem[]`: Adds a new payment request.
  - `getPayCycleSettings(): PayCycleSettings` & `savePayCycleSettings(settings)`: Reads/writes cut-off day and pay day to `localStorage["edbms_pay_cycle_settings"]`.
  - `getLiveChannelReports(): ChannelReportItem[]` & `saveChannelReports(reports)`: Reads/writes channel summary records.

### 3.3 `localStorage` Keys Reference

| Key | Value Shape | Written By | Read By |
| :--- | :--- | :--- | :--- |
| `credential` | `Credential` (or `{ name, email, loggedInAt }`) | `/login`, `/register`, removed by `Sidebar` logout | Auth checks |
| `currentUser` | `User` (fallback: `CS-001`, level `1`) | Custom session switcher / dev tools | `/dashboard`, `/claim`, `/historyclaim` |
| `edbms-employees` | `ExtendedEmployee[]` | `/employees` | `/employees` |
| `benefitsAddedData` | `Benefits[]` | `addBenefitClaim`, `cancelBenefitClaim` | `getLiveBenefitsData` |
| `benefitsCancelledIds` | `string[]` (`claimId[]`) | `addBenefitClaim`, `cancelBenefitClaim` | `getLiveBenefitsData`, `/historyclaim` |
| `userBenefit` | `Benefits[]` | `addBenefitClaim`, `cancelBenefitClaim`, `/dashboard`, `/historyclaim` | `/historyclaim` |
| `benefitQuota_<empCode>_<year>` | `YearlyEmployeeQuotaRecord` | `syncEmployeeYearlyQuota`, `getEmployeeQuotasFast` | `getEmployeeQuotasFast` |
| `claimFormDraft_<empCode>` | `ClaimFormDraft` | `/claim` (autosave on field change; deleted on submit/reset) | `/claim` (restored on mount) |
| `edbms_finance_transfers` | `TransferItem[]` | `saveTransfers`, `addTransfer`, `toggleTransferStatus` | `getLiveTransfers` |
| `edbms_finance_requests` | `PaymentRequestItem[]` | `addPaymentRequest` | `getLivePaymentRequests` |
| `edbms_pay_cycle_settings` | `PayCycleSettings` | `savePayCycleSettings` | `getPayCycleSettings`, `/pay-cycles` |
| `edbms_finance_reports` | `ChannelReportItem[]` | `saveChannelReports`, `/reports` CSV import | `getLiveChannelReports`, `/reports` |

---

## 4. TailGrids UI Kit Reference (`components/tailgrids/core/*`)

All interactive TailGrids components wrap `react-aria-components`. Remember to override dark defaults with light classes where needed.

| Import Path | Exports | Key Props / Variants | Where Used / How to Use |
| :--- | :--- | :--- | :--- |
| `@/components/tailgrids/core/avatar` | `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarBadge` | `Avatar`: `size?: "sm"\|"md"\|"lg"\|"xl"`. `AvatarBadge`: `status?: "online"\|"offline"\|"busy"\|"away"` | Used in `EmployeeCard`, `EmployeeModal`, `AvatarStatusRow`, `/employees`. |
| `@/components/tailgrids/core/badge` | `Badge` | `size?: "sm"\|"md"\|"lg"`, `color?: "gray"\|"primary"\|"error"\|"warning"\|"success"\|"cyan"\|"sky"\|"blue"\|"violet"\|"purple"\|"pink"\|"rose"\|"orange"`, `prefixIcon?`, `suffixIcon?` | Used by `MultiComboboxDisplay`. Available for status pills. |
| `@/components/tailgrids/core/button` | `Button`, `buttonStyles` | `variant?: "primary"\|"danger"\|"success"\|"ghost"`, `appearance?: "fill"\|"outline"`, `size?: "xs"\|"sm"\|"md"\|"lg"`, `iconOnly?: boolean`, `disabled?`, `pending?` | Used in `/dashboard`, `calendar.tsx`, `pagination.tsx`. |
| `@/components/tailgrids/core/calendar` | `Calendar`, `CalendarHeader`, `NavButton`, `CalendarMonthPicker`, `CalendarYearPicker`, `CalendarGrid`, `CalendarGridHeader`, `CalendarGridBody`, `CalendarCell`, `CalendarHeading` | `Calendar`: `value`, `onChange`, `minValue`, `maxValue`, `disabled`, `readonly`. Auto-converts year picker to BE (`+543`) when inside `<I18nProvider locale="th-TH-u-ca-gregory">`. | Wrapped by `components/claim/DatePickerField.tsx` (prefer using `<DatePickerField />` directly for date inputs). |
| `@/components/tailgrids/core/card` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` | Standard `div` props. Default has dark `bg-card-background-50`; override with `bg-white border border-gray-200`. | Used in `/dashboard`. |
| `@/components/tailgrids/core/combobox` | `Combobox`, `ComboboxInputWrapper`, `ComboboxInput`, `ComboboxTrigger`, `ComboboxContent`, `ComboboxList`, `ComboboxItem`, `ComboboxSection`, `ComboboxHeader`, `ComboboxSeparator`, `ComboboxEmpty`, `ComboboxLabel`, `ComboboxDescription`, `ComboboxErrorMessage`, `MultiCombobox`, `MultiComboboxDisplay` | `Combobox`: `value` (`selectedKey`), `onChange` (`onSelectionChange`), `inputValue`, `onInputChange`, `defaultFilter`, `isInvalid`, `menuTrigger="focus"`. `ComboboxItem`: `id`, `textValue`, `isDisabled`. | Used in `/claim` for searchable benefit policy selector with available vs exhausted sections. |
| `@/components/tailgrids/core/dropdown` | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuSection`, `DropdownMenuHeader`, `DropdownMenuItem`, `DropdownMenuSeparator` | `DropdownMenuItem`: `id`, `onAction={() => ...}`. Override `DropdownMenuContent` with `bg-white border border-gray-200`. | Used in `/dashboard` (fiscal year selector) and `ClaimHistoryFilter.tsx` (page size selector). |
| `@/components/tailgrids/core/input` | `Input` | `state?: "default"\|"error"\|"success"` + `react-aria-components` `InputProps`. Override with light classes (`bg-white border-gray-300 text-gray-900`). | Used in `/claim`, `ClaimHistoryFilter.tsx`, `ClaimModals.tsx`. |
| `@/components/tailgrids/core/overlay` | `OverlayWrapper`, `Backdrop` | `Backdrop`: `isOpen`, `onOpenChange`, `isDismissable=true`. Wrap `<Modal><Dialog>...</Dialog></Modal>` inside `<Backdrop>`. | Used in `ClaimModals.tsx`. |
| `@/components/tailgrids/core/pagination` | `Pagination` | `currentPage: number`, `totalPages: number`, `onPageChange?: (page: number) => void`, `variant?: "default"\|"compact"`, `sideLayout?: "full"\|"label"\|"icon"` | Used in `ClaimHistorySection.tsx`. Active page has `[aria-current=page]`. |
| `@/components/tailgrids/core/table` | `TableRoot`, `TableHeader`, `TableBody`, `TableHead`, `TableRow`, `TableCell` | `TableRoot`: `fullBleed?: boolean`. | Used in `/dashboard` and `ClaimHistoryTable.tsx`. |
| `@/components/tailgrids/core/text-area` | `TextArea` | `rows?: number`, `state?: "default"\|"error"\|"success"` | Used in `/claim` (reason field). |

---

## 5. Standard Implementation Patterns
- **Resilient Mock Fetching:** Because `fetchBenefitsPolicy()`, `fetchBenefits()`, and `benefitsSort()` randomly reject (`10%–20%`), always:
  1. Render initial state synchronously from `getLiveBenefitsData()` / `BENEFIT_POLICIES`.
  2. Refresh asynchronously using `withRetry(fn, 3)` and fall back to `getLiveBenefitsData()` on rejection.
- **Adding or Cancelling a Claim:** Always call `addBenefitClaim(claim)` or `cancelBenefitClaim(claimId, empCode)` followed immediately by `syncEmployeeYearlyQuota(empCode, "2569", policies, updatedClaims)` so both claim lists and cached quotas stay synchronized.
- **Adding a New Benefit Policy:**
  1. Add the policy object to `BENEFIT_POLICIES` and its Thai name to `BENEFIT_CATEGORIES` in `data/benefit.ts`.
  2. Add its ID to one of the `POLICY_GROUPS` in `app/(employee)/dashboard/page.tsx`.
  3. If it requires custom attachment labels, required doc bullets, or extra form fields, update `ATTACHMENT_LABELS`, `REQUIRED_DOCS`, `DATE_FIELD_LABELS`, and form validation in `app/(employee)/claim/page.tsx`.

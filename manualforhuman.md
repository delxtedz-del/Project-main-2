# คู่มือระบบ EDBMS สำหรับผู้พัฒนา (Human Developer Manual)

เอกสารนี้สรุปโครงสร้างและหลักการทำงานของระบบ **EDBMS (ระบบจัดการบุคลากรและสวัสดิการพนักงาน)** ซึ่งพัฒนาด้วย **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + TailGrids (React Aria Components)**

---

## ส่วนที่ 1: รายชื่อไฟล์ทั้งหมดในโปรเจกต์ และหน้าที่ของแต่ละไฟล์

### 1.1 ไฟล์ตั้งค่าระบบ (Root & Configuration)
| ไฟล์ | หน้าที่และจุดประสงค์ |
| :--- | :--- |
| `package.json` | กำหนด Dependencies หลัก (`next@16.4.5`, `react@19.3.0`, `react-aria-components`, `@internationalized/date`, `@marsidev/react-turnstile`, `@tailgrids/icons`, `lucide-react`, `recharts`, `class-variance-authority`, `clsx`, `tailwind-merge`) และคำสั่งรันโปรเจกต์ (`dev`, `build`, `start`, `lint`) |
| `next.config.ts` | ตั้งค่า Next.js เปิดใช้ `experimental.agentFeedback`, `cacheComponents: true`, `partialPrefetching: true` และผูก Turbopack loader สำหรับไฟล์ `*.css` ด้วย `@tailwindcss/turbopack` |
| `tsconfig.json` | ตั้งค่า TypeScript strict mode และกำหนด Path Alias `@/*` ชี้ไปยังโฟลเดอร์ราก (`./*`) |
| `tailwind.config.ts` | กำหนด Custom Theme เพิ่มเติม (สีชุด `darkslategray`, `honeydew`, `whitesmoke`, ฟอนต์ `line-seed-sans-th`, ขนาดตัวอักษร `fsize-*`, ความสูงบรรทัด `lhigh-*`) |
| `tailgrids.config.json` | ไฟล์คอนฟิกของ TailGrids CLI ระบุ `theme: "dark"`, `alias: "@"`, `framework: "Next.js"`, และ `mainCssFile: "app/globals.css"` |
| `eslint.config.mjs` | ตั้งค่ากฎการตรวจโค้ดด้วย ESLint 9 ตามมาตรฐาน `eslint-config-next` |
| `AGENTS.md` | กฎบังคับสำหรับ AI Agent ของ Next.js 16 (สร้างอัตโนมัติโดย `next dev`) |
| `README.md` | คู่มือเริ่มต้นการรันโปรเจกต์มาตรฐานของ Create Next App |

### 1.2 หน้าเว็บและ API (โฟลเดอร์ `app/`)
| ไฟล์ | Route URL | หน้าที่และจุดประสงค์ |
| :--- | :--- | :--- |
| `app/globals.css` | (Global CSS) | กำหนดตัวแปรสีและโทเคนของ Tailwind v4 (`@theme`), โทเคนของ TailGrids (ซึ่งตั้งต้นเป็นโทน Dark แต่ถูก Override ด้วยคลาสสีสว่างในแต่ละหน้า) และสีหลักขององค์กร `--color-anyprimary-green-700: #105647` |
| `app/layout.tsx` | (Root Layout) | โหลดฟอนต์ภาษาไทย `LINE Seed Sans TH` (น้ำหนัก 300–700) จาก `public/fonts/`, วาง `<Sidebar />` ด้านซ้าย และพื้นที่เนื้อหาหลัก `<main>` ด้านขวาที่เลื่อนขึ้นลงได้อิสระ |
| `app/page.tsx` | `/` | หน้าแรกของระบบ ทำหน้าที่เรนเดอร์ `<EmployeesPage />` จาก `app/employees/page.tsx` โดยตรง |
| `app/login/page.tsx` | `/login` | หน้าเข้าสู่ระบบ มีการตรวจสอบบอทผ่าน Cloudflare Turnstile และตรวจสอบบัญชีกับข้อมูลจำลองใน `data/Login.ts` |
| `app/register/page.tsx` | `/register` | หน้าลงทะเบียนสร้างบัญชีผู้ใช้ใหม่ (จำลองการบันทึกข้อมูลลง `localStorage`) |
| `app/api/verify-turnstile/route.ts` | `POST /api/verify-turnstile` | API Route ฝั่งเซิร์ฟเวอร์สำหรับส่ง Token ไปตรวจสอบกับ Cloudflare Turnstile (`siteverify`) |
| `app/employees/page.tsx` | `/employees` (และ `/`) | ระบบทำเนียบพนักงาน (ค้นหา, ดูการ์ดพนักงาน, กดดูโปรไฟล์ละเอียด 2 แท็บ, เปลี่ยนรูปโปรไฟล์, เพิ่มโปรเจกต์ย่อย, และเปิด Modal เพิ่ม/แก้ไขพนักงาน) |
| `app/oldemployee/page.tsx` | `/oldemployee` | หน้าทำเนียบพนักงานเก่าที่ลาออกแล้ว (ปัจจุบันแสดงหน้าค้นหาและสถานะว่างเปล่า Empty State) |
| `app/(employee)/dashboard/page.tsx` | `/dashboard` | หน้าภาพรวมสวัสดิการของพนักงาน แสดงรอบบิลปัจจุบัน, ตารางรายการรอเบิก 2 รายการล่าสุด, ตัวเลือกปีงบประมาณ และแถบ Progress Bar แสดงโควตาสวัสดิการคงเหลือแยกตาม 4 หมวดหมู่ |
| `app/(employee)/claim/page.tsx` | `/claim` | หน้าแบบฟอร์มยื่นขอเบิกสวัสดิการแบบไดนามิก (เปลี่ยนฟิลด์ตามประเภทสวัสดิการ 11 ชนิด, คำนวณโควตาคงเหลือ, แนบไฟล์, บันทึกร่างอัตโนมัติ, หัวหน้าเบิกแทนลูกน้อง และแสดงหน้าติดตามสถานะหลังส่งสำเร็จ) |
| `app/(employee)/historyclaim/page.tsx` | `/historyclaim` | หน้าประวัติการเบิกสวัสดิการทั้งหมดของพนักงาน รองรับการรับค่าตัวกรองสถานะเริ่มต้นจาก URL Query (`?status=...`) |

### 1.3 คอมโพเนนต์ส่วนกลางและระบบเบิกสวัสดิการ (โฟลเดอร์ `components/`)
| ไฟล์ | หน้าที่และจุดประสงค์ |
| :--- | :--- |
| `components/Sidebar.tsx` | แถบเมนูนำทางด้านซ้าย (ภาพรวม, พนักงาน, พนักงานเก่า, จัดการสวัสดิการ) พร้อมแสดงโปรไฟล์ผู้ใช้ด้านล่างและปุ่มออกจากระบบ (ซ่อนตัวเองอัตโนมัติในหน้า `/login` และ `/register`) |
| `components/Clock.tsx` | แสดงวันที่ปัจจุบันแบบภาษาไทย (พ.ศ.) และเวลาแบบเรียลไทม์ (อัปเดตทุก 1 วินาที) |
| `components/EmployeeCard.tsx` | การ์ดแสดงข้อมูลย่อของพนักงาน 1 คน (รูป Avatar, ชื่อ, ตำแหน่ง, รหัสพนักงาน, ป้ายแผนก และป้ายอายุงาน) |
| `components/EmployeeModal.tsx` | หน้าต่าง Modal ฟอร์มสำหรับเพิ่มพนักงานใหม่หรือแก้ไขข้อมูลพนักงานเดิม (รวมถึงอัปโหลดรูปโปรไฟล์แบบ Base64 Data URL) |
| `components/AvatarStatusRow.tsx` | คอมโพเนนต์แถวแสดงรูป Avatar ของพนักงานพร้อมจุดสถานะ (ออนไลน์/ทดลองงาน/ออฟไลน์) |
| `components/claim/ClaimHistorySection.tsx` | คอมโพเนนต์หลักที่รวมชุดตัวกรอง (`ClaimHistoryFilter`), ตาราง (`ClaimHistoryTable`) และตัวแบ่งหน้า (`Pagination`) สำหรับแสดงรายการประวัติการเบิก |
| `components/claim/ClaimHistoryFilter.tsx` | แถบเครื่องมือค้นหาและกรองประวัติการเบิก (ช่องค้นหาข้อความ, ตัวเลือกวันที่, ตัวกรองประเภทสวัสดิการแบบหลายตัวเลือก, ตัวกรองสถานะแบบหลายตัวเลือก และ Dropdown เลือกจำนวนรายการต่อหน้า) |
| `components/claim/ClaimHistoryTable.tsx` | ตารางแสดงรายการคำขอเบิกสวัสดิการ พร้อมสีสถานะและฟอร์แมตวันที่ภาษาไทย |
| `components/claim/claimHistoryUtils.ts` | คลังฟังก์ชันช่วยเหลือสำหรับระบบประวัติการเบิก (แปลงวันที่ ISO/พ.ศ., ป้ายชื่อสถานะ, สร้างชื่อหมวดหมู่กรณีเบิกแทน, และอัลกอริทึมค้นหาข้อความแบบครอบคลุมทุกฟิลด์) |
| `components/claim/ClaimModals.tsx` | หน้าต่าง Modal ยืนยัน 4 รูปแบบในหน้ายื่นเบิก (เตือนข้อมูลยังไม่บันทึกตอนกดกลับ, เตือนก่อนล้างฟอร์ม, ยืนยันการส่งคำขอเบิก, และยืนยันการยกเลิกคำขอโดยต้องพิมพ์คำว่า `"ยืนยัน"`) |
| `components/claim/ClaimTrackingView.tsx` | หน้าแสดงผลหลังส่งคำขอเบิกสำเร็จ แสดง Timeline 4 ขั้นตอน, รายการเอกสารตัวจริงที่ต้องนำส่ง HR ภายในวันที่ 20 และปุ่มยกเลิกคำขอ |
| `components/claim/DatePickerField.tsx` | ช่องเลือกวันที่แบบ Popover ปฏิทินภาษาไทย คืนค่าเป็น ISO (`YYYY-MM-DD`) แต่แสดงผลบนปุ่มเป็นปี พ.ศ. (`DD/MM/BBBB`) |
| `components/claim/SearchableCheckboxFilter.tsx` | ปุ่ม Dropdown ตัวกรองแบบเลือกได้หลายค่า (Multi-select Checkbox) พร้อมช่องค้นหาภายในรายการ |

### 1.4 คอมโพเนนต์ UI พื้นฐานจาก TailGrids (โฟลเดอร์ `components/tailgrids/core/`)
| ไฟล์ | หน้าที่และจุดประสงค์ |
| :--- | :--- |
| `avatar.tsx` | แสดงรูปโปรไฟล์ (`Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarBadge`) |
| `badge.tsx` | ป้ายกำกับสถานะหลากสี (`Badge`) รองรับไอคอนนำหน้าและต่อท้าย |
| `button.tsx` | ปุ่มกดมาตรฐาน (`Button`, `buttonStyles`) สร้างบน `react-aria-components` |
| `calendar.tsx` | ปฏิทินเลือกวันที่ (`Calendar`, `CalendarHeader`, `CalendarMonthPicker`, `CalendarYearPicker`, `CalendarGrid`, `CalendarCell`, `NavButton`) รองรับการแสดงปี พ.ศ. เมื่อ Locale เป็นภาษาไทย |
| `card.tsx` | กล่องการ์ด (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`) |
| `dropdown.tsx` | เมนูตัวเลือก (`DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSection`, `DropdownMenuHeader`, `DropdownMenuSeparator`) |
| `input.tsx` | ช่องกรอกข้อความ (`Input`) รองรับสถานะ `default`, `error`, `success` |
| `overlay.tsx` | ฉากหลังมืดสำหรับ Modal (`OverlayWrapper`, `Backdrop`) |
| `pagination.tsx` | แถบหมายเลขเปลี่ยนหน้า (`Pagination`) พร้อมปุ่ม Previous/Next และการย่อเลขหน้าด้วย `...` อัตโนมัติ |
| `table.tsx` | โครงสร้างตารางข้อมูล (`TableRoot`, `TableHeader`, `TableBody`, `TableHead`, `TableRow`, `TableCell`) |
| `text-area.tsx` | ช่องกรอกข้อความหลายบรรทัด (`TextArea`) |
| `combobox/combobox.tsx` | ช่องค้นหาพร้อมรายการตัวเลือก (`Combobox`, `ComboboxInputWrapper`, `ComboboxInput`, `ComboboxTrigger`, `ComboboxContent`, `ComboboxList`, `ComboboxItem`, `ComboboxSection`, `ComboboxHeader`, `ComboboxEmpty` ฯลฯ) |
| `combobox/multi-combobox.tsx` | ช่องค้นหาแบบเลือกได้หลายค่าพร้อมแสดงป้าย Tag (`MultiCombobox`, `MultiComboboxDisplay`) |
| `combobox/index.ts` | ไฟล์ Re-export คอมโพเนนต์ทั้งหมดในโฟลเดอร์ `combobox/` |

### 1.5 ชั้นข้อมูลจำลองและฟังก์ชันจัดการข้อมูล (โฟลเดอร์ `data/` และ `utils/`)
| ไฟล์ | หน้าที่และจุดประสงค์ |
| :--- | :--- |
| `data/benefit.ts` | เก็บข้อมูลนโยบายสวัสดิการทั้ง 11 ประเภท (`BENEFIT_POLICIES`), ข้อมูลการเบิกตั้งต้น (`benefitsData`), และฟังก์ชันอ่าน/เพิ่ม/ยกเลิก/จำลองการดึงข้อมูลสวัสดิการพร้อมซิงก์กับ `localStorage` |
| `data/benefitQuota.ts` | คำนวณสิทธิ์และวงเงินสวัสดิการคงเหลือรายบุคคลประจำปี (`getBenefitQuotaInfo`, `getAllBenefitQuotas`, `syncEmployeeYearlyQuota`, `getEmployeeQuotasFast`) |
| `data/employee.ts` | ข้อมูลพนักงานขององค์กรจำนวน 35 คน (`employees`) พร้อมระดับสิทธิ์ (`systemRoleLevel` 1–22) ใช้จับคู่ในระบบเบิกสวัสดิการ |
| `data/employees.ts` | ข้อมูลพนักงานจำลองสำหรับหน้าทำเนียบพนักงาน HR จำนวน 15 คน (`mockEmployeesData`) พร้อมรูปภาพ Unsplash, โปรเจกต์ และฟังก์ชันแปลงข้อมูลเข้าการ์ด (`toEmployeeCardProps`) |
| `data/Login.ts` | ข้อมูลบัญชีผู้ใช้ 35 บัญชี (`users` รหัสผ่านเริ่มต้น `"Pass"`) และฟังก์ชันจำลองการเข้า/ออกจากระบบ (`login`, `logout`) |
| `data/hr.ts` | กำหนด TypeScript Interfaces สำหรับโมดูล HR (`EmployeeCardItem`, `FormerEmployeeItem`, `ProjectItem`, `BenefitItem`, `HrNavTab`) |
| `data/finance.ts` | กำหนด TypeScript Interfaces สำหรับโมดูลการเงินในอนาคต (`TransferItem`, `PaymentRequestItem`, `ChannelReportItem`, `NavTab`) |
| `utils/cn.ts` | ฟังก์ชัน `cn(...inputs)` รวมคลาส Tailwind CSS ด้วย `clsx` และ `tailwind-merge` |
| `utils/login.ts` | ไฟล์ว่าง (`export {}`) สำรองไว้สำหรับฟังก์ชันช่วยเหลืองาน Authentication |

---

## ส่วนที่ 2: เจาะลึกการทำงาน ฟังก์ชัน อัลกอริทึม การดึงข้อมูล และการแสดงผลในแต่ละไฟล์

---

### 2.1 โมดูลข้อมูล (Data Layer: `data/*` & `utils/*`)

#### 1) `data/benefit.ts`
* **ข้อมูลที่เก็บ:**
  * `benefitsData`: รายการคำขอเบิกสวัสดิการตั้งต้น 5 รายการ (รหัส `CLM-2611-0001` ถึง `0004` และ `CLM-2609-0001`) ของพนักงาน `CS-001`, `CS-002`, `CS-003`
  * `BENEFIT_POLICIES`: กฎและเพดานวงเงินของสวัสดิการ 11 ประเภท (`BEN-01` ถึง `BEN-11`):
    * `BEN-01` (สวัสดิการน้ำท่วม): `maxAmount: [3000, 5000, 10000]` (3 ระดับต่อครั้ง), 1 ครั้ง/ปี
    * `BEN-02` (ค่ารักษาพยาบาล พนักงาน): 1,000 บาท/ครั้ง, สูงสุด 30 ครั้ง/ปี
    * `BEN-03` (ค่ารักษาพยาบาล ครอบครัว): 30,000 บาท/ปี, ไม่จำกัดครั้ง, มีวงเงินย่อย (`subLimits`): IPD 20,000 บ. และ OPD 2,000 บ.
    * `BEN-04` (ทุนการศึกษาระดับปริญญา): 1 ครั้งตลอดอายุงาน (`lifetime`), มีวงเงินย่อย: ป.โท 300,000 บ. และ ป.เอก 700,000 บ.
    * `BEN-05` (ทุนสอบ Certifications): 50,000 บาท/ปี
    * `BEN-06` (คลอดบุตร) และ `BEN-07` (ฌาปนกิจ): 10,000 บาท/ครั้ง ไม่จำกัดจำนวนครั้ง
    * `BEN-08` (กิจกรรมนันทนาการ): 3,000 บาท/ปี
    * `BEN-09` (ตรวจสุขภาพ): ไม่จำกัดวงเงิน (`maxAmount: null`), 1 ครั้ง/ปี
    * `BEN-10` (ทันตกรรม): 3,000 บาท/ปี
    * `BEN-11` (AI Subscription): 5,000 บาท/ปี
* **ฟังก์ชันและอัลกอริทึม:**
  * `getLiveBenefitsData()`:
    1. อ่านรายการที่ผู้ใช้เคยกดเบิกเพิ่มจาก `localStorage["benefitsAddedData"]`
    2. อ่านรายการรหัสคำขอที่ถูกยกเลิกจาก `localStorage["benefitsCancelledIds"]` มาสร้างเป็น `Set`
    3. นำ `benefitsData` ตั้งต้นมารวมกับรายการที่เพิ่มใหม่ลงใน `Map<claimId, Benefits>` โดยตัดรายการที่มี `claimId` อยู่ใน `cancelledSet` ออก
    4. คืนค่าเป็น Array ของรายการเบิกล่าสุดทั้งหมด
  * `generateNextClaimId(date = new Date())`:
    1. คำนวณปี พ.ศ. 2 หลักท้าย (`(date.getFullYear() + 543).slice(-2)`) และเดือน 2 หลัก (`MM`) สร้าง Prefix รูปแบบ `CLM-YYMM-` (เช่น `CLM-6911-`)
    2. วนลูปหาเลขลำดับ 4 หลักท้ายที่มากที่สุด (`maxSeq`) จาก `getLiveBenefitsData()` ที่ขึ้นต้นด้วย Prefix เดียวกัน
    3. คืนค่ารหัสใหม่ที่บวกเลขลำดับเพิ่ม 1 เช่น `CLM-6911-0001`
  * `addBenefitClaim(claim)`:
    1. แทรกคำขอใหม่ไว้หน้าสุด (`unshift`) ของตัวแปร `benefitsData` ในหน่วยความจำ
    2. บันทึกลง `localStorage["benefitsAddedData"]`, ลบรหัสนี้ออกจาก `benefitsCancelledIds` (ถ้ามี) และอัปเดต `localStorage["userBenefit"]` เฉพาะของพนักงานคนนั้น
    3. คืนค่ารายการเบิกทั้งหมดของพนักงานคนนั้น
  * `cancelBenefitClaim(claimId, empCode?)`:
    1. ลบคำขอออกจาก `benefitsData` ในหน่วยความจำ และลบออกจาก `localStorage["benefitsAddedData"]`
    2. เพิ่ม `claimId` ลงใน `localStorage["benefitsCancelledIds"]` เพื่อป้องกันไม่ให้ข้อมูลตั้งต้นกลับขึ้นมาแสดงอีกหลังรีเฟรชหน้า
  * `fetchBenefitsPolicy()`, `fetchBenefits()`, `benefitsSort(empCode)`:
    * จำลองการเรียก API แบบ Asynchronous ด้วย `setTimeout` หน่วงเวลาสุ่ม 1–3 วินาที
    * สุ่มโอกาสสำเร็จ 90% (`Math.random() <= 0.9` สำหรับ Policy/Benefits) หรือ 80% (`<= 0.8` สำหรับ `benefitsSort`) หากสุ่มตกช่วงล้มเหลวจะ `reject("connection refused")` เพื่อให้ฝั่ง UI ทดสอบระบบ Retry และ Fallback

#### 2) `data/benefitQuota.ts`
* **ฟังก์ชันและอัลกอริทึม:**
  * `getBenefitQuotaInfo(policy, claims, fiscalYear, empCode?)`:
    1. **ตรวจสอบโควตาพิเศษรายบุคคล:** เช็ค `PERSONAL_QUOTA_OVERRIDES[empCode]?.[policy.id]` (หากไม่มีให้ใช้ค่ามาตรฐานจาก `policy`)
    2. **คัดกรองรายการเบิกที่นำมาคิดโควตา (`matchingClaims`):** เลือกเฉพาะคำขอที่มี `benefitId === policy.id` และสถานะไม่ใช่ `"rejected"` หากเป็นสวัสดิการตลอดอายุงาน (`lifetime`) ให้นับทุกปี แต่ถ้าเป็นรายปีจะตัดสตริง `requestDate.split("/")[2]` (ปี พ.ศ.) ให้ตรงกับ `fiscalYear`
    3. **คำนวณยอดใช้ไป:**
       * `usedCount` = จำนวนรายการใน `matchingClaims`
       * `usedAmount` = ผลรวมยอดเงิน (ถ้าสถานะเป็น `approved` หรือ `success` จะใช้ `approvedAmount || amountRequested` ส่วนสถานะรอตรวจจะใช้ `amountRequested` เพื่อกันวงเงินไว้ทันที)
    4. **แยกกรณีคำนวณสิทธิ์คงเหลือ 4 รูปแบบ:**
       * **กรณีที่ 1 รายครั้งไม่จำกัดจำนวน (`per_time` + `unlimited` ได้แก่ `BEN-06`, `BEN-07`):** `isExhausted = false` เสมอ, แสดงข้อความ `"10,000 บาท/ครั้ง"`
       * **กรณีที่ 2 ตลอดอายุงาน (`lifetime` ได้แก่ `BEN-04`):** `remaining = max(0, maxCount - usedCount)`, ถ้า `remaining <= 0` จะหมดสิทธิ์ (`"หมดสิทธิ์"`), ถ้ายังเหลือแสดง `"ตามเงื่อนไข"`
       * **กรณีที่ 3 จำกัดจำนวนครั้งต่อปี (`countUnit === "per_year"` ได้แก่ `BEN-01`, `BEN-02`, `BEN-09`):** `remaining = max(0, maxCount - usedCount)`, แสดง `"N ครั้ง"` หรือ `"หมดสิทธิ์"`
       * **กรณีที่ 4 จำกัดวงเงินต่อปี (ได้แก่ `BEN-03`, `BEN-05`, `BEN-08`, `BEN-10`, `BEN-11`):** `remaining = max(0, maxAmount - usedAmount)`, แสดง `"N บาท"` หรือ `"หมดสิทธิ์"`
  * `syncEmployeeYearlyQuota(empCode, fiscalYear, policies, claims?)`:
    * คำนวณโควตาทั้ง 11 ประเภทของพนักงาน แล้วบันทึกลง `localStorage` ที่คีย์ `benefitQuota_<empCode>_<fiscalYear>` พร้อมเวลา `updatedAt`
  * `getEmployeeQuotasFast(empCode, fiscalYear, currentFiscalYear, policies, claims?)`:
    * หากปีที่ขอดูตรงกับปีงบประมาณปัจจุบัน (`fiscalYear === currentFiscalYear`) จะอ่านผลลัพธ์จาก Cache ใน `localStorage["benefitQuota_<empCode>_<fiscalYear>"]` ทันทีโดยไม่ต้องคำนวณใหม่ แต่ถ้ายังไม่มี Cache จะคำนวณใหม่พร้อมบันทึกลง `localStorage` ให้อัตโนมัติ

#### 3) `data/employee.ts` vs `data/employees.ts`
* **`data/employee.ts` (`employees` 35 คน):** เป็นฐานข้อมูลพนักงานฝั่งระบบเบิกสวัสดิการและระบบสิทธิ์ (มีรหัส `CS-001`..`EXE-035` ตรงกับบัญชีใน `data/Login.ts` ทุกประการ) ใช้ในหน้า `/claim` เพื่อให้หัวหน้างานเลือกชื่อลูกน้องเวลาเบิกแทน และดึงชื่อ-นามสกุลกับแผนกไปบันทึกในใบคำขอเบิก
* **`data/employees.ts` (`mockEmployeesData` 15 คน):** เป็นข้อมูลพนักงานฝั่งหน้าทำเนียบ HR (`/employees`) รหัส `HR-001`..`HR-015` มีฟิลด์พิเศษคือ `avatarUrl` (รูปจาก Unsplash), `notes`, `emergencyContactName`, `emergencyContactPhone`, และรายการ `projects` นอกจากนี้ยังมีฟังก์ชัน `toEmployeeCardProps(item)` สำหรับแปลงออบเจกต์ `ExtendedEmployee` ให้เป็น Props ของ `<EmployeeCard />`

#### 4) `data/Login.ts`
* เก็บอาร์เรย์ `users` 35 บัญชี (แบ่งตาม Role: `EMP`, `FIN`, `AD`, `MD`, `HR`, `IT` และ `level` 1–22)
* ฟังก์ชัน `login(email, pass)`: หน่วงเวลา 1–3 วินาที สุ่มโอกาสเชื่อมต่อสำเร็จ 80% ค้นหาผู้ใช้ที่อีเมลและรหัสผ่านตรงกัน ถ้าไม่พบจะ `reject("user not found")` ถ้าพบจะสร้าง `Credential` ที่มี `token: crypto.randomUUID()` ส่งกลับไป

---

### 2.2 โมดูลระบบยืนยันตัวตน (Authentication: `/login`, `/register`, `/api/verify-turnstile`)

#### 1) `app/login/page.tsx`
* **สิ่งที่ดึงมาใช้:** `Turnstile` จาก `@marsidev/react-turnstile`, ฟังก์ชัน `login` จาก `data/Login.ts`, ไอคอน `Eye`/`EyeOff` จาก `lucide-react`
* **ฟังก์ชันและอัลกอริทึม (`handleLogin`):**
  1. ตรวจสอบว่าผู้ใช้ผ่านการติ๊ก Cloudflare Turnstile จนได้ `turnstileToken` หรือยัง (ปุ่มเข้าสู่ระบบจะถูก `disabled` จนกว่าจะได้ Token)
  2. ส่ง `POST /api/verify-turnstile` พร้อม `{ token: turnstileToken }` ไปตรวจสอบที่ฝั่งเซิร์ฟเวอร์
  3. เมื่อเซิร์ฟเวอร์ตอบกลับ `{ success: true }` จึงเรียกฟังก์ชัน `login(email, password)` จาก `data/Login.ts`
  4. หากสำเร็จ จะบันทึกข้อมูลลง `localStorage["credential"]` แล้วเปลี่ยนหน้าไปยัง `"/"` (`router.push("/")`)
  5. หากล้มเหลว จะแยกข้อความแจ้งเตือนตามสาเหตุ: `"user not found"` แสดง `"อีเมลหรือรหัสผ่านไม่ถูกต้อง (รหัสผ่านเริ่มต้นคือ Pass)"`, `"connection refused"` แสดงข้อความให้กดเข้าสู่ระบบใหม่อีกครั้ง
* **การแสดงผล:** แบ่งหน้าจอเป็น 2 ฝั่ง (ซ้าย: รูปภาพทีมงานพร้อมเลเยอร์ไล่เฉดสีเขียวเข้ม `#124b3e`, ขวา: ฟอร์มอีเมล รหัสผ่านที่มีปุ่มสลับดูรหัส ปุ่มลืมรหัสผ่าน และวิดเจ็ต Turnstile)

#### 2) `app/api/verify-turnstile/route.ts`
* **อัลกอริทึม (`POST`):**
  1. อ่าน `token` จาก JSON Body (ถ้าไม่มีคืนค่า 400)
  2. อ่าน `process.env.TURNSTILE_SECRET_KEY` **หากไม่ได้ตั้งค่าไว้ใน Environment (เช่น รันในเครื่องตัวเอง)** จะคืนค่า `{ success: true }` ให้ผ่านทันทีเพื่อความสะดวกในการพัฒนา
  3. หากมี Secret Key จะส่ง `POST` แบบ `application/x-www-form-urlencoded` ไปที่ `https://challenges.cloudflare.com/turnstile/v0/siteverify` และส่งผลลัพธ์กลับไปยังหน้า Login

#### 3) `app/register/page.tsx`
* **อัลกอริทึม (`handleRegister`):** รับค่า ชื่อ-นามสกุล, อีเมล, รหัสผ่าน บันทึกออบเจกต์ `{ name, email, loggedInAt }` ลง `localStorage["credential"]` หน่วงเวลา 400ms แล้วพากลับไปหน้า `"/"`

---

### 2.3 โมดูลจัดการบุคลากร (HR Directory: `/`, `/employees`, `/oldemployee`)

#### 1) `app/employees/page.tsx` (และ `app/page.tsx`)
* **สิ่งที่ดึงมาใช้:** ข้อมูลเริ่มต้น `mockEmployeesData` และ `toEmployeeCardProps` จาก `data/employees.ts`, คอมโพเนนต์ `<EmployeeCard />`, `<EmployeeModal />`, `<Clock />`, และ `<Avatar />` จาก TailGrids
* **การจัดการ State และ Persistence:**
  * เมื่อเปิดหน้าครั้งแรก (`useEffect`) จะอ่านข้อมูลจาก `localStorage["edbms-employees"]` หากมีข้อมูลที่เคยบันทึกไว้จะนำมาทับ `mockEmployeesData` แล้วตั้งค่า `hydrated = true`
  * ทุกครั้งที่ `employees` เปลี่ยนแปลง (หลังจาก `hydrated` แล้ว) จะบันทึกอาร์เรย์ทั้งหมดลง `localStorage["edbms-employees"]` อัตโนมัติ
* **ฟังก์ชันและอัลกอริทึมสำคัญ:**
  * **การค้นหา (`filteredEmployees`):** แปลงคำค้นหา `searchQuery` เป็นตัวพิมพ์เล็ก แล้วกรองพนักงานที่มี `name`, `empCode`, `position`, `department`, `email`, หรือ `phone` ตรงกับคำค้นหา
  * **การเพิ่มและแก้ไขพนักงาน (`handleSaveEmployee`):**
    * หากข้อมูลที่ส่งกลับมาจาก Modal มี `id` อยู่แล้ว → **โหมดแก้ไข:** อัปเดตข้อมูลทับพนักงานคนเดิมใน `employees` และถ้ากำลังเปิดดูหน้ารายละเอียดของพนักงานคนนั้นอยู่ (`selectedEmployee`) ก็อัปเดตหน้าจอทันที
    * หากไม่มี `id` → **โหมดเพิ่มใหม่:** สร้างออบเจกต์ `ExtendedEmployee` ใหม่ กำหนด `id: Date.now().toString()`, สร้างรหัสอัตโนมัติ `HR-016` (ตามจำนวนพนักงาน + 1) แล้วนำขึ้นไปไว้หน้าสุดของรายการ
  * **การเปลี่ยนรูปโปรไฟล์ทันที:** ในหน้ารายละเอียดพนักงาน เมื่อนำเมาส์ชี้ที่รูป Avatar จะมีปุ่มกล้องซ้อนทับ เมื่อเลือกไฟล์รูปภาพ ระบบจะใช้ `FileReader.readAsDataURL(file)` แปลงรูปเป็น Base64 แล้วอัปเดตทั้ง `selectedEmployee` และ `employees` ทันที
  * **การเพิ่มโปรเจกต์ (`handleAddProject`):** พิมพ์ชื่อโปรเจกต์แล้วกดปุ่ม `+` (หรือ Enter) ระบบจะสร้าง `{ id: "p-<timestamp>", name, completed: false }` ต่อท้าย `selectedEmployee.projects`
* **การแสดงผล (สลับ 2 มุมมองด้วย `selectedEmployee`):**
  * **มุมมองที่ 1 หน้ารวมการ์ดพนักงาน (`selectedEmployee === null`):** แสดงหัวข้อหน้าพร้อมจำนวนคนที่กรองได้, ช่องค้นหา, ปุ่ม `"เพิ่มพนักงาน"` และตาราง Grid 3 คอลัมน์ที่เรนเดอร์ `<EmployeeCard />`
  * **มุมมองที่ 2 หน้ารายละเอียดพนักงานรายบุคคล (`selectedEmployee !== null`):**
    * การ์ดบน: รูป Avatar ขนาดใหญ่ (`xl`) พร้อมจุดสถานะ, ชื่อ, ชื่อเล่น, ป้ายแผนก/ตำแหน่ง/ออนไลน์, ปุ่ม `"แก้ไข"` และกล่องสรุป 3 ช่อง (อีเมล, เบอร์โทร, อายุงาน)
    * ด้านล่างแบ่ง 3 คอลัมน์:
      1. **ข้อมูลเชิงลึก (สลับได้ 2 แท็บ):** แท็บ `"ข้อมูลส่วนบุคคล"` (ชื่อ, ชื่อเล่น, รหัส, วันเกิด, เบอร์โทร, อีเมล, ที่อยู่, ผู้ติดต่อฉุกเฉิน) และแท็บ `"ประวัติวิชาชีพ"` (ตำแหน่ง, แผนก, ประเภทจ้างงาน, วันเริ่มงาน, อายุงาน, สถานะ, ป้ายทักษะ Skills)
      2. **ลำดับการบริหาร (Hierarchy):** แสดงแผนผังสายบังคับบัญชาแนวตั้ง 3 ระดับ โดยไฮไลต์ชื่อและตำแหน่งของพนักงานที่เลือกอยู่ตรงกลาง
      3. **โปรเจกต์:** ฟอร์มเพิ่มงานใหม่ และรายการงานแยกเป็นหมวด `"ทำอยู่"` (จุดสีส้ม) และ `"เสร็จแล้ว"` (ขีดฆ่าพร้อมไอคอนเครื่องหมายถูกสีเขียว)

#### 2) `components/EmployeeCard.tsx` & `components/EmployeeModal.tsx`
* **`EmployeeCard.tsx`:** รับข้อมูล `Employee` มาแสดงในการ์ดขอบมนสีขาว มีรูป `<Avatar size="lg">`, ชื่อ, ตำแหน่ง, รหัสพนักงานมุมขวาบน และป้าย 2 อันมุมขวาล่างคือ แผนก (สีเทาอ่อน) และอายุงาน (สีเขียวมิ้นต์ `#58AD9BB2`)
* **`EmployeeModal.tsx`:** Modal ฟอร์มขนาดใหญ่ แบ่งเป็นส่วนอัปโหลดรูปโปรไฟล์ (ใช้ `FileReader` แปลงเป็น Base64 พร้อมปุ่มลบรูป), กลุ่มข้อมูลส่วนตัว, กลุ่มการจ้างงาน (แปลงสตริงทักษะที่คั่นด้วยจุลภาค `,` ให้เป็น ` string[]` ตอนกดบันทึก) และกลุ่มหมายเหตุ

#### 3) `app/oldemployee/page.tsx`
* แสดงหน้าทำเนียบพนักงานเก่า มีหัวข้อหน้า, `<Clock />`, ช่องค้นหา และการ์ดแสดงข้อความ `"ยังไม่มีข้อมูลพนักงานเก่า"`

---

### 2.4 โมดูลสวัสดิการพนักงาน (Employee Benefits: `/dashboard`, `/claim`, `/historyclaim`)

#### 1) `app/(employee)/dashboard/page.tsx` (หน้าภาพรวมสวัสดิการ)
* **สิ่งที่ดึงมาใช้:** `BENEFIT_POLICIES`, `getLiveBenefitsData`, `benefitsSort`, `fetchBenefitsPolicy` จาก `data/benefit.ts`, `syncEmployeeYearlyQuota` จาก `data/benefitQuota.ts`, และคอมโพเนนต์ `Card`, `Button`, `DropdownMenu`, `TableRoot` จาก TailGrids
* **อัลกอริทึมการโหลดข้อมูลแบบ Instant + Background Refresh (`useEffect`):**
  1. อ่านผู้ใช้ปัจจุบันจาก `localStorage["currentUser"]` (หากไม่มีใช้ค่าเริ่มต้น `DEFAULT_USER` คือรหัส `CS-001`)
  2. **แสดงผลทันที (Instant Paint):** ดึงข้อมูลจาก `getLiveBenefitsData()` กรองเฉพาะ `empCode` ของผู้ใช้ มาใส่ State `benefit` แล้วปิดสถานะ `loading` ทันที เพื่อให้หน้าจอแสดงผลโดยไม่ต้องรอ Delay
  3. **ดึงข้อมูลจำลองเบื้องหลังพร้อมระบบลองใหม่ (`withRetry`):** เรียก `benefitsSort(empCode)` และ `fetchBenefitsPolicy()` พร้อมกันผ่าน `Promise.allSettled` โดยครอบด้วยฟังก์ชัน `withRetry(fn, 3)` ที่จะลองเรียกซ้ำสูงสุด 3 ครั้งหากสุ่มเจอ `"connection refused"` (แต่ถ้าเจอ `"ไม่พบข้อมูลการเบิกสวัสดิการ"` จะหยุดลองซ้ำทันที)
  4. เมื่อสำเร็จ จะอัปเดต State, บันทึก `localStorage["userBenefit"]` และเรียก `syncEmployeeYearlyQuota` เพื่ออัปเดต Cache โควตาปี `"2569"`
* **ฟังก์ชันคำนวณการแสดงผล:**
  * `pendingClaims`: กรองเฉพาะคำขอที่มีสถานะ `"pending_document"`, `"pending_hr"`, หรือ `"approved"`
  * `getStatusText(item)`: แปลงสถานะเป็นข้อความแสดงในตารางรายการรอเบิก (`pending_document` → `"รอส่งเอกสารฉบับจริง"`, `pending_hr` → `"รอฝ่ายบุคคลอนุมัติ"`, `approved` → `"จะได้รับเงิน <disbursement หรือ cutoffdate>"`)
  * `getPolicyDescription(policy)`: สร้างข้อความอธิบายเพดานสิทธิ์อัตโนมัติจากโครงสร้าง `BenefitPolicy` (รวมถึงรายการย่อย `subLimits`)
  * `getQuotaDisplay(policy)`: คำนวณยอดคงเหลือและเปอร์เซ็นต์ (`percent = (remaining / max) * 100`) ตามปีงบประมาณที่เลือกใน Dropdown (`2569`, `2568`, `2567`, `2566`) เพื่อกำหนดความกว้างของแถบ Progress Bar
* **การแสดงผล:**
  * แถวบนแบ่ง 2 การ์ด: การ์ดซ้าย `"รอบบิลปัจจุบัน"` (1 พ.ย. - 30 พ.ย.) พร้อมปุ่มกดไปหน้า `/claim` และการด์ขวา `"รายการรอเบิก"` แสดงจำนวนรายการและตาราง 2 รายการล่าสุด พร้อมแถว `"…คลิกเพื่อดูข้อมูลเต็ม"` ที่กดแล้วพาไปหน้า `/historyclaim?status=approved,pending_document,pending_hr`
  * แถวล่าง: ปุ่ม Dropdown เลือกปีงบประมาณ และการ์ดแสดงโควตาสวัสดิการคงเหลือแบ่งเป็น 4 หมวดหมู่ (`ด้านการรักษาพยาบาลและสุขภาพพนักงาน`, `ด้านครอบครัวและเงินช่วยเหลือ`, `ด้านการเรียนรู้และพัฒนาทักษะ`, `ด้านไลฟ์สไตล์และเทคโนโลยี`) พร้อมหลอด Progress Bar ลายเส้นทแยงสีเขียวเข้ม

#### 2) `app/(employee)/claim/page.tsx` (หน้ายื่นเบิกสวัสดิการ)
* **สิ่งที่ดึงมาใช้:**
  * ข้อมูลและฟังก์ชันจาก `data/benefit.ts`, `data/benefitQuota.ts`, `data/employee.ts`
  * คอมโพเนนต์จาก TailGrids: `Combobox` (ชุดเต็ม), `Input`, `TextArea`
  * คอมโพเนนต์เฉพาะของระบบเบิก: `DatePickerField`, `ClaimModals`, `ClaimTrackingView`, `Clock`
* **กลไกและอัลกอริทึมสำคัญ:**
  1. **ระบบตรวจสอบสิทธิ์หัวหน้างาน (`isSupervisor`):**
     * เช็คว่า `currentUser.level` อยู่ในอาร์เรย์ `SUPERVISOR_LEVELS = [4, 8, 12, 13, 14, 18, 22]` หรือไม่
     * หากเป็นหัวหน้างาน ในหัวข้อ `"เบิกในฐานะ *"` จะมีตัวเลือกที่ 3 เพิ่มขึ้นมาคือ `"พนักงาน"` เพื่อให้เลือกชื่อพนักงานคนอื่นจาก `employees` (35 คน) และเมื่อเลือกพนักงานแล้ว ระบบจะสลับ `activeEmpCode` ไปคำนวณโควตาคงเหลือของลูกน้องคนนั้นแทนทันที
  2. **ระบบบันทึกร่างฟอร์มอัตโนมัติ (Draft Autosave):**
     * ทุกครั้งที่ฟิลด์ใดๆ ในฟอร์มเปลี่ยนแปลง `useEffect` จะบันทึกข้อมูลทั้งหมดลง `localStorage["claimFormDraft_<empCode>"]`
     * เมื่อเปิดหน้า `/claim` กลับมาใหม่ ระบบจะกู้คืนค่าทุกฟิลด์กลับมาให้โดยอัตโนมัติ และจะลบ Draft ทิ้งเมื่อกดส่งเบิกสำเร็จหรือกดยืนยันล้างฟอร์ม
  3. **การปรับเปลี่ยนฟิลด์ตามประเภทสวัสดิการ (Dynamic Form):**
     * **Combobox เลือกสวัสดิการ:** แบ่งรายการออกเป็น 2 กลุ่ม คือ `"สิทธิ์ที่สามารถเบิกได้"` (พร้อมแสดงยอดคงเหลือด้านขวา) และ `"สิทธิ์เต็มแล้ว"` (รายการที่ `isExhausted === true` จะถูก `isDisabled` กดเลือกไม่ได้)
     * **เบิกในฐานะ (`claimAs`):**
       * `BEN-03` (รักษาครอบครัว) และ `BEN-07` (ฌาปนกิจ) บังคับเลือก `"ครอบครัว"` เท่านั้น (ซ่อนตัวเลือก `"ตนเอง"`)
       * `BEN-06` (คลอดบุตร) เลือกได้ทั้ง `"ตนเอง"` และ `"ครอบครัว"` โดยตัวเลือกความสัมพันธ์จะจำกัดเฉพาะ `["คู่สมรส", "บุตร"]` (สวัสดิการอื่นมี 4 ความสัมพันธ์คือ `บิดา`, `มารดา`, `คู่สมรส`, `บุตร`)
     * **ช่องระบุยอดเงิน (`renderAmountBlock`) แบ่งเป็น 4 รูปแบบตามนโยบาย:**
       1. *ยอดคงที่ (`BEN-06`, `BEN-07`):* ช่อง Input ถูกล็อกค่าตายตัวที่ `"10,000.00 บาท (คงที่ตามเกณฑ์)"`
       2. *มีวงเงินย่อย `subLimits` (`BEN-03` IPD/OPD, `BEN-04` ป.โท/ป.เอก):* แสดงปุ่ม Radio ให้เลือกประเภทย่อยก่อน แล้วจึงเปิดช่อง Input ให้กรอกตัวเลขตามประเภทย่อยที่เลือก
       3. *หลายระดับตามความเสียหาย (`BEN-01` น้ำท่วม):* แสดงปุ่ม Radio 3 ระดับ (`ระดับ 1 — 3,000 บาท`, `ระดับ 2 — 5,000 บาท`, `ระดับ 3 — 10,000 บาท`) เมื่อเลือกแล้วจะกำหนดค่าเงินให้อัตโนมัติ
       4. *กรอกยอดเงินปกติ (ประเภทอื่นๆ):* ช่องกรอกตัวเลขพร้อมข้อความบอกเพดานสูงสุดและสิทธิ์คงเหลือ
     * **การคำนวณเพดานเงินสูงสุดที่เบิกได้ในครั้งนั้น (`getCurrentMaxLimit`):**
       * หาเพดานต่อครั้ง (`perLimit`) จาก `subLimits`, ระดับน้ำท่วม หรือ `policy.maxAmount`
       * หากเป็นสวัสดิการที่จำกัดวงเงินต่อปี (`amountUnit === "per_year"`) จะใช้ `Math.min(perLimit, selectedQuota.remainingAmount)` (เช่น `BEN-03` IPD เพดานครั้งละ 20,000 บาท แต่ถ้าทั้งปีเหลือโควตาแค่ 12,000 บาท ระบบจะล็อกเพดานการเบิกครั้งนี้ไว้ที่ 12,000 บาท)
     * **ฟิลด์เฉพาะทางเพิ่มเติม:**
       * `BEN-04` (ทุนปริญญา): เพิ่ม 3 ช่องบังคับกรอก คือ ชื่อสถาบันการศึกษา, หลักสูตร, และภาคการศึกษา/ปีการศึกษา
       * `BEN-05` (Certifications): เพิ่ม 2 ช่องบังคับกรอก คือ สถาบันผู้ออกใบรับรอง และชื่อใบรับรอง/License
       * `BEN-01` (น้ำท่วม): เพิ่มช่อง ประเภทที่อยู่ (ตั้งต้นเป็น `"ตรงกับทะเบียนประวัติพนักงาน"`)
  4. **การแนบไฟล์หลักฐาน (`appendFiles`):**
     * รองรับทั้งการคลิกเลือกไฟล์และลากวาง (Drag & Drop)
     * ตรวจสอบนามสกุลด้วย Regex `/(\.jpg|\.jpeg|\.png|\.pdf)$/i` และตรวจสอบขนาดไฟล์ไม่เกิน `5MB` (`5 * 1024 * 1024` ไบต์)
  5. **การตรวจสอบความถูกต้อง 11 ขั้นตอน (`handleFormSubmit`):**
     * เมื่อกดปุ่ม `"ยืนยัน"` ระบบจะตั้ง `hasSubmitted = true` (ทำให้ช่องที่ผิดเงื่อนไขขึ้นกรอบสีแดงทันที และกรอบแดงจะหายไปเองแบบเรียลไทม์เมื่อผู้ใช้แก้ไขช่องนั้นให้ถูกต้อง)
     * ตรวจตามลำดับ: เลือกสวัสดิการหรือยัง → สิทธิ์เต็มหรือยัง → เลือกคนในครอบครัวหรือยัง → เลือกพนักงานที่เบิกแทนหรือยัง → ระบุวันที่เอกสารหรือยัง → ยอดเงินมากกว่า 0 หรือไม่ → ยอดเงินเกิน `maxLimit` หรือไม่ → กรอกข้อมูลเฉพาะของ `BEN-04`/`BEN-05`/`BEN-01` ครบหรือไม่ → แนบไฟล์อย่างน้อย 1 ไฟล์หรือยัง
     * หากผ่านครบทุกข้อ จะเปิด Modal `"confirm_save"` เพื่อขอยืนยันขั้นสุดท้าย
  6. **การบันทึกคำขอและสลับไปหน้าติดตามสถานะ (`handleConfirmSaveClaim`):**
     * สร้างรหัสคำขอใหม่ด้วย `generateNextClaimId()`, กำหนดสถานะเริ่มต้นเป็น `"pending_document"`, บันทึกผ่าน `addBenefitClaim(newClaim)`, อัปเดตโควตาผ่าน `syncEmployeeYearlyQuota(...)`, ลบ Draft ทิ้ง และตั้งค่า `submittedClaim = newClaim`
     * เมื่อ `submittedClaim` มีค่า หน้าจอจะสลับไปแสดงคอมโพเนนต์ `<ClaimTrackingView />` ทันที (ซึ่งผู้ใช้สามารถกดปุ่ม `"ยกเลิกคำขอ"` แล้วพิมพ์คำว่า `"ยืนยัน"` เพื่อเรียก `cancelBenefitClaim` ลบคำขอและคืนโควตากลับมาได้ทันที)

#### 3) `app/(employee)/historyclaim/page.tsx` และคอมโพเนนต์ใน `components/claim/`
* **`app/(employee)/historyclaim/page.tsx`:**
  * อ่าน Query Parameter `?status=...` จาก URL (เช่น `?status=approved,pending_document,pending_hr`) แยกด้วยเครื่องหมาย `,` แล้วคัดเฉพาะสถานะที่ถูกต้องส่งต่อไปเป็น `initialStatuses` ให้ `<ClaimHistorySection />`
  * ใช้ฟังก์ชัน `mergeEmployeeClaims(empCode)` รวมข้อมูลจาก `getLiveBenefitsData()` เข้ากับ `localStorage["userBenefit"]` เพื่อแสดงผลทันที แล้วดึงข้อมูลซ้ำผ่าน `withRetry(() => benefitsSort(empCode))`
* **`components/claim/ClaimHistorySection.tsx`:**
  * จัดการ State ของตัวกรองทั้ง 4 ตัว (`searchQuery`, `selectedDate`, `selectedCategories`, `selectedStatuses`), จำนวนรายการต่อหน้า (`pageSize` เริ่มต้น 5) และหน้าปัจจุบัน (`currentPage`)
  * **อัลกอริทึมการเรียงลำดับและกรอง (`sortedAndFilteredClaims`):**
    1. แปลงวันที่ `requestDate` (`DD/MM/BBBB`) เป็น Timestamp ค.ศ. ด้วย `parseThaiDateToTimestamp` แล้วเรียงลำดับจาก **ใหม่สุดไปเก่าสุด**
    2. กรองด้วย `matchesClaimSearch(claim, searchQuery)` ซึ่งค้นหาข้อความแบบ Substring ครอบคลุมทั้งรหัสคำขอ, รหัสพนักงาน, ชื่อพนักงาน, แผนก, ชื่อสวัสดิการ, วันที่แบบย่อ/แบบเต็ม, ยอดเงิน (ทั้งแบบตัวเลขและแบบมีลูกน้ำ), ชื่อสถานะ, ชื่อสมาชิกครอบครัว, ชื่อใบรับรอง และเหตุผลการเบิก
    3. กรองตามวันที่ (`selectedDate`): เทียบว่า `requestDate` หรือ `cutoffdate` ตรงกับวันที่ที่เลือก
    4. กรองตามหมวดหมู่สวัสดิการ (`selectedCategories`) และสถานะ (`selectedStatuses`) แบบ Multi-select (ภายในกลุ่มเดียวกันเป็น OR และระหว่างคนละกลุ่มเป็น AND)
    5. นำผลลัพธ์มาตัดแบ่งหน้า (`slice`) ส่งให้ `<ClaimHistoryTable />` และแสดง `<Pagination />` จาก TailGrids
* **`components/claim/ClaimHistoryTable.tsx`:**
  * แสดงตารางหัวสีเขียวเข้ม (`bg-anyprimary-green-700`) 6 คอลัมน์ (หรือ 7 คอลัมน์หากเปิด `showEmployeeColumn`): วันยื่นเรื่อง, รหัสคำขอ, (พนักงาน), รายละเอียดคำขอ (หากเป็นการเบิกให้ครอบครัวหรือเบิกแทน จะเติมคำว่า `" (เบิกแทน)"` ต่อท้ายชื่อสวัสดิการและแสดงชื่อผู้รับสิทธิ์/เหตุผลในบรรทัดย่อย), ยอดเงิน, สถานะ (แยกสีตามสถานะ เช่น `รอเบิก` สีเขียวมรกต, `รอส่งเอกสาร` สีส้มอำพัน, `รอตรวจสอบ` สีฟ้า, `เบิกสำเร็จ` สีเขียวเข้ม, `ไม่อนุมัติ` สีแดง) และรอบการโอน
* **`components/claim/DatePickerField.tsx`:**
  * ผสาน `DialogTrigger` + `Popover` ของ `react-aria-components` เข้ากับ `<Calendar />` ของ TailGrids โดยครอบด้วย `<I18nProvider locale="th-TH-u-ca-gregory">` เพื่อให้ชื่อเดือนและวันเป็นภาษาไทย และแสดงผลวันที่ที่เลือกบนปุ่มในรูปแบบ `DD/MM/BBBB` (พ.ศ.)
* **`components/claim/SearchableCheckboxFilter.tsx`:**
  * ปุ่มตัวกรองแบบเลือกได้หลายรายการ เมื่อเปิด Popover จะมีช่องค้นหารายการย่อย โดยแยกรายการที่ถูกติ๊กเลือกแล้วไว้ด้านบนสุด (พร้อมเส้นคั่น) ตามด้วยรายการที่ยังไม่ถูกเลือกด้านล่าง บนปุ่มหลักจะแสดงชื่อตัวเลือกสุดท้ายที่เลือก พร้อมป้ายตัวเลขจำนวนที่เลือก (เมื่อเลือกมากกว่า 1 รายการ) หรือปุ่มกากบาท `X` ล้างค่า (เมื่อเลือก 1 รายการ)

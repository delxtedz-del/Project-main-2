"use client";

import { ClaimModals, ClaimModalType } from "@/components/claim/ClaimModals";
import { ClaimTrackingView } from "@/components/claim/ClaimTrackingView";
import Clock from "@/components/Clock";
import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeader,
  CalendarHeading,
  CalendarMonthPicker,
  CalendarYearPicker,
  NavButton,
} from "@/components/tailgrids/core/calendar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxHeader,
  ComboboxInput,
  ComboboxInputWrapper,
  ComboboxItem,
  ComboboxList,
  ComboboxSection,
  ComboboxTrigger,
} from "@/components/tailgrids/core/combobox";
import { Input } from "@/components/tailgrids/core/input";
import { TextArea } from "@/components/tailgrids/core/text-area";
import {
  addBenefitClaim,
  BENEFIT_POLICIES,
  BenefitPolicy,
  BenefitPolicyId,
  Benefits,
  benefitsSort,
  cancelBenefitClaim,
  fetchBenefitsPolicy,
  generateNextClaimId,
  getLiveBenefitsData,
} from "@/data/benefit";
import {
  BenefitQuotaInfo,
  getEmployeeQuotasFast,
  syncEmployeeYearlyQuota,
} from "@/data/benefitQuota";
import { employees } from "@/data/employee";
import { User } from "@/data/Login";
import { cn } from "@/utils/cn";
import { CalendarDate, getLocalTimeZone, parseDate, today } from "@internationalized/date";
import {
  AlertTriangle,
  Bell,
  Calendar as CalendarIcon,
  ChevronLeft,
  CloudUpload,
  FileText,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  I18nProvider,
  Popover,
} from "react-aria-components";

const SUPERVISOR_LEVELS = [4, 8, 12, 13, 14, 18, 22];

const DEFAULT_USER: User = {
  empCode: "CS-001",
  email: "cs1@thaibmamail.com",
  password: "",
  role: "EMP",
  level: 1,
};

// ============================================================================
// ตัวแปร Mock รอรับค่าจากระบบ/API ในอนาคต (แก้ไขค่าเริ่มต้นได้ที่นี่)
// ============================================================================
const CLAIM_MOCK_CONFIG = {
  fiscalYear: "2569", // ปีงบประมาณปัจจุบันสำหรับคำนวณสิทธิ์คงเหลือ
  allowedFileExtensions: [".jpg", ".jpeg", ".png", ".pdf"], // นามสกุลไฟล์ที่รองรับ
  allowedFileLabels: ["JPG", "PNG", "PDF"], // ชื่อประเภทไฟล์ที่แสดงใน UI
  maxFileSizeMB: 5, // ขนาดไฟล์สูงสุด (MB)
  docDeadlineDay: 20, // วันที่กำหนดส่งเอกสารตัวจริงภายในเดือน
  docDeadlineDateText: "20 พ.ย. 2569", // วันที่กำหนดส่งเอกสารแบบเต็ม
  payrollRoundText: "รอบจ่ายเงินเดือนพฤศจิกายน 2569", // รอบการจ่ายเงินเดือน
};

const MAX_FILE_SIZE_BYTES = CLAIM_MOCK_CONFIG.maxFileSizeMB * 1024 * 1024;
const ACCEPTED_FILE_ATTR = CLAIM_MOCK_CONFIG.allowedFileExtensions.join(",");

const FAMILY_RELATIONS = ["บิดา", "มารดา", "คู่สมรส", "บุตร"];
const BIRTH_FAMILY_RELATIONS = ["คู่สมรส", "บุตร"];

const ATTACHMENT_LABELS: Record<string, string> = {
  "BEN-01": "รูปถ่ายความเสียหาย / หลักฐานที่อยู่",
  "BEN-02": "ใบเสร็จ/ใบรับรองแพทย์",
  "BEN-03": "ใบเสร็จ/ใบรับรองแพทย์",
  "BEN-04": "ใบเสร็จ",
  "BEN-05": "ผลการสอบ / สำเนาใบรับรอง",
  "BEN-06": "สำเนาทะเบียนสมรส/ใบสูติบัตรบุตร",
  "BEN-07":
    "มรณบัตร/เอกสารยืนยันความสัมพันธ์ (เช่น ทะเบียนสมรส หรือ ทะเบียนบ้าน)",
};

const REQUIRED_DOCS: Record<string, string[]> = {
  "BEN-01": [
    "ภาพถ่ายความเสียหายจากน้ำท่วม",
    "สำเนาทะเบียนบ้าน / เอกสารยืนยันที่อยู่",
  ],
  "BEN-02": ["ใบเสร็จรับเงินฉบับจริง", "ใบรับรองแพทย์ (ถ้ามี)"],
  "BEN-03": [
    "ใบเสร็จรับเงินฉบับจริง",
    "ใบรับรองแพทย์",
    "เอกสารแสดงความสัมพันธ์ครอบครัว",
  ],
  "BEN-04": [
    "ใบเสร็จรับเงินค่าเล่าเรียนฉบับจริง",
    "ใบแจ้งผลการเรียน / หนังสือรับรองสถานภาพนักศึกษา",
  ],
  "BEN-05": ["ใบเสร็จรับเงินค่าสอบฉบับจริง", "สำเนาใบรับรอง / ผลการสอบ"],
  "BEN-06": ["สำเนาสูติบัตรบุตร", "สำเนาทะเบียนสมรส (กรณีเบิกในนามคู่สมรส)"],
  "BEN-07": [
    "สำเนาใบมรณบัตร",
    "เอกสารยืนยันความสัมพันธ์ (ทะเบียนสมรส หรือ ทะเบียนบ้าน)",
  ],
};

const DATE_FIELD_LABELS: Record<string, string> = {
  "BEN-05": "วันที่ตามใบรับรอง *",
  "BEN-06": "วันที่คลอดบุตร (ตามสูติบัตร) *",
  "BEN-07": "วันที่เสียชีวิต (ตามใบมรณบัตร) *",
};

const LIGHT_INPUT_CLASS =
  "w-full bg-white text-sm text-black placeholder:text-gray-400 border-gray-400 hover:border-anyprimary-green-700 focus:border-anyprimary-green-700 focus:ring-anyprimary-green-700/15 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300";

const ERROR_INPUT_CLASS =
  "!border-red-500 !ring-2 !ring-red-500/15 focus:!border-red-500 focus:!ring-red-500/20";

type ClaimAsMode = "self" | "family" | "employee";

interface UploadedFileItem {
  name: string;
  size: number;
}

interface ClaimFormDraft {
  selectedPolicyId: BenefitPolicyId | "";
  benefitSearchText: string;
  claimAs: ClaimAsMode;
  selectedFamilyMember: string;
  selectedEmployeeCode: string;
  documentDate: string;
  amountInput: string;
  selectedSubLimitLabel: string;
  floodLevel: number;
  floodAddressType: string;
  instituteName: string;
  courseName: string;
  semester: string;
  certificateName: string;
  reason: string;
  files: UploadedFileItem[];
}

function getDraftStorageKey(empCode: string) {
  return `claimFormDraft_${empCode}`;
}

export default function ClaimPage() {
  const router = useRouter();

  // User & quota states
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [isSupervisor, setIsSupervisor] = useState<boolean>(false);
  const [policies, setPolicies] = useState<BenefitPolicy[]>(BENEFIT_POLICIES);
  const [userBenefits, setUserBenefits] = useState<Benefits[]>([]);
  const [employeeClaimsCache, setEmployeeClaimsCache] = useState<
    Record<string, Benefits[]>
  >({});
  const [quotaVersion, setQuotaVersion] = useState<number>(0);
  const [draftLoaded, setDraftLoaded] = useState<boolean>(false);

  // Form states
  const [selectedPolicyId, setSelectedPolicyId] = useState<
    BenefitPolicyId | ""
  >("");
  const [benefitSearchText, setBenefitSearchText] = useState<string>("");
  const [claimAs, setClaimAs] = useState<ClaimAsMode>("self");
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>("");
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState<string>("");

  const [documentDate, setDocumentDate] = useState<string>("");
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  const [amountInput, setAmountInput] = useState<string>("");
  const [selectedSubLimitLabel, setSelectedSubLimitLabel] =
    useState<string>("");
  const [floodLevel, setFloodLevel] = useState<number>(1);
  const [floodAddressType, setFloodAddressType] = useState<string>(
    "ตรงกับทะเบียนประวัติพนักงาน"
  );

  // Education (BEN-04) & Certification (BEN-05) fields
  const [instituteName, setInstituteName] = useState<string>("");
  const [courseName, setCourseName] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [certificateName, setCertificateName] = useState<string>("");

  const [reason, setReason] = useState<string>("");
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Modal & submitted tracking states
  const [modalType, setModalType] = useState<ClaimModalType>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>("");
  const [submittedClaim, setSubmittedClaim] = useState<Benefits | null>(null);

  const [maxSelectableDate, setMaxSelectableDate] = useState<
    CalendarDate | undefined
  >(undefined);

  // Load user, draft, and initial quota from localStorage
  useEffect(() => {
    let active = true;

    const initClaimPage = async () => {
      setMaxSelectableDate(today(getLocalTimeZone()));
      let parsedUser: User = DEFAULT_USER;
      try {
        const rawUser = localStorage.getItem("currentUser");
        if (rawUser) parsedUser = JSON.parse(rawUser) as User;
      } catch {
        parsedUser = DEFAULT_USER;
      }

      if (!active) return;
      setCurrentUser(parsedUser);
      setIsSupervisor(SUPERVISOR_LEVELS.includes(parsedUser.level));

      // โหลดข้อมูลคำขอที่มีอยู่ทันที (ไม่ต้องรอ delay)
      const initialClaims = getLiveBenefitsData().filter(
        (item) => item.empCode === parsedUser.empCode
      );
      setUserBenefits(initialClaims);

      // คืนค่าแบบร่างที่กรอกค้างไว้ (ถ้ามี)
      try {
        const rawDraft = localStorage.getItem(
          getDraftStorageKey(parsedUser.empCode)
        );
        if (rawDraft) {
          const draft = JSON.parse(rawDraft) as Partial<ClaimFormDraft>;
          if (draft.selectedPolicyId) {
            setSelectedPolicyId(draft.selectedPolicyId);
            setBenefitSearchText(draft.benefitSearchText ?? "");
            setClaimAs(draft.claimAs ?? "self");
            setSelectedFamilyMember(draft.selectedFamilyMember ?? "");
            setSelectedEmployeeCode(draft.selectedEmployeeCode ?? "");
            setDocumentDate(draft.documentDate ?? "");
            setAmountInput(draft.amountInput ?? "");
            setSelectedSubLimitLabel(draft.selectedSubLimitLabel ?? "");
            setFloodLevel(draft.floodLevel ?? 1);
            setFloodAddressType(
              draft.floodAddressType ?? "ตรงกับทะเบียนประวัติพนักงาน"
            );
            setInstituteName(draft.instituteName ?? "");
            setCourseName(draft.courseName ?? "");
            setSemester(draft.semester ?? "");
            setCertificateName(draft.certificateName ?? "");
            setReason(draft.reason ?? "");
            setFiles(Array.isArray(draft.files) ? draft.files : []);
          }
        }
      } catch {
        // ignore invalid draft JSON
      } finally {
        if (active) setDraftLoaded(true);
      }

      try {
        const fetchedPolicies = await fetchBenefitsPolicy();
        if (active && Array.isArray(fetchedPolicies)) {
          setPolicies(fetchedPolicies);
        }
      } catch {
        // fallback to BENEFIT_POLICIES
      }
    };

    void initClaimPage();

    return () => {
      active = false;
    };
  }, []);

  // Auto-save form draft while editing
  useEffect(() => {
    if (!draftLoaded || submittedClaim) return;

    try {
      const key = getDraftStorageKey(currentUser.empCode);
      if (!selectedPolicyId) {
        localStorage.removeItem(key);
        return;
      }

      const draft: ClaimFormDraft = {
        selectedPolicyId,
        benefitSearchText,
        claimAs,
        selectedFamilyMember,
        selectedEmployeeCode,
        documentDate,
        amountInput,
        selectedSubLimitLabel,
        floodLevel,
        floodAddressType,
        instituteName,
        courseName,
        semester,
        certificateName,
        reason,
        files,
      };
      localStorage.setItem(key, JSON.stringify(draft));
    } catch {
      // ignore storage quota errors
    }
  }, [
    draftLoaded,
    submittedClaim,
    currentUser.empCode,
    selectedPolicyId,
    benefitSearchText,
    claimAs,
    selectedFamilyMember,
    selectedEmployeeCode,
    documentDate,
    amountInput,
    selectedSubLimitLabel,
    floodLevel,
    floodAddressType,
    instituteName,
    courseName,
    semester,
    certificateName,
    reason,
    files,
  ]);

  // Load target employee claims when supervisor claims on behalf of an employee
  useEffect(() => {
    let active = true;
    if (!isSupervisor || claimAs !== "employee" || !selectedEmployeeCode) {
      return;
    }

    benefitsSort(selectedEmployeeCode)
      .then((remoteClaims) => {
        if (!active || !Array.isArray(remoteClaims)) return;
        setEmployeeClaimsCache((prev) => ({
          ...prev,
          [selectedEmployeeCode]: remoteClaims,
        }));
      })
      .catch(() => {
        // already using getLiveBenefitsData fallback
      });

    return () => {
      active = false;
    };
  }, [isSupervisor, claimAs, selectedEmployeeCode]);

  const activeEmpCode =
    isSupervisor && claimAs === "employee" && selectedEmployeeCode
      ? selectedEmployeeCode
      : currentUser.empCode;

  const activeClaims =
    isSupervisor && claimAs === "employee" && selectedEmployeeCode
      ? (employeeClaimsCache[selectedEmployeeCode] ??
        getLiveBenefitsData().filter(
          (item) => item.empCode === selectedEmployeeCode
        ))
      : userBenefits;

  // ใช้ค่าโควต้าปีปัจจุบันจาก localStorage ทันที (ไม่ต้องคำนวณใหม่ทุกรอบ)
  const quotaList = useMemo(() => {
    void quotaVersion;
    return getEmployeeQuotasFast(
      activeEmpCode,
      CLAIM_MOCK_CONFIG.fiscalYear,
      CLAIM_MOCK_CONFIG.fiscalYear,
      policies,
      activeClaims
    );
  }, [activeEmpCode, policies, activeClaims, quotaVersion]);

  const availableQuotas = useMemo(
    () => quotaList.filter((q) => !q.isExhausted),
    [quotaList]
  );

  const exhaustedQuotas = useMemo(
    () => quotaList.filter((q) => q.isExhausted),
    [quotaList]
  );

  const selectedQuota: BenefitQuotaInfo | null = useMemo(
    () => quotaList.find((q) => q.policy.id === selectedPolicyId) ?? null,
    [quotaList, selectedPolicyId]
  );

  const selectedPolicy = selectedQuota?.policy ?? null;

  const clearDraftFromStorage = () => {
    try {
      localStorage.removeItem(getDraftStorageKey(currentUser.empCode));
    } catch {
      // ignore
    }
  };

  const resetFormFields = (newId: BenefitPolicyId | "" = "") => {
    setSelectedPolicyId(newId);
    setFormError("");
    setHasSubmitted(false);
    setSelectedFamilyMember("");
    setSelectedEmployeeCode("");
    setDocumentDate("");
    setReason("");
    setInstituteName("");
    setCourseName("");
    setSemester("");
    setCertificateName("");
    setFiles([]);

    const policy = policies.find((p) => p.id === newId);
    if (!policy) {
      setBenefitSearchText("");
      setClaimAs("self");
      setAmountInput("");
      setSelectedSubLimitLabel("");
      return;
    }

    setBenefitSearchText(policy.name);

    if (newId === "BEN-03" || newId === "BEN-07") {
      setClaimAs("family");
    } else {
      setClaimAs("self");
    }

    if (policy.subLimits && policy.subLimits.length > 0) {
      setSelectedSubLimitLabel(policy.subLimits[0].label);
      setAmountInput("");
    } else if (newId === "BEN-06" || newId === "BEN-07") {
      setAmountInput("10000");
      setSelectedSubLimitLabel("");
    } else if (newId === "BEN-01" && Array.isArray(policy.maxAmount)) {
      setFloodLevel(1);
      setAmountInput(String(policy.maxAmount[0]));
      setSelectedSubLimitLabel("");
    } else {
      setAmountInput("");
      setSelectedSubLimitLabel("");
    }
  };

  const appendFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const validFiles: UploadedFileItem[] = [];
    const extRegex = new RegExp(
      `(${CLAIM_MOCK_CONFIG.allowedFileExtensions.join("|").replace(/\./g, "\\.")})$`,
      "i"
    );

    Array.from(fileList).forEach((f) => {
      if (!extRegex.test(f.name)) {
        setFormError(
          `รองรับเฉพาะไฟล์ ${CLAIM_MOCK_CONFIG.allowedFileLabels.join(", ")} เท่านั้น`
        );
        return;
      }
      if (f.size > MAX_FILE_SIZE_BYTES) {
        setFormError(
          `ไฟล์ ${f.name} มีขนาดเกิน ${CLAIM_MOCK_CONFIG.maxFileSizeMB}MB`
        );
        return;
      }
      validFiles.push({ name: f.name, size: f.size });
    });

    if (validFiles.length > 0) {
      setFormError("");
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    appendFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    appendFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getCurrentMaxLimit = (): number | null => {
    if (!selectedPolicy) return null;

    let perLimit: number | null = null;
    if (selectedPolicy.subLimits && selectedSubLimitLabel) {
      const sub = selectedPolicy.subLimits.find(
        (s) => s.label === selectedSubLimitLabel
      );
      perLimit = sub ? sub.maxAmount : null;
    } else if (Array.isArray(selectedPolicy.maxAmount)) {
      perLimit =
        selectedPolicy.maxAmount[floodLevel - 1] ?? selectedPolicy.maxAmount[0];
    } else {
      perLimit = selectedPolicy.maxAmount;
    }

    if (
      selectedPolicy.amountUnit === "per_year" &&
      selectedQuota?.remainingAmount !== null &&
      selectedQuota?.remainingAmount !== undefined
    ) {
      return perLimit !== null
        ? Math.min(perLimit, selectedQuota.remainingAmount)
        : selectedQuota.remainingAmount;
    }

    return perLimit;
  };

  const formatThaiDate = (isoDate: string): string => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    if (!y || !m || !d) return isoDate;
    return `${d}/${m}/${Number(y) + 543}`;
  };

  // ============================================================================
  // Validation รายช่อง (ขึ้นขอบแดงเมื่อกดยืนยันแล้ว และหายทันทีเมื่อกรอกถูกต้อง)
  // ============================================================================
  const maxLimit = getCurrentMaxLimit();
  const isFixedAmount =
    selectedPolicy?.id === "BEN-06" || selectedPolicy?.id === "BEN-07";

  const numericAmount = isFixedAmount ? 10000 : Number(amountInput);

  const isPolicyInvalid = hasSubmitted && !selectedPolicyId;
  const isFamilyInvalid =
    hasSubmitted && claimAs === "family" && !selectedFamilyMember;
  const isEmployeeInvalid =
    hasSubmitted &&
    isSupervisor &&
    claimAs === "employee" &&
    !selectedEmployeeCode;
  const isDateInvalid = hasSubmitted && Boolean(selectedPolicy) && !documentDate;
  const isAmountInvalid =
    hasSubmitted &&
    Boolean(selectedPolicy) &&
    !isFixedAmount &&
    (!amountInput.trim() ||
      Number.isNaN(numericAmount) ||
      numericAmount <= 0 ||
      (maxLimit !== null && numericAmount > maxLimit));

  const isInstituteInvalid =
    hasSubmitted &&
    (selectedPolicy?.id === "BEN-04" || selectedPolicy?.id === "BEN-05") &&
    !instituteName.trim();
  const isCourseInvalid =
    hasSubmitted && selectedPolicy?.id === "BEN-04" && !courseName.trim();
  const isSemesterInvalid =
    hasSubmitted && selectedPolicy?.id === "BEN-04" && !semester.trim();
  const isCertificateInvalid =
    hasSubmitted && selectedPolicy?.id === "BEN-05" && !certificateName.trim();
  const isFloodAddressInvalid =
    hasSubmitted && selectedPolicy?.id === "BEN-01" && !floodAddressType.trim();
  const isFilesInvalid =
    hasSubmitted && Boolean(selectedPolicy) && files.length === 0;

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setFormError("");

    if (!selectedPolicy) {
      setFormError("กรุณาเลือกประเภทสวัสดิการ");
      return;
    }

    if (selectedQuota?.isExhausted) {
      setFormError("สวัสดิการนี้ใช้สิทธิ์ครบแล้ว ไม่สามารถยื่นเบิกเพิ่มได้");
      return;
    }

    if (claimAs === "family" && !selectedFamilyMember) {
      setFormError("กรุณาเลือกบุคคลในครอบครัว");
      return;
    }

    if (isSupervisor && claimAs === "employee" && !selectedEmployeeCode) {
      setFormError("กรุณาเลือกพนักงานที่ต้องการเบิกแทน");
      return;
    }

    if (!documentDate) {
      setFormError("กรุณาระบุวันที่ตามเอกสาร");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setFormError("กรุณาระบุยอดเงินที่ขอเบิกให้ถูกต้อง");
      return;
    }

    if (maxLimit !== null && numericAmount > maxLimit) {
      setFormError(
        `ยอดเงินที่ขอเบิกต้องไม่เกินยอดคงเหลือ/วงเงินสูงสุด ${maxLimit.toLocaleString("en-US")} บาท`
      );
      return;
    }

    if (
      selectedPolicy.id === "BEN-04" &&
      (!instituteName.trim() || !courseName.trim() || !semester.trim())
    ) {
      setFormError(
        "กรุณากรอกข้อมูลสถาบันการศึกษา หลักสูตร และภาคการศึกษาให้ครบถ้วน"
      );
      return;
    }

    if (
      selectedPolicy.id === "BEN-05" &&
      (!instituteName.trim() || !certificateName.trim())
    ) {
      setFormError(
        "กรุณากรอกชื่อสถาบัน/หน่วยงาน และชื่อใบรับรองให้ครบถ้วน"
      );
      return;
    }

    if (selectedPolicy.id === "BEN-01" && !floodAddressType.trim()) {
      setFormError("กรุณาระบุประเภทที่อยู่");
      return;
    }

    if (files.length === 0) {
      setFormError("กรุณาแนบไฟล์หลักฐานอย่างน้อย 1 ไฟล์");
      return;
    }

    setModalType("confirm_save");
  };

  const handleConfirmSaveClaim = () => {
    if (!selectedPolicy) return;

    const targetEmployee =
      isSupervisor && claimAs === "employee"
        ? employees.find((emp) => emp.empCode === selectedEmployeeCode)
        : employees.find((emp) => emp.empCode === currentUser.empCode);

    const claimTypeLabel =
      claimAs === "family"
        ? "ครอบครัว"
        : claimAs === "employee"
          ? "เบิกแทนพนักงาน"
          : "ตนเอง";

    const now = new Date();
    const requestDateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear() + 543}`;

    const newClaim: Benefits = {
      claimId: generateNextClaimId(now),
      empCode: targetEmployee?.empCode ?? currentUser.empCode,
      empName: targetEmployee?.name ?? currentUser.email,
      department: targetEmployee?.department ?? "ฝ่ายบริการลูกค้า",
      benefitCategory: selectedPolicy.name,
      benefitId: selectedPolicy.id,
      claimType: claimTypeLabel,
      requestDate: requestDateStr,
      amountRequested: numericAmount,
      amountLimit: maxLimit ?? numericAmount,
      status: "pending_document",
      statusNote: `พนักงานต้องนำส่งใบเสร็จตัวจริงให้ HR ภายในวันที่ ${CLAIM_MOCK_CONFIG.docDeadlineDay}`,
      details: {
        reason: reason.trim() || "-",
        documentDate: formatThaiDate(documentDate),
        ...(selectedFamilyMember
          ? { familyMemberName: selectedFamilyMember }
          : {}),
        ...(selectedSubLimitLabel
          ? { subLimitType: selectedSubLimitLabel }
          : {}),
        ...(selectedPolicy.id === "BEN-04"
          ? { instituteName, courseName, semester }
          : {}),
        ...(selectedPolicy.id === "BEN-05"
          ? { instituteName, certificateName }
          : {}),
        ...(selectedPolicy.id === "BEN-01"
          ? { floodImpactLevel: floodLevel, addressType: floodAddressType }
          : {}),
      },
      attachments: files.map((f) => f.name),
      approver: null,
      approvedAmount: 0,
      cutoffdate: CLAIM_MOCK_CONFIG.docDeadlineDateText,
      disbursement: null,
    };

    const updatedEmpClaims = addBenefitClaim(newClaim);
    syncEmployeeYearlyQuota(
      newClaim.empCode,
      CLAIM_MOCK_CONFIG.fiscalYear,
      policies,
      updatedEmpClaims
    );

    if (newClaim.empCode === currentUser.empCode) {
      setUserBenefits(updatedEmpClaims);
    } else {
      setEmployeeClaimsCache((prev) => ({
        ...prev,
        [newClaim.empCode]: updatedEmpClaims,
      }));
    }

    setQuotaVersion((v) => v + 1);
    clearDraftFromStorage();
    resetFormFields("");
    setModalType(null);
    setSubmittedClaim(newClaim);
  };

  const handleConfirmCancelClaim = () => {
    if (!submittedClaim || deleteConfirmText.trim() !== "ยืนยัน") return;

    const updatedEmpClaims = cancelBenefitClaim(
      submittedClaim.claimId,
      submittedClaim.empCode
    );
    syncEmployeeYearlyQuota(
      submittedClaim.empCode,
      CLAIM_MOCK_CONFIG.fiscalYear,
      policies,
      updatedEmpClaims
    );

    if (submittedClaim.empCode === currentUser.empCode) {
      setUserBenefits(updatedEmpClaims);
    } else {
      setEmployeeClaimsCache((prev) => ({
        ...prev,
        [submittedClaim.empCode]: updatedEmpClaims,
      }));
    }

    setQuotaVersion((v) => v + 1);
    setDeleteConfirmText("");
    setModalType(null);
    setSubmittedClaim(null);
    resetFormFields("");
  };

  const handleBackToDashboard = () => {
    if (!submittedClaim && selectedPolicyId) {
      setModalType("unsaved_back");
      return;
    }
    router.push("/dashboard");
  };

  const handleCancelFormClick = () => {
    if (selectedPolicyId) {
      setModalType("unsaved_reset");
      return;
    }
    resetFormFields("");
  };

  const closeModal = () => {
    setModalType(null);
    setDeleteConfirmText("");
  };

  const showClaimAsSection =
    isSupervisor ||
    selectedPolicy?.id === "BEN-03" ||
    selectedPolicy?.id === "BEN-06" ||
    selectedPolicy?.id === "BEN-07";

  const showSelfOption =
    selectedPolicy?.id !== "BEN-03" && selectedPolicy?.id !== "BEN-07";

  const showFamilyOption =
    selectedPolicy?.id === "BEN-03" ||
    selectedPolicy?.id === "BEN-06" ||
    selectedPolicy?.id === "BEN-07";

  const familyRelationOptions =
    selectedPolicy?.id === "BEN-06"
      ? BIRTH_FAMILY_RELATIONS
      : FAMILY_RELATIONS;

  const employeeDropdownPlaceholder =
    selectedPolicy?.id === "BEN-03" || selectedPolicy?.id === "BEN-06"
      ? "[ กรุณาเลือกครอบครัวพนักงาน ]"
      : "[ กรุณาเลือกพนักงาน ]";

  const dateLabel =
    (selectedPolicy && DATE_FIELD_LABELS[selectedPolicy.id]) ||
    "วันที่ตามใบเสร็จ *";

  const attachmentLabel =
    (selectedPolicy && ATTACHMENT_LABELS[selectedPolicy.id]) || "ใบเสร็จ";

  const renderAmountBlock = () => {
    if (!selectedPolicy) return null;

    if (isFixedAmount) {
      return (
        <div>
          <label className="mb-2 block text-base font-medium text-black">
            ยอดเงินที่ขอเบิก (บาท) *
          </label>
          <Input
            type="text"
            readOnly
            value="10,000.00 บาท (คงที่ตามเกณฑ์)"
            className="w-full border-gray-300 bg-gray-100 text-sm font-medium text-gray-600 focus:ring-0"
          />
          <p className="mt-1.5 text-xs text-black/55">
            วงเงิน 10,000 บาท/ครั้ง
          </p>
        </div>
      );
    }

    if (selectedPolicy.subLimits && selectedPolicy.subLimits.length > 0) {
      return (
        <div>
          <label className="mb-2 block text-base font-medium text-black">
            ยอดเงินที่ขอเบิก (บาท) *
          </label>
          <div className="space-y-3">
            {selectedPolicy.subLimits.map((sub) => {
              const isSelected = selectedSubLimitLabel === sub.label;
              const shortLabel = sub.label.split(" ")[0];
              const subMaxAllowed =
                selectedPolicy.amountUnit === "per_year" &&
                selectedQuota?.remainingAmount !== null &&
                selectedQuota?.remainingAmount !== undefined
                  ? Math.min(sub.maxAmount, selectedQuota.remainingAmount)
                  : sub.maxAmount;

              return (
                <div key={sub.label} className="space-y-1">
                  <div className="flex items-center gap-3">
                    <label className="flex min-w-[100px] cursor-pointer items-center gap-2 text-sm text-black">
                      <input
                        type="radio"
                        name="subLimitType"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedSubLimitLabel(sub.label);
                          setAmountInput("");
                        }}
                        className="size-4 accent-anyprimary-green-700"
                      />
                      <span>{shortLabel}</span>
                    </label>
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        disabled={!isSelected}
                        state={
                          isSelected && isAmountInvalid ? "error" : "default"
                        }
                        value={isSelected ? amountInput : ""}
                        onChange={(e) => setAmountInput(e.target.value)}
                        placeholder="0.00"
                        className={cn(
                          LIGHT_INPUT_CLASS,
                          "py-2 pr-12 pl-3",
                          isSelected && isAmountInvalid && ERROR_INPUT_CLASS
                        )}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                        บาท
                      </span>
                    </div>
                  </div>
                  <p className="pl-[112px] text-xs text-black/55">
                    วงเงินสูงสุดไม่เกิน {sub.maxAmount.toLocaleString("en-US")}{" "}
                    บาท
                    {selectedPolicy.amountUnit === "per_year" &&
                    selectedQuota?.remainingAmount !== null &&
                    selectedQuota?.remainingAmount !== undefined
                      ? ` (คงเหลือทั้งปี ${selectedQuota.remainingAmount.toLocaleString("en-US")} บาท • เบิกได้สูงสุด ${subMaxAllowed.toLocaleString("en-US")} บาท)`
                      : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (
      selectedPolicy.id === "BEN-01" &&
      Array.isArray(selectedPolicy.maxAmount)
    ) {
      return (
        <div>
          <label className="mb-2 block text-base font-medium text-black">
            ระดับผลกระทบ / ยอดเงินที่ขอเบิก (บาท) *
          </label>
          <div className="space-y-2">
            {selectedPolicy.maxAmount.map((amt, idx) => {
              const level = idx + 1;
              return (
                <label
                  key={amt}
                  className="flex cursor-pointer items-center gap-2.5 text-sm text-black"
                >
                  <input
                    type="radio"
                    name="floodLevel"
                    checked={floodLevel === level}
                    onChange={() => {
                      setFloodLevel(level);
                      setAmountInput(String(amt));
                    }}
                    className="size-4 accent-anyprimary-green-700"
                  />
                  <span>
                    ระดับ {level} — {amt.toLocaleString("en-US")} บาท
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div>
        <label className="mb-2 block text-base font-medium text-black">
          ยอดเงินที่ขอเบิก (บาท) *
        </label>
        <div className="relative">
          <Input
            type="number"
            min={0}
            step="0.01"
            state={isAmountInvalid ? "error" : "default"}
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="0.00"
            className={cn(
              LIGHT_INPUT_CLASS,
              "py-2.5 pr-12 pl-3.5",
              isAmountInvalid && ERROR_INPUT_CLASS
            )}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-gray-500">
            บาท
          </span>
        </div>
        <p className="mt-1.5 text-xs text-black/55">
          {selectedPolicy.id === "BEN-02"
            ? `ระบุยอดส่วนเกินจากประกันที่จ่ายจริงตามใบเสร็จ สูงสุดไม่เกิน 1,000 บาท/ครั้ง (คงเหลือ ${selectedQuota?.remainingLabel ?? "-"})`
            : typeof selectedPolicy.maxAmount === "number"
              ? `วงเงินสูงสุดไม่เกิน ${selectedPolicy.maxAmount.toLocaleString("en-US")} บาท (คงเหลือ ${selectedQuota?.remainingLabel ?? "-"})`
              : `ระบุยอดเงินตามใบเสร็จจริง (คงเหลือ ${selectedQuota?.remainingLabel ?? "1 ครั้ง/ปี"})`}
        </p>
      </div>
    );
  };

  const renderDateBlock = () => (
    <div>
      <label className="mb-2 block text-base font-medium text-black">
        {dateLabel}
      </label>
      <DialogTrigger isOpen={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <AriaButton
          className={cn(
            "flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-400 bg-white px-3.5 py-2.5 text-left text-sm transition outline-none",
            "hover:border-anyprimary-green-700 hover:bg-emerald-50/20",
            "focus:border-anyprimary-green-700 focus:ring-4 focus:ring-anyprimary-green-700/15",
            isDateInvalid && ERROR_INPUT_CLASS
          )}
        >
          <span className={documentDate ? "text-black" : "text-gray-400"}>
            {documentDate ? formatThaiDate(documentDate) : "dd / mm / yy"}
          </span>
          <CalendarIcon className="size-4 shrink-0 text-gray-500" />
        </AriaButton>

        <Popover
          placement="bottom start"
          offset={6}
          className="z-50 outline-none"
        >
          <Dialog className="outline-none">
            <I18nProvider locale="th-TH-u-ca-gregory">
              <Calendar
                aria-label={dateLabel}
                maxValue={maxSelectableDate}
                value={documentDate ? parseDate(documentDate) : undefined}
                onChange={(dateValue) => {
                  setDocumentDate(dateValue.toString());
                  setIsCalendarOpen(false);
                }}
                className="w-[330px] sm:w-[350px]"
              >
                <CalendarHeader className="justify-between gap-1.5">
                  <NavButton slot="previous" />
                  <div className="flex flex-1 items-center justify-center gap-2">
                    <CalendarMonthPicker />
                    <CalendarYearPicker />
                  </div>
                  <NavButton slot="next" />
                  <CalendarHeading className="sr-only" />
                </CalendarHeader>
                <CalendarGrid>
                  <CalendarGridHeader />
                  <CalendarGridBody>
                    {(date) => <CalendarCell date={date} />}
                  </CalendarGridBody>
                </CalendarGrid>
              </Calendar>
            </I18nProvider>
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-7 text-black md:px-12">
      {/* Top Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            เบิกสวัสดิการ
          </h1>
          <button
            type="button"
            onClick={handleBackToDashboard}
            className="mt-1 inline-flex items-center gap-1 text-sm text-black/50 transition hover:text-black"
          >
            <ChevronLeft className="size-4" />
            กลับสู่หน้าภาพรวม
          </button>
        </div>

        <div className="flex items-center gap-3 text-sm text-black/80">
          <Clock className="font-medium" />
          <button
            type="button"
            aria-label="การแจ้งเตือน"
            className="rounded-full p-1.5 text-black/70 transition hover:bg-black/5 hover:text-black"
          >
            <Bell className="size-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {submittedClaim ? (
        <ClaimTrackingView
          claim={submittedClaim}
          payrollRoundText={CLAIM_MOCK_CONFIG.payrollRoundText}
          docDeadlineDay={CLAIM_MOCK_CONFIG.docDeadlineDay}
          docDeadlineDateText={CLAIM_MOCK_CONFIG.docDeadlineDateText}
          requiredDocs={
            REQUIRED_DOCS[submittedClaim.benefitId] ?? [
              "ใบเสร็จรับเงินฉบับจริง",
              "สำเนาบัตรพนักงาน",
            ]
          }
          onGoHome={() => router.push("/dashboard")}
          onRequestCancel={() => {
            setDeleteConfirmText("");
            setModalType("confirm_delete");
          }}
        />
      ) : (
        <form
          onSubmit={handleFormSubmit}
          noValidate
          className="mt-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
        >
          <h2 className="mb-6 text-2xl font-bold text-black">
            แบบฟอร์มยื่นเบิกสวัสดิการ
          </h2>

          {/* Main Form Grid */}
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            {/* Row 1 Col 1: Benefit Type (TailGrids Combobox) */}
            <div>
              <label
                id="benefit-combobox-label"
                className="mb-2 block text-base font-medium text-black"
              >
                เลือกประเภทสวัสดิการ *
              </label>

              <Combobox
                aria-labelledby="benefit-combobox-label"
                value={selectedPolicyId || null}
                inputValue={benefitSearchText}
                onInputChange={setBenefitSearchText}
                onChange={(key) =>
                  resetFormFields((key as BenefitPolicyId) || "")
                }
                onOpenChange={(isOpen) => {
                  if (!isOpen) {
                    setBenefitSearchText(selectedPolicy?.name ?? "");
                  }
                }}
                defaultFilter={(textValue, filterValue) => {
                  if (!filterValue || filterValue === selectedPolicy?.name) {
                    return true;
                  }
                  return textValue
                    .toLowerCase()
                    .includes(filterValue.toLowerCase());
                }}
                className="gap-0"
              >
                <ComboboxInputWrapper
                  className={cn(
                    "min-h-11 cursor-pointer rounded-lg border border-gray-400 bg-white transition",
                    "hover:border-anyprimary-green-700 hover:bg-emerald-50/20",
                    "focus-within:border-anyprimary-green-700 focus-within:ring-4 focus-within:ring-anyprimary-green-700/15",
                    isPolicyInvalid && ERROR_INPUT_CLASS
                  )}
                >
                  <ComboboxInput
                    placeholder="[ กรุณาเลือก ]"
                    className="min-h-11 cursor-pointer pr-10 pl-3.5 text-sm font-normal text-black placeholder:text-gray-400"
                  />
                  <ComboboxTrigger className="z-10 cursor-pointer text-gray-500 hover:text-black data-focused:text-black" />
                </ComboboxInputWrapper>

                <ComboboxContent
                  offset={6}
                  className="z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
                >
                  {/* Dark Green Header Bar matching dropdown.png */}
                  <div className="flex items-center justify-between bg-[#2c463b] px-4 py-2.5 text-sm font-medium text-white">
                    <span>สิทธิ์ที่สามารถเบิกได้</span>
                    <span>ยอดคงเหลือ(ต่อปี)</span>
                  </div>

                  <ComboboxList className="max-h-80 overflow-y-auto p-1.5">
                    <ComboboxSection>
                      {availableQuotas.map((q) => (
                        <ComboboxItem
                          key={q.policy.id}
                          id={q.policy.id}
                          textValue={q.policy.name}
                          className="rounded-md py-2 pr-3 pl-8 text-sm font-normal text-gray-900 hover:bg-emerald-50/70 focus:bg-emerald-50/70 focus:text-black"
                        >
                          <div className="flex w-full items-center justify-between gap-4">
                            <span className="truncate">{q.policy.name}</span>
                            <span className="shrink-0 font-medium text-gray-800">
                              {q.remainingLabel}
                            </span>
                          </div>
                        </ComboboxItem>
                      ))}
                    </ComboboxSection>

                    {exhaustedQuotas.length > 0 && (
                      <ComboboxSection>
                        <ComboboxHeader className="px-3 py-2">
                          <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                            <div className="h-px flex-1 border-t border-dashed border-gray-300" />
                            <span>สิทธิ์เต็มแล้ว</span>
                            <div className="h-px flex-1 border-t border-dashed border-gray-300" />
                          </div>
                        </ComboboxHeader>
                        {exhaustedQuotas.map((q) => (
                          <ComboboxItem
                            key={q.policy.id}
                            id={q.policy.id}
                            isDisabled
                            textValue={q.policy.name}
                            className="rounded-md py-2 pr-3 pl-8 text-sm font-normal text-gray-400 data-disabled:text-gray-400"
                          >
                            <div className="flex w-full items-center justify-between gap-4">
                              <span className="truncate">{q.policy.name}</span>
                              <span className="shrink-0">หมดสิทธิ์</span>
                            </div>
                          </ComboboxItem>
                        ))}
                      </ComboboxSection>
                    )}
                  </ComboboxList>

                  <ComboboxEmpty className="py-5 text-sm text-gray-500">
                    ไม่พบประเภทสวัสดิการที่ค้นหา
                  </ComboboxEmpty>
                </ComboboxContent>
              </Combobox>

              <p className="mt-1.5 text-xs text-black/55">
                สวัสดิการที่ใช้สิทธิ์ครบแล้วจะไม่สามารถกดเลือกได้
              </p>
            </div>

            {/* Row 1 Col 2: Claim As */}
            {selectedPolicy && showClaimAsSection ? (
              <div>
                <label className="mb-2 block text-base font-medium text-black">
                  เบิกในฐานะ *
                </label>
                <div className="space-y-2.5">
                  {showSelfOption && (
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-black">
                      <input
                        type="radio"
                        name="claimAs"
                        checked={claimAs === "self"}
                        onChange={() => setClaimAs("self")}
                        className="size-4 accent-anyprimary-green-700"
                      />
                      <span>ตนเอง</span>
                    </label>
                  )}

                  {showFamilyOption && (
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex min-w-[96px] cursor-pointer items-center gap-2.5 text-sm text-black">
                        <input
                          type="radio"
                          name="claimAs"
                          checked={claimAs === "family"}
                          onChange={() => setClaimAs("family")}
                          className="size-4 accent-anyprimary-green-700"
                        />
                        <span>ครอบครัว</span>
                      </label>
                      <select
                        disabled={claimAs !== "family"}
                        value={selectedFamilyMember}
                        onChange={(e) =>
                          setSelectedFamilyMember(e.target.value)
                        }
                        className={cn(
                          "min-w-[220px] flex-1 cursor-pointer rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-black transition outline-none hover:border-anyprimary-green-700 focus:border-anyprimary-green-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400",
                          isFamilyInvalid && ERROR_INPUT_CLASS
                        )}
                      >
                        <option value="">[ กรุณาเลือกบุคคลในครอบครัว ]</option>
                        {familyRelationOptions.map((rel) => (
                          <option key={rel} value={rel}>
                            {rel}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {isSupervisor && (
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex min-w-[96px] cursor-pointer items-center gap-2.5 text-sm text-black">
                        <input
                          type="radio"
                          name="claimAs"
                          checked={claimAs === "employee"}
                          onChange={() => setClaimAs("employee")}
                          className="size-4 accent-anyprimary-green-700"
                        />
                        <span>พนักงาน</span>
                      </label>
                      <select
                        disabled={claimAs !== "employee"}
                        value={selectedEmployeeCode}
                        onChange={(e) =>
                          setSelectedEmployeeCode(e.target.value)
                        }
                        className={cn(
                          "min-w-[220px] flex-1 cursor-pointer rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-black transition outline-none hover:border-anyprimary-green-700 focus:border-anyprimary-green-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400",
                          isEmployeeInvalid && ERROR_INPUT_CLASS
                        )}
                      >
                        <option value="">{employeeDropdownPlaceholder}</option>
                        {employees.map((emp) => (
                          <option key={emp.empCode} value={emp.empCode}>
                            {emp.empCode} - {emp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedPolicy ? (
              selectedPolicy.id === "BEN-04" ? (
                renderDateBlock()
              ) : (
                renderAmountBlock()
              )
            ) : (
              <div />
            )}

            {/* Remaining dynamic fields when a benefit is selected */}
            {selectedPolicy && (
              <>
                {showClaimAsSection ? (
                  selectedPolicy.id === "BEN-03" ? (
                    <>
                      {renderDateBlock()}
                      {renderAmountBlock()}
                    </>
                  ) : (
                    <>
                      {renderAmountBlock()}
                      {renderDateBlock()}
                    </>
                  )
                ) : selectedPolicy.id === "BEN-04" ? (
                  renderAmountBlock()
                ) : (
                  renderDateBlock()
                )}

                {/* Education fields (BEN-04) */}
                {selectedPolicy.id === "BEN-04" && (
                  <div
                    className={
                      showClaimAsSection
                        ? "grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-3"
                        : "space-y-4"
                    }
                  >
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-black">
                        ชื่อสถาบันการศึกษา *
                      </label>
                      <Input
                        type="text"
                        state={isInstituteInvalid ? "error" : "default"}
                        value={instituteName}
                        onChange={(e) => setInstituteName(e.target.value)}
                        placeholder="เช่น ศรีปทุม"
                        className={cn(
                          LIGHT_INPUT_CLASS,
                          "px-3.5 py-2",
                          isInstituteInvalid && ERROR_INPUT_CLASS
                        )}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-black">
                        หลักสูตร *
                      </label>
                      <Input
                        type="text"
                        state={isCourseInvalid ? "error" : "default"}
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder="เช่น วิทยาการคอมพิวเตอร์..."
                        className={cn(
                          LIGHT_INPUT_CLASS,
                          "px-3.5 py-2",
                          isCourseInvalid && ERROR_INPUT_CLASS
                        )}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-black">
                        ภาคการศึกษา / ปีการศึกษา *
                      </label>
                      <Input
                        type="text"
                        state={isSemesterInvalid ? "error" : "default"}
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        placeholder="เช่น ภาคเรียนที่ 1/2569..."
                        className={cn(
                          LIGHT_INPUT_CLASS,
                          "px-3.5 py-2",
                          isSemesterInvalid && ERROR_INPUT_CLASS
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Certification fields (BEN-05) */}
                {selectedPolicy.id === "BEN-05" && (
                  <>
                    <div>
                      <label className="mb-2 block text-base font-medium text-black">
                        สถาบัน / หน่วยงานผู้ออกใบรับรอง *
                      </label>
                      <Input
                        type="text"
                        state={isInstituteInvalid ? "error" : "default"}
                        value={instituteName}
                        onChange={(e) => setInstituteName(e.target.value)}
                        placeholder="เช่น Amazon Web Services"
                        className={cn(
                          LIGHT_INPUT_CLASS,
                          "px-3.5 py-2",
                          isInstituteInvalid && ERROR_INPUT_CLASS
                        )}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-base font-medium text-black">
                        ชื่อใบรับรอง / License ที่สอบ *
                      </label>
                      <Input
                        type="text"
                        state={isCertificateInvalid ? "error" : "default"}
                        value={certificateName}
                        onChange={(e) => setCertificateName(e.target.value)}
                        placeholder="เช่น AWS Certified Cloud Practitioner..."
                        className={cn(
                          LIGHT_INPUT_CLASS,
                          "px-3.5 py-2",
                          isCertificateInvalid && ERROR_INPUT_CLASS
                        )}
                      />
                    </div>
                  </>
                )}

                {/* Flood address field (BEN-01) */}
                {selectedPolicy.id === "BEN-01" && (
                  <div>
                    <label className="mb-2 block text-base font-medium text-black">
                      ประเภทที่อยู่ *
                    </label>
                    <Input
                      type="text"
                      state={isFloodAddressInvalid ? "error" : "default"}
                      value={floodAddressType}
                      onChange={(e) => setFloodAddressType(e.target.value)}
                      className={cn(
                        LIGHT_INPUT_CLASS,
                        "px-3.5 py-2",
                        isFloodAddressInvalid && ERROR_INPUT_CLASS
                      )}
                    />
                  </div>
                )}

                {/* Reason textarea (TailGrids TextArea) */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-base font-medium text-black">
                    รายละเอียด / เหตุผลการเบิก
                  </label>
                  <TextArea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="เช่น ไข้หวัด (OPD) รพ. ศิริราช..."
                    className="border-gray-400 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-gray-400 hover:border-anyprimary-green-700 focus:border-anyprimary-green-700 focus:ring-anyprimary-green-700/15"
                  />
                </div>

                {/* File upload dropzone */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-base font-medium text-black">
                    แนบไฟล์หลักฐาน ({attachmentLabel}) *
                  </label>
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition",
                      isFilesInvalid
                        ? "border-red-500 bg-red-50/30 hover:border-red-600"
                        : isDragging
                          ? "border-anyprimary-green-700 bg-emerald-50/40"
                          : "border-gray-300 bg-gray-50/50 hover:border-anyprimary-green-700 hover:bg-emerald-50/20"
                    )}
                  >
                    <input
                      type="file"
                      multiple
                      accept={ACCEPTED_FILE_ATTR}
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <CloudUpload className="mb-2 size-10 text-black/75" />
                    <p className="text-sm font-medium text-black/80">
                      คลิกเพื่ออัปโหลด หรือลากไฟล์มาวางที่นี่
                    </p>
                    <p className="mt-1 text-xs text-black/50">
                      รองรับ {CLAIM_MOCK_CONFIG.allowedFileLabels.join(", ")}{" "}
                      ขนาดไม่เกิน {CLAIM_MOCK_CONFIG.maxFileSizeMB}MB
                      <br />
                      สามารถแนบได้มากกว่า 1 ไฟล์
                    </p>
                  </label>

                  {files.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {files.map((file, idx) => (
                        <div
                          key={`${file.name}-${idx}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700"
                        >
                          <FileText className="size-3.5 text-anyprimary-green-700" />
                          <span>{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-gray-400 transition hover:text-rose-600"
                            aria-label={`ลบไฟล์ ${file.name}`}
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Yellow Warning Banner */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <AlertTriangle className="size-4 shrink-0 text-amber-700" />
                    <span>
                      กรุณานำใบเสร็จและเอกสารตัวจริงส่งฝ่าย HR ภายในวันที่{" "}
                      {CLAIM_MOCK_CONFIG.docDeadlineDay}{" "}
                      เพื่อให้ทันรอบการจ่ายเงินเดือนนี้
                    </span>
                  </div>
                </div>

                {/* Form Error */}
                {formError && (
                  <div className="md:col-span-2">
                    <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
                      {formError}
                    </p>
                  </div>
                )}

                {/* Form Footer Buttons */}
                <div className="flex justify-end gap-3 pt-2 md:col-span-2">
                  <button
                    type="button"
                    onClick={handleCancelFormClick}
                    className="rounded-lg border border-gray-300 bg-white px-7 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-anyprimary-green-700 px-8 py-2.5 text-sm font-medium text-white transition hover:bg-[#0c4337]"
                  >
                    ยืนยัน
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      )}

      {/* TailGrids Backdrop + Modal Popups */}
      <ClaimModals
        modalType={modalType}
        deleteConfirmText={deleteConfirmText}
        onChangeDeleteConfirmText={setDeleteConfirmText}
        onClose={closeModal}
        onConfirmLeaveToDashboard={() => {
          closeModal();
          router.push("/dashboard");
        }}
        onConfirmResetForm={() => {
          closeModal();
          clearDraftFromStorage();
          resetFormFields("");
        }}
        onConfirmSaveClaim={handleConfirmSaveClaim}
        onConfirmCancelClaim={handleConfirmCancelClaim}
      />
    </div>
  );
}

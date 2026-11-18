const benefitsData = [
  {
    claimId: "CLM-2611-0001",
    empCode: "CS-001",
    empName: "นาย ปฏิพัทธ์ สร้างตั้น",
    department: "ฝ่ายบริการลูกค้า",
    benefitCategory: "ทุนสอบ Certifications",
    benefitId: "BEN-05",   
    claimType: "ตนเอง",
    requestDate: "02/11/2569",
    amountRequested: 4500.0,
    amountLimit: 5000,
    status: "pending_hr",
    statusNote: "",
    details: {
      certificateName: "AWS Certified Cloud Practitioner",
      instituteName: "Amazon Web Services",
      documentDate: "30/10/2569",
      reason: "สอบ Certificate เพื่อนำมาใช้ในสายงาน",
    },
    attachments: ["cert_aws_result_cs001.pdf", "receipt_aws_cs001.jpg"],
    approver: null,
    approvedAmount: 0,
  },
  {
    claimId: "CLM-2611-0002",
    empCode: "CS-002",
    empName: "นางสาว จอร์จ ซาร่า",
    department: "ฝ่ายบริการลูกค้า",
    benefitCategory: "สวัสดิการน้ำท่วม",
    benefitId: "BEN-01",
    claimType: "ตนเอง",
    requestDate: "03/11/2569",
    amountRequested: 5000.0,
    amountLimit: 5000,
    status: "approved",
    statusNote: "อนุมัติแล้ว รอโอนเงินรอบบัญชีถัดไป",
    details: {
      floodImpactLevel: 2,
      impactStartDate: "25/10/2569",
      impactEndDate: "01/11/2569",
      addressType: "ตรงกับทะเบียนประวัติพนักงาน",
      reason: "น้ำท่วมเข้าภายในตัวบ้านชั้น 1 ทำให้เฟอร์นิเจอร์เสียหาย",
    },
    attachments: ["flood_photo1_cs002.jpg", "flood_photo2_cs002.jpg"],
    approver: "อริยา ติรณะประกิจ",
    approvedAmount: 5000.0,
  },
  {
    claimId: "CLM-2611-0003",
    empCode: "CS-003",
    empName: "นาย สมชาย ใจดี",
    department: "ฝ่ายบริการลูกค้า",
    benefitCategory: "ค่ารักษาพยาบาล (พนักงาน)",
    benefitId:"BEN-02",    
    claimType: "ตนเอง",
    requestDate: "05/11/2569",
    amountRequested: 1000.0,
    amountLimit: 5000,
    status: "pending_document",
    statusNote: "พนักงานต้องนำส่งใบเสร็จตัวจริงให้ HR ภายในวันที่ 20",
    details: {
      medicalType: "OPD",
      documentDate: "04/11/2569",
      reason: "ไข้หวัด (OPD) รพ. ศิริราช",
    },
    attachments: ["medical_cert_cs003.pdf", "receipt_hospital_cs003.jpg"],
    approver: null,
    approvedAmount: 0,
  },
  {
    claimId: "CLM-2611-0004",
    empCode: "CS-001",
    empName: "นาย ปฏิพัทธ์ สร้างตั้น",
    department: "ฝ่ายบริการลูกค้า",
    benefitCategory: "ค่ารักษาพยาบาล (ครอบครัว)",
    benefitId:"BEN-03",
    claimType: "ครอบครัว",
    requestDate: "10/11/2569",
    amountRequested: 2000.0,
    amountLimit: 5000,
    status: "rejected",
    statusNote: "ไม่อนุมัติ เนื่องจากใช้สิทธิ์วงเงินของปีนี้ครบแล้ว",
    details: {
      familyMemberName: "นาย สมศักดิ์ สร้างตั้น (บิดา)",
      medicalType: "OPD",
      documentDate: "09/11/2569",
      reason: "พาบิดาไปตรวจสุขภาพประจำปี",
    },
    attachments: ["receipt_family_opd_cs001.jpg"],
    approver: "HR Manager",
    approvedAmount: 0,
  },
];

const BENEFIT_POLICIES: BenefitPolicy[] = [
  {
    id: "BEN-01",
    name: "สวัสดิการน้ำท่วม",
    maxAmount: [3000, 5000, 10000],
    amountUnit: "per_time",
    maxCount: 1,
    countUnit: "per_year",
  },
  {
    id: "BEN-02",
    name: "ค่ารักษาพยาบาล (พนักงาน)",
    maxAmount: 1000,
    amountUnit: "per_time",
    maxCount: 30,
    countUnit: "per_year",
  },
  {
    id: "BEN-03",
    name: "ค่ารักษาพยาบาล (ครอบครัว)",
    maxAmount: 30000,
    amountUnit: "per_year",
    maxCount: null,
    countUnit: "unlimited",
    subLimits: [
      { label: "IPD (ผู้ป่วยใน)", maxAmount: 20000 },
      { label: "OPD (ผู้ป่วยนอก)", maxAmount: 2000 },
    ],
  },
  {
    id: "BEN-04",
    name: "ทุนการศึกษาระดับปริญญา",
    maxAmount: null,
    amountUnit: "lifetime",
    maxCount: 1,
    countUnit: "lifetime",
    subLimits: [
      { label: "ปริญญาโท", maxAmount: 300000 },
      { label: "ปริญญาเอก", maxAmount: 700000 },
    ],
  },
  {
    id: "BEN-05",
    name: "ทุนสอบ Certifications",
    maxAmount: 50000,
    amountUnit: "per_year",
    maxCount: null,
    countUnit: "unlimited",
  },
  {
    id: "BEN-06",
    name: "เงินช่วยเหลือกรณีคลอดบุตร",
    maxAmount: 10000,
    amountUnit: "per_time",
    maxCount: null,
    countUnit: "unlimited",
  },
  {
    id: "BEN-07",
    name: "เงินฌาปนกิจ",
    maxAmount: 10000,
    amountUnit: "per_time",
    maxCount: null,
    countUnit: "unlimited",
  },
  {
    id: "BEN-08",
    name: "ค่ากิจกรรมนันทนาการ",
    maxAmount: 3000,
    amountUnit: "per_year",
    maxCount: null,
    countUnit: "unlimited",
  },
  {
    id: "BEN-09",
    name: "ค่าตรวจสุขภาพ",
    maxAmount: null,
    amountUnit: "per_year",
    maxCount: 1,
    countUnit: "per_year",
  },
  {
    id: "BEN-10",
    name: "ค่าทันตกรรม",
    maxAmount: 3000,
    amountUnit: "per_year",
    maxCount: null,
    countUnit: "unlimited",
  },
  {
    id: "BEN-11",
    name: "สวัสดิการ AI Subscription",
    maxAmount: 5000,
    amountUnit: "per_year",
    maxCount: null,
    countUnit: "unlimited",
  },
];

export interface BenefitPolicy {
  id: string;
  name: string;                                       // ชื่อสวัสดิการ (ตรงกับ benefitCategory)
  maxAmount: number | number[] | null;                // วงเงินสูงสุด (ใส่เป็นตัวเลข หรือ Array กรณีมีหลายระดับ)
  amountUnit: "per_time" | "per_year" | "lifetime";   // เงื่อนไขวงเงิน (ต่อครั้ง / ต่อปี / ตลอดอายุงาน)
  maxCount: number | null;                            // จำนวนครั้งสูงสุด (null = ไม่จำกัดครั้ง)
  countUnit: "per_year" | "lifetime" | "unlimited";   // เงื่อนไขจำนวนครั้ง
  subLimits?: {                                       // เผื่อกรณีมีเงื่อนไขย่อย เช่น ป.โท-เอก หรือ IPD OPD
    label: string;
    maxAmount: number;
  }[];
}

// บังคับค่าสถานะ 4 แบบ
export type ClaimStatus =
  | "pending_document"
  | "pending_hr"
  | "approved"
  | "rejected";

// หมวดหมู่สวัสดิการ 11 ประเภท
export const BENEFIT_CATEGORIES: string[] = [
  "สวัสดิการน้ำท่วม",
  "ค่ารักษาพยาบาล (พนักงาน)",
  "ค่าทันตกรรม",
  "ค่ารักษาพยาบาล (ครอบครัว)",
  "เงินช่วยเหลือกรณีคลอดบุตร",
  "เงินฌาปนกิจ",
  "ทุนการศึกษาระดับปริญญา",
  "ทุนสอบ Certifications",
  "ค่ากิจกรรมนันทนาการ",
  "ค่าตรวจสุขภาพ",
  "สวัสดิการ AI Subscription",
];
// แยกส่วนใน Array ออกมาไม่ให้เป็นก้อน มันจะได้แบบ (BENEFIT_CATEGORIES)[1] คือ สวัสดิการน้ำท่วม ประมาณนี้
export type BenefitCategory = (typeof BENEFIT_CATEGORIES)[number];
// คัดมาเฉพาะเลข id จาก BENEFIT_POLICIES ที่มี
export type BenefitPolicyId = (typeof BENEFIT_POLICIES)[number]["id"];

export interface Benefits {
  claimId: string;
  empCode: string;
  empName: string;
  department: string;
  benefitCategory: BenefitCategory;
  benefitId: BenefitPolicyId,
  claimType: string;
  requestDate: string;
  amountRequested: number;
  amountLimit: number;
  status: ClaimStatus;
  statusNote: string;
  details: {
    reason: string;
    [key: string]: any;
  };
  attachments: string[];
  approver: string | null;
  approvedAmount: number;
}

// ข้อกำหนดด้านลิมิตของสวัสดิการทุกประเภทให้ส่งออก
let benefitpolicy: BenefitPolicy[] = [];
export const fetchBenefitsPolicy = (): Promise<BenefitPolicy[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => {
        if (Math.random() <= 0.9) {
          if (benefitpolicy.length === 0) {
            benefitpolicy = BENEFIT_POLICIES.map((e) => ({
              ...e,
            })) as BenefitPolicy[];
          }
          resolve(benefitpolicy);
        } else {
          reject("connection refused");
        }
      },
      1000 + Math.random() * 2000,
    );
  });
};

// เอาข้อมูลสวัสดิการออกมาให้ HR ไปดูในตารางหรือเอาไปดูในตรงอื่นก็ได้
let benefitdata: Benefits[] = [];
export const fetchBenefits = (): Promise<Benefits[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => {
        if (Math.random() <= 0.9) {
          if (benefitdata.length === 0) {
            benefitdata = benefitsData.map((e) => ({
              ...e,
            })) as Benefits[];
          }
          resolve(benefitdata);
        } else {
          reject("connection refused");
        }
      },
      1000 + Math.random() * 2000,
    );
  });
};

// ฟังก์ชั่นไว้หาข้อมูลตามบุคคลในพนักงาน
export const benefitsSort = (empCode: string): Promise<Benefits[] | any> => {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => {
        if (Math.random() <= 0.8) {
          const benefind = benefitsData.filter((e) => e.empCode === empCode);

          // user not found
          if (benefind.length === 0) {
            reject("ไม่พบข้อมูลการเบิกสวัสดิการ");
            return;
          }
          // store & return
          resolve(benefind);
        } else {
          reject("connection refused");
        }
      },
      1000 + Math.random() * 2000,
    );
  });
};

const benefit = [
  {
    claimId: "CLM-2611-0001",
    empCode: "CS-001",
    empName: "นาย ปฏิพัทธ์ สร้างตั้น",
    department: "ฝ่ายบริการลูกค้า",
    benefitCategory: "ทุนสอบ Certifications",
    claimType: "ตนเอง",
    requestDate: "02/11/2569",
    amountRequested: 4500.0,
    amountLimit: 5000,
    status: "pending_hr",
    statusNote: "รอ HR ตรวจสอบเอกสารตัวจริง",
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
export type BenefitCategory = (typeof BENEFIT_CATEGORIES)[number]

export type Approver = {
  approver: string | null
}

export interface Benefits {
    claimId: string ,
    empCode: string ,
    empName: string ,
    department: string ,
    benefitCategory: BenefitCategory ,
    claimType: string ,
    requestDate: string ,
    amountRequested: number ,
    amountLimit: number ,
    status: ClaimStatus ,
    statusNote: string ,
    details: {
    reason: string;
    [key: string]: any;
    };
    attachments: string[],
    approver: string | null ,
    approvedAmount: number ,
}

import Section from "@/components/Section";
import ApprovalList from "@/components/ApprovalList";
import FundSections from "@/components/FundCards";

export default function ApprovalsPage() {
  return (
    <div className="w-full space-y-6 font-line-seed-sans-th">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          พิจารณาและอนุมัติ
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          รายการคำขอเบิกสวัสดิการของพนักงานและคำของบประมาณระดับองค์กรที่รอการพิจารณา
        </p>
      </div>

      <FundSections />

      <Section
        title="รายการคำขอ"
        aside="ผู้พิจารณา : ผู้บริหารและฝ่ายไอทีที่ลงชื่อเข้าใช้"
      >
        <ApprovalList />
      </Section>
    </div>
  );
}

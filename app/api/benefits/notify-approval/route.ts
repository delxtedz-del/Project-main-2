import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      claimId?: string;
      empName?: string;
      benefitCategory?: string;
      amount?: number;
      approver?: string;
      recipientEmail?: string;
    };

    const claimId = body.claimId || "QAM030690001";
    const empName = body.empName || "Patipat Srangtan";
    const benefitCategory = body.benefitCategory || "สวัสดิการครอบครัว";
    const amount = Number(body.amount) || 3000;
    const approver = body.approver || "นาย ปฏิพัทธ์ สร้างตั้น (HR Admin)";

    // กำหนดอีเมลผู้รับ: ถ้าส่งมา หรือถ้าเป็นอีเมลเดโม ให้ส่งไปยัง Gmail ที่ผู้ใช้ระบุ (poiopow123l@gmail.com / delxtedz@gmail.com)
    const fallbackEmail = "poiopow123l@gmail.com";
    let targetEmail = body.recipientEmail?.trim();

    if (
      !targetEmail ||
      targetEmail.endsWith("@company.com") ||
      targetEmail.endsWith("@thaibmamail.com") ||
      targetEmail.endsWith("@example.com")
    ) {
      targetEmail = fallbackEmail;
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

    if (!gmailUser || !gmailPass) {
      return NextResponse.json({
        success: false,
        message: "ยังไม่ได้ตั้งค่า GMAIL_USER หรือ GMAIL_APP_PASSWORD ในระบบ",
      });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const currentDateThai = new Date().toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background-color: #105647; padding: 24px 32px; text-align: left;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">EDBMS — ระบบจัดการพนักงาน</h1>
          <p style="color: #d1fae5; margin: 6px 0 0; font-size: 13px;">แจ้งเตือนผลการอนุมัติสวัสดิการ</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; padding: 6px 18px; color: #047857; font-weight: 600; font-size: 14px;">
              ✓ อนุมัติสวัสดิการเรียบร้อยแล้ว
            </div>
          </div>

          <p style="font-size: 15px; color: #1f2937; margin: 0 0 16px; line-height: 1.6;">
            เรียนคุณ <strong>${empName}</strong>,
          </p>
          <p style="font-size: 14px; color: #4b5563; margin: 0 0 24px; line-height: 1.6;">
            คำขอเบิกสวัสดิการของคุณได้รับการตรวจสอบและ<strong>อนุมัติโดยฝ่ายทรัพยากรบุคคล (HR)</strong> เรียบร้อยแล้ว โดยมีรายละเอียดดังนี้:
          </p>

          <!-- Detail Table -->
          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 40%;">รหัสคำขอ:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600; font-family: monospace;">${claimId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">ประเภทสวัสดิการ:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 500;">${benefitCategory}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">จำนวนเงินที่อนุมัติ:</td>
                <td style="padding: 8px 0; color: #047857; font-weight: 700; font-size: 16px;">${amount.toLocaleString("th-TH")} บาท</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">วันที่อนุมัติ:</td>
                <td style="padding: 8px 0; color: #111827;">${currentDateThai}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">ผู้อนุมัติ:</td>
                <td style="padding: 8px 0; color: #111827;">${approver}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f0fdf4; border-left: 4px solid #105647; padding: 14px 16px; border-radius: 4px; margin-bottom: 24px;">
            <p style="font-size: 13px; color: #065f46; margin: 0; line-height: 1.5;">
              <strong>หมายเหตุ:</strong> ยอดเงินสวัสดิการดังกล่าวจะถูกดำเนินการโอนเข้าบัญชีของท่านตามรอบการจ่ายเงินถัดไป
            </p>
          </div>

          <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.5;">
            ขอแสดงความนับถือ,<br>
            <strong>ฝ่ายทรัพยากรบุคคล (HR Department)</strong><br>
            ระบบ EDBMS
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 16px 32px; text-align: center; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af;">
          อีเมลนี้ถูกส่งโดยอัตโนมัติจากระบบ EDBMS • กรุณาอย่าตอบกลับอีเมลนี้
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"EDBMS HR System" <${gmailUser}>`,
      to: targetEmail,
      subject: `[EDBMS] แจ้งผลการอนุมัติสวัสดิการ — รหัสคำขอ ${claimId} (${amount.toLocaleString("th-TH")} บาท)`,
      text: `เรียนคุณ ${empName}, คำขอเบิกสวัสดิการรหัส ${claimId} (${benefitCategory}) จำนวนเงิน ${amount.toLocaleString("th-TH")} บาท ได้รับการอนุมัติเรียบร้อยแล้ว โดย ${approver}`,
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      message: `ส่งอีเมลแจ้งเตือนการอนุมัติไปยัง ${targetEmail} เรียบร้อยแล้ว`,
      recipient: targetEmail,
    });
  } catch (err: unknown) {
    console.error("[BENEFIT NOTIFY ERROR]", err);
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการส่งอีเมล";
    return NextResponse.json(
      {
        success: false,
        message: msg,
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { checkEmailExists } from "@/data/Login";

type OtpEntry = {
  code: string;
  expiresAt: number;
  attempts: number;
};

const g = globalThis as typeof globalThis & {
  __otpStore?: Map<string, OtpEntry>;
};
if (!g.__otpStore) {
  g.__otpStore = new Map<string, OtpEntry>();
}
const otpStore = g.__otpStore;

export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as {
      email?: unknown;
      turnstileToken?: unknown;
    };
    email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const turnstileToken =
      typeof body?.turnstileToken === "string" ? body.turnstileToken : "";

    if (!email) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุอีเมล" },
        { status: 400 }
      );
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (secretKey && turnstileToken) {
      const formData = new URLSearchParams();
      formData.append("secret", secretKey);
      formData.append("response", turnstileToken);

      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: formData,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      const outcome = (await verifyRes.json()) as { success?: boolean };
      if (!outcome.success) {
        return NextResponse.json(
          { success: false, message: "ยืนยัน Cloudflare Turnstile ไม่สำเร็จ" },
          { status: 400 }
        );
      }
    }

    if (!checkEmailExists(email)) {
      return NextResponse.json(
        { success: false, message: "ไม่พบอีเมลนี้ในระบบ" },
        { status: 400 }
      );
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

    const otpCode = crypto.randomInt(100000, 999999).toString();
    otpStore.set(email, {
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    if (!gmailUser || !gmailPass) {
      return NextResponse.json({
        success: true,
        devOtp: otpCode,
        message: "ยังไม่ได้ตั้งค่าอีเมล จึงแสดงรหัส OTP บนหน้านี้",
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

    await transporter.sendMail({
      from: `"OTP Verification" <${gmailUser}>`,
      to: email,
      subject: `รหัส OTP ของคุณคือ ${otpCode}`,
      text: `รหัส OTP 6 หลักสำหรับยืนยันตัวตนคือ ${otpCode} (มีอายุ 5 นาที)`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px; max-width: 400px;">
          <h3 style="margin: 0 0 8px; color: #144738;">รหัส OTP ยืนยันตัวตน</h3>
          <p style="margin: 0 0 14px; color: #52525b; font-size: 14px;">กรอกรหัสนี้เพื่อดำเนินการต่อ (หมดอายุใน 5 นาที):</p>
          <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; padding: 12px; background: #f4f4f5; border-radius: 8px; text-align: center; color: #09090b;">
            ${otpCode}
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `ส่งรหัส OTP ไปยัง ${email} แล้ว`,
    });
  } catch (err) {
    console.error("[GMAIL SEND ERROR]", err);
    const fallback = otpStore.get(email);
    if (fallback) {
      return NextResponse.json({
        success: true,
        devOtp: fallback.code,
        message: "ส่งอีเมลไม่สำเร็จ จึงแสดงรหัส OTP บนหน้านี้",
      });
    }
    return NextResponse.json(
      {
        success: false,
        message: "ส่งอีเมลไม่สำเร็จ — ตรวจสอบ App Password และ 2-Step Verification ของ Gmail",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import crypto from "crypto";

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

const SIGN_SECRET =
  process.env.AUTH_RESET_SECRET ||
  process.env.TURNSTILE_SECRET_KEY ||
  "dev-fallback-secret";

export function signResetToken(email: string): string {
  const expiresAt = Date.now() + 10 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ email, expiresAt })).toString(
    "base64url"
  );
  const sig = crypto
    .createHmac("sha256", SIGN_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      otp?: unknown;
    };
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกรหัส OTP" },
        { status: 400 }
      );
    }

    const record = otpStore.get(email);
    if (!record) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัส OTP กรุณาขอรหัสใหม่" },
        { status: 400 }
      );
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return NextResponse.json(
        { success: false, message: "รหัส OTP หมดอายุแล้ว" },
        { status: 400 }
      );
    }

    if (record.attempts >= 5) {
      otpStore.delete(email);
      return NextResponse.json(
        { success: false, message: "กรอกรหัสผิดเกินกำหนด" },
        { status: 429 }
      );
    }

    if (record.code !== otp) {
      record.attempts += 1;
      otpStore.set(email, record);
      return NextResponse.json(
        { success: false, message: "รหัส OTP ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    otpStore.delete(email);
    const resetToken = signResetToken(email);

    return NextResponse.json({
      success: true,
      resetToken,
    });
  } catch (err) {
    console.error("[VERIFY-OTP ERROR]", err);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}
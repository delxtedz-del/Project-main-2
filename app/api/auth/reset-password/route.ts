import { NextResponse } from "next/server";
import crypto from "crypto";

const SIGN_SECRET =
  process.env.AUTH_RESET_SECRET ||
  process.env.TURNSTILE_SECRET_KEY ||
  "dev-fallback-secret";

function verifyResetToken(token: string, expectedEmail: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;

  const expectedSig = crypto
    .createHmac("sha256", SIGN_SECRET)
    .update(payload)
    .digest("base64url");

  if (sig.length !== expectedSig.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return false;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { email?: string; expiresAt?: number };

    if (parsed.email !== expectedEmail) return false;
    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) return false;
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const resetToken =
      typeof body?.resetToken === "string" ? body.resetToken : "";
    const newPassword =
      typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!email || !newPassword) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { success: false, message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร" },
        { status: 400 }
      );
    }

    if (!resetToken || !verifyResetToken(resetToken, email)) {
      return NextResponse.json(
        {
          success: false,
          message: "เซสชันการรีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "เปลี่ยนรหัสผ่านสำเร็จ",
    });
  } catch (err) {
    console.error("[RESET-PASSWORD ERROR]", err);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}
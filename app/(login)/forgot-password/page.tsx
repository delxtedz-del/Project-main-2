"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { updateUserPassword } from "@/data/Login";

type AuthResponse = {
  success?: boolean;
  message?: string;
  resetToken?: string;
  devOtp?: string;
};

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "Email@Enterprise.com";

  // step 2 = กรอก OTP, step 3 = กรอกรหัสผ่านใหม่
  const [step, setStep] = useState<2 | 3>(2);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const requestedOtp = useRef(false);
  const requestId = useRef(0);

  // จัดการการพิมพ์ OTP ทีละช่อง + Auto Focus ช่องถัดไป
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // รับเฉพาะตัวเลข
    const digit = value.slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);
    setErrorMsg("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // ถ้ากรอกครบ 6 หลักแล้ว ตรวจสอบ OTP อัตโนมัติ
    const fullCode = updated.join("");
    if (fullCode.length === 6) {
      verifyOtpCode(fullCode);
    }
  };

  // กด Backspace ย้อนกลับช่องก่อนหน้า
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // รองรับการวาง (Paste) รหัส 6 หลักรวดเดียว
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = [...otp];
    pasted.split("").forEach((char, i) => {
      updated[i] = char;
    });
    setOtp(updated);
    if (pasted.length === 6) {
      verifyOtpCode(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

const verifyOtpCode = async (code: string) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = (await res.json()) as AuthResponse;
      if (data.success) {
        setResetToken(data.resetToken || "");
        setStep(3);
      } else {
        setErrorMsg(data.message || "รหัส OTP ไม่ถูกต้อง");
      }
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดในการตรวจสอบ OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const requestOtp = async (notify: boolean) => {
    const id = ++requestId.current;
    setErrorMsg("");
    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as AuthResponse;
    if (id !== requestId.current) return;
    if (data.devOtp) setDevOtp(data.devOtp);
    if (!data.success) {
      setErrorMsg(data.message || "ส่งรหัส OTP ไม่สำเร็จ");
      return;
    }
    if (notify) {
      alert(data.devOtp ? `รหัส OTP คือ ${data.devOtp}` : `ส่งรหัส OTP ใหม่ไปที่ ${email} แล้ว`);
    }
  };

  useEffect(() => {
    const target = searchParams.get("email");
    if (!target || requestedOtp.current) return;
    requestedOtp.current = true;
    void requestOtp(false);
    // request once for the email in the URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleResendOtp = async () => {
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    await requestOtp(true);
  };

const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword.length < 4) {
      setErrorMsg("รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });
      const data = (await res.json()) as AuthResponse;
      if (data.success) {
        updateUserPassword(email, newPassword);
        alert("เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่");
        router.push("/login");
      } else {
        setErrorMsg(data.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
      }
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดที่เซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-[#fafafa] font-line-seed-sans-th select-none overflow-hidden">
      {/* ฝั่งซ้าย: ฟอร์ม OTP / ตั้งรหัสผ่านใหม่ */}
      <div className="flex-1 h-full flex flex-col justify-center items-center px-6 sm:px-12 overflow-y-auto">
        <div className="w-full max-w-[400px]">
          {/* หัวข้อ */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-medium text-zinc-900 tracking-tight">
              ลืมรหัสผ่าน
            </h1>
            <p className="text-xs text-zinc-400 font-thin mt-1">
              {step === 2 ? "ยืนยันตัวตนผ่านอีเมล" : "กรอกรหัสใหม่"}
            </p>
          </div>

          {/* Stepper 3 จุดตามดีไซน์ */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex flex-col items-center">
              <div className="size-3.5 rounded-full bg-[#144738]" />
              <span className="text-[10px] text-[#144738] mt-1">ลืมรหัสผ่าน</span>
            </div>
            <div className={`w-12 h-[1.5px] -mt-4 ${step >= 2 ? "bg-[#144738]" : "bg-zinc-300"}`} />
            <div className="flex flex-col items-center">
              <div className={`size-3.5 rounded-full ${step === 3 ? "bg-[#144738]" : "bg-zinc-300"}`} />
              <span className={`text-[10px] mt-1 ${step === 3 ? "text-[#144738]" : "text-zinc-400"}`}>
                OTP
              </span>
            </div>
            <div className="w-12 h-[1.5px] -mt-4 bg-zinc-300" />
            <div className="flex flex-col items-center">
              <div className="size-3.5 rounded-full bg-zinc-300" />
              <span className="text-[10px] text-zinc-400 mt-1">กรอกรหัสใหม่</span>
            </div>
          </div>

          {step === 2 ? (
            /* --- หน้า 2: กรอก OTP 6 ช่อง --- */
            <div>
              <p className="text-xs text-zinc-800 mb-1">
                โปรดกรอกรหัส OTP ที่เราส่งให้ผ่านทางอีเมล :
              </p>
              <p className="text-xs text-zinc-500 mb-5">{email}</p>
              {devOtp && (
                <p className="text-xs text-[#144738] text-center mb-4">
                  ส่งอีเมลไม่ได้ รหัส OTP สำหรับทดสอบคือ {devOtp}
                </p>
              )}

              {/* กล่อง OTP 6 ช่อง */}
              <div className="flex justify-between gap-2.5 mb-6" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-13 text-center text-lg font-medium text-zinc-900 bg-white border border-zinc-200 rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.04)] outline-none focus:ring-1 focus:ring-[#144738] transition"
                  />
                ))}
              </div>

              {errorMsg && (
                <p className="text-xs text-red-500 text-center mb-4">{errorMsg}</p>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="px-7 py-2.5 bg-[#144738] hover:bg-[#0f362a] text-white rounded-full text-xs font-medium shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  ส่งอีกครั้ง
                </button>
              </div>
            </div>
          ) : (
            /* --- หน้า 3: กรอกรหัสผ่านใหม่ --- */
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-xs font-medium text-zinc-900 mb-2">
                  รหัสผ่านใหม่
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 pr-11 text-xs text-zinc-800 outline-none focus:ring-1 focus:ring-[#144738] shadow-[0_2px_6px_rgba(0,0,0,0.03)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-medium text-zinc-900 mb-2">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 pr-11 text-xs text-zinc-800 outline-none focus:ring-1 focus:ring-[#144738] shadow-[0_2px_6px_rgba(0,0,0,0.03)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-500 text-center mb-4">{errorMsg}</p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-9 py-2.5 bg-[#144738] hover:bg-[#0f362a] text-white rounded-full text-xs font-medium shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "กำลังบันทึก..." : "ยืนยัน"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ฝั่งขวา: รูปภาพทีมงานพร้อมฟิลเตอร์สีเขียวเข้มตามดีไซน์ */}
      <div className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80"
          alt="Team Office"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#124b3e]/95 via-[#124b3e]/75 to-[#124b3e]/40 mix-blend-multiply" />
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
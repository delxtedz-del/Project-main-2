"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { login, Credential } from "@/data/Login";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!turnstileToken) {
      setErrorMsg("กรุณายืนยันตัวตนผ่าน Cloudflare Turnstile ก่อนเข้าสู่ระบบ");
      return;
    }

    setIsLoading(true);

    try {
      const verifyRes = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        setErrorMsg("การยืนยันตัวตนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        setIsLoading(false);
        return;
      }

      const cred = await login(email, password);

      localStorage.setItem("credential", JSON.stringify(cred));
      router.push("/");
    } catch (err) {
      if (err === "user not found") {
        setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง (รหัสผ่านเริ่มต้นคือ Pass)");
      } else if (err === "connection refused") {
        setErrorMsg("การเชื่อมต่อระบบขัดข้อง กรุณากดเข้าสู่ระบบใหม่อีกครั้ง");
      } else {
        setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-white font-line-seed-sans-th select-none overflow-hidden">
      {/* ฝั่งซ้าย: รูปภาพทีมงานพร้อมฟิลเตอร์สีเขียวเข้มไล่สีจากขวาไปซ้าย */}
      <div className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden rounded-r-[36px] shadow-[4px_0_24px_rgba(0,0,0,0.05)]">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80"
          alt="Team Office"
          className="w-full h-full object-cover object-center"
        />
        {/* ไล่สีเขียวเข้มจากขวาไปซ้าย */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#124b3e]/95 via-[#124b3e]/70 to-[#124b3e]/25 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#0e3b31]/60 via-[#0e3b31]/30 to-transparent" />
      </div>

      {/* ฝั่งขวา: ฟอร์มเข้าสู่ระบบ */}
      <div className="flex-1 h-full flex flex-col justify-center items-center px-6 sm:px-12 bg-white overflow-y-auto">
        <div className="w-full max-w-[360px]">
          {/* ส่วนหัว: ยินดีต้อนรับกลับมา */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium text-zinc-900 tracking-tight">
              ยินดีต้อนรับกลับมา
            </h1>
            <p className="text-xs text-zinc-400 font-thin mt-1.5">
              เข้าสู่ระบบบัญชีของคุณ
            </p>
          </div>

          {/* แบบฟอร์ม */}
          <form onSubmit={handleLogin}>
            {/* ช่องกรอกอีเมล */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-zinc-900 mb-2">
                อีเมล
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#fcfcfc] border border-zinc-200/90 rounded-2xl px-4 py-3 text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:bg-white focus:ring-1 focus:ring-teal-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition"
              />
            </div>

            {/* ช่องกรอกรหัสผ่าน */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-zinc-900 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#fcfcfc] border border-zinc-200/90 rounded-2xl px-4 py-3 pr-11 text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:bg-white focus:ring-1 focus:ring-teal-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-800 transition cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* ลิงก์ลืมรหัสผ่าน */}
            <div className="flex justify-end mb-5">
              <button
                type="button"
                onClick={() =>
                  alert("ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว")
                }
                className="text-[11px] text-zinc-400 font-thin hover:text-zinc-700 transition cursor-pointer"
              >
                ลืมรหัสผ่าน
              </button>
            </div>

            {/* ปุ่มเข้าสู่ระบบ */}
            <button
              type="submit"
              disabled={isLoading || !turnstileToken}
              className="w-full py-3 bg-[#144738] hover:bg-[#0f362a] text-white rounded-2xl text-xs font-medium tracking-wide transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          {/* กล่องตรวจสอบสิทธิ์ Cloudflare Turnstile ของจริง */}
          <div className="mt-4 flex flex-col items-center">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
              onSuccess={(token) => {
                setTurnstileToken(token);
                setErrorMsg("");
              }}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
              options={{
                theme: "light",
                language: "th",
              }}
            />

            {errorMsg && (
              <p className="text-xs text-red-500 text-center font-medium mt-2">
                {errorMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      localStorage.setItem(
        "credential",
        JSON.stringify({ name, email, loggedInAt: new Date().toISOString() })
      );
    } catch {
      /* ignore */
    }

    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#FBFBFC] font-line-seed-sans-th select-none">
      <div className="w-full max-w-md bg-white rounded-[32px] border border-zinc-200/80 p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-baseline tracking-wide">
            <span className="text-3xl font-extrabold text-teal-800">EDB</span>
            <span className="text-3xl font-extrabold text-zinc-900">M</span>
            <span className="text-3xl font-extrabold text-zinc-900">S</span>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 mt-2">
            สร้างบัญชีผู้ใช้งานใหม่
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            ลงทะเบียนเพื่อเข้าใช้งานระบบจัดการพนักงาน
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-900 mb-1.5">
              ชื่อ-นามสกุล
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อ นามสกุล"
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:bg-white focus:ring-1 focus:ring-teal-800 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-900 mb-1.5">
              อีเมล
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:bg-white focus:ring-1 focus:ring-teal-800 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-900 mb-1.5">
              รหัสผ่าน
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร"
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:bg-white focus:ring-1 focus:ring-teal-800 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3 bg-[#105647] hover:bg-teal-950 text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm disabled:opacity-50"
          >
            <span>{isLoading ? "กำลังสร้างบัญชี..." : "ลงทะเบียนเข้าสู่ระบบ"}</span>
            {!isLoading && <ArrowRight className="size-4" />}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-6">
          มีบัญชีอยู่แล้ว?{" "}
          <Link
            href="/login"
            className="text-teal-800 font-semibold hover:underline"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}

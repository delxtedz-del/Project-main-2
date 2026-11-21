"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

type TurnstileApi = {
  render: (
    container: string | HTMLElement,
    options: Record<string, unknown>
  ) => string | undefined;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

const getTurnstile = (): TurnstileApi | undefined =>
  typeof window !== "undefined"
    ? (window as unknown as { turnstile?: TurnstileApi }).turnstile
    : undefined;

interface TurnstileWidgetProps {
  /** Site Key จาก Cloudflare (ปกติส่งมาจาก process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) */
  siteKey: string;
  /** เรียกเมื่อผู้ใช้ผ่านการยืนยันตัวตนและได้ token แล้ว */
  onVerify: (token: string) => void;
  /** เรียกเมื่อ token หมดอายุ */
  onExpire?: () => void;
  /** เรียกเมื่อเกิดข้อผิดพลาดในการโหลด/ยืนยัน */
  onError?: () => void;
  /** เปลี่ยนค่าตัวเลขนี้เพื่อสั่งให้กล่อง Turnstile รีเซ็ตตัวเอง (เช่น หลังล็อกอินไม่ผ่าน) */
  resetKey?: number;
  theme?: "light" | "dark" | "auto";
  language?: string;
}

export default function TurnstileWidget({
  siteKey,
  onVerify,
  onExpire,
  onError,
  resetKey = 0,
  theme = "light",
  language = "th",
}: TurnstileWidgetProps) {
  const [isScriptReady, setIsScriptReady] = useState(
    () => Boolean(getTurnstile())
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // เก็บ callback ล่าสุดไว้ใน ref เพื่อไม่ให้ useEffect render widget ใหม่ซ้ำๆ
  const callbacksRef = useRef({ onVerify, onExpire, onError });
  callbacksRef.current = { onVerify, onExpire, onError };

  useEffect(() => {
    const turnstile = getTurnstile();
    if (!isScriptReady || !containerRef.current || !turnstile || !siteKey) {
      return;
    }

    const id = turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme,
      language,
      callback: (verifiedToken: string) => {
        callbacksRef.current.onVerify(verifiedToken);
      },
      "error-callback": () => {
        callbacksRef.current.onError?.();
      },
      "expired-callback": () => {
        callbacksRef.current.onExpire?.();
      },
    });

    widgetIdRef.current = id ?? null;

    return () => {
      const api = getTurnstile();
      if (widgetIdRef.current && api) {
        api.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [isScriptReady, siteKey, theme, language]);

  // รีเซ็ต widget เมื่อ resetKey เปลี่ยน (ข้ามครั้งแรกที่ resetKey === 0)
  useEffect(() => {
    const turnstile = getTurnstile();
    if (resetKey > 0 && widgetIdRef.current && turnstile) {
      turnstile.reset(widgetIdRef.current);
    }
  }, [resetKey]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setIsScriptReady(true)}
      />
      <div ref={containerRef} className="my-1" />
    </>
  );
}

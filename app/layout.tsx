import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const lineSeedSansTH = localFont({
  src: [
    {
      path: "../public/fonts/LINESeedSansTH_W_Th.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/LINESeedSansTH_W_Rg.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/LINESeedSansTH_W_Bd.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/LINESeedSansTH_W_XBd.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/LINESeedSansTH_W_He.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-line-seed-th",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EDBMS - ระบบจัดการพนักงาน",
  description: "ระบบจัดการบุคลากรและสวัสดิการพนักงาน พร้อมทั้งส่งต่องานให้ฝ่ายบัญชี",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={lineSeedSansTH.variable}>
      <body className={`${lineSeedSansTH.className} flex h-screen overflow-hidden bg-[#FBFBFC]`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
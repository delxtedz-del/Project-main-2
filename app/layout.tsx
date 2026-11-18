import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/Sidebar";


const lineSeedSansTH =  localFont({
  src : [
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
  display: "swap"
})

export const metadata: Metadata = {
  title: "EDBMS - ระบบจัดการพนักงาน",
  description: "ระบบจัดการบุคลากรและสวัสดิการพนักงาน พร้อมทั้งส่งต่องานให้ฝ่ายบัญชี",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={lineSeedSansTH.variable}>
      <body className={`${lineSeedSansTH.className} flex h-screen overflow-hidden bg-[#FBFBFC]`}>
        {/* 1. วาง Sidebar ไว้ด้านซ้าย */}
        <Sidebar />

        {/* 2. พื้นที่แสดงเนื้อหาของแต่ละหน้า (Scroll ได้อิสระ) */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}

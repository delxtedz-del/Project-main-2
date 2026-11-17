import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "EDBMS - ระบบจัดการพนักงาน",
  description: "ระบบจัดการพนักงานและบุคลากร",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="flex h-screen overflow-hidden bg-[#FBFBFC]">
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

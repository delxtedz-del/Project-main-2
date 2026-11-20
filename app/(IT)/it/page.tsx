"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ITRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/benefits");
  }, [router]);

  return (
    <div className="p-8 text-center text-gray-500 font-line-seed-sans-th">
      กำลังนำท่านไปยังหน้างบประมาณสวัสดิการ...
    </div>
  );
}

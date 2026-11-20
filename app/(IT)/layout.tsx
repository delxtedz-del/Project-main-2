import React from "react";
import Header from "@/components/Header";
import ApprovalProvider from "@/components/ApprovalProvider";

export default function ITLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApprovalProvider>
      <div className="p-6 md:p-8 min-w-0 font-line-seed-sans-th max-w-7xl mx-auto">
        <Header />
        {children}
      </div>
    </ApprovalProvider>
  );
}

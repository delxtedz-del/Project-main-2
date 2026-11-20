import React from "react";

export default function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs font-line-seed-sans-th">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-3">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {aside && <span className="text-sm text-gray-500">{aside}</span>}
      </header>
      {children}
    </section>
  );
}

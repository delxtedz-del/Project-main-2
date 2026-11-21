import React from "react";

export interface SectionProps {
  title: string;
  subtitle?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function Section({
  title,
  subtitle,
  aside,
  children,
  className = "",
}: SectionProps) {
  return (
    <section className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-xs font-line-seed-sans-th ${className}`}>
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
        </div>
        {aside && (
          <div className="text-sm text-gray-500">
            {aside}
          </div>
        )}
      </header>
      {children}
    </section>
  );
}

"use client";

import { startTransition, useEffect, useState } from "react";

interface ClockProps {
  showTime?: boolean;
  className?: string;
}

export function Clock({ showTime = true, className }: ClockProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Wrap in startTransition so that if any component below suspends
    // during this update, React keeps the existing UI visible instead
    // of flashing the nearest outer <Suspense> fallback.
    startTransition(() => {
      setNow(Date.now());
    });

    const id = setInterval(() => {
      startTransition(() => {
        setNow(Date.now());
      });
    }, 1000);

    return () => clearInterval(id);
  }, []);

  if (!now) {
    return <span className={className}>วันนี้ …</span>;
  }

  const date = new Date(now);
  const thaiDate = date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  

  return (
    <time className={className} dateTime={date.toISOString()}>
      วันนี้ {thaiDate}
      {showTime && (
        <span className="ml-2 font-mono text-base font-semibold text-teal-800">

        </span>
      )}
    </time>
  );
}

export default Clock;

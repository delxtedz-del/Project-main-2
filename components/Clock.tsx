"use client";

import { startTransition, useEffect, useState } from "react";

interface ClockProps {
  showTime?: boolean;
  className?: string;
}

export function Clock({ showTime = false, className }: ClockProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
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
        <span className="ml-2 font-sans text-sm opacity-80">
          {date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </time>
  );
}

export default Clock;

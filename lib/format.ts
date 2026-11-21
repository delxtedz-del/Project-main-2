const thMonths = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const p2 = (n: number) => String(n).padStart(2, "0");

// "2026-10-25T14:13" หรือ ISO string -> "25 ต.ค. 2569 14:13" (ไม่พึ่ง timezone จึงไม่เกิด hydration mismatch)
export function thaiDateTime(iso: string): string {
  if (!iso) return "-";
  try {
    const [d, t] = iso.split("T");
    if (!d) return iso;
    const parts = d.split("-").map(Number);
    if (parts.length < 3) return iso;
    const [y, m, day] = parts;
    const timeStr = t ? t.slice(0, 5) : "";
    const yearBE = y < 2400 ? y + 543 : y;
    return `${day} ${thMonths[m - 1] || ""} ${yearBE}${timeStr ? ` ${timeStr}` : ""}`;
  } catch {
    return iso;
  }
}

// เวลาปัจจุบันแบบท้องถิ่น รูปแบบ "YYYY-MM-DDTHH:mm"
export function nowLocal(): string {
  const n = new Date();
  return `${n.getFullYear()}-${p2(n.getMonth() + 1)}-${p2(n.getDate())}T${p2(n.getHours())}:${p2(n.getMinutes())}`;
}

// วันที่ปัจจุบันแบบ "YYYY-MM-DD"
export function todayIso(): string {
  const n = new Date();
  return `${n.getFullYear()}-${p2(n.getMonth() + 1)}-${p2(n.getDate())}`;
}

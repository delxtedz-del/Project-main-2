import { pbkdf2Sync, randomBytes, randomInt } from "node:crypto";
import { writeFileSync } from "node:fs";

const users = [
  { empCode: "CS-001", email: "cs1@thaibmamail.com", role: "EMP", level: 1 },
  // ... คัดลอกที่เหลือจาก Login.ts มา (ไม่ต้องมี password แล้ว)
];

// สุ่มรหัส 12 ตัว ตัดตัวที่ดูคล้ายกัน (0/O, 1/l/I) ออก
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const genPassword = () =>
  Array.from({ length: 12 }, () => CHARS[randomInt(CHARS.length)]).join("");

const hash = (pw) => {
  const salt = randomBytes(16);
  const h = pbkdf2Sync(pw, salt, 100000, 32, "sha256");
  return `${salt.toString("base64")}:${h.toString("base64")}`;
};

const rows = users.map((u) => ({ ...u, password: genPassword() }));

const sql = rows
  .map(
    (u) =>
      `INSERT OR REPLACE INTO users (email, emp_code, role, level, password_hash) VALUES ('${u.email.toLowerCase()}','${u.empCode}','${u.role}',${u.level},'${hash(u.password)}');`
  )
  .join("\n");

const csv =
  "email,empCode,password\n" +
  rows.map((u) => `${u.email},${u.empCode},${u.password}`).join("\n");

writeFileSync("seed.sql", sql);
writeFileSync("passwords.csv", csv);
console.log(`สร้าง seed.sql และ passwords.csv แล้ว ${rows.length} ผู้ใช้`);
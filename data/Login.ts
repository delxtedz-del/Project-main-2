export type User = {
  empCode: string;
  email: string;
  password: string;
  role: string;
  level: number;
};

const users: User[] = [
  // EMP: พนักงานทั่วไป (Level 1-4)
  { empCode: "CS-001", email: "cs1@thaibmamail.com", password: "Pass", role: "EMP", level: 1 },
  { empCode: "CS-002", email: "cs2@thaibmamail.com", password: "Pass", role: "EMP", level: 2 },
  { empCode: "CS-003", email: "cs3@thaibmamail.com", password: "Pass", role: "EMP", level: 3 },
  { empCode: "SAL-004", email: "sal1@thaibmamail.com", password: "Pass", role: "EMP", level: 1 },
  { empCode: "CS-005", email: "cs4@thaibmamail.com", password: "Pass", role: "EMP", level: 3 },
  { empCode: "SAL-006", email: "sal2@thaibmamail.com", password: "Pass", role: "EMP", level: 2 },
  { empCode: "SAL-007", email: "sal3@thaibmamail.com", password: "Pass", role: "EMP", level: 3 },
  { empCode: "CS-008", email: "cs5@thaibmamail.com", password: "Pass", role: "EMP", level: 3 },
  { empCode: "CS-009", email: "cs6@thaibmamail.com", password: "Pass", role: "EMP", level: 4 },
  { empCode: "CS-010", email: "cs7@thaibmamail.com", password: "Pass", role: "EMP", level: 4 },
  { empCode: "SAL-011", email: "sal4@thaibmamail.com", password: "Pass", role: "EMP", level: 3 },
  { empCode: "SAL-012", email: "sal5@thaibmamail.com", password: "Pass", role: "EMP", level: 3 },
  { empCode: "SAL-013", email: "sal6@thaibmamail.com", password: "Pass", role: "EMP", level: 4 },
  { empCode: "SAL-014", email: "sal7@thaibmamail.com", password: "Pass", role: "EMP", level: 4 },

  // FIN: การเงินและบัญชี (Level 5-8)
  { empCode: "FIN-021", email: "fin1@thaibmamail.com", password: "Pass", role: "FIN", level: 5 },
  { empCode: "FIN-031", email: "fin4@thaibmamail.com", password: "Pass", role: "FIN", level: 6 },
  { empCode: "FIN-022", email: "fin2@thaibmamail.com", password: "Pass", role: "FIN", level: 7 },
  { empCode: "FIN-023", email: "fin3@thaibmamail.com", password: "Pass", role: "FIN", level: 8 },

  // AD: ออดิต (Level 9-12)
  { empCode: "AUD-032", email: "aud3@thaibmamail.com", password: "Pass", role: "AD", level: 9 },
  { empCode: "AUD-026", email: "aud1@thaibmamail.com", password: "Pass", role: "AD", level: 10 },
  { empCode: "AUD-033", email: "aud4@thaibmamail.com", password: "Pass", role: "AD", level: 11 },
  { empCode: "AUD-027", email: "aud2@thaibmamail.com", password: "Pass", role: "AD", level: 12 },

  // MD: ผู้บริหาร (Level 13-14)
  { empCode: "EXE-025", email: "exe2@thaibmamail.com", password: "Pass", role: "MD", level: 13 },
  { empCode: "EXE-024", email: "exe1@thaibmamail.com", password: "Pass", role: "MD", level: 14 },
  { empCode: "EXE-035", email: "exe3@thaibmamail.com", password: "Pass", role: "MD", level: 14 },

  // HR: ฝ่ายบุคคล (Level 15-18)
  { empCode: "HR-015", email: "hr1@thaibmamail.com", password: "Pass", role: "HR", level: 15 },
  { empCode: "HR-016", email: "hr2@thaibmamail.com", password: "Pass", role: "HR", level: 16 },
  { empCode: "HR-017", email: "hr3@thaibmamail.com", password: "Pass", role: "HR", level: 17 },
  { empCode: "HR-018", email: "hr4@thaibmamail.com", password: "Pass", role: "HR", level: 17 },
  { empCode: "HR-019", email: "hr5@thaibmamail.com", password: "Pass", role: "HR", level: 17 },
  { empCode: "HR-020", email: "hr6@thaibmamail.com", password: "Pass", role: "HR", level: 18 },
  { empCode: "DEV-001", email: "delxtedz@gmail.com", password: "Pass", role: "IT", level: 22 },

  // IT: ฝ่ายไอที (Level 19-22)
  { empCode: "IT-028", email: "it1@thaibmamail.com", password: "Pass", role: "IT", level: 19 },
  { empCode: "IT-034", email: "it4@thaibmamail.com", password: "Pass", role: "IT", level: 20 },
  { empCode: "IT-029", email: "it2@thaibmamail.com", password: "Pass", role: "IT", level: 21 },
  { empCode: "IT-030", email: "it3@thaibmamail.com", password: "Pass", role: "IT", level: 22 },
];

export type Credential = {
  token: string;
  email: string;
  empCode: string;
  role: string;
};

const PASSWORD_OVERRIDE_KEY = "edbms-password-overrides";

// ดึงรหัสผ่านที่เคยเปลี่ยนใหม่จาก localStorage (ถ้ามี)
function getEffectivePassword(user: User): string {
  if (typeof window === "undefined") return user.password;
  try {
    const raw = localStorage.getItem(PASSWORD_OVERRIDE_KEY);
    if (!raw) return user.password;
    const overrides = JSON.parse(raw) as Record<string, string>;
    return overrides[user.email.toLowerCase()] ?? user.password;
  } catch {
    return user.password;
  }
}

// เช็กว่ามีอีเมลนี้ในระบบจริงหรือไม่ (ใช้ก่อนส่ง OTP)
export const checkEmailExists = (email: string): boolean => {
  const normalized = email.trim().toLowerCase();
  return users.some((u) => u.email.toLowerCase() === normalized);
};

// อัปเดตรหัสผ่านใหม่หลังยืนยัน OTP สำเร็จ
export const updateUserPassword = (email: string, newPassword: string): boolean => {
  const normalized = email.trim().toLowerCase();
  const targetUser = users.find((u) => u.email.toLowerCase() === normalized);
  if (!targetUser) return false;

  targetUser.password = newPassword;

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(PASSWORD_OVERRIDE_KEY);
      const overrides = raw ? (JSON.parse(raw) as Record<string, string>) : {};
      overrides[normalized] = newPassword;
      localStorage.setItem(PASSWORD_OVERRIDE_KEY, JSON.stringify(overrides));
    } catch {
      /* ignore */
    }
  }
  return true;
};

export const login = (email: string, pass: string): Promise<Credential> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          getEffectivePassword(u) === pass
      );
      if (user === undefined) {
        reject("user not found");
        return;
      }
      const newCredential: Credential = {
        token: crypto.randomUUID(),
        email: user.email,
        empCode: user.empCode,
        role: user.role,
      };
      resolve(newCredential);
    }, 400);
  });
};

export const logout = (token: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() <= 0.8) {
        resolve("success");
      } else {
        reject("connection refused");
      }
    }, 1000 + Math.random() * 2000);
  });
};


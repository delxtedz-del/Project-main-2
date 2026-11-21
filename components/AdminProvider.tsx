"use client";

// สถานะส่วน IT (สิทธิ์ / Audit Trail / แจ้งเตือน / สถิติ) ใช้ร่วมกันทุกหน้า (Context)
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  currentUser,
  modules,
  actionLabels,
  getLiveSystemStats,
  getLiveAuditLogs,
  getLivePermissions,
  addAuditLog,
  savePermissions,
  type AuditLog,
  type LogLevel,
  type PermMap,
  type SystemStats,
} from "@/data/it";
import { thaiDateTime, nowLocal } from "@/lib/format";

export type Notice = { text: string; time: string; read: boolean };

export type AdminCtx = {
  logs: AuditLog[];
  perms: Record<string, PermMap>;
  notices: Notice[];
  stats: SystemStats;
  markAllRead: () => void;
  savePerms: (position: string, next: PermMap) => number;
  addLog: (action: string, detail: string, level?: LogLevel) => string;
  refreshStats: () => void;
};

const AdminContext = createContext<AdminCtx | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    // Safe fallback if used outside Provider
    return {
      logs: [],
      perms: {},
      notices: [],
      stats: {
        users: 35,
        requests: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        budgetDisbursed: 0,
        budgetTotal: 3000000,
        budgetRemaining: 3000000,
      },
      markAllRead: () => {},
      savePerms: () => 0,
      addLog: () => "",
      refreshStats: () => {},
    };
  }
  return ctx;
}

const permText = (a: string[] | undefined) =>
  a && a.length
    ? a.map((k) => actionLabels[k as keyof typeof actionLabels] || k).join(", ")
    : "ไม่มีสิทธิ์";

export default function AdminProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [perms, setPerms] = useState<Record<string, PermMap>>({});
  const [notices, setNotices] = useState<Notice[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    users: 35,
    requests: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    budgetDisbursed: 0,
    budgetTotal: 3000000,
    budgetRemaining: 3000000,
  });

  useEffect(() => {
    // โหลดข้อมูลสดจาก localStorage และ data modules
    const liveLogs = getLiveAuditLogs();
    const livePerms = getLivePermissions();
    const liveStats = getLiveSystemStats();

    setLogs(liveLogs);
    setPerms(livePerms);
    setStats(liveStats);

    // สร้างการแจ้งเตือนเริ่มต้นจากเหตุเฝ้าระวังความปลอดภัย
    const warningNotices: Notice[] = liveLogs
      .filter((l) => l.level === "warning")
      .slice(0, 5)
      .map((l) => ({
        text: `เฝ้าระวัง: ${l.action} (${l.detail.split(":")[0]})`,
        time: thaiDateTime(l.at),
        read: false,
      }));

    setNotices(warningNotices);
  }, []);

  const refreshStats = () => {
    setStats(getLiveSystemStats());
  };

  const addLog = (
    action: string,
    detail: string,
    level: LogLevel = "normal"
  ): string => {
    const newLog = addAuditLog(action, detail, level, currentUser.email, currentUser.role);
    setLogs((prev) => [newLog, ...prev]);

    if (level === "warning") {
      setNotices((prev) => [
        {
          text: `เฝ้าระวัง: ${action}`,
          time: thaiDateTime(newLog.at),
          read: false,
        },
        ...prev,
      ]);
    }
    refreshStats();
    return newLog.at;
  };

  const savePerms = (position: string, next: PermMap): number => {
    const prev = perms[position] ?? {};
    const changed = modules.filter(
      (m) => permText(prev[m.key]) !== permText(next[m.key])
    );
    if (changed.length === 0) return 0;

    const detail =
      `ตำแหน่ง ${position} · ` +
      changed
        .map(
          (m) => `${m.label}: ${permText(prev[m.key])} → ${permText(next[m.key])}`
        )
        .join(" · ");

    addLog("แก้ไขสิทธิ์การเข้าถึง", detail, "normal");
    const updated = savePermissions(position, next);
    setPerms(updated);

    const time = `${new Date().toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    })} น.`;
    setNotices((n) => [
      {
        text: `อัปเดตสิทธิ์ตำแหน่ง "${position}" (${changed.length} โมดูล)`,
        time,
        read: false,
      },
      ...n,
    ]);

    return changed.length;
  };

  const markAllRead = () => {
    setNotices((n) => n.map((x) => ({ ...x, read: true })));
  };

  return (
    <AdminContext.Provider
      value={{
        logs,
        perms,
        notices,
        stats,
        markAllRead,
        savePerms,
        addLog,
        refreshStats,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

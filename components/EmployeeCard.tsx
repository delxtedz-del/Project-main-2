import React from "react";

export interface Employee {
  id: string;
  code: string;
  name: string;
  role: string;
  department: string;
  tenure: string;
  avatarUrl?: string;
}

interface EmployeeCardProps {
  employee: Employee;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  return (
    <div className="w-full bg-white rounded-[31.06px] p-4.5 px-5 shadow-[6.21px_6.21px_3.1px_0px_rgba(0,0,0,0.05)] outline outline-[1.55px] outline-zinc-300 flex flex-col justify-between hover:shadow-md transition-shadow">
      {/* ข้อมูลส่วนบน: รูปภาพ, ชื่อ-ตำแหน่ง, รหัสพนักงาน */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          {employee.avatarUrl ? (
            <img
              src={employee.avatarUrl}
              alt={employee.name}
              className="size-14 rounded-lg object-cover shrink-0 bg-zinc-100"
            />
          ) : (
            <div className="size-14 rounded-lg shrink-0 bg-neutral-100" />
          )}

          <div className="min-w-0 pt-0.5">
            <h3 className="text-base font-normal text-zinc-900 truncate leading-5">
              {employee.name}
            </h3>
            <p className="text-xs font-light text-zinc-600/80 truncate leading-5 mt-0.5">
              {employee.role}
            </p>
          </div>
        </div>

        <span className="text-[9.32px] font-normal text-zinc-400 leading-3 tracking-wide shrink-0 pt-1">
          {employee.code}
        </span>
      </div>

      {/* แถบ Badges ด้านล่างขวา ตาม Figma */}
      <div className="flex items-center justify-end gap-2 mt-3.5">
        <span className="h-5 px-3 bg-zinc-100 rounded-[31.06px] shadow-[inset_1.55px_-3.1px_6.8px_0px_rgba(0,0,0,0.05)] text-[9.32px] font-normal text-zinc-700 flex items-center justify-center">
          {employee.department}
        </span>
        <span className="h-5 px-3 bg-emerald-400/70 rounded-[31.06px] shadow-[inset_1.55px_-3.1px_6.8px_0px_rgba(0,0,0,0.05)] text-[9.32px] font-normal text-zinc-900 flex items-center justify-center">
          {employee.tenure}
        </span>
      </div>
    </div>
  );
};

export default EmployeeCard;

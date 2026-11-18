"use client";

import React from "react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/tailgrids/core/avatar";
import type { ExtendedEmployee } from "@/data/employees";

interface AvatarStatusRowProps {
  employees: ExtendedEmployee[];
}

export function AvatarStatusRow({ employees }: AvatarStatusRowProps) {
  return (
    <div className="flex items-center justify-center gap-10 w-full p-4">
      {employees.map((emp) => {
        const status =
          emp.status === "active"
            ? "online"
            : emp.status === "probation"
              ? "away"
              : "offline";

        const fallback =
          emp.nickname && emp.nickname !== "-"
            ? emp.nickname
            : emp.name.slice(0, 2);

        return (
          <Avatar key={emp.id} size="lg">
            <AvatarImage src={emp.avatarUrl} alt={emp.name} />
            <AvatarFallback>{fallback}</AvatarFallback>
            <AvatarBadge status={status} />
          </Avatar>
        );
      })}
    </div>
  );
}

export default AvatarStatusRow;

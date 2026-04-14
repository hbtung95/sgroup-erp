"use client";

import { PROJECT_STATUS_MAP, PRODUCT_STATUS_MAP } from "@/lib/types";

type Props = {
  status: string;
  type?: "project" | "product";
  size?: "sm" | "md";
};

export function StatusBadge({ status, type = "product", size = "sm" }: Props) {
  const map = type === "project" ? PROJECT_STATUS_MAP : PRODUCT_STATUS_MAP;
  const config = (map as Record<string, { label: string; color: string; bg: string; border: string }>)[status];

  if (!config) {
    return (
      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20">
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold border ${config.color} ${config.bg} ${config.border} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.color.replace("text-", "bg-")}`} />
      {config.label}
    </span>
  );
}

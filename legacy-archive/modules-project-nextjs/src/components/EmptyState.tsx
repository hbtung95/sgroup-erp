"use client";

import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({
  icon,
  title = "Không có dữ liệu",
  description = "Chưa có dữ liệu nào được tạo. Bắt đầu bằng cách thêm mới.",
  action,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 flex items-center justify-center mb-5">
        {icon || <Inbox className="w-8 h-8 text-slate-400 dark:text-slate-500" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}

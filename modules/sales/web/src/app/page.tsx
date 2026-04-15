"use client";

import { useEffect, useState } from "react";
import { Activity, DollarSign, Users, Target, ListTodo } from "lucide-react";
import { MOCK_TRANSACTIONS, MOCK_PRODUCTS } from "../../lib/salesMocks";
import StatCard from "../components/dashboard/StatCard";
import KPIChart from "../components/dashboard/KPIChart";
import Leaderboard from "../components/dashboard/Leaderboard";

export default function SalesDashboard() {
  const [stats, setStats] = useState({ revenue: 0, locked: 0, deals: 0, pending: 0 });

  useEffect(() => {
      const locked = MOCK_PRODUCTS.filter(p => p.status === 'LOCKED').length;
      const soldTx = MOCK_TRANSACTIONS.filter(t => t.status === 'SOLD');
      const revenue = soldTx.reduce((acc, cur) => acc + cur.priceAtLock, 0);
      const pending = MOCK_TRANSACTIONS.filter(t => t.status === 'PENDING_LOCK').length;

      setStats({ revenue, locked, deals: soldTx.length, pending });
  }, []);

  const kpis = [
    { title: "Doanh Sổ (Tỷ)", value: stats.revenue.toFixed(2), trend: "+12.5%", trendUp: true, color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", icon: DollarSign },
    { title: "Giao Dịch Thành Công", value: stats.deals, trend: "+2%", trendUp: true, color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10", icon: Users },
    { title: "Sản Phẩm Đang Lock", value: stats.locked, trend: "+5", trendUp: true, color: "text-indigo-400", border: "border-indigo-500/30", bg: "bg-indigo-500/10", icon: Target },
    { title: "Chờ Duyệt Cọc", value: stats.pending, trend: "-1", trendUp: false, color: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/10", icon: ListTodo },
  ];

  const leaderboardUsers = [
    { name: "Trần Minh Khôi", sales: "15.7 Tỷ", rank: 1, avatar: "T", isMe: true, staffId: "SGR-003" },
    { name: "Lê Thị Hồng Nhung", sales: "8.75 Tỷ", rank: 2, avatar: "L", isMe: false, staffId: "SGR-004" },
    { name: "Nguyễn Văn A", sales: "0.0 Tỷ", rank: 3, avatar: "N", isMe: false },
  ];

  return (
    <div className="w-full antialiased flex flex-col gap-8">
      <div className="mb-2">
        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
          Tổng quan Kinh Doanh
        </h1>
        <p className="text-emerald-400 mt-2 flex items-center font-bold text-sm bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
          <Activity className="w-4 h-4 mr-2" />
          Dữ liệu trực tiếp nội bộ (Realtime Mocked)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => <StatCard key={idx} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <KPIChart />
         <Leaderboard users={leaderboardUsers} />
      </div>
    </div>
  );
}

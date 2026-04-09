"use client";

import { TrendingUp, Users, Target, Activity, DollarSign, ListTodo } from "lucide-react";

export default function SalesDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-indigo-600">
          Tổng quan Kinh Doanh
        </h1>
        <p className="text-slate-500 mt-2 flex items-center font-medium">
          <Activity className="w-4 h-4 mr-2 text-indigo-500" />
          Dữ liệu được cập nhật realtime (Tháng 4/2026)
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Doanh Sổ (Tỷ)", value: "128.5", trend: "+12.5%", color: "text-green-600", bg: "bg-green-100", icon: DollarSign },
          { title: "Khách Hàng Mới", value: "45", trend: "+8.2%", color: "text-blue-600", bg: "bg-blue-100", icon: Users },
          { title: "Giao Dịch (Lock)", value: "12", trend: "+2", color: "text-orange-600", bg: "bg-orange-100", icon: Target },
          { title: "Chờ Duyệt Cọc", value: "3", trend: "-1", color: "text-purple-600", bg: "bg-purple-100", icon: ListTodo },
        ].map((kpi, idx) => (
          <div key={idx} className="glass-card p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/60 ${kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'} shadow-sm`}>
                {kpi.trend}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">{kpi.title}</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{kpi.value}</h3>
            </div>
            <div className="w-full bg-slate-100 h-1 mt-4 rounded-full overflow-hidden">
               <div className={`h-full ${kpi.color.replace('text-', 'bg-')}`} style={{ width: '70%' }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Performance Chart Placeholder */}
         <div className="lg:col-span-2 glass-panel p-6 rounded-3xl min-h-[400px] flex flex-col relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl z-0"></div>
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center z-10">
               <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
               Tiến Độ KPI Team
            </h3>
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/40 z-10">
               <p className="text-slate-400 font-medium text-sm flex items-center">
                  Chart Component (Recharts/Chart.js)
               </p>
            </div>
         </div>

         {/* Leaderboard or Recent Actions */}
         <div className="glass-panel p-6 rounded-3xl min-h-[400px]">
            <h3 className="font-bold text-lg text-slate-800 mb-6">Sales Leaderboard</h3>
            <div className="space-y-4">
               {[
                  { name: "Nguyễn Văn A", sales: "45.5 Tỷ", rank: 1, avatar: "A" },
                  { name: "Trần Thị B", sales: "32.0 Tỷ", rank: 2, avatar: "B" },
                  { name: "Lê Văn C", sales: "28.5 Tỷ", rank: 3, avatar: "C" },
                  { name: "Phạm D", sales: "15.0 Tỷ", rank: 4, avatar: "D" },
               ].map((user) => (
                  <div key={user.rank} className="flex items-center gap-4 p-3 hover:bg-white/50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white">
                     <div className="font-bold text-slate-300 w-4 text-center">{user.rank}</div>
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${user.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-slate-400 to-slate-600'}`}>
                        {user.avatar}
                     </div>
                     <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs font-semibold text-indigo-600 bg-indigo-50 inline-block px-1.5 py-0.5 rounded mt-1">{user.sales}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";

export type LeaderboardUser = {
  name: string;
  sales: string;
  rank: number;
  avatar: string;
  isMe: boolean;
  staffId?: string;
};

type LeaderboardProps = {
  users: LeaderboardUser[];
};

export default function Leaderboard({ users }: LeaderboardProps) {
  return (
    <div className="glass-panel p-8 rounded-3xl min-h-[400px] flex flex-col shadow-2xl border border-white/10 relative overflow-hidden">
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] z-0"></div>
      
      <h3 className="font-black text-xl text-white mb-8 flex items-center z-10 tracking-tight">
          🔥 Bảng Xếp Hạng NV
      </h3>
      <div className="space-y-4 z-10">
          {users.map((user) => (
            <div key={user.rank} className={`flex items-center gap-4 p-4 rounded-2xl transition-all border ${user.isMe ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 border-blue-500/30 shadow-[0_4px_15px_rgba(59,130,246,0.1)]' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'}`}>
                <div className="font-black text-slate-400 w-5 text-center text-lg">{user.rank}</div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-inner border border-white/10 ${user.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-slate-600 to-slate-800'}`}>
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                      {user.name} 
                      {user.isMe && user.staffId && <span className="text-[9px] bg-blue-500 px-1.5 py-0.5 rounded text-white tracking-widest">{user.staffId}</span>}
                  </p>
                  <p className="text-xs font-black text-emerald-400 mt-1">{user.sales}</p>
                </div>
            </div>
          ))}
      </div>
    </div>
  );
}

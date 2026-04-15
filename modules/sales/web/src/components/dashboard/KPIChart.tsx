"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

export default function KPIChart() {
  return (
    <div className="lg:col-span-2 glass-panel p-8 rounded-3xl min-h-[400px] flex flex-col relative overflow-hidden shadow-2xl border border-white/10">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] z-0"></div>
      <h3 className="font-black text-xl text-white mb-8 flex items-center z-10 tracking-tight">
          <TrendingUp className="w-6 h-6 mr-3 text-blue-400" />
          Tiến Độ KPI Quý 2
      </h3>
      
      {/* CSS Mock Chart */}
      <div className="flex-1 flex items-end justify-between gap-2 z-10 pt-10 border-b border-l border-white/10 px-4 pb-0 relative">
          <div className="absolute left-[-30px] bottom-0 text-xs text-slate-500">0</div>
          <div className="absolute left-[-40px] top-1/2 text-xs text-slate-500">50T</div>
          <div className="absolute left-[-45px] top-0 text-xs text-slate-500">100T</div>

          {[40, 65, 45, 80, 55, 90, 75, 100].map((h, i) => (
            <div key={i} className="w-full relative flex items-end justify-center group h-full">
                <div 
                  className="w-3/4 rounded-t-md bg-gradient-to-t from-blue-600/40 to-blue-400 border-t border-l border-r border-blue-300/50 transition-all duration-500 group-hover:from-blue-500 group-hover:to-cyan-300 opacity-80 group-hover:opacity-100"
                  style={{ height: `${h}%` }}
                ></div>
                <span className="absolute -top-8 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 px-2 py-1 rounded shadow-lg">{h}T</span>
            </div>
          ))}
      </div>
      <div className="flex justify-between px-4 mt-4 text-xs font-bold text-slate-500 z-10">
          <span>Tuần 1</span><span>Tuần 2</span><span>Tuần 3</span><span>Tuần 4</span>
          <span>Tuần 5</span><span>Tuần 6</span><span>Tuần 7</span><span>Tuần 8</span>
      </div>
    </div>
  );
}

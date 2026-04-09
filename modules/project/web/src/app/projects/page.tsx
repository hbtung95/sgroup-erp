"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Plus, Search, Building, MapPin } from "lucide-react";
import { ProjectCreateModal } from "./ProjectCreateModal";

type Project = {
  id: string;
  code: string;
  name: string;
  developer: string;
  location: string;
  type: string;
  status: string;
  totalUnits: number;
  soldUnits: number;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects(search);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const fetchProjects = async (query = "") => {
    try {
      // Assuming Go API runs locally on 8081 for now 
      const res = await axios.get(`http://localhost:8081/api/v1/projects${query ? `?search=${encodeURIComponent(query)}` : ""}`);
      if (res.data.data) {
        setProjects(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching projects", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500">Danh sách Dự án</h1>
          <p className="text-gray-500 mt-2 flex items-center font-medium">
            Có tổng cộng {projects.length} dự án trong hệ thống.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="glass-button flex items-center px-5 py-2.5 bg-blue-600/90 text-white rounded-xl font-medium hover:bg-blue-600">
          <Plus className="w-5 h-5 mr-1" /> Thêm Dự Án
        </button>
      </div>

      <ProjectCreateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchProjects} 
      />

      <div className="glass-panel rounded-2xl mb-8 p-3 flex items-center gap-2">
        <Search className="text-gray-500 w-5 h-5 ml-2" />
        <input 
          placeholder="Tìm theo tên dự án..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none py-1 px-2 text-sm text-gray-800 placeholder:text-gray-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 font-medium">Đang tải dữ liệu...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-gray-500 glass-panel border bg-white/40 border-dashed rounded-2xl font-medium">
          Không có dự án nào. Bấm Thêm Dự án để bắt đầu.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Link href={`/projects/${p.id}`} key={p.id} className="block group">
              <div className="glass-card p-6 shadow-sm hover:shadow-2xl transition-all cursor-pointer h-full border-l-4 rounded-xl group-hover:-translate-y-1" style={{borderLeftColor: p.status === 'ACTIVE' ? '#3b82f6' : '#94a3b8'}}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-500/10 text-blue-700 font-bold px-2.5 py-1 rounded-md text-xs">{p.code}</div>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${p.status === 'ACTIVE' ? 'bg-green-500/10 text-green-700' : 'bg-gray-500/10 text-gray-700'}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-lg leading-tight mb-2">{p.name}</h3>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="w-4 h-4 mr-2" />
                    <span className="truncate">{p.developer || "Chưa cập nhật CĐT"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{p.location || "Chưa có vị trí"}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t flex justify-between items-center text-sm">
                  <div className="text-gray-500">
                    <span className="font-semibold text-gray-900">{p.soldUnits}</span> / {p.totalUnits} căn
                  </div>
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${p.totalUnits > 0 ? (p.soldUnits / p.totalUnits) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

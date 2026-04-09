import Link from "next/link";
import { Building2, Plus, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Project Management Module</h1>
        <p className="text-gray-500 mt-2">Master Data Hub cho toàn bộ hệ thống quản lý dự án và bất động sản.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 transition-all hover:-translate-y-1">
          <div className="bg-blue-600/10 backdrop-blur-md w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Building2 className="text-blue-700 font-bold" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Danh sách Dự Án</h2>
          <p className="text-gray-500 text-sm mb-4">
            Theo dõi, tạo mới và quản lý toàn bộ các dự án bất động sản chung cư, biệt thự.
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Mở bộ quản lý <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-6 border-dashed border-gray-300">
          <div className="bg-gray-800/5 backdrop-blur-md w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Plus className="text-gray-700 font-bold" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Thêm mới Dự Án</h2>
          <p className="text-gray-500 text-sm mb-4">Thiết lập dữ liệu master ngay.</p>
          <button className="px-5 py-2.5 bg-black/90 text-white rounded-xl text-sm font-medium hover:bg-black/70 hover:shadow-xl transition-all active:scale-95">
            Khởi tạo bảng hàng
          </button>
        </div>
      </div>
    </div>
  );
}

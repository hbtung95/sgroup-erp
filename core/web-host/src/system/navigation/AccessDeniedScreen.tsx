import { useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export default function AccessDeniedScreen() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-slate-50">
      <ShieldAlert size={64} className="text-red-500 mb-6" />
      <h2 className="text-2xl font-black text-slate-900">Truy cập bị từ chối</h2>
      <p className="text-base text-slate-500 mt-2 text-center leading-relaxed max-w-md">
        Bạn không có quyền truy cập vào phân hệ này.<br />
        Hãy liên hệ quản trị viên để được cấp quyền.
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-6 px-6 py-3 rounded-xl bg-sg-red text-white font-bold cursor-pointer hover:bg-sg-red-dark transition-colors"
      >
        Quay về trang chủ
      </button>
    </div>
  )
}

/**
 * SGROUP ERP — Workspace Portal Screen (Pure React + Tailwind v4.2)
 * Ultra-premium enterprise portal with module grid and cinematic backdrop
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3, ShoppingCart, Megaphone, Users, Home, Building,
  UserCog, DollarSign, FileText, LogOut, ChevronRight,
  Sparkles, ShieldCheck, Activity, Moon, Sun, CheckCircle2
} from 'lucide-react'
import { useAuthStore } from '../../auth/store/authStore'
import { ERP_MODULES, type ErpModuleDefinition } from '../../../core/config/modules'
import sgroupLogo from '../../../assets/images/Logo 3_noFont.png'

const MODULE_ICONS: Record<string, any> = {
  exec: BarChart3, biz: ShoppingCart, mkt: Megaphone, agency: Users,
  shomes: Home, project: Building, hr: UserCog, finance: DollarSign, legal: FileText,
}

export default function WorkspaceScreen() {
  const { user, logout } = useAuthStore()
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const accessibleModules = ERP_MODULES.filter((m) => {
    if (m.id === 'project' && !!user?.salesRole) return false
    return user?.role === 'admin' || user?.modules?.includes(m.id)
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-sg-portal-bg relative overflow-hidden transition-colors duration-300">

      {/* ── CINEMATIC BACKDROP ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-sg-portal-bg to-sg-portal-bg/90" />

        {/* Animated Mesh Auroras */}
        <div className="absolute w-[800px] h-[800px] rounded-full bg-sg-red opacity-[0.06] blur-[120px]"
          style={{ animation: 'sg-aurora-1 18s ease-in-out infinite', top: '-10%', left: '-5%' }} />
        <div className="absolute w-[700px] h-[700px] rounded-full bg-blue-500 opacity-[0.04] blur-[140px]"
          style={{ animation: 'sg-aurora-2 25s ease-in-out infinite', bottom: '-15%', right: '-10%' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-violet-500 opacity-[0.03] blur-[100px]"
          style={{ animation: 'sg-aurora-1 22s ease-in-out infinite', top: '40%', right: '10%', animationDirection: 'reverse' }} />
      </div>

      {/* ── TOP BAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 pt-5">
        <div className="h-[76px] rounded-3xl border border-sg-border bg-sg-header/70 sg-glass flex items-center justify-between px-6 transition-colors duration-300"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>

          {/* Left: Logo + Brand */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-white flex items-center justify-center"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <img src={sgroupLogo} alt="SGROUP" className="w-[34px] h-[34px] object-contain" />
            </div>
            <div>
              <div className="text-lg font-black tracking-[1.5px] text-sg-heading">SGROUP</div>
              <div className="text-[9px] font-bold tracking-[2px] uppercase text-sg-muted">ENTERPRISE PORTAL</div>
            </div>
          </div>

          {/* Right: User + Actions */}
          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-sg-heading">{user?.name || 'Admin'}</div>
              <div className="flex items-center gap-1.5 justify-end mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-sg-success" />
                <span className="text-[11px] font-medium text-sg-muted">Hệ thống vận hành</span>
              </div>
            </div>
            <div className="w-px h-7 bg-sg-border" />
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-9 h-9 rounded-[10px] bg-sg-btn-bg hover:bg-sg-border flex items-center justify-center cursor-pointer transition-colors text-sg-subtext"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-[10px] bg-sg-btn-bg hover:bg-red-50 hover:text-sg-red flex items-center justify-center cursor-pointer transition-colors text-sg-subtext"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className={`
        relative z-10 px-8 pt-[140px] pb-16 max-w-[1400px] mx-auto
        transition-all duration-700
        ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}>

        {/* Hero Welcome */}
        <div className="flex flex-col items-center mb-16">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sg-red/[0.08] mb-6">
            <Sparkles size={14} className="text-sg-red" />
            <span className="text-[11px] font-extrabold text-sg-red tracking-[1px]">
              NỀN TẢNG QUẢN TRỊ TOÀN DIỆN
            </span>
          </div>

          <h1 className="text-[44px] font-black tracking-tight text-center text-sg-heading">
            Chào mừng trở lại, {user?.name?.split(' ').pop() || 'Admin'}
          </h1>

          <p className="text-lg font-medium text-sg-subtext text-center mt-4 leading-7 max-w-[640px]">
            Khám phá hệ sinh thái 9 phân hệ thông minh, sẵn sàng tối ưu hóa mọi luồng công việc của bạn hôm nay.
          </p>

          {/* Stats Pills */}
          <div className="flex gap-3 mt-8">
            <MetricPill icon={ShieldCheck} label="Bảo mật cấp cao" color="text-emerald-500" />
            <MetricPill icon={Activity} label="Thời gian thực" color="text-blue-500" />
            <MetricPill icon={CheckCircle2} label="9+ Modules" color="text-sg-red" />
          </div>
        </div>

        {/* Module Grid */}
        <div className="flex flex-wrap justify-center gap-6 max-w-[1240px] mx-auto">
          {accessibleModules.map((mod, i) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              index={i}
              onClick={() => {
                if (mod.id === 'biz') {
                  navigate('/SalesModule/dashboard')
                } else if (mod.routeName) {
                  navigate(mod.routeName.startsWith('/') ? mod.routeName : `/${mod.routeName}`)
                }
              }}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-20 pt-10 border-t border-sg-border">
          <p className="text-center text-[11px] font-semibold tracking-wide uppercase text-sg-muted">
            © 2026 SGROUP SYSTEM. PHÁT TRIỂN BỞI CÔNG TY TNHH BẤT ĐỘNG SẢN SGROUP
          </p>
        </div>
      </main>
    </div>
  )
}


/* ── Sub-components ── */

function MetricPill({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sg-btn-bg border border-sg-border transition-colors">
      <Icon size={14} className={color} />
      <span className="text-[13px] font-semibold text-sg-heading">{label}</span>
    </div>
  )
}

function ModuleCard({ mod, index, onClick }: { mod: ErpModuleDefinition; index: number; onClick: () => void }) {
  const Icon = MODULE_ICONS[mod.id] || BarChart3
  const isLocked = !mod.routeName

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLocked}
      className={`
        group relative w-[280px] min-h-[220px] rounded-[32px] border p-8 text-left
        bg-sg-card border-sg-border cursor-pointer
        transition-all duration-400
        hover:bg-sg-card-hover hover:border-sg-red/20 hover:-translate-y-2.5 hover:scale-[1.03]
        hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]
        disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:scale-100
        disabled:hover:shadow-none disabled:opacity-70
      `}
      style={{
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        animation: `sg-stagger 0.5s var(--ease-sg-spring) ${0.1 + index * 0.08}s both`,
      }}
    >
      {/* Top glow border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/15" />

      {/* Icon */}
      <div className={`
        w-14 h-14 rounded-[18px] flex items-center justify-center mb-6
        bg-gradient-to-br from-sg-red/10 to-sg-red/[0.03]
        group-hover:from-sg-red group-hover:to-sg-red-dark
        transition-all duration-300
      `}>
        <Icon size={26} className="text-sg-red group-hover:text-white transition-colors duration-300" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-extrabold text-sg-heading mb-2">{mod.name}</h3>
      <p className="text-sm text-sg-subtext leading-5 line-clamp-2">{mod.description}</p>

      {/* Arrow */}
      <div className="mt-5 flex justify-end">
        <div className={`
          w-[34px] h-[34px] rounded-xl flex items-center justify-center
          bg-sg-btn-bg group-hover:bg-sg-red transition-all duration-300
        `}>
          <ChevronRight size={14} className="text-sg-muted group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* Locked badge */}
      {isLocked && (
        <div className="absolute top-6 right-6 px-2 py-1 rounded-md bg-amber-500/10">
          <span className="text-[9px] font-extrabold text-amber-500">COMING SOON</span>
        </div>
      )}
    </button>
  )
}

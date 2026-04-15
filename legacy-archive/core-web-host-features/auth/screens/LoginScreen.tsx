/**
 * SGROUP ERP — Premium Login Screen (Pure React + Tailwind v4.2)
 * Cinematic split-screen with brand panel, floating logo, and polished form
 */
import { useState, useEffect } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { apiAuthProvider } from '../services/providers/apiAuth'
import { demoAuthProvider } from '../services/providers/demoAuth'
import sgroupLogo from '../../../assets/images/Logo 3_noFont.png'

const TRUST_TAGS = ['Bất động sản', 'Tài chính - Kế toán', 'Nhân sự', 'Marketing']

export function LoginScreen() {
  const { login, setLoading, setError, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [focusEmail, setFocusEmail] = useState(false)
  const [focusPw, setFocusPw] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const doLogin = async () => {
    if (!email || !pw) { setError('Vui lòng nhập email và mật khẩu'); return }
    setLoading(true)
    setError(null)
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('__TIMEOUT__')), 30000)
      )
      const r = await Promise.race([apiAuthProvider.login(email, pw), timeout])
      login(r.user, r.token)
    } catch (apiErr: any) {
      // Fallback to demo auth for testing UI without backend
      try {
        const r = await demoAuthProvider.login(email, pw)
        login(r.user, r.token)
      } catch (demoErr: any) {
        setError(demoErr.message || 'Đăng nhập thất bại')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doLogin()
  }

  return (
    <div className="flex min-h-screen bg-sg-portal-bg relative overflow-hidden transition-colors duration-300">

      {/* ── Background decorations ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-60"
          style={{ background: 'radial-gradient(circle at 100% 0%, rgba(212,32,39,0.03), transparent 50%)' }} />
        <div className="absolute inset-0 opacity-60"
          style={{ background: 'radial-gradient(circle at 0% 100%, rgba(59,130,246,0.02), transparent 50%)' }} />
      </div>

      {/* ████ LEFT — CINEMATIC BRAND PANEL ████ */}
      <div className={`
        hidden lg:flex relative w-[45%] min-h-screen flex-col items-center justify-center overflow-hidden
        transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}
      `}>
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#9F1219] via-[#D42027] to-[#E43037]" />

        {/* Aurora decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -right-[20%] w-[800px] h-[800px] rounded-full bg-red-500/40 blur-[100px] animate-sg-pulse" />
          <div className="absolute -bottom-[15%] -left-[15%] w-[600px] h-[600px] rounded-full bg-red-900/40 blur-[120px] animate-sg-pulse" style={{ animationDelay: '2s' }} />

          {/* Glassmorphic rings */}
          <div className="absolute top-[15%] left-[10%] w-[250px] h-[250px] rounded-full border-2 border-white/[0.06] bg-white/[0.02]" />
          <div className="absolute bottom-[20%] right-[15%] w-[180px] h-[180px] rounded-full border-2 border-white/[0.06] bg-white/[0.02] rotate-45" />
        </div>

        {/* Brand content */}
        <div className="relative z-10 flex flex-col items-center px-10">

          {/* Floating 3D Logo */}
          <div className="animate-sg-float mb-8" style={{ filter: 'drop-shadow(0 0 80px rgba(212,32,39,0.5))' }}>
            <div className="w-[180px] h-[180px] rounded-[50px] bg-white flex items-center justify-center"
              style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.5)' }}>
              <img src={sgroupLogo} alt="SGROUP" className="w-[175px] h-[175px] object-contain" />
            </div>
          </div>

          {/* Typography */}
          <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-[46px] font-black text-white tracking-[16px] text-center leading-tight">
              SGROUP
            </h1>
            <div className="mt-2 px-4 py-1 bg-black/15 rounded-full border border-white/[0.08] self-center mx-auto w-fit">
              <span className="text-[13px] font-bold text-white/95 tracking-[3px]">
                PHỤNG SỰ BẰNG CẢ TRÁI TIM
              </span>
            </div>

            <p className="text-base font-medium text-white/80 text-center leading-relaxed mt-10 mb-6 max-w-[360px]">
              Nền tảng quản trị doanh nghiệp toàn diện,<br />kiến tạo tương lai số hóa.
            </p>

            {/* Staggered trust tags */}
            <div className="flex flex-wrap justify-center gap-2.5 max-w-[360px]">
              {TRUST_TAGS.map((tag, i) => (
                <div key={tag}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-xl
                    bg-white/10 border border-white/20
                    sg-stagger-${i + 1}
                  `}
                >
                  <CheckCircle2 size={14} className="text-white/80" />
                  <span className="text-[13px] font-semibold text-white">{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom label */}
        <span className="absolute bottom-8 text-[11px] font-extrabold text-white/20 tracking-[6px]">
          ENTERPRISE RESOURCE PLANNING
        </span>
      </div>


      {/* ████ RIGHT — FORM PANEL ████ */}
      <div className={`
        flex-1 flex items-center justify-center px-6 py-10 relative z-10
        transition-all duration-700 delay-300
        ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
      `}>
        <div className="w-full max-w-[480px]">

          {/* Form Card */}
          <div className="bg-sg-card rounded-[28px] p-12 border border-sg-border backdrop-blur-2xl transition-colors duration-300"
            style={{ boxShadow: '0 25px 70px -10px rgba(0,0,0,0.05), 0 10px 30px -10px rgba(0,0,0,0.03)' }}>

            {/* Mobile logo (hidden on desktop) */}
            <div className="flex lg:hidden items-center gap-2.5 mb-8 pb-5 border-b border-sg-border">
              <img src={sgroupLogo} alt="SGROUP" className="w-8 h-8 object-contain" />
              <span className="text-xl font-black text-sg-red tracking-[3px]">SGROUP</span>
            </div>

            {/* Welcome */}
            <div className="mb-9">
              <h2 className="text-[28px] font-black text-sg-heading tracking-tight">
                Đăng nhập nền tảng
              </h2>
              <p className="text-[15px] font-medium text-sg-subtext mt-2">
                Truy cập hệ sinh thái quản trị SGROUP
              </p>
            </div>

            {/* EMAIL */}
            <div>
              <label htmlFor="login-email" className="block text-[13px] font-bold text-sg-heading mb-2.5 tracking-wide">
                Email
              </label>
              <div className={`
                flex items-center h-14 rounded-2xl border-[1.5px] pr-1.5 transition-all duration-300
                ${focusEmail
                  ? 'bg-transparent border-sg-red shadow-[0_0_0_4px_rgba(212,32,39,0.08),0_4px_12px_rgba(0,0,0,0.04)]'
                  : 'bg-sg-btn-bg border-sg-border'
                }
              `}>
                <div className={`
                  w-11 h-11 rounded-xl ml-1.5 flex items-center justify-center flex-shrink-0
                  transition-all duration-250
                  ${focusEmail ? 'bg-sg-red' : 'bg-transparent'}
                `}>
                  <Mail size={16} className={focusEmail ? 'text-white' : 'text-sg-muted'} />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusEmail(true)}
                  onBlur={() => setFocusEmail(false)}
                  onKeyDown={handleKeyDown}
                  placeholder="admin@sgroup.vn"
                  autoComplete="email"
                  className="flex-1 h-full px-3 text-[15px] font-medium text-sg-heading bg-transparent outline-none placeholder:text-sg-muted"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2.5">
                <label htmlFor="login-password" className="text-[13px] font-bold text-sg-heading tracking-wide">
                  Mật khẩu
                </label>
                <button type="button" className="text-[13px] font-semibold text-sg-red hover:underline cursor-pointer">
                  Quên mật khẩu?
                </button>
              </div>
              <div className={`
                flex items-center h-14 rounded-2xl border-[1.5px] pr-1.5 transition-all duration-300
                ${focusPw
                  ? 'bg-transparent border-sg-red shadow-[0_0_0_4px_rgba(212,32,39,0.08),0_4px_12px_rgba(0,0,0,0.04)]'
                  : 'bg-sg-btn-bg border-sg-border'
                }
              `}>
                <div className={`
                  w-11 h-11 rounded-xl ml-1.5 flex items-center justify-center flex-shrink-0
                  transition-all duration-250
                  ${focusPw ? 'bg-sg-red' : 'bg-transparent'}
                `}>
                  <Lock size={16} className={focusPw ? 'text-white' : 'text-sg-muted'} />
                </div>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  onFocus={() => setFocusPw(true)}
                  onBlur={() => setFocusPw(false)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="flex-1 h-full px-3 text-[15px] font-medium text-sg-heading bg-transparent outline-none placeholder:text-sg-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer hover:bg-sg-border transition-colors"
                >
                  {showPw
                    ? <EyeOff size={18} className="text-sg-muted" />
                    : <Eye size={18} className="text-sg-muted" />
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 px-3.5 py-3 rounded-xl bg-red-50 border border-red-200">
                <span className="text-sm font-semibold text-red-600">⚠ {error}</span>
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="button"
              onClick={doLogin}
              disabled={isLoading}
              className={`
                relative w-full mt-8 h-[58px] rounded-2xl cursor-pointer
                bg-gradient-to-r from-sg-red to-sg-red-dark
                flex items-center justify-center gap-3 border border-white/10
                transition-all duration-300
                hover:from-sg-red-light hover:to-sg-red hover:shadow-sg-brand hover:-translate-y-0.5
                active:translate-y-0 active:shadow-sg-md
                disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
              `}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-sg-spin" />
              ) : (
                <>
                  <span className="text-base font-extrabold text-white tracking-wide">Vào hệ thống</span>
                  <div className="w-8 h-8 rounded-[10px] bg-white/20 flex items-center justify-center">
                    <ArrowRight size={18} className="text-white" strokeWidth={3} />
                  </div>
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs font-medium text-sg-muted text-center mt-8 leading-5">
            © 2026 Bản quyền thuộc<br />CÔNG TY TNHH BẤT ĐỘNG SẢN SGROUP.
          </p>
        </div>
      </div>
    </div>
  )
}

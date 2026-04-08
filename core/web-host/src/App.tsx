import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './features/auth/store/authStore'
import { LoginScreen } from './features/auth/screens/LoginScreen'

// Lazy-loaded module screens
const WorkspaceScreen = lazy(() => import('./features/workspace/screens/WorkspaceScreen'))
const AccessDeniedScreen = lazy(() => import('./system/navigation/AccessDeniedScreen'))
const HRShell = lazy(() => import('./features/hr/HRShell').then(m => ({ default: m.HRShell })))

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', gap: 16, background: 'var(--sg-bg)',
    }}>
      <div style={{
        width: 40, height: 40, border: '3px solid var(--sg-border)',
        borderTopColor: 'var(--sg-red)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ color: 'var(--sg-text-tertiary)', fontSize: 14, fontWeight: 500 }}>
        Đang tải module...
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const user = useAuthStore(s => s.user)

  // Restore session on mount
  React.useEffect(() => {
    useAuthStore.getState().restore()
  }, [])

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginScreen />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <WorkspaceScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/HRModule/*"
          element={
            <ProtectedRoute>
              <HRShell />
            </ProtectedRoute>
          }
        />
        <Route path="/access-denied" element={<AccessDeniedScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

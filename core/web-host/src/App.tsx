// ═══════════════════════════════════════════════════════════
// SGroup ERP — App Root
// Dynamic module routing with per-module error boundaries.
// Modules are registered in module-registry/registry.ts.
// ═══════════════════════════════════════════════════════════

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './features/auth/store/authStore';
import { LoginScreen } from './features/auth/screens/LoginScreen';
import { registeredModules } from './module-registry';
import { ModuleErrorBoundary } from './shell/ModuleErrorBoundary';
import { LoadingFallback } from './shell/LoadingFallback';

// Workspace (lazy — not a feature module, it's the hub)
const WorkspaceScreen = React.lazy(
  () => import('./features/workspace/screens/WorkspaceScreen'),
);
const AccessDeniedScreen = React.lazy(
  () => import('./system/navigation/AccessDeniedScreen'),
);

// ─── Route Guards ───────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleGate({
  requiredRoles,
  children,
}: {
  requiredRoles: string[];
  children: React.ReactNode;
}) {
  const user = useAuthStore(s => s.user);
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }
  return <>{children}</>;
}

// ─── Application Root ───────────────────────────────────────

export default function App() {
  const user = useAuthStore(s => s.user);

  // Restore session on mount
  React.useEffect(() => {
    useAuthStore.getState().restore();
  }, []);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginScreen />}
        />

        {/* Workspace Hub */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <WorkspaceScreen />
            </ProtectedRoute>
          }
        />

        {/* ── Dynamic Module Routes ── */}
        {registeredModules.map(mod => (
          <Route
            key={mod.id}
            path={`${mod.basePath}/*`}
            element={
              <ProtectedRoute>
                <RoleGate requiredRoles={mod.requiredRoles}>
                  <ModuleErrorBoundary
                    moduleId={mod.id}
                    moduleName={mod.name}
                  >
                    <Suspense fallback={<LoadingFallback />}>
                      <mod.Shell />
                    </Suspense>
                  </ModuleErrorBoundary>
                </RoleGate>
              </ProtectedRoute>
            }
          />
        ))}

        {/* System */}
        <Route path="/access-denied" element={<AccessDeniedScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

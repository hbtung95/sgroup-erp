// ═══════════════════════════════════════════════════════════
// LoadingFallback — Suspense boundary fallback
// Shown while a module's code is being lazy-loaded.
// ═══════════════════════════════════════════════════════════

export function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 16,
        background: 'var(--portal-bg)',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--color-sg-red, #D42027)',
          borderRadius: '50%',
          animation: 'sg-spin 0.8s linear infinite',
        }}
      />
      <span
        style={{
          color: 'var(--muted-color)',
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}
      >
        Đang tải module…
      </span>
    </div>
  );
}

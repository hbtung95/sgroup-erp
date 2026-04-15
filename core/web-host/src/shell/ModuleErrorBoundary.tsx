// ═══════════════════════════════════════════════════════════
// ModuleErrorFallback — Fault Isolation UI
// Shown when a module crashes. The rest of the app stays alive.
// ═══════════════════════════════════════════════════════════

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface Props {
  readonly moduleId: string;
  readonly moduleName: string;
  readonly children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Per-module Error Boundary.
 *
 * If module "Dự Án BĐS" throws, only that module's content is replaced
 * with this fallback. Users can still navigate to "Nhân Sự" or "Kinh Doanh".
 */
export class ModuleErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(
      `[Module:${this.props.moduleId}] Error caught by boundary:`,
      error,
      info,
    );
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-sg-portal-bg">
        <div className="max-w-lg w-full bg-sg-card border border-sg-border rounded-[28px] p-10 text-center shadow-sg-lg">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <AlertCircle size={36} className="text-red-500" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-sg-heading tracking-tight mb-3">
            Module &ldquo;{this.props.moduleName}&rdquo; gặp lỗi
          </h2>

          <p className="text-sm font-medium text-sg-subtext max-w-sm mx-auto mb-6 leading-relaxed">
            Hệ thống vẫn hoạt động bình thường. Bạn có thể thử lại
            chức năng này hoặc quay về trang chủ để sử dụng các module khác.
          </p>

          {/* Technical detail (collapsible for devs) */}
          <details className="mb-8 text-left">
            <summary className="text-[11px] font-black uppercase text-sg-muted cursor-pointer tracking-widest mb-2">
              Chi tiết lỗi (dành cho nhà phát triển)
            </summary>
            <pre className="text-[12px] font-mono text-red-500/80 bg-sg-btn-bg border border-sg-border p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">
              {this.state.error?.stack ?? this.state.error?.message ?? 'Unknown error'}
            </pre>
          </details>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-sg-red hover:bg-sg-red-light text-white font-extrabold text-sm rounded-xl transition-all shadow-sg-brand hover:-translate-y-0.5"
            >
              <RotateCcw size={16} strokeWidth={2.5} />
              Thử lại
            </button>
            <button
              onClick={this.handleGoHome}
              className="flex items-center gap-2 px-6 py-3 bg-sg-btn-bg hover:bg-sg-border border border-sg-border text-sg-heading font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5"
            >
              <Home size={16} />
              Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }
}

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class SalesErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Sales Module Error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[32px] border border-slate-200/80 dark:border-white/5 p-12 shadow-xl max-w-lg relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-500/10 rounded-full blur-[50px] pointer-events-none" />
            <div className="w-16 h-16 rounded-[20px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6 relative z-10">
              <AlertCircle size={32} className="text-rose-500" />
            </div>
            <h3 className="text-xl font-black text-sg-heading mb-2 relative z-10">Đã xảy ra lỗi</h3>
            <p className="text-sm font-medium text-sg-subtext mb-6 relative z-10 leading-relaxed">
              Module Kinh Doanh gặp sự cố không mong muốn. Vui lòng thử tải lại trang.
            </p>
            {this.state.error && (
              <pre className="text-[11px] font-mono text-rose-400 bg-sg-btn-bg border border-sg-border rounded-xl p-4 mb-6 text-left overflow-auto max-h-32 relative z-10">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-amber-500 text-white rounded-xl font-black text-sm shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all relative z-10"
            >
              <RefreshCw size={16} /> Thử lại
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class HRErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('HR Module Error Boundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Optional: could also reload or clear specific states
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 m-8 bg-red-500/10 border border-red-500/20 rounded-[28px] text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-sg-heading tracking-tight mb-3">Đã xảy ra lỗi hệ thống</h2>
          <p className="text-sm font-medium text-sg-subtext max-w-md mx-auto mb-8">
            Chúng tôi vô cùng xin lỗi, một lỗi không mong muốn đã xảy ra trong chức năng này. Nhóm kỹ thuật đã ghi nhận và đang tiến hành khắc phục.
          </p>
          
          <div className="bg-sg-card border border-sg-border p-4 rounded-xl w-full text-left overflow-x-auto mb-8 shadow-sm">
            <span className="text-[11px] font-black uppercase text-sg-subtext tracking-widest block mb-2">Chi tiết lỗi (Dành cho nhà phát triển):</span>
            <pre className="text-[12px] font-mono text-red-500/80 m-0">
               {this.state.error?.toString()}
            </pre>
          </div>

          <button 
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-sg-red hover:bg-sg-red-light text-white font-extrabold text-sm rounded-xl transition-all shadow-sg-brand transform hover:-translate-y-0.5"
          >
            <RotateCcw size={18} strokeWidth={2.5}/> THỬ LẠI CHỨC NĂNG NÀY
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

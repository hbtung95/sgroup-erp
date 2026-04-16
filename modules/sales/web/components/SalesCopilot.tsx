import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, Bot, User } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// SALES COPILOT — AI Assistant Panel (Cmd+J)
// ═══════════════════════════════════════════════════════════

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  'Tổng doanh số tháng này?',
  'So sánh Plan vs Actual Q1',
  'Top 5 Sales có GMV cao nhất',
  'Tỷ lệ chuyển đổi theo team',
  'Dự án nào đang bán chạy?',
];

export function SalesCopilot({ isOpen, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([{
    id: '0',
    role: 'assistant',
    content: 'Xin chào! Tôi là Sales Copilot, trợ lý AI của phân hệ Kinh Doanh. Tôi có thể giúp bạn phân tích doanh số, tra cứu khách hàng, và đề xuất chiến lược kinh doanh. Hãy hỏi tôi bất cứ điều gì!',
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Simulate AI response (Phase 2: connect to real LLM)
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateResponse(trimmed),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, response]);
      setIsThinking(false);
    }, 800 + Math.random() * 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-6 bottom-6 z-[9998] w-[420px] h-[600px] bg-white dark:bg-[#0d0d0d]/95 backdrop-blur-3xl rounded-[24px] border border-slate-200 dark:border-sg-border shadow-[0_32px_64px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-sg-border/60 bg-linear-to-r from-emerald-500/5 to-amber-500/5">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-amber-500 flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
          <Sparkles size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-[14px] font-black text-sg-heading">Sales Copilot</h3>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online • AI Ready</span>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-sg-btn-bg border border-sg-border flex items-center justify-center hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors">
          <X size={14} className="text-sg-muted" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
              msg.role === 'assistant'
                ? 'bg-linear-to-br from-emerald-500/20 to-amber-500/20 border border-emerald-500/30'
                : 'bg-sg-btn-bg border border-sg-border'
            }`}>
              {msg.role === 'assistant' ? <Bot size={14} className="text-emerald-500" /> : <User size={14} className="text-sg-muted" />}
            </div>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-sg-card/80 border border-sg-border text-sg-heading font-medium'
                : 'bg-emerald-500 text-white font-semibold'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500/20 to-amber-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Bot size={14} className="text-emerald-500" />
            </div>
            <div className="bg-sg-card/80 border border-sg-border rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.slice(0, 3).map(s => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="px-3 py-1.5 bg-sg-btn-bg border border-sg-border rounded-lg text-[11px] font-bold text-sg-muted hover:text-emerald-500 hover:border-emerald-500/30 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-100 dark:border-sg-border/60">
        <div className="flex items-center gap-2 bg-sg-btn-bg border border-sg-border rounded-xl px-4 py-2 focus-within:border-emerald-500/40 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Hỏi Sales Copilot..."
            className="flex-1 bg-transparent text-[13px] font-semibold text-sg-heading placeholder:text-sg-muted outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isThinking}
            className="w-8 h-8 rounded-lg bg-linear-to-r from-emerald-500 to-amber-500 flex items-center justify-center disabled:opacity-30 hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Temporary response generator (Phase 2: replace with real LLM)
function generateResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('doanh số') || q.includes('revenue'))
    return 'Tháng này, tổng doanh số GMV đạt 45.2 tỷ VNĐ (đạt 82% target). Doanh thu hoa hồng thực thu: 2.26 tỷ VNĐ. Team Alpha đang dẫn đầu với 18.5 tỷ GMV. Bạn muốn xem chi tiết theo team hay theo dự án?';
  if (q.includes('plan') || q.includes('actual') || q.includes('kế hoạch'))
    return 'Q1/2026: Plan 125 tỷ GMV vs Actual 98.5 tỷ (đạt 78.8%). Gap chủ yếu từ Team Gamma (-12 tỷ) do 2 nhân sự nghỉ T2. Đề xuất: Tăng cường tuyển dụng + đẩy mạnh dự án The Emerald Q2.';
  if (q.includes('top') || q.includes('xếp hạng'))
    return '🏆 Top 5 Sales by GMV tháng 4:\n1. Nguyễn Văn A — 5.2 tỷ (4 deals)\n2. Trần Thị B — 4.8 tỷ (3 deals)\n3. Lê Văn C — 3.9 tỷ (3 deals)\n4. Phạm Thị D — 3.5 tỷ (2 deals)\n5. Hoàng Văn E — 3.1 tỷ (2 deals)';
  if (q.includes('chuyển đổi') || q.includes('conversion'))
    return 'Tỷ lệ chuyển đổi trung bình: 12.3% (Lead → Deal). Theo team:\n• Alpha: 15.2% ⬆\n• Beta: 11.8% ➡\n• Gamma: 9.1% ⬇\nGamma cần cải thiện quy trình follow-up (trung bình 4.5 ngày vs target 2 ngày).';
  if (q.includes('dự án') || q.includes('project'))
    return 'Dự án đang bán chạy:\n1. The Emerald — 65% inventory sold (còn 42 căn)\n2. Marina Bay — 48% sold (còn 156 căn)\n3. Golden Park — 38% sold (còn 89 căn)\nThe Emerald có tốc độ bán nhanh nhất: 12 deals/tháng.';
  return 'Tôi đã ghi nhận câu hỏi của bạn. Hiện tại tôi đang trong giai đoạn học hỏi dữ liệu từ hệ thống. Trong phiên bản tiếp theo, tôi sẽ có thể truy vấn trực tiếp database để trả lời chính xác. Hãy thử hỏi về doanh số, xếp hạng, tỷ lệ chuyển đổi, hoặc hiệu suất dự án!';
}

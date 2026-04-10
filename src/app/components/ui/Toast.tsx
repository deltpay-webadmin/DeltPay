import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, description?: string) => {
    const id = Date.now().toString() + Math.random();
    setToasts(prev => [...prev, { id, type, title, description }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

export function ToastContainer({ toasts, onRemove }: { toasts: ToastMessage[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 360 }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
  const iconColor = toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#EF4444' : '#4945FF';

  return (
    <div
      className="pointer-events-auto bg-white rounded-xl border border-[#E8E8E8] px-4 py-3 flex items-start gap-3 animate-[slideUp_0.25s_ease-out]"
      style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: iconColor }} />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-[#111]" style={{ fontWeight: 600 }}>{toast.title}</div>
        {toast.description && <p className="text-xs text-[#999] mt-0.5">{toast.description}</p>}
      </div>
      <button onClick={() => onRemove(toast.id)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#F5F5F5] flex-shrink-0">
        <X className="w-3.5 h-3.5 text-[#999]" />
      </button>
    </div>
  );
}
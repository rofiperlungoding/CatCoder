import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, X, Zap } from 'lucide-react';
import { useUIStore } from '../../stores';
import type { ToastType } from '../../stores';

const ToastItem: React.FC<{
    id: string;
    type: ToastType;
    message: string;
    onClose: (id: string) => void;
}> = ({ id, type, message, onClose }) => {

    // Auto-dismiss handled in store, but we can double check or animate here

    const styles = {
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        error: 'bg-rose-50 border-rose-200 text-rose-800',
        info: 'bg-slate-50 border-slate-200 text-slate-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        xp: 'bg-indigo-50 border-indigo-200 text-indigo-800 shadow-indigo-100'
    };

    const icons = {
        success: <CheckCircle size={18} className="text-emerald-600" />,
        error: <AlertCircle size={18} className="text-rose-600" />,
        info: <Info size={18} className="text-slate-600" />,
        warning: <AlertCircle size={18} className="text-amber-600" />,
        xp: <Zap size={18} className="text-indigo-600 fill-indigo-200" />
    };

    return (
        <div className={`
            pointer-events-auto flex items-center gap-3 w-full max-w-sm px-4 py-3 rounded-xl border shadow-lg 
            transform transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in
            ${styles[type]}
        `}>
            {icons[type]}
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
            >
                <X size={14} className="opacity-50" />
            </button>
        </div>
    );
};

export const Toaster: React.FC = () => {
    const { toasts, removeToast } = useUIStore();

    return createPortal(
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none p-4">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    {...toast}
                    onClose={removeToast}
                />
            ))}
        </div>,
        document.body
    );
};

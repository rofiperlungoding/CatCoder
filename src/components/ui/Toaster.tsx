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
        success: 'bg-white border-gray-200 text-primary', // Minimalist success
        error: 'bg-red-50 border-red-100 text-red-600',
        info: 'bg-white border-gray-200 text-muted-foreground',
        warning: 'bg-amber-50 border-amber-100 text-amber-600',
        xp: 'bg-white border-lime-200 text-primary shadow-lime-100' // Custom XP style
    };

    const icons = {
        success: <CheckCircle size={18} className="text-lime-500" />,
        error: <AlertCircle size={18} className="text-red-500" />,
        info: <Info size={18} className="text-gray-400" />,
        warning: <AlertCircle size={18} className="text-amber-500" />,
        xp: <Zap size={18} className="text-lime-500 fill-lime-200" />
    };

    return (
        <div className={`
            pointer-events-auto flex items-center gap-3 w-full max-w-sm px-6 py-4 rounded-full border shadow-xl shadow-black/5
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

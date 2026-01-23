import React, { useEffect } from 'react';
import { Bell, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'error';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    // Definir estilos según el tipo
    let bgClass = 'bg-[#ccff00] text-black border-black/10';
    let Icon = Bell;

    if (type === 'error') {
        bgClass = 'bg-red-500 text-white border-red-600/20';
        Icon = XCircle;
    } else if (type === 'success') {
        bgClass = 'bg-green-500 text-white border-green-600/20';
        Icon = CheckCircle;
    } else if (type === 'info') {
        Icon = AlertCircle;
    }

    return (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 ${bgClass} px-6 py-3 rounded-full shadow-2xl z-[100] animate-slide-up font-bold flex items-center gap-3 border min-w-[300px] justify-center text-sm`}>
            <Icon className="w-5 h-5 shrink-0" />
            <span>{message}</span>
        </div>
    );
};

export default Toast;
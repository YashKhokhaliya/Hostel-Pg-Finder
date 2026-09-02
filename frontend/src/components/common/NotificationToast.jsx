import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NotificationToast = () => {
  const { notification } = useAuth();

  if (!notification) return null;

  const { message, type } = notification;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-rose-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-indigo-400" />,
  };

  const bgStyles = {
    success: 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200',
    error: 'border-rose-500/30 bg-rose-950/80 text-rose-200',
    warning: 'border-amber-500/30 bg-amber-950/80 text-amber-200',
    info: 'border-indigo-500/30 bg-indigo-950/80 text-indigo-200',
  };

  return (
    <div className="fixed top-5 right-5 z-50 animate-fade-in max-w-md">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl ${bgStyles[type] || bgStyles.info}`}>
        {icons[type] || icons.info}
        <p className="text-sm font-medium leading-snug">{message}</p>
      </div>
    </div>
  );
};

export default NotificationToast;

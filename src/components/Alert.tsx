import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success' | 'info';
  title: string;
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, title, message, onClose }) => {
  const bgColor = {
    error: 'bg-red-50 border-red-200',
    success: 'bg-green-50 border-green-200',
    info: 'bg-blue-50 border-blue-200',
  }[type];

  const textColor = {
    error: 'text-red-800',
    success: 'text-green-800',
    info: 'text-blue-800',
  }[type];

  const Icon = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info,
  }[type];

  return (
    <div className={`rounded-lg border p-4 ${bgColor}`}>
      <div className="flex gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${textColor}`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${textColor}`}>{title}</h3>
          <p className={`text-sm mt-1 ${textColor}`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`font-semibold ${textColor} hover:opacity-75 transition-opacity`}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

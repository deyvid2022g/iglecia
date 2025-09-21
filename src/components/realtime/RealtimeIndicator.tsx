import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface RealtimeIndicatorProps {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  className?: string;
  showText?: boolean;
}

const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({ 
  status, 
  className = '', 
  showText = false 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          text: 'Conectado',
          pulse: false
        };
      case 'connecting':
        return {
          icon: Wifi,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          text: 'Conectando...',
          pulse: true
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          text: 'Error de conexión',
          pulse: false
        };
      case 'disconnected':
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          text: 'Desconectado',
          pulse: false
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`
        relative p-1.5 rounded-full ${config.bgColor}
        ${config.pulse ? 'animate-pulse' : ''}
      `}>
        <Icon className={`w-4 h-4 ${config.color}`} />
        {status === 'connected' && (
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-ping" />
        )}
      </div>
      {showText && (
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
      )}
    </div>
  );
};

export default RealtimeIndicator;
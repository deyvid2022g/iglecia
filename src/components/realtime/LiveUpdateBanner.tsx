import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Bell } from 'lucide-react';

interface LiveUpdate {
  id: string;
  type: 'blog' | 'event' | 'sermon';
  action: 'created' | 'updated' | 'deleted';
  title: string;
  timestamp: Date;
}

interface LiveUpdateBannerProps {
  updates: LiveUpdate[];
  onDismiss: (id: string) => void;
  onRefresh?: () => void;
  className?: string;
}

const LiveUpdateBanner: React.FC<LiveUpdateBannerProps> = ({
  updates,
  onDismiss,
  onRefresh,
  className = ''
}) => {
  const [visibleUpdates, setVisibleUpdates] = useState<LiveUpdate[]>([]);

  useEffect(() => {
    // Show new updates with a slight delay for better UX
    const timer = setTimeout(() => {
      setVisibleUpdates(updates);
    }, 100);

    return () => clearTimeout(timer);
  }, [updates]);

  const getUpdateMessage = (update: LiveUpdate) => {
    const typeLabels = {
      blog: 'artículo',
      event: 'evento',
      sermon: 'sermón'
    };

    const actionLabels = {
      created: 'creado',
      updated: 'actualizado',
      deleted: 'eliminado'
    };

    return `Nuevo ${typeLabels[update.type]} ${actionLabels[update.action]}: ${update.title}`;
  };

  const getUpdateIcon = (update: LiveUpdate) => {
    switch (update.action) {
      case 'created':
        return '✨';
      case 'updated':
        return '📝';
      case 'deleted':
        return '🗑️';
      default:
        return '📢';
    }
  };

  const getUpdateColor = (update: LiveUpdate) => {
    switch (update.action) {
      case 'created':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'updated':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'deleted':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (visibleUpdates.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {visibleUpdates.map((update) => (
        <div
          key={update.id}
          className={`
            flex items-center justify-between p-3 rounded-lg border
            ${getUpdateColor(update)}
            animate-in slide-in-from-top-2 duration-300
          `}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{getUpdateIcon(update)}</span>
            <div>
              <p className="text-sm font-medium">
                {getUpdateMessage(update)}
              </p>
              <p className="text-xs opacity-75">
                {update.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-1 rounded-full hover:bg-white/50 transition-colors"
                title="Actualizar contenido"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onDismiss(update.id)}
              className="p-1 rounded-full hover:bg-white/50 transition-colors"
              title="Descartar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Hook para manejar las actualizaciones en vivo
export const useLiveUpdates = () => {
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);

  const addUpdate = (update: Omit<LiveUpdate, 'id' | 'timestamp'>) => {
    const newUpdate: LiveUpdate = {
      ...update,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setUpdates(prev => [newUpdate, ...prev.slice(0, 4)]); // Keep only last 5 updates

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      dismissUpdate(newUpdate.id);
    }, 10000);
  };

  const dismissUpdate = (id: string) => {
    setUpdates(prev => prev.filter(update => update.id !== id));
  };

  const clearAllUpdates = () => {
    setUpdates([]);
  };

  return {
    updates,
    addUpdate,
    dismissUpdate,
    clearAllUpdates
  };
};

export default LiveUpdateBanner;
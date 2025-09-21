import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useMultipleRealtimeSubscriptions, useRealtimeStatus } from '../hooks/useRealtimeSubscriptions';
import { BlogPost } from '../services/blogService';
import { Event } from '../services/eventService';
import { Sermon } from '../services/sermonService';

interface RealtimeContextType {
  connectionStatus: 'CONNECTING' | 'OPEN' | 'CLOSED';
  isConnected: boolean;
  lastUpdate: Date | null;
  updates: {
    blogs: number;
    events: number;
    sermons: number;
  };
  reconnect: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

interface RealtimeProviderProps {
  children: ReactNode;
  onBlogUpdate?: (payload: any) => void;
  onEventUpdate?: (payload: any) => void;
  onSermonUpdate?: (payload: any) => void;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({
  children,
  onBlogUpdate,
  onEventUpdate,
  onSermonUpdate
}) => {
  const connectionStatus = useRealtimeStatus();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updates, setUpdates] = useState({
    blogs: 0,
    events: 0,
    sermons: 0
  });

  const handleBlogChange = (payload: any) => {
    console.log('Blog realtime update:', payload);
    setLastUpdate(new Date());
    setUpdates(prev => ({ ...prev, blogs: prev.blogs + 1 }));
    onBlogUpdate?.(payload);
  };

  const handleEventChange = (payload: any) => {
    console.log('Event realtime update:', payload);
    setLastUpdate(new Date());
    setUpdates(prev => ({ ...prev, events: prev.events + 1 }));
    onEventUpdate?.(payload);
  };

  const handleSermonChange = (payload: any) => {
    console.log('Sermon realtime update:', payload);
    setLastUpdate(new Date());
    setUpdates(prev => ({ ...prev, sermons: prev.sermons + 1 }));
    onSermonUpdate?.(payload);
  };

  // Subscribe to all relevant tables
  const { subscribeAll, unsubscribeAll } = useMultipleRealtimeSubscriptions([
    // Blog subscriptions
    {
      table: 'blog_posts',
      onChange: handleBlogChange
    },
    {
      table: 'blog_categories',
      onChange: handleBlogChange
    },
    {
      table: 'blog_interactions',
      onChange: handleBlogChange
    },
    // Event subscriptions
    {
      table: 'events',
      onChange: handleEventChange
    },
    {
      table: 'event_categories',
      onChange: handleEventChange
    },
    {
      table: 'event_interactions',
      onChange: handleEventChange
    },
    // Sermon subscriptions
    {
      table: 'sermons',
      onChange: handleSermonChange
    },
    {
      table: 'sermon_categories',
      onChange: handleSermonChange
    },
    {
      table: 'sermon_interactions',
      onChange: handleSermonChange
    }
  ]);

  const reconnect = () => {
    console.log('Reconnecting to realtime...');
    unsubscribeAll();
    setTimeout(() => {
      subscribeAll();
    }, 1000);
  };

  const isConnected = connectionStatus === 'OPEN';

  // Auto-reconnect on connection loss
  useEffect(() => {
    if (connectionStatus === 'CLOSED') {
      console.log('Connection lost, attempting to reconnect...');
      const timeout = setTimeout(reconnect, 3000);
      return () => clearTimeout(timeout);
    }
  }, [connectionStatus]);

  const contextValue: RealtimeContextType = {
    connectionStatus,
    isConnected,
    lastUpdate,
    updates,
    reconnect
  };

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

// Connection status indicator component
export const RealtimeStatus: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { connectionStatus, isConnected, lastUpdate } = useRealtime();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'OPEN':
        return 'bg-green-500';
      case 'CONNECTING':
        return 'bg-yellow-500';
      case 'CLOSED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'OPEN':
        return 'Conectado';
      case 'CONNECTING':
        return 'Conectando...';
      case 'CLOSED':
        return 'Desconectado';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-gray-600">{getStatusText()}</span>
      {lastUpdate && isConnected && (
        <span className="text-xs text-gray-400">
          Última actualización: {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default RealtimeProvider;
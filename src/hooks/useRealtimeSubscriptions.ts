import { useEffect, useRef, useCallback, useState } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type DatabaseEvent = 'INSERT' | 'UPDATE' | 'DELETE';
export type TableName = 'blog_posts' | 'blog_categories' | 'blog_interactions' | 
                       'events' | 'event_categories' | 'event_interactions' |
                       'sermons' | 'sermon_categories' | 'sermon_interactions';

interface SubscriptionConfig {
  table: TableName;
  event?: DatabaseEvent | DatabaseEvent[];
  filter?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<any>) => void;
}

export const useRealtimeSubscription = (config: SubscriptionConfig) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { table, event, filter, onInsert, onUpdate, onDelete, onChange } = config;

  const subscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channelName = `${table}_changes_${Date.now()}`;
    const channel = supabase.channel(channelName);

    // Determine which events to listen to
    const events = event ? (Array.isArray(event) ? event : [event]) : ['INSERT', 'UPDATE', 'DELETE'];

    events.forEach((eventType) => {
      channel.on(
'system',
        {
          event: eventType,
          schema: 'public',
          table: table,
          ...(filter && { filter })
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log(`Realtime ${eventType} on ${table}:`, payload);

          // Call specific event handlers
          switch (eventType) {
            case 'INSERT':
              onInsert?.(payload);
              break;
            case 'UPDATE':
              onUpdate?.(payload);
              break;
            case 'DELETE':
              onDelete?.(payload);
              break;
          }

          // Call general change handler
          onChange?.(payload);
        }
      );
    });

    channel.subscribe((status) => {
      console.log(`Subscription status for ${table}:`, status);
    });

    channelRef.current = channel;
  }, [table, event, filter, onInsert, onUpdate, onDelete, onChange]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    subscribe();
    return unsubscribe;
  }, [subscribe, unsubscribe]);

  return { subscribe, unsubscribe };
};

// Multiple subscriptions hook
export const useMultipleRealtimeSubscriptions = (configs: SubscriptionConfig[]) => {
  const channelsRef = useRef<RealtimeChannel[]>([]);

  const subscribeAll = useCallback(() => {
    // Unsubscribe from existing channels
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];

    // Subscribe to new channels
    configs.forEach((config, index) => {
      const { table, event, filter, onInsert, onUpdate, onDelete, onChange } = config;
      const channelName = `${table}_changes_${index}_${Date.now()}`;
      const channel = supabase.channel(channelName);

      const events = event ? (Array.isArray(event) ? event : [event]) : ['INSERT', 'UPDATE', 'DELETE'];

      events.forEach((eventType) => {
        channel.on(
          'system',
          {
            event: eventType,
            schema: 'public',
            table: table,
            ...(filter && { filter })
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            console.log(`Realtime ${eventType} on ${table}:`, payload);

            switch (eventType) {
              case 'INSERT':
                onInsert?.(payload);
                break;
              case 'UPDATE':
                onUpdate?.(payload);
                break;
              case 'DELETE':
                onDelete?.(payload);
                break;
            }

            onChange?.(payload);
          }
        );
      });

      channel.subscribe((status) => {
        console.log(`Subscription status for ${table}:`, status);
      });

      channelsRef.current.push(channel);
    });
  }, [configs]);

  const unsubscribeAll = useCallback(() => {
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];
  }, []);

  useEffect(() => {
    subscribeAll();
    return unsubscribeAll;
  }, [subscribeAll, unsubscribeAll]);

  return { subscribeAll, unsubscribeAll };
};

// Presence hook for real-time user presence
interface PresenceState {
  user_id: string;
  username: string;
  online_at: string;
  [key: string]: any;
}

export const usePresence = (channelName: string, userState: PresenceState) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceState = useRef<{ [key: string]: any[] }>({});

  const subscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userState.user_id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        presenceState.current = newState;
        console.log('Presence sync:', newState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userState);
        }
      });

    channelRef.current = channel;
  }, [channelName, userState]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  const updatePresence = useCallback(async (newState: Partial<PresenceState>) => {
    if (channelRef.current) {
      await channelRef.current.track({ ...userState, ...newState });
    }
  }, [userState]);

  const getPresenceState = useCallback(() => {
    return presenceState.current;
  }, []);

  useEffect(() => {
    subscribe();
    return unsubscribe;
  }, [subscribe, unsubscribe]);

  return { 
    subscribe, 
    unsubscribe, 
    updatePresence, 
    getPresenceState,
    presenceState: presenceState.current 
  };
};

// Broadcast hook for real-time messaging
export const useBroadcast = (channelName: string) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  const subscribe = useCallback((
    eventName: string, 
    callback: (payload: any) => void
  ) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel(channelName);

    channel
      .on('broadcast', { event: eventName }, callback)
      .subscribe();

    channelRef.current = channel;
  }, [channelName]);

  const broadcast = useCallback(async (eventName: string, payload: any) => {
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: eventName,
        payload
      });
    }
  }, []);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    return unsubscribe;
  }, [unsubscribe]);

  return { subscribe, broadcast, unsubscribe };
};

// Connection status hook
export const useRealtimeStatus = () => {
  const [status, setStatus] = useState<'CONNECTING' | 'OPEN' | 'CLOSED'>('CONNECTING');

  useEffect(() => {
    const handleStatusChange = (status: string) => {
      setStatus(status as 'CONNECTING' | 'OPEN' | 'CLOSED');
    };

    // Listen to connection status changes using channel events
    const channel = supabase.channel('status-channel');
    
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        handleStatusChange('OPEN');
      } else if (status === 'CLOSED') {
        handleStatusChange('CLOSED');
      } else {
        handleStatusChange('CONNECTING');
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return status;
};

export default useRealtimeSubscription;
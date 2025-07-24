// src/hooks/useRealtimeSync.ts
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface RealtimeConfig {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onUpdate?: () => void;
  enableToast?: boolean;
}

export function useRealtimeSync(configs: RealtimeConfig[]) {
  const { supabase } = useAuth();

  useEffect(() => {
    if (!supabase) return;

    const channels: any[] = [];

    configs.forEach((config, index) => {
      const channelName = `realtime-${config.table}-${index}`;
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes' as any,
          {
            event: config.event || '*',
            schema: 'public',
            table: config.table
          },
          () => {
            console.log(`🔄 Real-time update on ${config.table}`);
            
            // Show toast notification for updates
            if (config.enableToast) {
              toast.info('Data berubah', {
                description: `Tabel: ${config.table} telah diperbarui`,
                duration: 3000,
              });
            }

            // Call custom update handler
            if (config.onUpdate) {
              config.onUpdate();
            }
          }
        )
        .subscribe();

      channels.push(channel);
    });

    // Cleanup function
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [supabase, configs]);
}

// Hook untuk monitoring data real-time dengan SWR integration
export function useMonitoringRealtime(mutateFunction?: () => void) {
  return useRealtimeSync([
    {
      table: 'ksa_amatan',
      event: '*',
      onUpdate: mutateFunction,
      enableToast: true
    },
    {
      table: 'ksa_amatan_jagung', 
      event: '*',
      onUpdate: mutateFunction,
      enableToast: true
    },
    {
      table: 'ubinan_raw',
      event: '*', 
      onUpdate: mutateFunction,
      enableToast: true
    },
    {
      table: 'skgb_pengeringan',
      event: '*',
      onUpdate: mutateFunction,
      enableToast: true
    },
    {
      table: 'skgb_penggilingan',
      event: '*',
      onUpdate: mutateFunction,
      enableToast: true
    }
  ]);
}
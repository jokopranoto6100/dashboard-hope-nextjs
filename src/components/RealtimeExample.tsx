// src/components/RealtimeExample.tsx
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMonitoringRealtime } from '@/hooks/useRealtimeSync';
import { Activity, Wifi, WifiOff } from 'lucide-react';

interface RealtimeStatus {
  isConnected: boolean;
  lastUpdate: Date | null;
  updateCount: number;
}

export default function RealtimeExample() {
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: true,
    lastUpdate: null,
    updateCount: 0
  });

  // Setup real-time monitoring
  useMonitoringRealtime(() => {
    setStatus(prev => ({
      ...prev,
      lastUpdate: new Date(),
      updateCount: prev.updateCount + 1
    }));
  });

  // Simulate connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({ ...prev, isConnected: navigator.onLine }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-emerald-600" />
          Real-time Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection:</span>
          <Badge 
            variant={status.isConnected ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            {status.isConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {status.isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Updates received:</span>
          <Badge variant="outline">
            {status.updateCount}
          </Badge>
        </div>
        
        {status.lastUpdate && (
          <div className="text-xs text-muted-foreground">
            Last update: {status.lastUpdate.toLocaleTimeString()}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          💡 Aplikasi ini akan secara otomatis menampilkan notifikasi dan memperbarui data ketika ada perubahan di backend.
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClientComponentSupabaseClient } from '@/lib/supabase';

interface UserKpiPin {
  kpi_id: string;
  pin_order: number;
}

interface TogglePinResult {
  success: boolean;
  action: 'pinned' | 'unpinned' | 'limit_reached';
  kpi_id: string;
  pin_order?: number;
  message: string;
}

export function useKpiPins() {
  const { userData } = useAuth();
  const [pins, setPins] = useState<UserKpiPin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentSupabaseClient();

  // Fetch user pins
  const fetchPins = useCallback(async () => {
    if (!userData?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setError(null);
      const { data, error } = await supabase
        .rpc('get_user_kpi_pins', { p_user_id: userData.id });
      
      if (error) throw error;
      
      setPins(data || []);
    } catch (error) {
      console.error('Error fetching pins:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch pins');
    } finally {
      setIsLoading(false);
    }
  }, [userData?.id, supabase]);

  // Toggle pin with optimistic updates
  const togglePin = useCallback(async (kpiId: string): Promise<TogglePinResult> => {
    if (!userData?.id) {
      throw new Error('User not authenticated');
    }
    
    // Optimistic update
    const wasOrPinned = pins.some(pin => pin.kpi_id === kpiId);
    
    if (!wasOrPinned) {
      // Check limit before optimistic update
      if (pins.length >= 3) {
        return {
          success: false,
          action: 'limit_reached',
          kpi_id: kpiId,
          message: 'Maksimal 3 KPI yang bisa di-pin'
        };
      }
      
      // Optimistically add pin
      const newPin: UserKpiPin = {
        kpi_id: kpiId,
        pin_order: pins.length + 1
      };
      setPins(prev => [...prev, newPin]);
    } else {
      // Optimistically remove pin
      setPins(prev => prev.filter(pin => pin.kpi_id !== kpiId));
    }
    
    try {
      const { data, error } = await supabase
        .rpc('toggle_kpi_pin', { 
          p_user_id: userData.id, 
          p_kpi_id: kpiId 
        });
      
      if (error) throw error;
      
      // Refresh pins to get correct order
      await fetchPins();
      
      return data as TogglePinResult;
    } catch (error) {
      console.error('Error toggling pin:', error);
      
      // Revert optimistic update on error
      if (!wasOrPinned) {
        setPins(prev => prev.filter(pin => pin.kpi_id !== kpiId));
      } else {
        await fetchPins(); // Refresh to restore correct state
      }
      
      throw error;
    }
  }, [userData?.id, pins, supabase, fetchPins]);

  // Check if KPI is pinned
  const isPinned = useCallback((kpiId: string): boolean => {
    return pins.some(pin => pin.kpi_id === kpiId);
  }, [pins]);

  // Get pin order for a KPI
  const getPinOrder = useCallback((kpiId: string): number | null => {
    const pin = pins.find(pin => pin.kpi_id === kpiId);
    return pin ? pin.pin_order : null;
  }, [pins]);

  // Get total pinned count
  const pinnedCount = pins.length;

  // Check if can pin more
  const canPinMore = pinnedCount < 3;

  // Initial fetch
  useEffect(() => {
    fetchPins();
  }, [fetchPins]);

  return {
    pins,
    isLoading,
    error,
    togglePin,
    isPinned,
    getPinOrder,
    pinnedCount,
    canPinMore,
    refetch: fetchPins
  };
}

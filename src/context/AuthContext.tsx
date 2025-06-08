// Lokasi: src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import type { User as SupabaseUser, Session, SupabaseClient } from '@supabase/supabase-js'; // Import SupabaseClient
import type { UserData } from '@/lib/sidebar-data';

interface AuthContextType {
  supabase: SupabaseClient; // <-- BARU: Bagikan instance Supabase
  session: Session | null;
  user: SupabaseUser | null;
  userData: UserData | null;
  userRole: string | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Instance Supabase hanya dibuat SATU KALI di sini
  const [supabase] = useState(() => createClientComponentSupabaseClient());
  
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setDataFromSession = (currentSession: Session | null) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const metadata = currentUser.user_metadata;
        const displayName = metadata?.username || currentUser.email?.split('@')[0] || 'Pengguna';
        setUserData({
          name: displayName,
          email: currentUser.email || '',
          avatar: metadata?.avatar_url,
        });
        setUserRole(metadata?.role || null);
      } else {
        setUserData(null);
        setUserRole(null);
      }
    };

    const getInitialSession = async () => {
      setIsLoading(true);
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("AuthContext: Error getting initial session:", error.message);
      }
      setDataFromSession(initialSession);
      setIsLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        console.log("AuthContext: Auth state changed, new session:", newSession ? "exists" : "null");
        setDataFromSession(newSession);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]); // Dependency disederhanakan

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    // Bagikan instance supabase ke semua komponen anak
    <AuthContext.Provider value={{ supabase, session, user, userData, userRole, isLoading, logout }}>
      {!isLoading ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
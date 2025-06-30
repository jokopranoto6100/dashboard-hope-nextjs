// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import type { User as SupabaseUser, Session, SupabaseClient } from '@supabase/supabase-js';
import type { UserData } from '@/lib/sidebar-data';

interface AuthContextType {
  supabase: SupabaseClient;
  session: Session | null;
  user: SupabaseUser | null;
  userData: UserData | null;
  userRole: string | null;
  userSatkerId: string | null; // ✅ BARU: Ditambahkan untuk akses mudah
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [supabase] = useState(() => createClientComponentSupabaseClient());
  
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userSatkerId, setUserSatkerId] = useState<string | null>(null); // ✅ BARU: State untuk satker_id
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserSessionAndProfile = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      setSession(currentSession);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (profileData) {
          setUserData({
            id: profileData.id,
            fullname: profileData.full_name,
            username: profileData.username,
            email: currentUser.email || '',
            avatar: profileData.avatar_url || null,
            satker_id: profileData.satker_id || null,
          });
          setUserRole(profileData.role || 'viewer');
          setUserSatkerId(profileData.satker_id || null); // ✅ BARU: Set state satker_id
        } else {
            // Fallback jika profil tidak ada
            setUserData(null);
            setUserRole(null);
            setUserSatkerId(null);
        }
      } else {
        setUserData(null);
        setUserRole(null);
        setUserSatkerId(null);
      }
      setIsLoading(false);
    };

    fetchUserSessionAndProfile();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUserSessionAndProfile();
    });

    return () => { authListener?.subscription.unsubscribe(); };
  }, [supabase]);

  const logout = async () => { await supabase.auth.signOut(); };

  return (
    <AuthContext.Provider value={{ supabase, session, user, userData, userRole, userSatkerId, isLoading, logout }}>
      {!isLoading ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) { throw new Error('useAuth must be used within an AuthProvider'); }
  return context;
}
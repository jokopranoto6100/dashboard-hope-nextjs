// Lokasi: src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import type { User as SupabaseUser, Session, SupabaseClient } from '@supabase/supabase-js';
import type { UserData } from '@/lib/sidebar-data'; // Pastikan path ini benar

interface AuthContextType {
  supabase: SupabaseClient;
  session: Session | null;
  user: SupabaseUser | null;
  userData: UserData | null; // Tipe ini sudah diperbarui
  userRole: string | null;
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
  const [isLoading, setIsLoading] = useState(true);

  // PATCH: Keseluruhan logika di dalam useEffect dirombak total
  useEffect(() => {
    // Fungsi ini sekarang mengambil data auth DAN profil dari tabel users
    const fetchUserSessionAndProfile = async () => {
      // 1. Ambil sesi dari Supabase (berisi user dari tabel auth.users)
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("AuthContext: Error getting session:", sessionError.message);
        setIsLoading(false);
        return;
      }

      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      setSession(currentSession);

      // 2. Jika ada user, ambil profil lengkapnya dari tabel public.users
      if (currentUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('users') // Nama tabel profil Anda
          .select('*')   // Ambil semua kolom
          .eq('id', currentUser.id)
          .single(); // Ambil sebagai satu objek, bukan array

        if (profileError) {
          console.error("AuthContext: Gagal mengambil profil pengguna:", profileError.message);
          // Jika profil tidak ada, setidaknya tampilkan email
          setUserData({
            id: currentUser.id,
            fullname: currentUser.email?.split('@')[0] || 'Pengguna',
            username: 'N/A',
            email: currentUser.email || '',
            avatar: null,
            satker_id: null,
          });
          setUserRole(null);
        } else if (profileData) {
          // 3. Gabungkan data dan set state dari sumber kebenaran (public.users)
          setUserData({
            id: profileData.id,
            fullname: profileData.full_name,
            username: profileData.username,
            email: currentUser.email || '', // Email tetap dari auth
            avatar: profileData.avatar_url || null,
            satker_id: profileData.satker_id || null,
          });
          setUserRole(profileData.role || 'viewer');
        }
      } else {
        // Jika tidak ada user (logout), bersihkan semua state
        setUserData(null);
        setUserRole(null);
      }

      setIsLoading(false);
    };

    fetchUserSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        // Panggil ulang fungsi fetch utama saat auth state berubah (login/logout)
        // Ini memastikan data profil selalu yang terbaru
        console.log(`AuthContext: Auth event '${event}', refetching profile.`);
        fetchUserSessionAndProfile();
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
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
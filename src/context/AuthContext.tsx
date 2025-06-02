// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase'; //
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { UserData } from '@/lib/sidebar-data'; //

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  userData: UserData | null; // Untuk data yang disederhanakan (nama, email, avatar)
  userRole: string | null;   // Peran pengguna (misal: 'super_admin', 'viewer')
  isLoading: boolean;        // Status loading untuk sesi awal
  logout: () => Promise<void>; // Fungsi untuk logout
}

// Membuat context dengan nilai default undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const supabase = createClientComponentSupabaseClient(); //
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Mulai dengan true

  useEffect(() => {
    // Fungsi untuk mengambil dan mengatur data sesi dan pengguna
    const setDataFromSession = (currentSession: Session | null) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const metadata = currentUser.user_metadata;
        // Menggunakan username dari metadata jika ada, jika tidak, gunakan bagian email sebelum '@'
        const displayName = metadata?.username || currentUser.email?.split('@')[0] || 'Pengguna';
        setUserData({
          name: displayName,
          email: currentUser.email || '',
          avatar: metadata?.avatar_url, // Pastikan ini sesuai dengan field di metadata Anda
        });
        setUserRole(metadata?.role || null); // Ambil peran dari metadata
      } else {
        setUserData(null);
        setUserRole(null);
      }
    };

    // Mendapatkan sesi awal saat komponen dimuat
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

    // Listener untuk perubahan status autentikasi
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        console.log("AuthContext: Auth state changed, new session:", newSession ? "exists" : "null");
        setDataFromSession(newSession);
        // Tidak perlu setIsLoading(true/false) di sini karena getInitialSession sudah menanganinya,
        // dan perubahan sesi berikutnya biasanya cepat.
      }
    );

    // Membersihkan listener saat komponen di-unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, supabase.auth]); // Tambahkan supabase.auth sebagai dependency

  const logout = async () => {
    setIsLoading(true); // Opsional: set loading true saat proses logout
    await supabase.auth.signOut();
    // State akan diupdate secara otomatis oleh onAuthStateChange listener,
    // yang kemudian akan mengatur isLoading menjadi false setelah sesi menjadi null.
  };

  return (
    <AuthContext.Provider value={{ session, user, userData, userRole, isLoading, logout }}>
      {!isLoading && children} {/* Opsional: Hanya render children jika loading selesai */}
      {/* Atau render children langsung jika Anda ingin menangani loading di komponen anak */}
      {/* {children} */}
    </AuthContext.Provider>
  );
}

// Custom hook untuk menggunakan AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
// src/hooks/useUserManagement.ts
'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ManagedUser } from '@/app/(dashboard)/pengguna/page';

export function useUserManagement(initialUsers: ManagedUser[]) {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(false);
  
  // Memoized statistics
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(user => user.is_active).length,
    inactive: users.filter(user => !user.is_active).length,
    superAdmins: users.filter(user => user.role === 'super_admin').length,
    viewers: users.filter(user => user.role === 'viewer').length,
  }), [users]);

  // Optimized user operations
  const updateUser = useCallback((userId: string, updates: Partial<ManagedUser>) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      )
    );
  }, []);

  const removeUser = useCallback((userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  }, []);

  const addUser = useCallback((newUser: ManagedUser) => {
    setUsers(prevUsers => [newUser, ...prevUsers]);
  }, []);

  const removeUsers = useCallback((userIds: string[]) => {
    setUsers(prevUsers => prevUsers.filter(user => !userIds.includes(user.id)));
  }, []);

  // Search functionality with debouncing
  const searchUsers = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return users;
    
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.email?.toLowerCase().includes(term) ||
      user.username?.toLowerCase().includes(term) ||
      user.full_name?.toLowerCase().includes(term) ||
      user.satker_name?.toLowerCase().includes(term)
    );
  }, [users]);

  return {
    users,
    setUsers,
    isLoading,
    setIsLoading,
    stats,
    updateUser,
    removeUser,
    addUser,
    removeUsers,
    searchUsers,
  };
}

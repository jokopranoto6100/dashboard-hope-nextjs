// src/app/(dashboard)/pengguna/user-stats-card.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, Shield, Eye } from 'lucide-react';

interface UserStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    superAdmins: number;
    viewers: number;
  };
}

export function UserStatsCard({ stats }: UserStatsProps) {
  const statItems = [
    {
      title: 'Total Pengguna',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      priority: 'high', // Prioritas tinggi untuk mobile
    },
    {
      title: 'Aktif',
      value: stats.active,
      icon: UserCheck,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      priority: 'high', // Prioritas tinggi untuk mobile
    },
    {
      title: 'Nonaktif',
      value: stats.inactive,
      icon: UserX,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      priority: 'high', // Prioritas tinggi untuk mobile
    },
    {
      title: 'Super Admin',
      value: stats.superAdmins,
      icon: Shield,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      priority: 'medium', // Hanya tampil di tablet+
    },
    {
      title: 'Viewer',
      value: stats.viewers,
      icon: Eye,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      priority: 'medium', // Hanya tampil di tablet+
    },
  ];

  // Card prioritas tinggi untuk mobile (3 card)
  const highPriorityItems = statItems.filter(item => item.priority === 'high');
  
  return (
    <div className="mb-6">
      {/* Mobile View - Hanya 3 card penting */}
      <div className="grid grid-cols-3 gap-3 md:hidden">
        {highPriorityItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-col items-center space-y-2 pb-2 p-3">
                <div className={`p-2 rounded-full ${item.bgColor}`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <CardTitle className="text-xs font-medium text-muted-foreground text-center leading-tight">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center p-3 pt-0">
                <div className="text-xl font-bold">{item.value}</div>
                <Badge variant="outline" className="text-xs mt-1">
                  {stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(0) : '0'}%
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop View - Semua 5 card */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${item.bgColor}`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <Badge variant="outline" className="text-xs mt-1">
                  {stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(0) : '0'}%
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

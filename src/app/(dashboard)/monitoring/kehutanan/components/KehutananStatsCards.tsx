// components/KehutananStatsCards.tsx
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

interface KehutananStatsCardsProps {
  statistics: {
    totalCompanies: number;
    activeCompanies: number;
    inactiveCompanies: number;
    statusCounts: Record<string, number>;
    kabupatenCounts: Record<string, number>;
  };
}

export const KehutananStatsCards = React.memo(({ statistics }: KehutananStatsCardsProps) => {
  const activePercentage = statistics.totalCompanies > 0 
    ? Math.round((statistics.activeCompanies / statistics.totalCompanies) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Perusahaan</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalCompanies}</div>
          <p className="text-xs text-muted-foreground">
            Terdaftar di sistem
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aktif Berproduksi</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{statistics.activeCompanies}</div>
          <p className="text-xs text-muted-foreground">
            {activePercentage}% dari total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tidak Aktif</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{statistics.inactiveCompanies}</div>
          <p className="text-xs text-muted-foreground">
            {100 - activePercentage}% dari total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kabupaten</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Object.keys(statistics.kabupatenCounts).length}</div>
          <p className="text-xs text-muted-foreground">
            Area cakupan
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

KehutananStatsCards.displayName = 'KehutananStatsCards';

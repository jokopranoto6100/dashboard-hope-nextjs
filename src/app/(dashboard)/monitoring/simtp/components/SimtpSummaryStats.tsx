// components/SimtpSummaryStats.tsx
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, Circle, TrendingUp } from 'lucide-react';
import { SimtpMonitoringData } from '../types';
import { kabMap } from '@/lib/satker-data';
import { CONSTANTS } from '../utils';

interface SimtpSummaryStatsProps {
  monitoringData: SimtpMonitoringData;
  selectedYear: number;
}

export const SimtpSummaryStats = React.memo(({ monitoringData, selectedYear }: SimtpSummaryStatsProps) => {
  const stats = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let totalUploaded = 0;
    let totalExpected = 0;
    let currentMonthUploaded = 0;
    let annualDataUploaded = 0;
    const totalAnnualExpected = kabMap.length * 3; // 3 jenis data tahunan per kabupaten
    
    kabMap.forEach(satker => {
      const satkerData = monitoringData[satker.value];
      
      if (satkerData) {
        // Count monthly uploads
        for (let month = 1; month <= CONSTANTS.MONTHS_IN_YEAR; month++) {
          if (selectedYear < currentYear || (selectedYear === currentYear && month <= currentMonth)) {
            totalExpected++;
            if (satkerData.months[month]) {
              totalUploaded++;
              if (selectedYear === currentYear && month === currentMonth) {
                currentMonthUploaded++;
              }
            }
          }
        }
        
        // Count annual uploads
        const annualTypes = ['LAHAN_TAHUNAN', 'ALSIN_TAHUNAN', 'BENIH_TAHUNAN'] as const;
        annualTypes.forEach(type => {
          if (satkerData.annuals[type]) {
            annualDataUploaded++;
          }
        });
      } else {
        // No data for this satker, count as expected but not uploaded
        for (let month = 1; month <= CONSTANTS.MONTHS_IN_YEAR; month++) {
          if (selectedYear < currentYear || (selectedYear === currentYear && month <= currentMonth)) {
            totalExpected++;
          }
        }
      }
    });
    
    const uploadPercentage = totalExpected > 0 ? Math.round((totalUploaded / totalExpected) * 100) : 0;
    const annualPercentage = Math.round((annualDataUploaded / totalAnnualExpected) * 100);
    
    return {
      totalUploaded,
      totalExpected,
      uploadPercentage,
      currentMonthUploaded,
      annualDataUploaded,
      totalAnnualExpected,
      annualPercentage,
      isCurrentYear: selectedYear === currentYear
    };
  }, [monitoringData, selectedYear]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upload Bulanan</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUploaded}/{stats.totalExpected}</div>
          <p className="text-xs text-muted-foreground">
            {stats.uploadPercentage}% complete
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Data Tahunan</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.annualDataUploaded}/{stats.totalAnnualExpected}</div>
          <p className="text-xs text-muted-foreground">
            {stats.annualPercentage}% complete
          </p>
        </CardContent>
      </Card>

      {stats.isCurrentYear && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
            <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentMonthUploaded}</div>
            <p className="text-xs text-muted-foreground">
              dari {kabMap.length} kabupaten
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Belum Upload</CardTitle>
          <Circle className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalExpected - stats.totalUploaded}</div>
          <p className="text-xs text-muted-foreground">
            data bulanan tertunggak
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

SimtpSummaryStats.displayName = 'SimtpSummaryStats';

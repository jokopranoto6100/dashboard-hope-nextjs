// Lokasi: src/app/(dashboard)/monitoring/ksa/LeaderboardCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Award, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LeaderboardEntry {
  peringkat: number;
  kabupaten: string;
  tanggal_penyelesaian: string;
}

interface LeaderboardCardProps {
  data: LeaderboardEntry[];
  isLoading: boolean;
  monthName: string;
  year: number;
}

const rankConfig = [
  { rank: 1, icon: Trophy, color: "text-amber-400", bgColor: "bg-amber-400/10", borderColor: "border-amber-400/20" },
  { rank: 2, icon: Award, color: "text-slate-400", bgColor: "bg-slate-400/10", borderColor: "border-slate-400/20" },
  { rank: 3, icon: Medal, color: "text-orange-600", bgColor: "bg-orange-600/10", borderColor: "border-orange-600/20" },
];

export function LeaderboardCard({ data, isLoading, monthName, year }: LeaderboardCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>🏆 Leaderboard KSA</CardTitle>
        <CardDescription>Peringkat 3 kabupaten tercepat yang menyelesaikan 100% amatan pada bulan {monthName} {year}.</CardDescription>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="space-y-3">
            {data.map((entry) => {
              const config = rankConfig.find(c => c.rank === entry.peringkat) || rankConfig[2];
              return (
                <div key={entry.peringkat} className={cn("flex items-center space-x-4 rounded-md border p-3", config.bgColor, config.borderColor)}>
                  <config.icon className={cn("h-8 w-8", config.color)} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{entry.kabupaten}</p>
                    <p className="text-xs text-muted-foreground">
                      Selesai pada: {
                        // --- PERUBAHAN DI SINI ---
                        new Date(entry.tanggal_penyelesaian).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        }).replace(/\./g, ':') // Mengganti format jam dari 14.30 menjadi 14:30
                        // --- AKHIR PERUBAHAN ---
                      }
                    </p>
                  </div>
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-full font-bold", config.color)}>
                    {entry.peringkat}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-32">
            <p className="font-medium">Belum ada Pemenang</p>
            <p className="text-sm">Belum ada kabupaten yang mencapai 100% penyelesaian bulan ini.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
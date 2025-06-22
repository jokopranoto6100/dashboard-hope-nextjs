/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/pengguna/[userId]/user-detail-view.tsx
'use client';

import { useState, useEffect } from 'react';
import { getAuditLogsForUserAction, getUserDetailsAction } from '../_actions';
import type { ManagedUser } from '../page';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, ShieldCheck, Mail, Calendar, KeyRound, Construction, ShieldX, Building } from 'lucide-react';

interface UserDetailViewProps {
    userId: string;
}

export default function UserDetailView({ userId }: UserDetailViewProps) {
    const [user, setUser] = useState<ManagedUser | null>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Ambil data user dan log secara paralel
                const [userResult, logsResult] = await Promise.all([
                    getUserDetailsAction(userId),
                    getAuditLogsForUserAction(userId)
                ]);

                if (userResult.success) {
                    setUser(userResult.data || null);
                } else {
                    throw new Error(userResult.message);
                }

                if (logsResult.success) {
                    setAuditLogs(logsResult.data || []);
                } else {
                    // Ini tidak harus menggagalkan seluruh halaman
                    toast.error("Gagal memuat riwayat aktivitas.");
                }

            } catch (err: any) {
                setError(err.message || 'Gagal memuat data.');
                toast.error(err.message || 'Gagal memuat data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const formattedDate = (date: string) => {
        if (!date) return "Tanggal tidak valid";
        try {
            const options: Intl.DateTimeFormatOptions = {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta'
            };
            return new Intl.DateTimeFormat('id-ID', options).format(new Date(date));
        } catch { return "Format tanggal salah"; }
    };

    if (isLoading) {
        return <div className="container mx-auto py-8">Memuat data pengguna...</div>;
    }

    if (error) {
        return <div className="container mx-auto py-8 text-red-500">Error: {error}</div>;
    }

    if (!user) {
        return (
            <div className="container mx-auto py-8">
                <h1 className="text-xl font-semibold">Pengguna Tidak Ditemukan</h1>
                <p className="text-muted-foreground">Pengguna dengan ID ini mungkin telah dihapus atau tidak pernah ada.</p>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <header className="flex items-center gap-4">
                 {user.is_active ? 
                    <ShieldCheck className="h-10 w-10 text-green-500" /> : 
                    <ShieldX className="h-10 w-10 text-red-500" />
                 }
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {user.full_name || 'Tanpa Nama'}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Detail dan riwayat aktivitas untuk @{user.username}
                    </p>
                </div>
            </header>

             <Card>
                <CardHeader>
                    <CardTitle>Informasi Pengguna</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /> <span>{user.email || 'N/A'}</span></div>
                    <div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /> <Badge variant="secondary" className="capitalize">{user.role}</Badge></div>
                    <div className="flex items-center gap-3"><Building className="h-4 w-4 text-muted-foreground" /> <span>{user.satker_name}</span></div>
                    <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /> <span>Bergabung pada {formattedDate(user.created_at)}</span></div>
                    <div className="flex items-center gap-3"><Construction className="h-4 w-4 text-muted-foreground" /> <span>ID: {user.id}</span></div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Aktivitas Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {auditLogs.length > 0 ? auditLogs.map(log => (
                            <li key={log.id} className="flex items-start gap-3 text-sm">
                                <div className="bg-secondary p-2 rounded-full"><KeyRound className="h-4 w-4 text-muted-foreground" /></div>
                                <div>
                                    <p className="font-medium">{log.action}</p>
                                    <p className="text-muted-foreground">Dilakukan oleh <span className="font-semibold">{log.actor_email}</span> pada {formattedDate(log.created_at)}</p>
                                    {log.details && <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded-md overflow-x-auto"><code>{JSON.stringify(log.details, null, 2)}</code></pre>}
                                </div>
                            </li>
                        )) : (
                            <p className="text-sm text-muted-foreground">Tidak ada riwayat aktivitas yang tercatat.</p>
                        )}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
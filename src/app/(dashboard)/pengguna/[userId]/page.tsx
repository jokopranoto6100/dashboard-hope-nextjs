// src/app/(dashboard)/pengguna/[userId]/page.tsx

import { cookies } from 'next/headers';
import { createServerComponentSupabaseClient } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ShieldCheck, Mail, Calendar, KeyRound, Construction, ShieldX, Building } from 'lucide-react';
import { daftarSatker } from '@/lib/satker-data';

export const dynamic = 'force-dynamic';

// HAPUS: Interface UserDetailPageProps tidak lagi digunakan
// interface UserDetailPageProps {
//     params: {
//         userId: string;
//     }
// }

async function getUserDetails(userId: string) {
    const [userResult, auditLogsResult] = await Promise.all([
        supabaseServer.from('users').select('*').eq('id', userId).single(),
        supabaseServer.from('audit_logs').select('*').or(`actor_id.eq.${userId},target_user_id.eq.${userId}`).order('created_at', { ascending: false }).limit(20)
    ]);
    
    if (userResult.error) {
        console.error("Error fetching user details:", userResult.error.message);
        return { user: null, auditLogs: [] };
    }
    
    return {
        user: userResult.data,
        auditLogs: auditLogsResult.data || []
    };
}

// PERBAIKAN: Definisikan tipe props secara inline di sini
export default async function UserDetailPage({ params }: { params: { userId: string } }) {
    // Validasi admin
    const cookieStore = await cookies();
    const supabase = createServerComponentSupabaseClient(cookieStore);
    const { data: { user: actor } } = await supabase.auth.getUser();
    if (!actor) return redirect('/auth/login');

    const { data: adminProfile } = await supabase.from('users').select('role').eq('id', actor.id).single();
    if (adminProfile?.role !== 'super_admin') return redirect('/dashboard');

    const { userId } = params;
    const { user, auditLogs } = await getUserDetails(userId);

    if (!user) {
        return (
            <div className="container mx-auto py-8">
                <h1 className="text-xl font-semibold">Pengguna Tidak Ditemukan</h1>
                <p className="text-muted-foreground">Pengguna dengan ID ini mungkin telah dihapus atau tidak pernah ada.</p>
            </div>
        );
    }
    
    const formattedDate = (date: string) => {
        if (!date) return "Tanggal tidak valid";
        try {
            const options: Intl.DateTimeFormatOptions = {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Jakarta'
            };
            return new Intl.DateTimeFormat('id-ID', options).format(new Date(date));
        } catch {
            return "Format tanggal salah";
        }
    };

    const satkerName = daftarSatker.find(s => s.value === user.satker_id)?.label || 'Satker tidak diketahui';

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
                    <div className="flex items-center gap-3"><Building className="h-4 w-4 text-muted-foreground" /> <span>{satkerName}</span></div>
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
                                <div className="bg-secondary p-2 rounded-full">
                                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium">{log.action}</p>
                                    <p className="text-muted-foreground">
                                        Dilakukan oleh <span className="font-semibold">{log.actor_email}</span> pada {formattedDate(log.created_at)}
                                    </p>
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
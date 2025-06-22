// src/app/(dashboard)/pengguna/[userId]/page.tsx
import UserDetailView from './user-detail-view';

// Halaman server ini sekarang sangat sederhana
export default function UserDetailPage({ params }: { params: { userId: string } }) {
    // Ia hanya mengambil userId dari params dan meneruskannya ke komponen klien
    return <UserDetailView userId={params.userId} />;
}
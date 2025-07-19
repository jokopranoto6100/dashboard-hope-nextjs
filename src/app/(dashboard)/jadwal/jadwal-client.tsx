"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { type Kegiatan, type JadwalItem } from './jadwal.config';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PlusCircle, Edit, Trash2, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';
import { GanttMiniMobile } from './jadwal-mobile';
import { JadwalDesktop } from './jadwal-desktop';
import { JadwalForm } from './JadwalForm';
import { KegiatanForm } from './KegiatanForm';

// ✅ DIUBAH: Interface ini sekarang mendefinisikan props yang akan diterima dari page.tsx
interface JadwalClientProps {
  data: Kegiatan[];
  tahun: number;
  refreshJadwal: () => void;
}

// ✅ DIUBAH: Komponen menerima props, dan tidak lagi memanggil hook data
export function JadwalClient({ data, tahun, refreshJadwal }: JadwalClientProps) {
  const { userRole, supabase } = useAuth();
  const isMobile = useIsMobile();
  
  // State untuk interaksi UI tetap dikelola di sini
  const [detailModalItem, setDetailModalItem] = useState<JadwalItem | null>(null);
  const [isJadwalFormOpen, setIsJadwalFormOpen] = useState(false);
  const [isKegiatanFormOpen, setIsKegiatanFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<JadwalItem | null>(null);
  const [isJadwalAlertOpen, setIsJadwalAlertOpen] = useState(false);
  const [kegiatanToDelete, setKegiatanToDelete] = useState<Kegiatan | null>(null);

  const handleBlockClick = (item: JadwalItem) => { setDetailModalItem(item); };
  const handleOpenAddForm = () => { setEditItem(null); setIsJadwalFormOpen(true); };
  const handleOpenEditForm = (item: JadwalItem) => { setDetailModalItem(null); setEditItem(item); setIsJadwalFormOpen(true); };
  
  const handleDeleteJadwalItemConfirmation = () => {
    const itemToDelete = detailModalItem; 
    if (!itemToDelete?.id) return;

    const deletePromise = async () => {
        const { error } = await supabase.rpc('delete_jadwal_item', { p_item_id: itemToDelete.id });
        if (error) throw new Error(error.message);
    };
    
    toast.promise(deletePromise(), {
      loading: 'Menghapus jadwal...',
      success: () => {
        setDetailModalItem(null);
        refreshJadwal(); // Memanggil fungsi refresh dari props
        return 'Jadwal berhasil dihapus.';
      },
      error: (err) => `Gagal menghapus: ${err.message}`,
    });
  };

  const handleOpenDeleteKegiatanDialog = (kegiatan: Kegiatan) => {
    setKegiatanToDelete(kegiatan);
  };

  const handleConfirmDeleteKegiatan = () => {
    if (!kegiatanToDelete?.id) return;
    const deletePromise = async () => {
      const { error } = await supabase.rpc('delete_kegiatan', { p_kegiatan_id: kegiatanToDelete.id });
      if (error) throw new Error(error.message);
    };
    toast.promise(deletePromise(), {
      loading: `Menghapus kegiatan "${kegiatanToDelete.kegiatan}"...`,
      success: () => {
        setKegiatanToDelete(null);
        refreshJadwal(); // Memanggil fungsi refresh dari props
        return 'Kegiatan berhasil dihapus.';
      },
      error: (err) => `Gagal menghapus: ${err.message}`,
    });
  };

  const handleFormSuccess = () => {
    setIsJadwalFormOpen(false);
    setIsKegiatanFormOpen(false);
    refreshJadwal(); // Memanggil fungsi refresh dari props
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Enhanced Header dengan desain modern dan konsisten dengan halaman produksi-statistik */}
        <div 
          className="relative overflow-hidden rounded-xl p-6 text-white shadow-xl"
          style={{
            background: 'linear-gradient(135deg, rgb(137, 132, 216) 0%, rgb(120, 115, 200) 50%, rgb(100, 95, 180) 100%)'
          }}
        >
          {/* Background pattern dengan dark mode adaptif */}
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent dark:from-white/3 dark:to-transparent" />
          
          {/* Decorative circles dengan dark mode adaptif */}
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10 dark:bg-white/5 blur-xl" />
          <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5 dark:bg-white/3 blur-2xl" />
          
          <div className="relative flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 dark:bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Jadwal Kegiatan</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1 w-12 bg-white/60 dark:bg-white/50 rounded-full" />
                    <div className="h-1 w-8 bg-white/40 dark:bg-white/30 rounded-full" />
                    <div className="h-1 w-4 bg-white/20 dark:bg-white/15 rounded-full" />
                  </div>
                </div>
              </div>
              <p className="text-white/90 dark:text-white/85 text-lg font-medium flex items-center gap-2">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Timeline kegiatan survei fungsi produksi tahun <span className="font-bold bg-white/20 dark:bg-white/15 px-2 py-1 rounded-lg text-white">{tahun}</span>
              </p>
            </div>
            {userRole === 'super_admin' && (
              <div className="flex flex-shrink-0 gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => setIsKegiatanFormOpen(true)}
                  className="bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-white border-white/30 dark:border-white/20 backdrop-blur-sm transition-all duration-200"
                >
                  <FolderPlus className="mr-2 h-4 w-4" /> Buat Kegiatan
                </Button>
                <Button 
                  onClick={handleOpenAddForm}
                  className="bg-white hover:bg-white/90 text-blue-600 dark:text-blue-700 font-semibold transition-all duration-200 shadow-lg"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Tambah Jadwal
                </Button>
              </div>
            )}
          </div>
        </div>

        {isMobile ? (
          <GanttMiniMobile data={data} tahun={tahun} onBlockClick={handleBlockClick} />
        ) : (
          <JadwalDesktop
            data={data}
            tahun={tahun}
            onBlockClick={handleBlockClick}
            userRole={userRole}
            onDeleteKegiatan={handleOpenDeleteKegiatanDialog}
          />
        )}
        
        <Dialog open={!!detailModalItem} onOpenChange={(isOpen) => !isOpen && setDetailModalItem(null)}>
          <DialogContent className="sm:max-w-sm">
            {detailModalItem && (
              <>
                <DialogHeader>
                  <DialogTitle>{detailModalItem.nama}</DialogTitle>
                  <DialogDescription>{detailModalItem.keterangan || "Tidak ada keterangan."}</DialogDescription>
                </DialogHeader>
                <div className="py-2 space-y-2">
                  <p><strong>Tanggal Mulai:</strong> {new Date(detailModalItem.startDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                  <p><strong>Tanggal Selesai:</strong> {new Date(detailModalItem.endDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                </div>
                {userRole === 'super_admin' && (
                  <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:space-x-2 pt-4">
                    <Button variant="destructive" size="sm" onClick={() => setIsJadwalAlertOpen(true)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Hapus
                    </Button>
                    <div className='flex justify-end gap-2'>
                        <Button type="button" variant="secondary" size="sm" onClick={() => setDetailModalItem(null)}>Tutup</Button>
                        <Button size="sm" onClick={() => handleOpenEditForm(detailModalItem)}>
                           <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                    </div>
                  </DialogFooter>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={isJadwalAlertOpen} onOpenChange={setIsJadwalAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Anda Yakin Ingin Menghapus Jadwal Ini?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini hanya akan menghapus item jadwal <span className='font-semibold'>"{detailModalItem?.nama}"</span>, bukan kegiatannya.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteJadwalItemConfirmation}>Ya, Hapus Jadwal</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog open={!!kegiatanToDelete} onOpenChange={(isOpen) => !isOpen && setKegiatanToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Hapus Kegiatan</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak bisa dibatalkan. Ini akan menghapus kegiatan <span className='font-semibold'>"{kegiatanToDelete?.kegiatan}"</span> dan **SEMUA JADWAL** di dalamnya.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDeleteKegiatan} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Ya, Hapus Kegiatan Ini
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <JadwalForm isOpen={isJadwalFormOpen} setIsOpen={setIsJadwalFormOpen} kegiatanList={data} onSuccess={handleFormSuccess} jadwalItem={editItem} />
        
        <KegiatanForm isOpen={isKegiatanFormOpen} setIsOpen={setIsKegiatanFormOpen} kegiatanList={data} onSuccess={handleFormSuccess} />
      </div>
    </TooltipProvider>
  );
}
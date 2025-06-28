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

// Definisikan interface untuk props yang akan diterima komponen ini
interface JadwalClientProps {
  data: Kegiatan[];
  tahun: number;
  refreshJadwal: () => void;
}

export function JadwalClient({ data, tahun, refreshJadwal }: JadwalClientProps) {
  const { userRole, supabase } = useAuth();
  const isMobile = useIsMobile();
  
  // State untuk UI dikelola di sini
  const [detailModalItem, setDetailModalItem] = useState<JadwalItem | null>(null);
  const [isJadwalFormOpen, setIsJadwalFormOpen] = useState(false);
  const [isKegiatanFormOpen, setIsKegiatanFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<JadwalItem | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // --- Handlers ---
  const handleBlockClick = (item: JadwalItem) => {
    setDetailModalItem(item);
  };

  const handleOpenAddForm = () => {
    setEditItem(null);
    setIsJadwalFormOpen(true);
  };
  
  const handleOpenEditForm = (item: JadwalItem) => {
    setDetailModalItem(null);
    setEditItem(item);
    setIsJadwalFormOpen(true);
  };
  
  const handleDeleteConfirmation = () => {
    if (!detailModalItem?.id) {
        toast.error("Gagal menghapus: ID jadwal tidak ditemukan.");
        return;
    };

    const deletePromise = async () => {
        const { error } = await supabase.rpc('delete_jadwal_item', { p_item_id: detailModalItem.id });
        if (error) {
            throw new Error(error.message);
        }
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

  const handleFormSuccess = () => {
    setIsJadwalFormOpen(false);
    setIsKegiatanFormOpen(false);
    refreshJadwal(); // Memanggil fungsi refresh dari props
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Jadwal Kegiatan</h1>
            <p className="text-muted-foreground">Timeline kegiatan survei fungsi produksi tahun {tahun}.</p>
          </div>
          {userRole === 'super_admin' && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsKegiatanFormOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" /> Buat Kegiatan
              </Button>
              <Button onClick={handleOpenAddForm}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Jadwal
              </Button>
            </div>
          )}
        </div>
        
        {isMobile ? (
          <GanttMiniMobile data={data} tahun={tahun} onBlockClick={handleBlockClick} />
        ) : (
          <JadwalDesktop data={data} tahun={tahun} onBlockClick={handleBlockClick} />
        )}
        
        <Dialog open={!!detailModalItem} onOpenChange={() => setDetailModalItem(null)}>
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
                    <Button variant="destructive" size="sm" onClick={() => setIsAlertOpen(true)}>
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

        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Anda Benar-Benar Yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak bisa dibatalkan. Ini akan menghapus jadwal 
                        <span className='font-semibold'>"{detailModalItem?.nama}"</span> secara permanen dari database.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirmation}>
                        Ya, Hapus Jadwal
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <JadwalForm
          isOpen={isJadwalFormOpen}
          setIsOpen={setIsJadwalFormOpen}
          kegiatanList={data}
          onSuccess={handleFormSuccess}
          jadwalItem={editItem}
        />
        
        <KegiatanForm 
          isOpen={isKegiatanFormOpen}
          setIsOpen={setIsKegiatanFormOpen}
          kegiatanList={data}
          onSuccess={handleFormSuccess}
        />
      </div>
    </TooltipProvider>
  );
}
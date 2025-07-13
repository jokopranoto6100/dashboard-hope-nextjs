"use client";

import { useEffect, useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  updateSkgbPengeringan, 
  updateSkgbPenggilingan,
  getPetugasBySatker,
  getAllPetugas,
  fetchSkgbRecordsWithPagination,
  type SkgbPengeringanRecord,
  type SkgbPenggilinganRecord,
  type PetugasRecord
} from "../_actions";

const formSchema = z.object({
  petugas: z.string().min(1, "Petugas harus dipilih"),
  email_petugas: z.string().email("Email petugas tidak valid"),
  status_pendataan: z.enum(["Belum Didata", "Selesai Didata"], {
    errorMap: () => ({ message: "Status pendataan tidak valid" })
  }),
});

type FormData = z.infer<typeof formSchema>;

interface SkgbManageSampleModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  skgbType: 'pengeringan' | 'penggilingan';
  userSatkerId: string | null;
  userRole?: string | null;
  onSuccess?: () => void;
}

export function SkgbManageSampleModal({ 
  isOpen, 
  setIsOpen, 
  skgbType,
  userSatkerId,
  userRole,
  onSuccess 
}: SkgbManageSampleModalProps) {
  const [isPending, startTransition] = useTransition();
  const [petugasList, setPetugasList] = useState<PetugasRecord[]>([]);
  const [loadingPetugas, setLoadingPetugas] = useState(false);
  const [skgbRecords, setSkgbRecords] = useState<(SkgbPengeringanRecord | SkgbPenggilinganRecord)[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SkgbPengeringanRecord | SkgbPenggilinganRecord | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 50; // Show 50 records per page
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petugas: "",
      email_petugas: "",
      status_pendataan: "Belum Didata",
    }
  });

  // Load petugas data when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingPetugas(true);
      
      const fetchPetugas = async () => {
        try {
          let petugasData: PetugasRecord[] = [];
          
          if (userRole === 'super_admin') {
            petugasData = await getAllPetugas();
          } else if (userSatkerId) {
            petugasData = await getPetugasBySatker(userSatkerId);
          }
          
          setPetugasList(petugasData);
        } catch (error) {
          console.error("Error loading petugas:", error);
          toast.error("Gagal memuat data petugas");
          setPetugasList([]);
        } finally {
          setLoadingPetugas(false);
        }
      };
      
      fetchPetugas();
    }
  }, [isOpen, userSatkerId, userRole]);

  // Load SKGB records when modal opens or page changes
  useEffect(() => {
    if (isOpen && userSatkerId) {
      fetchSkgbRecords();
    }
  }, [isOpen, userSatkerId, skgbType, currentPage]);

  const fetchSkgbRecords = async () => {
    if (!userSatkerId) return;
    
    setIsLoadingRecords(true);
    try {
      // Use pagination for better performance
      const satkerId = userRole === 'super_admin' ? undefined : userSatkerId;
      const result = await fetchSkgbRecordsWithPagination(
        skgbType, 
        satkerId, 
        currentPage, 
        recordsPerPage
      );
      
      setSkgbRecords(result.records);
      setTotalRecords(result.total);
    } catch (error) {
      console.error('Error fetching SKGB records:', error);
      setSkgbRecords([]);
      setTotalRecords(0);
      toast.error('Gagal memuat data SKGB');
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Handle petugas selection to auto-fill email
  const handlePetugasChange = (petugasName: string) => {
    const selectedPetugas = petugasList.find(p => p.nama_petugas === petugasName);
    if (selectedPetugas) {
      form.setValue("email_petugas", selectedPetugas.email_petugas);
    }
  };

  const onSubmit = (data: FormData) => {
    if (!selectedRecord) {
      toast.error("Pilih record yang akan diedit");
      return;
    }

    startTransition(async () => {
      try {
        const updateData = {
          petugas: data.petugas,
          email_petugas: data.email_petugas,
          status_pendataan: data.status_pendataan
        };

        let result;
        if (skgbType === 'pengeringan') {
          result = await updateSkgbPengeringan(selectedRecord.id, updateData);
        } else {
          result = await updateSkgbPenggilingan(selectedRecord.id, updateData);
        }

        if (result.success) {
          toast.success(`Berhasil mengupdate record SKGB ${skgbType}`);
          setIsEditFormOpen(false);
          setSelectedRecord(null);
          form.reset();
          fetchSkgbRecords(); // Refresh data
          onSuccess?.();
        } else {
          if (typeof result.error === 'string') {
            toast.error(result.error);
          } else if (result.error && typeof result.error === 'object') {
            const errorMessages = Object.values(result.error).flat();
            toast.error(errorMessages.join(', '));
          } else {
            toast.error("Gagal mengupdate data");
          }
        }
      } catch (error) {
        console.error("Error updating SKGB:", error);
        toast.error("Terjadi kesalahan saat mengupdate data");
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setIsOpen(false);
      setIsEditFormOpen(false);
      setSelectedRecord(null);
      form.reset();
    }
  };

  const handleEditRecord = (record: SkgbPengeringanRecord | SkgbPenggilinganRecord) => {
    setSelectedRecord(record);
    form.reset({
      petugas: record.petugas || "",
      email_petugas: record.email_petugas || "",
      status_pendataan: (record.status_pendataan === "Selesai Didata" ? "Selesai Didata" : "Belum Didata"),
    });
    setIsEditFormOpen(true);
  };

  return (
    <>
      {/* Main Modal - Sample Management */}
      <Dialog open={isOpen && !isEditFormOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Kelola Sampel SKGB {skgbType === 'pengeringan' ? 'Pengeringan' : 'Penggilingan'}
            </DialogTitle>
            <DialogDescription>
              Mengelola data sampel SKGB untuk satker Anda
              {userRole === 'super_admin' && ' (Super Admin - dapat mengelola semua data)'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-auto">
            {isLoadingRecords ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : skgbRecords.length > 0 ? (
              <>
                <div className="border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Kabupaten</TableHead>
                        <TableHead className="w-[120px]">Kecamatan</TableHead>
                        <TableHead className="w-[150px]">
                          {skgbType === 'pengeringan' ? 'Lokasi' : 'Nama Usaha'}
                        </TableHead>
                        {skgbType === 'pengeringan' && (
                          <TableHead className="w-[120px]">ID Subsegmen</TableHead>
                        )}
                        <TableHead className="w-[80px]">NKS</TableHead>
                        <TableHead className="w-[100px]">Flag Sampel</TableHead>
                        <TableHead className="w-[150px]">Petugas</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="w-[100px]">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {skgbRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.nmkab}</TableCell>
                          <TableCell>{record.nmkec}</TableCell>
                          <TableCell>
                            {skgbType === 'pengeringan' 
                              ? ('lokasi' in record ? record.lokasi : '-')
                              : ('nama_usaha' in record ? record.nama_usaha : '-')}
                          </TableCell>
                          {skgbType === 'pengeringan' && (
                            <TableCell>
                              {'idsubsegmen' in record ? record.idsubsegmen : '-'}
                            </TableCell>
                          )}
                          <TableCell>
                            {'nks' in record ? (typeof record.nks === 'string' ? record.nks : record.nks?.toString()) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {record.flag_sampel || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.petugas || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={record.status_pendataan === 'Selesai Didata' ? 'default' : 'secondary'}>
                              {record.status_pendataan || 'Belum Didata'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRecord(record)}
                              className="text-xs"
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <div className="text-sm text-muted-foreground">
                      Menampilkan {((currentPage - 1) * recordsPerPage) + 1} - {Math.min(currentPage * recordsPerPage, totalRecords)} dari {totalRecords} data
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Sebelumnya
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Selanjutnya
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="border rounded p-8 bg-muted/50 text-center">
                <p className="text-muted-foreground">
                  Tidak ada data sampel SKGB untuk satker Anda.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleClose} variant="outline">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Form Modal */}
      <Dialog open={isEditFormOpen} onOpenChange={() => setIsEditFormOpen(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Edit Record SKGB
            </DialogTitle>
            <DialogDescription>
              Mengupdate data petugas dan status pendataan
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="petugas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Petugas <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handlePetugasChange(value);
                      }} 
                      value={field.value}
                      disabled={loadingPetugas}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingPetugas ? "Loading..." : "Pilih petugas"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {petugasList.map((petugas) => (
                          <SelectItem key={petugas.id} value={petugas.nama_petugas}>
                            <div className="flex flex-col">
                              <span>{petugas.nama_petugas}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email_petugas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Petugas <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Email petugas"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status_pendataan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Pendataan <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status pendataan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Belum Didata">Belum Didata</SelectItem>
                        <SelectItem value="Selesai Didata">Selesai Didata</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditFormOpen(false)} disabled={isPending}>
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

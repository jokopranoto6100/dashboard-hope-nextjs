// src/app/(dashboard)/pengguna/user-management-client-page.tsx
'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, MoreHorizontal, UserPlus, Trash2, Edit3, Eye, ShieldCheck, ShieldX, Loader2 } from 'lucide-react';
import type { ManagedUser } from './page'; // Impor tipe dari page.tsx
import { toast } from "sonner";
import { deleteUserAction, updateUserRoleAction, createUserAction, editUserAction } from './_actions'; 

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const userFormSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid." }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }).optional().or(z.literal('')),
  username: z.string().min(3, { message: "Username minimal 3 karakter." }),
  role: z.enum(["viewer", "super_admin"], { required_error: "Peran harus dipilih." }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserManagementClientPageProps {
  initialUsers: ManagedUser[];
}

export default function UserManagementClientPage({ initialUsers }: UserManagementClientPageProps) {
  const [data, setData] = useState<ManagedUser[]>(initialUsers);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isTransitioning, startTransition] = useTransition();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
  const [userBeingProcessed, setUserBeingProcessed] = useState<string | null>(null); 
  
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [userToEdit, setUserToEdit] = useState<ManagedUser | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { email: "", password: "", username: "", role: "viewer" },
  });

  useEffect(() => {
    if (showEditUserDialog && userToEdit) {
      form.reset({
        email: userToEdit.email || "",
        username: userToEdit.username || "",
        role: userToEdit.role as "viewer" | "super_admin" || "viewer",
        password: "", 
      });
    } else if (showCreateUserDialog) {
      form.reset({ email: "", password: "", username: "", role: "viewer" });
    }
  }, [showEditUserDialog, userToEdit, showCreateUserDialog, form]);

  useEffect(() => { setData(initialUsers); }, [initialUsers]);

  const resetRowActionState = () => {
    setUserToDelete(null);      
    setUserBeingProcessed(null);
    setUserToEdit(null); 
  };

  const handleDeleteRequest = (user: ManagedUser) => {
    setUserToDelete(user);
    setUserBeingProcessed(user.id); 
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    startTransition(async () => {
      const result = await deleteUserAction(userToDelete.id);
      if (result.success) toast.success(result.message || "Pengguna berhasil dihapus.");
      else toast.error(result.message || "Gagal menghapus pengguna.");
      setShowDeleteConfirm(false); 
      resetRowActionState();      
    });
  };

  const handleChangeRole = (user: ManagedUser, newRole: string) => {
    setUserBeingProcessed(user.id); 
    startTransition(async () => {
      toast.info(`Mengubah peran untuk ${user.username || user.email} menjadi ${newRole}...`);
      const result = await updateUserRoleAction({ userId: user.id, newRole });
      if (result.success) toast.success(result.message || "Peran pengguna berhasil diupdate.");
      else toast.error(result.message || "Gagal mengupdate peran pengguna.");
      setUserBeingProcessed(null); 
    });
  };

  const handleCreateUserSubmit = async (values: UserFormValues) => {
    setUserBeingProcessed('creating_new_user'); 
    startTransition(async () => {
      if (!values.password) {
        toast.error("Password harus diisi untuk pengguna baru.");
        setUserBeingProcessed(null);
        return;
      }
      const result = await createUserAction(values as Required<UserFormValues>); 
      if (result.success) {
        toast.success(result.message || "Pengguna baru berhasil dibuat.");
        form.reset(); 
        setShowCreateUserDialog(false); 
      } else {
        toast.error(result.message || "Gagal membuat pengguna baru.");
      }
      setUserBeingProcessed(null); 
    });
  };

  const handleEditUserRequest = (user: ManagedUser) => {
    setUserToEdit(user);
    setShowEditUserDialog(true);
  };

  const handleEditUserSubmit = async (values: UserFormValues) => {
    if (!userToEdit) return;
    setUserBeingProcessed(userToEdit.id);
    startTransition(async () => {
      const payload = { userId: userToEdit.id, ...values };
      const result = await editUserAction(payload);
      if (result.success) {
        toast.success(result.message || "Data pengguna berhasil diperbarui.");
        setShowEditUserDialog(false);
        setUserToEdit(null);
      } else {
        toast.error(result.message || "Gagal memperbarui data pengguna.");
      }
      setUserBeingProcessed(null);
    });
  };

  const columns = useMemo<ColumnDef<ManagedUser>[]>(() => [
    {
      accessorKey: 'username',
      header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Username <ArrowUpDown className="ml-2 h-4 w-4" /></Button>),
      cell: ({ row }) => row.getValue('username') || <span className="text-xs text-muted-foreground">N/A</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div className="text-sm">{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'role',
      header: 'Peran',
      cell: ({ row }) => {
        const role = row.getValue('role') as string;
        if (!role) return <Badge variant="outline">Tidak Ada Peran</Badge>;
        return (<Badge variant={role === 'super_admin' ? 'default' : 'secondary'} className="capitalize">{role}</Badge>);
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Tanggal Dibuat',
      cell: ({ row }) => new Date(row.getValue('created_at')).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const user = row.original;
        const isCurrentUserBeingProcessed = isTransitioning && userBeingProcessed === user.id;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isCurrentUserBeingProcessed}>
                  <span className="sr-only">Buka menu</span>
                  {isCurrentUserBeingProcessed ? (<Loader2 className="h-4 w-4 animate-spin" />) : (<MoreHorizontal className="h-4 w-4" />)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Aksi untuk {user.username || user.email}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.info(`Lihat detail untuk: ${user.username}`)} disabled={isCurrentUserBeingProcessed}>
                  <Eye className="mr-2 h-4 w-4" /> Lihat Detail (TODO)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditUserRequest(user)} disabled={isCurrentUserBeingProcessed}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Pengguna
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Ubah Peran Ke:</DropdownMenuLabel>
                <DropdownMenuItem
                  disabled={user.role === 'super_admin' || isCurrentUserBeingProcessed}
                  onClick={() => handleChangeRole(user, 'super_admin')}
                >
                  <ShieldCheck className="mr-2 h-4 w-4 text-green-600" /> Super Admin
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={user.role === 'viewer' || isCurrentUserBeingProcessed}
                  onClick={() => handleChangeRole(user, 'viewer')}
                >
                  <ShieldX className="mr-2 h-4 w-4 text-orange-600" /> Viewer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-700/20"
                  onClick={() => handleDeleteRequest(user)}
                  disabled={isCurrentUserBeingProcessed}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Hapus Pengguna
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [isTransitioning, userBeingProcessed, form]);

  const table = useReactTable({
    data, columns, state: { sorting, columnFilters }, onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters, getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 10 } }
  });

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Input
            placeholder="Cari berdasarkan email..."
            value={(table.getColumn('email')?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn('email')?.setFilterValue(event.target.value)}
            className="max-w-sm w-full sm:w-auto"
            disabled={isTransitioning}
          />
          <Dialog open={showCreateUserDialog} onOpenChange={(isOpen) => { setShowCreateUserDialog(isOpen); if (!isOpen) form.reset(); }}>
            <DialogTrigger asChild>
              <Button disabled={isTransitioning && userBeingProcessed === 'creating_new_user'}>
                <UserPlus className="mr-2 h-4 w-4" /> Tambah Pengguna Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                <DialogDescription>Isi detail pengguna baru di bawah ini. Klik simpan jika selesai.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateUserSubmit)} className="space-y-4">
                  <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="pengguna@example.com" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="namapengguna" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="******" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Peran</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih peran pengguna" /></SelectTrigger></FormControl><SelectContent><SelectItem value="viewer">Viewer</SelectItem><SelectItem value="super_admin">Super Admin</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline" disabled={isTransitioning && userBeingProcessed === 'creating_new_user'}>Batal</Button></DialogClose>
                    <Button type="submit" disabled={isTransitioning && userBeingProcessed === 'creating_new_user'}>{(isTransitioning && userBeingProcessed === 'creating_new_user') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Simpan Pengguna</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={showEditUserDialog} onOpenChange={(isOpen) => { setShowEditUserDialog(isOpen); if (!isOpen) setUserToEdit(null); }}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Pengguna: {userToEdit?.username || userToEdit?.email}</DialogTitle>
                <DialogDescription>Ubah detail pengguna di bawah ini. Klik simpan jika selesai.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEditUserSubmit)} className="space-y-4">
                  <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="pengguna@example.com" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="namapengguna" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password Baru (Opsional)</FormLabel><FormControl><Input type="password" placeholder="Isi untuk mengubah password" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Peran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih peran pengguna" /></SelectTrigger></FormControl><SelectContent><SelectItem value="viewer">Viewer</SelectItem><SelectItem value="super_admin">Super Admin</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                  <DialogFooter>
                     <DialogClose asChild><Button type="button" variant="outline" onClick={() => {setShowEditUserDialog(false); setUserToEdit(null);}} disabled={isTransitioning && userBeingProcessed === userToEdit?.id}>Batal</Button></DialogClose>
                    <Button type="submit" disabled={isTransitioning && userBeingProcessed === userToEdit?.id}>{(isTransitioning && userBeingProcessed === userToEdit?.id) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Simpan Perubahan</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

        <div className="rounded-md border bg-background shadow-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="px-4 py-3">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    {(isTransitioning && !userBeingProcessed) ? "Memuat..." : "Tidak ada hasil."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-2 py-4 flex-wrap">
          <div className="text-sm text-muted-foreground">Menampilkan {table.getRowModel().rows.length} dari {data.length} pengguna.</div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage() || isTransitioning}>Sebelumnya</Button>
            <span className="text-sm">Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}</span>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage() || isTransitioning}>Berikutnya</Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={(open) => { setShowDeleteConfirm(open); if (!open) resetRowActionState(); }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle><AlertDialogDescription>Apakah Anda yakin ingin menghapus pengguna <span className="font-semibold">{userToDelete?.username || userToDelete?.email}</span>? Tindakan ini tidak dapat diurungkan.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {resetRowActionState(); setShowDeleteConfirm(false);}} disabled={isTransitioning && userBeingProcessed === userToDelete?.id}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={isTransitioning && userBeingProcessed === userToDelete?.id}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {(isTransitioning && userBeingProcessed === userToDelete?.id) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

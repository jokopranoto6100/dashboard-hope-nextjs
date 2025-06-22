'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel,
    getFilteredRowModel, ColumnFiltersState, RowSelectionState, SortingState, useReactTable
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, MoreHorizontal, UserPlus, Trash2, Edit3, Loader2, ChevronsUpDown, Check, XCircle, PlayCircle, KeyRound, User } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import type { ManagedUser } from './page';
import { toast } from "sonner";
import { 
    deleteUserAction, createUserAction, editUserAction, toggleUserStatusAction, 
    bulkDeleteUsersAction, sendPasswordResetAction, impersonateUserAction 
} from './_actions';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { daftarSatker } from '@/lib/satker-data';
import { cn } from '@/lib/utils';
import { UserImportDialog } from './user-import-dialog';

const userFormSchema = z.object({
    email: z.string().email({ message: "Format email tidak valid." }),
    password: z.string().min(6, { message: "Password minimal 6 karakter." }).optional().or(z.literal('')),
    username: z.string().min(3, { message: "Username minimal 3 karakter." }),
    full_name: z.string().min(3, { message: "Nama Lengkap harus diisi." }),
    satker_id: z.string({ required_error: "Satuan kerja harus dipilih." }),
    role: z.enum(["viewer", "super_admin"], { required_error: "Peran harus dipilih." }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserManagementClientPageProps {
    initialUsers: ManagedUser[];
}

export default function UserManagementClientPage({ initialUsers }: UserManagementClientPageProps) {
    const [data, setData] = useState<ManagedUser[]>(initialUsers);
    const [isTransitioning, startTransition] = useTransition();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [sorting, setSorting] = useState<SortingState>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
    const [userBeingProcessed, setUserBeingProcessed] = useState<string | null>(null);
    const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
    const [showEditUserDialog, setShowEditUserDialog] = useState(false);
    const [userToEdit, setUserToEdit] = useState<ManagedUser | null>(null);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    
    useEffect(() => {
        setData(initialUsers);
    }, [initialUsers]);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: { email: "", password: "", username: "", full_name: "", role: "viewer" },
    });

    useEffect(() => {
        const resetFormState = (user: ManagedUser | null) => {
            if (user) {
                form.reset({
                    email: user.email || "",
                    username: user.username || "",
                    full_name: user.full_name || "",
                    satker_id: user.satker_id || undefined,
                    role: user.role as "viewer" | "super_admin" || "viewer",
                    password: "",
                });
            } else {
                form.reset({ email: "", password: "", username: "", full_name: "", satker_id: undefined, role: "viewer" });
            }
        };

        if (showEditUserDialog && userToEdit) {
            resetFormState(userToEdit);
        } else if (showCreateUserDialog) {
            resetFormState(null);
        }
    }, [showEditUserDialog, userToEdit, showCreateUserDialog, form]);

    const resetRowActionState = () => {
        setUserToDelete(null);
        setUserBeingProcessed(null);
        setUserToEdit(null);
    };

    const handleDeleteRequest = (user: ManagedUser) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteUser = () => {
        if (!userToDelete) return;

        const originalData = [...data];
        setData(currentData => currentData.filter(u => u.id !== userToDelete!.id));
        setUserBeingProcessed(userToDelete.id);

        startTransition(async () => {
            const result = await deleteUserAction(userToDelete.id);
            if (result.success) {
                toast.success(result.message || "Pengguna berhasil dihapus.");
            } else {
                toast.error(result.message || "Gagal menghapus pengguna.");
                setData(originalData);
            }
            setShowDeleteConfirm(false);
            resetRowActionState();
        });
    };

    const handleCreateUserSubmit = async (values: UserFormValues) => {
        startTransition(async () => {
            if (!values.password) {
                form.setError("password", { message: "Password harus diisi." });
                return;
            }
            setUserBeingProcessed('creating_new_user');
            const result = await createUserAction(values);

            if (result.success && result.data) {
                toast.success(result.message || "Pengguna baru berhasil dibuat.");
                setData(currentData => [result.data!, ...currentData]);
                setShowCreateUserDialog(false);
            } else {
                toast.error(result.message || "Gagal membuat pengguna baru.");
                result.errorFields?.forEach(err => form.setError(err.field as keyof UserFormValues, { message: err.message }));
            }
            setUserBeingProcessed(null);
        });
    };

    const handleEditUserSubmit = async (values: UserFormValues) => {
        if (!userToEdit) return;
        setUserBeingProcessed(userToEdit.id);
        startTransition(async () => {
            const result = await editUserAction({ userId: userToEdit.id, ...values });
            if (result.success) {
                toast.success(result.message || "Data pengguna berhasil diperbarui.");
                const newSatkerName = daftarSatker.find(s => s.value === values.satker_id)?.label || 'Satker tidak diketahui';
                setData(currentData => currentData.map(row => 
                    row.id === userToEdit.id 
                        ? { ...row, ...values, full_name: values.full_name, is_active: row.is_active, satker_name: newSatkerName }
                        : row
                ));
                setShowEditUserDialog(false);
            } else {
                toast.error(result.message || "Gagal memperbarui data pengguna.");
            }
            setUserBeingProcessed(null);
        });
    };
    
    const handleToggleStatus = (user: ManagedUser) => {
        setUserBeingProcessed(user.id);
        startTransition(async () => {
            const newStatus = !user.is_active;
            const result = await toggleUserStatusAction(user.id, newStatus);
            if (result.success) {
                toast.success(result.message);
                setData(currentData => currentData.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
            } else {
                toast.error(result.message || "Gagal mengubah status.");
            }
            setUserBeingProcessed(null);
        });
    }

    const handleBulkDelete = () => {
        const selectedIds = Object.keys(rowSelection);
        const originalData = [...data];
        setData(currentData => currentData.filter(u => !selectedIds.includes(u.id)));
        setRowSelection({});

        startTransition(async () => {
            const result = await bulkDeleteUsersAction(selectedIds);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
                setData(originalData);
            }
            setShowBulkDeleteConfirm(false);
        });
    }

    const handleEditUserRequest = (user: ManagedUser) => {
        setUserToEdit(user);
        setShowEditUserDialog(true);
    };

    const handleSendReset = (user: ManagedUser) => {
        if (!user.email) {
            toast.error("Pengguna ini tidak memiliki email untuk dikirimkan link.");
            return;
        }
        setUserBeingProcessed(user.id);
        startTransition(async () => {
            toast.info(`Mengirim link ke ${user.email}...`);
            const result = await sendPasswordResetAction(user.id, user.email!);
            if (result.success) toast.success(result.message);
            else toast.error(result.message);
            setUserBeingProcessed(null);
        });
    }

    const handleImpersonate = (user: ManagedUser) => {
      if (user.id === 'user-being-impersonated') return;
      
      setUserBeingProcessed(user.id);
      startTransition(async () => {
          toast.info("Membuat link impersonasi...");
          const result = await impersonateUserAction(user.id);

          // PERBAIKAN: Menggunakan result.data.actionLink
          if (result.success && result.data) {
              toast.success("Link berhasil dibuat! Buka di tab baru untuk masuk.");
              window.open(result.data.actionLink, '_blank');
          } else {
              toast.error(result.message);
          }
          setUserBeingProcessed(null);
      });
  }

    const columns = useMemo<ColumnDef<ManagedUser>[]>(() => [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Pilih semua"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Pilih baris"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        { 
            accessorKey: 'full_name', 
            header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Nama Lengkap <ArrowUpDown className="ml-2 h-4 w-4" /></Button>), 
            cell: ({ row }) => (
                <Link href={`/pengguna/${row.original.id}`} className="font-medium text-primary hover:underline">
                    {row.getValue('full_name') || 'N/A'}
                </Link>
            ), 
        },
        { accessorKey: 'username', header: 'Username' },
        { accessorKey: 'email', header: 'Email' },
        { accessorKey: 'satker_name', header: 'Satuan Kerja', cell: ({ row }) => <div className="text-sm">{row.original.satker_name}</div> },
        {
            accessorKey: 'role',
            header: 'Peran & Status',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex flex-col gap-1">
                        <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'} className="capitalize w-fit">{user.role || 'N/A'}</Badge>
                        {!user.is_active && (
                            <Badge variant="destructive" className="w-fit">Nonaktif</Badge>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => {
                const user = row.original;
                const isCurrentUserBeingProcessed = isTransitioning && (userBeingProcessed === user.id);
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0" disabled={isCurrentUserBeingProcessed}>{isCurrentUserBeingProcessed ? (<Loader2 className="h-4 w-4 animate-spin" />) : (<MoreHorizontal className="h-4 w-4" />)}</Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Aksi Cepat</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditUserRequest(user)} disabled={isCurrentUserBeingProcessed}><Edit3 className="mr-2 h-4 w-4" /> Edit Pengguna</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(user)} disabled={isCurrentUserBeingProcessed}>
                                    {user.is_active ? <><XCircle className="mr-2 h-4 w-4 text-yellow-600" /> Nonaktifkan</> : <><PlayCircle className="mr-2 h-4 w-4 text-green-600" /> Aktifkan</>}
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Aksi Lanjutan</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleSendReset(user)} disabled={isCurrentUserBeingProcessed}><KeyRound className="mr-2 h-4 w-4" /> Kirim Reset Password</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleImpersonate(user)} disabled={isCurrentUserBeingProcessed} className="focus:bg-yellow-100 dark:focus:bg-yellow-800"><User className="mr-2 h-4 w-4" /> Masuk sebagai Pengguna</DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDeleteRequest(user)} disabled={isCurrentUserBeingProcessed}><Trash2 className="mr-2 h-4 w-4" /> Hapus Pengguna</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ], [isTransitioning, userBeingProcessed, rowSelection]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnFilters, rowSelection },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });
    
    const isCreatingUser = isTransitioning && userBeingProcessed === 'creating_new_user';
    const isEditingUser = isTransitioning && userBeingProcessed === userToEdit?.id;

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Input
                        placeholder="Cari berdasarkan email..."
                        value={(table.getColumn('email')?.getFilterValue() as string) ?? ""}
                        onChange={(event) => table.getColumn('email')?.setFilterValue(event.target.value)}
                        className="max-w-sm w-full sm:w-auto"
                    />
                    <div className="flex items-center gap-2">
                        {Object.keys(rowSelection).length > 0 && (
                            <Button variant="destructive" onClick={() => setShowBulkDeleteConfirm(true)} disabled={isTransitioning}>
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus ({Object.keys(rowSelection).length})
                            </Button>
                        )}
                        <UserImportDialog />
                        <Dialog open={showCreateUserDialog} onOpenChange={(isOpen) => { setShowCreateUserDialog(isOpen); if (!isOpen) form.reset(); }}>
                            <DialogTrigger asChild>
                                <Button><UserPlus className="mr-2 h-4 w-4" /> Tambah Pengguna</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                                    <DialogDescription>Isi detail pengguna baru di bawah ini.</DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleCreateUserSubmit)} className="space-y-4 py-4">
                                        <FormField control={form.control} name="full_name" render={({ field }) => (<FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input placeholder="Nama Lengkap..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="Username..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="******" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField
                                            control={form.control}
                                            name="satker_id"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Satuan Kerja</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                            >
                                                                {field.value ? daftarSatker.find((satker) => satker.value === field.value)?.label : "Pilih Satuan Kerja"}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Cari satuan kerja..." />
                                                                <CommandEmpty>Satuan kerja tidak ditemukan.</CommandEmpty>
                                                                <CommandList>
                                                                    <CommandGroup>
                                                                        {daftarSatker.map((satker) => (
                                                                            <CommandItem value={satker.label} key={satker.value} onSelect={() => { form.setValue("satker_id", satker.value); }}>
                                                                                <Check className={cn("mr-2 h-4 w-4", satker.value === field.value ? "opacity-100" : "opacity-0")} />
                                                                                {satker.label}
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Peran</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Peran" /></SelectTrigger></FormControl><SelectContent><SelectItem value="viewer">Viewer</SelectItem><SelectItem value="super_admin">Super Admin</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                        <DialogFooter>
                                            <DialogClose asChild><Button type="button" variant="outline" disabled={isCreatingUser}>Batal</Button></DialogClose>
                                            <Button type="submit" disabled={isCreatingUser}>{isCreatingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Simpan</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="rounded-md border bg-background shadow-sm">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (<TableHead key={header.id} className="px-4 py-3">{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (<TableCell key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">{isTransitioning ? "Memuat..." : "Tidak ada hasil."}</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between gap-2 py-4 flex-wrap">
                    <div className="text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} dari{" "}
                        {table.getFilteredRowModel().rows.length} baris dipilih.
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
                        <span className="text-sm">Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}</span>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Berikutnya</Button>
                    </div>
                </div>
            </div>

            <Dialog open={showEditUserDialog} onOpenChange={(isOpen) => { setShowEditUserDialog(isOpen); if (!isOpen) setUserToEdit(null); }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Pengguna: {userToEdit?.username}</DialogTitle>
                        <DialogDescription>Ubah detail pengguna di bawah ini.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleEditUserSubmit)} className="space-y-4 py-4">
                             <FormField control={form.control} name="full_name" render={({ field }) => (<FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password Baru (Opsional)</FormLabel><FormControl><Input type="password" placeholder="Kosongkan jika tidak diubah" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField
                                 control={form.control}
                                 name="satker_id"
                                 render={({ field }) => (
                                     <FormItem className="flex flex-col">
                                         <FormLabel>Satuan Kerja</FormLabel>
                                         <Popover>
                                             <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                >
                                                    {field.value ? daftarSatker.find((satker) => satker.value === field.value)?.label : "Pilih Satuan Kerja"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                             </PopoverTrigger>
                                             <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                 <Command>
                                                     <CommandInput placeholder="Cari satuan kerja..." />
                                                     <CommandEmpty>Satuan kerja tidak ditemukan.</CommandEmpty>
                                                     <CommandList>
                                                         <CommandGroup>
                                                             {daftarSatker.map((satker) => (
                                                                 <CommandItem value={satker.label} key={satker.value} onSelect={() => { form.setValue("satker_id", satker.value); }}>
                                                                     <Check className={cn("mr-2 h-4 w-4", satker.value === field.value ? "opacity-100" : "opacity-0")} />
                                                                     {satker.label}
                                                                 </CommandItem>
                                                             ))}
                                                         </CommandGroup>
                                                     </CommandList>
                                                 </Command>
                                             </PopoverContent>
                                         </Popover>
                                         <FormMessage />
                                     </FormItem>
                                 )}
                             />
                             <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Peran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Peran" /></SelectTrigger></FormControl><SelectContent><SelectItem value="viewer">Viewer</SelectItem><SelectItem value="super_admin">Super Admin</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                             <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="outline" onClick={() => { setShowEditUserDialog(false); setUserToEdit(null); }} disabled={isEditingUser}>Batal</Button></DialogClose>
                                <Button type="submit" disabled={isEditingUser}>{isEditingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Simpan Perubahan</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteConfirm} onOpenChange={(open) => { setShowDeleteConfirm(open); if (!open) resetRowActionState(); }}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle><AlertDialogDescription>Apakah Anda yakin ingin menghapus pengguna <span className="font-semibold">{userToDelete?.username || userToDelete?.email}</span>? Tindakan ini tidak dapat diurungkan.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { resetRowActionState(); setShowDeleteConfirm(false); }} disabled={isTransitioning && userBeingProcessed === userToDelete?.id}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteUser} disabled={isTransitioning && userBeingProcessed === userToDelete?.id} className="bg-red-600 hover:bg-red-700">
                            {(isTransitioning && userBeingProcessed === userToDelete?.id) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus Massal</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus {Object.keys(rowSelection).length} pengguna yang dipilih? Tindakan ini tidak dapat diurungkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isTransitioning}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} disabled={isTransitioning} className="bg-red-600 hover:bg-red-700">
                             {isTransitioning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
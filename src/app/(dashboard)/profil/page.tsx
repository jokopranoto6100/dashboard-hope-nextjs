// src/app/(dashboard)/profil/page.tsx
'use client';

import * as React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateMyProfileAction, changeMyPasswordAction } from '../pengguna/_actions';
import { Loader2 } from 'lucide-react';

// Skema validasi untuk form profil
const profileFormSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter.' }),
  username: z.string().min(3, { message: 'Username minimal 3 karakter.' }),
});

// Skema validasi untuk form ubah password
const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, { message: 'Password saat ini harus diisi.' }),
    newPassword: z.string().min(6, { message: 'Password baru minimal 6 karakter.' }),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
});


type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function ProfilePage() {
    const { userData, isLoading: isAuthLoading } = useAuth();
    const [isSubmitting, startTransition] = React.useTransition();
    
    // Form untuk profil
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            email: '',
            fullName: '',
            username: '',
        },
    });

    // Form untuk password
    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    });

    React.useEffect(() => {
        if (userData) {
            profileForm.reset({
                email: userData.email,
                fullName: userData.fullname,
                username: userData.username || '',
            });
        }
    }, [userData, profileForm]);

    const onProfileSubmit: SubmitHandler<ProfileFormValues> = (data) => {
        startTransition(async () => {
            const result = await updateMyProfileAction(data);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    const onPasswordSubmit: SubmitHandler<PasswordFormValues> = (data) => {
        startTransition(async () => {
            const result = await changeMyPasswordAction(data);
            if (result.success) {
                toast.success(result.message);
                passwordForm.reset();
            } else {
                toast.error(result.message);
            }
        });
    };
    
    if (isAuthLoading) {
        return <div className="container mx-auto py-8">Memuat...</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Profil Saya</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Kelola informasi akun dan keamanan Anda.
                </p>
            </header>

            <Tabs defaultValue="profil" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="profil">Profil</TabsTrigger>
                    <TabsTrigger value="keamanan">Keamanan</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profil">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Profil</CardTitle>
                            <CardDescription>Perbarui nama lengkap dan username Anda di sini.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                                    <FormField
                                        control={profileForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input {...field} readOnly disabled className="bg-gray-100 dark:bg-gray-800"/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={profileForm.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Lengkap</FormLabel>
                                                <FormControl><Input placeholder="Nama lengkap Anda..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={profileForm.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl><Input placeholder="Username Anda..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Simpan Perubahan
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="keamanan">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ubah Password</CardTitle>
                            <CardDescription>Pastikan Anda menggunakan password yang kuat dan unik.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                                     <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password Saat Ini</FormLabel>
                                                <FormControl><Input type="password" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={passwordForm.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password Baru</FormLabel>
                                                <FormControl><Input type="password" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={passwordForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Konfirmasi Password Baru</FormLabel>
                                                <FormControl><Input type="password" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Ubah Password
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
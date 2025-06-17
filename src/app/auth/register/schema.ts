// /app/auth/register/schema.ts
import * as z from 'zod';

export const registerFormSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
  username: z.string().min(3, { message: 'Username minimal 3 karakter.' }),
  fullname: z.string().min(3, { message: 'Nama lengkap harus diisi.' }),
  satker_id: z.string({ required_error: 'Satuan kerja harus dipilih.' }),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
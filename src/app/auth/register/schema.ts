// /app/auth/register/schema.ts
import * as z from 'zod';

// Kamus kata-kata yang dilarang
const dilarang = [
  'test', 'tes', 'coba', 'dummy', 'admin', 'administrator', 'root',
  'anonim', 'anonymous', 'user', 'guest', 'none', 'null', 'undefined',
  'asdf', 'qwerty', '123', 'abc', 'xyz', 'anjing', 'babi','kontol', 'memek',
];

export const registerFormSchema = z.object({
  fullname: z
    .string()
    .min(3, { message: 'Nama lengkap minimal harus 3 karakter.' })
    .refine(val => !dilarang.includes(val.toLowerCase().trim()), {
      message: 'Nama lengkap ini tidak diizinkan, mohon gunakan nama lain.',
    }),

  username: z
    .string()
    .min(3, { message: 'Username minimal harus 3 karakter.' })
    .refine(val => !dilarang.includes(val.toLowerCase().trim()), {
      message: 'Username ini tidak diizinkan, mohon gunakan username lain.',
    }),
  
  // === MODIFIKASI: Aturan baru untuk domain email ===
  email: z
    .string()
    .email({ message: 'Format email tidak valid.' })
    .refine(val => val.endsWith('@gmail.com') || val.endsWith('@bps.go.id'), {
      message: 'Hanya email dengan domain @gmail.com atau @bps.go.id yang diizinkan.',
    }),
  
  password: z
    .string()
    .min(8, { message: 'Password minimal harus 8 karakter untuk keamanan.' }),
  
  satker_id: z
    .number({ required_error: 'Satuan kerja wajib dipilih.' }),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
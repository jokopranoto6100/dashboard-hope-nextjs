// src/lib/schemas.ts
import { z } from 'zod';

// Skema untuk form pembuatan/update Sektor di sisi klien
export const sektorFormSchema = z.object({
  nama: z.string().min(3, 'Nama sektor minimal 3 karakter.'),
  icon_name: z.string().min(1, 'Ikon harus dipilih.'),
  urutan: z.coerce.number().int(),
});

// Skema untuk form pembuatan/update Link di sisi klien
export const linkFormSchema = z.object({
  label: z.string().min(3, 'Label minimal 3 karakter.'),
  href: z.string().url('URL tidak valid.'),
  icon_name: z.string().min(1, 'Ikon harus dipilih.'),
  description: z.string().optional(),
  urutan: z.coerce.number().int(),
});

// Skema untuk Server Action yang memerlukan sektor_id saat membuat/update link
export const linkActionSchema = linkFormSchema.extend({
  sektor_id: z.string().uuid('ID Sektor tidak valid.'),
});

// Skema untuk Aksi reordering dengan drag-and-drop
export const reorderSchema = z.array(z.object({
  id: z.string().uuid(),
  urutan: z.number(),
}));

export const materiPedomanLinkSchema = z.object({
    href: z.string().url('URL tidak valid. Harap masukkan link lengkap.').min(1, 'Link tidak boleh kosong.'),
  });
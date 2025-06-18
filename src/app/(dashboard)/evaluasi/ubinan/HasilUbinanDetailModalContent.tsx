// src/app/(dashboard)/evaluasi/ubinan/HasilUbinanDetailModalContent.tsx
"use client";

import React from 'react';
import { hasilUbinanDetailColumns } from './hasil-ubinan-detail-columns';
import { HasilUbinanDetailRow } from './types';
import { GenericPaginatedTable } from '@/components/ui/GenericPaginatedTable';

interface HasilUbinanDetailModalContentProps {
  kabCode: number;
  selectedYear: number | null;
  selectedSubround: number | 'all';
  selectedKomoditas: string | null;
}

export function HasilUbinanDetailModalContent({
  kabCode,
  selectedYear,
  selectedSubround,
  selectedKomoditas,
}: HasilUbinanDetailModalContentProps) {
  
  const rpcParams = {
    kab_kode: kabCode,
    tahun_val: selectedYear,
    komoditas_val: selectedKomoditas,
    subround_filter: selectedSubround === 'all' ? 'all' : String(selectedSubround),
  };

  return (
    <GenericPaginatedTable<HasilUbinanDetailRow>
      columns={hasilUbinanDetailColumns}
      rpcName="get_hasil_ubinan_detail_paginated"
      baseRpcParams={rpcParams}
      initialSorting={[{ id: 'r701', desc: true }]}
      noDataMessage="Tidak ada data detail hasil ubinan untuk ditampilkan."
    />
  );
}
// src/app/(dashboard)/evaluasi/ubinan/DetailKabupatenModalContent.tsx
"use client";

import React from 'react';
import { detailRecordColumns } from './detail-record-columns';
import { DetailRecordRowProcessed } from './types';
import { GenericPaginatedTable } from '@/components/ui/GenericPaginatedTable';

interface DetailKabupatenModalContentProps {
  kabCode: number;
  selectedYear: number | null;
  selectedSubround: number | 'all';
  selectedKomoditas: string | null;
}

export function DetailKabupatenModalContent({
  kabCode,
  selectedYear,
  selectedSubround,
  selectedKomoditas,
}: DetailKabupatenModalContentProps) {

  const rpcParams = {
    kab_kode: kabCode,
    tahun_val: selectedYear,
    komoditas_val: selectedKomoditas,
    subround_filter: selectedSubround === 'all' ? 'all' : String(selectedSubround),
  };

  return (
    <GenericPaginatedTable<DetailRecordRowProcessed>
      columns={detailRecordColumns}
      rpcName="get_ubinan_detail_sorted_paginated"
      baseRpcParams={rpcParams}
      initialSorting={[{ id: 'r111', desc: false }]} // default sort by nama
      noDataMessage="Tidak ada data detail penggunaan benih & pupuk untuk ditampilkan."
    />
  );
}
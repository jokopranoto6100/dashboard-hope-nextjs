// src/app/(dashboard)/produksi-statistik/components/DataSection.tsx
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DataTable } from '../data-table';
import { getColumns } from '../columns';
import { AugmentedAtapDataPoint } from "@/lib/types";

interface DataSectionProps {
  tableData: AugmentedAtapDataPoint[];
  indikatorNama: string;
  selectedYear: number;
  tahunPembanding: string;
  totalNilai: number;
  totalNilaiPembanding: number;
  isLoading: boolean;
  onExportData: (data: AugmentedAtapDataPoint[]) => void;
}

export function DataSection({
  tableData,
  indikatorNama,
  selectedYear,
  tahunPembanding,
  totalNilai,
  totalNilaiPembanding,
  isLoading,
  onExportData
}: DataSectionProps) {
  // Memoize table columns untuk optimasi performance
  const tableColumns = useMemo(
    () => getColumns(selectedYear, tahunPembanding, totalNilai, totalNilaiPembanding), 
    [selectedYear, tahunPembanding, totalNilai, totalNilaiPembanding]
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Data Rinci: {indikatorNama}</CardTitle>
          <CardDescription className="mt-1">
            Data mendetail berdasarkan filter yang Anda pilih.
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onExportData(tableData)} 
          disabled={isLoading || !tableData || tableData.length === 0}
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4"/>
          Ekspor ke CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <DataTable 
            columns={tableColumns} 
            data={tableData}
          />
        </div>
      </CardContent>
    </Card>
  );
}

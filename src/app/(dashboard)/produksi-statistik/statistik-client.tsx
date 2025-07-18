// Lokasi: src/app/(dashboard)/produksi-statistik/statistik-client.tsx
"use client";

import { useYear } from "@/context/YearContext";
import { useAuth } from "@/context/AuthContext";
import { useChartDataProcessor } from "@/hooks/useChartDataProcessor";
import { useKpiCalculations } from "@/hooks/useKpiCalculations";
import { useStatistikState } from "@/hooks/useStatistikState";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Import hooks dan komponen modular baru
import { useStatistikData } from './hooks/useStatistikData';
import { useStatistikHandlers } from './hooks/useStatistikHandlers';
import { KpiCards } from './components/KpiCards';
import { FilterSection } from './components/FilterSection';
import { ChartSection } from './components/ChartSection';
import { DataSection } from './components/DataSection';
import { AnnotationSheet } from './annotation-sheet';

interface StatistikClientProps { 
  availableIndicators: { id: number; nama_resmi: string; satuan_default: string | null; }[] 
}

export function StatistikClient({ availableIndicators }: StatistikClientProps) {
  const { selectedYear } = useYear();
  const { supabase, user: authUser } = useAuth();

  // State management dengan custom hook
  const { state, actions } = useStatistikState(availableIndicators);
  const debouncedFilters = useDebounce(state.filters, 500);

  // Early return jika idIndikator belum tersedia
  if (!debouncedFilters.idIndikator) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Statistik Produksi</h1>
          <p className="text-muted-foreground">Memuat indikator...</p>
        </div>
        <Skeleton className="h-32" />
      </div>
    );
  }

  // Data fetching dengan custom hook
  const {
    data,
    dataPembanding,
    lineChartRawData,
    annotations,
    isLoading,
    isLineChartLoading,
    mutateAnnotations
  } = useStatistikData({
    filters: {
      ...debouncedFilters,
      idIndikator: debouncedFilters.idIndikator,
      level: debouncedFilters.level as 'provinsi' | 'kabupaten'
    },
    selectedKabupaten: state.selectedKabupaten
  });

  // Ambil satuan dari indikator yang dipilih
  const selectedIndicator = availableIndicators.find(i => i.id === debouncedFilters.idIndikator);
  const satuanIndikator = selectedIndicator?.satuan_default || 'unit';

  // Process data menggunakan hooks
  const chartData = useChartDataProcessor({
    data,
    dataPembanding,
    lineChartRawData: lineChartRawData || undefined,
    annotations,
    filters: {
      bulan: state.filters.bulan,
      tahunPembanding: state.filters.tahunPembanding,
      indikatorNama: state.filters.indikatorNama
    },
    selectedYear,
    selectedKabupaten: state.selectedKabupaten,
    timeDataView: state.timeDataView,
    satuan: satuanIndikator
  });

  const kpiData = useKpiCalculations({
    totalNilai: chartData.totalNilai,
    totalNilaiPembanding: chartData.totalNilaiPembanding,
    barChartData: chartData.barChartData,
    lineChartRawData: lineChartRawData || undefined,
    filters: state.filters
  });

  // Processed data untuk komponen
  const processedData = {
    kpi: {
      total: chartData.totalNilai,
      totalPembanding: chartData.totalNilaiPembanding,
      satuan: chartData.satuan,
      wilayahTertinggi: kpiData.wilayahTertinggi ? {
        name: kpiData.wilayahTertinggi.name || '',
        nilai: kpiData.wilayahTertinggi.nilai || 0
      } : null,
      wilayahTerendah: kpiData.wilayahTerendah ? {
        name: kpiData.wilayahTerendah.name || '',
        nilai: kpiData.wilayahTerendah.nilai || 0
      } : null,
      percentageChange: kpiData.percentageChange,
      subroundTotals: kpiData.subroundTotals,
    },
    barChart: chartData.barChartData,
    lineChart: chartData.lineChartData,
    pieChart: chartData.pieChartData,
    tableData: chartData.augmentedTableData,
    bulanRangeText: chartData.bulanRangeText
  };

  // Handlers menggunakan custom hook  
  const {
    handleChartClick,
    handleBarClick,
    handleAnnotationSubmit,
    handleExportChart,
    handleExportData
  } = useStatistikHandlers({
    selectedYear,
    filters: {
      ...debouncedFilters,
      idIndikator: debouncedFilters.idIndikator!,
      level: debouncedFilters.level as 'provinsi' | 'kabupaten'
    },
    selectedKabupaten: state.selectedKabupaten,
    supabase,
    authUser,
    mutateAnnotations,
    onToggleAnnotationSheet: actions.toggleAnnotationSheet,
    onSetKabupaten: actions.setKabupaten
  });

  // Wrapper untuk annotation submit
  const handleAnnotationSubmitWrapper = async (comment: string): Promise<void> => {
    await handleAnnotationSubmit(state.selectedAnnotationPoint, comment);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistik Produksi</h1>
        <p className="text-muted-foreground">
          Visualisasikan dan bandingkan data produksi dari berbagai level dan periode waktu. 
          Gunakan filter di bawah untuk menyesuaikan data yang ditampilkan.
        </p>
      </div>

      <FilterSection
        filters={state.filters}
        availableIndicators={availableIndicators}
        selectedYear={selectedYear}
        onFilterChange={actions.setFilter}
        onIndicatorChange={actions.setIndicator}
      />
      
      <Separator />
      
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="h-[350px] lg:col-span-2" />
            <Skeleton className="h-[350px]" />
          </div>
          <Skeleton className="h-96" />
        </div>
      ) : (
        <div className="space-y-6">
          <KpiCards
            kpiData={processedData.kpi}
            indikatorNama={state.filters.indikatorNama}
            level={state.filters.level}
            tahunPembanding={state.filters.tahunPembanding}
            bulanRangeText={processedData.bulanRangeText}
          />
          
          <ChartSection
            processedData={processedData}
            filters={{
              level: state.filters.level as 'provinsi' | 'kabupaten',
              indikatorNama: state.filters.indikatorNama,
              bulan: state.filters.bulan,
              tahunPembanding: state.filters.tahunPembanding
            }}
            selectedYear={selectedYear}
            selectedKabupaten={state.selectedKabupaten}
            timeDataView={state.timeDataView}
            showLineChartLabels={state.showLineChartLabels}
            isLineChartLoading={isLineChartLoading}
            onBarClick={handleBarClick}
            onChartClick={handleChartClick}
            onKabupatenbClick={actions.setKabupaten}
            onTimeDataViewChange={actions.setTimeDataView}
            onToggleLineChartLabels={actions.toggleLineChartLabels}
            onExportChart={handleExportChart}
          />

          <DataSection
            tableData={processedData.tableData}
            indikatorNama={state.filters.indikatorNama}
            selectedYear={selectedYear}
            tahunPembanding={state.filters.tahunPembanding}
            totalNilai={processedData.kpi.total}
            totalNilaiPembanding={processedData.kpi.totalPembanding}
            isLoading={isLoading}
            onExportData={handleExportData}
          />
        </div>
      )}

      <AnnotationSheet 
        isOpen={state.isAnnotationSheetOpen} 
        onOpenChange={() => actions.toggleAnnotationSheet()} 
        annotations={annotations || []} 
        title={`Diskusi: ${state.filters.indikatorNama} - ${state.selectedAnnotationPoint?.name || ''} ${selectedYear}`} 
        onSubmit={handleAnnotationSubmitWrapper}
        selectedPoint={{
          bulan: typeof state.selectedAnnotationPoint?.bulan === 'number' ? state.selectedAnnotationPoint.bulan : null,
          kode_wilayah: typeof state.selectedAnnotationPoint?.kode_wilayah === 'string' ? state.selectedAnnotationPoint.kode_wilayah : null
        }}
      />
    </div>
  );
}
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
        {/* Loading Header */}
        <div 
          className="relative overflow-hidden rounded-xl p-4 sm:p-6 text-white shadow-xl"
          style={{
            background: 'linear-gradient(135deg, rgb(137, 132, 216) 0%, rgb(120, 115, 200) 50%, rgb(100, 95, 180) 100%)'
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">📊 Statistik Produksi</h1>
              <p className="text-white/90 text-sm sm:text-base lg:text-lg">Memuat indikator...</p>
            </div>
          </div>
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
      {/* Enhanced Header dengan desain modern dan dark mode adaptif */}
      <div 
        className="relative overflow-hidden rounded-xl p-4 sm:p-6 text-white shadow-xl"
        style={{
          background: 'linear-gradient(135deg, rgb(137, 132, 216) 0%, rgb(120, 115, 200) 50%, rgb(100, 95, 180) 100%)'
        }}
      >
        {/* Background pattern dengan dark mode adaptif */}
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent dark:from-white/3 dark:to-transparent" />
        
        {/* Decorative circles dengan dark mode adaptif */}
        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10 dark:bg-white/5 blur-xl" />
        <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5 dark:bg-white/3 blur-2xl" />
        
        <div className="relative flex flex-col gap-4 sm:gap-6 sm:flex-row sm:justify-between sm:items-center">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-white/20 dark:bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">Statistik Produksi</h1>
                <div className="flex items-center gap-1 sm:gap-2 mt-1">
                  <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-white/60 dark:bg-white/50 rounded-full" />
                  <div className="h-0.5 sm:h-1 w-6 sm:w-8 bg-white/40 dark:bg-white/30 rounded-full" />
                  <div className="h-0.5 sm:h-1 w-3 sm:w-4 bg-white/20 dark:bg-white/15 rounded-full" />
                </div>
              </div>
            </div>
            <p className="text-white/90 dark:text-white/85 text-sm sm:text-base lg:text-lg font-medium flex items-center gap-2">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Analisis dan visualisasi data produksi</span>
              <span className="font-bold bg-white/20 dark:bg-white/15 px-2 py-1 rounded-lg text-white text-sm sm:text-base">{selectedYear}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
              <span className="text-white/90 text-xs sm:text-sm font-medium">🔍 Gunakan filter untuk eksplorasi data</span>
            </div>
          </div>
        </div>
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
          {/* Skeleton untuk KPI Cards - sesuai dengan kondisi tahunPembanding */}
          <div className={`grid gap-4 md:grid-cols-2 ${state.filters.tahunPembanding !== 'tidak' ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
            {/* Total Card - selalu ada */}
            <Skeleton className="h-24" />
            {/* Tertinggi & Terendah Card - hanya jika tidak ada tahun pembanding */}
            {state.filters.tahunPembanding === 'tidak' && (
              <Skeleton className="h-24" />
            )}
            {/* Subround Card - selalu ada */}
            <Skeleton className="h-24" />
          </div>
          {/* Skeleton untuk Chart Section */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="h-[350px] lg:col-span-2" />
            <Skeleton className="h-[350px]" />
          </div>
          {/* Skeleton untuk Data Table */}
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
            processedData={{
              ...processedData,
              kpi: { satuan: processedData.kpi.satuan }
            }}
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
            satuan={processedData.kpi.satuan}
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
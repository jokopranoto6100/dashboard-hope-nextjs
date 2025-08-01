// src/app/(dashboard)/produksi-statistik/components/ChartSection.tsx
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Camera, ArrowBigLeftDash, Baseline } from "lucide-react";
import { ChartDataPoint } from "@/lib/types";
import { FULL_MONTH_NAMES } from "@/lib/utils";
import { kabMap } from "@/lib/satker-data";

const BarChartWrapper = dynamic(() => import('../bar-chart-wrapper'), { 
  ssr: false, 
  loading: () => <Skeleton className="w-full h-[300px]" /> 
});

const LineChartWrapper = dynamic(() => import('../line-chart-wrapper'), { 
  ssr: false, 
  loading: () => <Skeleton className="w-full h-[300px]" /> 
});

const PieChartWrapper = dynamic(() => import('../pie-chart-wrapper'), { 
  ssr: false, 
  loading: () => <Skeleton className="w-full h-[300px]" /> 
});

const KABUPATEN_MAP: { [key: string]: string } = kabMap.reduce((acc, curr) => {
  acc[curr.value] = curr.label;
  return acc;
}, {} as { [key: string]: string });

interface ChartSectionProps {
  processedData: {
    barChart: ChartDataPoint[];
    lineChart: ChartDataPoint[];
    pieChart: { name: string; value: number }[];
    bulanRangeText: string;
    kpi: {
      satuan: string;
    };
  };
  filters: {
    level: 'provinsi' | 'kabupaten';
    indikatorNama: string;
    bulan: string;
    tahunPembanding: string;
  };
  selectedYear: number;
  selectedKabupaten: string | null;
  timeDataView: 'bulanan' | 'subround';
  showLineChartLabels: boolean;
  isLineChartLoading: boolean;
  onBarClick: (payload: { activePayload?: { payload: ChartDataPoint }[] }) => void;
  onChartClick: (payload: ChartDataPoint) => void;
  onKabupatenbClick: (kabupaten: string | null) => void;
  onTimeDataViewChange: (view: 'bulanan' | 'subround') => void;
  onToggleLineChartLabels: () => void;
  onExportChart: (ref: React.RefObject<HTMLDivElement | null>, filename: string) => void;
}

export function ChartSection({
  processedData,
  filters,
  selectedYear,
  selectedKabupaten,
  timeDataView,
  showLineChartLabels,
  isLineChartLoading,
  onBarClick,
  onChartClick,
  onKabupatenbClick,
  onTimeDataViewChange,
  onToggleLineChartLabels,
  onExportChart
}: ChartSectionProps) {
  const barChartCardRef = useRef<HTMLDivElement>(null);
  const lineChartCardRef = useRef<HTMLDivElement>(null);
  const pieChartCardRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Bar Chart and Pie Chart Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={filters.tahunPembanding !== 'tidak' ? 'lg:col-span-3' : 'lg:col-span-2'}
        >
          <Card ref={barChartCardRef}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="min-w-0">
                <CardTitle>
                  {filters.level === 'provinsi' ? 
                    `Data ${filters.indikatorNama} Provinsi (${processedData.kpi.satuan})` : 
                    `Perbandingan ${filters.indikatorNama} Antar Kabupaten (${processedData.kpi.satuan})`
                  }
                </CardTitle>
                <CardDescription className="mt-1">
                  {`${filters.bulan === 'tahunan' ? 
                    `Data tahunan untuk ${selectedYear}` : 
                    `Data untuk bulan ${Object.values(FULL_MONTH_NAMES).find(v => v[0] === filters.bulan)?.[1] || ''} ${selectedYear}`
                  }${filters.tahunPembanding !== 'tidak' ? `, dibandingkan dengan ${filters.tahunPembanding}` : ''}`}
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onExportChart(barChartCardRef, 'perbandingan_wilayah')}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-3">
              <BarChartWrapper 
                data={processedData.barChart} 
                onClick={onBarClick} 
                dataKey1={selectedYear.toString()} 
                dataKey2={filters.tahunPembanding !== 'tidak' ? filters.tahunPembanding : undefined} 
              />
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {filters.tahunPembanding === 'tidak' && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card ref={pieChartCardRef}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="min-w-0">
                    <CardTitle>Kontribusi {filters.indikatorNama} ({processedData.kpi.satuan})</CardTitle>
                    <CardDescription className="mt-1">
                      {filters.bulan === 'tahunan'
                        ? `Data tahunan untuk ${selectedYear}`
                        : `Data untuk bulan ${Object.values(FULL_MONTH_NAMES).find(v => v[0] === filters.bulan)?.[1] || ''} ${selectedYear}`
                      }
                    </CardDescription>                  
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onExportChart(pieChartCardRef, 'kontribusi_wilayah')}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-3">
                  {(filters.level === 'kabupaten' && processedData.pieChart.length > 0) ? (
                    <PieChartWrapper data={processedData.pieChart} />
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-center text-sm text-muted-foreground">
                      <p>Grafik kontribusi hanya tersedia<br/>untuk level Kabupaten/Kota.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Line Chart */}
      <Card ref={lineChartCardRef}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 flex-grow min-w-0">
            {selectedKabupaten && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 flex-shrink-0" 
                onClick={() => onKabupatenbClick(null)} 
                aria-label="Kembali ke tampilan Provinsi"
              >
                <ArrowBigLeftDash className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-grow">
              <CardTitle>Tren Waktu: {filters.indikatorNama} ({processedData.kpi.satuan})</CardTitle>
              <CardDescription className="mt-1">
                {`${selectedKabupaten ? 
                  `Data untuk ${KABUPATEN_MAP[selectedKabupaten]}` : 
                  'Data level Provinsi'
                }, tahun ${selectedYear}${filters.tahunPembanding !== 'tidak' ? 
                  ` vs ${filters.tahunPembanding}` : 
                  ''
                }${processedData.bulanRangeText}`}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center justify-end flex-shrink-0 gap-2">
            <ToggleGroup 
              type="single" 
              variant="outline" 
              size="sm" 
              value={timeDataView} 
              onValueChange={(value) => { 
                if (value) onTimeDataViewChange(value as 'bulanan' | 'subround'); 
              }} 
              className="h-8"
            >
              <ToggleGroupItem value="bulanan" aria-label="Tampilan Bulanan">Bulanan</ToggleGroupItem>
              <ToggleGroupItem value="subround" aria-label="Tampilan Subround">Subround</ToggleGroupItem>
            </ToggleGroup>
            <Separator orientation="vertical" className="h-6"/>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              onClick={onToggleLineChartLabels} 
              aria-label="Toggle Nilai"
            >
              <Baseline className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onExportChart(lineChartCardRef, 'tren_waktu')}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          {isLineChartLoading ? (
            <Skeleton className="w-full h-[300px]" />
          ) : (
            <LineChartWrapper 
              data={processedData.lineChart} 
              dataKey1={selectedYear.toString()} 
              dataKey2={filters.tahunPembanding !== 'tidak' ? filters.tahunPembanding : undefined} 
              onPointClick={onChartClick} 
              showLabels={showLineChartLabels} 
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}

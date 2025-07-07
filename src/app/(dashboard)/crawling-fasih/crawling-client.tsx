'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useTransition } from 'react';
import Papa from 'papaparse';

import { getInitialConfig, crawlSingleDistrict, SurveyPeriod, FasihDataRow } from './_actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from './data-table';

import { Loader2, Download, Search, ChevronsUpDown, Eye, EyeOff, CheckCircle, XCircle, Terminal, Info } from 'lucide-react';
import { toast } from 'sonner';

import type { ColumnDef } from "@tanstack/react-table";

type LogEntry = {
  type: 'info' | 'success' | 'error';
  message: string;
  timestamp: string;
};

const formSchema = z.object({
  surveyId: z.string().min(1, { message: 'ID Survei wajib diisi.' }),
  cookie: z.string().min(1, { message: 'Cookie wajib diisi.' }),
  xsrfToken: z.string().min(1, { message: 'XSRF Token wajib diisi.' }),
  surveyPeriodId: z.string({ required_error: 'Periode Survei harus dipilih.' }),
  kdkab: z.string().optional().transform(e => e === "" ? undefined : e),
});
type CrawlingFormValues = z.infer<typeof formSchema>;

// Generate kolom dinamis sesuai struktur data
function getDynamicColumns(data: FasihDataRow[]): ColumnDef<FasihDataRow>[] {
  if (!data || data.length === 0) return [];
  return Object.keys(data[0] as Record<string, unknown>).map(key => ({
    accessorKey: key,
    header: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    cell: ({ row }) => {
      const value = (row.original as Record<string, unknown>)[key];
      if (value === null || value === undefined) return '';
      if (Array.isArray(value)) {
        // Kalau array of object dengan label
        if (value.every(v => typeof v === 'object' && v !== null && 'label' in v))
          return value.map(v => (v as { label: string }).label).join(', ');
        // Kalau array of string/number
        return value.join(', ');
      }
      if (typeof value === 'object') {
        if (value && 'label' in value) return (value as { label: string }).label;
        if (value && 'value' in value) return (value as { value: string }).value;
        return JSON.stringify(value); // fallback
      }
      return String(value);
    }
  }));
}


export function CrawlingClient() {
  const [isPending, startTransition] = useTransition();
  const [formStep, setFormStep] = useState<'configuring' | 'fetching_config' | 'ready_to_crawl' | 'crawling' | 'finished'>('configuring');
  const [periods, setPeriods] = useState<SurveyPeriod[]>([]);
  const [provinceId, setProvinceId] = useState<string | null>(null);
  const [districtIdMap, setDistrictIdMap] = useState<{ [key: string]: string }>({});
  const [allCrawledData, setAllCrawledData] = useState<FasihDataRow[]>([]);
  const [progressLog, setProgressLog] = useState<LogEntry[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [isCredentialsVisible, setIsCredentialsVisible] = useState(false);

  const form = useForm<CrawlingFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange"
  });

  // Watch credential values, for enabling fetch config
  const { surveyId, cookie, xsrfToken } = useWatch({ control: form.control });
  const canFetchConfig = !!(surveyId && cookie && xsrfToken);

  // Logging
  const addLog = (type: LogEntry['type'], message: string) => {
    setProgressLog(prev => [...prev, { type, message, timestamp: new Date().toLocaleTimeString('id-ID') }]);
  };

  const handleFetchConfig = async () => {
    setFormStep('fetching_config');
    const formData = new FormData();
    formData.append('surveyId', form.getValues('surveyId'));
    formData.append('cookie', form.getValues('cookie'));
    formData.append('xsrfToken', form.getValues('xsrfToken'));

    const result = await getInitialConfig(formData);
    if (result.error || !result.periods || !result.provinceId || !result.districtIdMap) {
      toast.error('Gagal Mengambil Konfigurasi', { description: result.error });
      setFormStep('configuring');
    } else {
      toast.success('Konfigurasi berhasil diambil', { description: `${result.periods.length} periode dan ${Object.keys(result.districtIdMap).length} wilayah ditemukan.` });
      setPeriods(result.periods);
      setProvinceId(result.provinceId);
      setDistrictIdMap(result.districtIdMap);
      setFormStep('ready_to_crawl');
    }
  };

  const handleCrawl = async (values: CrawlingFormValues) => {
      // 1. Lakukan pembaruan state yang harus instan di sini
      setFormStep('crawling');
      setProgressLog([]);
      setAllCrawledData([]);
      setOverallProgress(0);
      setStartTime(Date.now());
      setEndTime(null);

      // 2. Gunakan startTransition HANYA untuk membungkus logika async/berat
      startTransition(async () => {
        const regionsToCrawl = values.kdkab ? [values.kdkab] : Object.keys(districtIdMap);
        const totalRegions = regionsToCrawl.length;
        
        addLog('info', `Proses crawling dimulai untuk ${totalRegions} wilayah...`);
        
        const crawledDataBuffer: FasihDataRow[] = [];
        for (let i = 0; i < totalRegions; i++) {
          const bpsCode = regionsToCrawl[i];
          const districtId = districtIdMap[bpsCode];
          setCurrentTask(`Memproses: ${bpsCode} (${i + 1}/${totalRegions})`);
          
          const result = await crawlSingleDistrict(
            { cookie: values.cookie, xsrfToken: values.xsrfToken },
            {
              surveyPeriodId: values.surveyPeriodId,
              provinceId: provinceId!,
              districtId: districtId,
              districtBpsCode: bpsCode
            }
          );

          if (result.error || !result.data) {
            addLog('error', `Gagal memproses ${bpsCode}: ${result.error || 'Kesalahan tidak diketahui'}`);
          } else {
            addLog('success', `Selesai: ${bpsCode} - ${result.data.length} data ditemukan.`);
            crawledDataBuffer.push(...result.data);
          }
          setOverallProgress(((i + 1) / totalRegions) * 100);
        }

        setAllCrawledData(crawledDataBuffer);
        setEndTime(Date.now());
        setCurrentTask('');
        // 3. Set form step ke 'finished' di akhir transisi
        setFormStep('finished'); 
        addLog('info', 'Semua proses crawling telah selesai.');
      });
  };

  const handleDownloadCsv = () => {
    const csv = Papa.unparse(allCrawledData, { header: true });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fasih_crawl_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Output Panel Komponen
  const OutputPanel = () => {
    if (formStep === 'configuring' || formStep === 'fetching_config' || formStep === 'ready_to_crawl') {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Petunjuk</AlertTitle>
          <AlertDescription>
            Silakan isi form konfigurasi di sebelah kiri. Klik "Ambil Konfigurasi" setelah semua kredensial diisi untuk memulai.
          </AlertDescription>
        </Alert>
      );
    }
    if (formStep === 'crawling') {
      return (
        <Card>
          <CardHeader><CardTitle>Proses Crawling Berjalan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-sm font-medium">{currentTask}</p>
                <p className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</p>
              </div>
              <Progress value={overallProgress} />
            </div>
            <ScrollArea className="h-72 w-full rounded-md border p-4 font-mono text-sm">
              {progressLog.map((log, index) => (
                <div key={index} className="flex items-start mb-2">
                  {log.type === 'info' && <Terminal className="h-4 w-4 mr-2 mt-0.5" />}
                  {log.type === 'success' && <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 dark:text-green-400" />}
                  {log.type === 'error' && <XCircle className="h-4 w-4 mr-2 mt-0.5 text-red-500 dark:text-red-400" />}
                  <span className="flex-1">
                    <span className="text-muted-foreground mr-2">{log.timestamp}</span>
                    {log.message}
                  </span>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      );
    }
    if (formStep === 'finished') {
      console.log("Hasil data crawling:", allCrawledData);
      const duration = endTime && startTime ? ((endTime - startTime) / 1000).toFixed(2) : 0;
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><CheckCircle className="h-5 w-5 mr-2 text-green-500 dark:text-green-400" /> Proses Selesai</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-muted-foreground">Total Data</p><p className="font-semibold text-lg">{allCrawledData.length} baris</p></div>
              <div><p className="text-muted-foreground">Wilayah Diproses</p><p className="font-semibold text-lg">{progressLog.filter(l => l.type === 'success').length}</p></div>
              <div><p className="text-muted-foreground">Waktu Proses</p><p className="font-semibold text-lg">{duration} detik</p></div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleDownloadCsv}>
                <Download className="mr-2 h-4 w-4" />
                Download {allCrawledData.length} Baris (.csv)
              </Button>
            </CardFooter>
          </Card>
          {/* Tabel dinamis scrollable */}
          {allCrawledData.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <DataTable columns={getDynamicColumns(allCrawledData)} data={allCrawledData} />
            </div>
          )}
        </div>
      );
    }
    return null;
  };

// ========================== RETURN LAYOUT ==========================
  return (
    <div className="flex justify-center">
     <div className="w-full flex flex-col md:flex-row gap-8 px-4 md:px-8 pt-6">
        {/* Kolom Kiri: Form Konfigurasi */}
        <div className="w-full md:max-w-md flex-shrink-0">
          <Card>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCrawl)}>
                <CardContent className="space-y-6 pt-6">
                  {/* Bagian ID Survei & Kredensial */}
                  <FormField name="surveyId" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Survei</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan ID Survei..." {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <div className="space-y-2">
                    <Button type="button" variant="link" onClick={() => setIsCredentialsVisible(!isCredentialsVisible)} className="p-0 h-auto text-sm text-muted-foreground font-medium hover:underline">
                      <span className="flex items-center">
                          <ChevronsUpDown className="h-4 w-4 mr-2" />
                          {isCredentialsVisible ? 'Sembunyikan' : 'Tampilkan'} Pengaturan Kredensial
                      </span>
                    </Button>
                    {isCredentialsVisible && (
                      <div className="space-y-4 pt-2 border-t mt-2">
                        <FormField name="xsrfToken" control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormLabel>XSRF-TOKEN</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input type={showCredentials ? 'text' : 'password'}
                                  placeholder="Tempel XSRF Token..."
                                  className="pr-14"
                                  {...field}
                                  value={field.value ?? ''} />
                              </FormControl>
                              <Button type="button" variant="ghost" size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                onClick={() => setShowCredentials(!showCredentials)}>
                                {showCredentials ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}/>
                        <FormField name="cookie" control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cookie</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input type={showCredentials ? 'text' : 'password'}
                                  placeholder="Tempel nilai Cookie..."
                                  className="pr-14"
                                  {...field}
                                  value={field.value ?? ''} />
                              </FormControl>
                              <Button type="button" variant="ghost" size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                onClick={() => setShowCredentials(!showCredentials)}>
                                {showCredentials ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}/>
                      </div>
                    )}
                  </div>
                  
                  {/* --- BLOK PERUBAHAN UTAMA DIMULAI DI SINI --- */}

                  {/* Tombol Ambil Konfigurasi dibuat full-width dalam div-nya sendiri */}
                  <div className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFetchConfig}
                      disabled={!canFetchConfig || formStep === 'fetching_config' || formStep === 'crawling'}
                      className="w-full"
                    >
                      {formStep === 'fetching_config' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                      Ambil Konfigurasi
                    </Button>
                  </div>
                  
                  {/* Wrapper kondisional untuk menampilkan blok di bawah ini HANYA setelah konfigurasi diambil */}
                  {(formStep === 'ready_to_crawl' || formStep === 'crawling' || formStep === 'finished') && (
                    <div className="pt-4 border-t">
                      {/* Flex container untuk menempatkan Periode dan Wilayah bersebelahan */}
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Kolom Periode */}
                        <div className="flex-1">
                           <FormField control={form.control} name="surveyPeriodId" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Periode Survei</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={formStep === 'crawling'}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih periode" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {periods.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}/>
                        </div>
                        
                        {/* Kolom Wilayah (hanya tampil jika ada data wilayah) */}
                        {Object.keys(districtIdMap).length > 0 && (
                          <div className="flex-1">
                            <FormField
                              control={form.control}
                              name="kdkab"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Wilayah (Opsional)</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={formStep === 'crawling'}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Semua Wilayah" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="__ALL__">Semua Wilayah</SelectItem>
                                      {Object.keys(districtIdMap).map((kdkab) => (
                                        <SelectItem key={kdkab} value={kdkab}>
                                          {kdkab} 
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* --- BLOK PERUBAHAN UTAMA SELESAI --- */}

                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full mt-3" disabled={formStep !== 'ready_to_crawl' || isPending}>
                    {isPending ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sedang Berjalan...
                      </span>
                    ) : ( '🚀 Mulai Crawling' )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
        
        {/* Kolom Kanan: Output/Progres */}
        <div className="w-full min-w-0 md:min-w-0 md:max-w-5xl">
          <OutputPanel />
        </div>
      </div>
    </div>
  );
}

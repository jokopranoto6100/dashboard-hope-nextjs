// src/app/(dashboard)/evaluasi/ubinan/karakteristik/components/RingkasanTab.tsx

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MapPin,
  Target,
  PieChart,
  Award,
  Beaker,
  Gift,
  Handshake,
  BarChart3,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { type CharacteristicsSummary } from '../types';

interface RingkasanTabProps {
  data: CharacteristicsSummary;
  isLoading: boolean;
}

export function RingkasanTab({ data, isLoading }: RingkasanTabProps) {
  const overallStats = useMemo(() => {
    // Hitung dari data agregat yang sudah ada
    const sawahIrigasi = data.jenisLahan.find(item => item.label === 'Sawah Irigasi')?.percentage || 0;
    const monokultur = data.caraPenanaman.find(item => item.label === 'Monokultur')?.percentage || 0;
    const jajarLegowo = data.jajarLegowo.find(item => item.label === 'Ya')?.percentage || 0;
    const hibrida = data.jenisVarietas.find(item => item.label === 'Hibrida')?.percentage || 0;
    const menggunakanPupuk = data.penggunaanPupuk.find(item => item.label === 'Ya')?.percentage || 0;
    const bantuanBenih = data.bantuanBenih.find(item => item.label === 'Ya')?.percentage || 0;
    const bantuanPupuk = data.bantuanPupuk.filter(item => 
      item.label !== 'Tidak' && item.label !== 'Tidak Diketahui'
    ).reduce((sum, item) => sum + item.percentage, 0);
    const anggotaPoktan = data.anggotaPoktan.find(item => item.label === 'Ya')?.percentage || 0;

    return {
      total_sampel: data.totalSampel,
      rata_rata_luas: data.rataRataLuas,
      pct_sawah_irigasi: sawahIrigasi.toFixed(1),
      pct_monokultur: monokultur.toFixed(1),
      pct_jajar_legowo: jajarLegowo.toFixed(1),
      pct_hibrida: hibrida.toFixed(1),
      pct_menggunakan_pupuk: menggunakanPupuk.toFixed(1),
      pct_bantuan_benih: bantuanBenih.toFixed(1),
      pct_bantuan_pupuk: bantuanPupuk.toFixed(1),
      pct_anggota_poktan: anggotaPoktan.toFixed(1),
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Sampel</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {overallStats.total_sampel.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Rata² Luas</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {overallStats.rata_rata_luas.toFixed(2)} ha
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Sawah Irigasi</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {overallStats.pct_sawah_irigasi}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Monokultur</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {overallStats.pct_monokultur}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Hibrida</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {overallStats.pct_hibrida}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Beaker className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Pakai Pupuk</p>
                  <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
                    {overallStats.pct_menggunakan_pupuk}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Bantuan Benih</p>
                  <p className="text-lg font-bold text-pink-600 dark:text-pink-400">
                    {overallStats.pct_bantuan_benih}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Anggota Poktan</p>
                  <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                    {overallStats.pct_anggota_poktan}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Karakteristik Lahan */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Karakteristik Lahan
              </CardTitle>
              <CardDescription>
                Analisis kondisi dan teknik budidaya lahan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm font-medium">Sawah Irigasi</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {overallStats.pct_sawah_irigasi}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <span className="text-sm font-medium">Monokultur</span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {overallStats.pct_monokultur}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm font-medium">Jajar Legowo</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {overallStats.pct_jajar_legowo}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Teknologi Pertanian */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Teknologi Pertanian
              </CardTitle>
              <CardDescription>
                Penggunaan varietas unggul dan pupuk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <span className="text-sm font-medium">Varietas Hibrida</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {overallStats.pct_hibrida}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <span className="text-sm font-medium">Menggunakan Pupuk</span>
                  <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                    {overallStats.pct_menggunakan_pupuk}%
                  </span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Rata-rata luas lahan: <strong>{overallStats.rata_rata_luas.toFixed(2)} ha</strong>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dukungan Program */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                Dukungan Program
              </CardTitle>
              <CardDescription>
                Partisipasi dalam program pemerintah
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <span className="text-sm font-medium">Bantuan Benih</span>
                  <span className="text-lg font-bold text-pink-600 dark:text-pink-400">
                    {overallStats.pct_bantuan_benih}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm font-medium">Bantuan Pupuk</span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {overallStats.pct_bantuan_pupuk}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <span className="text-sm font-medium">Anggota Poktan</span>
                  <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                    {overallStats.pct_anggota_poktan}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              Ringkasan Analisis Karakteristik
            </CardTitle>
            <CardDescription>
              Insight dan rekomendasi berdasarkan data karakteristik sampel ubinan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Findings */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Temuan Utama</h4>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p>
                      <strong>{overallStats.pct_sawah_irigasi}%</strong> lahan menggunakan sistem irigasi yang baik
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                    <p>
                      <strong>{overallStats.pct_hibrida}%</strong> petani menggunakan varietas hibrida unggul
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                    <p>
                      <strong>{overallStats.pct_menggunakan_pupuk}%</strong> petani menerapkan pemupukan yang tepat
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                    <p>
                      Program bantuan benih mencapai <strong>{overallStats.pct_bantuan_benih}%</strong> petani
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Rekomendasi</h4>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="font-medium text-green-800 dark:text-green-200">Pertahankan Kualitas</p>
                    <p>Tingkat penggunaan teknologi dan program bantuan sudah baik</p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="font-medium text-orange-800 dark:text-orange-200">Tingkatkan Partisipasi</p>
                    <p>Perluas jangkauan program bantuan dan keanggotaan poktan</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="font-medium text-blue-800 dark:text-blue-200">Modernisasi Lanjutan</p>
                    <p>Dorong adopsi teknologi jajar legowo dan varietas unggul</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

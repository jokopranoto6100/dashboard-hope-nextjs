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
      {/* Overview Statistics Cards - 4 KPIs per row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-24">
            <CardContent className="p-4 h-full flex items-center">
              <div className="flex items-center gap-2 w-full">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Total Sampel</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
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
          <Card className="h-24">
            <CardContent className="p-4 h-full flex items-center">
              <div className="flex items-center gap-2 w-full">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Rata² Luas</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400 truncate">
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
          <Card className="h-24">
            <CardContent className="p-4 h-full flex items-center">
              <div className="flex items-center gap-2 w-full">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Sawah Irigasi</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400 truncate">
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
          <Card className="h-24">
            <CardContent className="p-4 h-full flex items-center">
              <div className="flex items-center gap-2 w-full">
                <PieChart className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Monokultur</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400 truncate">
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
          <Card className="h-24">
            <CardContent className="p-4 h-full flex items-center">
              <div className="flex items-center gap-2 w-full">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Hibrida</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 truncate">
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
          <Card className="h-24">
            <CardContent className="p-4 h-full flex items-center">
              <div className="flex items-center gap-2 w-full">
                <Beaker className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Pakai Pupuk</p>
                  <p className="text-lg font-bold text-teal-600 dark:text-teal-400 truncate">
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
          <Card className="h-24">
            <CardContent className="p-4 h-full flex items-center">
              <div className="flex items-center gap-2 w-full">
                <Gift className="w-5 h-5 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Bantuan Benih</p>
                  <p className="text-lg font-bold text-pink-600 dark:text-pink-400 truncate">
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
          <Card className="h-24">
            <CardContent className="p-4 h-full flex items-center">
              <div className="flex items-center gap-2 w-full">
                <Handshake className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Anggota Poktan</p>
                  <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400 truncate">
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
    </div>
  );
}

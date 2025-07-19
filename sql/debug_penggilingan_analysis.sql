-- Analisis data penggilingan untuk Kabupaten Sanggau (6105)
-- Berdasarkan data INSERT yang diberikan

-- 1. Ekstrak dan hitung manual dari data yang diberikan
WITH penggilingan_data AS (
  SELECT 
    '828' as id, '61' as kdprov, 'KALIMANTAN BARAT' as nmprov, '6105' as kdkab, 'SANGGAU' as nmkab, 
    '010' as kdkec, 'TOBA' as nmkec, '003' as kddesa, 'KAMPUNG BARU' as nmdesa, 'U' as flag_sampel
  UNION ALL SELECT '829', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '020', 'MELIAU', '005', 'SUNGAI KEMBAYAU', 'U'
  UNION ALL SELECT '830', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '060', 'KAPUAS', '003', 'RAMBIN', 'U'
  UNION ALL SELECT '831', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '060', 'KAPUAS', '011', 'BELANGIN', 'U'
  UNION ALL SELECT '832', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '060', 'KAPUAS', '018', 'LAPE', 'U'
  UNION ALL SELECT '833', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '060', 'KAPUAS', '022', 'MENGKIANG', 'U'
  UNION ALL SELECT '834', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '060', 'KAPUAS', '023', 'ENTAKAI', 'U'
  UNION ALL SELECT '835', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '060', 'KAPUAS', '024', 'KAMBONG', 'U'
  UNION ALL SELECT '836', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '070', 'MUKOK', '003', 'SEMUNTAI', 'U'
  UNION ALL SELECT '837', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '120', 'JANGKANG', '004', 'SEMIRAU', 'U'
  UNION ALL SELECT '838', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '120', 'JANGKANG', '007', 'EMPIYANG', 'U'
  UNION ALL SELECT '839', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '120', 'JANGKANG', '008', 'JANGKANG BENUA', 'U'
  UNION ALL SELECT '840', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '120', 'JANGKANG', '009', 'TANGGUNG', 'U'
  UNION ALL SELECT '841', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '120', 'JANGKANG', '009', 'TANGGUNG', 'U'
  UNION ALL SELECT '842', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '130', 'BONTI', '005', 'EMPODIS', 'U'
  UNION ALL SELECT '843', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '140', 'PARINDU', '003', 'PANDU RAYA', 'U'
  UNION ALL SELECT '844', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '140', 'PARINDU', '007', 'SUKA MULYA', 'U'
  UNION ALL SELECT '845', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '140', 'PARINDU', '011', 'HIBUN', 'U'
  UNION ALL SELECT '846', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '150', 'TAYAN HILIR', '012', 'SEJOTANG', 'U'
  UNION ALL SELECT '847', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '160', 'BALAI', '003', 'COWET', 'U'
  UNION ALL SELECT '848', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '160', 'BALAI', '007', 'KEBADU', 'U'
  UNION ALL SELECT '849', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '160', 'BALAI', '011', 'PADI KAYE', 'U'
  UNION ALL SELECT '850', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '170', 'TAYAN HULU', '002', 'BINJAI', 'U'
  UNION ALL SELECT '851', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '170', 'TAYAN HULU', '004', 'KEDAKAS', 'U'
  UNION ALL SELECT '852', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '170', 'TAYAN HULU', '007', 'MANDONG', 'U'
  UNION ALL SELECT '853', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '170', 'TAYAN HULU', '008', 'JANJANG', 'U'
  UNION ALL SELECT '854', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '170', 'TAYAN HULU', '011', 'ENGKASAN', 'U'
  UNION ALL SELECT '855', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '190', 'BEDUAI', '005', 'MAWANG MUDA', 'U'
  UNION ALL SELECT '856', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '200', 'NOYAN', '005', 'NOYAN', 'U'
  UNION ALL SELECT '857', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '210', 'SEKAYAM', '002', 'PENGADANG', 'U'
  UNION ALL SELECT '858', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '210', 'SEKAYAM', '005', 'ENGKAHAN', 'U'
  UNION ALL SELECT '859', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '210', 'SEKAYAM', '010', 'SEI TEKAM', 'U'
  UNION ALL SELECT '860', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '220', 'ENTIKONG', '001', 'NEKAN', 'U'
  UNION ALL SELECT '861', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '220', 'ENTIKONG', '003', 'ENTIKONG', 'U'
  UNION ALL SELECT '862', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '220', 'ENTIKONG', '005', 'SURUH TEMBAWANG', 'U'
  -- Data C (Cadangan)
  UNION ALL SELECT '863', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '010', 'TOBA', '006', 'BALAI BELUNGAI', 'C'
  UNION ALL SELECT '864', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '020', 'MELIAU', '013', 'MERANGGAU', 'C'
  UNION ALL SELECT '865', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '060', 'KAPUAS', '012', 'PENYELADI', 'C'
  UNION ALL SELECT '866', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '060', 'KAPUAS', '019', 'SUNGAI MAWANG', 'C'
  UNION ALL SELECT '867', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '060', 'KAPUAS', '023', 'ENTAKAI', 'C'
  UNION ALL SELECT '868', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '120', 'JANGKANG', '001', 'TERATI', 'C'
  UNION ALL SELECT '869', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '120', 'JANGKANG', '005', 'BALAI SEBUT', 'C'
  UNION ALL SELECT '870', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '120', 'JANGKANG', '008', 'JANGKANG BENUA', 'C'
  UNION ALL SELECT '871', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '120', 'JANGKANG', '008', 'JANGKANG BENUA', 'C'
  UNION ALL SELECT '872', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '120', 'JANGKANG', '009', 'TANGGUNG', 'C'
  UNION ALL SELECT '873', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '120', 'JANGKANG', '012', 'DESA PERSIAPAN MENYONGKA ELOK', 'C'
  UNION ALL SELECT '874', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '140', 'PARINDU', '001', 'MARITA', 'C'
  UNION ALL SELECT '875', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '140', 'PARINDU', '003', 'PANDU RAYA', 'C'
  UNION ALL SELECT '876', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '140', 'PARINDU', '010', 'SEBARA', 'C'
  UNION ALL SELECT '877', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '140', 'PARINDU', '013', 'MARINGIN JAYA', 'C'
  UNION ALL SELECT '878', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '160', 'BALAI', '001', 'SEMONCOL', 'C'
  UNION ALL SELECT '879', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '160', 'BALAI', '004', 'BULU BALA', 'C'
  UNION ALL SELECT '880', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '160', 'BALAI', '010', 'TAE', 'C'
  UNION ALL SELECT '881', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '170', 'TAYAN HULU', '001', 'MENYABO', 'C'
  UNION ALL SELECT '882', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '170', 'TAYAN HULU', '003', 'PANDAN SEMBUAT', 'C'
  UNION ALL SELECT '883', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '170', 'TAYAN HULU', '006', 'PERUAN DALAM', 'C'
  UNION ALL SELECT '884', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '170', 'TAYAN HULU', '008', 'JANJANG', 'C'
  UNION ALL SELECT '885', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '170', 'TAYAN HULU', '010', 'BERAKAK', 'C'
  UNION ALL SELECT '886', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '180', 'KEMBAYAN', '007', 'SEBONGKUH', 'C'
  UNION ALL SELECT '887', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '200', 'NOYAN', '003', 'SUNGAI DANGIN', 'C'
  UNION ALL SELECT '888', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '210', 'SEKAYAM', '001', 'SOTOK', 'C'
  UNION ALL SELECT '889', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '210', 'SEKAYAM', '005', 'ENGKAHAN', 'C'
  UNION ALL SELECT '890', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '210', 'SEKAYAM', '007', 'BUNGKANG', 'C'
  UNION ALL SELECT '891', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '210', 'SEKAYAM', '008', 'LUBUK SABUK', 'C'
  UNION ALL SELECT '892', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '210', 'SEKAYAM', '010', 'SEI TEKAM', 'C'
  UNION ALL SELECT '893', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '220', 'ENTIKONG', '002', 'SEMANGET', 'C'
  UNION ALL SELECT '894', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '220', 'ENTIKONG', '004', 'PALA PASANG', 'C'
  UNION ALL SELECT '895', '61', 'KALIMANTAN BARAT', '6105', 'SANGGAU', '220', 'ENTIKONG', '005', 'SURUH TEMBAWANG', 'C'
),

-- Hitung berdasarkan desa (menggunakan kombinasi kddesa + kdkec untuk menghindari duplikasi)
desa_count AS (
  SELECT 
    COUNT(DISTINCT CASE WHEN flag_sampel = 'U' THEN kddesa || '_' || kdkec END) as total_desa_u,
    COUNT(DISTINCT CASE WHEN flag_sampel = 'C' THEN kddesa || '_' || kdkec END) as total_desa_c
  FROM penggilingan_data
),

-- Hitung berdasarkan kecamatan
kecamatan_count AS (
  SELECT 
    COUNT(DISTINCT CASE WHEN flag_sampel = 'U' THEN kdkec END) as total_kecamatan_u,
    COUNT(DISTINCT CASE WHEN flag_sampel = 'C' THEN kdkec END) as total_kecamatan_c
  FROM penggilingan_data
),

-- Detail breakdown per kecamatan untuk U
kecamatan_u_detail AS (
  SELECT DISTINCT kdkec, nmkec, COUNT(*) as total_u_records
  FROM penggilingan_data 
  WHERE flag_sampel = 'U'
  GROUP BY kdkec, nmkec
  ORDER BY kdkec
),

-- Detail breakdown per kecamatan untuk C
kecamatan_c_detail AS (
  SELECT DISTINCT kdkec, nmkec, COUNT(*) as total_c_records
  FROM penggilingan_data 
  WHERE flag_sampel = 'C'
  GROUP BY kdkec, nmkec
  ORDER BY kdkec
),

-- Detail breakdown per desa untuk U
desa_u_detail AS (
  SELECT DISTINCT kdkec, nmkec, kddesa, nmdesa
  FROM penggilingan_data 
  WHERE flag_sampel = 'U'
  ORDER BY kdkec, kddesa
),

-- Detail breakdown per desa untuk C
desa_c_detail AS (
  SELECT DISTINCT kdkec, nmkec, kddesa, nmdesa
  FROM penggilingan_data 
  WHERE flag_sampel = 'C'
  ORDER BY kdkec, kddesa
)

-- Tampilkan summary count
SELECT 
  'SUMMARY COUNT' as info,
  dc.total_desa_u,
  dc.total_desa_c,
  kc.total_kecamatan_u,
  kc.total_kecamatan_c
FROM desa_count dc, kecamatan_count kc;

-- Tampilkan detail kecamatan U
SELECT 'KECAMATAN U DETAIL:' as info, NULL as kdkec, NULL as nmkec, NULL as count_records;
SELECT NULL as info, kdkec, nmkec, total_u_records as count_records FROM kecamatan_u_detail;

-- Tampilkan detail kecamatan C  
SELECT 'KECAMATAN C DETAIL:' as info, NULL as kdkec, NULL as nmkec, NULL as count_records;
SELECT NULL as info, kdkec, nmkec, total_c_records as count_records FROM kecamatan_c_detail;

-- Tampilkan detail desa U
SELECT 'DESA U DETAIL:' as info, NULL as kdkec, NULL as nmkec, NULL as kddesa, NULL as nmdesa;
SELECT NULL as info, kdkec, nmkec, kddesa, nmdesa FROM desa_u_detail;

-- Tampilkan detail desa C
SELECT 'DESA C DETAIL:' as info, NULL as kdkec, NULL as nmkec, NULL as kddesa, NULL as nmdesa;
SELECT NULL as info, kdkec, nmkec, kddesa, nmdesa FROM desa_c_detail;

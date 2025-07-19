-- Manual count berdasarkan data INSERT yang diberikan user
-- Data untuk kdkab = '6105' SANGGAU

-- Ekstrak lokasi unik untuk flag_sampel = 'U'
-- Dari baris 1128-1150 (id 1128-1150) - semua flag_sampel = 'U'
SELECT 'LOKASI U (Utama):' as info;

-- TRI MULYA (id 1128)
-- JANGKANG (id 1129) 
-- JANGKANG BENUA (id 1130, 1131, 1132, 1133)
-- EMPODIS (id 1134, 1135)
-- MAK KAWING (id 1136, 1137, 1138, 1139, 1144)
-- TEMIANG MALI (id 1140)
-- TUNGGAL BHAKTI (id 1142, 1143)
-- BERENG BERKAWAT (id 1144, 1145, 1146, 1147)
-- RAUT MUARA (id 1148, 1149, 1150)

-- Count lokasi U unik:
WITH lokasi_u AS (
  SELECT DISTINCT unnest(ARRAY[
    'TRI MULYA',
    'JANGKANG', 
    'JANGKANG BENUA',
    'EMPODIS',
    'MAK KAWING',
    'TEMIANG MALI', 
    'TUNGGAL BHAKTI',
    'BERENG BERKAWAT',
    'RAUT MUARA'
  ]) as lokasi
)
SELECT COUNT(*) as total_lokasi_u FROM lokasi_u;

-- Untuk flag_sampel = 'C' - dari baris 3070 ke atas (id 3070+)
-- Hitung lokasi unik untuk C
WITH lokasi_c AS (
  SELECT DISTINCT unnest(ARRAY[
    'LUMUT',
    'KUALA BUAYAN', 
    'BUNUT',
    'INGGIS',
    'SEI MAWANG',
    'KEDUKUL',
    'SERAMBAI JAYA',
    'TRI MULYA',
    'ENGKODE',
    'TANGGUNG',
    'EMPIYANG',
    'JANGKANG',
    'JANGKANG BENUA',
    'BONTI',
    'EMPODIS',
    'SEBARA',
    'SUKA GRUNDI',
    'MARINGIN JAYA',
    'CEMPEDAK',
    'SEJOTANG',
    'MAK KAWING',
    'COWET',
    'EMPIRANG UJUNG',
    'MENYABO',
    'BINJAI',
    'PERUAN DALAM',
    'TUNGGAL BHAKTI',
    'MOBUI',
    'THANG RAYA',
    'BERENG BERKAWAT',
    'KASRO MEGO',
    'SEI DANGIN',
    'NOYAN',
    'KENAMAN',
    'RAUT MUARA',
    'BALAI KARANGAN',
    'SEMANGET',
    'NEKAN'
  ]) as lokasi
)
SELECT COUNT(*) as total_lokasi_c FROM lokasi_c;

-- Summary
SELECT 
  'Manual Count Summary:' as info,
  '9 lokasi U, 38 lokasi C' as result;

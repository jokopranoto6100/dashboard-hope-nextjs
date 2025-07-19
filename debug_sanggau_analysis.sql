-- Analisis Data SKGB Pengeringan untuk Kabupaten SANGGAU (6105)
-- Berdasarkan data yang diberikan user

-- Mencari lokasi unik dengan flag_sampel = 'U'
WITH data_u AS (
    SELECT DISTINCT lokasi, flag_sampel
    FROM (
        VALUES 
        ('TRI MULYA', 'U'),
        ('JANGKANG', 'U'),
        ('JANGKANG BENUA', 'U'),
        ('JANGKANG BENUA', 'U'),
        ('JANGKANG BENUA', 'U'),
        ('JANGKANG BENUA', 'U'),
        ('EMPODIS', 'U'),
        ('EMPODIS', 'U'),
        ('MAK KAWING', 'U'),
        ('MAK KAWING', 'U'),
        ('MAK KAWING', 'U'),
        ('MAK KAWING', 'U'),
        ('TEMIANG MALI', 'U'),
        ('MAK KAWING', 'U'),
        ('TUNGGAL BHAKTI', 'U'),
        ('TUNGGAL BHAKTI', 'U'),
        ('BERENG BERKAWAT', 'U'),
        ('BERENG BERKAWAT', 'U'),
        ('BERENG BERKAWAT', 'U'),
        ('KASRO MEGO', 'U'),
        ('RAUT MUARA', 'U'),
        ('RAUT MUARA', 'U'),
        ('RAUT MUARA', 'U')
    ) AS t(lokasi, flag_sampel)
    WHERE flag_sampel = 'U'
),

-- Mencari lokasi unik dengan flag_sampel = 'C'
data_c AS (
    SELECT DISTINCT lokasi, flag_sampel
    FROM (
        VALUES 
        ('LUMUT', 'C'),
        ('KUALA BUAYAN', 'C'),
        ('BUNUT', 'C'),
        ('INGGIS', 'C'),
        ('SEI MAWANG', 'C'),
        ('KEDUKUL', 'C'),
        ('SERAMBAI JAYA', 'C'),
        ('TRI MULYA', 'C'),
        ('ENGKODE', 'C'),
        ('TANGGUNG', 'C'),
        ('EMPIYANG', 'C'),
        ('JANGKANG', 'C'),
        ('JANGKANG BENUA', 'C'),
        ('BONTI', 'C'),
        ('EMPODIS', 'C'),
        ('SEBARA', 'C'),
        ('SUKA GRUNDI', 'C'),
        ('MARINGIN JAYA', 'C'),
        ('CEMPEDAK', 'C'),
        ('SEJOTANG', 'C'),
        ('MAK KAWING', 'C'),
        ('COWET', 'C'),
        ('EMPIRANG UJUNG', 'C'),
        ('MENYABO', 'C'),
        ('BINJAI', 'C'),
        ('PERUAN DALAM', 'C'),
        ('TUNGGAL BHAKTI', 'C'),
        ('MOBUI', 'C'),
        ('THANG RAYA', 'C'),
        ('BERENG BERKAWAT', 'C'),
        ('KASRO MEGO', 'C'),
        ('SEI DANGIN', 'C'),
        ('NOYAN', 'C'),
        ('KENAMAN', 'C'),
        ('RAUT MUARA', 'C'),
        ('BALAI KARANGAN', 'C'),
        ('SEMANGET', 'C'),
        ('NEKAN', 'C')
    ) AS t(lokasi, flag_sampel)
    WHERE flag_sampel = 'C'
)

-- Hitung total lokasi U dan C
SELECT 
    'U' as flag_sampel,
    COUNT(DISTINCT lokasi) as total_lokasi
FROM data_u
UNION ALL
SELECT 
    'C' as flag_sampel,
    COUNT(DISTINCT lokasi) as total_lokasi
FROM data_c;

-- Daftar lokasi unik untuk U
SELECT 'Lokasi U:' as kategori, NULL as no, NULL as lokasi
UNION ALL
SELECT '', ROW_NUMBER() OVER (ORDER BY lokasi), lokasi
FROM (SELECT DISTINCT lokasi FROM data_u) t
UNION ALL
SELECT '', NULL, NULL
UNION ALL
-- Daftar lokasi unik untuk C  
SELECT 'Lokasi C:' as kategori, NULL as no, NULL as lokasi
UNION ALL
SELECT '', ROW_NUMBER() OVER (ORDER BY lokasi), lokasi
FROM (SELECT DISTINCT lokasi FROM data_c) t;

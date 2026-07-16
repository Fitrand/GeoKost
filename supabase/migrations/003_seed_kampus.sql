-- =============================================
-- Migration 003: Seed Data Kampus (Malang, Jawa Timur)
-- Koordinat menggunakan format POINT(longitude latitude)
-- =============================================

INSERT INTO kampus (nama, singkatan, kota, provinsi, alamat, koordinat) VALUES
(
    'Universitas Brawijaya',
    'UB',
    'Malang',
    'Jawa Timur',
    'Jl. Veteran, Ketawanggede, Kec. Lowokwaru, Kota Malang',
    ST_GeomFromText('POINT(112.614435 -7.952317)', 4326)
),
(
    'Universitas Negeri Malang',
    'UM',
    'Malang',
    'Jawa Timur',
    'Jl. Semarang No.5, Sumbersari, Kec. Lowokwaru, Kota Malang',
    ST_GeomFromText('POINT(112.619720 -7.965340)', 4326)
),
(
    'Universitas Islam Negeri Maulana Malik Ibrahim',
    'UIN Malang',
    'Malang',
    'Jawa Timur',
    'Jl. Gajayana No.50, Dinoyo, Kec. Lowokwaru, Kota Malang',
    ST_GeomFromText('POINT(112.606950 -7.955360)', 4326)
),
(
    'Politeknik Negeri Malang',
    'POLINEMA',
    'Malang',
    'Jawa Timur',
    'Jl. Soekarno Hatta No.9, Jatimulyo, Kec. Lowokwaru, Kota Malang',
    ST_GeomFromText('POINT(112.614700 -7.979150)', 4326)
),
(
    'Institut Teknologi Nasional Malang',
    'ITN Malang',
    'Malang',
    'Jawa Timur',
    'Jl. Bendungan Sigura-gura No.2, Sumbersari, Kec. Lowokwaru, Kota Malang',
    ST_GeomFromText('POINT(112.613560 -7.957820)', 4326)
);

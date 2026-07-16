import sys
import os
import random

# Add backend dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.kampus import Kampus
from app.models.kost import Kost

KAMPUS_DATA = [
    {
        "nama": "Universitas Malikussaleh - Kampus Bukit Indah",
        "singkatan": "UNIMAL Bukit Indah",
        "kota": "Lhokseumawe",
        "provinsi": "Aceh",
        "alamat": "Jl. Batam, Blang Pulo, Kec. Muara Satu, Kota Lhokseumawe, Aceh 24351",
        "lat": 5.2030,
        "lng": 97.0627,
        "logo_url": "https://unimal.ac.id/images/logo_unimal.png"
    },
    {
        "nama": "Universitas Malikussaleh - Kampus Reuleut",
        "singkatan": "UNIMAL Reuleut",
        "kota": "Aceh Utara",
        "provinsi": "Aceh",
        "alamat": "Reuleut Tim., Kec. Muara Batu, Kabupaten Aceh Utara, Aceh 24354",
        "lat": 5.2393,
        "lng": 96.9856,
        "logo_url": "https://unimal.ac.id/images/logo_unimal.png"
    },
    {
        "nama": "Politeknik Negeri Lhokseumawe",
        "singkatan": "PNL",
        "kota": "Lhokseumawe",
        "provinsi": "Aceh",
        "alamat": "Jl. Banda Aceh-Medan Km. 280,3, Buketrata, Mesjid Punteut, Blang Mangat, Lhokseumawe 24301",
        "lat": 5.1920,
        "lng": 97.1245,
        "logo_url": "https://pnl.ac.id/images/logo_pnl.png"
    }
]

KOST_DATA = [
    # Zona Reuleut (Dekat UNIMAL Reuleut) - Lebih murah, standar
    {
        "nama": "Kost Amanah Reuleut", "harga": 450000, "tipe": "putra", "luas": 9,
        "alamat": "Jl. Desa Reuleut Tim., Muara Batu", "lat": 5.2401, "lng": 96.9865,
        "fasilitas": ["Kamar Mandi Luar", "Lemari", "Kasur"], "rating": 4
    },
    {
        "nama": "Griya Putri Reuleut", "harga": 500000, "tipe": "putri", "luas": 12,
        "alamat": "Jl. Depan Kampus Reuleut", "lat": 5.2385, "lng": 96.9840,
        "fasilitas": ["Kamar Mandi Dalam", "Meja Belajar", "WiFi 20Mbps"], "rating": 5
    },
    
    # Zona Blang Pulo (Dekat UNIMAL Bukit Indah & PNL) - Fasilitas menengah
    {
        "nama": "Kost Mawar Blang Pulo", "harga": 800000, "tipe": "putri", "luas": 12,
        "alamat": "Gg. Mawar, Blang Pulo, Muara Satu", "lat": 5.1965, "lng": 97.1270,
        "fasilitas": ["Kamar Mandi Dalam", "WiFi 50Mbps", "Dapur Bersama", "Parkir Motor"], "rating": 5
    },
    {
        "nama": "Kost Ksatria PNL", "harga": 650000, "tipe": "putra", "luas": 10,
        "alamat": "Jl. Listrik, Blang Pulo", "lat": 5.1930, "lng": 97.1220,
        "fasilitas": ["Kamar Mandi Dalam", "WiFi", "Lemari 2 Pintu"], "rating": 4
    },
    {
        "nama": "Kost Eksklusif Bukit Indah", "harga": 1200000, "tipe": "campur", "luas": 16,
        "alamat": "Jl. Utama Bukit Indah", "lat": 5.1955, "lng": 97.1250,
        "fasilitas": ["AC Split", "Kamar Mandi Dalam", "WiFi 50Mbps", "Laundry", "CCTV"], "rating": 5
    },

    # Zona Batuphat (Pekerja & Mahasiswa)
    {
        "nama": "Wisma Batuphat Jaya", "harga": 1500000, "tipe": "campur", "luas": 18,
        "alamat": "Jl. Medan-B.Aceh, Batuphat Timur", "lat": 5.2075, "lng": 97.0985,
        "fasilitas": ["AC Split", "Kamar Mandi Dalam", "TV", "Water Heater", "Parkir Mobil"], "rating": 5
    },
    {
        "nama": "Kost Standar Batuphat", "harga": 600000, "tipe": "putra", "luas": 9,
        "alamat": "Batuphat Barat", "lat": 5.2080, "lng": 97.0950,
        "fasilitas": ["Kamar Mandi Dalam", "Kipas Angin"], "rating": 3
    },

    # Zona Lhokseumawe Kota (Jauh dari kampus utama, dekat ke pusat kota)
    {
        "nama": "Kost Premium Lhokseumawe", "harga": 1800000, "tipe": "putri", "luas": 20,
        "alamat": "Jl. Merdeka, Kuta Blang, Lhokseumawe", "lat": 5.1805, "lng": 97.1405,
        "fasilitas": ["AC Split", "Kamar Mandi Dalam", "Kulkas", "TV", "Laundry", "Cleaning Service"], "rating": 5
    },
    {
        "nama": "Kost Cunda Asri", "harga": 700000, "tipe": "campur", "luas": 12,
        "alamat": "Kawasan Cunda, Lhokseumawe", "lat": 5.1750, "lng": 97.1350,
        "fasilitas": ["WiFi", "Dapur Bersama", "Kamar Mandi Luar"], "rating": 4
    }
]

def seed_data():
    db: Session = SessionLocal()
    try:
        print("Mulai proses Seeding...")

        # 1. Clear Existing Data (Optional but good for fresh seed)
        db.query(Kost).delete()
        db.query(Kampus).delete()
        db.commit()
        print("Data lama berhasil dihapus.")

        # 2. Insert Kampus
        for k in KAMPUS_DATA:
            wkt_point = f"SRID=4326;POINT({k['lng']} {k['lat']})"
            kampus_obj = Kampus(
                nama=k["nama"],
                singkatan=k["singkatan"],
                kota=k["kota"],
                provinsi=k["provinsi"],
                alamat=k["alamat"],
                logo_url=k["logo_url"],
                koordinat=wkt_point
            )
            db.add(kampus_obj)
        db.commit()
        print(f"Berhasil menambahkan {len(KAMPUS_DATA)} data Kampus.")

        # 3. Insert Kost
        for k in KOST_DATA:
            wkt_point = f"SRID=4326;POINT({k['lng']} {k['lat']})"
            kost_obj = Kost(
                nama=k["nama"],
                deskripsi=f"Kost nyaman di {k['alamat']}. Sangat strategis.",
                harga_per_bulan=k["harga"],
                luas_m2=k["luas"],
                tipe_kamar=k["tipe"],
                alamat=k["alamat"],
                koordinat=wkt_point,
                fasilitas=k["fasilitas"],
                rating=k["rating"],
                jumlah_ulasan=random.randint(5, 50),
                is_active=True
            )
            db.add(kost_obj)
        db.commit()
        print(f"Berhasil menambahkan {len(KOST_DATA)} data Kost.")

        print("🎉 Seeding database selesai!")
    except Exception as e:
        print(f"❌ Error saat seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()

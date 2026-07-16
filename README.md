# 🗺️ GeoKost — WebGIS Platform untuk Rekomendasi Hunian Mahasiswa

![GeoKost](https://img.shields.io/badge/GeoKost-WebGIS%20Platform-4f46e5?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-FastAPI-3776AB?style=for-the-badge&logo=python)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791?style=for-the-badge&logo=postgresql)

> Platform WebGIS cerdas untuk mencari, membandingkan, dan memesan kost mahasiswa — didukung algoritma **Decision Tree C4.5** dan **PostGIS spatial queries**.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🗺️ **Peta Interaktif** | Leaflet.js + CartoDB dark tiles + PostGIS radius query |
| 🤖 **Rekomendasi C4.5** | Decision Tree scoring berdasarkan budget, jarak, fasilitas |
| 💰 **Prediksi Harga** | Gradient Boosting Regressor — Murah / Wajar / Mahal |
| 🎓 **Multi-Kampus** | Support radius dari berbagai kampus |
| 🏠 **Portal Mitra** | CRUD kost + pin lokasi peta untuk pemilik |
| 📊 **Dashboard Analitik** | Statistik performa kost untuk mitra |

---

## 🚀 Quick Start (Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 22+
- Python 3.11+

### 1. Clone & Setup

```bash
git clone <repo-url>
cd GeoKost_WebGIS

# Backend env
cp backend/.env.example backend/.env
# Edit backend/.env dengan konfigurasi Supabase Anda

# Frontend env
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local dengan URL Supabase Anda
```

### 2. Jalankan dengan Docker (Recommended)

```bash
docker-compose up -d
```

Layanan akan tersedia di:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432

### 3. Jalankan Manual (Tanpa Docker)

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

# Training model ML (opsional, ada fallback rule-based)
python ml/train_c45.py
python ml/train_regression.py

uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🗄️ Database Setup (Supabase)

Jalankan SQL migrations di Supabase SQL Editor secara berurutan:

```
supabase/migrations/001_init_postgis.sql     ← Aktifkan PostGIS
supabase/migrations/002_create_tables.sql    ← Buat tabel kost & kampus
supabase/migrations/003_seed_kampus.sql      ← Seed data kampus Malang
```

---

## 🤖 Training Model ML

```bash
cd backend

# Training model rekomendasi C4.5
python ml/train_c45.py

# Training model prediksi harga
python ml/train_regression.py
```

Model akan disimpan di `backend/models_pkl/`.

> **Note:** Jika model belum ditraining, sistem otomatis menggunakan **fallback rule-based scoring** sehingga API tetap berfungsi.

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/kost/nearby` | Kost terdekat dari koordinat |
| GET | `/api/kost/by-kampus/{id}` | Kost sekitar kampus tertentu |
| GET | `/api/kampus` | Daftar semua kampus |
| POST | `/api/recommend` | Rekomendasi C4.5 berdasarkan preferensi |
| POST | `/api/predict/price` | Prediksi kewajaran harga kost |

Dokumentasi lengkap: **http://localhost:8000/docs**

---

## 📁 Struktur Proyek

```
GeoKost_WebGIS/
├── frontend/           # Next.js 14 + TypeScript + Leaflet.js
├── backend/            # FastAPI + SQLAlchemy + GeoAlchemy2
│   ├── app/            # Aplikasi utama
│   ├── ml/             # Script training C4.5 & Regresi
│   └── models_pkl/     # Model ML tersimpan
├── supabase/
│   └── migrations/     # SQL migrations PostGIS
└── docker-compose.yml
```

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | Next.js 14, TypeScript, Leaflet.js, Zustand, TanStack Query, Tailwind CSS |
| **Backend** | FastAPI, Python 3.11, SQLAlchemy, GeoAlchemy2, Pydantic v2 |
| **Database** | PostgreSQL + PostGIS (via Supabase) |
| **ML** | scikit-learn (C4.5), GradientBoostingRegressor, Joblib |
| **Cache** | Redis (Upstash di production) |
| **Deploy** | Vercel (Frontend) + Render.com (Backend) |

---

## 👥 Portal

- **Mahasiswa**: `/mahasiswa/peta` — Cari & bandingkan kost
- **Mitra**: `/mitra/dashboard` — Kelola properti & lihat analitik

---

*Dibuat sebagai platform WebGIS untuk sistem rekomendasi hunian mahasiswa berbasis Machine Learning.*

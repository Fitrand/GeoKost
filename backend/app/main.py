from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.routers import kost, recommend, predict, kampus, mitra, auth, booking, favorit, review, kontak
from app.services.ml_service import load_models


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models saat aplikasi startup."""
    print("[INFO] GeoKost API starting up...")
    load_models()
    yield
    print("[INFO] GeoKost API shutting down...")


app = FastAPI(
    title="GeoKost API",
    description="""
## 🗺️ GeoKost — WebGIS Platform untuk Rekomendasi Hunian Mahasiswa

### Fitur Utama:
- **Spatial Query**: Pencarian kost berbasis radius menggunakan PostGIS
- **Rekomendasi C4.5**: Sistem rekomendasi berbasis Decision Tree
- **Prediksi Harga**: Analisis kewajaran harga menggunakan model regresi
- **Dual Portal**: Antarmuka untuk Mahasiswa dan Mitra/Pemilik Kost
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(kost.router, prefix="/api")
app.include_router(kampus.router, prefix="/api")
app.include_router(recommend.router, prefix="/api")
app.include_router(predict.router, prefix="/api")
app.include_router(mitra.router, prefix="/api")
app.include_router(booking.router, prefix="/api")
app.include_router(favorit.router, prefix="/api")
app.include_router(review.router, prefix="/api")
app.include_router(kontak.router, prefix="/api")


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "GeoKost API is running",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "geokost-api"}


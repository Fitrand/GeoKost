import sys
import os

# Add backend dir to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import engine, Base
from app.models.kampus import Kampus
from app.models.kost import Kost

def init_db():
    print("Mencoba koneksi ke database...")
    try:
        # Check if postgis is installed
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"))
            conn.commit()
            print("Ekstensi PostGIS dan UUID siap.")
    except Exception as e:
        print(f"Error memeriksa ekstensi PostGIS: {e}")
        print("Pastikan database Anda mendukung PostGIS.")
        return

    print("Membuat tabel-tabel di PostgreSQL...")
    try:
        Base.metadata.drop_all(bind=engine)
        print("Tabel lama dihapus.")
        Base.metadata.create_all(bind=engine)
        print("Tabel baru (Kampus & Kost) berhasil dibuat.")
    except Exception as e:
        print(f"Error membuat tabel: {e}")

if __name__ == "__main__":
    init_db()

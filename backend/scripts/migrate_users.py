"""
Script migrasi aman: hanya membuat tabel 'users' jika belum ada.
TIDAK menghapus tabel yang sudah ada (tidak pakai drop_all).
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text, inspect
from app.database import engine
from app.models.user import User
from app.database import Base


def migrate_users():
    print("[INFO] Menghubungkan ke database...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("[OK] Koneksi database berhasil!")
    except Exception as e:
        print(f"[ERROR] Gagal koneksi: {e}")
        return

    print("\n[INFO] Mengecek tabel 'users'...")
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    if "users" in existing_tables:
        print("[OK] Tabel 'users' sudah ada. Tidak perlu migrasi.")
        cols = [c["name"] for c in inspector.get_columns("users")]
        print(f"     Kolom yang ada: {cols}")
    else:
        print("[NEW] Tabel 'users' belum ada. Membuat sekarang...")
        try:
            User.__table__.create(bind=engine, checkfirst=True)
            print("[OK] Tabel 'users' berhasil dibuat!")
        except Exception as e:
            print(f"[ERROR] Gagal membuat tabel 'users': {e}")
            return

    print("\n[INFO] Mengecek kolom 'pemilik_id' di tabel 'kost'...")
    if "kost" in existing_tables:
        kost_cols = [c["name"] for c in inspector.get_columns("kost")]
        if "pemilik_id" in kost_cols:
            print("[OK] Kolom 'pemilik_id' sudah ada di tabel 'kost'.")
        else:
            print("[NEW] Menambahkan kolom 'pemilik_id' ke tabel 'kost'...")
            try:
                with engine.connect() as conn:
                    conn.execute(text("""
                        ALTER TABLE kost 
                        ADD COLUMN IF NOT EXISTS pemilik_id UUID REFERENCES users(id)
                    """))
                    conn.commit()
                print("[OK] Kolom 'pemilik_id' berhasil ditambahkan!")
            except Exception as e:
                print(f"[WARN] Gagal menambahkan kolom 'pemilik_id': {e}")
    else:
        print("[WARN] Tabel 'kost' belum ada. Jalankan init_db.py terlebih dahulu.")

    print("\n[DONE] Migrasi selesai!")


if __name__ == "__main__":
    migrate_users()

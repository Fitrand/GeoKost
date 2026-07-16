from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from typing import Optional
import os

router = APIRouter(prefix="/kontak", tags=["Kontak"])


class KontakPayload(BaseModel):
    nama: str
    email: EmailStr
    topik: str
    pesan: str


@router.post("/", summary="Kirim pesan kontak")
def kirim_pesan_kontak(payload: KontakPayload):
    """
    Menerima pesan dari form kontak.
    Di production: kirim email via SMTP/Resend ke admin.
    Di development: kembalikan pesan sebagai konfirmasi.
    """
    is_production = os.getenv("APP_ENV", "development") == "production"

    # ── Kirim via SMTP/Resend (production only) ────────────────────────────
    # Aktifkan kode ini setelah mengatur SMTP atau Resend API di environment.
    #
    # if is_production:
    #     import smtplib
    #     from email.mime.text import MIMEText
    #     smtp_host = os.getenv("SMTP_HOST")
    #     smtp_port = int(os.getenv("SMTP_PORT", "587"))
    #     smtp_user = os.getenv("SMTP_USER")
    #     smtp_pass = os.getenv("SMTP_PASS")
    #     admin_email = os.getenv("ADMIN_EMAIL", "admin@geokost.id")
    #
    #     body = f"Dari: {payload.nama} <{payload.email}>\n"
    #           + f"Topik: {payload.topik}\n\n{payload.pesan}"
    #     msg = MIMEText(body, "plain", "utf-8")
    #     msg["Subject"] = f"[GeoKost Kontak] {payload.topik}"
    #     msg["From"] = smtp_user
    #     msg["To"] = admin_email
    #     msg["Reply-To"] = payload.email
    #
    #     with smtplib.SMTP(smtp_host, smtp_port) as s:
    #         s.starttls()
    #         s.login(smtp_user, smtp_pass)
    #         s.send_message(msg)

    # Log ke console untuk development
    print(f"[KONTAK] Dari: {payload.nama} <{payload.email}>")
    print(f"[KONTAK] Topik: {payload.topik}")
    print(f"[KONTAK] Pesan: {payload.pesan}")

    return {
        "success": True,
        "message": f"Pesan dari {payload.nama} telah diterima. Tim kami akan menghubungi {payload.email} dalam 1×24 jam.",
    }

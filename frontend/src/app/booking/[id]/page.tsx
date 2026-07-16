"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Map, ArrowLeft, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCreateBooking } from "@/hooks/useKost";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const formatHarga = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: kostId } = use(params);
  const { token, user } = useAuthStore();
  const router = useRouter();

  const [kost, setKost] = useState<any>(null);
  const [loadingKost, setLoadingKost] = useState(true);
  const [kostError, setKostError] = useState<string | null>(null);

  const [durasi, setDurasi] = useState("1");
  const [tanggalMasuk, setTanggalMasuk] = useState("");
  const [catatan, setCatatan] = useState("");
  const [success, setSuccess] = useState(false);

  const { mutate: createBooking, isPending, error: bookingError } = useCreateBooking(token);

  // Redirect jika belum login
  useEffect(() => {
    if (!token) router.push(`/login?redirect=/booking/${kostId}`);
  }, [token, kostId, router]);

  // Fetch data kost
  useEffect(() => {
    fetch(`${API}/api/kost/${kostId}`)
      .then(r => { if (!r.ok) throw new Error("Kost tidak ditemukan"); return r.json(); })
      .then(data => setKost(data))
      .catch(err => setKostError(err.message))
      .finally(() => setLoadingKost(false));
  }, [kostId]);

  // Set tanggal masuk default: besok
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setTanggalMasuk(d.toISOString().split("T")[0]);
  }, []);

  const totalHarga = kost ? kost.harga_per_bulan * Number(durasi) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kost) return;
    createBooking(
      { kost_id: kostId, durasi_bulan: Number(durasi), tanggal_masuk: tanggalMasuk, catatan: catatan || undefined },
      {
        onSuccess: () => setSuccess(true),
        onError: () => {},
      }
    );
  };

  if (!token) return null;

  if (loadingKost) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⏳</div>
        <p style={{ color: "var(--color-muted)" }}>Memuat data kost...</p>
      </div>
    </div>
  );

  if (kostError || !kost) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
      <div style={{ textAlign: "center" }}>
        <AlertCircle size={48} style={{ color: "var(--color-error)", marginBottom: 16 }} />
        <p style={{ fontWeight: 700, color: "var(--color-primary)", marginBottom: 8 }}>{kostError || "Kost tidak ditemukan"}</p>
        <Link href="/mahasiswa/cari" style={{ color: "var(--color-secondary)", textDecoration: "underline" }}>Kembali ke Cari Kost</Link>
      </div>
    </div>
  );

  // Halaman Sukses
  if (success) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 480, width: "100%", background: "var(--color-surface)", borderRadius: 24, padding: 40, textAlign: "center", border: "1px solid var(--color-outline)", boxShadow: "0 8px 40px rgba(15,23,42,0.08)" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(0,110,47,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <CheckCircle size={36} style={{ color: "#006e2f" }} />
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: 10 }}>
          Booking Berhasil Dikirim!
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)", lineHeight: 1.7, marginBottom: 8 }}>
          Permintaan booking untuk <strong>{kost.nama}</strong> telah dikirim ke pemilik.
        </p>
        <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 32, lineHeight: 1.6 }}>
          Status booking Anda akan berubah setelah pemilik mengkonfirmasi. Pantau status di halaman <strong>Riwayat Booking</strong>.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/mahasiswa/booking" style={{
            padding: "12px 24px", borderRadius: 10,
            background: "var(--color-primary)", color: "#fff",
            fontWeight: 700, fontSize: 14, textDecoration: "none",
          }}>
            Lihat Riwayat Booking
          </Link>
          <Link href="/mahasiswa/cari" style={{
            padding: "12px 24px", borderRadius: 10,
            border: "1.5px solid var(--color-outline)",
            color: "var(--color-on-surface-variant)",
            fontWeight: 600, fontSize: 14, textDecoration: "none",
          }}>
            Cari Kost Lain
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", fontFamily: "var(--font-body)" }}>

      {/* Navbar */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--color-surface)", borderBottom: "1px solid var(--color-outline)", boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href={`/kost/${kostId}`} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-on-surface-variant)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
              <ArrowLeft size={16} /> Kembali
            </Link>
            <div style={{ width: 1, height: 20, background: "var(--color-outline)" }} />
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <Map size={20} style={{ color: "var(--color-primary)" }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--color-primary)" }}>GeoKost</span>
            </Link>
          </div>
          <div style={{ fontSize: 13, color: "var(--color-muted)" }}>
            Login sebagai <strong style={{ color: "var(--color-primary)" }}>{user?.nama}</strong>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.75rem", color: "var(--color-primary)", marginBottom: 6 }}>
          Formulir Booking
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-muted)", marginBottom: 36 }}>
          Lengkapi detail berikut untuk mengajukan permintaan booking ke pemilik kost.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>

          {/* LEFT: Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Error booking */}
            {bookingError && (
              <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(186,26,26,0.08)", border: "1px solid rgba(186,26,26,0.25)", color: "#ba1a1a", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={16} /> {(bookingError as Error).message}
              </div>
            )}

            {/* Durasi */}
            <div style={{ background: "var(--color-surface)", borderRadius: 16, padding: 24, border: "1px solid var(--color-outline)", boxShadow: "var(--shadow-card)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--color-primary)", marginBottom: 20 }}>Detail Sewa</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-on-surface-variant)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Durasi Sewa
                  </label>
                  <select value={durasi} onChange={e => setDurasi(e.target.value)} required style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--color-outline)", background: "var(--color-surface)", fontSize: "0.9rem", fontFamily: "var(--font-body)", color: "var(--color-on-bg)", outline: "none", cursor: "pointer" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--color-outline)")}>
                    {[["1", "1 Bulan"], ["2", "2 Bulan"], ["3", "3 Bulan"], ["6", "6 Bulan"], ["12", "12 Bulan (1 Tahun)"]].map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-on-surface-variant)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Tanggal Masuk
                  </label>
                  <input type="date" value={tanggalMasuk} onChange={e => setTanggalMasuk(e.target.value)} required
                    min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--color-outline)", background: "var(--color-surface)", fontSize: "0.9rem", fontFamily: "var(--font-body)", color: "var(--color-on-bg)", outline: "none", boxSizing: "border-box" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--color-outline)")} />
                </div>
              </div>
            </div>

            {/* Catatan */}
            <div style={{ background: "var(--color-surface)", borderRadius: 16, padding: 24, border: "1px solid var(--color-outline)", boxShadow: "var(--shadow-card)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--color-primary)", marginBottom: 6 }}>Catatan untuk Pemilik</h2>
              <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 16 }}>Opsional — sampaikan kebutuhan khusus atau pertanyaan Anda.</p>
              <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={4}
                placeholder="Contoh: Saya akan membawa kendaraan motor, apakah parkir tersedia?"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--color-outline)", background: "var(--color-surface)", fontSize: "0.9rem", fontFamily: "var(--font-body)", color: "var(--color-on-bg)", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--color-outline)")} />
            </div>

            {/* Info */}
            <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(19,27,46,0.04)", border: "1px solid var(--color-outline)", fontSize: 13, color: "var(--color-on-surface-variant)", lineHeight: 1.6 }}>
              💡 Booking ini bersifat <strong>permintaan</strong>. Pemilik akan mengkonfirmasi atau menolak dalam 1×24 jam. Anda tidak dikenakan biaya sebelum konfirmasi.
            </div>

            <button type="submit" disabled={isPending} style={{ padding: "15px", borderRadius: 12, border: "none", background: isPending ? "var(--color-surface-container)" : "var(--color-primary)", color: isPending ? "var(--color-muted)" : "#fff", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "1rem", cursor: isPending ? "not-allowed" : "pointer", boxShadow: isPending ? "none" : "0 4px 14px rgba(19,27,46,0.25)", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Lock size={16} />
              {isPending ? "Memproses Booking..." : "Kirim Permintaan Booking"}
            </button>
          </form>

          {/* RIGHT: Ringkasan */}
          <div style={{ position: "sticky", top: 80 }}>
            <div style={{ background: "var(--color-surface)", borderRadius: 20, border: "1px solid var(--color-outline)", boxShadow: "var(--shadow-float)", overflow: "hidden" }}>
              {/* Foto */}
              <div style={{ height: 180, background: "var(--color-surface-container)", overflow: "hidden" }}>
                {kost.foto_urls?.[0] ? (
                  <img src={kost.foto_urls[0]} alt={kost.nama} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>🏠</div>
                )}
              </div>

              <div style={{ padding: "20px 22px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "var(--color-primary)", marginBottom: 4 }}>{kost.nama}</h3>
                <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 16, display: "flex", alignItems: "center", gap: 5 }}>
                  📍 {kost.alamat || "Lokasi tersedia di peta"}
                </p>

                {/* Rincian Harga */}
                <div style={{ background: "var(--color-surface-low)", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--color-on-surface-variant)" }}>{formatHarga(kost.harga_per_bulan)} × {durasi} bln</span>
                    <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>{formatHarga(totalHarga)}</span>
                  </div>
                  <div style={{ borderTop: "1px solid var(--color-outline)", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-primary)" }}>Total</span>
                    <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--color-secondary)" }}>{formatHarga(totalHarga)}</span>
                  </div>
                </div>

                <p style={{ fontSize: 11, color: "var(--color-muted)", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
                  Pembayaran dilakukan langsung ke pemilik setelah konfirmasi.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  useMyBookings, useCancelBooking, useCreateReview,
  type BookingItem,
} from "@/hooks/useKost";
import { Map as MapIcon, Heart, ClipboardList, User, Lock, CheckCircle, AlertTriangle, Home, MapPin, FileText, Star, X } from "lucide-react";

type StatusFilter = "Semua" | "Aktif" | "Menunggu" | "Selesai" | "Dibatalkan";

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  approved:   { bg: "rgba(0,110,47,.1)",    color: "#006e2f", label: "✓ Disetujui" },
  rejected:   { bg: "rgba(186,26,26,.08)",  color: "#ba1a1a", label: "✕ Ditolak" },
  cancelled:  { bg: "rgba(100,116,139,.1)", color: "#64748b", label: "○ Dibatalkan" },
  selesai:    { bg: "rgba(19,27,46,.08)",   color: "#131b2e", label: "✓ Selesai" },
};

const formatHarga = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

// ── Review Modal ─────────────────────────────────────────────
function ReviewModal({
  booking,
  token,
  onClose,
}: {
  booking: BookingItem;
  token: string | null;
  onClose: () => void;
}) {
  const [rating, setRating]     = useState(0);
  const [hover, setHover]       = useState(0);
  const [komentar, setKomentar] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { mutate: createReview, isPending, error } = useCreateReview(token);

  const handleSubmit = () => {
    if (rating === 0) return alert("Pilih rating terlebih dahulu");
    createReview(
      { kost_id: booking.kost_id, rating, komentar: komentar || undefined, booking_id: booking.id },
      { onSuccess: () => setSubmitted(true) }
    );
  };

  return (
    <div style={{ position: "fixed" as const, inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "32px 28px", width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(15,23,42,0.25)" }}>
        {submitted ? (
          <div style={{ textAlign: "center" as const, padding: "20px 0" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#131b2e", marginBottom: 8 }}>Ulasan Terkirim!</h3>
            <p style={{ fontSize: 13, color: "#76777d", marginBottom: 24 }}>Terima kasih telah berbagi pengalaman Anda.</p>
            <button onClick={onClose} style={{ padding: "11px 28px", borderRadius: 9999, background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
              Tutup
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#131b2e", marginBottom: 4 }}>★ Beri Ulasan</h3>
                <p style={{ fontSize: 13, color: "#76777d" }}>{booking.kost_nama}</p>
              </div>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #e5eeff", background: "#f8f9ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#76777d" }}>✕</button>
            </div>

            {/* Rating Stars */}
            <p style={{ fontSize: 12, fontWeight: 600, color: "#45464d", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 10 }}>Rating Keseluruhan</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(s)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "2rem", lineHeight: 1, color: s <= (hover || rating) ? "#f59e0b" : "#e2e8f0", transition: "color 0.1s, transform 0.1s", transform: s === (hover || rating) ? "scale(1.15)" : "scale(1)" }}
                >
                  ★
                </button>
              ))}
              {rating > 0 && (
                <span style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b", alignSelf: "center", marginLeft: 6 }}>
                  {["", "Buruk", "Kurang", "Cukup", "Bagus", "Sangat Bagus"][rating]}
                </span>
              )}
            </div>

            {/* Komentar */}
            <p style={{ fontSize: 12, fontWeight: 600, color: "#45464d", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 8 }}>Komentar (opsional)</p>
            <textarea
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              placeholder="Ceritakan pengalaman tinggal Anda di sini..."
              rows={4}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5eeff", fontSize: 14, fontFamily: "inherit", resize: "vertical" as const, outline: "none", color: "#131b2e", boxSizing: "border-box" as const }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#131b2e")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5eeff")}
            />

            {error && (
              <p style={{ fontSize: 12, color: "#dc2626", marginTop: 8 }}>
                ⚠️ {(error as Error).message}
              </p>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #c6c6cd", background: "transparent", color: "#45464d", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || rating === 0}
                style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: rating === 0 ? "#c6c6cd" : "#131b2e", color: "#fff", fontWeight: 700, fontSize: 14, cursor: rating === 0 ? "not-allowed" : "pointer" }}
              >
                {isPending ? "Mengirim..." : "Kirim Ulasan"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ── Main Page ─────────────────────────────────────────────────
export default function RiwayatBookingPage() {
  const { token }     = useAuthStore();
  const { data, isLoading, isError, refetch } = useMyBookings(token);
  const { mutate: cancelBooking, isPending: cancelling } = useCancelBooking(token);

  const [filterStatus, setFilterStatus] = useState<StatusFilter>("Semua");
  const [reviewBooking, setReviewBooking] = useState<BookingItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const allBookings = data?.data || [];
  const filtered = allBookings.filter(b => {
    if (filterStatus === "Semua") return true;
    if (filterStatus === "Aktif") return b.status === "approved";
    if (filterStatus === "Menunggu") return b.status === "pending";
    if (filterStatus === "Selesai") return b.status === "selesai";
    if (filterStatus === "Dibatalkan") return ["cancelled", "rejected"].includes(b.status);
    return true;
  });

  const handleCancel = (id: string) => {
    if (!confirm("Batalkan booking ini?")) return;
    cancelBooking(id, {
      onSuccess: () => showToast("Booking berhasil dibatalkan"),
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff", fontFamily: "'Inter',system-ui,sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed" as const, top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 12, background: "#006e2f", color: "#fff", fontWeight: 600, fontSize: 13, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal booking={reviewBooking} token={token} onClose={() => { setReviewBooking(null); refetch(); }} />
      )}

      <header style={{ background: "#fff", borderBottom: "1px solid #e5eeff", position: "sticky" as const, top: 0, zIndex: 50, boxShadow: "0 1px 8px rgba(15,23,42,.05)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <MapIcon size={22} style={{ color: "#131b2e" }} />
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 18, color: "#131b2e" }}>GeoKost</span>
          </Link>
          <nav style={{ display: "flex", gap: 20 }}>
            <Link href="/mahasiswa/cari" style={{ fontSize: 13, color: "#45464d", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}><MapIcon size={14} /> Cari Kost</Link>
            <Link href="/mahasiswa/favorit" style={{ fontSize: 13, color: "#45464d", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}><Heart size={14} /> Favorit</Link>
            <Link href="/mahasiswa/booking" style={{ fontSize: 13, color: "#131b2e", textDecoration: "none", fontWeight: 700, borderBottom: "2px solid #006e2f", paddingBottom: 2, display: "flex", alignItems: "center", gap: 4 }}><ClipboardList size={14} /> Riwayat</Link>
            <Link href="/mahasiswa/profil" style={{ fontSize: 13, color: "#45464d", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}><User size={14} /> Profil</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "#131b2e", marginBottom: 6 }}>Riwayat Booking</h1>
          {!isLoading && <p style={{ fontSize: 14, color: "#76777d" }}>{allBookings.length} transaksi ditemukan</p>}
        </div>

        {/* Tidak login */}
        {!token && (
          <div style={{ textAlign: "center" as const, padding: "80px 20px", background: "#fff", borderRadius: 20, border: "1px solid #e5eeff" }}>
            <div style={{ display: "flex", justifyContent: "center" }}><Lock size={48} style={{ marginBottom: 16, opacity: 0.5, color: "#131b2e" }} /></div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#131b2e", marginBottom: 8 }}>Login Diperlukan</h2>
            <Link href="/login" style={{ padding: "12px 28px", borderRadius: 9999, background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Login Sekarang</Link>
          </div>
        )}

        {token && (
          <>
            {/* Filter chips */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" as const }}>
              {(["Semua", "Aktif", "Menunggu", "Selesai", "Dibatalkan"] as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  style={{
                    padding: "6px 16px", borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    border: "1.5px solid", borderColor: filterStatus === f ? "#131b2e" : "#c6c6cd",
                    background: filterStatus === f ? "#131b2e" : "transparent",
                    color: filterStatus === f ? "#fff" : "#45464d",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Loading */}
            {isLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[1, 2, 3].map(i => <div key={i} style={{ height: 140, borderRadius: 20, background: "#e5eeff", animation: "pulse 1.5s ease infinite" }} />)}
              </div>
            )}

            {/* Error */}
            {isError && (
              <div style={{ textAlign: "center" as const, padding: "60px 20px", background: "#fff", borderRadius: 20, border: "1px solid #ffd6d6" }}>
                <div style={{ display: "flex", justifyContent: "center" }}><AlertTriangle size={48} style={{ marginBottom: 16, color: "#dc2626", opacity: 0.8 }} /></div>
                <p style={{ fontWeight: 600, color: "#dc2626", marginBottom: 16 }}>Gagal memuat data. Coba refresh halaman.</p>
              </div>
            )}

            {/* Kosong */}
            {!isLoading && !isError && filtered.length === 0 && (
              <div style={{ textAlign: "center" as const, padding: "60px 20px", background: "#fff", borderRadius: 20, border: "1px solid #e5eeff" }}>
                <div style={{ display: "flex", justifyContent: "center" }}><ClipboardList size={48} style={{ marginBottom: 16, opacity: 0.5, color: "#131b2e" }} /></div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#131b2e", marginBottom: 8 }}>
                  {allBookings.length === 0 ? "Belum Ada Booking" : "Tidak ada booking di kategori ini"}
                </h2>
                {allBookings.length === 0 && (
                  <Link href="/mahasiswa/cari" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 9999, background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", marginTop: 16 }}>
                    + Cari Kost Sekarang
                  </Link>
                )}
              </div>
            )}

            {/* Booking cards */}
            {!isLoading && !isError && filtered.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
                {filtered.map((b) => {
                  const st = STATUS_STYLE[b.status] || STATUS_STYLE.cancelled;
                  return (
                    <div key={b.id} style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", boxShadow: "0 4px 20px rgba(15,23,42,.06)", overflow: "hidden" }}>
                      {/* Header row */}
                      <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f4ff", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8f9ff" }}>
                        <span style={{ fontSize: 12, color: "#76777d", fontWeight: 500 }}>
                          ID: <strong style={{ color: "#131b2e" }}>{b.id.slice(0, 8)}...</strong>
                          <span style={{ marginLeft: 12, color: "#c6c6cd" }}>
                            {new Date(b.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </span>
                        <span style={{ padding: "4px 14px", borderRadius: 9999, background: st.bg, color: st.color, fontSize: 12, fontWeight: 700 }}>{st.label}</span>
                      </div>
                      {/* Body */}
                      <div style={{ padding: "18px 20px", display: "flex", gap: 18, alignItems: "flex-start" }}>
                        <div style={{ width: 72, height: 72, borderRadius: 14, background: "linear-gradient(135deg,#e5eeff,#dce9ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0, overflow: "hidden" }}>
                          {b.kost_foto && b.kost_foto.length > 0
                            ? <img src={b.kost_foto[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                            : <Home size={28} style={{ opacity: 0.5, color: "#131b2e" }} />
                          }
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15, color: "#131b2e", marginBottom: 4 }}>{b.kost_nama}</h3>
                          <p style={{ fontSize: 12, color: "#76777d", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {b.kost_alamat}</p>
                          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const }}>
                            {[
                              ["Durasi",       `${b.durasi_bulan} Bulan`],
                              ["Masuk",        new Date(b.tanggal_masuk).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })],
                              ["Total",        formatHarga(b.total_harga)],
                            ].map(([l, v]) => (
                              <div key={l}>
                                <div style={{ fontSize: 11, color: "#76777d", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>{l}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: l === "Total" ? "#006e2f" : "#131b2e" }}>{v}</div>
                              </div>
                            ))}
                          </div>
                          {b.catatan && (
                            <p style={{ fontSize: 12, color: "#76777d", marginTop: 8, fontStyle: "italic", display: "flex", alignItems: "center", gap: 4 }}><FileText size={12} /> {b.catatan}</p>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, flexShrink: 0 }}>
                          <Link href={`/kost/${b.kost_id}`} style={{ padding: "8px 16px", borderRadius: 9999, border: "1.5px solid #131b2e", background: "transparent", color: "#131b2e", fontWeight: 600, fontSize: 12, textDecoration: "none", textAlign: "center" as const }}>
                            Lihat Kost
                          </Link>
                          {(b.status === "pending" || b.status === "approved") && (
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={cancelling}
                              style={{ padding: "8px 16px", borderRadius: 9999, border: "1.5px solid #ba1a1a", background: "transparent", color: "#ba1a1a", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                            >
                              Batalkan
                            </button>
                          )}
                          {b.status === "selesai" && (
                            <button
                              onClick={() => setReviewBooking(b)}
                              style={{ padding: "8px 16px", borderRadius: 9999, border: "none", background: "#006e2f", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                            >
                              <Star size={14} /> Beri Ulasan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ textAlign: "center" as const, marginTop: 40 }}>
              <Link href="/mahasiswa/cari" style={{ padding: "13px 32px", borderRadius: 9999, background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                + Cari Kost Baru
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

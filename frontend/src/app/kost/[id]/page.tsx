"use client";

import Link from "next/link";
import { useState, useEffect, use, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useToggleFavorit, useMyFavoritIds, useKostReviews } from "@/hooks/useKost";
import { Map, Edit3, Lock, MessageSquare } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const formatHarga = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const FASILITAS_ICONS: Record<string, string> = {
  "WiFi 50Mbps": "📶", "WiFi": "📶", "wifi": "📶",
  "AC Split": "❄️", "AC": "❄️", "ac": "❄️",
  "Laundry": "👕", "laundry": "👕",
  "Kamar Mandi Dalam": "🚿", "kamar_mandi_dalam": "🚿",
  "Kamar Mandi Luar": "🚿", "kamar_mandi_luar": "🚿",
  "CCTV 24 Jam": "📹", "CCTV": "📹", "cctv": "📹",
  "Parkir Motor": "🏍️", "parkir_motor": "🏍️",
  "Parkir Mobil": "🚗", "parkir_mobil": "🚗",
  "Meja Belajar": "📚", "meja_belajar": "📚",
  "Lemari 2 Pintu": "🗄️", "Lemari": "🗄️",
  "Kasur": "🛏️", "kasur": "🛏️",
  "Kipas": "🎐", "kipas": "🎐",
  "Dapur": "🍳", "dapur": "🍳",
  "Security": "👮", "security": "👮",
  "Water Heater": "♨️", "water_heater": "♨️",
  "Kulkas": "🧊", "kulkas": "🧊",
  "TV": "📺", "tv": "📺"
};

// Map backend facility keys to readable labels
const formatFasilitas = (f: string) => {
  const map: Record<string, string> = {
    wifi: "WiFi",
    ac: "AC",
    kasur: "Kasur",
    kipas: "Kipas",
    kamar_mandi_dalam: "KM Dalam",
    kamar_mandi_luar: "KM Luar",
    parkir_motor: "Parkir Motor",
    parkir_mobil: "Parkir Mobil",
    dapur: "Dapur",
    laundry: "Laundry",
    security: "Security",
    cctv: "CCTV",
    water_heater: "Water Heater",
    kulkas: "Kulkas",
    tv: "TV",
    meja_belajar: "Meja Belajar",
  };
  return map[f] || f;
};

export default function DetailKostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token, user } = useAuthStore();
  const isMitra = user?.role === "mitra";
  const router = useRouter();
  const [kost, setKost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [durasi, setDurasi] = useState("1");
  const [tanggalMasuk, setTanggalMasuk] = useState("");

  // Hooks favorit & review
  const { data: favIds } = useMyFavoritIds(token);
  const { mutate: toggleFav, isPending: toggling } = useToggleFavorit(token);
  const { data: reviewData } = useKostReviews(id);
  const isFavorit = favIds?.ids?.includes(id) ?? false;

  useEffect(() => {
    fetch(`${API}/api/kost/${id}`)
      .then(r => {
        if (!r.ok) throw new Error("Kost tidak ditemukan");
        return r.json();
      })
      .then(data => setKost(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Set tanggal masuk default: besok
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setTanggalMasuk(d.toISOString().split("T")[0]);
  }, []);

  // Fetch harga rata-rata area dari API (real data, bukan mock)
  const [hargaArea, setHargaArea] = useState<{ harga_rata_rata: number | null; total_pembanding: number; radius_km: number; tipe_kamar?: string } | null>(null);
  useEffect(() => {
    if (!kost?.id) return;
    fetch(`${API}/api/kost/${kost.id}/harga-area`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setHargaArea(data))
      .catch(() => {});
  }, [kost?.id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⏳</div><p>Memuat detail kost...</p></div>
    </div>
  );

  if (error || !kost) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
      <div style={{ textAlign: "center", color: "var(--color-error)" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
        <p>{error || "Kost tidak ditemukan"}</p>
        <Link href="/mahasiswa/peta" style={{ display: "inline-block", marginTop: 16, color: "var(--color-primary)", textDecoration: "underline" }}>Kembali ke Peta</Link>
      </div>
    </div>
  );

  const photos = kost.foto_urls && kost.foto_urls.length > 0 ? kost.foto_urls : [];

  const harga_area_rata = hargaArea?.harga_rata_rata ?? null;
  const selisihPersen = harga_area_rata
    ? ((harga_area_rata - kost.harga_per_bulan) / harga_area_rata * 100).toFixed(0)
    : null;
  const lebihMurah = harga_area_rata ? kost.harga_per_bulan <= harga_area_rata : false;

  const photoPlaceholders = ["🛏️", "🛋️", "🚿", "🏋️", "👕"];

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* ── NAVBAR ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-outline)",
        boxShadow: "0 1px 8px rgba(15,23,42,0.05)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <Map size={22} style={{ color: "var(--color-primary)" }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--color-primary)" }}>GeoKost</span>
            </Link>
            <nav style={{ display: "flex", gap: 24 }}>
              {(["Cari Kost", "Tentang Kami", "Rekomendasi", "Kontak"] as const).map((item) => (
                <Link
                  key={item}
                  href={
                    item === "Cari Kost" ? "/mahasiswa/cari" :
                    item === "Rekomendasi" ? "/mahasiswa/peta" :
                    item === "Tentang Kami" ? "/tentang" : "/kontak"
                  }
                  style={{ fontSize: 14, color: "var(--color-on-surface-variant)", textDecoration: "none", fontWeight: 500 }}
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {token ? (
              <Link href={useAuthStore.getState().user?.role === "mitra" ? "/mitra/dashboard" : "/mahasiswa/profil"} style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                {useAuthStore.getState().user?.nama.charAt(0).toUpperCase() || "U"}
              </Link>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: 14, color: "var(--color-on-surface-variant)", textDecoration: "none", padding: "8px 12px" }}>Login</Link>
                <Link href="/register" style={{
                  padding: "8px 18px", borderRadius: 9999, fontSize: 13, fontWeight: 700,
                  background: "var(--color-primary)", color: "#fff", textDecoration: "none",
                }}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        {/* ── PHOTO GALLERY ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "240px 240px", gap: 12, marginBottom: 40, borderRadius: 24, overflow: "hidden" }}>
          {/* Main large photo */}
          <div style={{
            gridColumn: "1 / 2", gridRow: "1 / 3",
            background: "var(--color-surface-container)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "5rem", cursor: "pointer", position: "relative",
          }}>
            {photos.length > 0 ? (
              <img src={photos[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              photoPlaceholders[0]
            )}
          </div>
          {/* 4 small photos */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{
              background: "var(--color-surface-high)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "3rem", cursor: "pointer",
              transition: "filter 0.15s", position: "relative"
            }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.filter = "brightness(0.95)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.filter = "")}
            >
              {photos.length > i ? (
                <img src={photos[i]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                photoPlaceholders[i]
              )}
            </div>
          ))}
        </div>

        {/* ── CONTENT GRID: LEFT 65% + RIGHT 35% ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Title + Tags */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <h1 style={{
                  fontFamily: "var(--font-display)", fontWeight: 800,
                  fontSize: "1.75rem", color: "var(--color-primary)",
                }}>
                  {kost.nama}
                </h1>
                <div style={{ display: "flex", gap: 8 }}>
                  {/* Favorit Button */}
                  <button
                    onClick={() => token ? toggleFav(id) : undefined}
                    disabled={toggling}
                    title={token ? (isFavorit ? "Hapus dari favorit" : "Simpan ke favorit") : "Login untuk menyimpan favorit"}
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      border: `1.5px solid ${isFavorit ? "#ef4444" : "var(--color-outline)"}`,
                      background: isFavorit ? "#fef2f2" : "var(--color-surface)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: isFavorit ? "#ef4444" : "var(--color-on-surface-variant)",
                      fontSize: 18, transition: "all 0.2s",
                    }}
                  >
                    {isFavorit ? "♥" : "♡"}
                  </button>
                  {/* Share Button */}
                  <button
                    onClick={async () => {
                      const shareData = {
                        title: kost.nama,
                        text: `Cek kost ini di GeoKost: ${kost.nama} — ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(kost.harga_per_bulan)}/bulan`,
                        url: window.location.href,
                      };
                      if (navigator.share) {
                        try { await navigator.share(shareData); } catch {}
                      } else {
                        await navigator.clipboard.writeText(window.location.href);
                        alert("Link berhasil disalin ke clipboard!");
                      }
                    }}
                    style={{
                    width: 40, height: 40, borderRadius: "50%",
                    border: "1.5px solid var(--color-outline)",
                    background: "var(--color-surface)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--color-on-surface-variant)",
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                  </button>
                </div>
              </div>

              {/* Address */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-on-surface-variant)", fontSize: 14, marginBottom: 14 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {kost.alamat || "Alamat tidak dicantumkan"}
              </div>

              {/* Chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <span style={{ padding: "4px 14px", borderRadius: 9999, background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)", fontSize: 12, fontWeight: 600 }}>
                  {kost.tipe_kamar ? kost.tipe_kamar.charAt(0).toUpperCase() + kost.tipe_kamar.slice(1) : "Kost"}
                </span>
                {kost.luas_m2 && (
                  <span style={{ padding: "4px 14px", borderRadius: 9999, background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)", fontSize: 12, fontWeight: 600 }}>
                    {kost.luas_m2} m² Kamar {kost.luas_panjang && kost.luas_lebar ? `(${kost.luas_panjang}×${kost.luas_lebar})` : ''}
                  </span>
                )}
                <span style={{ padding: "4px 14px", borderRadius: 9999, background: "rgba(0,110,47,0.08)", color: "var(--color-secondary)", fontSize: 12, fontWeight: 600, border: "1px solid rgba(0,110,47,0.2)" }}>
                  ✓ Tersedia
                </span>
              </div>
            </div>

            {/* Fasilitas Utama */}
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--color-primary)", marginBottom: 16 }}>
                Fasilitas Utama
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {kost.fasilitas.length > 0 ? kost.fasilitas.slice(0, 8).map((f: string) => (
                  <div key={f} style={{
                    padding: "14px 10px", borderRadius: 12,
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-outline)",
                    textAlign: "center",
                    boxShadow: "var(--shadow-card)",
                  }}>
                    <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{FASILITAS_ICONS[f] || "✓"}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-on-surface-variant)", lineHeight: 1.3 }}>{formatFasilitas(f)}</div>
                  </div>
                )) : (
                  <p style={{ fontSize: 14, color: "var(--color-muted)" }}>Fasilitas belum dicantumkan.</p>
                )}
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--color-primary)", marginBottom: 14 }}>
                Deskripsi Kost
              </h2>
              {kost.deskripsi ? kost.deskripsi.split("\n\n").map((para: string, i: number) => (
                <p key={i} style={{
                  fontSize: "0.95rem", lineHeight: 1.75,
                  color: "var(--color-on-surface-variant)", marginBottom: 12,
                  whiteSpace: "pre-line"
                }}>
                  {para}
                </p>
              )) : (
                <p style={{ fontSize: 14, color: "var(--color-muted)" }}>Tidak ada deskripsi.</p>
              )}
            </div>

            {/* Analisis Harga Kompetitif */}
            <div style={{
              background: "linear-gradient(135deg, #eff4ff, #f8f9ff)",
              borderRadius: 20, padding: 24,
              border: "1px solid var(--color-surface-high)",
            }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--color-primary)", marginBottom: 6 }}>
                Analisis Harga Kompetitif
              </h2>
              <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", marginBottom: 20 }}>
                {hargaArea
                  ? `Dibandingkan dengan ${hargaArea.total_pembanding} kost tipe ${hargaArea.tipe_kamar ?? ""} dalam radius ${hargaArea.radius_km}km.`
                  : "Memuat data pembanding..."
                }
              </p>

              {harga_area_rata ? (
                <>
                  {/* Bar comparison */}
                  {[
                    { label: kost.nama, harga: kost.harga_per_bulan, color: "var(--color-secondary)" },
                    { label: `Rata-rata Area (${hargaArea?.tipe_kamar ?? ""} ±${hargaArea?.radius_km}km)`, harga: harga_area_rata, color: "var(--color-outline)" },
                  ].map(({ label, harga, color }) => (
                    <div key={label} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                        <span style={{ color: "var(--color-on-surface-variant)", fontWeight: 500 }}>{label}</span>
                        <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>{formatHarga(harga)}</span>
                      </div>
                      <div style={{ height: 10, background: "var(--color-surface-high)", borderRadius: 9999, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 9999,
                          width: `${Math.min((harga / Math.max(kost.harga_per_bulan, harga_area_rata)) * 100, 100)}%`,
                          background: color,
                          transition: "width 0.8s ease",
                        }} />
                      </div>
                    </div>
                  ))}

                  <div style={{
                    marginTop: 16, padding: "10px 16px", borderRadius: 10,
                    background: lebihMurah ? "rgba(0,110,47,0.08)" : "rgba(186,26,26,0.06)",
                    border: `1px solid ${lebihMurah ? "rgba(0,110,47,0.2)" : "rgba(186,26,26,0.2)"}`,
                    fontSize: 13, color: lebihMurah ? "var(--color-secondary)" : "var(--color-error)",
                    fontWeight: 600,
                  }}>
                    {lebihMurah
                      ? `✅ Harga kost ini sekitar ${selisihPersen}% lebih murah atau sama dengan rata-rata kost serupa di area ini.`
                      : `⚠️ Harga kost ini ${Math.abs(Number(selisihPersen))}% lebih mahal dari rata-rata kost serupa di area ini.`}
                  </div>
                </>
              ) : hargaArea && hargaArea.total_pembanding === 0 ? (
                <div style={{ padding: "14px", borderRadius: 10, background: "rgba(19,27,46,0.04)", fontSize: 13, color: "var(--color-muted)", textAlign: "center" }}>
                  📊 Belum ada data pembanding di area ini. Harga kost tidak dapat dibandingkan.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />)}
                </div>
              )}
            </div>

            {/* ── Review Section ── */}
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--color-primary)", marginBottom: 16 }}>
                ★ Ulasan Penghuni
              </h2>

              {reviewData && reviewData.total > 0 ? (
                <>
                  {/* Summary Bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 20, background: "var(--color-surface)", borderRadius: 16, padding: "18px 20px", border: "1px solid var(--color-outline)", marginBottom: 16 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2.5rem", color: "var(--color-primary)", lineHeight: 1 }}>{reviewData.avg_rating.toFixed(1)}</div>
                      <div style={{ display: "flex", gap: 2, justifyContent: "center", margin: "6px 0" }}>
                        {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= Math.round(reviewData.avg_rating) ? "#f59e0b" : "var(--color-outline)", fontSize: 14 }}>★</span>)}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{reviewData.total} ulasan</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = reviewData.data.filter(r => r.rating === star).length;
                        const pct = reviewData.total > 0 ? (count / reviewData.total) * 100 : 0;
                        return (
                          <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: "var(--color-muted)", width: 12 }}>{star}</span>
                            <div style={{ flex: 1, height: 6, background: "var(--color-surface-container)", borderRadius: 9999, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: "#f59e0b", borderRadius: 9999, transition: "width 0.6s ease" }} />
                            </div>
                            <span style={{ fontSize: 10, color: "var(--color-muted)", width: 20 }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {reviewData.data.slice(0, 5).map(r => (
                      <div key={r.id} style={{ background: "var(--color-surface)", borderRadius: 14, border: "1px solid var(--color-outline)", padding: "16px 18px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
                              {r.user_nama.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-primary)" }}>{r.user_nama}</div>
                              <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 1 }}>
                            {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= r.rating ? "#f59e0b" : "var(--color-outline)", fontSize: 13 }}>★</span>)}
                          </div>
                        </div>
                        {r.komentar && <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)", lineHeight: 1.65, margin: 0 }}>{r.komentar}</p>}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ background: "var(--color-surface)", borderRadius: 14, border: "1px solid var(--color-outline)", padding: "28px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>💬</div>
                  <p style={{ fontSize: 13, color: "var(--color-muted)" }}>Belum ada ulasan untuk kost ini. Jadilah yang pertama!</p>
                </div>
              )}
            </div>

            {/* ── AI Score Panel ── */}
            <Suspense fallback={null}>
              <AiScorePanel />
            </Suspense>
          </div>

          {/* ── RIGHT COLUMN: Booking Card ── */}
          <div style={{ position: "sticky", top: 80 }}>
            <div style={{
              background: "var(--color-surface)",
              borderRadius: 20, border: "1px solid var(--color-outline)",
              boxShadow: "var(--shadow-float)", overflow: "hidden",
            }}>
              {/* Price */}
              <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--color-outline)" }}>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem", color: "var(--color-primary)" }}>
                    {formatHarga(kost.harga_per_bulan)}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--color-muted)", marginLeft: 4 }}>per bulan</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} style={{ color: s <= Math.floor(kost.rating || 0) ? "#f59e0b" : "var(--color-outline)", fontSize: 12 }}>★</span>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)" }}>{kost.rating || 0}</span>
                  <span style={{ fontSize: 12, color: "var(--color-muted)" }}>({kost.jumlah_ulasan || 0} ulasan)</span>
                </div>
              </div>

              {/* Booking Form */}
              <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Durasi */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-on-surface-variant)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Durasi Sewa
                  </label>
                  <select
                    value={durasi}
                    onChange={(e) => setDurasi(e.target.value)}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 10,
                      border: "1.5px solid var(--color-outline)", background: "var(--color-surface)",
                      fontSize: "0.9rem", fontFamily: "var(--font-body)", color: "var(--color-on-bg)",
                      outline: "none", cursor: "pointer",
                    }}
                    onFocus={(e) => ((e.currentTarget as HTMLSelectElement).style.borderColor = "var(--color-primary)")}
                    onBlur={(e) => ((e.currentTarget as HTMLSelectElement).style.borderColor = "var(--color-outline)")}
                  >
                    {["1", "2", "3", "6", "12"].map((d) => (
                      <option key={d} value={d}>{d} Bulan</option>
                    ))}
                  </select>
                </div>

                {/* Tanggal Masuk */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-on-surface-variant)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Tanggal Masuk
                  </label>
                  <input
                    type="date"
                    value={tanggalMasuk}
                    onChange={(e) => setTanggalMasuk(e.target.value)}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 10,
                      border: "1.5px solid var(--color-outline)", background: "var(--color-surface)",
                      fontSize: "0.9rem", fontFamily: "var(--font-body)", color: "var(--color-on-bg)",
                      outline: "none",
                    }}
                    onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "var(--color-primary)")}
                    onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "var(--color-outline)")}
                  />
                </div>

                {/* Total */}
                <div style={{ background: "var(--color-surface-low)", borderRadius: 10, padding: "12px 14px", fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "var(--color-on-surface-variant)" }}>{formatHarga(kost.harga_per_bulan)} × {durasi} bln</span>
                    <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>{formatHarga(kost.harga_per_bulan * Number(durasi))}</span>
                  </div>
                </div>

                {/* CTA */}
                {isMitra ? (
                  <Link href={`/mitra/edit/${kost.id}`} style={{
                    padding: "14px", borderRadius: 12, border: "none",
                    background: "#006e2f", color: "#fff",
                    textAlign: "center", fontWeight: 700, fontSize: "0.95rem",
                    textDecoration: "none", cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0,110,47,0.25)",
                    transition: "filter 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                  }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.filter = "brightness(1.1)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.filter = "")}
                  >
                    <Edit3 size={16} /> Edit Kost
                  </Link>
                ) : token ? (
                  <Link href={`/booking/${kost.id}`} style={{
                    padding: "14px", borderRadius: 12, border: "none",
                    background: "var(--color-primary)", color: "#fff",
                    textAlign: "center", fontWeight: 700, fontSize: "0.95rem",
                    textDecoration: "none", cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(19,27,46,0.25)",
                    transition: "filter 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                  }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.filter = "brightness(1.1)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.filter = "")}
                  >
                    <Lock size={16} /> Prioritas Booking
                  </Link>
                ) : (
                  <button onClick={() => router.push("/login")} style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    background: "var(--color-primary)", color: "#fff",
                    textAlign: "center", fontWeight: 700, fontSize: "0.95rem",
                    cursor: "pointer", fontFamily: "var(--font-body)",
                    boxShadow: "0 4px 14px rgba(19,27,46,0.25)",
                    transition: "filter 0.15s",
                  }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.filter = "")}
                  >
                    🔒 Login untuk Booking
                  </button>
                )}

                {/* Contact owner via WhatsApp */}
                {kost.pemilik_no_telepon ? (
                  <a
                    href={`https://wa.me/62${kost.pemilik_no_telepon?.replace(/^0/, "")?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Halo, saya tertarik dengan kost ${kost.nama}. Apakah masih tersedia?`)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      width: "100%", padding: "11px", borderRadius: 12,
                      border: "1.5px solid #25D366", background: "rgba(37,211,102,0.06)",
                      color: "#128C7E", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none",
                      transition: "background 0.15s",
                    }}
                  >
                    💬 Tanya via WhatsApp
                  </a>
                ) : (
                  <button
                    onClick={() => alert("Pemilik belum mencantumkan nomor WhatsApp.")}
                    style={{
                      width: "100%", padding: "11px", borderRadius: 12,
                      border: "1.5px solid var(--color-outline)",
                      background: "transparent", color: "var(--color-on-surface-variant)",
                      fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    💬 Tanya Pemilik
                  </button>
                )}

                <p style={{ fontSize: 11, color: "var(--color-muted)", textAlign: "center", lineHeight: 1.6 }}>
                  Anda tidak akan dikenakan biaya sebelum mendapat konfirmasi pemilik.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--color-outline)", marginTop: 64, padding: "32px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>🗺️</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--color-primary)" }}>GeoKost</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", lineHeight: 1.6 }}>© 2024 GeoKost. Crafted for smarter student living.</p>
          </div>
          {[
            { title: "Navigasi", links: ["Cari Kost", "Rekomendasi"] },
            { title: "Perusahaan", links: ["Tentang Kami", "Kontak"] },
            { title: "Legal", links: ["Kebijakan Privasi", "Syarat & Ketentuan"] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)", marginBottom: 12 }}>{title}</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {links.map((l) => (
                  <li key={l}>
                    <Link href="#" style={{ fontSize: 13, color: "var(--color-on-surface-variant)", textDecoration: "none" }}>{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

function AiScorePanel() {
  const searchParams = useSearchParams();
  const skorKecocokan = searchParams.get("skor");
  const labelRekomendasi = searchParams.get("label");
  const alasanParams = searchParams.get("alasan");

  if (!skorKecocokan) return null;

  let alasanRekomendasi: string[] = [];
  if (alasanParams) {
    try {
      alasanRekomendasi = JSON.parse(alasanParams);
    } catch (e) {
      // ignore
    }
  }

  return (
    <div style={{ marginTop: 32 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--color-primary)", marginBottom: 16 }}>
        🤖 Skor Kecocokan AI (C4.5)
      </h2>
      <div style={{
        background: "linear-gradient(145deg, var(--color-surface) 0%, var(--color-surface-low) 100%)",
        borderRadius: 16, border: "1px solid var(--color-outline)",
        padding: "20px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 4 }}>Skor Kecocokan</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-secondary)", lineHeight: 1 }}>
                {skorKecocokan}%
              </span>
              {labelRekomendasi && (
                <span style={{
                  padding: "4px 12px", borderRadius: 9999,
                  background: "rgba(0,110,47,0.1)", color: "var(--color-secondary)",
                  fontSize: 12, fontWeight: 700
                }}>
                  ✓ {labelRekomendasi}
                </span>
              )}
            </div>
          </div>
        </div>

        {alasanRekomendasi.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface-variant)", marginBottom: 10 }}>
              Alasan Rekomendasi:
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, color: "var(--color-on-surface-variant)", fontSize: 14, lineHeight: 1.6 }}>
              {alasanRekomendasi.map((alasan, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>{alasan}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

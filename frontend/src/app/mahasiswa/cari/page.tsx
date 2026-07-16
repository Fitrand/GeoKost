"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Home, MapPin, Star, X, ChevronDown, Building2, Wifi, Car, Utensils, Dumbbell, Droplets } from "lucide-react";
import { useKostSearch, type KostSearchItem } from "@/hooks/useKost";
import { useAuthStore } from "@/store/authStore";

const formatHarga = (h: number) => {
  if (h >= 1_000_000) return `Rp ${(h / 1_000_000).toFixed(1)}jt`;
  return `Rp ${(h / 1000).toFixed(0)}rb`;
};

const TIPE_OPTIONS = [
  { value: "", label: "Semua Tipe" },
  { value: "putra", label: "Putra" },
  { value: "putri", label: "Putri" },
  { value: "campur", label: "Campur" },
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
];

const HARGA_OPTIONS = [
  { value: 0, label: "Semua Harga" },
  { value: 1_000_000, label: "≤ Rp 1jt" },
  { value: 1_500_000, label: "≤ Rp 1.5jt" },
  { value: 2_000_000, label: "≤ Rp 2jt" },
  { value: 3_000_000, label: "≤ Rp 3jt" },
  { value: 5_000_000, label: "≤ Rp 5jt" },
];

const FASILITAS_ICON: Record<string, React.ReactNode> = {
  "WiFi": <Wifi size={12} />,
  "Parkir": <Car size={12} />,
  "Dapur": <Utensils size={12} />,
  "Gym": <Dumbbell size={12} />,
  "Air": <Droplets size={12} />,
};

function KostListCard({ kost }: { kost: KostSearchItem }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        border: "1px solid #e8edf5",
        boxShadow: "0 2px 12px rgba(19,27,46,0.06)",
        overflow: "hidden",
        display: "flex",
        gap: 0,
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(19,27,46,0.13)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(19,27,46,0.06)";
        (e.currentTarget as HTMLDivElement).style.transform = "";
      }}
    >
      {/* Image */}
      <div style={{ width: 180, flexShrink: 0, position: "relative", background: "#f1f5f9", overflow: "hidden" }}>
        {kost.foto_urls?.[0] && !imgError ? (
          <img
            src={kost.foto_urls[0]}
            alt={kost.nama}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140 }}>
            <Building2 size={40} color="#cbd5e1" />
          </div>
        )}
        {kost.tipe_kamar && (
          <span style={{
            position: "absolute", bottom: 10, left: 10,
            background: "rgba(19,27,46,0.75)", backdropFilter: "blur(6px)",
            color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 6,
            padding: "3px 8px", textTransform: "capitalize",
          }}>
            {kost.tipe_kamar}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h3 style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem",
            color: "var(--color-primary)", margin: 0, lineHeight: 1.3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%",
          }}>
            {kost.nama}
          </h3>
          {kost.rating > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#f59e0b", fontWeight: 700, flexShrink: 0 }}>
              <Star size={13} fill="#f59e0b" />
              {kost.rating}
              {kost.jumlah_ulasan > 0 && (
                <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 11 }}>({kost.jumlah_ulasan})</span>
              )}
            </div>
          )}
        </div>

        {kost.alamat && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
            <MapPin size={12} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kost.alamat}</span>
          </div>
        )}

        {kost.fasilitas.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
            {kost.fasilitas.slice(0, 4).map(f => (
              <span key={f} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "3px 10px", borderRadius: 99,
                background: "var(--color-surface-container)",
                color: "var(--color-on-surface-variant)",
                fontSize: 11, fontWeight: 500,
              }}>
                {FASILITAS_ICON[f] || null}{f}
              </span>
            ))}
            {kost.fasilitas.length > 4 && (
              <span style={{ fontSize: 11, color: "#94a3b8", alignSelf: "center" }}>+{kost.fasilitas.length - 4}</span>
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
          <div>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block" }}>MULAI DARI</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.15rem", color: "var(--color-secondary)" }}>
              {formatHarga(kost.harga_per_bulan)}
            </span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>/bulan</span>
          </div>
          <Link
            href={`/kost/${kost.id}`}
            style={{
              padding: "9px 22px", borderRadius: 10,
              background: "var(--color-primary)", color: "#fff",
              fontWeight: 700, fontSize: 13, textDecoration: "none",
              transition: "filter 0.15s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.filter = "brightness(1.12)")}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.filter = "")}
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e8edf5", overflow: "hidden", display: "flex", height: 160 }}>
      <div className="skeleton" style={{ width: 180, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="skeleton" style={{ height: 20, width: "60%", borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 14, width: "40%", borderRadius: 8 }} />
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 22, width: 70, borderRadius: 99 }} />)}
        </div>
        <div className="skeleton" style={{ height: 36, width: 110, borderRadius: 10, marginLeft: "auto", marginTop: "auto" }} />
      </div>
    </div>
  );
}

export default function CariKostPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [tipeKamar, setTipeKamar] = useState("");
  const [hargaMax, setHargaMax] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  // Reset ke page 1 saat filter berubah
  useEffect(() => {
    setPage(1);
  }, [debouncedQ, tipeKamar, hargaMax]);

  const { data, isLoading } = useKostSearch({
    q: debouncedQ || undefined,
    tipe_kamar: tipeKamar || undefined,
    harga_max: hargaMax || undefined,
    limit: LIMIT,
    offset: (page - 1) * LIMIT,
  });

  const kostList = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);
  const activeFilters = [tipeKamar, hargaMax ? `≤${formatHarga(hargaMax)}` : ""].filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "#f7f9fc", fontFamily: "var(--font-body)" }}>

      {/* ── NAV ── */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid #e8edf5",
        padding: "0 32px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 8px rgba(19,27,46,0.06)",
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--color-secondary)" }}>GeoKost</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, color: "#64748b", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
            <Home size={15} /> Beranda
          </Link>
          <Link href="/mahasiswa/peta" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: "var(--color-surface-container)", color: "var(--color-primary)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
            Rekomendasi
          </Link>
          {user && (
            <Link href="/mahasiswa/profil" style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--color-primary)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14, textDecoration: "none", flexShrink: 0,
            }}>
              {user.nama?.charAt(0)?.toUpperCase() || "U"}
            </Link>
          )}
        </div>
      </nav>

      {/* ── HERO SEARCH HEADER ── */}
      <div style={{
        background: "linear-gradient(135deg, var(--color-primary) 0%, #1e3a5f 100%)",
        padding: "48px 32px 72px",
        position: "relative", overflow: "hidden",
      }}>
        {/* decorative circles */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <div style={{ maxWidth: 780, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "#fff", margin: "0 0 10px" }}>
            Temukan Kost Impianmu
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, margin: "0 0 32px" }}>
            Jelajahi seluruh daftar kost tersedia di area kampus
          </p>

          {/* Search bar */}
          <div style={{
            background: "#fff", borderRadius: 14,
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            display: "flex", alignItems: "center", padding: "6px 8px 6px 18px",
            gap: 8,
          }}>
            <Search size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Cari nama kost atau alamat..."
              style={{
                flex: 1, border: "none", outline: "none",
                fontSize: 15, color: "#1e293b", fontFamily: "var(--font-body)",
                background: "transparent",
              }}
            />
            {q && (
              <button onClick={() => setQ("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                <X size={16} />
              </button>
            )}
            <button
              onClick={() => setShowFilter(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 18px", borderRadius: 10,
                background: showFilter ? "var(--color-primary)" : "#f1f5f9",
                color: showFilter ? "#fff" : "#475569",
                border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                transition: "all 0.15s",
              }}
            >
              <SlidersHorizontal size={14} />
              Filter
              {activeFilters.length > 0 && (
                <span style={{ background: "var(--color-secondary)", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {showFilter && (
            <div style={{
              background: "#fff", borderRadius: 14, marginTop: 12,
              padding: "20px 24px", boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
              display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center",
              animation: "fadeIn 0.15s ease",
            }}>
              {/* Tipe Kamar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tipe Kamar</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={tipeKamar}
                    onChange={e => setTipeKamar(e.target.value)}
                    style={{
                      appearance: "none", width: "100%",
                      padding: "9px 34px 9px 12px", borderRadius: 9,
                      border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 500,
                      color: "#1e293b", background: "#fff", cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {TIPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                </div>
              </div>

              {/* Harga */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Budget Maks</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={hargaMax}
                    onChange={e => setHargaMax(Number(e.target.value))}
                    style={{
                      appearance: "none", width: "100%",
                      padding: "9px 34px 9px 12px", borderRadius: 9,
                      border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 500,
                      color: "#1e293b", background: "#fff", cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {HARGA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                </div>
              </div>

              {/* Reset */}
              {activeFilters.length > 0 && (
                <button
                  onClick={() => { setTipeKamar(""); setHargaMax(0); }}
                  style={{
                    alignSelf: "flex-end", padding: "9px 16px", borderRadius: 9,
                    border: "1.5px solid #fca5a5", color: "#dc2626",
                    background: "#fff5f5", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 5,
                  }}
                >
                  <X size={13} /> Reset Filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 900, margin: "-28px auto 0", padding: "0 24px 60px", position: "relative", zIndex: 1 }}>

        {/* Results info bar */}
        <div style={{
          background: "#fff", borderRadius: 14,
          padding: "14px 22px", marginBottom: 20,
          boxShadow: "0 2px 10px rgba(19,27,46,0.07)",
          border: "1px solid #e8edf5",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
        }}>
          <div>
            {isLoading ? (
              <span style={{ fontSize: 14, color: "#64748b" }}>Memuat kost...</span>
            ) : (
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-primary)" }}>
                Menampilkan <strong>{total}</strong> kost tersedia
                {debouncedQ && <> untuk "<em>{debouncedQ}</em>"</>}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {activeFilters.map(f => (
              <span key={f} style={{
                padding: "4px 12px", borderRadius: 99,
                background: "rgba(19,27,46,0.07)", color: "var(--color-primary)",
                fontSize: 12, fontWeight: 600,
              }}>{f}</span>
            ))}
          </div>
        </div>

        {/* Kost list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isLoading ? (
            [1,2,3,4,5].map(i => <SkeletonCard key={i} />)
          ) : kostList.length > 0 ? (
            kostList.map(k => <KostListCard key={k.id} kost={k} />)
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 18, border: "1px solid #e8edf5" }}>
              <Building2 size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
              <p style={{ fontWeight: 700, color: "var(--color-primary)", fontSize: 16, margin: "0 0 8px" }}>
                Tidak ada kost ditemukan
              </p>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                Coba ubah kata kunci pencarian atau reset filter
              </p>
              {activeFilters.length > 0 && (
                <button
                  onClick={() => { setQ(""); setTipeKamar(""); setHargaMax(0); }}
                  style={{ marginTop: 16, padding: "9px 20px", borderRadius: 10, background: "var(--color-primary)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}
                >
                  Reset Semua Filter
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={page <= 1}
              style={{
                padding: "9px 18px", borderRadius: 10, border: "1.5px solid var(--color-outline)",
                background: page <= 1 ? "var(--color-surface-container)" : "#fff",
                color: page <= 1 ? "var(--color-muted)" : "var(--color-primary)",
                fontWeight: 600, fontSize: 13, cursor: page <= 1 ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >← Sebelumnya</button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;
              return (
                <button key={pageNum} onClick={() => { setPage(pageNum); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    border: "1.5px solid",
                    borderColor: pageNum === page ? "var(--color-primary)" : "var(--color-outline)",
                    background: pageNum === page ? "var(--color-primary)" : "#fff",
                    color: pageNum === page ? "#fff" : "var(--color-primary)",
                    fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.15s",
                  }}
                >{pageNum}</button>
              );
            })}

            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={page >= totalPages}
              style={{
                padding: "9px 18px", borderRadius: 10, border: "1.5px solid var(--color-outline)",
                background: page >= totalPages ? "var(--color-surface-container)" : "#fff",
                color: page >= totalPages ? "var(--color-muted)" : "var(--color-primary)",
                fontWeight: 600, fontSize: 13, cursor: page >= totalPages ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >Berikutnya →</button>

            <span style={{ fontSize: 12, color: "var(--color-muted)", marginLeft: 8 }}>
              Halaman {page} dari {totalPages}
            </span>
          </div>
        )}

        {/* CTA ke peta rekomendasi */}

        {!isLoading && kostList.length > 0 && (
          <div style={{
            marginTop: 32, background: "linear-gradient(135deg, var(--color-primary) 0%, #1e3a5f 100%)",
            borderRadius: 18, padding: "28px 32px",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#fff", margin: "0 0 6px" }}>
                Ingin rekomendasi cerdas?
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: 0 }}>
                Gunakan algoritma C4.5 untuk menemukan kost terbaik sesuai preferensi Anda
              </p>
            </div>
            <Link
              href="/mahasiswa/peta"
              style={{
                padding: "12px 28px", borderRadius: 12,
                background: "var(--color-secondary)", color: "#fff",
                fontWeight: 700, fontSize: 14, textDecoration: "none",
                transition: "filter 0.15s", flexShrink: 0,
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.filter = "brightness(1.1)")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.filter = "")}
            >
              🗺️ Buka Peta Rekomendasi
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

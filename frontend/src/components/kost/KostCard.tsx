"use client";

import Link from "next/link";
import type { KostItem, KostRekomendasi } from "@/types/kost.types";

interface KostCardProps {
  kost: KostItem | KostRekomendasi;
  isSelected?: boolean;
  onClick?: () => void;
  showDetail?: boolean;
}

const formatHarga = (harga: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(harga);

const formatHargaShort = (harga: number) => {
  if (harga >= 1_000_000) return `Rp ${(harga / 1_000_000).toFixed(1)}jt`;
  return `Rp ${(harga / 1000).toFixed(0)}rb`;
};

const LABEL_CONFIG = {
  Murah:    { bg: "rgba(0,110,47,0.1)",  border: "rgba(0,110,47,0.3)",  color: "#006e2f", icon: "🔥", text: "Di bawah pasaran" },
  Wajar:    { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.25)", color: "#475569", icon: "✓", text: "Harga wajar" },
  Mahal:    { bg: "rgba(220,38,38,0.1)",  border: "rgba(220,38,38,0.25)", color: "#dc2626", icon: "⚠️", text: "Di atas pasaran" },
  Estimasi: { bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)", color: "#64748b", icon: "🤖", text: "Estimasi" },
};

const formatJarak = (meter?: number) => {
  if (!meter) return null;
  return meter < 1000 ? `${meter.toFixed(0)}m` : `${(meter / 1000).toFixed(1)}km`;
};

export default function KostCard({ kost, isSelected, onClick, showDetail = false }: KostCardProps) {
  const rec = kost as KostRekomendasi;
  const hasSkor = typeof rec.skor_kecocokan === "number";
  const jarak = formatJarak(kost.jarak_meter);

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: isSelected
          ? "2px solid var(--color-primary)"
          : "1px solid var(--color-outline)",
        boxShadow: isSelected
          ? "0 0 0 3px rgba(19,27,46,0.08), var(--shadow-card)"
          : "var(--shadow-card)",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!onClick) return;
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = isSelected ? "0 0 0 3px rgba(19,27,46,0.08), var(--shadow-card)" : "var(--shadow-card)";
      }}
    >
      {/* Image area */}
      <div style={{ position: "relative", height: 140, background: "var(--color-surface-container)", overflow: "hidden" }}>
        {kost.foto_urls?.[0] ? (
          <img
            src={kost.foto_urls[0]}
            alt={kost.nama}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(135deg, var(--color-surface-container) 0%, var(--color-surface-high) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2.5rem", color: "var(--color-outline)",
          }}>🏠</div>
        )}

        {/* Glassmorphic save button */}
        <button
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", top: 10, right: 10,
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            color: "#94a3b8",
            transition: "color 0.15s, transform 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
            (e.currentTarget as HTMLButtonElement).style.transform = "";
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Match score badge */}
        {hasSkor && (
          <div style={{
            position: "absolute", top: 10, left: 10,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            borderRadius: 99, padding: "3px 10px",
            fontSize: 11, fontWeight: 700,
            color: "var(--color-secondary)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}>
            {(rec.skor_kecocokan * 100).toFixed(0)}% Cocok
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "14px 16px" }}>
        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <h3 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "0.9rem", color: "var(--color-primary)",
            flex: 1, marginRight: 8, lineHeight: 1.3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {kost.nama}
          </h3>
          {kost.rating ? (
            <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.75rem", color: "#f59e0b", fontWeight: 600, flexShrink: 0 }}>
              <span>★</span> {kost.rating}
            </div>
          ) : null}
        </div>

        {/* Price — label-bold */}
        <div style={{ marginBottom: 6 }}>
          <span style={{
            fontFamily: "var(--font-body)", fontWeight: 700,
            fontSize: "1rem", color: "var(--color-secondary)",
          }}>
            {formatHarga(kost.harga_per_bulan)}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: 400 }}>/bulan</span>
        </div>

        {/* AI Price Indicator Badge */}
        {kost.prediksi_harga && (() => {
          const p = kost.prediksi_harga!;
          const cfg = LABEL_CONFIG[p.label] ?? LABEL_CONFIG["Wajar"];
          const selisihAbs = Math.abs(p.selisih_persen);
          return (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              borderRadius: 9999, padding: "3px 10px",
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 11 }}>{cfg.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>
                {cfg.text}
              </span>
              <span style={{ fontSize: 10, color: cfg.color, opacity: 0.8 }}>
                {selisihAbs > 1 ? `(${selisihAbs.toFixed(0)}%)` : ""}
              </span>
              <span style={{ fontSize: 10, color: "#94a3b8", borderLeft: "1px solid #e2e8f0", paddingLeft: 6 }}>
                🤖 {formatHargaShort(p.harga_prediksi)}
              </span>
            </div>
          );
        })()}

        {/* Address / Distance — body-md */}
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          fontSize: "0.78rem", color: "var(--color-on-surface-variant)",
          marginBottom: 10,
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {jarak ? `${jarak} dari kampus` : kost.alamat || "Lokasi tersedia di peta"}
          </span>
        </div>

        {/* Chips — label-sm, pill */}
        {kost.fasilitas && kost.fasilitas.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {kost.fasilitas.slice(0, 3).map((f) => (
              <span key={f} style={{
                display: "inline-block",
                padding: "2px 10px", borderRadius: 9999,
                background: "var(--color-surface-container)",
                color: "var(--color-on-surface-variant)",
                fontSize: 11, fontWeight: 500, letterSpacing: "0.02em",
              }}>
                {f}
              </span>
            ))}
            {kost.fasilitas.length > 3 && (
              <span style={{ fontSize: 11, color: "var(--color-muted)", alignSelf: "center" }}>
                +{kost.fasilitas.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Score bar for recommendations */}
        {hasSkor && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: "var(--color-muted)" }}>Skor Kecocokan C4.5</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-secondary)" }}>
                {(rec.skor_kecocokan * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{ height: 4, background: "var(--color-surface-container)", borderRadius: 9999, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${rec.skor_kecocokan * 100}%`,
                background: rec.skor_kecocokan >= 0.7
                  ? "var(--color-secondary)"
                  : rec.skor_kecocokan >= 0.45
                  ? "#f59e0b"
                  : "var(--color-primary)",
                borderRadius: 9999,
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        )}

        {/* Label for recommendations */}
        {hasSkor && rec.label_rekomendasi && (
          <div style={{ marginTop: 10 }}>
            <span style={{
              display: "inline-block",
              padding: "3px 10px", borderRadius: 9999,
              background: "rgba(0,110,47,0.08)",
              color: "var(--color-secondary)",
              fontSize: 11, fontWeight: 600,
            }}>
              ✓ {rec.label_rekomendasi}
            </span>
          </div>
        )}

        {/* Detail button */}
        {showDetail && (() => {
          let href = `/kost/${kost.id}`;
          if (hasSkor && rec.skor_kecocokan !== undefined) {
            const params = new URLSearchParams();
            params.set("skor", (rec.skor_kecocokan * 100).toFixed(0));
            if (rec.label_rekomendasi) params.set("label", rec.label_rekomendasi);
            if (rec.alasan && rec.alasan.length > 0) {
              params.set("alasan", JSON.stringify(rec.alasan));
            }
            href += `?${params.toString()}`;
          }
          return (
            <Link
              href={href}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "block", marginTop: 12,
                padding: "9px 0", borderRadius: 10,
                background: "var(--color-primary)", color: "#fff",
                textAlign: "center", fontWeight: 600, fontSize: "0.85rem",
                textDecoration: "none", transition: "filter 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.filter = "brightness(1.12)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.filter = "")}
            >
              Lihat Detail
            </Link>
          );
        })()}
      </div>
    </div>
  );
}

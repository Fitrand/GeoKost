"use client";

import { useFilterStore } from "@/store/filterStore";
import type { Kampus } from "@/types/kost.types";
import { FASILITAS_LIST } from "@/types/kost.types";

interface FilterPanelProps {
  kampusList: Kampus[];
  onRekomendasi: () => void;
  loadingRec: boolean;
}

const formatHarga = (harga: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(harga);

export default function FilterPanel({ kampusList, onRekomendasi, loadingRec }: FilterPanelProps) {
  const {
    kampusId, budgetMax, jarakMaxKm, fasilitasDiinginkan, tipeKamar,
    setKampusId, setBudgetMax, setJarakMaxKm, toggleFasilitas, setTipeKamar,
    setMapCenter, resetFilters,
  } = useFilterStore();

  const handleKampusChange = (id: string) => {
    setKampusId(id || null);
    const selected = kampusList.find((k) => k.id === id);
    if (selected) setMapCenter(selected.koordinat);
  };

  const label: React.CSSProperties = {
    display: "block", marginBottom: 8,
    fontSize: 12, fontWeight: 600, letterSpacing: "0.02em",
    color: "var(--color-on-surface-variant)",
    textTransform: "uppercase",
  };

  const sectionStyle: React.CSSProperties = {
    display: "flex", flexDirection: "column", gap: 8,
  };

  return (
    <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "0.95rem", color: "var(--color-primary)",
        }}>
          Filter & Preferensi
        </h3>
        <button
          onClick={resetFilters}
          style={{
            fontSize: 12, color: "var(--color-muted)", background: "none",
            border: "none", cursor: "pointer", fontWeight: 500, padding: "4px 8px",
            borderRadius: 6, transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface-container)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "none";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-muted)";
          }}
        >
          Reset
        </button>
      </div>

      {/* Kampus Selector */}
      <div style={sectionStyle}>
        <label style={label}>🎓 Kampus</label>
        <select
          value={kampusId || ""}
          onChange={(e) => handleKampusChange(e.target.value)}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 10,
            border: "1.5px solid var(--color-outline)",
            background: "var(--color-surface)", color: "var(--color-on-bg)",
            fontSize: "0.875rem", fontFamily: "var(--font-body)",
            outline: "none", cursor: "pointer",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => ((e.currentTarget as HTMLSelectElement).style.borderColor = "var(--color-primary)")}
          onBlur={(e) => ((e.currentTarget as HTMLSelectElement).style.borderColor = "var(--color-outline)")}
        >
          <option value="">— Pilih Kampus —</option>
          {kampusList.map((k) => (
            <option key={k.id} value={k.id}>
              {k.singkatan ? `${k.singkatan} – ` : ""}{k.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Budget Slider */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={label}>💰 Budget Maksimum</span>
          <span style={{
            fontSize: 12, fontWeight: 700, color: "var(--color-secondary)",
            background: "rgba(0,110,47,0.08)", padding: "2px 10px", borderRadius: 9999,
          }}>
            {formatHarga(budgetMax)}
          </span>
        </div>
        <input
          type="range" min={200000} max={3000000} step={50000}
          value={budgetMax}
          onChange={(e) => setBudgetMax(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--color-primary)", cursor: "pointer" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-muted)" }}>
          <span>Rp 200.000</span>
          <span>Rp 3.000.000</span>
        </div>
      </div>

      {/* Radius Slider */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={label}>📍 Radius dari Kampus</span>
          <span style={{
            fontSize: 12, fontWeight: 700, color: "var(--color-secondary)",
            background: "rgba(0,110,47,0.08)", padding: "2px 10px", borderRadius: 9999,
          }}>
            {jarakMaxKm} km
          </span>
        </div>
        <input
          type="range" min={0.5} max={5} step={0.5}
          value={jarakMaxKm}
          onChange={(e) => setJarakMaxKm(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--color-secondary)", cursor: "pointer" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-muted)" }}>
          <span>0.5 km</span>
          <span>5 km</span>
        </div>
      </div>

      {/* Tipe Kamar */}
      <div style={sectionStyle}>
        <label style={label}>🛏️ Tipe Kamar</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {([null, "single", "double", "campur", "putra", "putri"] as (string | null)[]).map((tipe) => {
            const active = tipeKamar === tipe;
            return (
              <button
                key={tipe ?? "semua"}
                onClick={() => setTipeKamar(tipe)}
                style={{
                  padding: "5px 12px", borderRadius: 9999,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: "1.5px solid",
                  borderColor: active ? "var(--color-primary)" : "var(--color-outline)",
                  background: active ? "var(--color-primary)" : "transparent",
                  color: active ? "#fff" : "var(--color-on-surface-variant)",
                  transition: "all 0.15s",
                }}
              >
                {tipe ?? "Semua"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fasilitas */}
      <div style={sectionStyle}>
        <label style={label}>🏠 Fasilitas</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {FASILITAS_LIST.map((f) => {
            const selected = fasilitasDiinginkan.includes(f.value);
            return (
              <button
                key={f.value}
                onClick={() => toggleFasilitas(f.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 10px", borderRadius: 8,
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                  border: "1.5px solid",
                  borderColor: selected ? "var(--color-secondary)" : "var(--color-outline)",
                  background: selected ? "rgba(0,110,47,0.08)" : "transparent",
                  color: selected ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                  transition: "all 0.15s", textAlign: "left",
                }}
              >
                <span>{f.icon}</span> {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <hr style={{ border: "none", borderTop: "1px solid var(--color-outline)" }} />

      {/* CTA Button */}
      <button
        onClick={onRekomendasi}
        disabled={loadingRec || !kampusId}
        style={{
          width: "100%", padding: "13px",
          borderRadius: 12, border: "none",
          background: kampusId ? "var(--color-primary)" : "var(--color-surface-high)",
          color: kampusId ? "#fff" : "var(--color-muted)",
          fontFamily: "var(--font-body)", fontWeight: 700,
          fontSize: "0.9rem", cursor: kampusId ? "pointer" : "not-allowed",
          boxShadow: kampusId ? "0 4px 14px rgba(19,27,46,0.25)" : "none",
          transition: "all 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
        onMouseEnter={(e) => {
          if (!kampusId) return;
          (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.filter = "";
        }}
      >
        {loadingRec ? (
          <>
            <svg style={{ animation: "spin 1s linear infinite" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Memproses C4.5...
          </>
        ) : (
          <>
            <span>🤖</span>
            {kampusId ? "Dapatkan Rekomendasi AI" : "← Pilih Kampus Dulu"}
          </>
        )}
      </button>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

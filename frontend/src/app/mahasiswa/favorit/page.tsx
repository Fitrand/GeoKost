"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useMyFavorit, useToggleFavorit } from "@/hooks/useKost";

const formatHarga = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const FASILITAS_LABEL: Record<string, string> = {
  wifi: "WiFi", ac: "AC", kasur: "Kasur", kipas: "Kipas",
  kamar_mandi_dalam: "KM Dalam", kamar_mandi_luar: "KM Luar",
  parkir_motor: "Parkir Motor", parkir_mobil: "Parkir Mobil",
  dapur: "Dapur", laundry: "Laundry", security: "Security",
  cctv: "CCTV", water_heater: "Water Heater", kulkas: "Kulkas",
  tv: "TV", meja_belajar: "Meja Belajar",
};

export default function FavoritPage() {
  const { token } = useAuthStore();
  const { data, isLoading, isError } = useMyFavorit(token);
  const { mutate: toggleFavorit, isPending: toggling } = useToggleFavorit(token);

  const favorit = data?.data || [];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e5eeff", position: "sticky" as const, top: 0, zIndex: 50, boxShadow: "0 1px 8px rgba(15,23,42,.05)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span style={{ fontSize: 22 }}>🗺️</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 18, color: "#131b2e" }}>GeoKost</span>
          </Link>
          <nav style={{ display: "flex", gap: 20 }}>
            <Link href="/mahasiswa/cari" style={{ fontSize: 13, color: "#45464d", textDecoration: "none", fontWeight: 500 }}>🔍 Cari Kost</Link>
            <Link href="/mahasiswa/favorit" style={{ fontSize: 13, color: "#131b2e", textDecoration: "none", fontWeight: 700, borderBottom: "2px solid #006e2f", paddingBottom: 2 }}>♥ Favorit</Link>
            <Link href="/mahasiswa/booking" style={{ fontSize: 13, color: "#45464d", textDecoration: "none", fontWeight: 500 }}>📋 Riwayat</Link>
            <Link href="/mahasiswa/profil" style={{ fontSize: 13, color: "#45464d", textDecoration: "none", fontWeight: 500 }}>👤 Profil</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "#131b2e", marginBottom: 6 }}>Kost Favorit Saya</h1>
          {isLoading
            ? <p style={{ fontSize: 14, color: "#76777d" }}>Memuat favorit...</p>
            : <p style={{ fontSize: 14, color: "#76777d" }}>{favorit.length} kost tersimpan</p>
          }
        </div>

        {/* Tidak login */}
        {!token && (
          <div style={{ textAlign: "center" as const, padding: "80px 20px", background: "#fff", borderRadius: 20, border: "1px solid #e5eeff" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>🔒</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#131b2e", marginBottom: 8 }}>Login Diperlukan</h2>
            <p style={{ fontSize: 14, color: "#76777d", marginBottom: 24 }}>Login untuk melihat dan mengelola kost favorit Anda.</p>
            <Link href="/login" style={{ padding: "12px 28px", borderRadius: 9999, background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              Login Sekarang
            </Link>
          </div>
        )}

        {/* Loading skeleton */}
        {token && isLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 320, borderRadius: 20, background: "#e5eeff", animation: "pulse 1.5s ease infinite" }} />
            ))}
          </div>
        )}

        {/* Error */}
        {token && isError && (
          <div style={{ textAlign: "center" as const, padding: "60px 20px", background: "#fff", borderRadius: 20, border: "1px solid #ffd6d6" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>⚠️</div>
            <p style={{ fontWeight: 600, color: "#dc2626", marginBottom: 16 }}>Gagal memuat favorit. Pastikan Anda sudah login.</p>
            <Link href="/login" style={{ padding: "10px 24px", borderRadius: 9999, background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Login Ulang</Link>
          </div>
        )}

        {/* Kosong */}
        {token && !isLoading && !isError && favorit.length === 0 && (
          <div style={{ textAlign: "center" as const, padding: "80px 20px", background: "#fff", borderRadius: 20, border: "1px solid #e5eeff" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>💔</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#131b2e", marginBottom: 8 }}>Belum Ada Kost Favorit</h2>
            <p style={{ fontSize: 14, color: "#76777d", marginBottom: 24 }}>Tambahkan kost ke favorit saat menjelajahi peta.</p>
            <Link href="/mahasiswa/peta" style={{ padding: "12px 28px", borderRadius: 9999, background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              🗺️ Jelajahi Peta
            </Link>
          </div>
        )}

        {/* Daftar favorit */}
        {token && !isLoading && favorit.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {favorit.map((k) => (
              <div key={k.favorit_id} style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", boxShadow: "0 4px 20px rgba(15,23,42,.06)", overflow: "hidden" }}>
                {/* Image */}
                <div style={{ height: 170, background: "linear-gradient(135deg,#e5eeff,#dce9ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", position: "relative" as const, overflow: "hidden" }}>
                  {k.foto_urls.length > 0
                    ? <img src={k.foto_urls[0]} alt={k.nama} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : "🏠"
                  }
                  {/* Rating badge */}
                  {k.rating > 0 && (
                    <div style={{ position: "absolute" as const, top: 12, left: 12, background: "rgba(255,255,255,.9)", backdropFilter: "blur(8px)", borderRadius: 9999, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#f59e0b", display: "flex", alignItems: "center", gap: 3 }}>
                      ★ {k.rating.toFixed(1)}
                    </div>
                  )}
                  {/* Remove favorit button */}
                  <button
                    onClick={() => toggleFavorit(k.kost_id)}
                    disabled={toggling}
                    title="Hapus dari favorit"
                    style={{ position: "absolute" as const, top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.9)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", fontSize: 16, boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}
                  >
                    ♥
                  </button>
                </div>
                {/* Body */}
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15, color: "#131b2e", margin: 0 }}>{k.nama}</h3>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 9999, background: "#eff4ff", color: "#131b2e", fontWeight: 600, alignSelf: "center", textTransform: "capitalize" as const }}>{k.tipe_kamar}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#006e2f", marginBottom: 6 }}>
                    {formatHarga(k.harga_per_bulan)}<span style={{ fontSize: 12, color: "#76777d", fontWeight: 400 }}>/bln</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#76777d", marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}>
                    📍 {k.alamat || "Alamat tidak dicantumkan"}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 14 }}>
                    {k.fasilitas.slice(0, 3).map((f) => (
                      <span key={f} style={{ padding: "3px 10px", borderRadius: 9999, background: "#e5eeff", color: "#45464d", fontSize: 11, fontWeight: 500 }}>
                        {FASILITAS_LABEL[f] || f}
                      </span>
                    ))}
                    {k.fasilitas.length > 3 && (
                      <span style={{ padding: "3px 10px", borderRadius: 9999, background: "#f0f4ff", color: "#76777d", fontSize: 11 }}>
                        +{k.fasilitas.length - 3}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/kost/${k.kost_id}`} style={{ flex: 1, padding: "9px 0", borderRadius: 10, background: "#131b2e", color: "#fff", textAlign: "center" as const, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                      Lihat Detail
                    </Link>
                    <Link href={`/booking/${k.kost_id}`} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "1.5px solid #131b2e", background: "transparent", color: "#131b2e", textAlign: "center" as const, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                      Booking
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

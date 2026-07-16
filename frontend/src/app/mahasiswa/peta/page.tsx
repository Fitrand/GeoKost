"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { useKostNearby, useKostNearbyLocation, useKampusList, useRecommend } from "@/hooks/useKost";
import { useFilterStore } from "@/store/filterStore";
import { useAuthStore } from "@/store/authStore";
import { Home, Map, ClipboardList, MapPin, Sparkles, Map as MapIcon, Filter, List } from "lucide-react";
import KostCard from "@/components/kost/KostCard";
import FilterPanel from "@/components/kost/FilterPanel";
import type { KostItem, KostRekomendasi } from "@/types/kost.types";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div style={{
      width: "100%", height: "100%",
      background: "var(--color-surface-low)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center", color: "var(--color-muted)" }}>
        <MapIcon size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem" }}>Memuat Peta...</p>
      </div>
    </div>
  ),
});

export default function PetaPage() {
  const {
    mapCenter, mapZoom, kampusId, budgetMax, jarakMaxKm,
    fasilitasDiinginkan, tipeKamar, setMapCenter,
  } = useFilterStore();

  const [selectedKost, setSelectedKost] = useState<KostItem | null>(null);
  const [showPanel, setShowPanel] = useState<"filter" | "list" | null>("list");
  const [rekomendasi, setRekomendasi] = useState<KostRekomendasi[]>([]);
  const [locating, setLocating] = useState(false);
  const [mapMoved, setMapMoved] = useState(false);
  const [searchCenter, setSearchCenter] = useState(mapCenter);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { user, token } = useAuthStore();
  const isMitra = user?.role === "mitra";
  const [mitraKost, setMitraKost] = useState<KostItem[]>([]);

  useEffect(() => {
    if (isMitra && token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/mitra/kost`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => setMitraKost(data.data || []))
      .catch(console.error);
    }
  }, [isMitra, token]);

  const handleLokasiku = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Browser Anda tidak mendukung Geolocation.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setMapCenter(coords);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Izin lokasi ditolak. Aktifkan di pengaturan browser.");
        } else {
          setLocationError("Gagal mendapatkan lokasi. Coba lagi.");
        }
        setTimeout(() => setLocationError(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setMapCenter]);

  // Auto-lokasi saat halaman dimuat
  useEffect(() => {
    handleLokasiku();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: nearbyData, isLoading: loadingNearby } = useKostNearby({
    lat: searchCenter.lat,
    lng: searchCenter.lng,
    radius_km: jarakMaxKm,
    harga_max: budgetMax,
    tipe_kamar: tipeKamar || undefined,
    enabled: !isMitra,
  });

  // Deteksi pergerakan peta
  useEffect(() => {
    const moved =
      Math.abs(mapCenter.lat - searchCenter.lat) > 0.005 ||
      Math.abs(mapCenter.lng - searchCenter.lng) > 0.005;
    setMapMoved(moved);
  }, [mapCenter, searchCenter]);

  const { data: nearbyMeData, isLoading: loadingNearbyMe, refetch: refetchNearbyMe } = useKostNearbyLocation({
    lat: userLocation?.lat ?? null,
    lng: userLocation?.lng ?? null,
    radius_km: 2,
    harga_max: budgetMax,
    tipe_kamar: tipeKamar || undefined,
  });

  const { data: kampusData } = useKampusList();
  const { mutate: getRekomendasi, isPending: loadingRec } = useRecommend();

  const handleRekomendasi = useCallback(() => {
    if (!kampusId) return alert("Pilih kampus terlebih dahulu di panel filter");
    getRekomendasi(
      {
        kampus_id: kampusId, budget_max: budgetMax,
        jarak_max_km: jarakMaxKm, fasilitas_diinginkan: fasilitasDiinginkan,
        tipe_kamar: tipeKamar || undefined,
      },
      { 
        onSuccess: (data) => {
          setRekomendasi(data.ranked_kost);
          setShowPanel("list"); // Auto switch ke tab list
        }
      }
    );
  }, [kampusId, budgetMax, jarakMaxKm, fasilitasDiinginkan, tipeKamar, getRekomendasi]);

  const displayKost = isMitra ? mitraKost : (rekomendasi.length > 0 ? rekomendasi : (nearbyData?.data || []));

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 16px", borderRadius: 9999, fontSize: 13, fontWeight: 600,
    border: "1.5px solid",
    borderColor: active ? "var(--color-primary)" : "var(--color-outline)",
    background: active ? "var(--color-primary)" : "transparent",
    color: active ? "#fff" : "var(--color-on-surface-variant)",
    cursor: "pointer", transition: "all 0.15s",
  });

  const formatJarakUser = (meter?: number) => {
    if (!meter) return null;
    return meter < 1000 ? `${Math.round(meter)}m` : `${(meter / 1000).toFixed(1)}km`;
  };


  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--color-bg)" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 380, flexShrink: 0,
        display: "flex", flexDirection: "column",
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-outline)",
        zIndex: 10,
        boxShadow: "2px 0 12px rgba(15,23,42,0.05)",
      }}>

        <div style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--color-outline)",
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--color-surface)",
        }}>
          {/* Beranda Button */}
          <Link href="/" style={{
            width: 34, height: 34, borderRadius: "50%",
            border: "1.5px solid var(--color-outline)",
            background: "var(--color-surface)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--color-on-surface-variant)", textDecoration: "none", flexShrink: 0
          }} title="Beranda">
            <Home size={16} />
          </Link>

          {/* Search bar pill */}
          {!isMitra && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const input = (e.currentTarget.querySelector("input") as HTMLInputElement);
                const val = input.value.trim();
                if (val) {
                  // Navigasi ke halaman cari dengan query
                  window.location.href = `/mahasiswa/cari?q=${encodeURIComponent(val)}`;
                }
              }}
              style={{
                flex: 1,
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--color-surface-low)",
                borderRadius: 9999, padding: "8px 14px",
                border: "1px solid var(--color-outline)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-muted)", flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Cari nama kost atau area..."
                style={{
                  border: "none", outline: "none", background: "transparent",
                  fontSize: 13, color: "var(--color-on-bg)",
                  fontFamily: "var(--font-body)", flex: 1,
                }}
              />
            </form>
          )}


          {/* Fav + Avatar */}
          {!isMitra && (
            <Link href="/mahasiswa/favorit" style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--color-outline)", background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-on-surface-variant)", textDecoration: "none", flexShrink: 0 }} title="Favorit">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </Link>
          )}
          <Link href={isMitra ? "/mitra/dashboard" : "/mahasiswa/profil"} style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", flexShrink: 0 }} title={isMitra ? "Dashboard Mitra" : "Profil"}>
            {user?.nama?.charAt(0)?.toUpperCase() || "M"}
          </Link>
        </div>

        {/* Tab switcher */}
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--color-outline)", display: "flex", gap: 8 }}>
          {isMitra ? (
            <div style={{ padding: "6px 16px", borderRadius: 9999, fontSize: 13, fontWeight: 600, border: "1.5px solid var(--color-primary)", background: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
              <ClipboardList size={14} /> Properti Saya
            </div>
          ) : (
            <>
              <button style={tabBtnStyle(showPanel === "filter")} onClick={() => setShowPanel(showPanel === "filter" ? "list" : "filter")}>
                Filter
              </button>
              <button style={tabBtnStyle(showPanel === "list")} onClick={() => setShowPanel(showPanel === "list" ? null : "list")}>
                List
              </button>
              <button
                id="tab-terdekat"
                style={{
                  ...tabBtnStyle(showPanel === "terdekat" as any),
                  position: "relative", display: "flex", alignItems: "center", gap: 4
                }}
                onClick={() => {
                  setShowPanel("terdekat" as any);
                  if (!userLocation) handleLokasiku();
                }}
              >
                <MapPin size={14} /> Terdekat
                {userLocation && nearbyMeData && nearbyMeData.total > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -4,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#006e2f", color: "#fff",
                    fontSize: 9, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {nearbyMeData.total}
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* Filter Panel */}
          {!isMitra && showPanel === "filter" && (
            <FilterPanel
              kampusList={kampusData?.data || []}
              onRekomendasi={handleRekomendasi}
              loadingRec={loadingRec}
            />
          )}

          {/* Kost List */}
          {(isMitra || showPanel === "list") && (
            <div style={{ padding: "12px 14px" }}>

              {/* Status row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "var(--color-on-surface-variant)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  {rekomendasi.length > 0
                    ? <><Sparkles size={14} /> {rekomendasi.length} Rekomendasi C4.5</>
                    : `${displayKost.length} Kost Tersedia`}
                </span>
                {rekomendasi.length > 0 && (
                  <button
                    onClick={() => setRekomendasi([])}
                    style={{ fontSize: 12, color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    ✕ Reset
                  </button>
                )}
              </div>

              {/* Rekomendasi CTA */}
              {!isMitra && rekomendasi.length === 0 && (
                <button
                  onClick={handleRekomendasi}
                  disabled={loadingRec || !kampusId}
                  style={{
                    width: "100%", padding: "11px", borderRadius: 10, border: "none",
                    marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    background: kampusId ? "var(--color-primary)" : "var(--color-surface-container)",
                    color: kampusId ? "#fff" : "var(--color-muted)",
                    fontFamily: "var(--font-body)", fontWeight: 700,
                    fontSize: "0.85rem", cursor: kampusId ? "pointer" : "not-allowed",
                    transition: "all 0.15s",
                  }}
                >
                  <Sparkles size={14} />
                  {loadingRec ? "Memproses C4.5..." : kampusId ? "Dapatkan Rekomendasi AI" : "Pilih kampus di Filter"}
                </button>
              )}
              {/* Daftar Kost */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {displayKost.map(kost => (
                  <KostCard
                    key={kost.id}
                    kost={kost}
                    isSelected={selectedKost?.id === kost.id}
                    showDetail={true}
                    onClick={() => {
                      setSelectedKost(kost);
                      setMapCenter(kost.koordinat);
                    }}
                  />
                ))}
                {displayKost.length === 0 && !loadingRec && (
                  <div style={{ textAlign: "center", padding: "20px", color: "var(--color-muted)" }}>
                    Tidak ada kost yang sesuai filter
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kost Terdekat dari Lokasi Saya */}
          {(showPanel as string) === "terdekat" && (
            <div style={{ padding: "12px 14px" }}>

              {/* Header panel */}
              <div style={{
                background: userLocation ? "rgba(0,110,47,0.06)" : "rgba(19,27,46,0.04)",
                border: `1px solid ${userLocation ? "rgba(0,110,47,0.2)" : "var(--color-outline)"}`,
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 14,
              }}>
                {userLocation ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 18 }}>📍</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#006e2f" }}>Lokasi Anda Terdeteksi</span>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--color-muted)", margin: 0 }}>
                      {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                    </p>
                    <button
                      onClick={() => { handleLokasiku(); refetchNearbyMe(); }}
                      disabled={locating}
                      style={{
                        marginTop: 8,
                        fontSize: 11, fontWeight: 600,
                        color: "#006e2f", background: "none",
                        border: "none", cursor: "pointer", padding: 0,
                      }}
                    >
                      {locating ? "⏳ Memperbarui..." : "🔄 Perbarui Lokasi"}
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ fontWeight: 600, fontSize: 13, color: "var(--color-primary)", marginBottom: 8 }}>
                      🔍 Deteksi Lokasi Anda
                    </p>
                    <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 10 }}>
                      Izinkan akses lokasi untuk melihat kost terdekat dari posisi Anda saat ini.
                    </p>
                    <button
                      onClick={handleLokasiku}
                      disabled={locating}
                      style={{
                        width: "100%", padding: "9px",
                        borderRadius: 9, border: "none",
                        background: "var(--color-primary)", color: "#fff",
                        fontWeight: 700, fontSize: 13,
                        cursor: locating ? "wait" : "pointer",
                      }}
                    >
                      {locating ? "⏳ Mendeteksi lokasi..." : "📍 Aktifkan Lokasi Saya"}
                    </button>
                    {locationError && (
                      <p style={{ fontSize: 11, color: "#dc2626", marginTop: 8, marginBottom: 0 }}>⚠️ {locationError}</p>
                    )}
                  </>
                )}
              </div>

              {/* Results */}
              {userLocation && (
                loadingNearbyMe ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />
                    ))}
                  </div>
                ) : nearbyMeData && nearbyMeData.data.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4, fontWeight: 600 }}>
                      {nearbyMeData.total} kost dalam radius 2km dari lokasi Anda
                    </div>
                    {nearbyMeData.data.map((kost, idx) => (
                      <div key={kost.id} style={{ position: "relative" }}>
                        {/* Ranking badge */}
                        <div style={{
                          position: "absolute", top: 10, left: 10,
                          zIndex: 10,
                          width: 22, height: 22, borderRadius: "50%",
                          background: idx === 0 ? "#f59e0b" : idx === 1 ? "#94a3b8" : idx === 2 ? "#b45309" : "var(--color-primary)",
                          color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 800,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}>
                          #{idx + 1}
                        </div>
                        {/* Distance badge */}
                        {kost.jarak_meter && (
                          <div style={{
                            position: "absolute", top: 10, right: 10,
                            zIndex: 10,
                            background: "rgba(37,99,235,0.12)",
                            border: "1px solid rgba(37,99,235,0.25)",
                            color: "#1d4ed8",
                            padding: "2px 8px", borderRadius: 9999,
                            fontSize: 10, fontWeight: 700,
                          }}>
                            {formatJarakUser(kost.jarak_meter)}
                          </div>
                        )}
                        <KostCard
                          kost={kost}
                          isSelected={selectedKost?.id === kost.id}
                          showDetail={true}
                          onClick={() => {
                            setSelectedKost(kost);
                            setMapCenter(kost.koordinat);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-muted)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>🏘️</div>
                    <p style={{ fontWeight: 600, color: "var(--color-on-surface-variant)" }}>Tidak ada kost dalam radius 2km</p>
                    <p style={{ fontSize: "0.82rem", marginTop: 6 }}>Data kost mungkin belum tersedia di area Anda</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ── MAP AREA ── */}
      <div style={{ flex: 1, position: "relative" }}>
        <LeafletMap
          center={mapCenter}
          zoom={mapZoom}
          kostList={displayKost}
          selectedKost={selectedKost}
          onKostClick={setSelectedKost}
          kampusList={kampusData?.data || []}
          jarakKm={jarakMaxKm}
          userLocation={userLocation}
        />

        {/* "Cari area ini" floating button — hanya muncul saat peta sudah bergeser */}
        {mapMoved && !isMitra && (
        <div style={{
          position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
          zIndex: 500, animation: "fadeIn 0.2s ease",
        }}>
          <button
            onClick={() => {
              setSearchCenter({ lat: mapCenter.lat, lng: mapCenter.lng });
              setMapMoved(false);
              setShowPanel("list");
            }}
            style={{
              padding: "9px 20px", borderRadius: 9999,
              background: "var(--color-primary)",
              border: "none",
              boxShadow: "0 4px 16px rgba(19,27,46,0.30)",
              fontSize: 13, fontWeight: 700,
              color: "#fff",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              transition: "filter 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.12)")}
            onMouseLeave={e => (e.currentTarget.style.filter = "")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            Cari di area ini
          </button>
        </div>
        )}

        {/* GeoKost brand overlay on map */}
        <div style={{
          position: "absolute", top: 16, left: 16, zIndex: 500,
          background: "var(--color-surface)", borderRadius: 10,
          padding: "8px 14px", boxShadow: "var(--shadow-card)",
          border: "1px solid var(--color-outline)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 16 }}>🗺️</span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "var(--color-primary)" }}>
            GeoKost
          </span>
        </div>

        {/* Tombol Lokasi Saya */}
        <div style={{
          position: "absolute", bottom: 90, right: 12, zIndex: 900,
          display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8,
        }}>
          {/* Error toast */}
          {locationError && (
            <div style={{
              background: "#fee2e2", color: "#991b1b",
              padding: "8px 14px", borderRadius: 10,
              fontSize: 12, fontWeight: 600,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              maxWidth: 220, textAlign: "right",
              animation: "fadeIn 0.2s ease",
            }}>
              ⚠️ {locationError}
            </div>
          )}
          {/* Badge "Lokasi Saya" saat sudah ditemukan */}
          {userLocation && (
            <div style={{
              background: "rgba(0,110,47,0.1)",
              border: "1px solid rgba(0,110,47,0.3)",
              color: "#006e2f",
              padding: "5px 12px", borderRadius: 9999,
              fontSize: 11, fontWeight: 700,
              backdropFilter: "blur(8px)",
            }}>
              📍 Lokasi terdeteksi
            </div>
          )}
          {/* Tombol utama */}
          <button
            id="btn-lokasi-saya"
            onClick={handleLokasiku}
            disabled={locating}
            title="Cari kost di sekitar lokasi saya saat ini"
            style={{
              width: 44, height: 44,
              borderRadius: "50%",
              background: userLocation ? "#006e2f" : "#fff",
              border: `2px solid ${userLocation ? "#006e2f" : "#e5eeff"}`,
              boxShadow: "0 4px 16px rgba(15,23,42,0.18)",
              cursor: locating ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
              transition: "all 0.2s ease",
              transform: locating ? "scale(0.92)" : "scale(1)",
            }}
          >
            {locating ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={userLocation ? "#fff" : "#131b2e"} strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                </path>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={userLocation ? "#fff" : "#131b2e"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                <circle cx="12" cy="12" r="9" strokeDasharray="3 2" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

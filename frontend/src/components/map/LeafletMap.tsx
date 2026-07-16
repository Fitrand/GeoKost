"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { KostItem, Kampus } from "@/types/kost.types";

interface LeafletMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  kostList: KostItem[];
  selectedKost: KostItem | null;
  onKostClick: (kost: KostItem) => void;
  kampusList: Kampus[];
  jarakKm: number;
  userLocation?: { lat: number; lng: number } | null;
}

const formatHargaShort = (harga: number) => {
  if (harga >= 1_000_000) return `Rp ${(harga / 1_000_000).toFixed(1)}jt`;
  return `Rp ${(harga / 1000).toFixed(0)}rb`;
};

const formatHarga = (harga: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(harga);

// ── Tile Layers ─────────────────────────────────────────────────────────────
const TILE_STYLES = [
  {
    id: "voyager",
    label: "🗺️ Warna",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
  },
  {
    id: "dark",
    label: "🌑 Gelap",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
  },
  {
    id: "satellite",
    label: "🛰️ Satelit",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '© <a href="https://www.esri.com/">Esri</a>',
    subdomains: "",
  },
  {
    id: "outdoor",
    label: "🏔️ Outdoor",
    url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: "",
  },
];

export default function LeafletMap({
  center, zoom, kostList, selectedKost, onKostClick, kampusList, jarakKm, userLocation,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const kampusMarkersRef = useRef<any[]>([]);
  const circleRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const [activeTile, setActiveTile] = useState("voyager");
  const [routeInfo, setRouteInfo] = useState<{ jarakKm: number; durasiMenit: number; startLabel: string } | null>(null);
  const [routingKostId, setRoutingKostId] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (typeof window === "undefined" || mapInstanceRef.current) return;

    const L = require("leaflet");

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: false,
      attributionControl: true,
    });

    // Default: CartoDB Voyager — colorful & detailed, great for WebGIS
    const defaultTile = TILE_STYLES[0];
    const tile = L.tileLayer(defaultTile.url, {
      attribution: defaultTile.attribution,
      subdomains: defaultTile.subdomains || "abc",
      maxZoom: 20,
    }).addTo(map);
    tileLayerRef.current = tile;

    // Custom zoom control (top-right)
    L.control.zoom({ position: "topright" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch tile layer when activeTile changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const L = require("leaflet");

    const style = TILE_STYLES.find((t) => t.id === activeTile);
    if (!style) return;

    tileLayerRef.current.remove();
    tileLayerRef.current = L.tileLayer(style.url, {
      attribution: style.attribution,
      subdomains: style.subdomains || "abc",
      maxZoom: 20,
    }).addTo(mapInstanceRef.current);
  }, [activeTile]);

  // Pan to center
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([center.lat, center.lng], zoom, { animate: true });
  }, [center, zoom]);

  // ── OSRM Routing ────────────────────────────────────────────────────────
  const clearRoute = useCallback(() => {
    if (routeLayerRef.current && mapInstanceRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    setRouteInfo(null);
    setRoutingKostId(null);
  }, []);

  const fetchRoute = useCallback(async (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    startLabel: string,
    kostId: string,
  ) => {
    if (!mapInstanceRef.current) return;
    const L = require("leaflet");

    // Hapus rute sebelumnya
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    setRoutingKostId(kostId);

    try {
      // OSRM Public API — gratis, tanpa API Key, mode driving
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code !== "Ok" || !data.routes?.[0]) {
        console.warn("OSRM: rute tidak ditemukan");
        setRoutingKostId(null);
        return;
      }

      const route = data.routes[0];
      const jarakKmRoute = route.distance / 1000;
      const durasiMenit = Math.ceil(route.duration / 60);

      // Gambar garis rute di peta
      const geojson = route.geometry;
      routeLayerRef.current = L.geoJSON(geojson, {
        style: {
          color: "#2563eb",
          weight: 5,
          opacity: 0.85,
          lineCap: "round",
          lineJoin: "round",
          dashArray: undefined,
        },
      }).addTo(mapInstanceRef.current);

      // Fit peta agar garis rute terlihat semua
      mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60] });

      setRouteInfo({ jarakKm: parseFloat(jarakKmRoute.toFixed(2)), durasiMenit, startLabel });
    } catch (e) {
      console.error("OSRM error:", e);
      setRoutingKostId(null);
    }
  }, []);

  // "Anda di sini" marker — pulsing blue dot
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = require("leaflet");

    // Hapus marker sebelumnya
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (!userLocation) return;

    const youAreHereIcon = L.divIcon({
      html: `
        <div style="position:relative; width:20px; height:20px;">
          <div style="
            position:absolute; inset:0;
            background:rgba(59,130,246,0.25);
            border-radius:50%;
            animation:pulse-ring 1.8s cubic-bezier(0.215,0.61,0.355,1) infinite;
          "></div>
          <div style="
            position:absolute; top:50%; left:50%;
            transform:translate(-50%,-50%);
            width:12px; height:12px;
            background:#2563eb;
            border:2.5px solid #fff;
            border-radius:50%;
            box-shadow:0 2px 8px rgba(37,99,235,0.5);
          "></div>
        </div>
        <style>
          @keyframes pulse-ring {
            0%   { transform:scale(0.5); opacity:1; }
            100% { transform:scale(2.2); opacity:0; }
          }
        </style>
      `,
      className: "",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    userMarkerRef.current = L.marker(
      [userLocation.lat, userLocation.lng],
      { icon: youAreHereIcon, zIndexOffset: 1000 }
    )
      .addTo(mapInstanceRef.current)
      .bindPopup(`
        <div style="padding:10px; font-family:'Inter',sans-serif; min-width:140px;">
          <strong style="color:#2563eb; font-size:13px;">📍 Lokasi Anda</strong><br>
          <small style="color:#76777d;">
            ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}
          </small>
        </div>
      `);
  }, [userLocation]);

  // Kampus markers + radius circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = require("leaflet");

    kampusMarkersRef.current.forEach((m) => m.remove());
    kampusMarkersRef.current = [];
    if (circleRef.current) { circleRef.current.remove(); circleRef.current = null; }

    kampusList.forEach((kampus) => {
      const kampusIcon = L.divIcon({
        html: `<div style="
          background: #131b2e;
          border: 3px solid #fff;
          border-radius: 50%;
          width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(19,27,46,0.35);
          cursor: pointer;
        ">🎓</div>`,
        className: "",
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([kampus.koordinat.lat, kampus.koordinat.lng], { icon: kampusIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="padding:10px; min-width:180px; font-family:'Inter',sans-serif;">
            <strong style="font-size:14px; color:#131b2e;">${kampus.nama}</strong>
            ${kampus.singkatan ? `<br><span style="color:#76777d;font-size:12px;">${kampus.singkatan}</span>` : ""}
            ${kampus.alamat ? `<br><small style="color:#76777d;font-size:11px;">${kampus.alamat}</small>` : ""}
          </div>
        `);

      const circle = L.circle([kampus.koordinat.lat, kampus.koordinat.lng], {
        radius: jarakKm * 1000,
        color: "#131b2e",
        fillColor: "#131b2e",
        fillOpacity: 0.04,
        weight: 1.5,
        dashArray: "6, 6",
      }).addTo(mapInstanceRef.current);

      circleRef.current = circle;
      kampusMarkersRef.current.push(marker, circle);
    });
  }, [kampusList, jarakKm]);

  // Kost markers — pill-shaped price labels per DESIGN.md
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = require("leaflet");

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    kostList.forEach((kost) => {
      const isSelected = selectedKost?.id === kost.id;
      const score = (kost as any).skor_kecocokan;

      // Pill: Deep Blue default → Emerald Green when selected
      const bgColor = isSelected ? "#006e2f" : "#131b2e";
      const textColor = "#ffffff";
      const scale = isSelected ? "scale(1.15)" : "scale(1)";

      const kostIcon = L.divIcon({
        html: `<div style="
          background: ${bgColor};
          color: ${textColor};
          border-radius: 9999px;
          padding: 5px 10px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 3px 10px rgba(0,0,0,0.18);
          cursor: pointer;
          transform: ${scale};
          transition: all 0.2s ease;
          display: flex; align-items: center; gap: 4px;
        ">
          ${formatHargaShort(kost.harga_per_bulan)}
        </div>`,
        className: "",
        iconSize: [90, 28],
        iconAnchor: [45, 14],
      });

      // Popup kost: tambah indikator AI + tombol Lihat Rute
      const p = (kost as any).prediksi_harga;
      const aiLabelMap: Record<string, {bg:string;color:string;icon:string}> = {
        Murah:    { bg: "rgba(0,110,47,0.12)",  color: "#006e2f", icon: "🔥" },
        Wajar:    { bg: "rgba(100,116,139,0.1)", color: "#475569", icon: "✓" },
        Mahal:    { bg: "rgba(220,38,38,0.12)",  color: "#dc2626", icon: "⚠️" },
        Estimasi: { bg: "rgba(100,116,139,0.08)",color: "#64748b", icon: "🤖" },
      };
      const aiCfg = p ? (aiLabelMap[p.label] ?? aiLabelMap["Wajar"]) : null;

      const marker = L.marker([kost.koordinat.lat, kost.koordinat.lng], { icon: kostIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="padding:12px; min-width:240px; font-family:'Inter',sans-serif;">
            <strong style="font-size:14px; color:#131b2e;">${kost.nama}</strong><br>
            <span style="color:#006e2f; font-weight:700; font-size:15px;">${formatHarga(kost.harga_per_bulan)}</span>
            <span style="color:#76777d; font-size:11px;">/bln</span><br>
            ${aiCfg && p ? `
              <div style="display:inline-flex;align-items:center;gap:5px;margin:5px 0;background:${aiCfg.bg};border-radius:9999px;padding:2px 10px;">
                <span style="font-size:11px;">${aiCfg.icon}</span>
                <span style="font-size:11px;font-weight:700;color:${aiCfg.color};">${p.label} (${Math.abs(p.selisih_persen).toFixed(0)}%)</span>
                <span style="font-size:10px;color:#94a3b8;border-left:1px solid #e2e8f0;padding-left:6px;">AI: ${formatHargaShort(p.harga_prediksi)}</span>
              </div><br>` : ""}
            ${kost.jarak_meter ? `<small style="color:#76777d;">📍 ${kost.jarak_meter < 1000 ? kost.jarak_meter.toFixed(0) + "m" : (kost.jarak_meter/1000).toFixed(1) + "km"} dari kampus</small><br>` : ""}
            ${kost.tipe_kamar ? `<small style="color:#76777d;">🛏️ Kamar ${kost.tipe_kamar}</small><br>` : ""}
            <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:4px;">
              ${(kost.fasilitas || []).slice(0, 3).map((f: string) =>
                `<span style="background:#e5eeff; color:#131b2e; padding:2px 8px; border-radius:9999px; font-size:10px; font-weight:500;">${f}</span>`
              ).join("")}
            </div>
            ${(kost as any).label_rekomendasi ? `<div style="margin-top:8px;"><span style="background:rgba(0,110,47,0.1);color:#006e2f;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:600;">✓ ${(kost as any).label_rekomendasi}</span></div>` : ""}
            <button
              id="btn-rute-${kost.id}"
              style="margin-top:10px;width:100%;padding:7px;border-radius:8px;border:none;background:#131b2e;color:#fff;font-weight:700;font-size:12px;cursor:pointer;"
            >🗺️ Lihat Rute ke Sini</button>
          </div>
        `)
        .on("click", () => onKostClick(kost))
        .on("popupopen", () => {
          // Pasang listener pada tombol setelah popup terbuka di DOM
          setTimeout(() => {
            const btn = document.getElementById(`btn-rute-${kost.id}`);
            if (btn) {
              btn.onclick = () => {
                // Titik awal: lokasi user (GPS) atau kampus pertama
                const start = userLocation
                  ? { lat: userLocation.lat, lng: userLocation.lng }
                  : kampusList[0]?.koordinat ?? center;
                const startLabel = userLocation ? "Lokasi Anda" : (kampusList[0]?.singkatan ?? "Kampus");
                fetchRoute(start, kost.koordinat, startLabel, kost.id);
              };
            }
          }, 100);
        });

      markersRef.current.push(marker);
    });
  }, [kostList, selectedKost, onKostClick, userLocation, kampusList, center, fetchRoute]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Map canvas */}
      <div
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        id="geokost-map"
      />

      {/* Tile Style Switcher — bottom right floating panel */}
      <div style={{
        position: "absolute",
        bottom: 28,
        right: 12,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(15,23,42,0.16)",
          border: "1px solid rgba(255,255,255,0.8)",
          padding: "8px 6px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}>
          <div style={{
            fontSize: 9,
            fontWeight: 700,
            color: "#76777d",
            textAlign: "center",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            paddingBottom: 4,
            borderBottom: "1px solid #e5eeff",
            marginBottom: 2,
          }}>
            Tema Peta
          </div>
          {TILE_STYLES.map((style) => {
            const isActive = activeTile === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setActiveTile(style.id)}
                title={style.label}
                style={{
                  padding: "5px 10px",
                  borderRadius: 8,
                  border: "1.5px solid",
                  borderColor: isActive ? "#131b2e" : "transparent",
                  background: isActive ? "#131b2e" : "transparent",
                  color: isActive ? "#fff" : "#45464d",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textAlign: "left",
                  whiteSpace: "nowrap",
                }}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Route Info Panel — muncul saat rute aktif */}
      {routeInfo && (
        <div style={{
          position: "absolute",
          bottom: 28, left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(16px)",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(15,23,42,0.2)",
          border: "1px solid rgba(37,99,235,0.2)",
          padding: "14px 20px",
          display: "flex", alignItems: "center", gap: 20,
          minWidth: 300,
        }}>
          {/* Icon */}
          <div style={{ fontSize: 28 }}>🗺️</div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>
              Rute dari {routeInfo.startLabel}
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#131b2e" }}>{routeInfo.jarakKm} km</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>Jarak</div>
              </div>
              <div style={{ width: 1, height: 32, background: "#e2e8f0" }} />
              {/* Estimasi waktu berbagai moda */}
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>🚶 {Math.ceil(routeInfo.durasiMenit * 2.5)}m</div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>Jalan</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>🏍️ {Math.ceil(routeInfo.durasiMenit * 0.7)}m</div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>Motor</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#d97706" }}>🚲 {Math.ceil(routeInfo.durasiMenit * 1.5)}m</div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>Sepeda</div>
                </div>
              </div>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={clearRoute}
            style={{
              width: 28, height: 28, borderRadius: "50%",
              border: "1px solid #e2e8f0", background: "#f8fafc",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, color: "#64748b", flexShrink: 0,
            }}
          >✕</button>
        </div>
      )}
    </div>
  );
}


"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@supabase/supabase-js";
import { ClipboardList, MapPin, Wrench, Image as ImageIcon, Save, Loader2, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const FASILITAS_OPTIONS = [
  { value: "wifi", label: "WiFi" },
  { value: "ac", label: "AC" },
  { value: "kasur", label: "Kasur" },
  { value: "kipas", label: "Kipas" },
  { value: "kamar_mandi_dalam", label: "KM Dalam" },
  { value: "kamar_mandi_luar", label: "KM Luar" },
  { value: "parkir_motor", label: "Parkir Motor" },
  { value: "parkir_mobil", label: "Parkir Mobil" },
  { value: "dapur", label: "Dapur" },
  { value: "laundry", label: "Laundry" },
  { value: "security", label: "Security" },
  { value: "cctv", label: "CCTV" },
  { value: "water_heater", label: "Water Heater" },
  { value: "kulkas", label: "Kulkas" },
  { value: "tv", label: "TV" },
  { value: "meja_belajar", label: "Meja Belajar" },
];

// Default center: Lhokseumawe, Aceh Utara
const DEFAULT_LAT = 5.1797;
const DEFAULT_LNG = 97.1500;

export default function TambahKostPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fasilitas, setFasilitas] = useState<string[]>([]);
  const [fotoFiles, setFotoFiles] = useState<File[]>([]);
  const [fotoPreviews, setFotoPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [hargaMode, setHargaMode] = useState<"bulan" | "tahun">("bulan");
  const [pinSet, setPinSet] = useState(false);
  const [form, setForm] = useState({
    nama: "", deskripsi: "",
    harga: "",
    luas_panjang: "", luas_lebar: "",
    tipe_kamar: "single", alamat: "",
    lat: DEFAULT_LAT.toString(), lng: DEFAULT_LNG.toString(),
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const toggleFasilitas = (v: string) =>
    setFasilitas(f => f.includes(v) ? f.filter(x => x !== v) : [...f, v]);

  // ── Init Leaflet map ────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || leafletMapRef.current) return;

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      const map = L.map(mapRef.current, { zoomControl: true }).setView([DEFAULT_LAT, DEFAULT_LNG], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Custom pin icon
      const pinIcon = L.divIcon({
        className: "",
        html: `<div style="width:32px;height:32px;background:var(--color-primary,#6366f1);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
        }
        setForm(f => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
        setPinSet(true);
      });

      leafletMapRef.current = map;
    };

    if ((window as any).L) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // ── Foto handling ───────────────────────────────────────────────────────────
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const combined = [...fotoFiles, ...files].slice(0, 5); // max 5 foto
    setFotoFiles(combined);
    setFotoPreviews(combined.map(f => URL.createObjectURL(f)));
  };

  const removeFoto = (idx: number) => {
    const newFiles = fotoFiles.filter((_, i) => i !== idx);
    setFotoFiles(newFiles);
    setFotoPreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  // Upload foto ke Supabase Storage, return array URL
  const uploadFotos = async (): Promise<string[]> => {
    if (!fotoFiles.length) return [];
    const urls: string[] = [];
    for (let i = 0; i < fotoFiles.length; i++) {
      setUploadProgress(`Mengupload foto ${i + 1}/${fotoFiles.length}...`);
      const file = fotoFiles[i];
      const ext = file.name.split(".").pop();
      const path = `kost/${Date.now()}_${i}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("kost-photos")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw new Error(`Gagal upload foto ${i + 1}: ${upErr.message}`);
      const { data } = supabase.storage.from("kost-photos").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    setUploadProgress(null);
    return urls;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!pinSet) {
      setError("Silakan klik pada peta untuk menentukan lokasi kost.");
      return;
    }
    setLoading(true); setError(null);
    try {
      // Upload foto terlebih dahulu
      const foto_urls = await uploadFotos();

      const payload: any = {
        nama: form.nama,
        deskripsi: form.deskripsi || null,
        tipe_kamar: form.tipe_kamar,
        alamat: form.alamat || null,
        fasilitas,
        foto_urls,
        koordinat: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) },
      };

      // Harga
      if (hargaMode === "tahun") {
        payload.harga_per_tahun = parseInt(form.harga);
        payload.harga_per_bulan = Math.floor(parseInt(form.harga) / 12);
      } else {
        payload.harga_per_bulan = parseInt(form.harga);
      }

      // Luas
      if (form.luas_panjang && form.luas_lebar) {
        payload.luas_panjang = parseInt(form.luas_panjang);
        payload.luas_lebar = parseInt(form.luas_lebar);
      }

      const res = await fetch(`${API}/api/mitra/kost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Gagal menyimpan");
      setSuccess(true);
      setTimeout(() => router.push("/mitra/dashboard"), 1800);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid var(--color-outline)", background: "var(--color-bg)",
    fontSize: 14, fontFamily: "var(--font-body)", color: "var(--color-on-bg)",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: "var(--color-primary)", marginBottom: 6, display: "block",
  };
  const cardStyle: React.CSSProperties = {
    background: "var(--color-surface)", borderRadius: 16, padding: 24,
    border: "1px solid var(--color-outline)", marginBottom: 20,
  };

  const luasM2 = form.luas_panjang && form.luas_lebar
    ? parseInt(form.luas_panjang) * parseInt(form.luas_lebar)
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-outline)", padding: "16px 28px", display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/mitra/dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "var(--color-primary)" }}><ArrowLeft size={20} /></Link>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "var(--color-primary)", margin: 0 }}>Tambah Kost Baru</h1>
          <p style={{ fontSize: 12, color: "var(--color-muted)", margin: 0 }}>Isi data properti kost Anda</p>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px" }}>
        {success && (
          <div style={{ background: "rgba(0,110,47,0.1)", border: "1px solid rgba(0,110,47,0.3)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, color: "#006e2f", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle size={18} /> Kost berhasil ditambahkan! Mengalihkan ke dashboard...
          </div>
        )}
        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 12, padding: "14px 20px", marginBottom: 20, color: "#dc2626", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ── 1. Informasi Dasar ── */}
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--color-primary)", marginBottom: 20, marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}><ClipboardList size={18} /> Informasi Dasar</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Nama Kost *</label>
                <input required style={inputStyle} placeholder="cth: Kost Putri Melati Indah" value={form.nama} onChange={e => set("nama", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Deskripsi</label>
                <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Deskripsikan kost Anda..." value={form.deskripsi} onChange={e => set("deskripsi", e.target.value)} />
              </div>

              {/* Harga dengan toggle bulan/tahun */}
              <div>
                <label style={labelStyle}>Harga Sewa *</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  {(["bulan", "tahun"] as const).map(mode => (
                    <button key={mode} type="button" onClick={() => setHargaMode(mode)} style={{
                      padding: "5px 16px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1.5px solid",
                      borderColor: hargaMode === mode ? "var(--color-primary)" : "var(--color-outline)",
                      background: hargaMode === mode ? "var(--color-primary)" : "transparent",
                      color: hargaMode === mode ? "#fff" : "var(--color-muted)",
                    }}>Per {mode.charAt(0).toUpperCase() + mode.slice(1)}</button>
                  ))}
                </div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--color-muted)", pointerEvents: "none" }}>Rp</span>
                  <input required type="number" style={{ ...inputStyle, paddingLeft: 36 }}
                    placeholder={hargaMode === "bulan" ? "800.000" : "9.600.000"}
                    value={form.harga} onChange={e => set("harga", e.target.value)} />
                </div>
                {hargaMode === "tahun" && form.harga && !isNaN(parseInt(form.harga)) && (
                  <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}>
                    ≈ Rp {Math.floor(parseInt(form.harga) / 12).toLocaleString("id-ID")}/bulan
                  </p>
                )}
              </div>

              {/* Luas Kamar m × m */}
              <div>
                <label style={labelStyle}>Luas Kamar (m × m)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto", gap: 8, alignItems: "center" }}>
                  <input type="number" min={1} max={99} style={inputStyle} placeholder="3" value={form.luas_panjang} onChange={e => set("luas_panjang", e.target.value)} />
                  <span style={{ fontSize: 18, fontWeight: 700, color: "var(--color-muted)", padding: "0 4px" }}>×</span>
                  <input type="number" min={1} max={99} style={inputStyle} placeholder="3" value={form.luas_lebar} onChange={e => set("luas_lebar", e.target.value)} />
                  <span style={{ fontSize: 13, color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                    {luasM2 ? `= ${luasM2} m²` : "m²"}
                  </span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Tipe Kamar *</label>
                <select required style={inputStyle} value={form.tipe_kamar} onChange={e => set("tipe_kamar", e.target.value)}>
                  {[["single", "Single"], ["double", "Double"], ["campur", "Campur"], ["putra", "Putra"], ["putri", "Putri"]].map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Alamat Lengkap</label>
                <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} placeholder="cth: Jl. Kampus Bukit Indah No. 10, Reuleut" value={form.alamat} onChange={e => set("alamat", e.target.value)} />
              </div>
            </div>
          </div>

          {/* ── 2. Lokasi via Peta ── */}
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--color-primary)", marginBottom: 6, marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}><MapPin size={18} /> Lokasi Kost</h2>
            <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 14, marginTop: 0 }}>
              Klik langsung pada peta untuk menentukan titik lokasi kost Anda.
            </p>

            {!pinSet && (
              <div style={{ background: "rgba(99,102,241,0.08)", border: "1px dashed var(--color-primary)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "var(--color-primary)", fontWeight: 600 }}>
                Klik pada peta di bawah untuk meletakkan pin lokasi
              </div>
            )}
            {pinSet && (
              <div style={{ background: "rgba(0,110,47,0.08)", border: "1px solid rgba(0,110,47,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#006e2f", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={14} /> Pin terpasang — Lat: {parseFloat(form.lat).toFixed(5)}, Lng: {parseFloat(form.lng).toFixed(5)}
              </div>
            )}

            <div ref={mapRef} style={{ width: "100%", height: 340, borderRadius: 12, overflow: "hidden", border: "1.5px solid var(--color-outline)" }} />

            {/* Manual override (tersembunyi tapi tetap fungsional) */}
            <details style={{ marginTop: 12 }}>
              <summary style={{ fontSize: 12, color: "var(--color-muted)", cursor: "pointer" }}>Input koordinat manual</summary>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
                <div>
                  <label style={labelStyle}>Latitude</label>
                  <input type="number" step="any" style={inputStyle} value={form.lat} onChange={e => set("lat", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Longitude</label>
                  <input type="number" step="any" style={inputStyle} value={form.lng} onChange={e => set("lng", e.target.value)} />
                </div>
              </div>
            </details>
          </div>

          {/* ── 3. Fasilitas ── */}
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--color-primary)", marginBottom: 16, marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}><Wrench size={18} /> Fasilitas</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {FASILITAS_OPTIONS.map(f => {
                const active = fasilitas.includes(f.value);
                return (
                  <button key={f.value} type="button" onClick={() => toggleFasilitas(f.value)} style={{
                    padding: "7px 16px", borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1.5px solid", transition: "all 0.15s",
                    borderColor: active ? "var(--color-primary)" : "var(--color-outline)",
                    background: active ? "var(--color-primary)" : "transparent",
                    color: active ? "#fff" : "var(--color-on-surface-variant)",
                  }}>{active ? "✓ " : ""}{f.label}</button>
                );
              })}
            </div>
          </div>

          {/* ── 4. Upload Foto ── */}
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--color-primary)", marginBottom: 6, marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}><ImageIcon size={18} /> Foto Kost</h2>
            <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 14, marginTop: 0 }}>Upload langsung foto kost Anda (maks. 5 foto, format JPG/PNG/WEBP)</p>

            {/* Grid preview foto */}
            {fotoPreviews.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginBottom: 14 }}>
                {fotoPreviews.map((src, i) => (
                  <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", border: "1.5px solid var(--color-outline)" }}>
                    <img src={src} alt={`Foto ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button type="button" onClick={() => removeFoto(i)} style={{
                      position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%",
                      background: "rgba(220,38,38,0.9)", color: "#fff", border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Tombol tambah foto */}
            {fotoFiles.length < 5 && (
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 8, padding: "20px", borderRadius: 12, border: "2px dashed var(--color-outline)",
                cursor: "pointer", color: "var(--color-muted)", fontSize: 13, transition: "border-color 0.15s",
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>{fotoFiles.length === 0 ? "Klik untuk pilih foto" : `Tambah foto lagi (${fotoFiles.length}/5)`}</span>
                <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFotoChange} />
              </label>
            )}

            {uploadProgress && (
              <div style={{ marginTop: 10, fontSize: 13, color: "var(--color-primary)", fontWeight: 600 }}>
                ⏳ {uploadProgress}
              </div>
            )}
          </div>

          {/* ── Submit ── */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href="/mitra/dashboard" style={{ padding: "11px 24px", borderRadius: 10, border: "1.5px solid var(--color-outline)", color: "var(--color-on-surface-variant)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              Batal
            </Link>
            <button type="submit" disabled={loading} style={{
              padding: "11px 28px", borderRadius: 10, border: "none",
              background: loading ? "var(--color-surface-container)" : "var(--color-primary)",
              color: loading ? "var(--color-muted)" : "#fff",
              fontWeight: 700, fontSize: 14, cursor: loading ? "wait" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Menyimpan...</> : <><Save size={16} /> Simpan Kost</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

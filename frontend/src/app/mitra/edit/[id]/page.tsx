"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditKostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { token } = useAuthStore();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fasilitas, setFasilitas] = useState<string[]>([]);
  
  // Existing photo URLs from DB
  const [existingFotos, setExistingFotos] = useState<string[]>([]);
  
  // New photo files to upload
  const [newFotoFiles, setNewFotoFiles] = useState<File[]>([]);
  const [newFotoPreviews, setNewFotoPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  
  const [hargaMode, setHargaMode] = useState<"bulan" | "tahun">("bulan");
  const [form, setForm] = useState({
    nama: "", deskripsi: "", 
    harga: "",
    luas_panjang: "", luas_lebar: "",
    tipe_kamar: "single", alamat: "", 
    lat: "", lng: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const toggleFasilitas = (v: string) =>
    setFasilitas(f => f.includes(v) ? f.filter(x => x !== v) : [...f, v]);

  // Fetch data
  useEffect(() => {
    if (!id || !token) return;
    fetch(`${API}/api/mitra/kost/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setForm({
          nama: data.nama || "", deskripsi: data.deskripsi || "",
          harga: String(data.harga_per_bulan || ""),
          luas_panjang: String(data.luas_panjang || ""),
          luas_lebar: String(data.luas_lebar || ""),
          tipe_kamar: data.tipe_kamar || "single",
          alamat: data.alamat || "",
          lat: String(data.koordinat?.lat || "5.1797"),
          lng: String(data.koordinat?.lng || "97.1500"),
        });
        setFasilitas(data.fasilitas || []);
        setExistingFotos(data.foto_urls || []);
      })
      .catch(() => setError("Gagal memuat data kost"))
      .finally(() => setLoading(false));
  }, [id, token]);

  // Init map when data is loaded
  useEffect(() => {
    if (loading || typeof window === "undefined" || !mapRef.current || leafletMapRef.current) return;

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

      const currentLat = parseFloat(form.lat) || 5.1797;
      const currentLng = parseFloat(form.lng) || 97.1500;

      const map = L.map(mapRef.current, { zoomControl: true }).setView([currentLat, currentLng], 15);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO",
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: "",
        html: `<div style="width:32px;height:32px;background:var(--color-primary,#6366f1);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      markerRef.current = L.marker([currentLat, currentLng], { icon: pinIcon }).addTo(map);

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        markerRef.current.setLatLng([lat, lng]);
        setForm(f => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
      });

      leafletMapRef.current = map;
    };

    if ((window as any).L) initMap();
    else {
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
  }, [loading, form.lat, form.lng]); // depend on loading and initial form state

  // Photo handlers
  const maxTotalPhotos = 5;
  const currentTotalPhotos = existingFotos.length + newFotoFiles.length;

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    const availableSlots = maxTotalPhotos - existingFotos.length - newFotoFiles.length;
    if (availableSlots <= 0) return;
    
    const allowedFiles = files.slice(0, availableSlots);
    const combinedFiles = [...newFotoFiles, ...allowedFiles];
    
    setNewFotoFiles(combinedFiles);
    setNewFotoPreviews(combinedFiles.map(f => URL.createObjectURL(f)));
  };

  const removeExistingFoto = (idx: number) => {
    setExistingFotos(prev => prev.filter((_, i) => i !== idx));
  };

  const removeNewFoto = (idx: number) => {
    const newFiles = newFotoFiles.filter((_, i) => i !== idx);
    setNewFotoFiles(newFiles);
    setNewFotoPreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  const uploadFotos = async (): Promise<string[]> => {
    if (!newFotoFiles.length) return [];
    const urls: string[] = [];
    for (let i = 0; i < newFotoFiles.length; i++) {
      setUploadProgress(`Mengupload foto ${i + 1}/${newFotoFiles.length}...`);
      const file = newFotoFiles[i];
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!token) return;
    setSaving(true); setError(null);
    try {
      // Upload new photos first
      const newlyUploadedUrls = await uploadFotos();
      const finalFotoUrls = [...existingFotos, ...newlyUploadedUrls];

      const payload: any = {
        nama: form.nama,
        deskripsi: form.deskripsi || null,
        tipe_kamar: form.tipe_kamar,
        alamat: form.alamat || null,
        fasilitas,
        foto_urls: finalFotoUrls,
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
      } else {
        payload.luas_panjang = null;
        payload.luas_lebar = null;
      }

      const res = await fetch(`${API}/api/mitra/kost/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Gagal menyimpan");
      router.push("/mitra/dashboard");
    } catch (e: any) { 
      setError(e.message); 
    } finally { 
      setSaving(false); 
      setUploadProgress(null);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid var(--color-outline)", background: "var(--color-bg)",
    fontSize: 14, fontFamily: "var(--font-body)", color: "var(--color-on-bg)",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--color-primary)", marginBottom: 6, display: "block" };
  const cardStyle: React.CSSProperties = { background: "var(--color-surface)", borderRadius: 16, padding: 24, border: "1px solid var(--color-outline)", marginBottom: 20 };

  const luasM2 = form.luas_panjang && form.luas_lebar
    ? parseInt(form.luas_panjang) * parseInt(form.luas_lebar)
    : null;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Loader2 size={32} className="animate-spin text-primary" />
        <p>Memuat data kost...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", fontFamily: "var(--font-body)" }}>
      <div style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-outline)", padding: "16px 28px", display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/mitra/dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "var(--color-primary)" }}><ArrowLeft size={20} /></Link>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "var(--color-primary)", margin: 0 }}>Edit Kost</h1>
          <p style={{ fontSize: 12, color: "var(--color-muted)", margin: 0 }}>{form.nama}</p>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px" }}>
        {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 12, padding: "14px 20px", marginBottom: 20, color: "#dc2626", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><AlertTriangle size={18} /> {error}</div>}

        <form onSubmit={handleSubmit}>
          {/* ── 1. Informasi Dasar ── */}
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--color-primary)", marginBottom: 20, marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}><ClipboardList size={18} /> Informasi Dasar</h2>
            <div style={{ display: "grid", gap: 16 }}>
              <div><label style={labelStyle}>Nama Kost *</label><input required style={inputStyle} value={form.nama} onChange={e => set("nama", e.target.value)} /></div>
              <div><label style={labelStyle}>Deskripsi</label><textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.deskripsi} onChange={e => set("deskripsi", e.target.value)} /></div>
              
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
                  <input required type="number" style={{ ...inputStyle, paddingLeft: 36 }} value={form.harga} onChange={e => set("harga", e.target.value)} />
                </div>
                {hargaMode === "tahun" && form.harga && !isNaN(parseInt(form.harga)) && (
                  <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}>
                    ≈ Rp {Math.floor(parseInt(form.harga) / 12).toLocaleString("id-ID")}/bulan
                  </p>
                )}
              </div>

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
                <label style={labelStyle}>Tipe Kamar</label>
                <select style={inputStyle} value={form.tipe_kamar} onChange={e => set("tipe_kamar", e.target.value)}>
                  {[["single", "Single"], ["double", "Double"], ["campur", "Campur"], ["putra", "Putra"], ["putri", "Putri"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Alamat</label><textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={form.alamat} onChange={e => set("alamat", e.target.value)} /></div>
            </div>
          </div>

          {/* ── 2. Lokasi ── */}
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--color-primary)", marginBottom: 6, marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}><MapPin size={18} /> Lokasi Kost</h2>
            <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 14, marginTop: 0 }}>Klik pada peta untuk memindahkan pin lokasi.</p>
            
            <div style={{ background: "rgba(0,110,47,0.08)", border: "1px solid rgba(0,110,47,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#006e2f", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={14} /> Lokasi Saat Ini — Lat: {parseFloat(form.lat).toFixed(5)}, Lng: {parseFloat(form.lng).toFixed(5)}
            </div>

            <div ref={mapRef} style={{ width: "100%", height: 340, borderRadius: 12, overflow: "hidden", border: "1.5px solid var(--color-outline)" }} />
            
            <details style={{ marginTop: 12 }}>
              <summary style={{ fontSize: 12, color: "var(--color-muted)", cursor: "pointer" }}>Input koordinat manual</summary>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
                <div><label style={labelStyle}>Latitude</label><input type="number" step="any" style={inputStyle} value={form.lat} onChange={e => set("lat", e.target.value)} /></div>
                <div><label style={labelStyle}>Longitude</label><input type="number" step="any" style={inputStyle} value={form.lng} onChange={e => set("lng", e.target.value)} /></div>
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

          {/* ── 4. Foto ── */}
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--color-primary)", marginBottom: 6, marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}><ImageIcon size={18} /> Foto Kost</h2>
            <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 14, marginTop: 0 }}>Upload foto (maks. 5 foto total, format JPG/PNG/WEBP)</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginBottom: 14 }}>
              {/* Existing Photos */}
              {existingFotos.map((src, i) => (
                <div key={`exist-${i}`} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", border: "1.5px solid var(--color-outline)" }}>
                  <img src={src} alt={`Foto Tersimpan ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button type="button" onClick={() => removeExistingFoto(i)} style={{
                    position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(220,38,38,0.9)", color: "#fff", border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>✕</button>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", color: "white", fontSize: 10, padding: "2px 4px", textAlign: "center" }}>Tersimpan</div>
                </div>
              ))}
              
              {/* New Photos */}
              {newFotoPreviews.map((src, i) => (
                <div key={`new-${i}`} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", border: "1.5px solid var(--color-outline)" }}>
                  <img src={src} alt={`Foto Baru ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button type="button" onClick={() => removeNewFoto(i)} style={{
                    position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(220,38,38,0.9)", color: "#fff", border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>✕</button>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--color-primary)", color: "white", fontSize: 10, padding: "2px 4px", textAlign: "center" }}>Baru</div>
                </div>
              ))}
            </div>

            {currentTotalPhotos < maxTotalPhotos && (
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 8, padding: "20px", borderRadius: 12, border: "2px dashed var(--color-outline)",
                cursor: "pointer", color: "var(--color-muted)", fontSize: 13, transition: "border-color 0.15s",
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Tambah foto lagi ({currentTotalPhotos}/{maxTotalPhotos})</span>
                <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFotoChange} />
              </label>
            )}

            {uploadProgress && (
              <div style={{ marginTop: 10, fontSize: 13, color: "var(--color-primary)", fontWeight: 600 }}>
                ⏳ {uploadProgress}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href="/mitra/dashboard" style={{ padding: "11px 24px", borderRadius: 10, border: "1.5px solid var(--color-outline)", color: "var(--color-on-surface-variant)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Batal</Link>
            <button type="submit" disabled={saving} style={{ padding: "11px 28px", borderRadius: 10, border: "none", background: saving ? "var(--color-surface-container)" : "var(--color-primary)", color: saving ? "var(--color-muted)" : "#fff", fontWeight: 700, fontSize: 14, cursor: saving ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              {saving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Save size={16} /> Simpan Perubahan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

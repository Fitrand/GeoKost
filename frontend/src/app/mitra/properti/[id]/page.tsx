"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";

const FASILITAS = ["WiFi 50Mbps", "AC Split", "Laundry", "Kamar Mandi Dalam", "CCTV 24 Jam", "Parkir Motor", "Meja Belajar", "Lemari 2 Pintu", "Kulkas", "TV", "Dapur Bersama", "Water Heater"];
const FASILITAS_ICONS: Record<string, string> = { "WiFi 50Mbps": "📶", "AC Split": "❄️", "Laundry": "👕", "Kamar Mandi Dalam": "🚿", "CCTV 24 Jam": "📹", "Parkir Motor": "🏍️", "Meja Belajar": "📚", "Lemari 2 Pintu": "🗄️", "Kulkas": "🧊", "TV": "📺", "Dapur Bersama": "🍳", "Water Heater": "🔥" };

export default function EditPropertiPage() {
  const params = useParams();
  const isNew = params?.id === "new";

  const [form, setForm] = useState({
    nama: isNew ? "" : "Kost Lavender Exclusive",
    alamat: isNew ? "" : "Jl. Pendidikan No. 12, Sleman, Yogyakarta",
    deskripsi: isNew ? "" : "Kost nyaman untuk mahasiswa dengan fasilitas lengkap.",
    harga: isNew ? "" : "1500000",
    luas: isNew ? "" : "16",
    tipeKamar: isNew ? "" : "putri",
    fasilitas: isNew ? [] as string[] : ["WiFi 50Mbps", "AC Split", "Kamar Mandi Dalam"],
  });
  const [saved, setSaved] = useState(false);
  const [step, setStep] = useState(1);

  const toggleFasilitas = (f: string) => setForm((prev) => ({
    ...prev,
    fasilitas: prev.fasilitas.includes(f) ? prev.fasilitas.filter((x) => x !== f) : [...prev.fasilitas, f],
  }));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #c6c6cd", background: "#fff", fontSize: "0.9rem", fontFamily: "inherit", color: "#0b1c30", outline: "none", transition: "border .15s", boxSizing: "border-box" as const };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => ((e.currentTarget as HTMLElement).style.borderColor = "#131b2e");
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => ((e.currentTarget as HTMLElement).style.borderColor = "#c6c6cd");

  const STEPS = ["Info Dasar", "Fasilitas", "Foto & Lokasi"];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e5eeff", position: "sticky" as const, top: 0, zIndex: 50, boxShadow: "0 1px 8px rgba(15,23,42,.05)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/mitra/dashboard" style={{ fontSize: 13, color: "#45464d", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>← Kembali</Link>
            <div style={{ width: 1, height: 20, background: "#e5eeff" }} />
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15, color: "#131b2e" }}>
              {isNew ? "Tambah Properti Baru" : "Edit Properti"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!isNew && <button style={{ padding: "8px 16px", borderRadius: 9999, border: "1.5px solid #ba1a1a", background: "transparent", color: "#ba1a1a", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Hapus Properti</button>}
            <button onClick={handleSave} style={{ padding: "9px 20px", borderRadius: 9999, border: "none", background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(19,27,46,.25)" }}>
              💾 Simpan
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px" }}>
        {saved && (
          <div style={{ background: "rgba(0,110,47,.08)", border: "1px solid rgba(0,110,47,.2)", borderRadius: 12, padding: "12px 18px", marginBottom: 20, color: "#006e2f", fontWeight: 600, fontSize: 14 }}>
            ✅ Perubahan berhasil disimpan!
          </div>
        )}

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 0, marginBottom: 32, background: "#fff", borderRadius: 14, border: "1px solid #e5eeff", overflow: "hidden", boxShadow: "0 2px 10px rgba(15,23,42,.05)" }}>
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i + 1)} style={{ flex: 1, padding: "14px 0", border: "none", background: step === i + 1 ? "#131b2e" : "transparent", color: step === i + 1 ? "#fff" : "#45464d", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRight: i < STEPS.length - 1 ? "1px solid #e5eeff" : "none", fontFamily: "inherit", transition: "all .15s" }}>
              <span style={{ opacity: step === i + 1 ? 1 : 0.5, marginRight: 6 }}>{i + 1}</span>
              {s}
            </button>
          ))}
        </div>

        {/* Step 1: Info Dasar */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", padding: 28, boxShadow: "0 4px 20px rgba(15,23,42,.06)" }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#131b2e", marginBottom: 20 }}>Informasi Dasar</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#45464d", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Nama Kost *</label>
                  <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: Kost Lavender Exclusive" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#45464d", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Alamat Lengkap *</label>
                  <input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Jl. Contoh No. 123, Kecamatan, Kota" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#45464d", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Harga / Bulan (Rp) *</label>
                  <input type="number" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })} placeholder="1500000" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#45464d", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Luas Kamar (m²)</label>
                  <input type="number" value={form.luas} onChange={(e) => setForm({ ...form, luas: e.target.value })} placeholder="16" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#45464d", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Tipe Kamar *</label>
                  <select value={form.tipeKamar} onChange={(e) => setForm({ ...form, tipeKamar: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                    <option value="">-- Pilih Tipe --</option>
                    {["single", "double", "putra", "putri", "campur"].map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#45464d", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Deskripsi</label>
                  <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={4} placeholder="Ceritakan tentang kost Anda..." style={{ ...inputStyle, resize: "vertical" as const }} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setStep(2)} style={{ padding: "11px 28px", borderRadius: 9999, border: "none", background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Lanjut: Fasilitas →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Fasilitas */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", padding: 28, boxShadow: "0 4px 20px rgba(15,23,42,.06)" }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#131b2e", marginBottom: 6 }}>Fasilitas yang Tersedia</h2>
              <p style={{ fontSize: 13, color: "#76777d", marginBottom: 20 }}>{form.fasilitas.length} fasilitas dipilih</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 10 }}>
                {FASILITAS.map((f) => {
                  const sel = form.fasilitas.includes(f);
                  return (
                    <button key={f} onClick={() => toggleFasilitas(f)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: "1.5px solid", borderColor: sel ? "#131b2e" : "#c6c6cd", background: sel ? "#131b2e" : "#fff", color: sel ? "#fff" : "#45464d", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                      <span>{FASILITAS_ICONS[f] || "✓"}</span> {f}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(1)} style={{ padding: "11px 24px", borderRadius: 9999, border: "1.5px solid #c6c6cd", background: "transparent", color: "#45464d", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>← Kembali</button>
              <button onClick={() => setStep(3)} style={{ padding: "11px 28px", borderRadius: 9999, border: "none", background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Lanjut: Foto & Lokasi →</button>
            </div>
          </div>
        )}

        {/* Step 3: Foto & Lokasi */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", padding: 28, boxShadow: "0 4px 20px rgba(15,23,42,.06)" }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#131b2e", marginBottom: 6 }}>Foto Properti</h2>
              <p style={{ fontSize: 13, color: "#76777d", marginBottom: 20 }}>Upload minimal 3 foto untuk meningkatkan kepercayaan calon penyewa.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ aspectRatio: "4/3", borderRadius: 12, border: "2px dashed #c6c6cd", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#f8f9ff", gap: 6, transition: "border-color .15s, background .15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#131b2e"; (e.currentTarget as HTMLDivElement).style.background = "#eff4ff"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#c6c6cd"; (e.currentTarget as HTMLDivElement).style.background = "#f8f9ff"; }}
                  >
                    <span style={{ fontSize: "1.8rem" }}>📷</span>
                    <span style={{ fontSize: 11, color: "#76777d", fontWeight: 600 }}>Upload Foto</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", padding: 28, boxShadow: "0 4px 20px rgba(15,23,42,.06)" }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#131b2e", marginBottom: 6 }}>Pin Lokasi di Peta</h2>
              <p style={{ fontSize: 13, color: "#76777d", marginBottom: 16 }}>Tandai lokasi kost Anda agar mahasiswa mudah menemukannya.</p>
              <div style={{ height: 240, background: "linear-gradient(135deg,#e5eeff,#dce9ff)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #c6c6cd" }}>
                <div style={{ textAlign: "center" as const }}>
                  <div style={{ fontSize: "3rem", marginBottom: 8 }}>📍</div>
                  <p style={{ fontSize: 14, color: "#45464d", fontWeight: 600 }}>Klik untuk memilih lokasi di peta</p>
                  <p style={{ fontSize: 12, color: "#76777d" }}>Map interaktif akan tampil setelah terhubung ke server</p>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(2)} style={{ padding: "11px 24px", borderRadius: 9999, border: "1.5px solid #c6c6cd", background: "transparent", color: "#45464d", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>← Kembali</button>
              <button onClick={handleSave} style={{ padding: "11px 32px", borderRadius: 9999, border: "none", background: "#006e2f", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,110,47,.3)" }}>
                ✅ {isNew ? "Publish Properti" : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

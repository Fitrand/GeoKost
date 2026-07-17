"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const FAQ = [
  { q: "Apakah GeoKost gratis digunakan?", a: "Ya, GeoKost sepenuhnya gratis untuk mahasiswa. Pemilik kost dapat mendaftarkan properti secara gratis dengan opsi upgrade ke listing Premium." },
  { q: "Bagaimana cara kerja rekomendasi C4.5?", a: "Algoritma Decision Tree C4.5 menganalisis preferensi Anda (budget, fasilitas, jarak) dan mencocokkannya dengan data kost untuk menghasilkan skor kecocokan yang personal." },
  { q: "Apakah data saya aman?", a: "Semua data dienkripsi dengan SSL 256-bit. Kami tidak menjual data pengguna ke pihak ketiga. Baca kebijakan privasi kami untuk detail lengkap." },
  { q: "Bagaimana cara mendaftarkan kost saya?", a: "Daftar sebagai Mitra GeoKost melalui halaman Register, pilih tipe akun Pemilik Kost, lalu tambahkan properti Anda lewat Dashboard Mitra." },
];

const CONTACTS = [
  { icon: "📧", label: "Email", value: "halo@geokost.id", link: "mailto:halo@geokost.id" },
  { icon: "📱", label: "WhatsApp", value: "+62 812 3456 7890", link: "https://wa.me/6281234567890" },
  { icon: "📍", label: "Alamat", value: "Jl. Colombo No.1, Sleman, Yogyakarta 55281", link: "#" },
  { icon: "🕒", label: "Jam Operasional", value: "Senin–Jumat, 08.00–17.00 WIB", link: "#" },
];

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function KontakPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [form, setForm] = useState({ nama: "", email: "", topik: "", pesan: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/kontak/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal mengirim pesan");
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #c6c6cd", background: "#fff", fontSize: "0.9rem", fontFamily: "inherit", color: "#0b1c30", outline: "none", boxSizing: "border-box" as const };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff", fontFamily: "'Inter',system-ui,sans-serif" }}>
      {/* Navbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e5eeff", position: "sticky" as const, top: 0, zIndex: 50, boxShadow: "0 1px 8px rgba(15,23,42,.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span style={{ fontSize: 22 }}>🗺️</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 18, color: "#131b2e" }}>GeoKost</span>
          </Link>
          <nav style={{ display: "flex", gap: 28 }}>
            {([["Cari Kost","/mahasiswa/cari"],["Tentang Kami","/tentang"],["Rekomendasi","/mahasiswa/peta"],["Kontak","/kontak"]] as [string,string][]).map(([l,h]) => (
              <Link key={l} href={h} style={{ fontSize: 14, color: l === "Kontak" ? "#131b2e" : "#45464d", fontWeight: l === "Kontak" ? 700 : 500, textDecoration: "none", borderBottom: l === "Kontak" ? "2px solid #006e2f" : "none", paddingBottom: 2 }}>{l}</Link>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {token ? (
              <>
                <Link href={user?.role === "mitra" ? "/mitra/dashboard" : "/mahasiswa/cari"} style={{ padding: "9px 20px", borderRadius: 9999, background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Dashboard</Link>
                <button onClick={() => { logout(); router.push('/login'); }} style={{ padding: "8px 20px", borderRadius: 9999, border: "1.5px solid #c6c6cd", background: "transparent", color: "#131b2e", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: 14, color: "#45464d", textDecoration: "none", fontWeight: 500 }}>Login</Link>
                <Link href="/register" style={{ padding: "9px 20px", borderRadius: 9999, background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#eff4ff,#f8f9ff)", padding: "64px 24px", textAlign: "center" as const }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "2.2rem", color: "#131b2e", marginBottom: 12 }}>Hubungi Kami</h1>
        <p style={{ fontSize: 16, color: "#45464d", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
          Ada pertanyaan, masukan, atau ingin bermitra dengan kami? Tim GeoKost siap membantu Anda.
        </p>
      </section>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 32, alignItems: "start" }}>

          {/* LEFT: Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", boxShadow: "0 4px 20px rgba(15,23,42,.06)", padding: 32 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#131b2e", marginBottom: 6 }}>Kirim Pesan</h2>
              <p style={{ fontSize: 13, color: "#76777d", marginBottom: 24 }}>Kami akan membalas dalam 1×24 jam hari kerja.</p>

              {sent ? (
                <div style={{ textAlign: "center" as const, padding: "32px 20px" }}>
                  <div style={{ fontSize: "3rem", marginBottom: 14 }}>✅</div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#131b2e", marginBottom: 8 }}>Pesan Terkirim!</h3>
                  <p style={{ fontSize: 14, color: "#45464d", lineHeight: 1.6 }}>Terima kasih telah menghubungi GeoKost. Tim kami akan membalas ke email <strong>{form.email}</strong> dalam 1×24 jam.</p>
                  <button onClick={() => { setSent(false); setForm({ nama:"",email:"",topik:"",pesan:"" }); }} style={{ marginTop: 20, padding: "10px 24px", borderRadius: 9999, border: "1.5px solid #c6c6cd", background: "transparent", color: "#131b2e", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    Kirim Pesan Lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {error && (
                    <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(186,26,26,0.08)", border: "1px solid rgba(186,26,26,0.2)", color: "#ba1a1a", fontSize: 13, fontWeight: 600 }}>
                      ⚠️ {error}
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {[["Nama Lengkap","nama","text","Ahmad Rizki"],["Email","email","email","kamu@email.com"]].map(([label,key,type,ph]) => (
                      <div key={key}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#45464d", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{label}</label>
                        <input type={type} required placeholder={ph} value={form[key as keyof typeof form]} onChange={(e) => setForm({...form,[key]:e.target.value})} style={inputStyle}
                          onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "#131b2e")}
                          onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "#c6c6cd")} />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#45464d", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Topik</label>
                    <select value={form.topik} required onChange={(e) => setForm({...form,topik:e.target.value})} style={inputStyle}>
                      <option value="">-- Pilih Topik --</option>
                      {["Pertanyaan Umum","Masalah Teknis","Kerjasama / Mitra","Laporan Bug","Lainnya"].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#45464d", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Pesan</label>
                    <textarea required rows={5} placeholder="Ceritakan pertanyaan atau masukan Anda..." value={form.pesan} onChange={(e) => setForm({...form,pesan:e.target.value})}
                      style={{ ...inputStyle, resize: "vertical" as const }}
                      onFocus={(e) => ((e.currentTarget as HTMLTextAreaElement).style.borderColor = "#131b2e")}
                      onBlur={(e) => ((e.currentTarget as HTMLTextAreaElement).style.borderColor = "#c6c6cd")} />
                  </div>

                  <button type="submit" disabled={loading} style={{ width: "100%", padding: 13, borderRadius: 10, border: "none", background: "#131b2e", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 4px 14px rgba(19,27,46,.25)" }}>
                    {loading ? "Mengirim..." : "Kirim Pesan →"}
                  </button>
                </form>
              )}
            </div>

            {/* FAQ */}
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", boxShadow: "0 4px 20px rgba(15,23,42,.06)", padding: 32 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#131b2e", marginBottom: 20 }}>Pertanyaan Umum (FAQ)</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {FAQ.map((faq, i) => (
                  <div key={i} style={{ borderBottom: i < FAQ.length - 1 ? "1px solid #f0f4ff" : "none" }}>
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#131b2e" }}>{faq.q}</span>
                      <span style={{ fontSize: 18, color: "#76777d", transition: "transform .2s", transform: openFaq === i ? "rotate(45deg)" : "none", flexShrink: 0, marginLeft: 12 }}>+</span>
                    </button>
                    {openFaq === i && (
                      <div style={{ paddingBottom: 16, fontSize: 14, color: "#45464d", lineHeight: 1.7 }}>{faq.a}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Contact info */}
          <div style={{ position: "sticky" as const, top: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#131b2e", borderRadius: 20, padding: 28, color: "#fff" }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: 20, color: "#fff" }}>Informasi Kontak</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {CONTACTS.map((c) => (
                  <a key={c.label} href={c.link} style={{ display: "flex", gap: 14, textDecoration: "none" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>{c.icon}</div>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 2 }}>{c.label}</div>
                      <div style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>{c.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", padding: 24, boxShadow: "0 4px 20px rgba(15,23,42,.06)" }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#131b2e", marginBottom: 14 }}>Daftarkan Kost Anda</h3>
              <p style={{ fontSize: 13, color: "#45464d", lineHeight: 1.6, marginBottom: 16 }}>Jadi Mitra GeoKost dan jangkau ribuan mahasiswa aktif setiap bulan.</p>
              <Link href="/mitra/dashboard" style={{ display: "block", padding: "11px", borderRadius: 10, background: "#006e2f", color: "#fff", textAlign: "center" as const, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                🏠 Mulai Jadi Mitra
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ background: "#f8f9ff", padding: "28px 24px", borderTop: "1px solid #e5eeff", textAlign: "center" as const }}>
        <p style={{ fontSize: 13, color: "#76777d" }}>© 2024 GeoKost · <Link href="/kebijakan-privasi" style={{ color: "#45464d", textDecoration: "none" }}>Kebijakan Privasi</Link> · <Link href="/syarat-ketentuan" style={{ color: "#45464d", textDecoration: "none" }}>Syarat & Ketentuan</Link></p>
      </footer>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
const TEAM = [
  { nama: "Sherly Nadia Refica", peran: "Founder & CEO", nim: "230180095", inisial: "SN", color: "#131b2e" },
  { nama: "Alvin Hadafi Albar", peran: "Data & Sales", nim: "230180089", inisial: "AH", color: "#006e2f" },
  { nama: "Satria Harry Menov", peran: "UI/UX & Design", nim: "230180090", inisial: "SH", color: "#7c3aed" },
  { nama: "Fitra Novriandika", peran: "Chief Developer", nim: "230180114", inisial: "FN", color: "#e83e8c" },
];

const VALUES = [
  { icon: "🎯", title: "Presisi Spasial", desc: "Menggunakan PostGIS dan algoritma GIS untuk kalkulasi jarak dan radius yang akurat." },
  { icon: "🤖", title: "AI Terpercaya", desc: "Decision Tree C4.5 dilatih pada data lokal untuk rekomendasi yang relevan dengan konteks Indonesia." },
  { icon: "🌱", title: "Ekosistem Adil", desc: "Platform transparan yang menguntungkan mahasiswa dan mitra pemilik kost secara berimbang." },
  { icon: "🔒", title: "Aman & Privat", desc: "Data pengguna dienkripsi dan tidak dijual ke pihak ketiga. Kepercayaan adalah prioritas kami." },
];

export default function TentangPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
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
            {([["Cari Kost", "/mahasiswa/cari"], ["Tentang Kami", "/tentang"], ["Rekomendasi", "/mahasiswa/peta"], ["Kontak", "/kontak"]] as [string,string][]).map(([l,h]) => (
              <Link key={l} href={h} style={{ fontSize: 14, color: l === "Tentang Kami" ? "#131b2e" : "#45464d", fontWeight: l === "Tentang Kami" ? 700 : 500, textDecoration: "none", borderBottom: l === "Tentang Kami" ? "2px solid #006e2f" : "none", paddingBottom: 2 }}>{l}</Link>
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
      <section style={{ background: "linear-gradient(135deg, #131b2e 0%, #1e2d47 100%)", padding: "80px 24px", textAlign: "center" as const, position: "relative" as const, overflow: "hidden" }}>
        <div style={{ position: "absolute" as const, top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(74,225,118,.06)" }} />
        <div style={{ position: "absolute" as const, bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.03)" }} />
        <div style={{ position: "relative" as const, maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 16px", borderRadius: 9999, background: "rgba(74,225,118,.1)", border: "1px solid rgba(74,225,118,.2)", color: "#4ae176", fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
            🚀 Tentang GeoKost
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "clamp(2rem,4vw,2.8rem)", color: "#fff", lineHeight: 1.15, marginBottom: 20, letterSpacing: "-0.02em" }}>
            Teknologi untuk Generasi Mahasiswa yang Lebih Cerdas
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.65)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
            GeoKost lahir dari kebutuhan nyata — ratusan mahasiswa yang bingung mencari hunian layak di kota baru. Kami membangun solusi berbasis GIS dan Machine Learning untuk menjembatani mahasiswa dengan kost terbaik.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px", textAlign: "center" as const }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "#131b2e", marginBottom: 16 }}>Misi Kami</h2>
        <p style={{ fontSize: 16, color: "#45464d", lineHeight: 1.8, maxWidth: 660, margin: "0 auto 48px" }}>
          Mempermudah proses pencarian kost mahasiswa melalui teknologi WebGIS, Machine Learning (C4.5 Decision Tree), dan prediksi harga berbasis data riil — sehingga setiap mahasiswa bisa membuat keputusan hunian yang lebih baik dan lebih cepat.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {[["1.200+","Kost Terdaftar"],["15+","Kampus Partner"],["5.000+","Mahasiswa Terbantu"],["98%","Kepuasan Pengguna"]].map(([v,l]) => (
            <div key={l} style={{ background: "#fff", borderRadius: 18, border: "1px solid #e5eeff", padding: "24px 20px", boxShadow: "0 4px 20px rgba(15,23,42,.05)" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "2.2rem", color: "#131b2e", marginBottom: 6 }}>{v}</div>
              <div style={{ fontSize: 13, color: "#76777d" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ background: "#fff", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "#131b2e", textAlign: "center" as const, marginBottom: 12 }}>Nilai yang Kami Pegang</h2>
          <p style={{ fontSize: 15, color: "#45464d", textAlign: "center" as const, marginBottom: 48, maxWidth: 500, margin: "0 auto 48px" }}>Prinsip-prinsip yang memandu setiap keputusan desain dan pengembangan GeoKost.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {VALUES.map((v) => (
              <div key={v.title} style={{ padding: 24, borderRadius: 18, border: "1px solid #e5eeff", background: "#f8f9ff" }}>
                <div style={{ fontSize: "2rem", marginBottom: 14 }}>{v.icon}</div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 16, color: "#131b2e", marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: "#45464d", lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px", textAlign: "center" as const }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "#131b2e", marginBottom: 12 }}>Tim di Balik GeoKost</h2>
        <p style={{ fontSize: 15, color: "#45464d", marginBottom: 48 }}>Dibuat dengan dedikasi oleh tim multidisiplin dari berbagai latar belakang teknologi.</p>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" as const }}>
          {TEAM.map((t) => (
            <div key={t.nama} style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", padding: "28px 24px", width: 220, boxShadow: "0 4px 20px rgba(15,23,42,.06)" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1.4rem", margin: "0 auto 16px" }}>{t.inisial}</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15, color: "#131b2e", marginBottom: 4 }}>{t.nama}</div>
              <div style={{ fontSize: 12, color: "#76777d", lineHeight: 1.5, marginBottom: 2 }}>{t.peran}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>NIM: {t.nim}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#131b2e", padding: "64px 24px", textAlign: "center" as const }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "#fff", marginBottom: 14 }}>Siap Mencari Kost Impianmu?</h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,.65)", marginBottom: 32 }}>Bergabunglah dengan ribuan mahasiswa yang sudah merasakan manfaat GeoKost.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/mahasiswa/peta" style={{ padding: "13px 28px", borderRadius: 9999, background: "#4ae176", color: "#131b2e", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>🗺️ Mulai Cari Kost</Link>
          <Link href="/kontak" style={{ padding: "13px 28px", borderRadius: 9999, border: "1.5px solid rgba(255,255,255,.3)", background: "transparent", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Hubungi Kami</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#f8f9ff", padding: "32px 24px", borderTop: "1px solid #e5eeff", textAlign: "center" as const }}>
        <p style={{ fontSize: 13, color: "#76777d" }}>© 2024 GeoKost. Crafted for smarter student living.</p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 12 }}>
          {[["Kebijakan Privasi","/kebijakan-privasi"],["Syarat & Ketentuan","/syarat-ketentuan"],["Kontak","/kontak"]].map(([l,h]) => (
            <Link key={l} href={h} style={{ fontSize: 13, color: "#45464d", textDecoration: "none" }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}

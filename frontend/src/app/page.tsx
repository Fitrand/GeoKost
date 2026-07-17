"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const FEATURES = [
  { icon: "🗺️", title: "Peta Interaktif GIS", desc: "Visualisasi real-time lokasi kost & radius kampus dengan PostGIS.", color: "#131b2e" },
  { icon: "🤖", title: "Rekomendasi AI C4.5", desc: "Decision Tree C4.5 otomatis ranking kost sesuai preferensimu.", color: "#006e2f" },
  { icon: "💰", title: "Prediksi Harga", desc: "Analisis apakah harga kost Murah, Wajar, atau Mahal.", color: "#d97706" },
  { icon: "📍", title: "Radius Kampus", desc: "Filter kost berdasarkan jarak ke kampus pilihanmu.", color: "#7c3aed" },
  { icon: "🏠", title: "Portal Mitra", desc: "Pemilik kost bisa daftarkan properti & kelola listing.", color: "#0891b2" },
  { icon: "📊", title: "Dashboard Analitik", desc: "Statistik performa, tren pencarian & insight pasar.", color: "#db2777" },
];

const STEPS = [
  { n: "01", title: "Pilih Kampus & Preferensi", desc: "Pilih kampusmu, atur budget, jarak, dan fasilitas yang diinginkan." },
  { n: "02", title: "Query Spasial PostGIS", desc: "Sistem mencari semua kost dalam radius menggunakan teknologi GIS." },
  { n: "03", title: "Algoritma C4.5 Beraksi", desc: "Model Decision Tree menilai dan memberi skor kecocokan tiap kost." },
  { n: "04", title: "Rekomendasi Terpersonalisasi", desc: "Kost ditampilkan di peta & list, diurutkan dari yang paling cocok." },
];

const formatHarga = (h: number) => {
  if (h >= 1_000_000) return `Rp ${(h / 1_000_000).toFixed(1)}jt`;
  return `Rp ${(h / 1000).toFixed(0)}rb`;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const s = {
  // layout
  page: { minHeight: "100vh", background: "#f8f9ff", fontFamily: "'Inter', system-ui, sans-serif", color: "#0b1c30" } as React.CSSProperties,
  // nav
  nav: { position: "sticky" as const, top: 0, zIndex: 50, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid #e5eeff", boxShadow: "0 1px 8px rgba(15,23,42,0.06)" },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" } as React.CSSProperties,
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none" } as React.CSSProperties,
  logoText: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: "#131b2e" } as React.CSSProperties,
  navLink: { fontSize: 14, fontWeight: 500, color: "#45464d", textDecoration: "none", transition: "color .15s" } as React.CSSProperties,
  btnPrimary: { padding: "10px 22px", borderRadius: 9999, background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 14px rgba(19,27,46,.22)", transition: "filter .15s" } as React.CSSProperties,
  btnSecondary: { padding: "10px 22px", borderRadius: 9999, border: "1.5px solid #c6c6cd", background: "transparent", color: "#131b2e", fontWeight: 600, fontSize: 14, textDecoration: "none", transition: "background .15s" } as React.CSSProperties,
  // hero
  hero: { paddingTop: 96, paddingBottom: 80, textAlign: "center" as const, position: "relative" as const, overflow: "hidden" },
  heroBg1: { position: "absolute" as const, top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(19,27,46,.04) 0%, transparent 70%)", pointerEvents: "none" as const },
  heroBg2: { position: "absolute" as const, top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(74,225,118,.06)", pointerEvents: "none" as const },
  heroBg3: { position: "absolute" as const, bottom: -60, left: -60, width: 320, height: 320, borderRadius: "50%", background: "rgba(19,27,46,.04)", pointerEvents: "none" as const },
  heroInner: { position: "relative" as const, maxWidth: 860, margin: "0 auto", padding: "0 24px" },
  badge: { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 16px", borderRadius: 9999, background: "rgba(0,110,47,.08)", border: "1px solid rgba(0,110,47,.2)", color: "#006e2f", fontSize: 12, fontWeight: 700, marginBottom: 24 } as React.CSSProperties,
  h1: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(2.4rem,5vw,3.25rem)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "#131b2e", marginBottom: 24 } as React.CSSProperties,
  heroSub: { fontSize: 18, color: "#45464d", lineHeight: 1.65, marginBottom: 48, maxWidth: 580, margin: "0 auto 48px" } as React.CSSProperties,
  // search
  searchWrap: { maxWidth: 620, margin: "0 auto 40px", display: "flex", alignItems: "center", background: "#fff", borderRadius: 9999, padding: "6px 6px 6px 20px", boxShadow: "0 8px 30px rgba(15,23,42,.1)", border: "1.5px solid #e5eeff" } as React.CSSProperties,
  searchInput: { flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 16, color: "#0b1c30", fontFamily: "inherit" } as React.CSSProperties,
  searchBtn: { padding: "12px 28px", borderRadius: 9999, background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", flexShrink: 0, transition: "filter .15s" } as React.CSSProperties,
  heroCta: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const },
  // sections
  section: { padding: "80px 24px", maxWidth: 1200, margin: "0 auto" } as React.CSSProperties,
  sectionWhite: { background: "#fff", padding: "80px 24px" } as React.CSSProperties,
  sectionBlue: { background: "#eff4ff", padding: "80px 24px" } as React.CSSProperties,
  sectionTitle: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.8rem", color: "#131b2e", textAlign: "center" as const, marginBottom: 12 },
  sectionSub: { fontSize: 16, color: "#45464d", textAlign: "center" as const, marginBottom: 56, maxWidth: 520, margin: "0 auto 56px" },
  // cards
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 } as React.CSSProperties,
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 } as React.CSSProperties,
  card: { background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", boxShadow: "0 4px 20px rgba(15,23,42,.06)", overflow: "hidden", transition: "transform .2s, box-shadow .2s" } as React.CSSProperties,
  featCard: { background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", boxShadow: "0 4px 20px rgba(15,23,42,.06)", padding: 24, transition: "transform .2s, box-shadow .2s" } as React.CSSProperties,
};

export default function HomePage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [searchQ, setSearchQ] = useState("");
  const [kostList, setKostList] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_kost: 0, total_kampus: 0 });

  useEffect(() => {
    // Fetch 4 kost terbaru dari API
    fetch(`${API}/api/kost/?limit=4`)
      .then(r => r.json())
      .then(data => setKostList(data.data || []))
      .catch(() => {});

    // Fetch stats platform
    fetch(`${API}/api/kampus`)
      .then(r => r.json())
      .then(data => setStats(prev => ({ ...prev, total_kampus: data.total || 0 })))
      .catch(() => {});

    fetch(`${API}/api/kost/?limit=1`)
      .then(r => r.json())
      .then(data => setStats(prev => ({ ...prev, total_kost: data.total || 0 })))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/mahasiswa/cari${searchQ ? `?q=${encodeURIComponent(searchQ)}` : ""}`);
  };

  return (
    <main style={s.page}>
      {/* NAVBAR */}
      <header style={s.nav}>
        <div style={s.navInner}>
          <Link href="/" style={s.logo}>
            <span style={{ fontSize: 24 }}>🗺️</span>
            <span style={s.logoText}>GeoKost</span>
          </Link>
          <nav style={{ display: "flex", gap: 28 }}>
            {([["Cari Kost", "/mahasiswa/cari"], ["Tentang Kami", "/tentang"], ["Rekomendasi", "/mahasiswa/peta"], ["Kontak", "/kontak"]] as [string,string][]).map(([label, href]) => (
              <Link key={label} href={href} style={s.navLink}>{label}</Link>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {token ? (
              <>
                <Link href={user?.role === "mitra" ? "/mitra/dashboard" : "/mahasiswa/cari"} style={s.btnPrimary}>Dashboard</Link>
                <button onClick={() => { logout(); router.push('/login'); }} style={{ ...s.btnSecondary, padding: "8px 20px", cursor: "pointer" }}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: "#45464d", textDecoration: "none" }}>Login</Link>
                <Link href="/register" style={s.btnPrimary}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroBg1} />
        <div style={s.heroBg2} />
        <div style={s.heroBg3} />
        <div style={s.heroInner}>
          <div style={s.badge}>✨ WebGIS + Machine Learning C4.5</div>
          <h1 style={s.h1}>Temukan Kost Terbaik<br />dengan Cerdas</h1>
          <p style={s.heroSub}>Platform WebGIS pintar untuk mencari hunian mahasiswa yang aman, terjangkau, dan nyaman — didukung AI.</p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={s.searchWrap}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#76777d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: 10 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Cari nama kost atau alamat..."
              style={s.searchInput}
            />
            <button type="submit" style={{ ...s.searchBtn, border: "none", cursor: "pointer" }}>Cari Sekarang</button>
          </form>

          <div style={s.heroCta}>
            <Link href="/mahasiswa/cari" style={{ ...s.btnPrimary, padding: "14px 32px", fontSize: 15 }}>🔍 Cari Kost</Link>
            <Link href="/mitra/dashboard" style={{ ...s.btnSecondary, padding: "14px 32px", fontSize: 15 }}>🏠 Daftarkan Kost Anda</Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: "#131b2e", padding: "48px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {[
            { value: stats.total_kost > 0 ? `${stats.total_kost}+` : "—", label: "Kost Terdaftar" },
            { value: stats.total_kampus > 0 ? `${stats.total_kampus}+` : "—", label: "Kampus Partner" },
            { value: "4.8★", label: "Rating Platform" },
            { value: "AI C4.5", label: "Algoritma Rekomendasi" },
          ].map((st) => (
            <div key={st.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "2rem", color: "#4ae176", marginBottom: 4 }}>{st.value}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* KOST CARDS */}
      <section style={{ ...s.sectionWhite }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={s.sectionTitle}>Kost Terbaru di Platform</h2>
          <p style={s.sectionSub}>Kost yang baru saja terdaftar di GeoKost — siap ditempati mahasiswa.</p>
          <div style={s.grid4}>
            {kostList.length > 0 ? kostList.map((k) => (
              <Link key={k.id} href={`/kost/${k.id}`} style={{ ...s.card, textDecoration: "none" }}>
                {/* Image */}
                <div style={{ height: 180, background: "linear-gradient(135deg, #e5eeff, #dce9ff)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                  {k.foto_urls?.[0] ? (
                    <img src={k.foto_urls[0]} alt={k.nama} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "3.5rem" }}>🏠</span>
                  )}
                  <span style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,.9)", backdropFilter: "blur(8px)", borderRadius: 9999, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#131b2e" }}>
                    {k.tipe_kamar || "Kost"}
                  </span>
                </div>
                {/* Body */}
                <div style={{ padding: "16px 18px" }}>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15, color: "#131b2e", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.nama}</h3>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#006e2f", marginBottom: 6 }}>
                    {formatHarga(k.harga_per_bulan)}<span style={{ fontSize: 12, color: "#76777d", fontWeight: 400 }}>/bln</span>
                  </div>
                  {k.alamat && <div style={{ fontSize: 12, color: "#76777d", marginBottom: 10, display: "flex", alignItems: "center", gap: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {k.alamat}</div>}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                    {(k.fasilitas || []).slice(0, 3).map((f: string) => (
                      <span key={f} style={{ padding: "3px 10px", borderRadius: 9999, background: "#e5eeff", color: "#45464d", fontSize: 11, fontWeight: 500 }}>{f}</span>
                    ))}
                  </div>
                </div>
              </Link>
            )) : (
              // Skeleton loading
              [1, 2, 3, 4].map(i => (
                <div key={i} style={{ ...s.card, height: 280, background: "linear-gradient(90deg, #e5eeff 25%, #f0f4ff 50%, #e5eeff 75%)", animation: "pulse 1.5s ease infinite" }} />
              ))
            )}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/mahasiswa/cari" style={{ ...s.btnSecondary, padding: "13px 32px", fontSize: 15, display: "inline-block" }}>Lihat Semua Kost →</Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={s.sectionBlue}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }} id="tentang">
          <h2 style={s.sectionTitle}>Fitur Unggulan GeoKost</h2>
          <p style={s.sectionSub}>Teknologi terkini untuk pengalaman mencari kost yang lebih cerdas dan efisien.</p>
          <div style={s.grid3}>
            {FEATURES.map((f) => (
              <div key={f.title} style={s.featCard}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(15,23,42,.12)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(15,23,42,.06)"; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.color}14`, border: `1.5px solid ${f.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 16, color: "#131b2e", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#45464d", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ ...s.sectionWhite }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={s.sectionTitle}>Cara Kerja GeoKost</h2>
          <p style={s.sectionSub}>Dari preferensi ke rekomendasi personal dalam hitungan detik.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STEPS.map((step, i) => (
              <div key={step.n} style={{ display: "flex", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: i % 2 === 0 ? "#131b2e" : "#006e2f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{step.n}</div>
                  {i < STEPS.length - 1 && <div style={{ width: 2, flex: 1, background: "#e5eeff", margin: "8px 0", minHeight: 40 }} />}
                </div>
                <div style={{ paddingBottom: 36, paddingTop: 8 }}>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 16, color: "#131b2e", marginBottom: 6 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "#45464d", lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#131b2e", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "2rem", color: "#fff", marginBottom: 16 }}>
            Siap Menemukan Kost Idealmu?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.65)", marginBottom: 40 }}>
            Bergabunglah dengan ribuan mahasiswa yang sudah menemukan kost terbaik bersama GeoKost.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/mahasiswa/cari" style={{ padding: "14px 32px", borderRadius: 9999, background: "#4ae176", color: "#131b2e", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 6px 20px rgba(74,225,118,.35)" }}>
              🔍 Mulai Cari Kost Sekarang
            </Link>
            <Link href="/mitra/dashboard" style={{ padding: "14px 32px", borderRadius: 9999, border: "1.5px solid rgba(255,255,255,.3)", background: "transparent", color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
              Daftar Sebagai Mitra
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#f8f9ff", padding: "56px 24px 28px", borderTop: "1px solid #e5eeff" }} id="kontak">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 22 }}>🗺️</span>
                <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 18, color: "#131b2e" }}>GeoKost</span>
              </div>
              <p style={{ fontSize: 13, color: "#45464d", lineHeight: 1.7, maxWidth: 260 }}>Platform WebGIS cerdas untuk rekomendasi hunian mahasiswa berbasis AI & peta interaktif.</p>
              <p style={{ fontSize: 12, color: "#76777d", marginTop: 16 }}>© 2024 GeoKost. Crafted for smarter student living.</p>
            </div>
            {[
              { title: "Navigasi", links: [["Cari Kost", "/mahasiswa/cari"], ["Rekomendasi", "/mahasiswa/peta"]] },
              { title: "Perusahaan", links: [["Tentang Kami", "/tentang"], ["Kontak", "/kontak"]] },
              { title: "Legal", links: [["Kebijakan Privasi", "/kebijakan-privasi"], ["Syarat & Ketentuan", "/syarat-ketentuan"]] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 14, color: "#131b2e", marginBottom: 16 }}>{title}</h4>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {links.map(([label, href]) => (
                    <li key={label}><Link href={href} style={{ fontSize: 13, color: "#45464d", textDecoration: "none" }}>{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}

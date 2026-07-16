import Link from "next/link";

const SECTIONS = [
  { title: "1. Informasi yang Kami Kumpulkan", content: "Kami mengumpulkan informasi yang Anda berikan saat mendaftar (nama, email, nomor telepon), informasi penggunaan platform (riwayat pencarian, kost yang dikunjungi, preferensi filter), serta data lokasi (hanya jika Anda mengizinkan) untuk menyempurnakan rekomendasi berbasis GIS." },
  { title: "2. Cara Kami Menggunakan Informasi", content: "Data Anda digunakan untuk: (a) Memberikan rekomendasi kost yang personal melalui algoritma C4.5, (b) Menampilkan hasil pencarian berdasarkan lokasi Anda, (c) Menghubungkan Anda dengan pemilik kost yang relevan, (d) Meningkatkan performa dan kualitas layanan GeoKost." },
  { title: "3. Keamanan Data", content: "Semua data ditransfer menggunakan enkripsi SSL/TLS 256-bit. Password disimpan dalam bentuk hash menggunakan algoritma bcrypt. Kami menerapkan sistem autentikasi JWT dan tidak menyimpan informasi kartu kredit di server kami." },
  { title: "4. Berbagi Data", content: "Kami tidak menjual, menyewakan, atau menukar data pribadi Anda kepada pihak ketiga untuk tujuan komersial. Data hanya dibagikan kepada pemilik kost (nama & kontak) apabila Anda melakukan proses booking, dan kepada penyedia layanan teknis yang mendukung operasional GeoKost (hosting, analitik)." },
  { title: "5. Hak Pengguna", content: "Anda berhak untuk: mengakses data yang kami simpan tentang Anda, meminta koreksi data yang tidak akurat, meminta penghapusan akun dan data Anda, menarik persetujuan penggunaan data kapan saja. Untuk menggunakan hak Anda, hubungi kami di privasi@geokost.id." },
  { title: "6. Cookie & Teknologi Pelacakan", content: "GeoKost menggunakan cookie esensial untuk menjaga sesi login dan preferensi pengguna. Kami juga menggunakan cookie analitik (anonim) untuk memahami pola penggunaan platform. Anda dapat menonaktifkan cookie melalui pengaturan browser, namun beberapa fitur mungkin tidak berfungsi optimal." },
  { title: "7. Retensi Data", content: "Data akun aktif disimpan selama akun Anda masih ada. Setelah penghapusan akun, data pribadi akan dihapus dalam 30 hari, kecuali data yang diwajibkan oleh hukum untuk disimpan lebih lama (misalnya catatan transaksi keuangan)." },
  { title: "8. Perubahan Kebijakan", content: "Kami dapat memperbarui kebijakan privasi ini sewaktu-waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi di platform. Penggunaan layanan setelah pemberitahuan dianggap sebagai persetujuan terhadap kebijakan yang diperbarui." },
];

export default function KebijakanPrivasiPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e5eeff", position: "sticky" as const, top: 0, zIndex: 50, boxShadow: "0 1px 8px rgba(15,23,42,.05)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span>🗺️</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 17, color: "#131b2e" }}>GeoKost</span>
          </Link>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/tentang" style={{ fontSize: 13, color: "#45464d", textDecoration: "none" }}>Tentang</Link>
            <Link href="/kontak" style={{ fontSize: 13, color: "#45464d", textDecoration: "none" }}>Kontak</Link>
            <Link href="/syarat-ketentuan" style={{ fontSize: 13, color: "#45464d", textDecoration: "none" }}>Syarat & Ketentuan</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 9999, background: "rgba(0,110,47,.08)", color: "#006e2f", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>🔒 Legal</div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "2rem", color: "#131b2e", marginBottom: 10 }}>Kebijakan Privasi</h1>
          <p style={{ fontSize: 14, color: "#76777d" }}>Terakhir diperbarui: 1 Januari 2024 · Berlaku untuk seluruh pengguna platform GeoKost.</p>
        </div>

        <div style={{ background: "rgba(0,110,47,.06)", border: "1px solid rgba(0,110,47,.15)", borderRadius: 14, padding: "16px 20px", marginBottom: 36, fontSize: 14, color: "#006e2f", lineHeight: 1.7 }}>
          <strong>Ringkasan:</strong> GeoKost berkomitmen melindungi privasi Anda. Kami hanya mengumpulkan data yang diperlukan untuk memberikan layanan, tidak menjualnya, dan memberikan Anda kontrol penuh atas informasi pribadi Anda.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {SECTIONS.map((sec, i) => (
            <div key={i} style={{ borderBottom: "1px solid #e5eeff", padding: "28px 0" }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#131b2e", marginBottom: 12 }}>{sec.title}</h2>
              <p style={{ fontSize: 14, color: "#45464d", lineHeight: 1.85 }}>{sec.content}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, background: "#fff", borderRadius: 16, border: "1px solid #e5eeff", padding: "24px 28px", boxShadow: "0 4px 20px rgba(15,23,42,.05)" }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#131b2e", marginBottom: 8 }}>Ada Pertanyaan tentang Privasi Anda?</h3>
          <p style={{ fontSize: 14, color: "#45464d", marginBottom: 16 }}>Hubungi tim privasi kami di <a href="mailto:privasi@geokost.id" style={{ color: "#006e2f", fontWeight: 600 }}>privasi@geokost.id</a> atau melalui halaman kontak.</p>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/kontak" style={{ padding: "9px 20px", borderRadius: 9999, background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Hubungi Kami</Link>
            <Link href="/syarat-ketentuan" style={{ padding: "9px 20px", borderRadius: 9999, border: "1.5px solid #c6c6cd", background: "transparent", color: "#131b2e", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>Syarat & Ketentuan</Link>
          </div>
        </div>
      </main>

      <footer style={{ background: "#fff", borderTop: "1px solid #e5eeff", padding: "24px", textAlign: "center" as const }}>
        <p style={{ fontSize: 13, color: "#76777d" }}>© 2024 GeoKost · <Link href="/" style={{ color: "#45464d", textDecoration: "none" }}>Beranda</Link> · <Link href="/syarat-ketentuan" style={{ color: "#45464d", textDecoration: "none" }}>Syarat & Ketentuan</Link></p>
      </footer>
    </div>
  );
}

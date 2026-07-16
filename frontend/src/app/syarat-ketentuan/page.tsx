import Link from "next/link";

const SECTIONS = [
  { title: "1. Penerimaan Syarat", content: "Dengan mengakses atau menggunakan platform GeoKost (situs web dan aplikasi terkait), Anda menyatakan telah membaca, memahami, dan menyetujui Syarat & Ketentuan ini. Jika Anda tidak menyetujui syarat ini, harap tidak menggunakan layanan kami." },
  { title: "2. Definisi", content: 'Dalam dokumen ini: "GeoKost" merujuk pada platform dan tim yang mengelolanya; "Pengguna" adalah siapa pun yang mengakses platform; "Mahasiswa" adalah pengguna yang mencari kost; "Mitra" adalah pemilik/pengelola kost yang mendaftarkan properti; "Layanan" mencakup semua fitur yang tersedia di platform GeoKost.' },
  { title: "3. Pendaftaran Akun", content: "Anda harus berusia minimal 17 tahun untuk mendaftar. Informasi yang Anda berikan harus akurat dan terkini. Anda bertanggung jawab menjaga kerahasiaan password akun. GeoKost berhak menangguhkan akun yang melanggar ketentuan atau memberikan informasi palsu." },
  { title: "4. Penggunaan yang Diperbolehkan", content: "Platform GeoKost hanya boleh digunakan untuk tujuan yang sah, yaitu: mencari dan membandingkan kost, mengelola listing properti (untuk Mitra), dan berkomunikasi dengan pihak terkait dalam konteks sewa-menyewa kost." },
  { title: "5. Larangan Penggunaan", content: "Pengguna dilarang: menyebarkan informasi palsu atau menyesatkan tentang properti, menggunakan platform untuk penipuan atau aktivitas ilegal, melakukan scraping data secara massal tanpa izin tertulis, mengunggah konten yang melanggar hak cipta atau bersifat SARA, serta mencoba meretas atau mengganggu sistem GeoKost." },
  { title: "6. Tanggung Jawab Mitra", content: "Mitra (pemilik kost) bertanggung jawab penuh atas: keakuratan informasi properti yang dicantumkan, legalitas kepemilikan atau pengelolaan properti, kondisi fisik kost yang sesuai dengan deskripsi di platform, dan penanganan transaksi serta perselisihan dengan penyewa secara langsung." },
  { title: "7. Pembayaran dan Booking", content: "GeoKost memfasilitasi proses booking dengan biaya administrasi sebesar Rp 50.000 per transaksi. Pembayaran diproses melalui mitra payment gateway yang aman. Refund dapat dilakukan sesuai kebijakan pembatalan yang berlaku (dalam 24 jam sebelum tanggal masuk). GeoKost tidak bertanggung jawab atas perselisihan antara Mahasiswa dan Mitra setelah transaksi selesai." },
  { title: "8. Kekayaan Intelektual", content: "Seluruh konten di platform GeoKost (logo, desain, kode, algoritma C4.5 yang dikembangkan tim) adalah milik GeoKost dan dilindungi undang-undang hak cipta. Pengguna tidak boleh menyalin, mendistribusikan, atau memodifikasi konten platform tanpa izin tertulis." },
  { title: "9. Penafian Layanan", content: 'GeoKost disediakan "sebagaimana adanya". Kami tidak menjamin ketersediaan layanan 100%, akurasi data kost yang diunggah Mitra, atau hasil spesifik dari rekomendasi AI. Kami tidak bertanggung jawab atas kerugian yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan.' },
  { title: "10. Perubahan Syarat", content: "GeoKost berhak mengubah Syarat & Ketentuan ini kapan saja. Perubahan akan diumumkan melalui email atau notifikasi platform. Penggunaan layanan setelah perubahan berlaku merupakan penerimaan terhadap syarat yang baru." },
];

export default function SyaratKetentuanPage() {
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
            <Link href="/kebijakan-privasi" style={{ fontSize: 13, color: "#45464d", textDecoration: "none" }}>Kebijakan Privasi</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 9999, background: "rgba(19,27,46,.06)", color: "#131b2e", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>📄 Legal</div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "2rem", color: "#131b2e", marginBottom: 10 }}>Syarat & Ketentuan</h1>
          <p style={{ fontSize: 14, color: "#76777d" }}>Terakhir diperbarui: 1 Januari 2024 · Harap baca dengan seksama sebelum menggunakan GeoKost.</p>
        </div>

        <div style={{ background: "#eff4ff", border: "1px solid #c6d6ff", borderRadius: 14, padding: "16px 20px", marginBottom: 36, fontSize: 14, color: "#131b2e", lineHeight: 1.7 }}>
          <strong>Penting:</strong> Dengan mendaftar dan menggunakan GeoKost, Anda dianggap telah membaca dan menyetujui seluruh Syarat & Ketentuan berikut. Jika tidak setuju, harap hentikan penggunaan platform.
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
          <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#131b2e", marginBottom: 8 }}>Pertanyaan tentang Syarat & Ketentuan?</h3>
          <p style={{ fontSize: 14, color: "#45464d", marginBottom: 16 }}>Hubungi tim legal kami di <a href="mailto:legal@geokost.id" style={{ color: "#006e2f", fontWeight: 600 }}>legal@geokost.id</a>.</p>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/kontak" style={{ padding: "9px 20px", borderRadius: 9999, background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Hubungi Kami</Link>
            <Link href="/kebijakan-privasi" style={{ padding: "9px 20px", borderRadius: 9999, border: "1.5px solid #c6c6cd", background: "transparent", color: "#131b2e", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>Kebijakan Privasi</Link>
          </div>
        </div>
      </main>

      <footer style={{ background: "#fff", borderTop: "1px solid #e5eeff", padding: "24px", textAlign: "center" as const }}>
        <p style={{ fontSize: 13, color: "#76777d" }}>© 2024 GeoKost · <Link href="/" style={{ color: "#45464d", textDecoration: "none" }}>Beranda</Link> · <Link href="/kebijakan-privasi" style={{ color: "#45464d", textDecoration: "none" }}>Kebijakan Privasi</Link></p>
      </footer>
    </div>
  );
}

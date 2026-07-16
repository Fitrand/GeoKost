import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", background: "#f8f9ff",
      fontFamily: "'Inter',system-ui,sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "24px",
    }}>
      {/* Decorative */}
      <div style={{ position: "relative" as const, marginBottom: 36 }}>
        <div style={{ fontSize: "7rem", lineHeight: 1, userSelect: "none" as const }}>🗺️</div>
        <div style={{
          position: "absolute" as const, top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 160, height: 160, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(19,27,46,.06) 0%, transparent 70%)",
          zIndex: -1,
        }} />
      </div>

      <h1 style={{
        fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800,
        fontSize: "clamp(3rem,8vw,6rem)", color: "#131b2e", lineHeight: 1,
        marginBottom: 12, letterSpacing: "-0.04em",
      }}>404</h1>

      <h2 style={{
        fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
        fontSize: "1.3rem", color: "#131b2e", marginBottom: 12,
      }}>
        Halaman Tidak Ditemukan
      </h2>

      <p style={{ fontSize: 15, color: "#45464d", lineHeight: 1.7, maxWidth: 420, marginBottom: 40 }}>
        Sepertinya Anda tersesat di peta. Halaman yang Anda cari tidak ada atau sudah dipindahkan.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, justifyContent: "center" }}>
        <Link href="/" style={{
          padding: "13px 28px", borderRadius: 9999, background: "#131b2e", color: "#fff",
          fontWeight: 700, fontSize: 14, textDecoration: "none",
          boxShadow: "0 4px 14px rgba(19,27,46,.25)",
        }}>
          🏠 Kembali ke Beranda
        </Link>
        <Link href="/mahasiswa/cari" style={{
          padding: "13px 28px", borderRadius: 9999,
          border: "1.5px solid #c6c6cd", background: "transparent",
          color: "#131b2e", fontWeight: 600, fontSize: 14, textDecoration: "none",
        }}>
          🔍 Cari Kost
        </Link>
      </div>
    </div>
  );
}

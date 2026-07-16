"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const NAV = [
  { href: "/mahasiswa/profil",  label: "Profil Saya",    icon: "👤" },
  { href: "/mahasiswa/favorit", label: "Favorit",         icon: "♥" },
  { href: "/mahasiswa/booking", label: "Riwayat Booking", icon: "📋" },
  { href: "/mahasiswa/cari",    label: "Cari Kost",       icon: "🔍" },
];

interface ProfileForm {
  nama:       string;
  email:      string;
  no_telepon: string;
  kampus:     string;
  prodi:      string;
  angkatan:   string;
}

interface PwForm {
  password_lama: string;
  password_baru: string;
  konfirmasi:    string;
}

export default function ProfilPage() {
  const { token, user, setUser, logout } = useAuthStore();
  const router = useRouter();

  const [form, setForm]         = useState<ProfileForm>({ nama: "", email: "", no_telepon: "", kampus: "", prodi: "", angkatan: "" });
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [pwForm, setPwForm]     = useState<PwForm>({ password_lama: "", password_baru: "", konfirmasi: "" });
  const [savingPw, setSavingPw] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load profil dari API saat mount
  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setForm({
          nama:       data.nama       || "",
          email:      data.email      || "",
          no_telepon: data.no_telepon || "",
          kampus:     data.kampus     || "",
          prodi:      data.prodi      || "",
          angkatan:   data.angkatan   || "",
        });
      })
      .catch(() => showToast("Gagal memuat profil", "error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ nama: form.nama, no_telepon: form.no_telepon, kampus: form.kampus, prodi: form.prodi, angkatan: form.angkatan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal menyimpan");
      setUser({ nama: data.nama, no_telepon: data.no_telepon, kampus: data.kampus, prodi: data.prodi, angkatan: data.angkatan });
      setEditing(false);
      showToast("Profil berhasil disimpan! ✅");
    } catch (e: any) {
      showToast(e.message || "Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.password_baru !== pwForm.konfirmasi) return showToast("Konfirmasi password tidak cocok", "error");
    if (pwForm.password_baru.length < 6) return showToast("Password baru minimal 6 karakter", "error");
    setSavingPw(true);
    try {
      const res = await fetch(`${API}/api/auth/change-password`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ password_lama: pwForm.password_lama, password_baru: pwForm.password_baru }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal ganti password");
      showToast("Password berhasil diubah! ✅");
      setPwForm({ password_lama: "", password_baru: "", konfirmasi: "" });
    } catch (e: any) {
      showToast(e.message || "Gagal ganti password", "error");
    } finally {
      setSavingPw(false);
    }
  };

  const field = (label: string, key: keyof ProfileForm, type = "text") => (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#45464d", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{label}</label>
      <input
        type={type} value={form[key]} disabled={!editing || key === "email"}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${editing && key !== "email" ? "#131b2e" : "#c6c6cd"}`, background: editing && key !== "email" ? "#fff" : "#f8f9ff", fontSize: "0.9rem", fontFamily: "inherit", color: "#0b1c30", outline: "none", transition: "border .15s", boxSizing: "border-box" as const, opacity: key === "email" ? 0.7 : 1 }}
      />
    </div>
  );

  const pwField = (label: string, key: keyof PwForm) => (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#45464d", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{label}</label>
      <input
        type="password" value={pwForm[key]}
        onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #c6c6cd", background: "#fff", fontSize: "0.9rem", fontFamily: "inherit", color: "#0b1c30", outline: "none", transition: "border .15s", boxSizing: "border-box" as const }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#131b2e")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#c6c6cd")}
      />
    </div>
  );

  const initials = form.nama ? form.nama.charAt(0).toUpperCase() : "M";

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff", fontFamily: "'Inter',system-ui,sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed" as const, top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 12, fontWeight: 600, fontSize: 13, background: toast.type === "success" ? "#006e2f" : "#dc2626", color: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
          {toast.msg}
        </div>
      )}

      {/* Navbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e5eeff", position: "sticky" as const, top: 0, zIndex: 50, boxShadow: "0 1px 8px rgba(15,23,42,.05)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span style={{ fontSize: 22 }}>🗺️</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 18, color: "#131b2e" }}>GeoKost</span>
          </Link>
          <nav style={{ display: "flex", gap: 20 }}>
            {NAV.map((n) => <Link key={n.href} href={n.href} style={{ fontSize: 13, color: "#45464d", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>{n.icon} {n.label}</Link>)}
          </nav>
          <button onClick={() => { logout(); router.push("/login"); }} style={{ fontSize: 13, color: "#131b2e", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "280px 1fr", gap: 28 }}>
        {/* Sidebar */}
        <aside>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", boxShadow: "0 4px 20px rgba(15,23,42,.06)", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ background: "linear-gradient(135deg, #131b2e, #1e2d47)", padding: "28px 20px 20px", textAlign: "center" as const }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#006e2f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1.8rem", margin: "0 auto 12px" }}>{initials}</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 4 }}>{form.nama || "—"}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>{form.email}</div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ background: "rgba(0,110,47,.08)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🎓</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#006e2f" }}>{form.kampus || "Kampus belum diisi"}</div>
                  <div style={{ fontSize: 11, color: "#45464d" }}>{form.prodi || "Prodi"} {form.angkatan ? `· ${form.angkatan}` : ""}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", boxShadow: "0 4px 20px rgba(15,23,42,.06)", padding: 12 }}>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textDecoration: "none", color: "#45464d", fontSize: 14, fontWeight: 500, transition: "background .15s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#f8f9ff")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
              >
                <span style={{ fontSize: 16 }}>{n.icon}</span> {n.label}
              </Link>
            ))}
          </div>
        </aside>

        {/* Main form */}
        <div>
          {/* Profil Card */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", boxShadow: "0 4px 20px rgba(15,23,42,.06)", padding: 28, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#131b2e", marginBottom: 4 }}>Informasi Pribadi</h1>
                <p style={{ fontSize: 13, color: "#76777d" }}>Kelola data diri dan informasi akademik Anda.</p>
              </div>
              {!editing
                ? <button onClick={() => setEditing(true)} style={{ padding: "9px 20px", borderRadius: 9999, border: "1.5px solid #131b2e", background: "transparent", color: "#131b2e", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>✏️ Edit Profil</button>
                : <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setEditing(false)} style={{ padding: "9px 18px", borderRadius: 9999, border: "1.5px solid #c6c6cd", background: "transparent", color: "#45464d", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Batal</button>
                    <button onClick={handleSave} disabled={saving} style={{ padding: "9px 18px", borderRadius: 9999, border: "none", background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
              }
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {field("Nama Lengkap", "nama")}
              {field("Email (tidak bisa diubah)", "email", "email")}
              {field("No. Telepon / WhatsApp", "no_telepon", "tel")}
              {field("Nama Kampus", "kampus")}
              {field("Program Studi", "prodi")}
              {field("Angkatan", "angkatan")}
            </div>
          </div>

          {/* Change password card */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", boxShadow: "0 4px 20px rgba(15,23,42,.06)", padding: 28 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#131b2e", marginBottom: 6 }}>Keamanan Akun</h2>
            <p style={{ fontSize: 13, color: "#76777d", marginBottom: 20 }}>Ganti password Anda secara berkala untuk menjaga keamanan akun.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {pwField("Password Lama", "password_lama")}
              {pwField("Password Baru", "password_baru")}
              {pwField("Konfirmasi Password Baru", "konfirmasi")}
            </div>
            <button
              onClick={handleChangePassword}
              disabled={savingPw || !pwForm.password_lama || !pwForm.password_baru}
              style={{ marginTop: 20, padding: "10px 24px", borderRadius: 9999, border: "none", background: pwForm.password_lama && pwForm.password_baru ? "#131b2e" : "#c6c6cd", color: "#fff", fontWeight: 700, fontSize: 13, cursor: pwForm.password_lama && pwForm.password_baru ? "pointer" : "not-allowed" }}
            >
              {savingPw ? "Menyimpan..." : "🔒 Ganti Password"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

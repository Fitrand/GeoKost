"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("mahasiswa"); // mahasiswa atau mitra
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal mendaftar");

      // Auto login after register
      const loginRes = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      
      if (loginRes.ok) {
        setAuth(loginData.access_token, loginData.user);
        if (role === "mitra") {
          router.push("/mitra/dashboard");
        } else {
          router.push("/");
        }
      } else {
        router.push("/login"); // fallback
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--color-bg)", padding: 20
    }}>
      <div style={{
        background: "var(--color-surface)", padding: "40px", borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-float)", width: "100%", maxWidth: 450
      }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--color-primary)", marginBottom: 8 }}>
            Buat Akun Baru
          </h1>
          <p style={{ color: "var(--color-muted)", fontSize: 14 }}>Bergabunglah dengan platform pencarian kost tercerdas.</p>
        </div>

        {error && (
          <div style={{ background: "var(--color-error-bg)", color: "var(--color-error)", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 13, textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--color-on-surface-variant)" }}>Nama Lengkap</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              placeholder="Fulan bin Fulan"
              style={{
                width: "100%", padding: "12px 14px", borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-outline)", outline: "none", fontSize: 14
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--color-on-surface-variant)" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nama@email.com"
              style={{
                width: "100%", padding: "12px 14px", borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-outline)", outline: "none", fontSize: 14
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--color-on-surface-variant)" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimal 6 karakter"
              style={{
                width: "100%", padding: "12px 14px", borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-outline)", outline: "none", fontSize: 14
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--color-on-surface-variant)" }}>Saya mendaftar sebagai:</label>
            <div style={{ display: "flex", gap: 12 }}>
              <label style={{ flex: 1, padding: "12px", border: `1.5px solid ${role === "mahasiswa" ? "var(--color-primary)" : "var(--color-outline)"}`, borderRadius: "var(--radius-md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: role === "mahasiswa" ? "var(--color-surface-low)" : "transparent" }}>
                <input type="radio" value="mahasiswa" checked={role === "mahasiswa"} onChange={(e) => setRole(e.target.value)} style={{ accentColor: "var(--color-primary)" }} />
                <span style={{ fontSize: 14, fontWeight: role === "mahasiswa" ? 600 : 400 }}>Pencari Kost</span>
              </label>
              <label style={{ flex: 1, padding: "12px", border: `1.5px solid ${role === "mitra" ? "var(--color-primary)" : "var(--color-outline)"}`, borderRadius: "var(--radius-md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: role === "mitra" ? "var(--color-surface-low)" : "transparent" }}>
                <input type="radio" value="mitra" checked={role === "mitra"} onChange={(e) => setRole(e.target.value)} style={{ accentColor: "var(--color-primary)" }} />
                <span style={{ fontSize: 14, fontWeight: role === "mitra" ? 600 : 400 }}>Pemilik Kost</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 10,
              width: "100%", padding: 14, borderRadius: "var(--radius-full)",
              background: "var(--color-primary)", color: "#fff",
              border: "none", fontWeight: 600, fontSize: 15, cursor: loading ? "wait" : "pointer"
            }}
          >
            {loading ? "Memproses..." : "Daftar Sekarang"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--color-on-surface-variant)" }}>
          Sudah punya akun?{" "}
          <Link href="/login" style={{ color: "var(--color-secondary)", fontWeight: 700, textDecoration: "none" }}>
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

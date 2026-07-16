"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal login");

      setAuth(data.access_token, data.user);
      
      // Redirect based on role
      if (data.user.role === "mitra") {
        router.push("/mitra/dashboard");
      } else {
        router.push("/");
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
        boxShadow: "var(--shadow-float)", width: "100%", maxWidth: 400
      }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--color-primary)", marginBottom: 8 }}>
            Selamat Datang di GeoKost
          </h1>
          <p style={{ color: "var(--color-muted)", fontSize: 14 }}>Masuk untuk mengelola kost atau mencari rekomendasi.</p>
        </div>

        {error && (
          <div style={{ background: "var(--color-error-bg)", color: "var(--color-error)", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 13, textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
              placeholder="••••••••"
              style={{
                width: "100%", padding: "12px 14px", borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-outline)", outline: "none", fontSize: 14
              }}
            />
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
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--color-on-surface-variant)" }}>
          Belum punya akun?{" "}
          <Link href="/register" style={{ color: "var(--color-secondary)", fontWeight: 700, textDecoration: "none" }}>
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

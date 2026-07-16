"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  // Reset password form state
  const [passwordBaru, setPasswordBaru] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal mengirim email");
      setSent(true);
      // Tampilkan link di mode dev
      if (data.reset_link) setDevLink(data.reset_link);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordBaru !== confirmPassword) {
      setResetError("Password dan konfirmasi tidak cocok");
      return;
    }
    if (passwordBaru.length < 6) {
      setResetError("Password minimal 6 karakter");
      return;
    }
    setResetLoading(true);
    setResetError(null);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenFromUrl, password_baru: passwordBaru }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal reset password");
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  // Jika ada token di URL → tampilkan form reset password
  if (tokenFromUrl) {
    return (
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", boxShadow: "0 8px 30px rgba(15,23,42,.08)", padding: "36px 32px" }}>
        {resetSuccess ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#131b2e", marginBottom: 10 }}>Password Berhasil Direset!</h2>
            <p style={{ fontSize: 14, color: "#45464d", lineHeight: 1.7, marginBottom: 24 }}>Silakan login menggunakan password baru Anda.</p>
            <Link href="/login" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 9999, background: "#131b2e", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              Login Sekarang →
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#131b2e", marginBottom: 8 }}>Reset Password</h1>
              <p style={{ fontSize: 14, color: "#45464d", lineHeight: 1.6 }}>Masukkan password baru Anda di bawah ini.</p>
            </div>
            {resetError && (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(186,26,26,0.08)", border: "1px solid rgba(186,26,26,0.2)", color: "#ba1a1a", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                ⚠️ {resetError}
              </div>
            )}
            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#45464d", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Password Baru</label>
                <input type="password" required value={passwordBaru} onChange={e => setPasswordBaru(e.target.value)} placeholder="Minimal 6 karakter"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #c6c6cd", fontSize: "0.9rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#131b2e")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#c6c6cd")} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#45464d", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Konfirmasi Password</label>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #c6c6cd", fontSize: "0.9rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#131b2e")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#c6c6cd")} />
              </div>
              <button type="submit" disabled={resetLoading} style={{ width: "100%", padding: 13, borderRadius: 10, border: "none", background: resetLoading ? "#94a3b8" : "#131b2e", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: "0.95rem", cursor: resetLoading ? "not-allowed" : "pointer" }}>
                {resetLoading ? "Memproses..." : "Simpan Password Baru →"}
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  // Default: form forgot password (request token)
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5eeff", boxShadow: "0 8px 30px rgba(15,23,42,.08)", padding: "36px 32px" }}>
      {!sent ? (
        <>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#131b2e", marginBottom: 8 }}>Lupa Password?</h1>
            <p style={{ fontSize: 14, color: "#45464d", lineHeight: 1.6 }}>Masukkan email Anda dan kami akan mengirimkan link untuk reset password.</p>
          </div>
          {error && (
            <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(186,26,26,0.08)", border: "1px solid rgba(186,26,26,0.2)", color: "#ba1a1a", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#45464d", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Email Address</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: "1.5px solid #c6c6cd", background: "#fff", transition: "border .15s" }}
                onFocusCapture={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "#131b2e")}
                onBlurCapture={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "#c6c6cd")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#76777d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <input type="email" required placeholder="student@university.edu" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.9rem", fontFamily: "inherit", color: "#0b1c30" }} />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", padding: 13, borderRadius: 10, border: "none", background: loading ? "#94a3b8" : "#131b2e", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(19,27,46,.25)" }}>
              {loading ? "Mengirim..." : "Kirim Link Reset →"}
            </button>
          </form>
        </>
      ) : (
        <div style={{ textAlign: "center" as const }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>📧</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#131b2e", marginBottom: 10 }}>Permintaan Terkirim!</h2>
          <p style={{ fontSize: 14, color: "#45464d", lineHeight: 1.7, marginBottom: 16 }}>
            Jika <strong>{email}</strong> terdaftar di sistem, instruksi reset password akan dikirimkan.
          </p>
          {devLink && (
            <div style={{ background: "rgba(19,27,46,0.05)", border: "1px dashed #94a3b8", borderRadius: 10, padding: "12px 16px", fontSize: 12, color: "#475569", marginBottom: 16, textAlign: "left" as const }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: "#131b2e" }}>🛠️ Mode Development — Link Reset:</div>
              <a href={devLink} style={{ wordBreak: "break-all" as const, color: "#006e2f", textDecoration: "underline" }}>{devLink}</a>
            </div>
          )}
          <div style={{ background: "rgba(0,110,47,.06)", border: "1px solid rgba(0,110,47,.15)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#006e2f", marginBottom: 24 }}>
            Link berlaku selama <strong>15 menit</strong>.
          </div>
          <button onClick={() => { setSent(false); setDevLink(null); }}
            style={{ fontSize: 13, color: "#45464d", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            Kirim ulang ke email lain
          </button>
        </div>
      )}
      <p style={{ textAlign: "center" as const, marginTop: 24, fontSize: 14, color: "#45464d" }}>
        Ingat password?{" "}
        <Link href="/login" style={{ color: "#006e2f", fontWeight: 700, textDecoration: "none" }}>Kembali Login</Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',system-ui,sans-serif", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 36 }}>
          <span style={{ fontSize: 22 }}>🗺️</span>
          <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 18, color: "#131b2e" }}>GeoKost</span>
        </Link>
        <Suspense fallback={<div style={{ background: "#fff", borderRadius: 20, padding: 40, textAlign: "center" }}>Memuat...</div>}>
          <ForgotPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}

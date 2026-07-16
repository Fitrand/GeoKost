"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: "mahasiswa" | "mitra";
}

/**
 * Wrapper component untuk melindungi halaman yang memerlukan login.
 * Redirect ke /login jika belum login, atau ke home jika role tidak sesuai.
 */
export default function RequireAuth({ children, redirectTo = "/login", requiredRole }: RequireAuthProps) {
  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token || !user) {
      router.replace(redirectTo);
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      // Jika mitra coba akses mahasiswa atau sebaliknya, redirect ke home
      router.replace(user.role === "mitra" ? "/mitra/dashboard" : "/mahasiswa/peta");
    }
  }, [token, user, router, redirectTo, requiredRole]);

  if (!token || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9ff" }}>
        <div style={{ textAlign: "center" as const }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔒</div>
          <p style={{ fontFamily: "'Inter',sans-serif", color: "#76777d" }}>Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

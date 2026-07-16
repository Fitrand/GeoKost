"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function ProtectedRoute({ children, requireRole }: { children: React.ReactNode, requireRole?: string }) {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!token || !user) {
      router.replace("/login");
    } else if (requireRole && user.role !== requireRole) {
      router.replace("/");
    }
  }, [token, user, requireRole, router]);

  if (!isMounted || !token || !user) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%" }}></div>
      </div>
    );
  }

  if (requireRole && user.role !== requireRole) {
    return null;
  }

  return <>{children}</>;
}

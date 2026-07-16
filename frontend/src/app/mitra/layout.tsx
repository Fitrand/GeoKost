import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function MitraLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireRole="mitra">
      {children}
    </ProtectedRoute>
  );
}

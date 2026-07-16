"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Map as MapIcon, Home, LogOut, RefreshCw, CheckCircle, Star, MessageSquare, LayoutDashboard, Plus, Trash2, Power, AlertTriangle, XCircle, Clock, Edit3, ClipboardList, Inbox, Calendar, FileText, MessageCircle } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { useMitraBookings, useMitraBookingAction } from "@/hooks/useKost";
import type { BookingItem } from "@/hooks/useKost";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const formatHarga = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

interface KostMitra {
  id: string; nama: string; harga_per_bulan: number; tipe_kamar: string;
  is_active: boolean; rating: number; jumlah_ulasan: number; alamat: string;
  fasilitas: string[]; created_at: string;
}
interface Stats {
  total_kost: number; kost_aktif: number; avg_rating: number;
  total_ulasan: number; total_potensi_pendapatan: number;
}

export default function MitraDashboardPage() {
  const { token, user, logout } = useAuthStore();
  const router = useRouter();
  const [kostList, setKostList] = useState<KostMitra[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"semua" | "aktif" | "nonaktif">("semua");
  const [bookingTab, setBookingTab] = useState<"semua" | "pending" | "approved">("semua");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const { data: bookingData, refetch: refetchBookings } = useMitraBookings(token);
  const { mutate: bookingAction, isPending: actionPending } = useMitraBookingAction(token);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [kostRes, statsRes] = await Promise.all([
        fetch(`${API}/api/mitra/kost`, { headers }),
        fetch(`${API}/api/mitra/stats`, { headers }),
      ]);
      const kostJson = await kostRes.json();
      const statsJson = await statsRes.json();
      setKostList(kostJson.data || []);
      setStats(statsJson);
    } catch { showToast("Gagal memuat data. Pastikan backend menyala.", "error"); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus kost "${nama}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeletingId(id);
    try {
      await fetch(`${API}/api/mitra/kost/${id}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(`Kost "${nama}" berhasil dihapus.`);
      fetchData();
    } catch { showToast("Gagal menghapus kost.", "error"); }
    finally { setDeletingId(null); }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    setTogglingId(id);
    try {
      await fetch(`${API}/api/mitra/kost/${id}/toggle-status`, { 
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(`Kost berhasil di${currentActive ? "non" : ""}aktifkan.`);
      fetchData();
    } catch { showToast("Gagal mengubah status.", "error"); }
    finally { setTogglingId(null); }
  };

  const filtered = kostList.filter(k =>
    activeTab === "semua" ? true : activeTab === "aktif" ? k.is_active : !k.is_active
  );

  const bookingList = bookingData?.data || [];
  const filteredBookings = bookingList.filter(b => {
    if (bookingTab === "semua") return ["pending", "approved"].includes(b.status);
    return b.status === bookingTab;
  });
  const pendingCount = bookingList.filter(b => b.status === "pending").length;

  const handleBookingAction = (bookingId: string, action: "approve" | "reject" | "selesai") => {
    const labels = { approve: "menyetujui", reject: "menolak", selesai: "menyelesaikan" };
    if (!confirm(`Konfirmasi ${labels[action]} booking ini?`)) return;
    bookingAction(
      { bookingId, action },
      {
        onSuccess: () => { showToast(`Booking berhasil di-${action}`); refetchBookings(); },
        onError: (e: any) => showToast(e.message || "Gagal memperbarui booking", "error"),
      }
    );
  };

  const STATUS_BOOKING: Record<string, { bg: string; color: string; label: string }> = {
    pending:   { bg: "rgba(245,158,11,.1)",  color: "#d97706", label: "⏳ Menunggu" },
    approved:  { bg: "rgba(0,110,47,.1)",    color: "#006e2f", label: "✓ Disetujui" },
    rejected:  { bg: "rgba(186,26,26,.08)",  color: "#ba1a1a", label: "✕ Ditolak" },
    cancelled: { bg: "rgba(100,116,139,.1)", color: "#64748b", label: "○ Dibatalkan" },
    selesai:   { bg: "rgba(19,27,46,.08)",   color: "#131b2e", label: "✓ Selesai" },
  };

  const tabBtn = (label: string, val: typeof activeTab, count: number) => (
    <button onClick={() => setActiveTab(val)} style={{
      padding: "7px 16px", borderRadius: 9999, fontSize: 13, fontWeight: 600,
      border: "1.5px solid", cursor: "pointer", transition: "all 0.15s",
      borderColor: activeTab === val ? "var(--color-primary)" : "var(--color-outline)",
      background: activeTab === val ? "var(--color-primary)" : "transparent",
      color: activeTab === val ? "#fff" : "var(--color-on-surface-variant)",
    }}>
      {label} <span style={{ opacity: 0.75 }}>({count})</span>
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", fontFamily: "var(--font-body)" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 20px", borderRadius: 12, fontWeight: 600, fontSize: 13,
          background: toast.type === "success" ? "#006e2f" : "#dc2626", color: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "fadeIn 0.2s ease",
        }}>
          {toast.type === "success" ? "✅" : "⚠️"} {toast.msg}
        </div>
      )}

      {/* Sidebar + Content Layout */}
      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* Sidebar */}
        <aside style={{ width: 220, flexShrink: 0, background: "var(--color-surface)", borderRight: "1px solid var(--color-outline)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid var(--color-outline)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapIcon size={22} style={{ color: "var(--color-primary)" }} />
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--color-primary)" }}>Mitra GeoKost</div>
                <div style={{ fontSize: 10, color: "var(--color-muted)" }}>Property Owner Portal</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "14px" }}>
            <Link href="/mitra/tambah" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px", borderRadius: 10, textDecoration: "none",
              background: "var(--color-primary)", color: "#fff",
              fontWeight: 700, fontSize: 13, boxShadow: "0 4px 10px rgba(19,27,46,0.2)",
            }}>+ Tambah Kost Baru</Link>
          </div>
          <nav style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { href: "/mitra/dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard", badge: pendingCount },
              { href: "/mahasiswa/peta", icon: <MapIcon size={18} />, label: "Lihat Peta", badge: 0 },
              { href: "/", icon: <Home size={18} />, label: "Beranda", badge: 0 },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px", borderRadius: 10, textDecoration: "none",
                color: "var(--color-on-surface-variant)", fontSize: 14, fontWeight: 500,
                transition: "background 0.15s", position: "relative",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(19,27,46,0.06)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span>{item.icon}</span> {item.label}
                {item.badge > 0 && (
                  <span style={{
                    marginLeft: "auto",
                    minWidth: 20, height: 20, borderRadius: 9999,
                    background: "#dc2626", color: "#fff",
                    fontSize: 10, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 5px",
                    animation: "pulse 1.5s ease infinite",
                  }}>{item.badge}</span>
                )}
              </Link>
            ))}
          </nav>
          <div style={{ padding: "10px", borderTop: "1px solid var(--color-outline)" }}>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                borderRadius: 10, textDecoration: "none", color: "var(--color-error)",
                fontSize: 14, fontWeight: 500, transition: "background 0.15s",
                background: "transparent", border: "none", cursor: "pointer", width: "100%",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(186,26,26,0.06)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Topbar */}
          <div style={{ height: 60, padding: "0 28px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-outline)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "var(--color-primary)", margin: 0 }}>Dashboard Mitra</h1>
            <button onClick={fetchData} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid var(--color-outline)", background: "var(--color-surface)", fontSize: 12, cursor: "pointer", color: "var(--color-primary)", fontWeight: 600 }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div style={{ padding: 28 }}>
            {/* Welcome Banner */}
            <div style={{
              background: "linear-gradient(135deg, var(--color-primary) 0%, #1e2d47 100%)",
              borderRadius: 20, padding: "24px 28px", marginBottom: 24, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.3rem", color: "#fff", marginBottom: 6 }}>
                Selamat Datang, {user?.nama ?? "Mitra"}!
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 18 }}>Kelola seluruh properti kost Anda dari sini.</p>
              <Link href="/mitra/tambah" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "9px 18px", borderRadius: 9999, textDecoration: "none",
                background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff", fontWeight: 600, fontSize: 13,
              }}>+ Tambah/Edit Data Kost</Link>
            </div>

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { icon: <Home size={24} style={{ color: "var(--color-primary)" }} />, label: "Total Kost", value: stats?.total_kost ?? "—", sub: "Properti terdaftar" },
                { icon: <CheckCircle size={24} style={{ color: "#006e2f" }} />, label: "Kost Aktif", value: stats?.kost_aktif ?? "—", sub: "Sedang tampil di peta" },
                { icon: <Star size={24} style={{ color: "#f59e0b" }} />, label: "Rating Rata-rata", value: stats ? `${stats.avg_rating}/5.0` : "—", sub: "Dari semua ulasan" },
                { icon: <MessageSquare size={24} style={{ color: "#3b82f6" }} />, label: "Total Ulasan", value: stats?.total_ulasan ?? "—", sub: "Ulasan pengguna" },
              ].map(card => (
                <div key={card.label} style={{ background: "var(--color-surface)", borderRadius: 16, padding: "20px 20px", border: "1px solid var(--color-outline)", boxShadow: "var(--shadow-card)" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem", color: "var(--color-primary)", marginBottom: 4 }}>{loading ? "..." : card.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface-variant)", marginBottom: 2 }}>{card.label}</div>
                  <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Kost List */}
            <div style={{ background: "var(--color-surface)", borderRadius: 20, padding: 24, border: "1px solid var(--color-outline)", boxShadow: "var(--shadow-card)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--color-primary)", margin: 0 }}>
                  Daftar Properti Saya
                </h2>
                <div style={{ display: "flex", gap: 8 }}>
                  {tabBtn("Semua", "semua", kostList.length)}
                  {tabBtn("Aktif", "aktif", kostList.filter(k => k.is_active).length)}
                  {tabBtn("Nonaktif", "nonaktif", kostList.filter(k => !k.is_active).length)}
                </div>
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1, 2, 3].map(i => <div key={i} style={{ height: 80, borderRadius: 12, background: "var(--color-surface-container)", animation: "pulse 1.5s ease infinite" }} />)}
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ fontSize: "3rem", marginBottom: 12 }}>🏘️</div>
                  <p style={{ fontWeight: 600, color: "var(--color-on-surface-variant)", marginBottom: 8 }}>
                    {kostList.length === 0 ? "Belum ada kost terdaftar" : "Tidak ada kost di kategori ini"}
                  </p>
                  <Link href="/mitra/tambah" style={{ display: "inline-block", padding: "10px 24px", borderRadius: 10, background: "var(--color-primary)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
                    + Tambah Kost Pertama Anda
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {filtered.map(kost => (
                    <div key={kost.id} style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "16px 18px", borderRadius: 14,
                      border: "1px solid var(--color-outline)", background: "var(--color-bg)",
                      transition: "all 0.15s", opacity: kost.is_active ? 1 : 0.7,
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-low)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "var(--color-bg)")}
                    >
                      {/* Icon */}
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: kost.is_active ? "var(--color-primary)" : "var(--color-surface-container)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                        🏠
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <h3 style={{ fontWeight: 700, fontSize: 14, color: "var(--color-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{kost.nama}</h3>
                          <span style={{
                            padding: "2px 10px", borderRadius: 9999, fontSize: 10, fontWeight: 700, flexShrink: 0,
                            background: kost.is_active ? "rgba(0,110,47,0.1)" : "rgba(100,116,139,0.1)",
                            color: kost.is_active ? "#006e2f" : "#64748b",
                            border: `1px solid ${kost.is_active ? "rgba(0,110,47,0.25)" : "rgba(100,116,139,0.25)"}`,
                          }}>
                            {kost.is_active ? "✓ Aktif" : "○ Nonaktif"}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>
                          <span style={{ fontWeight: 700, color: "var(--color-secondary)" }}>{formatHarga(kost.harga_per_bulan)}</span>
                          <span style={{ color: "var(--color-muted)" }}>/bln</span>
                          {" · "}{kost.tipe_kamar}
                          {kost.rating > 0 && <span style={{ marginLeft: 8 }}>⭐ {kost.rating}</span>}
                          {kost.fasilitas.length > 0 && (
                            <span style={{ marginLeft: 8, color: "var(--color-muted)" }}>
                              {kost.fasilitas.slice(0, 3).join(", ")}{kost.fasilitas.length > 3 ? ` +${kost.fasilitas.length - 3}` : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button
                          onClick={() => handleToggle(kost.id, kost.is_active)}
                          disabled={togglingId === kost.id}
                          title={kost.is_active ? "Nonaktifkan" : "Aktifkan"}
                          style={{
                            padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                            border: "1.5px solid var(--color-outline)", background: "var(--color-surface)",
                            color: kost.is_active ? "#d97706" : "#006e2f",
                          }}
                        >
                          {togglingId === kost.id ? "..." : kost.is_active ? "⏸ Nonaktif" : "▶ Aktifkan"}
                        </button>
                        <Link href={`/mitra/edit/${kost.id}`} style={{
                          padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                          border: "1.5px solid var(--color-primary)", color: "var(--color-primary)",
                          textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
                        }}>
                          <Edit3 size={14} /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(kost.id, kost.nama)}
                          disabled={deletingId === kost.id}
                          style={{
                            padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                            border: "1.5px solid rgba(220,38,38,0.4)", background: "rgba(220,38,38,0.05)",
                            color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center"
                          }}
                        >
                          {deletingId === kost.id ? "..." : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Section Booking Masuk ── */}
            <div style={{ background: "var(--color-surface)", borderRadius: 20, padding: 24, border: "1px solid var(--color-outline)", boxShadow: "var(--shadow-card)", marginTop: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--color-primary)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <ClipboardList size={18} /> Booking Masuk
                  </h2>
                  {pendingCount > 0 && (
                    <span style={{ padding: "2px 10px", borderRadius: 9999, background: "rgba(245,158,11,.15)", color: "#d97706", fontSize: 11, fontWeight: 700 }}>
                      {pendingCount} Perlu Ditinjau
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["semua", "pending", "approved"] as const).map(tab => (
                    <button key={tab} onClick={() => setBookingTab(tab)} style={{
                      padding: "6px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      border: "1.5px solid", borderColor: bookingTab === tab ? "var(--color-primary)" : "var(--color-outline)",
                      background: bookingTab === tab ? "var(--color-primary)" : "transparent",
                      color: bookingTab === tab ? "#fff" : "var(--color-on-surface-variant)",
                      display: "flex", alignItems: "center", gap: 4
                    }}>
                      {tab === "semua" ? "Aktif" : tab === "pending" ? <><Clock size={12} /> Menunggu</> : <><CheckCircle size={12} /> Disetujui</>}
                    </button>
                  ))}
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "center" }}><Inbox size={48} style={{ marginBottom: 12, opacity: 0.5, color: "var(--color-muted)" }} /></div>
                  <p style={{ color: "var(--color-on-surface-variant)", fontSize: 14 }}>
                    {bookingList.length === 0 ? "Belum ada booking untuk kost Anda" : "Tidak ada booking di kategori ini"}
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {filteredBookings.map(b => {
                    const st = STATUS_BOOKING[b.status] || STATUS_BOOKING.cancelled;
                    return (
                      <div key={b.id} style={{ padding: "16px 18px", borderRadius: 14, border: "1px solid var(--color-outline)", background: "var(--color-bg)", display: "flex", gap: 16, alignItems: "flex-start" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                          {(b.user_nama || "?").charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-primary)" }}>{b.user_nama || "Mahasiswa"}</span>
                            <span style={{ padding: "2px 10px", borderRadius: 9999, background: st.bg, color: st.color, fontSize: 11, fontWeight: 700 }}>{st.label}</span>
                          </div>
                          <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                            <Home size={14} /> <strong>{b.kost_nama}</strong>
                          </p>
                          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "var(--color-muted)", alignItems: "center" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={14} /> Masuk: {new Date(b.tanggal_masuk).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} /> {b.durasi_bulan} bulan</span>
                            <span style={{ fontWeight: 600, color: "var(--color-secondary)" }}>
                              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(b.total_harga)}
                            </span>
                          </div>
                          {b.catatan && <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4, fontStyle: "italic", display: "flex", alignItems: "center", gap: 4 }}><FileText size={14} /> {b.catatan}</p>}
                          {b.user_telepon && (
                            <a
                              href={`https://wa.me/62${b.user_telepon.replace(/^0/, "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Halo ${b.user_nama}, booking kost ${b.kost_nama} Anda telah kami terima.`)}`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11, fontWeight: 600, color: "#128C7E", textDecoration: "none" }}
                            >
                              <MessageCircle size={14} /> WA: {b.user_telepon}
                            </a>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                          {b.status === "pending" && (
                            <>
                              <button onClick={() => handleBookingAction(b.id, "approve")} disabled={actionPending} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", background: "#006e2f", color: "#fff" }}>
                                ✓ Terima
                              </button>
                              <button onClick={() => handleBookingAction(b.id, "reject")} disabled={actionPending} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1.5px solid rgba(220,38,38,0.4)", background: "rgba(220,38,38,0.05)", color: "#dc2626" }}>
                                ✕ Tolak
                              </button>
                            </>
                          )}
                          {b.status === "approved" && (
                            <button onClick={() => handleBookingAction(b.id, "selesai")} disabled={actionPending} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1.5px solid var(--color-outline)", background: "var(--color-surface)", color: "var(--color-on-surface-variant)" }}>
                              ✓ Selesai
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

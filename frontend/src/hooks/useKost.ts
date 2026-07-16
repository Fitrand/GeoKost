import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  KostItem,
  KostListResponse,
  RecommendRequest,
  RecommendResponse,
  Kampus,
} from "@/types/kost.types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─────────────────────────────────────────────
// Auth header helper
// ─────────────────────────────────────────────
function authHeader(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─────────────────────────────────────────────
// Kost Nearby Hook
// ─────────────────────────────────────────────
interface NearbyParams {
  lat: number;
  lng: number;
  radius_km?: number;
  harga_max?: number;
  tipe_kamar?: string;
  enabled?: boolean;
}

export function useKostNearby(params: NearbyParams) {
  return useQuery({
    queryKey: ["kost-nearby", params],
    queryFn: async () => {
      const res = await api.get<KostListResponse>("/api/kost/nearby", { params });
      return res.data;
    },
    enabled: params.enabled !== false && !!params.lat && !!params.lng,
    staleTime: 1000 * 60 * 2,
  });
}

// ─────────────────────────────────────────────
// Kost Terdekat dari Lokasi Perangkat
// ─────────────────────────────────────────────
interface NearbyLocationParams {
  lat: number | null;
  lng: number | null;
  radius_km?: number;
  harga_max?: number;
  tipe_kamar?: string;
}

export function useKostNearbyLocation(params: NearbyLocationParams) {
  return useQuery({
    queryKey: ["kost-nearby-location", params],
    queryFn: async () => {
      const res = await api.get<KostListResponse>("/api/kost/nearby", {
        params: {
          lat:        params.lat,
          lng:        params.lng,
          radius_km:  params.radius_km ?? 1.5,
          harga_max:  params.harga_max,
          tipe_kamar: params.tipe_kamar,
          limit:      10,
        },
      });
      return res.data;
    },
    enabled: !!params.lat && !!params.lng,
    staleTime: 1000 * 30,
  });
}

// ─────────────────────────────────────────────
// Rekomendasi Hook (C4.5)
// ─────────────────────────────────────────────
export function useRecommend() {
  return useMutation({
    mutationFn: async (request: RecommendRequest) => {
      const res = await api.post<RecommendResponse>("/api/recommend", request);
      return res.data;
    },
  });
}

// ─────────────────────────────────────────────
// Kampus List Hook
// ─────────────────────────────────────────────
export function useKampusList() {
  return useQuery({
    queryKey: ["kampus-list"],
    queryFn: async () => {
      const res = await api.get<{ data: Kampus[]; total: number }>("/api/kampus");
      return res.data;
    },
    staleTime: 1000 * 60 * 60,
  });
}

// ─────────────────────────────────────────────
// Kost Search Hook (untuk halaman Cari Kost)
// ─────────────────────────────────────────────
export interface KostSearchItem {
  id: string;
  nama: string;
  harga_per_bulan: number;
  tipe_kamar: string | null;
  fasilitas: string[];
  foto_urls: string[];
  rating: number;
  jumlah_ulasan: number;
  koordinat: { lat: number; lng: number };
  alamat: string | null;
  luas_m2: number | null;
  jarak_meter: number;
}

export interface KostSearchListResponse {
  data: KostSearchItem[];
  total: number;
  limit: number;
  offset: number;
}

interface KostSearchParams {
  q?: string;
  harga_min?: number;
  harga_max?: number;
  tipe_kamar?: string;
  limit?: number;
  offset?: number;
}

export function useKostSearch(params: KostSearchParams) {
  return useQuery({
    queryKey: ["kost-search", params],
    queryFn: async () => {
      const res = await api.get<KostSearchListResponse>("/api/kost/", {
        params: {
          q: params.q || undefined,
          harga_min: params.harga_min || undefined,
          harga_max: params.harga_max || undefined,
          tipe_kamar: params.tipe_kamar || undefined,
          limit: params.limit ?? 50,
          offset: params.offset ?? 0,
        },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

// ─────────────────────────────────────────────
// BOOKING Hooks
// ─────────────────────────────────────────────
export interface BookingItem {
  id:              string;
  user_id:         string;
  kost_id:         string;
  kost_nama:       string;
  kost_alamat:     string;
  kost_foto:       string[];
  harga_per_bulan: number;
  pemilik_id:      string | null;
  status:          "pending" | "approved" | "rejected" | "cancelled" | "selesai";
  durasi_bulan:    number;
  tanggal_masuk:   string;
  total_harga:     number;
  catatan:         string | null;
  created_at:      string;
  updated_at:      string;
  // Mitra-only fields
  user_nama?:    string;
  user_email?:   string;
  user_telepon?: string;
}

export function useMyBookings(token: string | null) {
  return useQuery({
    queryKey: ["my-bookings", token],
    queryFn: async () => {
      const res = await fetch(`${API}/api/booking/saya`, {
        headers: authHeader(token) as HeadersInit,
      });
      if (!res.ok) throw new Error("Gagal memuat riwayat booking");
      return res.json() as Promise<{ data: BookingItem[]; total: number }>;
    },
    enabled: !!token,
    staleTime: 1000 * 30,
  });
}

export function useCreateBooking(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      kost_id:       string;
      durasi_bulan:  number;
      tanggal_masuk: string;
      catatan?:      string;
    }) => {
      const res = await fetch(`${API}/api/booking`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...(authHeader(token) as object) },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal membuat booking");
      return data as BookingItem;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-bookings"] }),
  });
}

export function useCancelBooking(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await fetch(`${API}/api/booking/${bookingId}/cancel`, {
        method:  "PATCH",
        headers: authHeader(token) as HeadersInit,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal membatalkan booking");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-bookings"] }),
  });
}

export function useMitraBookings(token: string | null) {
  return useQuery({
    queryKey: ["mitra-bookings", token],
    queryFn: async () => {
      const res = await fetch(`${API}/api/booking/mitra/semua`, {
        headers: authHeader(token) as HeadersInit,
      });
      if (!res.ok) throw new Error("Gagal memuat booking");
      return res.json() as Promise<{ data: BookingItem[]; total: number }>;
    },
    enabled: !!token,
    staleTime: 1000 * 30,
  });
}

export function useMitraBookingAction(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, action }: { bookingId: string; action: "approve" | "reject" | "selesai" }) => {
      const res = await fetch(`${API}/api/booking/mitra/${bookingId}/${action}`, {
        method:  "PATCH",
        headers: authHeader(token) as HeadersInit,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal mengupdate booking");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mitra-bookings"] });
      qc.invalidateQueries({ queryKey: ["mitra-stats"] });
    },
  });
}

// ─────────────────────────────────────────────
// FAVORIT Hooks
// ─────────────────────────────────────────────
export interface FavoritItem {
  favorit_id:      string;
  kost_id:         string;
  nama:            string;
  alamat:          string;
  harga_per_bulan: number;
  tipe_kamar:      string;
  fasilitas:       string[];
  foto_urls:       string[];
  rating:          number;
  jumlah_ulasan:   number;
  koordinat:       { lat: number; lng: number };
  saved_at:        string;
}

export function useMyFavorit(token: string | null) {
  return useQuery({
    queryKey: ["my-favorit", token],
    queryFn: async () => {
      const res = await fetch(`${API}/api/favorit`, {
        headers: authHeader(token) as HeadersInit,
      });
      if (!res.ok) throw new Error("Gagal memuat favorit");
      return res.json() as Promise<{ data: FavoritItem[]; total: number }>;
    },
    enabled: !!token,
    staleTime: 1000 * 60,
  });
}

export function useMyFavoritIds(token: string | null) {
  return useQuery({
    queryKey: ["my-favorit-ids", token],
    queryFn: async () => {
      const res = await fetch(`${API}/api/favorit/ids`, {
        headers: authHeader(token) as HeadersInit,
      });
      if (!res.ok) return { ids: [] };
      return res.json() as Promise<{ ids: string[] }>;
    },
    enabled: !!token,
    staleTime: 1000 * 60,
  });
}

export function useToggleFavorit(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (kostId: string) => {
      const res = await fetch(`${API}/api/favorit/${kostId}`, {
        method:  "POST",
        headers: authHeader(token) as HeadersInit,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal toggle favorit");
      return data as { action: "added" | "removed"; is_favorit: boolean; kost_id: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-favorit"] });
      qc.invalidateQueries({ queryKey: ["my-favorit-ids"] });
    },
  });
}

// ─────────────────────────────────────────────
// REVIEW Hooks
// ─────────────────────────────────────────────
export interface ReviewItem {
  id:         string;
  user_id:    string;
  user_nama:  string;
  kost_id:    string;
  booking_id: string | null;
  rating:     number;
  komentar:   string | null;
  created_at: string;
}

export function useKostReviews(kostId: string | null) {
  return useQuery({
    queryKey: ["kost-reviews", kostId],
    queryFn: async () => {
      const res = await fetch(`${API}/api/review/kost/${kostId}`);
      if (!res.ok) throw new Error("Gagal memuat ulasan");
      return res.json() as Promise<{ kost_id: string; total: number; avg_rating: number; data: ReviewItem[] }>;
    },
    enabled: !!kostId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateReview(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      kost_id:    string;
      rating:     number;
      komentar?:  string;
      booking_id?: string;
    }) => {
      const res = await fetch(`${API}/api/review`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...(authHeader(token) as object) },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal membuat ulasan");
      return data as ReviewItem;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["kost-reviews", data.kost_id] });
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });
}

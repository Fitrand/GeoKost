export interface Koordinat {
  lat: number;
  lng: number;
}

export interface PrediksiHarga {
  harga_prediksi: number;
  harga_aktual: number;
  label: "Murah" | "Wajar" | "Mahal" | "Estimasi";
  selisih_persen: number;
  confidence: number;
}

export interface KostItem {
  id: string;
  nama: string;
  harga_per_bulan: number;
  jarak_meter?: number;
  tipe_kamar?: string;
  fasilitas: string[];
  foto_urls: string[];
  rating?: number;
  koordinat: Koordinat;
  alamat?: string;
  luas_m2?: number;
  deskripsi?: string;
  is_active?: boolean;
  prediksi_harga?: PrediksiHarga;
}

export interface KostListResponse {
  data: KostItem[];
  total: number;
  radius_km: number;
}

export interface KostRekomendasi extends KostItem {
  skor_kecocokan: number;
  label_rekomendasi: "Sangat Direkomendasikan" | "Direkomendasikan" | "Kurang Sesuai";
  alasan: string[];
}

export interface Kampus {
  id: string;
  nama: string;
  singkatan?: string;
  kota?: string;
  provinsi?: string;
  alamat?: string;
  koordinat: Koordinat;
  logo_url?: string;
}

export interface RecommendRequest {
  kampus_id: string;
  budget_max: number;
  jarak_max_km: number;
  fasilitas_diinginkan: string[];
  tipe_kamar?: string;
  jumlah_hasil?: number;
}

export interface RecommendResponse {
  kampus_id: string;
  total_kost_dicari: number;
  total_rekomendasi: number;
  ranked_kost: KostRekomendasi[];
}

export interface PredictPriceResponse {
  harga_prediksi: number;
  harga_aktual?: number;
  label: "Murah" | "Wajar" | "Mahal" | "Estimasi";
  selisih_persen?: number;
  confidence: number;
  fitur_berpengaruh: { fitur: string; nilai: string; kontribusi: string }[];
}

export type TipeKamar = "single" | "double" | "campur" | "putra" | "putri";

export const FASILITAS_LIST = [
  { value: "wifi", label: "WiFi", icon: "📶" },
  { value: "ac", label: "AC", icon: "❄️" },
  { value: "kamar_mandi_dalam", label: "KM Dalam", icon: "🚿" },
  { value: "parkir_motor", label: "Parkir Motor", icon: "🏍️" },
  { value: "parkir_mobil", label: "Parkir Mobil", icon: "🚗" },
  { value: "dapur", label: "Dapur", icon: "🍳" },
  { value: "laundry", label: "Laundry", icon: "👕" },
  { value: "security", label: "Security", icon: "💂" },
  { value: "cctv", label: "CCTV", icon: "📹" },
  { value: "water_heater", label: "Water Heater", icon: "🚿" },
  { value: "kulkas", label: "Kulkas", icon: "🧊" },
  { value: "tv", label: "TV", icon: "📺" },
  { value: "meja_belajar", label: "Meja Belajar", icon: "📚" },
] as const;

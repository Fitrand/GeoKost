import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface FilterState {
  kampusId: string | null;
  budgetMax: number;
  jarakMaxKm: number;
  fasilitasDiinginkan: string[];
  tipeKamar: string | null;
  mapCenter: { lat: number; lng: number };
  mapZoom: number;

  // Actions
  setKampusId: (id: string | null) => void;
  setBudgetMax: (budget: number) => void;
  setJarakMaxKm: (jarak: number) => void;
  toggleFasilitas: (fasilitas: string) => void;
  setTipeKamar: (tipe: string | null) => void;
  setMapCenter: (center: { lat: number; lng: number }) => void;
  setMapZoom: (zoom: number) => void;
  resetFilters: () => void;
}

const DEFAULT_CENTER = { lat: 5.2030, lng: 97.0627 }; // UNIMAL Kampus Bukit Indah, Blang Pulo, Lhokseumawe

export const useFilterStore = create<FilterState>()(
  devtools(
    (set) => ({
      kampusId: null,
      budgetMax: 1_000_000,
      jarakMaxKm: 2,
      fasilitasDiinginkan: [],
      tipeKamar: null,
      mapCenter: DEFAULT_CENTER,
      mapZoom: 14,

      setKampusId: (id) => set({ kampusId: id }),
      setBudgetMax: (budget) => set({ budgetMax: budget }),
      setJarakMaxKm: (jarak) => set({ jarakMaxKm: jarak }),
      toggleFasilitas: (fasilitas) =>
        set((state) => ({
          fasilitasDiinginkan: state.fasilitasDiinginkan.includes(fasilitas)
            ? state.fasilitasDiinginkan.filter((f) => f !== fasilitas)
            : [...state.fasilitasDiinginkan, fasilitas],
        })),
      setTipeKamar: (tipe) => set({ tipeKamar: tipe }),
      setMapCenter: (center) => set({ mapCenter: center }),
      setMapZoom: (zoom) => set({ mapZoom: zoom }),
      resetFilters: () =>
        set({
          kampusId: null,
          budgetMax: 1_000_000,
          jarakMaxKm: 2,
          fasilitasDiinginkan: [],
          tipeKamar: null,
        }),
    }),
    { name: "geokost-filter-store" }
  )
);

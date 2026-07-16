import joblib
import numpy as np
import os
from typing import Optional, List, Dict, Any
from app.config import settings

# Global model cache — di-load sekali saat startup
_c45_model = None
_regression_model = None
_label_encoder = None


def load_models():
    """Load ML models ke memory saat aplikasi startup."""
    global _c45_model, _regression_model

    if os.path.exists(settings.MODEL_C45_PATH):
        _c45_model = joblib.load(settings.MODEL_C45_PATH)
        print(f"[OK] Model C4.5 berhasil dimuat dari {settings.MODEL_C45_PATH}")
    else:
        print(f"[WARN] Model C4.5 belum tersedia di {settings.MODEL_C45_PATH}. Jalankan ml/train_c45.py terlebih dahulu.")

    if os.path.exists(settings.MODEL_REGRESSION_PATH):
        _regression_model = joblib.load(settings.MODEL_REGRESSION_PATH)
        print(f"[OK] Model Regresi berhasil dimuat dari {settings.MODEL_REGRESSION_PATH}")
    else:
        print(f"[WARN] Model Regresi belum tersedia di {settings.MODEL_REGRESSION_PATH}. Jalankan ml/train_regression.py.")


def _build_features(kost: dict, preferensi: dict) -> List[float]:
    """
    Ekstraksi fitur dari data kost dan preferensi mahasiswa.
    Fitur: [harga_per_bulan, jarak_meter, jumlah_fasilitas, jumlah_fasilitas_cocok,
            luas_m2, tipe_kamar_match, rasio_harga_budget]
    """
    fasilitas_kost = set(kost.get("fasilitas") or [])
    fasilitas_preferensi = set(preferensi.get("fasilitas_diinginkan") or [])
    jumlah_cocok = len(fasilitas_kost & fasilitas_preferensi)

    tipe_match = 1.0 if (
        not preferensi.get("tipe_kamar") or
        kost.get("tipe_kamar") == preferensi.get("tipe_kamar")
    ) else 0.0

    budget_max = preferensi.get("budget_max", 1)
    rasio_harga = kost["harga_per_bulan"] / max(budget_max, 1)

    return [
        kost["harga_per_bulan"],
        kost["jarak_meter"],
        len(fasilitas_kost),
        jumlah_cocok,
        kost.get("luas_m2") or 0,
        tipe_match,
        min(rasio_harga, 2.0),  # cap pada 2.0 agar tidak outlier
    ]


def predict_recommendations(kost_list: List[dict], preferensi: dict) -> List[dict]:
    """
    Menggunakan model C4.5 untuk memberikan skor kecocokan dan label rekomendasi.
    Jika model belum ada, gunakan fallback scoring berbasis rule.
    """
    if _c45_model is None:
        return _fallback_scoring(kost_list, preferensi)

    label_map = {
        "Sangat Direkomendasikan": 1.0,
        "Direkomendasikan": 0.65,
        "Kurang Sesuai": 0.3,
    }

    features = [_build_features(k, preferensi) for k in kost_list]
    X = np.array(features)

    labels = _c45_model.predict(X)
    probas = _c45_model.predict_proba(X)

    results = []
    for i, kost in enumerate(kost_list):
        label = labels[i]
        max_proba = float(np.max(probas[i]))
        skor = label_map.get(label, 0.3)

        alasan = _generate_reasons(kost, preferensi, label)

        results.append({
            **kost,
            "skor_kecocokan": round(skor * max_proba, 4),
            "label_rekomendasi": label,
            "alasan": alasan,
        })

    return sorted(results, key=lambda x: x["skor_kecocokan"], reverse=True)


def _fallback_scoring(kost_list: List[dict], preferensi: dict) -> List[dict]:
    """
    Fallback scoring berbasis rule sederhana (digunakan jika model .pkl belum ada).
    Skor dihitung dari: harga (40%), jarak (35%), fasilitas (25%).
    """
    budget_max = preferensi.get("budget_max", float("inf"))
    jarak_max = preferensi.get("jarak_max_km", 2) * 1000
    fasilitas_pref = set(preferensi.get("fasilitas_diinginkan") or [])

    results = []
    for kost in kost_list:
        # Skor harga (semakin murah semakin bagus)
        harga_ratio = kost["harga_per_bulan"] / max(budget_max, 1)
        skor_harga = max(0, 1 - harga_ratio) if harga_ratio <= 1 else 0

        # Skor jarak
        jarak_ratio = kost["jarak_meter"] / max(jarak_max, 1)
        skor_jarak = max(0, 1 - jarak_ratio)

        # Skor fasilitas
        fasilitas_kost = set(kost.get("fasilitas") or [])
        if fasilitas_pref:
            skor_fasilitas = len(fasilitas_kost & fasilitas_pref) / len(fasilitas_pref)
        else:
            skor_fasilitas = 1.0

        skor_total = (skor_harga * 0.40) + (skor_jarak * 0.35) + (skor_fasilitas * 0.25)

        if skor_total >= 0.70:
            label = "Sangat Direkomendasikan"
        elif skor_total >= 0.45:
            label = "Direkomendasikan"
        else:
            label = "Kurang Sesuai"

        alasan = _generate_reasons(kost, preferensi, label)

        results.append({
            **kost,
            "skor_kecocokan": round(skor_total, 4),
            "label_rekomendasi": label,
            "alasan": alasan,
        })

    return sorted(results, key=lambda x: x["skor_kecocokan"], reverse=True)


def _generate_reasons(kost: dict, preferensi: dict, label: str) -> List[str]:
    """Generate alasan rekomendasi dalam bahasa Indonesia."""
    alasan = []
    budget_max = preferensi.get("budget_max", 0)
    jarak_max_m = preferensi.get("jarak_max_km", 2) * 1000
    fasilitas_pref = set(preferensi.get("fasilitas_diinginkan") or [])
    fasilitas_kost = set(kost.get("fasilitas") or [])

    if budget_max and kost["harga_per_bulan"] <= budget_max * 0.8:
        alasan.append(f"💰 Harga Rp{kost['harga_per_bulan']:,} sangat sesuai budget")
    elif budget_max and kost["harga_per_bulan"] <= budget_max:
        alasan.append(f"✅ Harga dalam batas budget")

    if kost["jarak_meter"] <= 500:
        alasan.append(f"🚶 Sangat dekat kampus ({kost['jarak_meter']:.0f}m)")
    elif kost["jarak_meter"] <= 1500:
        alasan.append(f"🚲 Jarak terjangkau ({kost['jarak_meter']:.0f}m dari kampus)")

    cocok = fasilitas_kost & fasilitas_pref
    if cocok:
        alasan.append(f"🏠 Memiliki: {', '.join(list(cocok)[:3])}")

    kurang = fasilitas_pref - fasilitas_kost
    if kurang:
        alasan.append(f"⚠️ Tidak ada: {', '.join(list(kurang)[:2])}")

    return alasan

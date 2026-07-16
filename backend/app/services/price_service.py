import joblib
import numpy as np
import os
from typing import List, Optional, Dict, Any
from app.config import settings

FASILITAS_ALL = [
    "wifi", "ac", "kamar_mandi_dalam", "parkir_motor", "parkir_mobil",
    "dapur", "laundry", "security", "cctv", "gym", "kolam_renang",
    "water_heater", "kulkas", "tv", "meja_belajar"
]

TIPE_KAMAR_MAP = {"single": 0, "double": 1, "campur": 2, "putra": 3, "putri": 4}

_regression_model = None


def load_regression_model():
    global _regression_model
    if os.path.exists(settings.MODEL_REGRESSION_PATH):
        _regression_model = joblib.load(settings.MODEL_REGRESSION_PATH)


def _encode_single(luas_m2: int, fasilitas: List[str], jarak_kampus_meter: float, tipe_kamar: str) -> List:
    """Encode satu baris fitur kost menjadi list numerik."""
    fasilitas_vector = [1 if f in fasilitas else 0 for f in FASILITAS_ALL]
    tipe_encoded = TIPE_KAMAR_MAP.get((tipe_kamar or "single").lower(), 0)
    return [
        luas_m2 or 9,          # default 9 m2 jika null
        jarak_kampus_meter,
        tipe_encoded,
        len(fasilitas),
        *fasilitas_vector,
    ]


def _build_label(harga_aktual: int, harga_prediksi: int) -> dict:
    """Tentukan label dan selisih persen antara harga aktual vs prediksi."""
    selisih = ((harga_aktual - harga_prediksi) / harga_prediksi) * 100
    if selisih < -15:
        label = "Murah"
    elif selisih > 15:
        label = "Mahal"
    else:
        label = "Wajar"
    return {"label": label, "selisih_persen": round(selisih, 2)}


def _fallback_price(luas_m2: int, fasilitas: List[str], jarak_kampus_meter: float) -> int:
    """Formula estimasi harga tanpa model (fallback)."""
    harga = 200_000 + (luas_m2 or 9) * 15_000
    bobot = {
        "ac": 150_000, "kamar_mandi_dalam": 100_000, "wifi": 50_000,
        "water_heater": 75_000, "gym": 100_000, "kolam_renang": 150_000,
        "laundry": 50_000, "dapur": 30_000, "parkir_mobil": 75_000,
    }
    for f in fasilitas:
        harga += bobot.get(f, 20_000)
    if jarak_kampus_meter < 500:
        harga *= 1.3
    elif jarak_kampus_meter < 1000:
        harga *= 1.15
    elif jarak_kampus_meter > 3000:
        harga *= 0.85
    return int(harga)


# ─────────────────────────────────────────────
# Batch Prediction — satu kali panggil model untuk N kost sekaligus
# ─────────────────────────────────────────────

def predict_price_batch(kost_list: List[Dict[str, Any]]) -> List[dict]:
    """
    Prediksi harga untuk sekumpulan kost sekaligus (batch).
    scikit-learn.predict() dipanggil SATU KALI dengan matrix N×F,
    bukan N kali satu per satu — jauh lebih efisien untuk 100+ kost.

    Args:
        kost_list: list dict kost dari query spasial (harus punya jarak_meter)
    Returns:
        list dict prediksi, urutan sama dengan kost_list
    """
    if not kost_list:
        return []

    use_model = _regression_model is not None
    confidence = 0.85 if use_model else 0.60

    # 1. Encode semua kost ke matrix sekaligus — O(N) linear
    feature_matrix = np.array([
        _encode_single(
            k.get("luas_m2") or 9,
            k.get("fasilitas") or [],
            k.get("jarak_meter") or 1000,
            k.get("tipe_kamar") or "single",
        )
        for k in kost_list
    ])  # shape: (N, F)

    # 2. Satu panggilan model untuk seluruh matrix — batch prediction
    if use_model:
        harga_prediksi_arr = _regression_model.predict(feature_matrix).astype(int)
    else:
        # Fallback formula vectorized (numpy)
        harga_prediksi_arr = np.array([
            _fallback_price(k.get("luas_m2") or 9, k.get("fasilitas") or [], k.get("jarak_meter") or 1000)
            for k in kost_list
        ])

    # 3. Bangun hasil berdasarkan hasil batch
    results = []
    for kost, harga_prediksi in zip(kost_list, harga_prediksi_arr):
        harga_aktual = kost["harga_per_bulan"]
        label_data = _build_label(harga_aktual, int(harga_prediksi))
        results.append({
            "harga_prediksi": int(harga_prediksi),
            "harga_aktual": harga_aktual,
            "label": label_data["label"],
            "selisih_persen": label_data["selisih_persen"],
            "confidence": confidence,
        })
    return results


# ─────────────────────────────────────────────
# Single Prediction (untuk endpoint /predict tunggal)
# ─────────────────────────────────────────────


def predict_price(
    luas_m2: int,
    fasilitas: List[str],
    jarak_kampus_meter: float,
    tipe_kamar: str = "single",
    harga_aktual: Optional[int] = None,
) -> dict:
    """
    Prediksi harga kost berdasarkan fitur.
    Mengembalikan harga prediksi, label (Murah/Wajar/Mahal), dan selisih persen.
    """
    if _regression_model is None:
        # Fallback: harga dasar menggunakan formula sederhana
        return _fallback_price_prediction(luas_m2, fasilitas, jarak_kampus_meter, tipe_kamar, harga_aktual)

    X = _encode_features(luas_m2, fasilitas, jarak_kampus_meter, tipe_kamar)
    harga_prediksi = int(_regression_model.predict(X)[0])

    result = {
        "harga_prediksi": harga_prediksi,
        "harga_aktual": harga_aktual,
        "confidence": 0.85,
        "fitur_berpengaruh": _get_feature_importance(fasilitas, luas_m2, jarak_kampus_meter),
    }

    if harga_aktual:
        selisih = ((harga_aktual - harga_prediksi) / harga_prediksi) * 100
        result["selisih_persen"] = round(selisih, 2)

        if selisih < -15:
            result["label"] = "Murah"
        elif selisih > 15:
            result["label"] = "Mahal"
        else:
            result["label"] = "Wajar"
    else:
        result["selisih_persen"] = None
        result["label"] = "Wajar"

    return result


def _fallback_price_prediction(luas_m2, fasilitas, jarak_kampus_meter, tipe_kamar, harga_aktual):
    """Formula estimasi harga tanpa model (digunakan sebelum model ditraining)."""
    BASE = 200_000
    harga = BASE
    harga += luas_m2 * 15_000

    fasilitas_bobot = {
        "ac": 150_000, "kamar_mandi_dalam": 100_000, "wifi": 50_000,
        "water_heater": 75_000, "gym": 100_000, "kolam_renang": 150_000,
        "laundry": 50_000, "dapur": 30_000, "parkir_mobil": 75_000,
    }
    for f in fasilitas:
        harga += fasilitas_bobot.get(f, 20_000)

    # Jarak berpengaruh: semakin dekat kampus, semakin mahal
    if jarak_kampus_meter < 500:
        harga *= 1.3
    elif jarak_kampus_meter < 1000:
        harga *= 1.15
    elif jarak_kampus_meter > 3000:
        harga *= 0.85

    harga_prediksi = int(harga)

    result = {
        "harga_prediksi": harga_prediksi,
        "harga_aktual": harga_aktual,
        "confidence": 0.60,
        "fitur_berpengaruh": _get_feature_importance(fasilitas, luas_m2, jarak_kampus_meter),
    }

    if harga_aktual:
        selisih = ((harga_aktual - harga_prediksi) / harga_prediksi) * 100
        result["selisih_persen"] = round(selisih, 2)
        if selisih < -15:
            result["label"] = "Murah"
        elif selisih > 15:
            result["label"] = "Mahal"
        else:
            result["label"] = "Wajar"
    else:
        result["selisih_persen"] = None
        result["label"] = "Estimasi"

    return result


def _get_feature_importance(fasilitas, luas_m2, jarak_kampus_meter) -> list:
    return [
        {"fitur": "Luas Kamar", "nilai": f"{luas_m2} m²", "kontribusi": "Tinggi"},
        {"fitur": "Jarak Kampus", "nilai": f"{jarak_kampus_meter:.0f} m", "kontribusi": "Sedang"},
        {"fitur": "Jumlah Fasilitas", "nilai": str(len(fasilitas)), "kontribusi": "Sedang"},
    ]

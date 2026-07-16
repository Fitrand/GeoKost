"""
Script Training Model Regresi untuk Prediksi Harga Kost.
Menggunakan GradientBoostingRegressor untuk akurasi lebih baik daripada LinearRegression sederhana.

Jalankan: python ml/train_regression.py
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
import joblib
import os

MODEL_OUTPUT = "models_pkl/price_regressor.pkl"

FASILITAS_ALL = [
    "wifi", "ac", "kamar_mandi_dalam", "parkir_motor", "parkir_mobil",
    "dapur", "laundry", "security", "cctv", "gym", "kolam_renang",
    "water_heater", "kulkas", "tv", "meja_belajar"
]

TIPE_KAMAR_MAP = {"single": 0, "double": 1, "campur": 2, "putra": 3, "putri": 4}


def generate_price_dataset(n_samples: int = 600) -> pd.DataFrame:
    """Generate synthetic dataset untuk prediksi harga."""
    np.random.seed(123)
    rng = np.random.default_rng(123)

    data = []
    for _ in range(n_samples):
        luas = rng.integers(6, 30)
        tipe = rng.choice(["single", "double", "campur", "putra", "putri"])
        jarak = rng.integers(100, 6000)
        fasilitas_count = rng.integers(2, 10)
        has_ac = rng.random() > 0.4
        has_km_dalam = rng.random() > 0.45
        has_wifi = rng.random() > 0.2

        # Formula harga realistis
        harga = 200_000
        harga += luas * 12_000
        if has_ac:
            harga += 150_000
        if has_km_dalam:
            harga += 100_000
        if has_wifi:
            harga += 50_000
        harga += fasilitas_count * 15_000

        if jarak < 500:
            harga *= 1.35
        elif jarak < 1000:
            harga *= 1.20
        elif jarak < 2000:
            harga *= 1.05
        elif jarak > 4000:
            harga *= 0.80

        if tipe == "double":
            harga *= 1.3

        # Tambah noise realistis (±10%)
        noise = rng.uniform(0.90, 1.10)
        harga = int(harga * noise)

        # Round ke kelipatan 50ribu
        harga = round(harga / 50_000) * 50_000

        data.append({
            "luas_m2": luas,
            "tipe_kamar": TIPE_KAMAR_MAP[tipe],
            "jarak_kampus_meter": jarak,
            "jumlah_fasilitas": fasilitas_count,
            "has_ac": int(has_ac),
            "has_km_dalam": int(has_km_dalam),
            "has_wifi": int(has_wifi),
            "harga_per_bulan": harga,
        })

    return pd.DataFrame(data)


# ─────────────────────────────────────────────
# Load / Generate Data
# ─────────────────────────────────────────────
DATA_PATH = "ml/data/price_dataset.csv"

if os.path.exists(DATA_PATH):
    print(f"📂 Memuat dataset dari {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
else:
    print("⚠️ Dataset harga tidak ditemukan. Membuat synthetic data...")
    df = generate_price_dataset(600)
    os.makedirs("ml/data", exist_ok=True)
    df.to_csv(DATA_PATH, index=False)
    print(f"✅ Dataset disimpan ke {DATA_PATH}")

FEATURES = ["luas_m2", "tipe_kamar", "jarak_kampus_meter", "jumlah_fasilitas", "has_ac", "has_km_dalam", "has_wifi"]
TARGET = "harga_per_bulan"

X = df[FEATURES]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"\n📚 Training: {len(X_train)} sampel | Test: {len(X_test)} sampel")

model = GradientBoostingRegressor(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    random_state=42,
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"\n📊 Evaluasi Model Regresi:")
print(f"  MAE  (Mean Absolute Error): Rp{mae:,.0f}")
print(f"  RMSE (Root Mean Sq Error):  Rp{rmse:,.0f}")
print(f"  R²   (Koefisien Determinasi): {r2:.4f}")

print(f"\n📊 Feature Importance:")
for feat, imp in sorted(zip(FEATURES, model.feature_importances_), key=lambda x: x[1], reverse=True):
    print(f"  {feat}: {imp:.4f}")

os.makedirs("models_pkl", exist_ok=True)
joblib.dump(model, MODEL_OUTPUT)
print(f"\n💾 Model Regresi disimpan ke: {MODEL_OUTPUT}")
print("🎉 Training selesai!")

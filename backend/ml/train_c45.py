"""
Script Training Model C4.5 (Decision Tree dengan criterion='entropy')
untuk sistem rekomendasi GeoKost.

Jalankan: python ml/train_c45.py
"""
import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# ─────────────────────────────────────────────
# 1. Load atau Generate Dataset
# ─────────────────────────────────────────────

DATA_PATH = "ml/data/kost_dataset.csv"
MODEL_OUTPUT = "models_pkl/c45_model.pkl"


def generate_synthetic_data(n_samples: int = 500) -> pd.DataFrame:
    """
    Generate synthetic dataset untuk fase awal MVP.
    Data mencerminkan distribusi kost mahasiswa umum.
    """
    np.random.seed(42)
    rng = np.random.default_rng(42)

    harga = rng.integers(200_000, 1_500_000, n_samples)
    jarak = rng.integers(100, 5000, n_samples)
    luas = rng.integers(6, 25, n_samples)
    fasilitas_count = rng.integers(1, 10, n_samples)
    fasilitas_match = rng.integers(0, fasilitas_count + 1, n_samples)  # cocok ≤ total
    tipe_match = rng.integers(0, 2, n_samples)
    budget_max = harga + rng.integers(-300_000, 500_000, n_samples)
    rasio_harga = np.clip(harga / np.maximum(budget_max, 1), 0, 2)

    # Label berdasarkan rule logis
    labels = []
    for i in range(n_samples):
        skor = (
            (1 - rasio_harga[i]) * 0.40 +
            (1 - jarak[i] / 5000) * 0.35 +
            (fasilitas_match[i] / max(fasilitas_count[i], 1)) * 0.25
        )
        if skor >= 0.65:
            labels.append("Sangat Direkomendasikan")
        elif skor >= 0.40:
            labels.append("Direkomendasikan")
        else:
            labels.append("Kurang Sesuai")

    df = pd.DataFrame({
        "harga_per_bulan": harga,
        "jarak_meter": jarak,
        "jumlah_fasilitas": fasilitas_count,
        "jumlah_fasilitas_cocok": fasilitas_match,
        "luas_m2": luas,
        "tipe_kamar_match": tipe_match,
        "rasio_harga_budget": rasio_harga.round(4),
        "label": labels,
    })
    return df


# ─────────────────────────────────────────────
# 2. Load Data
# ─────────────────────────────────────────────

if os.path.exists(DATA_PATH):
    print(f"📂 Memuat dataset dari {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
else:
    print("⚠️ Dataset tidak ditemukan. Membuat synthetic data (500 sampel)...")
    df = generate_synthetic_data(500)
    os.makedirs("ml/data", exist_ok=True)
    df.to_csv(DATA_PATH, index=False)
    print(f"✅ Synthetic dataset disimpan ke {DATA_PATH}")

print(f"\n📊 Distribusi Label:")
print(df["label"].value_counts())

# ─────────────────────────────────────────────
# 3. Feature Engineering
# ─────────────────────────────────────────────

FEATURES = [
    "harga_per_bulan",
    "jarak_meter",
    "jumlah_fasilitas",
    "jumlah_fasilitas_cocok",
    "luas_m2",
    "tipe_kamar_match",
    "rasio_harga_budget",
]
TARGET = "label"

X = df[FEATURES]
y = df[TARGET]

# ─────────────────────────────────────────────
# 4. Split Data
# ─────────────────────────────────────────────

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"\n📚 Training samples: {len(X_train)}, Test samples: {len(X_test)}")

# ─────────────────────────────────────────────
# 5. Training Model C4.5
# ─────────────────────────────────────────────

print("\n🌳 Training Decision Tree C4.5 (criterion=entropy)...")

model = DecisionTreeClassifier(
    criterion="entropy",       # C4.5 menggunakan Information Gain (entropy-based)
    max_depth=6,               # Kedalaman maksimum pohon
    min_samples_split=10,      # Minimum sampel untuk split
    min_samples_leaf=5,        # Minimum sampel di leaf
    class_weight="balanced",   # Tangani ketidakseimbangan kelas
    random_state=42,
)
model.fit(X_train, y_train)

# ─────────────────────────────────────────────
# 6. Evaluasi Model
# ─────────────────────────────────────────────

y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print(f"\n✅ Akurasi Model: {acc:.4f} ({acc*100:.2f}%)")
print("\n📋 Classification Report:")
print(classification_report(y_test, y_pred))

# Cross-validation
cv_scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")
print(f"\n🔄 Cross-Validation (5-fold): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

print("\n🌲 Struktur Pohon Keputusan:")
tree_rules = export_text(model, feature_names=FEATURES)
print(tree_rules[:2000])  # Tampilkan sebagian

print(f"\n📊 Feature Importance:")
for feat, imp in sorted(
    zip(FEATURES, model.feature_importances_), key=lambda x: x[1], reverse=True
):
    print(f"  {feat}: {imp:.4f}")

# ─────────────────────────────────────────────
# 7. Simpan Model
# ─────────────────────────────────────────────

os.makedirs("models_pkl", exist_ok=True)
joblib.dump(model, MODEL_OUTPUT)
print(f"\n💾 Model C4.5 disimpan ke: {MODEL_OUTPUT}")
print("🎉 Training selesai!")

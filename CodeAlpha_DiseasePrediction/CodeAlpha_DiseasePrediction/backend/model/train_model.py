"""
train_model.py — Disease Prediction (Breast Cancer)
------------------------------------------------------
Uses the real UCI Breast Cancer Wisconsin (Diagnostic) dataset, bundled
with scikit-learn (sklearn.datasets.load_breast_cancer) — 569 real patient
samples, 30 numeric features computed from digitized images of a breast
mass (radius, texture, perimeter, area, smoothness, etc.).

Trains and compares Logistic Regression, Random Forest, and SVM,
evaluates with Precision / Recall / F1 / ROC-AUC, and saves the best
model + scaler + the 10 most informative "mean" features for a
simplified, patient-friendly frontend form.

Run:
    python train_model.py
Produces (in this folder):
    disease_model.pkl
    scaler.pkl
    feature_names.json
    metrics.json
"""

import json
import os

import joblib
import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

MODEL_DIR = os.path.dirname(__file__)

# We use the 10 "mean" features only (not the _se and _worst variants) so the
# frontend form stays short and clinically meaningful for a demo, while still
# giving strong predictive performance.
SELECTED_FEATURES = [
    "mean radius",
    "mean texture",
    "mean perimeter",
    "mean area",
    "mean smoothness",
    "mean compactness",
    "mean concavity",
    "mean concave points",
    "mean symmetry",
    "mean fractal dimension",
]


def main():
    data = load_breast_cancer(as_frame=True)
    df = data.frame
    # target: 0 = malignant, 1 = benign (sklearn's convention)
    X = df[SELECTED_FEATURES]
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    candidates = {
        "LogisticRegression": LogisticRegression(max_iter=2000),
        "RandomForest": RandomForestClassifier(
            n_estimators=300, max_depth=6, random_state=42
        ),
        "SVM": SVC(kernel="rbf", probability=True, random_state=42),
    }

    results = {}
    best_name, best_model, best_auc = None, None, -1

    for name, model in candidates.items():
        model.fit(X_train_scaled, y_train)
        preds = model.predict(X_test_scaled)
        proba = model.predict_proba(X_test_scaled)[:, 1]

        acc = accuracy_score(y_test, preds)
        prec = precision_score(y_test, preds)
        rec = recall_score(y_test, preds)
        f1 = f1_score(y_test, preds)
        auc = roc_auc_score(y_test, proba)

        results[name] = {
            "accuracy": acc, "precision": prec, "recall": rec,
            "f1": f1, "roc_auc": auc,
        }

        print(f"\n=== {name} ===")
        print(f"Accuracy : {acc:.4f}")
        print(f"Precision: {prec:.4f}")
        print(f"Recall   : {rec:.4f}")
        print(f"F1-score : {f1:.4f}")
        print(f"ROC-AUC  : {auc:.4f}")
        print(classification_report(y_test, preds, target_names=["Malignant", "Benign"]))

        if auc > best_auc:
            best_auc = auc
            best_name = name
            best_model = model

    print(f"\nBest model: {best_name} (ROC-AUC = {best_auc:.4f})")

    joblib.dump(best_model, os.path.join(MODEL_DIR, "disease_model.pkl"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))
    with open(os.path.join(MODEL_DIR, "feature_names.json"), "w") as f:
        json.dump(SELECTED_FEATURES, f)
    with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
        json.dump({"best_model": best_name, "results": results}, f, indent=2)

    # Save a few real sample rows (one benign, one malignant) so the frontend
    # can offer "load example" buttons for demoing.
    examples = {}
    for label, name in [(0, "malignant_example"), (1, "benign_example")]:
        row = df[df["target"] == label].iloc[0]
        examples[name] = {feat: float(row[feat]) for feat in SELECTED_FEATURES}
    with open(os.path.join(MODEL_DIR, "examples.json"), "w") as f:
        json.dump(examples, f, indent=2)

    print(f"\nSaved model artifacts to {MODEL_DIR}")


if __name__ == "__main__":
    main()

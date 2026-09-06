"""
train_model.py
---------------
Trains and compares Logistic Regression, Decision Tree, and Random Forest
classifiers on the credit-scoring dataset, evaluates them with
Precision / Recall / F1 / ROC-AUC, and saves the best model + scaler
to disk with joblib so the Flask backend can load and serve it.

Run:
    python train_model.py
Produces (in this folder):
    credit_model.pkl
    scaler.pkl
    feature_names.json
"""

import json
import os

import joblib
import pandas as pd
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
from sklearn.tree import DecisionTreeClassifier

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "credit_data.csv")
MODEL_DIR = os.path.dirname(__file__)

FEATURES = [
    "annual_income",
    "age",
    "total_debt",
    "debt_to_income",
    "credit_utilization",
    "num_open_accounts",
    "num_late_payments_2yrs",
    "years_credit_history",
    "loan_amount_requested",
    "employment_years",
]
TARGET = "creditworthy"


def main():
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    candidates = {
        "LogisticRegression": LogisticRegression(max_iter=1000),
        "DecisionTree": DecisionTreeClassifier(max_depth=6, random_state=42),
        "RandomForest": RandomForestClassifier(
            n_estimators=200, max_depth=8, random_state=42
        ),
    }

    results = {}
    best_name, best_model, best_auc = None, None, -1

    for name, model in candidates.items():
        # Tree models don't need scaling but it doesn't hurt; LR needs it.
        model.fit(X_train_scaled, y_train)
        preds = model.predict(X_test_scaled)
        proba = model.predict_proba(X_test_scaled)[:, 1]

        acc = accuracy_score(y_test, preds)
        prec = precision_score(y_test, preds)
        rec = recall_score(y_test, preds)
        f1 = f1_score(y_test, preds)
        auc = roc_auc_score(y_test, proba)

        results[name] = {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1": f1,
            "roc_auc": auc,
        }

        print(f"\n=== {name} ===")
        print(f"Accuracy : {acc:.4f}")
        print(f"Precision: {prec:.4f}")
        print(f"Recall   : {rec:.4f}")
        print(f"F1-score : {f1:.4f}")
        print(f"ROC-AUC  : {auc:.4f}")
        print(classification_report(y_test, preds, target_names=["Bad", "Good"]))

        if auc > best_auc:
            best_auc = auc
            best_name = name
            best_model = model

    print(f"\nBest model: {best_name} (ROC-AUC = {best_auc:.4f})")

    joblib.dump(best_model, os.path.join(MODEL_DIR, "credit_model.pkl"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))
    with open(os.path.join(MODEL_DIR, "feature_names.json"), "w") as f:
        json.dump(FEATURES, f)
    with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
        json.dump({"best_model": best_name, "results": results}, f, indent=2)

    print(f"\nSaved model artifacts to {MODEL_DIR}")


if __name__ == "__main__":
    main()

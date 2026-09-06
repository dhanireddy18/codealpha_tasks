"""
app.py — Flask backend for the Disease Prediction model (Breast Cancer)
--------------------------------------------------------------------------
Serves:
  1. The frontend (static HTML/CSS/JS) at "/"
  2. A REST API at POST /api/predict that accepts 10 tumor-measurement
     features and returns a diagnosis prediction (Benign/Malignant) with
     probability.
  3. GET /api/examples — returns one real benign & one real malignant
     sample row so the frontend can offer "load example" buttons.

Run:
    pip install -r requirements.txt
    python app.py
Then open http://127.0.0.1:5001 in your browser.
"""

import json
import os

import joblib
import numpy as np
from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


# ---- Load model artifacts once at startup ----
model = joblib.load(os.path.join(MODEL_DIR, "disease_model.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
with open(os.path.join(MODEL_DIR, "feature_names.json")) as f:
    FEATURES = json.load(f)
with open(os.path.join(MODEL_DIR, "examples.json")) as f:
    EXAMPLES = json.load(f)


@app.route("/")
def serve_frontend():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})


@app.route("/api/examples", methods=["GET"])
def examples():
    return jsonify(EXAMPLES)


@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        missing = [f for f in FEATURES if f not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {missing}"}), 400

        X = np.array([[float(data[f]) for f in FEATURES]])
        X_scaled = scaler.transform(X)

        pred = int(model.predict(X_scaled)[0])  # 0 = malignant, 1 = benign
        proba = model.predict_proba(X_scaled)[0]
        proba_benign = float(proba[1])
        proba_malignant = float(proba[0])

        diagnosis = "Benign" if pred == 1 else "Malignant"
        confidence = proba_benign if pred == 1 else proba_malignant

        return jsonify({
            "diagnosis": diagnosis,
            "is_benign": bool(pred),
            "confidence": round(confidence, 4),
            "probability_benign": round(proba_benign, 4),
            "probability_malignant": round(proba_malignant, 4),
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=False, port=5001)

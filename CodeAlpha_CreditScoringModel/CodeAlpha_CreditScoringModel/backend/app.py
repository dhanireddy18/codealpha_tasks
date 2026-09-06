from flask import Flask, request, jsonify, send_from_directory
import os
import json
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
FRONTEND_DIR = os.path.join(PROJECT_DIR, "frontend")
MODEL_DIR = os.path.join(BASE_DIR, "model")

app = Flask(
    __name__,
    static_folder=FRONTEND_DIR,
    static_url_path=""
)

# Load model
model = joblib.load(
    os.path.join(MODEL_DIR, "credit_model.pkl")
)

# Load scaler
scaler = joblib.load(
    os.path.join(MODEL_DIR, "scaler.pkl")
)

# Load feature names
with open(
    os.path.join(MODEL_DIR, "feature_names.json"),
    "r"
) as f:
    feature_names = json.load(f)


@app.route("/")
def home():
    return send_from_directory(
        FRONTEND_DIR,
        "index.html"
    )


@app.route("/api/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        required_fields = [
            "annual_income",
            "age",
            "total_debt",
            "credit_utilization",
            "num_open_accounts",
            "num_late_payments_2yrs",
            "years_credit_history",
            "loan_amount_requested",
            "employment_years"
        ]

        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing field: {field}"
                }), 400

        annual_income = float(data["annual_income"])
        total_debt = float(data["total_debt"])

        if annual_income <= 0:
            return jsonify({
                "error": "Annual income must be greater than zero."
            }), 400

        debt_to_income = total_debt / annual_income

        row = {
            "annual_income": float(data["annual_income"]),
            "age": float(data["age"]),
            "total_debt": float(data["total_debt"]),
            "credit_utilization": float(
                data["credit_utilization"]
            ),
            "num_open_accounts": float(
                data["num_open_accounts"]
            ),
            "num_late_payments_2yrs": float(
                data["num_late_payments_2yrs"]
            ),
            "years_credit_history": float(
                data["years_credit_history"]
            ),
            "loan_amount_requested": float(
                data["loan_amount_requested"]
            ),
            "employment_years": float(
                data["employment_years"]
            ),
            "debt_to_income": debt_to_income
        }

        df = pd.DataFrame([row])

        df = df[feature_names]

        scaled_data = scaler.transform(df)

        prediction = model.predict(scaled_data)[0]

        probability = model.predict_proba(
            scaled_data
        )[0][1]

        creditworthy = bool(prediction)

        if probability >= 0.75:
            risk_band = "Excellent"
        elif probability >= 0.55:
            risk_band = "Good"
        elif probability >= 0.35:
            risk_band = "Fair"
        else:
            risk_band = "Poor"

        return jsonify({
            "prediction": (
                "Creditworthy"
                if creditworthy
                else "Not Creditworthy"
            ),
            "creditworthy": creditworthy,
            "probability": float(probability),
            "risk_band": risk_band,
            "debt_to_income_computed": round(
                debt_to_income,
                4
            )
        })

    except Exception as e:

        print("Prediction error:", e)

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=8000,
        debug=True
    )
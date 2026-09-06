# CodeAlpha_CreditScoringModel

**CodeAlpha Machine Learning Internship — Task 1: Credit Scoring Model**

Predicts an individual's creditworthiness from their financial profile using
classification algorithms (Logistic Regression, Decision Tree, Random Forest).

## What it does

- Trains and compares 3 classifiers, evaluated with **Precision, Recall,
  F1-score, and ROC-AUC**.
- Automatically picks the best-performing model (by ROC-AUC) and saves it.
- Serves the model through a **Flask REST API**.
- A clean **HTML/CSS/JS frontend** lets you enter an applicant's details and
  get an instant prediction with a probability score and risk band.

## Project structure

```
CodeAlpha_CreditScoringModel/
├── backend/
│   ├── app.py                  # Flask server + REST API
│   ├── requirements.txt
│   ├── data/
│   │   ├── generate_data.py    # Builds the synthetic training dataset
│   │   └── credit_data.csv     # Generated dataset (5,000 rows)
│   └── model/
│       ├── train_model.py      # Trains & evaluates 3 classifiers
│       ├── credit_model.pkl    # Saved best model (generated)
│       ├── scaler.pkl          # Saved StandardScaler (generated)
│       ├── feature_names.json  # Feature order used by the model
│       └── metrics.json        # Evaluation metrics (generated)
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

## About the dataset

Public real-world credit bureau data is private/paywalled, so this project
uses a **synthetically generated but realistic dataset** (`generate_data.py`):
income, debt, credit utilization, late payments, credit history length, etc.
are simulated from sensible statistical distributions, and the target label
is derived from a rule (income, debt-to-income, utilization, payment history)
plus random noise — so the ML task is genuinely learnable but not trivial.

You can swap this for a real dataset (e.g. Kaggle's "Give Me Some Credit" or
a UCI dataset) by replacing `credit_data.csv` with matching column names.

## How to run

```bash
cd backend
pip install -r requirements.txt

# 1. Generate the dataset (only needed once, already included)
python data/generate_data.py

# 2. Train the model (only needed once, already included)
python model/train_model.py

# 3. Start the server (serves both the API and the frontend)
python app.py
```

Then open **http://127.0.0.1:5000** in your browser.

## API reference

### `POST /api/predict`

Request body:
```json
{
  "annual_income": 55000,
  "age": 30,
  "total_debt": 12000,
  "credit_utilization": 0.30,
  "num_open_accounts": 4,
  "num_late_payments_2yrs": 1,
  "years_credit_history": 8,
  "loan_amount_requested": 10000,
  "employment_years": 5
}
```

Response:
```json
{
  "prediction": "Creditworthy",
  "creditworthy": true,
  "probability": 0.87,
  "risk_band": "Excellent",
  "debt_to_income_computed": 0.22
}
```

### `GET /api/health`
Simple health check — confirms the model loaded correctly.

## Model performance (on held-out test set)

Random Forest was selected as the best model:

| Metric    | Score |
|-----------|-------|
| Accuracy  | ~0.76 |
| Precision | ~0.73 |
| Recall    | ~0.81 |
| F1-score  | ~0.77 |
| ROC-AUC   | ~0.83 |

(Full breakdown for all 3 models saved in `backend/model/metrics.json`.)

## Submission checklist (per CodeAlpha instructions)

- [ ] Push this folder to a GitHub repo named `CodeAlpha_CreditScoringModel`
- [ ] Record a short video walking through the code + demo
- [ ] Post on LinkedIn tagging @CodeAlpha with the video + GitHub link
- [ ] Submit via the CodeAlpha submission form

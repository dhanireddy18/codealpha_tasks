"""
generate_data.py
-----------------
Generates a realistic synthetic credit-scoring dataset.

Why synthetic data?
Real credit bureau datasets are private / behind paywalls. For this project we
simulate financial profiles (income, debts, payment history, etc.) using
sensible statistical distributions and a hand-crafted "creditworthiness"
rule + noise, so the resulting dataset behaves like a real one and models
trained on it generalize sensibly.

Run:
    python generate_data.py
Produces:
    credit_data.csv  (5000 rows)
"""

import numpy as np
import pandas as pd

np.random.seed(42)
N = 5000

# ---- Feature engineering / simulation ----
annual_income = np.random.normal(55000, 20000, N).clip(12000, 200000)
age = np.random.randint(21, 65, N)

total_debt = np.random.normal(15000, 12000, N).clip(0, 150000)
credit_utilization = np.random.beta(2, 5, N)  # 0-1, how much of credit limit used
num_open_accounts = np.random.poisson(4, N).clip(0, 20)
num_late_payments_2yrs = np.random.poisson(1.2, N).clip(0, 15)
years_credit_history = np.random.gamma(4, 2.5, N).clip(0, 40)
loan_amount_requested = np.random.normal(12000, 8000, N).clip(500, 60000)
employment_years = np.random.gamma(3, 2, N).clip(0, 40)

debt_to_income = total_debt / annual_income

# ---- Creditworthiness rule (ground truth signal) + noise ----
# Higher score = more creditworthy. We turn this into a binary label:
# 1 = Good credit risk (loan should be approved), 0 = Bad credit risk
score = (
    0.30 * (annual_income / 100000)
    - 0.35 * debt_to_income
    - 0.25 * credit_utilization
    - 0.10 * (num_late_payments_2yrs / 5)
    + 0.15 * (years_credit_history / 20)
    + 0.10 * (employment_years / 20)
    - 0.05 * (loan_amount_requested / 50000)
)

noise = np.random.normal(0, 0.15, N)
score = score + noise

# Convert to binary label using a threshold (~ balanced-ish classes)
threshold = np.median(score)
creditworthy = (score > threshold).astype(int)

df = pd.DataFrame({
    "annual_income": annual_income.round(2),
    "age": age,
    "total_debt": total_debt.round(2),
    "debt_to_income": debt_to_income.round(4),
    "credit_utilization": credit_utilization.round(4),
    "num_open_accounts": num_open_accounts,
    "num_late_payments_2yrs": num_late_payments_2yrs,
    "years_credit_history": years_credit_history.round(2),
    "loan_amount_requested": loan_amount_requested.round(2),
    "employment_years": employment_years.round(2),
    "creditworthy": creditworthy,
})

out_path = "credit_data.csv"
df.to_csv(out_path, index=False)
print(f"Saved {len(df)} rows to {out_path}")
print(df["creditworthy"].value_counts())

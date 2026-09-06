# CodeAlpha_DiseasePrediction

**CodeAlpha Machine Learning Internship — Task 4: Disease Prediction from Medical Data**

Predicts whether a breast tumor is **benign** or **malignant** from cell-nuclei
measurements taken from a digitized fine-needle aspirate (FNA) image.

## What it does

- Uses the real, public **UCI Breast Cancer Wisconsin (Diagnostic) dataset**
  (569 patient samples, bundled with scikit-learn — no download required).
- Trains and compares 3 classifiers — **Logistic Regression, Random Forest,
  SVM** — evaluated with Precision, Recall, F1-score, and ROC-AUC.
- Automatically selects the best model (Random Forest, ROC-AUC ≈ 0.99) and
  saves it.
- Serves it through a **Flask REST API**.
- A clinical-styled **HTML/CSS/JS frontend** lets you enter the 10 "mean"
  tumor features (or load a real example with one click) and get an instant
  diagnosis with confidence score.

## Project structure

```
CodeAlpha_DiseasePrediction/
├── backend/
│   ├── app.py                  # Flask server + REST API
│   ├── requirements.txt
│   └── model/
│       ├── train_model.py      # Trains & evaluates 3 classifiers
│       ├── disease_model.pkl   # Saved best model (generated)
│       ├── scaler.pkl          # Saved StandardScaler (generated)
│       ├── feature_names.json  # Feature order used by the model
│       ├── metrics.json        # Evaluation metrics (generated)
│       └── examples.json       # Real sample rows for demo buttons
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

## About the dataset

The [UCI Breast Cancer Wisconsin (Diagnostic) dataset](https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic)
is a well-known, real-world medical dataset of 569 samples with 30 features
computed from digitized images of a fine needle aspirate (FNA) of a breast
mass. It's built directly into scikit-learn
(`sklearn.datasets.load_breast_cancer`), so no separate download is needed —
the training script pulls it automatically.

To keep the frontend form short and clinically legible, the app uses the 10
**"mean"** features (radius, texture, perimeter, area, smoothness,
compactness, concavity, concave points, symmetry, fractal dimension) rather
than all 30. This is easily extended to the full feature set if higher
accuracy is needed.

## How to run

```bash
cd backend
pip install -r requirements.txt

# 1. Train the model (only needed once, already included)
python model/train_model.py

# 2. Start the server (serves both the API and the frontend)
python app.py
```

Then open **http://127.0.0.1:5001** in your browser.

## API reference

### `POST /api/predict`

Request body (all 10 "mean" features required):
```json
{
  "mean radius": 14.0,
  "mean texture": 19.0,
  "mean perimeter": 90.0,
  "mean area": 600.0,
  "mean smoothness": 0.095,
  "mean compactness": 0.100,
  "mean concavity": 0.090,
  "mean concave points": 0.050,
  "mean symmetry": 0.180,
  "mean fractal dimension": 0.063
}
```

Response:
```json
{
  "diagnosis": "Benign",
  "is_benign": true,
  "confidence": 0.97,
  "probability_benign": 0.97,
  "probability_malignant": 0.03
}
```

### `GET /api/examples`
Returns one real benign and one real malignant sample row (used by the
"Try an example" buttons on the frontend).

### `GET /api/health`
Simple health check.

## Model performance (on held-out test set)

Random Forest was selected as the best model:

| Metric    | Score |
|-----------|-------|
| Accuracy  | ~0.96 |
| Precision | ~0.97 |
| Recall    | ~0.96 |
| F1-score  | ~0.97 |
| ROC-AUC   | ~0.99 |

(Full breakdown for all 3 models saved in `backend/model/metrics.json`.)

## ⚠️ Disclaimer

This is an **educational internship project**, not a medical device. It must
never be used for actual clinical diagnosis. Always highlight this in your
video/LinkedIn post as good practice when presenting healthcare ML projects.

## Submission checklist (per CodeAlpha instructions)

- [ ] Push this folder to a GitHub repo named `CodeAlpha_DiseasePrediction`
- [ ] Record a short video walking through the code + demo
- [ ] Post on LinkedIn tagging @CodeAlpha with the video + GitHub link
- [ ] Submit via the CodeAlpha submission form

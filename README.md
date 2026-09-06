# 🩺 Disease Prediction System

A Machine Learning based Disease Prediction System that predicts whether a breast tumor is **Benign** or **Malignant** based on tumor measurement features.

## 📌 Overview

This project uses Machine Learning to classify breast tumor samples using 10 numerical features. A Flask REST API connects the trained Machine Learning model with a modern web interface built using HTML, CSS, and JavaScript.

The system provides the predicted diagnosis, confidence score, and probability for both Benign and Malignant classes.

> ⚠️ **Disclaimer:** This project is developed for educational and demonstration purposes only. It is not a medical diagnostic tool and should not replace professional medical advice.

## 🎯 Objectives

- Build a Machine Learning classification model.
- Predict whether a tumor is Benign or Malignant.
- Develop a Flask REST API for predictions.
- Create a responsive and professional web interface.
- Display prediction confidence and class probabilities.
- Demonstrate the practical application of Machine Learning.

## 🚀 Features

- 🧠 Machine Learning based tumor classification
- 🟢 Benign prediction
- 🔴 Malignant prediction
- 📊 Prediction confidence
- 📈 Benign and Malignant probabilities
- 🧪 Benign and Malignant example data
- 🌐 Flask REST API
- 💻 Responsive web interface
- 🔄 Reset functionality
- ⚠️ Error handling
- 📱 Modern medical-themed UI

## 🧠 Input Features

The model uses the following 10 features:

| # | Feature |
|---|---|
| 1 | Mean Radius |
| 2 | Mean Texture |
| 3 | Mean Perimeter |
| 4 | Mean Area |
| 5 | Mean Smoothness |
| 6 | Mean Compactness |
| 7 | Mean Concavity |
| 8 | Mean Concave Points |
| 9 | Mean Symmetry |
| 10 | Mean Fractal Dimension |

## 🏗️ System Architecture

```text
User
  ↓
HTML / CSS / JavaScript
  ↓
Flask REST API
  ↓
Data Preprocessing
  ↓
Feature Scaling
  ↓
Machine Learning Model
  ↓
Prediction
  ↓
Confidence + Probabilities
  ↓
Result Display

📂 Project Structure
CodeAlpha_DiseasePrediction/
│
├── README.md
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   │
│   └── model/
│       ├── disease_model.pkl
│       ├── scaler.pkl
│       ├── feature_names.json
│       ├── examples.json
│       ├── metrics.json
│       └── train_model.py
│
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js

🛠️ Technologies Used
Programming
Python
Machine Learning
Scikit-learn
Pandas
NumPy
Backend
Flask
REST API
Frontend
HTML5
CSS3
JavaScript
Tools
PyCharm
Git
GitHub

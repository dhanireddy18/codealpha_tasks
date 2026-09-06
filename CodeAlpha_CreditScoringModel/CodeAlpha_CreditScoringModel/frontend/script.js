// ============================================
// Credit Scoring Model - Frontend JavaScript
// ============================================
// noinspection ExceptionCaughtLocallyJS

const form = document.getElementById("predictionForm");

const emptyResult = document.getElementById("emptyResult");
const loadingResult = document.getElementById("loadingResult");
const predictionResult = document.getElementById("predictionResult");

const predictButton = document.getElementById("predictButton");
const buttonText = predictButton
    ? predictButton.querySelector(".button-text")
    : null;

const resetButton = document.getElementById("resetButton");

const scoreValue = document.getElementById("scoreValue");
const riskBadge = document.getElementById("riskBadge");
const predictionText = document.getElementById("predictionText");
const riskLevel = document.getElementById("riskLevel");
const recommendation = document.getElementById("recommendation");


// ============================================
// API Endpoint
// ============================================

const API_URL = "/api/predict";


// ============================================
// Helper Functions
// ============================================

function showResultState(state) {
    if (emptyResult) {
        emptyResult.classList.add("hidden");
    }

    if (loadingResult) {
        loadingResult.classList.add("hidden");
    }

    if (predictionResult) {
        predictionResult.classList.add("hidden");
    }

    if (state === "empty" && emptyResult) {
        emptyResult.classList.remove("hidden");
    }

    if (state === "loading" && loadingResult) {
        loadingResult.classList.remove("hidden");
    }

    if (state === "prediction" && predictionResult) {
        predictionResult.classList.remove("hidden");
    }
}


function getInputValue(name) {
    const input = document.getElementById(name);

    if (!input) {
        console.error(`Input not found: ${name}`);
        return 0;
    }

    return parseFloat(input.value);
}


function setButtonLoading(isLoading) {
    if (!predictButton) return;

    predictButton.disabled = isLoading;

    if (isLoading) {
        predictButton.classList.add("loading");

        if (buttonText) {
            buttonText.textContent = "Analyzing...";
        } else {
            predictButton.textContent = "Analyzing...";
        }
    } else {
        predictButton.classList.remove("loading");

        if (buttonText) {
            buttonText.textContent = "Analyze Creditworthiness";
        } else {
            predictButton.textContent = "Analyze Creditworthiness";
        }
    }
}


// ============================================
// Build Backend Payload
// ============================================

function buildPayload() {

    return {
        annual_income: getInputValue("annual_income"),

        age: getInputValue("age"),

        total_debt: getInputValue("total_debt"),

        credit_utilization: getInputValue("credit_utilization"),

        num_open_accounts: getInputValue("num_open_accounts"),

        num_late_payments_2yrs: getInputValue(
            "num_late_payments_2yrs"
        ),

        years_credit_history: getInputValue(
            "years_credit_history"
        ),

        loan_amount_requested: getInputValue(
            "loan_amount_requested"
        ),

        employment_years: getInputValue(
            "employment_years"
        )
    };
}


// ============================================
// Validate Payload
// ============================================

function validatePayload(payload) {

    for (const [key, value] of Object.entries(payload)) {

        if (Number.isNaN(value)) {
            return `${key} is required.`;
        }

        if (!Number.isFinite(value)) {
            return `${key} contains an invalid value.`;
        }
    }

    if (payload.annual_income <= 0) {
        return "Annual income must be greater than 0.";
    }

    if (payload.age < 18 || payload.age > 100) {
        return "Age must be between 18 and 100.";
    }

    if (payload.total_debt < 0) {
        return "Total debt cannot be negative.";
    }

    if (
        payload.credit_utilization < 0 ||
        payload.credit_utilization > 100
    ) {
        return "Credit utilization must be between 0 and 100%.";
    }

    if (payload.num_open_accounts < 0) {
        return "Number of open accounts cannot be negative.";
    }

    if (payload.num_late_payments_2yrs < 0) {
        return "Late payments cannot be negative.";
    }

    if (payload.years_credit_history < 0) {
        return "Credit history cannot be negative.";
    }

    if (payload.loan_amount_requested < 0) {
        return "Loan amount cannot be negative.";
    }

    if (payload.employment_years < 0) {
        return "Employment years cannot be negative.";
    }

    return null;
}


// ============================================
// Risk Badge
// ============================================

function getRiskClass(riskBand) {

    if (!riskBand) {
        return "risk-fair";
    }

    const risk = riskBand.toLowerCase();

    if (risk === "excellent") {
        return "risk-excellent";
    }

    if (risk === "good") {
        return "risk-good";
    }

    if (risk === "fair") {
        return "risk-fair";
    }

    if (risk === "poor") {
        return "risk-poor";
    }

    return "risk-fair";
}


// ============================================
// Recommendation
// ============================================

function getRecommendation(data) {

    if (data.creditworthy === true) {

        if (data.risk_band === "Excellent") {
            return "Strong credit profile. The applicant appears highly creditworthy.";
        }

        if (data.risk_band === "Good") {
            return "The applicant has a good credit profile and is likely to be creditworthy.";
        }

        return "The applicant appears creditworthy, but additional review may be appropriate.";
    }

    return "The applicant may require additional review before credit approval.";
}


// ============================================
// Display Prediction
// ============================================

function renderPrediction(data) {

    console.log("Prediction response:", data);

    // Probability returned by backend is between 0 and 1
    const probability = Number(data.probability) || 0;

    // Convert probability to percentage
    const percentage = Math.round(
        Math.max(0, Math.min(1, probability)) * 100
    );

    // Creditworthiness percentage
    if (scoreValue) {
        scoreValue.textContent = `${percentage}%`;
    }

    // Prediction text
    if (predictionText) {

        predictionText.textContent =
            data.prediction || "Prediction unavailable";

        if (data.creditworthy === true) {
            predictionText.classList.add("positive");
            predictionText.classList.remove("negative");
        } else {
            predictionText.classList.add("negative");
            predictionText.classList.remove("positive");
        }
    }

    // Risk badge
    if (riskBadge) {

        riskBadge.textContent =
            data.risk_band || "Unknown";

        riskBadge.className =
            `risk-badge ${getRiskClass(data.risk_band)}`;
    }

    // Risk level
    if (riskLevel) {
        riskLevel.textContent =
            data.risk_band || "Unknown";
    }

    // Recommendation
    if (recommendation) {
        recommendation.textContent =
            getRecommendation(data);
    }

    // Show prediction
    showResultState("prediction");

    // Scroll to result
    if (predictionResult) {
        setTimeout(() => {
            predictionResult.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }, 100);
    }
}


// ============================================
// Display Error
// ============================================

function showError(message) {

    showResultState("empty");

    alert(`Prediction Error\n\n${message}`);
}


// ============================================
// Form Submit
// ============================================

if (form) {

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        // Browser validation
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Build payload
        const payload = buildPayload();

        console.log("Sending payload:", payload);

        // Validate data
        const validationError = validatePayload(payload);

        if (validationError) {
            showError(validationError);
            return;
        }

        // Loading state
        setButtonLoading(true);
        showResultState("loading");

        try {

            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            });


            // Try to read JSON
            let data;

            try {
                data = await response.json();
            } catch (jsonError) {

                throw new Error(
                    `Server returned an invalid response. HTTP status: ${response.status}`
                );
            }


            // Backend error
            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    `Server error: ${response.status}`
                );
            }


            // Successful prediction
            renderPrediction(data);

        } catch (error) {

            console.error("Prediction error:", error);

            showError(
                error.message ||
                "Unable to connect to the prediction server."
            );

        } finally {

            setButtonLoading(false);
        }
    });
}


// ============================================
// Reset Button
// ============================================

if (resetButton) {

    resetButton.addEventListener("click", function () {

        if (form) {
            form.reset();
        }

        showResultState("empty");

        // Scroll back to form
        if (form) {
            form.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
}


// ============================================
// Initial State
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    showResultState("empty");

    console.log(
        "Credit Scoring Model frontend initialized."
    );

    console.log(
        "Prediction API:",
        API_URL
    );
});
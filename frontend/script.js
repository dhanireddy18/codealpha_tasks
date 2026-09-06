// ============================================================
// MedPredict AI - Disease Prediction Frontend
// Compatible with the existing Flask backend
// ============================================================

const form = document.getElementById("disease-form");
const submitBtn = document.getElementById("submit-btn");

const emptyResult = document.getElementById("emptyResult");
const loadingResult = document.getElementById("loadingResult");
const predictionResult = document.getElementById("predictionResult");
const errorCard = document.getElementById("error");

const diagnosisIcon = document.getElementById("diagnosisIcon");
const diagnosisText = document.getElementById("diagnosisText");
const confidenceText = document.getElementById("confidenceText");
const confidenceValue = document.getElementById("confidenceValue");
const confidenceBar = document.getElementById("confidenceBar");

const benignProbability = document.getElementById("benignProbability");
const malignantProbability = document.getElementById("malignantProbability");

const resultInterpretation = document.getElementById("resultInterpretation");
const interpretationText = document.getElementById("interpretationText");

const resetButton = document.getElementById("resetButton");

const PREDICT_URL = "/api/predict";
const EXAMPLES_URL = "/api/examples";

let cachedExamples = null;


// ============================================================
// Utility Functions
// ============================================================

function showElement(element) {
    if (element) {
        element.classList.remove("hidden");
    }
}

function hideElement(element) {
    if (element) {
        element.classList.add("hidden");
    }
}

function setLoading(isLoading) {
    if (!submitBtn) return;

    submitBtn.disabled = isLoading;

    const buttonText = submitBtn.querySelector(".button-text");

    if (buttonText) {
        buttonText.textContent = isLoading
            ? "Analyzing Sample..."
            : "Run Classification";
    } else {
        submitBtn.textContent = isLoading
            ? "Analyzing Sample..."
            : "Run Classification";
    }
}


// ============================================================
// Load Example Data
// ============================================================

async function loadExamples() {
    if (cachedExamples) {
        return cachedExamples;
    }

    try {
        const response = await fetch(EXAMPLES_URL);

        if (!response.ok) {
            throw new Error("Unable to load example data.");
        }

        cachedExamples = await response.json();

        return cachedExamples;
    } catch (error) {
        console.error("Example loading error:", error);
        throw error;
    }
}


// ============================================================
// Example Buttons
// ============================================================

document.querySelectorAll(".example-btn").forEach((button) => {

    button.addEventListener("click", async () => {

        const exampleType = button.dataset.example;

        try {

            button.disabled = true;

            const examples = await loadExamples();
            const values = examples[exampleType];

            if (!values) {
                throw new Error("Example data not found.");
            }

            // Fill all model inputs
            Object.entries(values).forEach(([featureName, value]) => {

                const input = form.querySelector(
                    `[name="${CSS.escape(featureName)}"]`
                );

                if (input) {
                    input.value = value;
                }
            });

            // Remove previous error
            hideElement(errorCard);

            // Small visual feedback
            form.classList.add("example-loaded");

            setTimeout(() => {
                form.classList.remove("example-loaded");
            }, 700);

            // Scroll to form
            form.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        } catch (error) {

            console.error(error);

            if (errorCard) {
                errorCard.textContent =
                    `Error loading example: ${error.message}`;

                showElement(errorCard);
            }

        } finally {

            button.disabled = false;
        }
    });

});


// ============================================================
// Form Validation
// ============================================================

function validateForm() {

    const inputs = form.querySelectorAll("input");

    for (const input of inputs) {

        if (input.value.trim() === "") {

            input.focus();

            if (errorCard) {
                errorCard.textContent =
                    `Please enter a value for ${getReadableName(input.name)}.`;

                showElement(errorCard);
            }

            return false;
        }

        const value = Number(input.value);

        if (!Number.isFinite(value)) {

            input.focus();

            if (errorCard) {
                errorCard.textContent =
                    `Please enter a valid number for ${getReadableName(input.name)}.`;

                showElement(errorCard);
            }

            return false;
        }

        if (value < 0) {

            input.focus();

            if (errorCard) {
                errorCard.textContent =
                    `${getReadableName(input.name)} cannot be negative.`;

                showElement(errorCard);
            }

            return false;
        }
    }

    return true;
}


// ============================================================
// Convert Model Field Names to Readable Names
// ============================================================

function getReadableName(name) {

    return name
        .replace(/^mean /, "Mean ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, char => char.toUpperCase());
}


// ============================================================
// Build API Payload
// ============================================================

function buildPayload() {

    const formData = new FormData(form);
    const payload = {};

    formData.forEach((value, key) => {

        payload[key] = Number(value);

    });

    return payload;
}


// ============================================================
// Submit Prediction
// ============================================================

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    hideElement(errorCard);
    hideElement(emptyResult);
    hideElement(predictionResult);

    if (!validateForm()) {
        return;
    }

    const payload = buildPayload();

    // Show loading state
    showElement(loadingResult);
    setLoading(true);

    try {

        const response = await fetch(PREDICT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Prediction request failed."
            );
        }

        renderResult(data);

    } catch (error) {

        console.error("Prediction error:", error);

        hideElement(loadingResult);

        if (errorCard) {

            errorCard.textContent =
                `Prediction Error: ${error.message}`;

            showElement(errorCard);

            errorCard.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

    } finally {

        setLoading(false);
    }
});


// ============================================================
// Render Prediction Result
// ============================================================

function renderResult(data) {

    hideElement(loadingResult);
    hideElement(emptyResult);

    showElement(predictionResult);

    const isBenign = Boolean(data.is_benign);

    const confidence = Number(data.confidence);
    const benign = Number(data.probability_benign);
    const malignant = Number(data.probability_malignant);

    const confidencePercent = Math.round(confidence * 100);
    const benignPercent = Math.round(benign * 100);
    const malignantPercent = Math.round(malignant * 100);


    // --------------------------------------------------------
    // Diagnosis
    // --------------------------------------------------------

    if (diagnosisText) {
        diagnosisText.textContent = data.diagnosis;
    }


    // --------------------------------------------------------
    // Diagnosis Icon
    // --------------------------------------------------------

    if (diagnosisIcon) {

        if (isBenign) {

            diagnosisIcon.innerHTML = `
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            `;

        } else {

            diagnosisIcon.innerHTML = `
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            `;
        }
    }


    // --------------------------------------------------------
    // Confidence
    // --------------------------------------------------------

    if (confidenceText) {
        confidenceText.textContent =
            `${confidencePercent}%`;
    }

    if (confidenceValue) {
        confidenceValue.textContent =
            `${confidencePercent}%`;
    }

    if (confidenceBar) {

        confidenceBar.style.width =
            `${confidencePercent}%`;

        confidenceBar.classList.remove(
            "fill-benign",
            "fill-malignant"
        );

        confidenceBar.classList.add(
            isBenign
                ? "fill-benign"
                : "fill-malignant"
        );
    }


    // --------------------------------------------------------
    // Probability Breakdown
    // --------------------------------------------------------

    if (benignProbability) {
        benignProbability.textContent =
            `${benignPercent}%`;
    }

    if (malignantProbability) {
        malignantProbability.textContent =
            `${malignantPercent}%`;
    }


    // --------------------------------------------------------
    // Interpretation
    // --------------------------------------------------------

    if (interpretationText) {

        if (isBenign) {

            interpretationText.textContent =
                "The model classified the provided measurements as likely benign. " +
                "This is a machine-learning prediction and should not be treated " +
                "as a medical diagnosis.";

        } else {

            interpretationText.textContent =
                "The model classified the provided measurements as likely malignant. " +
                "Please consult a qualified healthcare professional for proper " +
                "medical evaluation and confirmation.";

        }
    }


    // --------------------------------------------------------
    // Result Styling
    // --------------------------------------------------------

    if (predictionResult) {

        predictionResult.classList.remove(
            "is-benign",
            "is-malignant"
        );

        predictionResult.classList.add(
            isBenign
                ? "is-benign"
                : "is-malignant"
        );
    }

    if (resultInterpretation) {

        resultInterpretation.classList.remove(
            "is-benign",
            "is-malignant"
        );

        resultInterpretation.classList.add(
            isBenign
                ? "is-benign"
                : "is-malignant"
        );
    }


    // --------------------------------------------------------
    // Scroll to Result
    // --------------------------------------------------------

    setTimeout(() => {

        predictionResult.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }, 150);
}


// ============================================================
// Reset Form
// ============================================================

if (resetButton) {

    resetButton.addEventListener("click", () => {

        form.reset();

        hideElement(errorCard);
        hideElement(predictionResult);
        hideElement(loadingResult);

        showElement(emptyResult);

        // Reset confidence bar
        if (confidenceBar) {
            confidenceBar.style.width = "0%";
        }

        // Reset result classes
        if (predictionResult) {

            predictionResult.classList.remove(
                "is-benign",
                "is-malignant"
            );
        }

        if (resultInterpretation) {

            resultInterpretation.classList.remove(
                "is-benign",
                "is-malignant"
            );
        }

        // Scroll back to form
        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}


// ============================================================
// Input Focus Effects
// ============================================================

document.querySelectorAll(".input-wrapper input").forEach((input) => {

    input.addEventListener("focus", () => {

        input.closest(".input-wrapper")?.classList.add("focused");

    });

    input.addEventListener("blur", () => {

        input.closest(".input-wrapper")?.classList.remove("focused");

    });

});


// ============================================================
// Prevent Invalid Characters
// ============================================================

document.querySelectorAll('input[type="number"]').forEach((input) => {

    input.addEventListener("input", () => {

        if (Number(input.value) < 0) {
            input.value = "";
        }
    });

});


// ============================================================
// Check Backend Health
// ============================================================
// Run health check when page loadscheckBackendHealth().then(r => );

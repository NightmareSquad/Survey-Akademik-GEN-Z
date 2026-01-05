// ============================================
// SCRIPT.JS - FINAL STEP-BY-STEP STABLE
// ============================================

// ================= STATE =================
let currentQuestion = 0;
const TOTAL_QUESTIONS = 10;
let answers = Array(TOTAL_QUESTIONS).fill(0);
let sessionId;
let startTime;

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
    sessionId = typeof generateSessionId === 'function'
        ? generateSessionId()
        : 'sess_' + Date.now();

    startTime = new Date();

    buildSurvey();
    bindNavigation();
    updateUI();
});

// ================= BUILD SURVEY =================
function buildSurvey() {
    const questions = [
        "Dalam lingkungan keluarga, nilai-nilai spiritual dan etika ditekankan sebagai fondasi utama dalam meraih kesuksesan akademik.",
        "Orang tua secara konsisten memberikan afirmasi positif terhadap progres pencapaian kompetensi saya, khususnya pada bidang karakter dan keagamaan.",
        "Orang tua saya memberikan kebebasan bagi saya untuk menentukan cara belajar yang paling nyaman.",
        "Orang tua saya menetapkan aturan yang jelas mengenai ibadah harian saya meskipun saya sudah kuliah.",
        "Orang tua secara konsisten memberikan afirmasi positif terhadap progres pencapaian kompetensi saya, khususnya pada bidang karakter dan keagamaan.",
        "Orang tua menetapkan target akademik.",
        "Orang tua membandingkan saya dengan orang lain.",
        "Orang tua memberi motivasi saat kesulitan.",
        "Orang tua memberi nasihat pendidikan.",
        "Orang tua memberi fasilitas belajar."
    ];

    const options = [
        { value: 1, text: "Sangat Tidak Setuju" },
        { value: 2, text: "Tidak Setuju" },
        { value: 3, text: "Ragu-ragu" },
        { value: 4, text: "Setuju" },
        { value: 5, text: "Sangat Setuju" }
    ];

    const form = document.getElementById('surveyForm');
    form.innerHTML = '';

    questions.forEach((q, i) => {
        const qEl = document.createElement('div');
        qEl.className = 'question-container';
        if (i === 0) qEl.classList.add('active');
        qEl.id = `question-${i}`;

        let optsHTML = '';
        options.forEach(opt => {
            const id = `q${i}_${opt.value}`;
            optsHTML += `
                <div class="option-item">
                    <input
                        type="radio"
                        id="${id}"
                        name="q${i}"
                        value="${opt.value}"
                        class="option-input"
                    >
                    <label for="${id}" class="option-label">
                        ${opt.text}
                    </label>
                </div>
            `;
        });

        qEl.innerHTML = `
            <div class="question-text">${q}</div>
            <div class="options-container">${optsHTML}</div>
        `;

        form.appendChild(qEl);
    });

    bindAnswerEvents();
}

// ================= ANSWER EVENTS =================
function bindAnswerEvents() {
    document.getElementById('surveyForm').addEventListener('change', e => {
        if (!e.target.classList.contains('option-input')) return;

        const qIndex = parseInt(e.target.name.replace('q', ''), 10);
        answers[qIndex] = parseInt(e.target.value, 10);

        updateNavigationButtons();
    });
}

// ================= NAVIGATION =================
function bindNavigation() {
    prevBtn.onclick = () => changeQuestion(-1);
    nextBtn.onclick = () => changeQuestion(1);
    submitBtn.onclick = submitSurvey;
}

function changeQuestion(step) {
    if (step === 1 && answers[currentQuestion] === 0) return;

    document.getElementById(`question-${currentQuestion}`)
        .classList.remove('active');

    currentQuestion += step;

    document.getElementById(`question-${currentQuestion}`)
        .classList.add('active');

    updateUI();
}

// ================= UI =================
function updateUI() {
    const percent = ((currentQuestion + 1) / TOTAL_QUESTIONS) * 100;
    document.querySelector('.progress-fill').style.width = percent + '%';
    document.querySelector('.progress-text').innerText =
        `Pertanyaan ${currentQuestion + 1} dari ${TOTAL_QUESTIONS}`;

    updateNavigationButtons();
}

function updateNavigationButtons() {
    prevBtn.disabled = currentQuestion === 0;
    nextBtn.disabled = answers[currentQuestion] === 0;

    if (currentQuestion === TOTAL_QUESTIONS - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'flex';
        submitBtn.disabled = answers[currentQuestion] === 0;
    } else {
        nextBtn.style.display = 'flex';
        submitBtn.style.display = 'none';
    }
}

// ================= SUBMIT =================
async function submitSurvey() {
    if (answers.includes(0)) {
        alert("Mohon jawab semua pertanyaan.");
        return;
    }

    showLoading(true);

    const payload = {
        sessionId,
        startTime: startTime.toISOString(),
        answers
    };

    if (typeof submitSurveyData === 'function') {
        await submitSurveyData(payload);
    }

    showLoading(false);
    showThankYouPage();
}

// ================= UTIL =================
function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

function showThankYouPage() {
    document.querySelector('.survey-form').style.display = 'none';
    document.querySelector('.progress-container').style.display = 'none';
    document.querySelector('.buttons-container').style.display = 'none';
    thankYouContainer.style.display = 'block';
}


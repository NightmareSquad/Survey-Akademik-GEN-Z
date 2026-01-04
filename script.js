// ============================================
// SCRIPT.JS - FINAL UI STABLE (NO ACAK)
// ============================================

// ================= STATE =================
let currentQuestion = 0;
const TOTAL = 10;
const answers = Array(TOTAL).fill(0);
let sessionId = null;
let startTime = null;

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
    sessionId = typeof generateSessionId === 'function'
        ? generateSessionId()
        : 'sess_' + Date.now();

    startTime = new Date();

    initSurvey();
    bindButtons();
    updateUI();
});

// ================= INIT SURVEY =================
function initSurvey() {
    const questions = [
        "Orang tua saya memberikan dukungan penuh dalam kegiatan akademik saya.",
        "Orang tua saya memberikan kebebasan memilih jurusan.",
        "Orang tua saya menanyakan perkembangan belajar.",
        "Orang tua memberi penghargaan atas prestasi.",
        "Orang tua membatasi pergaulan.",
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
        const qDiv = document.createElement('div');
        qDiv.className = `question-container ${i === 0 ? 'active' : ''}`;
        qDiv.id = `question-${i}`;

        let optHTML = '';
        options.forEach(opt => {
            const id = `q${i}_${opt.value}`;
            optHTML += `
                <div class="option-item">
                    <input
                        type="radio"
                        class="option-input"
                        name="q${i}"
                        id="${id}"
                        value="${opt.value}"
                    >
                    <label for="${id}" class="option-label">
                        ${opt.text}
                    </label>
                </div>
            `;
        });

        qDiv.innerHTML = `
            <div class="question-text">${q}</div>
            <div class="options-container">${optHTML}</div>
        `;

        form.appendChild(qDiv);
    });

    bindOptionEvents();
}

// ================= OPTIONS =================
function bindOptionEvents() {
    document
        .getElementById('surveyForm')
        .addEventListener('change', e => {
            if (!e.target.classList.contains('option-input')) return;

            const qIndex = Number(e.target.name.replace('q', ''));
            answers[qIndex] = Number(e.target.value);

            updateNavigationButtons();
        });
}

// ================= NAVIGATION =================
function bindButtons() {
    document.getElementById('prevBtn').onclick = () => move(-1);
    document.getElementById('nextBtn').onclick = () => move(1);
    document.getElementById('submitBtn').onclick = submitSurvey;
}

function move(step) {
    if (step === 1 && answers[currentQuestion] === 0) return;

    document
        .getElementById(`question-${currentQuestion}`)
        .classList.remove('active');

    currentQuestion += step;

    document
        .getElementById(`question-${currentQuestion}`)
        .classList.add('active');

    updateUI();
}

// ================= UI =================
function updateUI() {
    document.querySelector('.progress-fill').style.width =
        ((currentQuestion + 1) / TOTAL) * 100 + '%';

    document.querySelector('.progress-text').innerText =
        `Pertanyaan ${currentQuestion + 1} dari ${TOTAL}`;

    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    const submit = document.getElementById('submitBtn');

    prev.disabled = currentQuestion === 0;
    next.disabled = answers[currentQuestion] === 0;

    if (currentQuestion === TOTAL - 1) {
        next.style.display = 'none';
        submit.style.display = 'flex';
        submit.disabled = answers[currentQuestion] === 0;
    } else {
        next.style.display = 'flex';
        submit.style.display = 'none';
    }
}

// ================= SUBMIT =================
async function submitSurvey() {
    if (answers.includes(0)) {
        alert('Mohon jawab semua pertanyaan.');
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
    document.getElementById('loadingOverlay').style.display =
        show ? 'flex' : 'none';
}

function showThankYouPage() {
    document.querySelector('.survey-form').style.display = 'none';
    document.querySelector('.progress-container').style.display = 'none';
    document.querySelector('.buttons-container').style.display = 'none';
    document.getElementById('thankYouContainer').style.display = 'block';
}

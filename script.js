// ============================================
// SCRIPT.JS - FINAL FIXED VERSION
// ============================================

// ================= STATE =================
let currentQuestion = 0;
let answers = Array(10).fill(0);
let sessionId = null;
let startTime = null;

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
    console.log("📱 Survey dimulai");

    sessionId = typeof generateSessionId === 'function'
        ? generateSessionId()
        : 'sess_' + Date.now();

    startTime = new Date();

    if (typeof SURVEY_DATA !== 'undefined' && SURVEY_DATA.questions) {
        initWithConfigJS();
    } else {
        initWithLocalData();
    }

    setupButtons();
    updateUI();
});

// ================= INIT SURVEY =================
function initWithConfigJS() {
    const surveyForm = document.getElementById('surveyForm');
    surveyForm.innerHTML = '';

    SURVEY_DATA.questions.forEach((q, i) => {
        const div = document.createElement('div');
        div.className = `question-container ${i === 0 ? 'active' : ''}`;
        div.id = `question-${i}`;

        let options = '';
        SURVEY_DATA.answerOptions.forEach(opt => {
            options += `
            <div class="option-item">
                <input type="radio" id="q${i}-opt${opt.value}" name="q${i}" value="${opt.value}" class="option-input">
                <label for="q${i}-opt${opt.value}" class="option-label" style="border-left-color:${opt.color}">
                    <span class="option-value">${opt.value}</span>
                    <span class="option-text">${opt.text}</span>
                </label>
            </div>`;
        });

        div.innerHTML = `
            <div class="question-header">
                <span class="question-category">${q.category}</span>
                <span class="question-number">Pertanyaan ${i + 1} dari ${SURVEY_DATA.totalQuestions}</span>
            </div>
            <div class="question-text">${q.text}</div>
            <div class="options-container">${options}</div>
        `;
        surveyForm.appendChild(div);
    });

    setupOptionListeners();
}

function initWithLocalData() {
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
        { value: 1, text: "Sangat Tidak Setuju", color: "#e74c3c" },
        { value: 2, text: "Tidak Setuju", color: "#e67e22" },
        { value: 3, text: "Ragu-ragu", color: "#f1c40f" },
        { value: 4, text: "Setuju", color: "#2ecc71" },
        { value: 5, text: "Sangat Setuju", color: "#27ae60" }
    ];

    const surveyForm = document.getElementById('surveyForm');
    surveyForm.innerHTML = '';

    questions.forEach((q, i) => {
        let optHTML = '';
        options.forEach(opt => {
            optHTML += `
            <div class="option-item">
                <input type="radio" id="q${i}-opt${opt.value}" name="q${i}" value="${opt.value}" class="option-input">
                <label for="q${i}-opt${opt.value}" class="option-label">${opt.text}</label>
            </div>`;
        });

        const div = document.createElement('div');
        div.className = `question-container ${i === 0 ? 'active' : ''}`;
        div.id = `question-${i}`;
        div.innerHTML = `<div class="question-text">${q}</div>${optHTML}`;
        surveyForm.appendChild(div);
    });

    setupOptionListeners();
}

// ================= OPTIONS =================
function setupOptionListeners() {
    document.getElementById('surveyForm').addEventListener('change', e => {
        if (!e.target.classList.contains('option-input')) return;

        const qIndex = parseInt(e.target.name.replace('q', ''));
        answers[qIndex] = parseInt(e.target.value);

        updateNavigationButtons();

        
    });
}

// ================= NAVIGATION =================
function setupButtons() {
    document.getElementById('prevBtn').onclick = goToPreviousQuestion;
    document.getElementById('nextBtn').onclick = goToNextQuestion;
    document.getElementById('submitBtn').onclick = submitSurvey;
    document.getElementById('restartBtn').onclick = restartSurvey;
}

function goToPreviousQuestion() {
    if (currentQuestion === 0) return;
    document.getElementById(`question-${currentQuestion}`).classList.remove('active');
    currentQuestion--;
    document.getElementById(`question-${currentQuestion}`).classList.add('active');
    updateUI();
}

function goToNextQuestion() {
    if (answers[currentQuestion] === 0) return;
    if (currentQuestion >= answers.length - 1) return;
    document.getElementById(`question-${currentQuestion}`).classList.remove('active');
    currentQuestion++;
    document.getElementById(`question-${currentQuestion}`).classList.add('active');
    updateUI();
}

// ================= UI =================
function updateUI() {
    updateProgressBar();
    updateNavigationButtons();
}

function updateProgressBar() {
    const percent = ((currentQuestion + 1) / answers.length) * 100;
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent =
        `Pertanyaan ${currentQuestion + 1} dari ${answers.length}`;
}

function updateNavigationButtons() {
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    const submit = document.getElementById('submitBtn');

    prev.disabled = currentQuestion === 0;
    next.disabled = answers[currentQuestion] === 0;

    if (currentQuestion === answers.length - 1 && answers.every(v => v !== 0)) {
        next.style.display = 'none';
        submit.style.display = 'flex';
    } else {
        next.style.display = 'flex';
        submit.style.display = 'none';
    }
}

// ================= SUBMIT =================
async function submitSurvey() {
    if (!answers.every(v => v !== 0)) return;

    showLoading(true);

    const surveyData = {
        sessionId,
        startTime: startTime.toISOString(),
        answers,
        version: typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.0'
    };

    let result = { success: false };

    if (typeof submitSurveyData === 'function') {
        result = await submitSurveyData(surveyData);
    }

    saveToLocalStorage(surveyData);
    showThankYouPage(result);
    showLoading(false);
}

// ================= UTIL =================
function saveToLocalStorage(data) {
    try {
        localStorage.setItem('survey_last_submission', JSON.stringify(data));
    } catch {}
}

function showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}

function showThankYouPage() {
    document.querySelector('.survey-form').style.display = 'none';
    document.querySelector('.progress-container').style.display = 'none';
    document.querySelector('.buttons-container').style.display = 'none';
    document.getElementById('thankYouContainer').style.display = 'block';
}

function restartSurvey() {
    currentQuestion = 0;
    answers = Array(10).fill(0);
    location.reload();
}

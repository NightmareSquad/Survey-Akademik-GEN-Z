// ============================================
// SCRIPT.JS - FINAL FIX (ANTI LOADING + UI FIX)
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

    initWithLocalData();
    setupButtons();
    updateUI();
});

// ================= INIT SURVEY =================
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
        { value: 1, text: "Sangat Tidak Setuju" },
        { value: 2, text: "Tidak Setuju" },
        { value: 3, text: "Ragu-ragu" },
        { value: 4, text: "Setuju" },
        { value: 5, text: "Sangat Setuju" }
    ];

    const surveyForm = document.getElementById('surveyForm');
    surveyForm.innerHTML = '';

    questions.forEach((q, i) => {
        let optHTML = '';
        options.forEach(opt => {
            const optionId = `q${i}_val${opt.value}`;
            optHTML += `
            <div class="option-item">
                <input 
                    type="radio" 
                    name="q${i}" 
                    value="${opt.value}" 
                    id="${optionId}" 
                    class="option-input"
                >
                <label for="${optionId}" class="option-label">
                    ${opt.text}
                </label>
            </div>`;
        });

        const div = document.createElement('div');
        div.className = `question-container ${i === 0 ? 'active' : ''}`;
        div.id = `question-${i}`;
        div.innerHTML = `
            <div class="question-text">${q}</div>
            <div class="options-container">${optHTML}</div>
        `;
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

        // === UI FIX: aktifkan animasi selected ===
        const container = e.target.closest('.options-container');
        if (container) {
            container.querySelectorAll('.option-label')
                .forEach(lbl => lbl.classList.remove('selected'));

            const label = e.target.nextElementSibling;
            if (label) label.classList.add('selected');
        }

        updateNavigationButtons();
    });
}

// ================= NAVIGATION =================
function setupButtons() {
    document.getElementById('prevBtn').onclick = goToPreviousQuestion;
    document.getElementById('nextBtn').onclick = goToNextQuestion;
    document.getElementById('submitBtn').onclick = submitSurvey;
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
    const progressPercent = ((currentQuestion + 1) / answers.length) * 100;
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) progressFill.style.width = `${progressPercent}%`;

    const progressText = document.querySelector('.progress-text');
    if (progressText) {
        progressText.innerText = `Pertanyaan ${currentQuestion + 1} dari ${answers.length}`;
    }

    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    const submit = document.getElementById('submitBtn');

    if (!prev || !next || !submit) return;

    prev.disabled = currentQuestion === 0;
    next.disabled = answers[currentQuestion] === 0;

    if (currentQuestion === answers.length - 1) {
        next.style.display = 'none';
        submit.style.display = 'flex';
        submit.disabled = answers[currentQuestion] === 0;
    } else {
        next.style.display = 'flex';
        submit.style.display = 'none';
    }
}

// ================= SUBMIT =================
function submitSurvey() {
    if (!answers.every(v => v !== 0)) {
        alert("Mohon jawab semua pertanyaan terlebih dahulu.");
        return;
    }

    showLoading(true);

    const surveyData = {
        sessionId,
        startTime: startTime.toISOString(),
        answers
    };

    if (typeof submitSurveyData === 'function') {
        submitSurveyData(surveyData);
    }

    setTimeout(() => {
        showLoading(false);
        showThankYouPage();
    }, 800);
}

// ================= UTIL =================
function showLoading(show) {
    const el = document.getElementById('loadingOverlay');
    if (el) el.style.display = show ? 'flex' : 'none';
}

function showThankYouPage() {
    const surveyForm = document.querySelector('.survey-form');
    const progressCont = document.querySelector('.progress-container');
    const buttonsCont = document.querySelector('.buttons-container');
    const thankYou = document.getElementById('thankYouContainer');

    if (surveyForm) surveyForm.style.display = 'none';
    if (progressCont) progressCont.style.display = 'none';
    if (buttonsCont) buttonsCont.style.display = 'none';
    if (thankYou) thankYou.style.display = 'block';

    console.log("✅ Survey selesai, halaman terima kasih muncul.");
}

// ============================================
// SCRIPT.JS - FINAL STABLE (NO ACAK, NO LOADING)
// ============================================

// ================= STATE =================
let currentQuestion = 0;
let answers = Array(10).fill(0);
let sessionId = null;
let startTime = null;

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
    sessionId = 'sess_' + Date.now();
    startTime = new Date();

    initSurvey();
    setupButtons();
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

        let optionsHTML = '';
        options.forEach(opt => {
            const id = `q${i}_${opt.value}`;
            optionsHTML += `
                <div class="option-item">
                    <input type="radio" id="${id}" name="q${i}" value="${opt.value}" class="option-input">
                    <label for="${id}" class="option-label">${opt.text}</label>
                </div>
            `;
        });

        qDiv.innerHTML = `
            <div class="question-text">${q}</div>
            <div class="options-container">${optionsHTML}</div>
        `;

        form.appendChild(qDiv);
    });

    bindOptionEvents();
}

// ================= OPTIONS =================
function bindOptionEvents() {
    document.getElementById('surveyForm').addEventListener('click', e => {
        if (!e.target.classList.contains('option-label')) return;

        const input = document.getElementById(e.target.getAttribute('for'));
        input.checked = true;

        const qIndex = parseInt(input.name.replace('q', ''));
        answers[qIndex] = parseInt(input.value);

        // RESET visual di soal ini saja
        const container = e.target.closest('.options-container');
        container.querySelectorAll('.option-label')
            .forEach(l => l.classList.remove('selected'));

        e.target.classList.add('selected');

        updateNavigationButtons();
    });
}

// ================= NAVIGATION =================
function setupButtons() {
    prevBtn.onclick = () => move(-1);
    nextBtn.onclick = () => move(1);
    submitBtn.onclick = submitSurvey;
}

function move(step) {
    if (step === 1 && answers[currentQuestion] === 0) return;

    document.getElementById(`question-${currentQuestion}`).classList.remove('active');
    currentQuestion += step;
    document.getElementById(`question-${currentQuestion}`).classList.add('active');

    updateUI();
}

// ================= UI =================
function updateUI() {
    document.querySelector('.progress-fill').style.width =
        ((currentQuestion + 1) / answers.length * 100) + '%';

    document.querySelector('.progress-text').innerText =
        `Pertanyaan ${currentQuestion + 1} dari ${answers.length}`;

    updateNavigationButtons();
}

function updateNavigationButtons() {
    prevBtn.disabled = currentQuestion === 0;
    nextBtn.disabled = answers[currentQuestion] === 0;

    if (currentQuestion === answers.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'flex';
    } else {
        nextBtn.style.display = 'flex';
        submitBtn.style.display = 'none';
    }
}

// ================= SUBMIT =================
function submitSurvey() {
    if (answers.includes(0)) {
        alert("Jawab semua pertanyaan dulu.");
        return;
    }

    showLoading(true);
    setTimeout(() => {
        showLoading(false);
        showThankYouPage();
    }, 700);
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

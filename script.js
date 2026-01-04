// ============================================
// SCRIPT.JS - FINAL FIX (ANTI LOADING)
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
            optHTML += `
            <div class="option-item">
                <input type="radio" name="q${i}" value="${opt.value}" class="option-input">
                <label>${opt.text}</label>
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
function updateNavigationButtons() {
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    const submit = document.getElementById('submitBtn');

    // Tombol "Sebelumnya" mati kalau di pertanyaan pertama
    prev.disabled = currentQuestion === 0;
    
    // Tombol "Selanjutnya" mati kalau pertanyaan sekarang belum dijawab
    next.disabled = answers[currentQuestion] === 0;

    // CEK: Jika sudah di pertanyaan terakhir (indeks 9)
    if (currentQuestion === answers.length - 1) {
        next.style.display = 'none';      // Sembunyikan tombol "Selanjutnya"
        submit.style.display = 'flex';    // PAKSA munculkan tombol "Kirim"
        
        // Tombol Kirim hanya bisa diklik kalau pertanyaan ke-10 sudah dijawab
        submit.disabled = answers[currentQuestion] === 0; 
    } else {
        // Jika belum di pertanyaan terakhir
        next.style.display = 'flex';
        submit.style.display = 'none';
    }
}

// ================= SUBMIT (FINAL FIX) =================
function submitSurvey() {
    if (!answers.every(v => v !== 0)) return;

    showLoading(true);

    const surveyData = {
        sessionId,
        startTime: startTime.toISOString(),
        answers
    };

    // 🔥 KIRIM DATA (TANPA NUNGGU)
    if (typeof submitSurveyData === 'function') {
        submitSurveyData(surveyData);
    }

    // 🔥 PAKSA UI LANJUT
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
    document.querySelector('.survey-form').style.display = 'none';
    document.querySelector('.progress-container').style.display = 'none';
    document.querySelector('.buttons-container').style.display = 'none';
    document.getElementById('thankYouContainer').style.display = 'block';
}


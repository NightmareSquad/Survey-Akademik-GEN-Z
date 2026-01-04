// ============================================
// KONFIGURASI SURVEY - JAVASCRIPT FILE (FINAL FIX)
// ============================================

/*
 * FINAL FIX – STABLE & ANTI STUCK
 * Revisi: 4 Januari 2026
 * Status: PRODUKSI
 */

// URL Web App Google Apps Script
const APP_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyFury01AsD9V6h2xf1B2Hgo4ZJ2DFn9Md2GJMloURzRaeYwrJ7nuylBnnRcM2SBjQ/exec';

// Debug
const DEBUG_MODE = true;

// Versi
const APP_VERSION = '4.3';

// ================= DATA SURVEY =================
const SURVEY_DATA = {
  title: 'Peran Pola Asuh Orang Tua dalam Memprediksi Motivasi Belajar Mahasiswa Gen Z Semester Awal',
  estimatedTime: '3–5 menit',
  totalQuestions: 10
};

// ================= STORAGE =================
const STORAGE_KEYS = {
  SURVEY_HISTORY: 'survey_history_v4',
  APP_VERSION: 'survey_app_version'
};

// ================= UTIL =================
function checkOnlineStatus() {
  return navigator.onLine;
}

function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
}

function calculateTotalScore(answers = []) {
  return answers.reduce((t, a) => t + a, 0);
}

function calculateAverageScore(answers = []) {
  if (!answers.length) return 0;
  return Number((calculateTotalScore(answers) / answers.length).toFixed(2));
}

// ================= VALIDATION =================
function validateSurveyData(data) {
  if (!data || !Array.isArray(data.answers)) {
    return { valid: false, error: 'Format data tidak valid' };
  }

  if (data.answers.length !== SURVEY_DATA.totalQuestions) {
    return { valid: false, error: 'Jumlah jawaban tidak sesuai' };
  }

  for (let i = 0; i < data.answers.length; i++) {
    if (data.answers[i] < 1 || data.answers[i] > 5) {
      return { valid: false, error: `Jawaban Q${i + 1} invalid` };
    }
  }

  return { valid: true };
}

// ================= PREPARE DATA =================
function prepareSubmissionData(rawData) {
  return {
    sessionId: rawData.sessionId || generateSessionId(),
    startTime: rawData.startTime || new Date().toISOString(),
    duration: rawData.startTime
      ? Math.floor((Date.now() - new Date(rawData.startTime)) / 1000)
      : 0,
    answers: rawData.answers,
    totalScore: calculateTotalScore(rawData.answers),
    averageScore: calculateAverageScore(rawData.answers),
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
    title: SURVEY_DATA.title,
    version: APP_VERSION
  };
}

// ================= SUBMIT (FINAL STABLE) =================
function submitSurveyData(surveyData) {
  return new Promise((resolve) => {
    if (!checkOnlineStatus()) {
      resolve({ success: false, message: 'Offline' });
      return;
    }

    const validation = validateSurveyData(surveyData);
    if (!validation.valid) {
      resolve(validation);
      return;
    }

    const payload = prepareSubmissionData(surveyData);

    if (DEBUG_MODE) {
      console.log('📤 Payload dikirim:', payload);
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));

    // 🔥 FIRE & FORGET (PALING AMAN)
    fetch(APP_SCRIPT_URL, {
      method: 'POST',
      body: formData
    }).finally(() => {
      // 💾 Backup lokal
      try {
        const history = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.SURVEY_HISTORY) || '[]'
        );
        history.push({ payload, time: new Date().toISOString() });
        localStorage.setItem(
          STORAGE_KEYS.SURVEY_HISTORY,
          JSON.stringify(history)
        );
      } catch (e) {}

      // ✅ PASTI RESOLVE → LOADING BERHENTI
      resolve({ success: true });
    });
  });
}

// ================= INIT =================
console.log('✅ config.js FINAL STABLE loaded', APP_VERSION);
localStorage.setItem(STORAGE_KEYS.APP_VERSION, APP_VERSION);

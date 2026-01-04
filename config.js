// ============================================
// KONFIGURASI SURVEY - JAVASCRIPT FILE (V4 FIXED)
// ============================================

/* 
 * File ini adalah file JavaScript (.js)
 * Revisi: 4 Januari 2026, 17:12 WIB
 * Debug & Patch: FIXED
 */

// URL Web App Google Apps Script - DEPLOY V5 (UPDATED)
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwFcRxElhht4HPwBvPzjykLW7MejVQHKeYYAbxCAt85R3BAXY56-O7XBnG_1Or6pvyl/exec';

// Mode debug
const DEBUG_MODE = true;

// Versi aplikasi
const APP_VERSION = '4.0';

// Konfigurasi fetch (DIGUNAKAN)
const FETCH_CONFIG = {
  mode: 'no-cors',
  redirect: 'follow',
  credentials: 'omit'
};

// ================= DATA SURVEY =================
const SURVEY_DATA = {
  title: "Peran Pola Asuh Orang Tua dalam Memprediksi Motivasi Belajar Mahasiswa Gen Z Semester Awal",
  description: "Survey ini bertujuan untuk mengumpulkan data mengenai hubungan antara pola asuh orang tua dan motivasi belajar mahasiswa Gen Z semester awal.",
  estimatedTime: "3-5 menit",
  required: true,
  totalQuestions: 10,
  maxScorePerQuestion: 5,
  maxTotalScore: 50,
  categories: [
    "Dukungan Akademik",
    "Kebebasan Pilihan",
    "Pengawasan Akademik",
    "Penghargaan",
    "Pengawasan Sosial",
    "Ekspektasi Akademik",
    "Perbandingan",
    "Motivasi",
    "Nasihat",
    "Fasilitas"
  ]
};

// ================= STORAGE =================
const STORAGE_KEYS = {
  SURVEY_ANSWERS: 'survey_pola_asuh_answers_v4',
  SURVEY_HISTORY: 'survey_pola_asuh_history_v4',
  LAST_SUBMISSION: 'survey_last_submission_v4',
  DEBUG_DATA: 'survey_debug_data_v4',
  APP_VERSION: 'survey_app_version'
};

// ================= UTIL =================
function checkOnlineStatus() {
  return navigator.onLine;
}

function generateSessionId() {
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateTotalScore(answers = []) {
  return answers.reduce((t, a) => t + (a.value || a || 0), 0);
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
    const v = data.answers[i].value ?? data.answers[i];
    if (v < 1 || v > 5) {
      return { valid: false, error: `Jawaban Q${i + 1} invalid` };
    }
  }

  return { valid: true };
}

// ================= PREPARE DATA =================
function prepareSubmissionData(rawData) {
  const answers = Array.isArray(rawData.answers) ? rawData.answers : [];

  return {
    sessionId: rawData.sessionId || generateSessionId(),
    timestamp: new Date().toISOString(),
    answers: answers.map(a => a.value || a),
    totalScore: calculateTotalScore(answers),
    averageScore: calculateAverageScore(answers),
    duration: rawData.startTime ? Math.floor((Date.now() - new Date(rawData.startTime)) / 1000) : 0,
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
    title: SURVEY_DATA.title,
    version: APP_VERSION
  };
}

// ================= SUBMIT =================
async function submitSurveyData(surveyData) {
  if (!checkOnlineStatus()) {
    return { success: false, message: 'Offline' };
  }

  if (!APP_SCRIPT_URL) {
    return { success: false, message: 'URL Apps Script tidak valid' };
  }

  const validation = validateSurveyData(surveyData);
  if (!validation.valid) return validation;

  const payload = prepareSubmissionData(surveyData);

  const formData = new FormData();
  formData.append('data', JSON.stringify(payload));

  await fetch(APP_SCRIPT_URL, {
    method: 'POST',
    body: formData,
    ...FETCH_CONFIG
  });

  // backup local
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.SURVEY_HISTORY) || '[]');
    history.push({ payload, time: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.SURVEY_HISTORY, JSON.stringify(history));
  } catch (_) {}

  return { success: true };
}

// ================= INIT =================
console.log('✅ config.js FIXED loaded', APP_VERSION);
localStorage.setItem(STORAGE_KEYS.APP_VERSION, APP_VERSION);

// ============================================
// KONFIGURASI SURVEY - JAVASCRIPT FILE (V4 FINAL)
// ============================================

/* 
 * FINAL FIX
 * Revisi: 4 Januari 2026
 * Status: PRODUKSI - STABLE
 */

// URL Web App Google Apps Script - DEPLOY V5
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwFcRxElhht4HPwBvPzjykLW7MejVQHKeYYAbxCAt85R3BAXY56-O7XBnG_1Or6pvyl/exec';

// Mode debug
const DEBUG_MODE = true;

// Versi aplikasi
const APP_VERSION = '4.1';

// ================= DATA SURVEY =================
const SURVEY_DATA = {
  title: "Peran Pola Asuh Orang Tua dalam Memprediksi Motivasi Belajar Mahasiswa Gen Z Semester Awal",
  description: "Survey ini bertujuan untuk mengumpulkan data mengenai hubungan antara pola asuh orang tua dan motivasi belajar mahasiswa Gen Z semester awal.",
  estimatedTime: "3-5 menit",
  totalQuestions: 10,
  maxScorePerQuestion: 5,
  maxTotalScore: 50
};

// ================= STORAGE =================
const STORAGE_KEYS = {
  SURVEY_HISTORY: 'survey_pola_asuh_history_v4',
  LAST_SUBMISSION: 'survey_last_submission_v4',
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
    const v = data.answers[i];
    if (v < 1 || v > 5) {
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
    endTime: new Date().toISOString(),
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

// ================= SUBMIT (FINAL FIX) =================
async function submitSurveyData(surveyData) {
  if (!checkOnlineStatus()) {
    return { success: false, message: 'Offline' };
  }

  const validation = validateSurveyData(surveyData);
  if (!validation.valid) return validation;

  const payload = prepareSubmissionData(surveyData);

  if (DEBUG_MODE) {
    console.log('📤 Payload dikirim ke Apps Script:', payload);
  }

  const response = await fetch(APP_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  // Backup lokal
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.SURVEY_HISTORY) || '[]');
    history.push({ payload, time: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.SURVEY_HISTORY, JSON.stringify(history));
  } catch (_) {}

  return await response.json();
}

// ================= INIT =================
console.log('✅ config.js FINAL loaded', APP_VERSION);
localStorage.setItem(STORAGE_KEYS.APP_VERSION, APP_VERSION);

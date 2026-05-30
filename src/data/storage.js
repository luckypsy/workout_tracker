const SESSIONS_KEY = 'wt_sessions';
const CURRENT_KEY = 'wt_current_session';
const SETTINGS_KEY = 'wt_settings';
const PR_KEY = 'wt_prs';

export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
  } catch { return []; }
}

export function saveSession(session) {
  const sessions = getSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) sessions[idx] = session;
  else sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getSessionById(id) {
  return getSessions().find(s => s.id === id) || null;
}

export function getLastSessionByKey(sessionKey) {
  const sessions = getSessions();
  const matching = sessions.filter(s => s.session_key === sessionKey && s.completed);
  if (!matching.length) return null;
  return matching.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}

export function getCurrentSession() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null');
  } catch { return null; }
}

export function setCurrentSession(key) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(key));
}

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch { return {}; }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getPRs() {
  try {
    return JSON.parse(localStorage.getItem(PR_KEY) || '{}');
  } catch { return {}; }
}

export function savePRs(prs) {
  localStorage.setItem(PR_KEY, JSON.stringify(prs));
}

export function checkAndUpdatePR(exerciseName, weight, reps, date) {
  const prs = getPRs();
  const key = exerciseName;
  const volume = weight * reps;
  const current = prs[key];
  if (!current || volume > current.volume) {
    prs[key] = { weight, reps, volume, date };
    savePRs(prs);
    return true;
  }
  return false;
}

import React, { useState } from 'react';
import { SESSION_ORDER } from '../data/workoutConfig';
import { getCurrentSession, setCurrentSession, getSettings, saveSettings } from '../data/storage';

export default function SettingsTab({ darkMode, setDarkMode }) {
  const [currentSession, setCS] = useState(() => getCurrentSession() || '1-1');
  const [sound, setSound] = useState(() => getSettings().soundEnabled !== false);
  const [resetDone, setResetDone] = useState(false);

  function toggleSound(v) {
    setSound(v);
    saveSettings({ ...getSettings(), soundEnabled: v });
  }

  function handleReset(key) {
    setCurrentSession(key);
    setCS(key);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2000);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">설정</div>
      </div>

      <div className="card">
        <div style={{fontWeight:700, marginBottom:12}}>앱 설정</div>
        <div className="toggle-row">
          <span>다크 모드</span>
          <label className="toggle">
            <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>
        <div className="toggle-row">
          <span>알림음</span>
          <label className="toggle">
            <input type="checkbox" checked={sound} onChange={e => toggleSound(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <div className="card">
        <div style={{fontWeight:700, marginBottom:8}}>현재 세션</div>
        <div style={{color:'var(--accent)', fontSize:18, fontWeight:800, marginBottom:12}}>{currentSession}</div>
        <div style={{fontWeight:600, marginBottom:8, fontSize:14}}>세션 초기화 (부상/휴식 후 재시작)</div>
        <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {SESSION_ORDER.map(key => (
            <button
              key={key}
              className={`btn ${currentSession === key ? 'btn-primary' : 'btn-ghost'}`}
              style={{padding:'8px 14px', fontSize:13}}
              onClick={() => handleReset(key)}
            >
              {key}
            </button>
          ))}
        </div>
        {resetDone && (
          <div style={{marginTop:10, color:'var(--green)', fontSize:13, fontWeight:600}}>
            ✓ {currentSession}으로 설정되었습니다
          </div>
        )}
      </div>

      <div className="card" style={{fontSize:13, color:'var(--text2)'}}>
        <div style={{fontWeight:700, color:'var(--text)', marginBottom:8}}>앱 정보</div>
        <div>버전 1.0.0</div>
        <div style={{marginTop:4}}>모든 데이터는 기기에 로컬로 저장됩니다.</div>
        <div style={{marginTop:4}}>운동 사이클: 1-1 → 1-2 → ... → 2-5 → 1-1 반복</div>
      </div>
    </div>
  );
}

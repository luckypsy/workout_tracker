import React, { useState, useEffect, useCallback } from 'react';
import { SESSION_CONFIG, getNextSession } from '../data/workoutConfig';
import { getCurrentSession, setCurrentSession, saveSession, getLastSessionByKey, checkAndUpdatePR } from '../data/storage';
import { buildNewSession } from '../data/sessionBuilder';
import RestTimer from './RestTimer';
import RunningTimer from './RunningTimer';

const DEFAULT_SESSION = '1-1';

function formatDate(d) {
  const date = new Date(d);
  return `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')}`;
}

function getPrevSummary(sessionKey, exerciseName) {
  const prev = getLastSessionByKey(sessionKey);
  if (!prev) return null;
  const ex = prev.exercises?.find(e => e.name === exerciseName);
  if (!ex) return null;
  const mainSets = ex.sets.filter(s => s.set_type === 'main' && s.is_completed);
  if (!mainSets.length) return null;
  const first = mainSets[0];
  const weightStr = first.target_weight ? `${first.target_weight}kg × ` : '';
  return `이전 ${sessionKey} (${formatDate(prev.date)}) | ${exerciseName} 본세트 ${weightStr}${first.actual_reps ?? first.target_reps}개`;
}

export default function TodayTab() {
  const [sessionKey, setSessionKey] = useState(() => getCurrentSession() || DEFAULT_SESSION);
  const [session, setSession] = useState(null);
  const [timer, setTimer] = useState(null);
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => {
    const built = buildNewSession(sessionKey);
    setSession(built);
    setSessionDone(false);
  }, [sessionKey]);

  const updateSet = useCallback((exIdx, setIdx, field, value) => {
    setSession(prev => {
      const next = { ...prev };
      next.exercises = prev.exercises.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, si) => {
            if (si !== setIdx) return s;
            return { ...s, [field]: value };
          }),
        };
      });
      return next;
    });
  }, []);

  const completeSet = useCallback((exIdx, setIdx) => {
    setSession(prev => {
      const next = { ...prev };
      const ex = next.exercises[exIdx];
      const set = ex.sets[setIdx];
      const reps = set.actual_reps ?? set.target_reps;
      const weight = set.target_weight ?? 0;

      let isPR = false;
      if (set.set_type === 'main' && weight > 0 && reps) {
        isPR = checkAndUpdatePR(ex.name, weight, reps, next.date);
      }

      next.exercises = prev.exercises.map((e, ei) => {
        if (ei !== exIdx) return e;
        return {
          ...e,
          sets: e.sets.map((s, si) => {
            if (si !== setIdx) return s;
            if (s.set_type === 'cooldown' && !s.target_weight) {
              const mainSets = e.sets.filter(ms => ms.set_type === 'main');
              const mainWeight = mainSets[0]?.target_weight ?? 0;
              return { ...s, is_completed: true, is_pr: isPR, target_weight: Math.round(mainWeight * 0.5 / 2.5) * 2.5 || null };
            }
            return { ...s, is_completed: true, is_pr: isPR };
          }),
        };
      });

      saveSession(next);

      const config = SESSION_CONFIG[next.session_key];
      const restSecs = config.restSeconds;
      if (restSecs > 0) {
        setTimer(restSecs);
      }

      return next;
    });
  }, []);

  function completeSession() {
    if (!session) return;
    const done = { ...session, completed: true };
    saveSession(done);
    const next = getNextSession(sessionKey);
    setCurrentSession(next);
    setSessionDone(true);
  }

  function startNextSession() {
    const next = getNextSession(sessionKey);
    setSessionKey(next);
  }

  if (!session) return <div className="page"><p>로딩 중...</p></div>;

  const config = SESSION_CONFIG[sessionKey];

  if (config.type === 'running') {
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-title">{sessionKey} {config.name}</div>
        </div>
        {sessionDone ? (
          <div className="session-banner">
            <h3>완료! 🎉</h3>
            <p>다음 세션: {getNextSession(sessionKey)}</p>
            <button className="btn btn-primary btn-full" style={{marginTop:12}} onClick={startNextSession}>
              다음 세션 시작
            </button>
          </div>
        ) : (
          <RunningTimer
            onComplete={() => { completeSession(); setSessionDone(true); }}
            memo={session.memo}
            onMemoChange={v => setSession(s => ({ ...s, memo: v }))}
          />
        )}
      </div>
    );
  }

  const allCompleted = session.exercises.every(ex => ex.sets.every(s => s.is_completed));

  return (
    <div className="page">
      {timer && <RestTimer seconds={timer} onDone={() => setTimer(null)} />}
      <div className="page-header">
        <div className="page-title">{sessionKey} {config.name}</div>
        <div className="page-subtitle">{session.date}</div>
      </div>

      {sessionDone && (
        <div className="session-banner">
          <h3>세션 완료! 🎉</h3>
          <p>다음 세션: {getNextSession(sessionKey)}</p>
          <button className="btn btn-primary btn-full" style={{marginTop:12}} onClick={startNextSession}>
            다음 세션 시작
          </button>
        </div>
      )}

      {session.exercises.map((ex, exIdx) => {
        const prevSummary = getPrevSummary(sessionKey, ex.name);
        return (
          <div key={ex.name} className="card exercise-block">
            <div className="exercise-name">{ex.name}</div>
            {prevSummary && <div className="prev-record">{prevSummary}</div>}
            {ex.sets.map((set, setIdx) => (
              <SetRow
                key={setIdx}
                set={set}
                onChange={(field, val) => updateSet(exIdx, setIdx, field, val)}
                onComplete={() => completeSet(exIdx, setIdx)}
              />
            ))}
          </div>
        );
      })}

      <div className="card">
        <div style={{marginBottom:8, fontWeight:600}}>메모</div>
        <textarea
          placeholder="오늘 운동 메모..."
          value={session.memo}
          onChange={e => setSession(s => { const n = {...s, memo: e.target.value}; saveSession(n); return n; })}
        />
      </div>

      {!sessionDone && (
        <button
          className={`btn btn-full ${allCompleted ? 'btn-success' : 'btn-ghost'}`}
          style={{marginBottom: 16}}
          onClick={completeSession}
        >
          {allCompleted ? '세션 완료 ✓' : '세션 완료 (미완료 세트 있음)'}
        </button>
      )}
    </div>
  );
}

function SetRow({ set, onChange, onComplete }) {
  const labelClass = set.set_type === 'warmup' ? 'warmup' : set.set_type === 'cooldown' ? 'cooldown' : 'main';
  const labelText = set.set_type === 'warmup' ? '워밍업' : set.set_type === 'cooldown' ? '쿨다운' : `본 ${set.set_number}`;

  return (
    <div className={`set-row ${set.is_completed ? 'completed' : ''}`}>
      <span className={`set-label ${labelClass}`}>{labelText}</span>
      <div className="set-fields">
        {!set.weightless && (
          <>
            <input
              type="number"
              placeholder="kg"
              value={set.target_weight ?? ''}
              onChange={e => onChange('target_weight', e.target.value ? Number(e.target.value) : null)}
              min="0"
              step="2.5"
              style={{width:56}}
            />
            <span className="set-x">kg</span>
          </>
        )}
        <input
          type="number"
          placeholder="목표"
          value={set.target_reps ?? ''}
          onChange={e => onChange('target_reps', e.target.value ? Number(e.target.value) : null)}
          min="1"
          style={{width:52}}
        />
        <span className="set-x">→</span>
        <input
          type="number"
          placeholder="실제"
          value={set.actual_reps ?? ''}
          onChange={e => onChange('actual_reps', e.target.value ? Number(e.target.value) : null)}
          min="0"
          style={{width:52}}
        />
      </div>
      {set.is_pr && <span className="pr-badge">🏆</span>}
      <button
        className={`check-btn ${set.is_completed ? 'done' : ''}`}
        onClick={onComplete}
        disabled={set.is_completed}
      >
        {set.is_completed ? '✓' : '○'}
      </button>
    </div>
  );
}

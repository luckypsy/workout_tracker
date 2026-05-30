import React, { useState, useEffect, useRef } from 'react';

const TOTAL = 40 * 60;

export default function RunningTimer({ onComplete, memo, onMemoChange }) {
  const [remaining, setRemaining] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const audioCtx = useRef(null);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const t = setTimeout(() => {
      if (remaining === 1) {
        playBeep();
        if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);
        setDone(true);
        setRunning(false);
        onComplete?.();
      }
      setRemaining(r => r - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [running, remaining, onComplete]);

  function playBeep() {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current;
      [0, 0.6, 1.2].forEach(offset => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 660;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.4);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.4);
      });
    } catch {}
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const progress = ((TOTAL - remaining) / TOTAL) * 100;

  return (
    <div>
      <div className="running-timer">
        {done
          ? <div className="running-time" style={{color:'var(--green)'}}>완료! 🎉</div>
          : <div className="running-time">{display}</div>
        }
        <div style={{width:'100%',height:8,background:'var(--surface2)',borderRadius:4,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${progress}%`,background:'var(--accent)',borderRadius:4,transition:'width 1s linear'}} />
        </div>
        <div className="running-controls">
          {!done && (
            <>
              <button className="btn btn-primary" onClick={() => setRunning(r => !r)}>
                {running ? '일시정지' : (remaining === TOTAL ? '시작' : '재개')}
              </button>
              <button className="btn btn-ghost" onClick={() => { setRunning(false); setRemaining(TOTAL); }}>
                초기화
              </button>
            </>
          )}
        </div>
      </div>
      <div className="card">
        <div style={{marginBottom:8, fontWeight:600}}>메모</div>
        <textarea
          placeholder="오늘 러닝 메모..."
          value={memo}
          onChange={e => onMemoChange(e.target.value)}
        />
      </div>
    </div>
  );
}

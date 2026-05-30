import React, { useState, useEffect, useRef } from 'react';

export default function RestTimer({ seconds, onDone }) {
  const [remaining, setRemaining] = useState(seconds);
  const audioCtx = useRef(null);

  useEffect(() => {
    if (remaining <= 0) {
      playBeep();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      onDone();
      return;
    }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onDone]);

  function playBeep() {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${mins}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="timer-overlay">
      <div className="timer-label">휴식 중</div>
      <div className="timer-display">{display}</div>
      <button className="timer-skip" onClick={onDone}>건너뛰기</button>
    </div>
  );
}

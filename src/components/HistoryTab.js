import React, { useState } from 'react';
import { getSessions } from '../data/storage';
import { SESSION_CONFIG } from '../data/workoutConfig';

function formatDate(d) {
  const date = new Date(d);
  return `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`;
}

export default function HistoryTab() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const sessions = getSessions()
    .filter(s => s.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const now = new Date();
  const filtered = sessions.filter(s => {
    const d = new Date(s.date);
    if (filter === 'month') return now - d <= 30 * 86400000;
    if (filter === '3month') return now - d <= 90 * 86400000;
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">히스토리</div>
      </div>
      <div className="filter-bar">
        {[['month','이번 달'],['3month','최근 3개월'],['all','전체']].map(([k,l]) => (
          <button key={k} className={`filter-btn ${filter===k?'active':''}`} onClick={()=>setFilter(k)}>{l}</button>
        ))}
      </div>
      {filtered.length === 0 && <div style={{color:'var(--text2)',textAlign:'center',marginTop:40}}>기록이 없습니다</div>}
      {filtered.map(s => {
        const config = SESSION_CONFIG[s.session_key];
        return (
          <div key={s.id} className="history-item" onClick={() => setSelected(s)}>
            <div className="history-date">{formatDate(s.date)}</div>
            <div className="history-title">{s.session_key} {config?.name}</div>
            {s.memo && <div className="history-memo">{s.memo}</div>}
          </div>
        );
      })}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{fontWeight:700, fontSize:18, marginBottom:4}}>
              {selected.session_key} {SESSION_CONFIG[selected.session_key]?.name}
            </div>
            <div style={{color:'var(--text2)', fontSize:13, marginBottom:16}}>{formatDate(selected.date)}</div>

            {selected.exercises?.map(ex => (
              <div key={ex.name} style={{marginBottom:16}}>
                <div style={{fontWeight:700, marginBottom:6}}>{ex.name}</div>
                {ex.sets.map((s,i) => (
                  <div key={i} style={{display:'flex',gap:8,alignItems:'center',padding:'4px 0',borderBottom:'1px solid var(--border)'}}>
                    <span className={`set-label ${s.set_type === 'warmup' ? 'warmup' : s.set_type === 'cooldown' ? 'cooldown' : 'main'}`}>
                      {s.set_type === 'warmup' ? '워밍업' : s.set_type === 'cooldown' ? '쿨다운' : `본 ${s.set_number}`}
                    </span>
                    <span style={{fontSize:14}}>
                      {s.target_weight ? `${s.target_weight}kg × ` : ''}
                      {s.actual_reps ?? s.target_reps ?? '-'}개
                    </span>
                    {s.is_pr && <span>🏆</span>}
                    {s.is_completed && <span style={{color:'var(--green)'}}>✓</span>}
                  </div>
                ))}
              </div>
            ))}

            {selected.memo && (
              <div style={{marginTop:12, padding:10, background:'var(--surface2)', borderRadius:8, fontSize:14}}>
                {selected.memo}
              </div>
            )}
            <button className="btn btn-ghost btn-full" style={{marginTop:16}} onClick={() => setSelected(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { getSessions } from '../data/storage';
import { SESSION_CONFIG } from '../data/workoutConfig';

const ALL_EXERCISES = [...new Set(
  Object.values(SESSION_CONFIG).flatMap(c => c.exercises.map(e => e.name))
)];

function formatDate(d) {
  const date = new Date(d);
  return `${date.getMonth()+1}/${date.getDate()}`;
}

export default function GraphTab() {
  const [exercise, setExercise] = useState(ALL_EXERCISES[0]);
  const [period, setPeriod] = useState('all');

  const sessions = getSessions().filter(s => s.completed).sort((a,b) => new Date(a.date) - new Date(b.date));

  const data = useMemo(() => {
    const cutoff = new Date();
    return sessions
      .filter(s => {
        const d = new Date(s.date);
        if (period === '1month') return cutoff - d <= 30 * 86400000;
        if (period === '3month') return cutoff - d <= 90 * 86400000;
        return true;
      })
      .flatMap(s => {
        const ex = s.exercises?.find(e => e.name === exercise);
        if (!ex) return [];
        const mainSets = ex.sets.filter(st => st.set_type === 'main' && st.is_completed && st.target_weight);
        if (!mainSets.length) return [];
        const maxWeight = Math.max(...mainSets.map(st => st.target_weight));
        const isPR = mainSets.some(st => st.is_pr);
        return [{ date: s.date, label: formatDate(s.date), weight: maxWeight, isPR }];
      });
  }, [sessions, exercise, period]);

  const prPoints = data.filter(d => d.isPR);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">그래프</div>
      </div>
      <select className="exercise-select" value={exercise} onChange={e => setExercise(e.target.value)}>
        {ALL_EXERCISES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
      </select>
      <div className="filter-bar">
        {[['1month','1개월'],['3month','3개월'],['all','전체']].map(([k,l]) => (
          <button key={k} className={`filter-btn ${period===k?'active':''}`} onClick={()=>setPeriod(k)}>{l}</button>
        ))}
      </div>

      {data.length === 0
        ? <div style={{color:'var(--text2)',textAlign:'center',marginTop:60}}>기록이 없습니다</div>
        : (
          <div className="card" style={{padding:'12px 0'}}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data} margin={{top:10,right:16,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{fontSize:11, fill:'var(--text2)'}} />
                <YAxis tick={{fontSize:11, fill:'var(--text2)'}} unit="kg" width={48} />
                <Tooltip
                  contentStyle={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8}}
                  labelStyle={{color:'var(--text2)'}}
                  formatter={v => [`${v}kg`, '무게']}
                />
                <Line type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={2} dot={{r:3}} activeDot={{r:5}} />
                {prPoints.map((pt, i) => (
                  <ReferenceDot key={i} x={pt.label} y={pt.weight} r={7} fill="var(--yellow)" stroke="none" label={{value:'🏆', position:'top', fontSize:14}} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )
      }

      {data.length > 0 && (
        <div className="card">
          <div style={{fontWeight:700, marginBottom:8}}>PR 기록</div>
          {prPoints.length === 0
            ? <div style={{color:'var(--text2)', fontSize:13}}>PR 없음</div>
            : prPoints.map((pt, i) => (
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--border)', fontSize:14}}>
                <span>🏆 {pt.weight}kg</span>
                <span style={{color:'var(--text2)'}}>{formatDate(pt.date)}</span>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

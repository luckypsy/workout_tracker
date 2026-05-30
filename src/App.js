import React, { useState, useEffect } from 'react';
import TodayTab from './components/TodayTab';
import HistoryTab from './components/HistoryTab';
import GraphTab from './components/GraphTab';
import SettingsTab from './components/SettingsTab';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [darkMode, setDarkMode] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    let wakeLock = null;
    async function requestWakeLock() {
      if ('wakeLock' in navigator) {
        try { wakeLock = await navigator.wakeLock.request('screen'); } catch {}
      }
    }
    requestWakeLock();
    const handleVisibility = () => { if (document.visibilityState === 'visible') requestWakeLock(); };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      wakeLock?.release();
    };
  }, []);

  const tabs = [
    { id: 'today', label: '오늘', icon: '🏋️' },
    { id: 'history', label: '히스토리', icon: '📋' },
    { id: 'graph', label: '그래프', icon: '📈' },
    { id: 'settings', label: '설정', icon: '⚙️' },
  ];

  return (
    <div className="app">
      <div className="tab-content">
        {activeTab === 'today' && <TodayTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'graph' && <GraphTab />}
        {activeTab === 'settings' && <SettingsTab darkMode={darkMode} setDarkMode={setDarkMode} />}
      </div>
      <nav className="bottom-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

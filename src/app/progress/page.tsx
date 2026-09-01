'use client';

import { badges } from '@/data/learning-content';

const progressData = {
  lessonsCompleted: 12, totalLessons: 35,
  experimentsCompleted: 5, totalExperiments: 15,
  quizzesCompleted: 8, totalQuizzes: 20,
  challengesCompleted: 3, totalChallenges: 12,
  averageQuizScore: 85,
  totalPoints: 1250,
  streak: 5,
  beginnerProgress: 75,
  intermediateProgress: 40,
  advancedProgress: 10,
};

const moduleProgress = [
  { name: 'Embedded C Basics', progress: 100, category: 'Beginner' },
  { name: 'Microcontroller Basics', progress: 60, category: 'Beginner' },
  { name: 'GPIO', progress: 0, category: 'Beginner' },
  { name: 'Timers', progress: 0, category: 'Beginner' },
  { name: 'UART', progress: 0, category: 'Beginner' },
  { name: 'I2C Protocol', progress: 0, category: 'Intermediate' },
  { name: 'SPI Protocol', progress: 0, category: 'Intermediate' },
  { name: 'PWM', progress: 0, category: 'Intermediate' },
  { name: 'ADC', progress: 0, category: 'Intermediate' },
  { name: 'RTOS', progress: 0, category: 'Advanced' },
  { name: 'Bootloaders', progress: 0, category: 'Advanced' },
  { name: 'OTA Updates', progress: 0, category: 'Advanced' },
];

export default function ProgressPage() {
  return (
    <div className="progress-page">
      <div className="page-header">
        <h1>📊 Progress Tracker</h1>
        <p>Track your learning journey across all modules, quizzes, and challenges.</p>
      </div>

      {/* Overview Stats */}
      <div className="overview-grid">
        {[
          { label: 'Lessons', done: progressData.lessonsCompleted, total: progressData.totalLessons, icon: '📖', color: '#06d6a0' },
          { label: 'Experiments', done: progressData.experimentsCompleted, total: progressData.totalExperiments, icon: '🔬', color: '#4cc9f0' },
          { label: 'Quizzes', done: progressData.quizzesCompleted, total: progressData.totalQuizzes, icon: '📝', color: '#7b2ff7' },
          { label: 'Challenges', done: progressData.challengesCompleted, total: progressData.totalChallenges, icon: '🏆', color: '#ff6b35' },
          { label: 'Avg Quiz Score', done: progressData.averageQuizScore, total: 100, icon: '📊', color: '#ffd60a', suffix: '%' },
          { label: 'Total Points', done: progressData.totalPoints, total: 5000, icon: '⭐', color: '#f72585' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{stat.icon} {stat.label}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: stat.color }}>{stat.done}{stat.suffix || ''}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${(stat.done / stat.total) * 100}%`, background: stat.color }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', textAlign: 'right' }}>
              {stat.done} / {stat.total}
            </div>
          </div>
        ))}
      </div>

      {/* Learning Path Progress */}
      <div className="section-card card">
        <h3>🗺️ Learning Path Progress</h3>
        <div className="paths-progress">
          {[
            { name: 'Beginner', progress: progressData.beginnerProgress, color: '#06d6a0', status: 'In Progress' },
            { name: 'Intermediate', progress: progressData.intermediateProgress, color: '#4cc9f0', status: 'In Progress' },
            { name: 'Advanced', progress: progressData.advancedProgress, color: '#f72585', status: 'Locked' },
          ].map((path, i) => (
            <div key={i} className="path-item">
              <div className="path-row">
                <span className="path-name" style={{ color: path.color }}>{path.name}</span>
                <span className="path-status">{path.status}</span>
                <span className="path-pct" style={{ color: path.color }}>{path.progress}%</span>
              </div>
              <div className="progress-bar" style={{ height: '10px' }}>
                <div className="progress-bar-fill" style={{ width: `${path.progress}%`, background: path.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module Progress */}
      <div className="section-card card">
        <h3>📚 Module Progress</h3>
        <div className="module-progress-list">
          {moduleProgress.map((mod, i) => (
            <div key={i} className="mp-row">
              <span className="mp-name">{mod.name}</span>
              <span className="mp-cat badge badge-info">{mod.category}</span>
              <div className="progress-bar" style={{ flex: 1, margin: '0 1rem' }}>
                <div className="progress-bar-fill" style={{ width: `${mod.progress}%` }} />
              </div>
              <span className="mp-pct">{mod.progress}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="section-card card">
        <h3>🎖️ Badges & Achievements</h3>
        <div className="badges-grid">
          {badges.map((badge, i) => (
            <div key={i} className={`badge-item ${i < 5 ? 'earned' : 'locked'}`}>
              <span className="bi-icon">{badge.icon}</span>
              <span className="bi-name">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .progress-page { max-width: 1200px; margin: 0 auto; padding: 2rem; padding-bottom: 4rem; }
        .page-header { text-align: center; margin-bottom: 2rem; }
        .page-header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
        .page-header p { color: var(--color-text-secondary); }

        .overview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .section-card { padding: 2rem; margin-bottom: 1.5rem; }
        .section-card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem; }

        .paths-progress { display: flex; flex-direction: column; gap: 1.25rem; }
        .path-item { }
        .path-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.4rem; }
        .path-name { font-weight: 700; font-size: 0.95rem; width: 120px; }
        .path-status { flex: 1; font-size: 0.75rem; color: var(--color-text-muted); }
        .path-pct { font-weight: 800; font-family: var(--font-mono); }

        .module-progress-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .mp-row { display: flex; align-items: center; gap: 0.5rem; }
        .mp-name { width: 200px; font-size: 0.85rem; font-weight: 500; }
        .mp-pct { font-size: 0.8rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-accent-cyan); width: 40px; text-align: right; }

        .badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.75rem; }
        .badge-item {
          display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
          padding: 1rem; border-radius: 10px; background: var(--color-bg-input); border: 1px solid var(--color-border);
          transition: all 0.2s;
        }
        .badge-item.earned { border-color: rgba(6,214,160,0.3); }
        .badge-item.locked { opacity: 0.3; }
        .bi-icon { font-size: 1.8rem; }
        .bi-name { font-size: 0.7rem; font-weight: 600; text-align: center; }

        @media (max-width: 768px) { .overview-grid { grid-template-columns: 1fr 1fr; } .mp-name { width: 140px; } }
        @media (max-width: 500px) { .overview-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

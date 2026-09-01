'use client';

import Link from 'next/link';
import { badges } from '@/data/learning-content';

const dashboardData = {
  name: 'Student',
  level: 'Beginner',
  totalPoints: 1250,
  streak: 5,
  quizzesCompleted: 8,
  labsCompleted: 4,
  challengesCompleted: 3,
  experimentsCompleted: 5,
  overallProgress: 35,
  beginnerProgress: 75,
  intermediateProgress: 40,
  advancedProgress: 10,
  currentModule: 'GPIO — General Purpose I/O',
  currentModuleId: 'gpio',
  recentActivity: [
    { type: 'lesson', title: 'Completed: Bit Manipulation', time: '2 hours ago', icon: '📖' },
    { type: 'quiz', title: 'GPIO Quiz — 80%', time: '3 hours ago', icon: '📝' },
    { type: 'experiment', title: 'LED Blink Experiment', time: 'Yesterday', icon: '🔬' },
    { type: 'challenge', title: 'Solved: Blink an LED', time: 'Yesterday', icon: '🏆' },
    { type: 'badge', title: 'Earned: Embedded C Starter', time: '2 days ago', icon: '🎖️' },
  ],
  recentQuizScores: [
    { quiz: 'Embedded C Basics', score: 90, total: 100, date: 'Aug 25' },
    { quiz: 'GPIO Quiz', score: 80, total: 100, date: 'Aug 24' },
    { quiz: 'MCU Basics', score: 95, total: 100, date: 'Aug 22' },
  ],
  leaderboard: [
    { rank: 1, name: 'Alex', points: 3400, level: 'Intermediate' },
    { rank: 2, name: 'Priya', points: 2800, level: 'Intermediate' },
    { rank: 3, name: 'Rahul', points: 2100, level: 'Beginner' },
    { rank: 4, name: 'You', points: 1250, level: 'Beginner', isYou: true },
    { rank: 5, name: 'Sara', points: 1100, level: 'Beginner' },
  ],
};

const earnedBadges = badges.slice(0, 5).map(b => ({ ...b, earned: true }));
const allBadges = [...earnedBadges, ...badges.slice(5).map(b => ({ ...b, earned: false }))];

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      {/* Welcome */}
      <div className="dash-welcome">
        <div>
          <h1>Welcome back, <span className="gradient-text">{dashboardData.name}</span> 👋</h1>
          <p>You&apos;re on a {dashboardData.streak}-day streak! Keep going.</p>
        </div>
        <div className="streak-badge">
          🔥 {dashboardData.streak} Day Streak
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {[
          { label: 'Current Level', value: dashboardData.level, icon: '🎯', color: '#06d6a0' },
          { label: 'Overall Progress', value: `${dashboardData.overallProgress}%`, icon: '📊', color: '#4cc9f0' },
          { label: 'Total Score', value: dashboardData.totalPoints.toLocaleString(), icon: '⭐', color: '#ffd60a' },
          { label: 'Quizzes Done', value: dashboardData.quizzesCompleted, icon: '📝', color: '#7b2ff7' },
          { label: 'Labs Done', value: dashboardData.labsCompleted, icon: '🔬', color: '#ff6b35' },
          { label: 'Challenges Won', value: dashboardData.challengesCompleted, icon: '🏆', color: '#f72585' },
          { label: 'Experiments', value: dashboardData.experimentsCompleted, icon: '⚡', color: '#2dc653' },
          { label: 'Badges Earned', value: earnedBadges.length, icon: '🎖️', color: '#06d6a0' },
        ].map((stat, i) => (
          <div key={i} className="stat-card card">
            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
            <div className="stat-info">
              <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* Learning Path Progress */}
        <div className="card dash-section">
          <h3>📚 Learning Path Progress</h3>
          {[
            { name: 'Beginner', progress: dashboardData.beginnerProgress, color: '#06d6a0' },
            { name: 'Intermediate', progress: dashboardData.intermediateProgress, color: '#4cc9f0' },
            { name: 'Advanced', progress: dashboardData.advancedProgress, color: '#f72585' },
          ].map((path, i) => (
            <div key={i} className="path-progress">
              <div className="path-progress-header">
                <span>{path.name}</span>
                <span style={{ color: path.color }}>{path.progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${path.progress}%`, background: path.color }} />
              </div>
            </div>
          ))}

          <div className="continue-section">
            <p className="continue-label">Current Module</p>
            <p className="continue-module">{dashboardData.currentModule}</p>
            <Link href={`/learn/${dashboardData.currentModuleId}`} className="btn-primary" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
              Continue Learning →
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card dash-section">
          <h3>🕐 Recent Activity</h3>
          <div className="activity-list">
            {dashboardData.recentActivity.map((a, i) => (
              <div key={i} className="activity-item">
                <span className="activity-icon">{a.icon}</span>
                <div className="activity-info">
                  <span className="activity-title">{a.title}</span>
                  <span className="activity-time">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quiz Scores */}
        <div className="card dash-section">
          <h3>📝 Recent Quiz Scores</h3>
          <div className="quiz-scores">
            {dashboardData.recentQuizScores.map((q, i) => (
              <div key={i} className="quiz-score-row">
                <div className="quiz-score-info">
                  <span className="quiz-name">{q.quiz}</span>
                  <span className="quiz-date">{q.date}</span>
                </div>
                <div className="quiz-score-bar">
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar-fill" style={{
                      width: `${q.score}%`,
                      background: q.score >= 90 ? '#2dc653' : q.score >= 70 ? '#ffd60a' : '#ef4444'
                    }} />
                  </div>
                  <span className="quiz-score-val">{q.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card dash-section">
          <h3>🏅 Leaderboard</h3>
          <div className="leaderboard">
            {dashboardData.leaderboard.map((entry, i) => (
              <div key={i} className={`lb-row ${(entry as { isYou?: boolean }).isYou ? 'is-you' : ''}`}>
                <span className="lb-rank">#{entry.rank}</span>
                <span className="lb-name">{entry.name}</span>
                <span className="lb-level badge badge-info">{entry.level}</span>
                <span className="lb-points">{entry.points.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="card" style={{ maxWidth: 1200, margin: '0 auto 3rem', padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>🎖️ Achievement Badges</h3>
        <div className="badges-grid">
          {allBadges.map((badge, i) => (
            <div key={i} className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}>
              <span className="badge-icon">{badge.icon}</span>
              <span className="badge-name">{badge.name}</span>
              <span className="badge-desc">{badge.description}</span>
              {!badge.earned && <span className="badge-lock">🔒</span>}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dashboard-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .dash-welcome {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .dash-welcome h1 { font-size: 1.75rem; font-weight: 800; }
        .dash-welcome p { color: var(--color-text-secondary); margin-top: 0.25rem; }
        .streak-badge {
          background: rgba(255, 107, 53, 0.15);
          color: var(--color-accent-orange);
          border: 1px solid rgba(255, 107, 53, 0.3);
          padding: 0.5rem 1.25rem;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.9rem;
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
        }
        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          flex-shrink: 0;
        }
        .stat-info { display: flex; flex-direction: column; }
        .stat-card .stat-value { font-size: 1.4rem; font-weight: 800; }
        .stat-card .stat-label { font-size: 0.75rem; color: var(--color-text-muted); }

        /* Dashboard Grid */
        .dash-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .dash-section h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
        }

        /* Path Progress */
        .path-progress { margin-bottom: 1rem; }
        .path-progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.4rem;
        }
        .continue-section {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
        }
        .continue-label { font-size: 0.75rem; color: var(--color-text-muted); }
        .continue-module { font-size: 0.95rem; font-weight: 600; margin-top: 0.25rem; }

        /* Activity */
        .activity-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .activity-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0;
          border-bottom: 1px solid var(--color-border);
        }
        .activity-item:last-child { border-bottom: none; }
        .activity-icon { font-size: 1.2rem; }
        .activity-info { display: flex; flex-direction: column; }
        .activity-title { font-size: 0.85rem; font-weight: 500; }
        .activity-time { font-size: 0.7rem; color: var(--color-text-muted); }

        /* Quiz Scores */
        .quiz-scores { display: flex; flex-direction: column; gap: 1rem; }
        .quiz-score-row { }
        .quiz-score-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.3rem;
        }
        .quiz-name { font-size: 0.85rem; font-weight: 500; }
        .quiz-date { font-size: 0.75rem; color: var(--color-text-muted); }
        .quiz-score-bar { display: flex; align-items: center; gap: 0.75rem; }
        .quiz-score-val { font-size: 0.85rem; font-weight: 700; font-family: var(--font-mono); width: 40px; text-align: right; }

        /* Leaderboard */
        .leaderboard { display: flex; flex-direction: column; gap: 0.5rem; }
        .lb-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          transition: background 0.2s;
        }
        .lb-row:hover { background: var(--color-bg-input); }
        .lb-row.is-you {
          background: rgba(6, 214, 160, 0.08);
          border: 1px solid rgba(6, 214, 160, 0.2);
        }
        .lb-rank { font-weight: 800; font-family: var(--font-mono); width: 30px; color: var(--color-accent-cyan); }
        .lb-name { flex: 1; font-weight: 600; }
        .lb-points { font-family: var(--font-mono); font-weight: 600; color: var(--color-accent-yellow); }

        /* Badges */
        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 1rem;
        }
        .badge-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1.25rem 0.75rem;
          border-radius: 12px;
          background: var(--color-bg-input);
          border: 1px solid var(--color-border);
          position: relative;
          transition: all 0.3s;
        }
        .badge-card.earned {
          border-color: rgba(6, 214, 160, 0.3);
          box-shadow: 0 0 15px rgba(6, 214, 160, 0.1);
        }
        .badge-card.locked { opacity: 0.4; }
        .badge-card:hover { transform: translateY(-3px); }
        .badge-icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .badge-name { font-size: 0.8rem; font-weight: 700; margin-bottom: 0.2rem; }
        .badge-desc { font-size: 0.65rem; color: var(--color-text-muted); }
        .badge-lock { position: absolute; top: 8px; right: 8px; font-size: 0.7rem; }

        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .dash-grid { grid-template-columns: 1fr; }
          .dash-welcome { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .badges-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  );
}

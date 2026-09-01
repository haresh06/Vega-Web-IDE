'use client';

import Link from 'next/link';
import { useState } from 'react';

const adminSections = [
  {
    title: 'Content Management',
    icon: '📚',
    items: [
      { label: 'Learning Modules', count: 20, action: 'Manage' },
      { label: 'Lessons', count: 45, action: 'Manage' },
      { label: 'Quizzes', count: 12, action: 'Manage' },
      { label: 'Challenges', count: 8, action: 'Manage' },
      { label: 'Experiments', count: 5, action: 'Manage' },
    ]
  },
  {
    title: 'User Management',
    icon: '👥',
    items: [
      { label: 'Total Students', count: 156, action: 'View' },
      { label: 'Active Today', count: 42, action: 'View' },
      { label: 'Admins', count: 3, action: 'Manage' },
    ]
  },
  {
    title: 'Device Management',
    icon: '🔧',
    items: [
      { label: 'Registered Boards', count: 12, action: 'Manage' },
      { label: 'ESP32 Gateways', count: 4, action: 'Manage' },
      { label: 'Flash Sessions Today', count: 8, action: 'View' },
    ]
  },
];

const recentUsers = [
  { name: 'Alex Chen', email: 'alex@example.com', level: 'Intermediate', points: 3400, lastActive: '2 min ago' },
  { name: 'Priya Sharma', email: 'priya@example.com', level: 'Intermediate', points: 2800, lastActive: '15 min ago' },
  { name: 'Rahul Verma', email: 'rahul@example.com', level: 'Beginner', points: 2100, lastActive: '1 hour ago' },
  { name: 'Sara Johnson', email: 'sara@example.com', level: 'Beginner', points: 1100, lastActive: '3 hours ago' },
  { name: 'Mike Wilson', email: 'mike@example.com', level: 'Beginner', points: 800, lastActive: '1 day ago' },
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>⚙️ Admin Dashboard</h1>
        <p>Content management and platform administration.</p>
      </div>

      <div className="admin-tabs">
        {['overview', 'content', 'users', 'devices'].map(tab => (
          <button key={tab} className={`tab-btn ${activeSection === tab ? 'active' : ''}`} onClick={() => setActiveSection(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeSection === 'overview' && (
        <>
          {/* Stats */}
          <div className="admin-stats">
            {[
              { label: 'Total Users', value: '156', color: '#06d6a0', icon: '👥' },
              { label: 'Active Today', value: '42', color: '#4cc9f0', icon: '📊' },
              { label: 'Modules', value: '20', color: '#7b2ff7', icon: '📚' },
              { label: 'Flash Sessions', value: '247', color: '#ff6b35', icon: '📶' },
            ].map((stat, i) => (
              <div key={i} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{stat.label}</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  </div>
                  <span style={{ fontSize: '2rem' }}>{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sections */}
          <div className="admin-sections-grid">
            {adminSections.map((section, i) => (
              <div key={i} className="card">
                <h3>{section.icon} {section.title}</h3>
                <div className="admin-items">
                  {section.items.map((item, j) => (
                    <div key={j} className="admin-item">
                      <span className="item-label">{item.label}</span>
                      <span className="item-count">{item.count}</span>
                      <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}>{item.action}</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Users */}
          <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>👥 Recent Users</h3>
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Level</th><th>Points</th><th>Last Active</th></tr>
              </thead>
              <tbody>
                {recentUsers.map((user, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className="badge badge-info">{user.level}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{user.points}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{user.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeSection === 'content' && (
        <div className="admin-content-section">
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>📚 Content Management</h3>
              <button className="btn-primary" style={{ fontSize: '0.85rem' }}>+ Create Module</button>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Create and manage learning modules, lessons, quizzes, challenges, and experiments.
              Each module can contain multiple lessons, a quiz, experiments, and coding challenges.
            </p>
            <div className="content-actions" style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {['Create Module', 'Create Lesson', 'Create Quiz', 'Create Challenge', 'Create Experiment', 'Add Sensor Lab', 'Add Protocol Lab', 'Create Badge'].map((action, i) => (
                <button key={i} className="btn-secondary" style={{ justifyContent: 'center', fontSize: '0.85rem' }}>
                  + {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'users' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>👥 User Management</h3>
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Level</th><th>Points</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {recentUsers.map((user, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td><span className="badge badge-easy">Student</span></td>
                  <td>{user.level}</td>
                  <td>{user.points}</td>
                  <td><button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSection === 'devices' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>🔧 Device Management</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'ARIES v2 - Lab Station 1', board: 'VEGA ARIES v2', firmware: 'v1.3.0', status: 'connected' },
              { name: 'ARIES v2 - Lab Station 2', board: 'VEGA ARIES v2', firmware: 'v1.2.0', status: 'connected' },
              { name: 'ESP32 Gateway #1', board: 'ESP32-WROOM', firmware: 'v2.1.0', status: 'connected' },
              { name: 'ESP32 Gateway #2', board: 'ESP32-WROOM', firmware: 'v2.1.0', status: 'disconnected' },
            ].map((device, i) => (
              <div key={i} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className={`status-dot ${device.status}`} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{device.name}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Board: {device.board}<br />
                  Firmware: {device.firmware}<br />
                  Status: {device.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-page { max-width: 1200px; margin: 0 auto; padding: 2rem; padding-bottom: 4rem; }
        .admin-header { margin-bottom: 1.5rem; }
        .admin-header h1 { font-size: 2rem; font-weight: 800; }
        .admin-header p { color: var(--color-text-secondary); }

        .admin-tabs { display: flex; gap: 0.5rem; margin-bottom: 2rem; }
        .tab-btn {
          padding: 0.5rem 1rem; border: 1px solid var(--color-border); border-radius: 6px;
          background: none; color: var(--color-text-muted); font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .tab-btn:hover { border-color: var(--color-accent-cyan); color: var(--color-text-primary); }
        .tab-btn.active { border-color: var(--color-accent-cyan); color: var(--color-accent-cyan); background: rgba(6,214,160,0.08); }

        .admin-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .admin-sections-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .admin-sections-grid h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; }
        .admin-items { display: flex; flex-direction: column; gap: 0.5rem; }
        .admin-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; }
        .item-label { flex: 1; font-size: 0.85rem; }
        .item-count { font-family: var(--font-mono); font-weight: 700; color: var(--color-accent-cyan); }

        .admin-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .admin-table th { text-align: left; padding: 0.6rem; background: var(--color-bg-input); border: 1px solid var(--color-border); font-weight: 600; color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; }
        .admin-table td { padding: 0.6rem; border: 1px solid var(--color-border); color: var(--color-text-secondary); }

        @media (max-width: 900px) {
          .admin-stats { grid-template-columns: 1fr 1fr; }
          .admin-sections-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

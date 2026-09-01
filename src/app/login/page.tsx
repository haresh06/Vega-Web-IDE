'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: redirect to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="login-page grid-bg">
      <div className="login-card glass">
        <div className="login-header">
          <span className="logo-icon">◆</span>
          <h2>VEGA <span className="gradient-text">Learn & Lab</span></h2>
          <p>{isLogin ? 'Sign in to continue your learning journey' : 'Create your account to get started'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="student@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button className="switch-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
          {isLogin && (
            <Link href="/dashboard" className="demo-link">
              Continue as Demo Student →
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: calc(100vh - 60px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem;
          border-radius: 16px;
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .logo-icon {
          font-size: 2rem;
          color: var(--color-accent-cyan);
          display: block;
          margin-bottom: 0.75rem;
        }
        .login-header h2 {
          font-size: 1.4rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }
        .login-header p {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }
        .login-form { display: flex; flex-direction: column; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
        .form-group label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }
        .form-group input {
          padding: 0.7rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: var(--color-bg-input);
          color: var(--color-text-primary);
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          border-color: var(--color-accent-cyan);
        }
        .form-group input::placeholder {
          color: var(--color-text-muted);
        }
        .login-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }
        .switch-btn {
          background: none;
          border: none;
          color: var(--color-accent-cyan);
          font-weight: 600;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .switch-btn:hover { text-decoration: underline; }
        .demo-link {
          display: block;
          margin-top: 0.75rem;
          color: var(--color-text-muted);
          font-size: 0.8rem;
          text-decoration: none;
        }
        .demo-link:hover { color: var(--color-accent-cyan); }
      `}</style>
    </div>
  );
}

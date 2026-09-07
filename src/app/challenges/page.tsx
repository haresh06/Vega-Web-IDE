'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Brain, Code2, Sparkles, BookOpen, Terminal, CheckCircle2, ArrowRight } from 'lucide-react';

function ChallengesLandingContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  return (
    <div className="challenges-landing-page">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-badge">
          <Sparkles size={14} className="badge-icon" />
          <span>Interactive Training & Assessment</span>
        </div>
        <h1>🏆 Challenges & Quizzes</h1>
        <p className="page-subtitle">
          Build your VEGA embedded-systems knowledge through quizzes and hands-on coding challenges.
        </p>
      </div>

      {/* Two Large Equal Choices */}
      <div className="choices-container">
        {/* Choice 1: Quizzes */}
        <div className="choice-card quiz-card">
          <div className="choice-icon-wrap quiz-icon-bg">
            <Brain size={36} className="choice-icon" />
          </div>

          <div className="choice-badge quiz-badge">Knowledge Assessment</div>

          <h2>🧠 QUIZZES</h2>
          <p className="choice-desc">
            Test your knowledge of VEGA and embedded systems concepts with instant feedback, deep explanations, and comprehensive topic reviews.
          </p>

          <div className="choice-features">
            <div className="feature-item">
              <CheckCircle2 size={15} className="feat-check" />
              <span><strong>28 Topics:</strong> Beginner, Intermediate & Advanced</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={15} className="feat-check" />
              <span>Step-by-step interactive questions with explanations</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={15} className="feat-check" />
              <span>Detailed score analysis & question review mode</span>
            </div>
          </div>

          <div className="choice-footer">
            <Link href="/challenges/quizzes" className="choice-btn quiz-btn">
              <span>Start Quiz</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Choice 2: Coding Challenges */}
        <div className="choice-card coding-card">
          <div className="choice-icon-wrap coding-icon-bg">
            <Code2 size={36} className="choice-icon" />
          </div>

          <div className="choice-badge coding-badge">Hands-on Programming</div>

          <h2>💻 CODING CHALLENGES</h2>
          <p className="choice-desc">
            Solve real embedded programming problems, write hardware drivers, configure registers, and validate code against automated test cases.
          </p>

          <div className="choice-features">
            <div className="feature-item">
              <CheckCircle2 size={15} className="feat-check" />
              <span><strong>Real Embedded C:</strong> GPIO, UART, SPI, I2C & Timers</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={15} className="feat-check" />
              <span>Integrated with VEGA Studio IDE & compiler</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={15} className="feat-check" />
              <span>Automated test case execution & point rewards</span>
            </div>
          </div>

          <div className="choice-footer">
            <Link href="/challenges/coding" className="choice-btn coding-btn">
              <span>View Challenges</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .challenges-landing-page {
          min-height: calc(100vh - 60px);
          padding: 3rem 2rem 5rem;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'General Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.85rem;
          background: rgba(6, 214, 160, 0.08);
          border: 1px solid rgba(6, 214, 160, 0.25);
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-accent-cyan, #06d6a0);
          margin-bottom: 1rem;
        }

        .page-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--color-text-primary, #ffffff);
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          color: var(--color-text-secondary, #94a3b8);
          font-size: 1.1rem;
          max-width: 650px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .choices-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .choice-card {
          background: var(--color-bg-card, #10192e);
          border: 1px solid var(--color-border, #1e293b);
          border-radius: 16px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .choice-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          transition: opacity 0.3s;
        }

        .quiz-card::before {
          background: linear-gradient(90deg, #06d6a0, #38bdf8);
        }

        .coding-card::before {
          background: linear-gradient(90deg, #38bdf8, #818cf8);
        }

        .choice-card:hover {
          transform: translateY(-4px);
          border-color: rgba(56, 189, 248, 0.3);
          box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.4);
        }

        .choice-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .quiz-icon-bg {
          background: rgba(6, 214, 160, 0.12);
          color: #06d6a0;
          border: 1px solid rgba(6, 214, 160, 0.3);
        }

        .coding-icon-bg {
          background: rgba(56, 189, 248, 0.12);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.3);
        }

        .choice-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          margin-bottom: 0.75rem;
          width: fit-content;
        }

        .quiz-badge {
          background: rgba(6, 214, 160, 0.15);
          color: #06d6a0;
        }

        .coding-badge {
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
        }

        .choice-card h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-text-primary, #ffffff);
          margin-bottom: 0.75rem;
          letter-spacing: 0.02em;
        }

        .choice-desc {
          color: var(--color-text-secondary, #94a3b8);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.75rem;
        }

        .choice-features {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2.25rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.88rem;
          color: var(--color-text-secondary, #cbd5e1);
        }

        .feat-check {
          color: var(--color-accent-cyan, #06d6a0);
          flex-shrink: 0;
        }

        .choice-footer {
          margin-top: auto;
        }

        .choice-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.9rem 1.5rem;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
        }

        .quiz-btn {
          background: #06d6a0;
          color: #0b1329;
        }

        .quiz-btn:hover {
          background: #05bf8e;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(6, 214, 160, 0.4);
        }

        .coding-btn {
          background: #38bdf8;
          color: #0b1329;
        }

        .coding-btn:hover {
          background: #0ea5e9;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(56, 189, 248, 0.4);
        }

        @media (max-width: 868px) {
          .choices-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .challenges-landing-page {
            padding: 2rem 1rem 4rem;
          }

          .page-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}

export default function ChallengesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading Challenges & Quizzes...</div>}>
      <ChallengesLandingContent />
    </Suspense>
  );
}

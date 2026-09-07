'use client';

import Link from 'next/link';
import { useState } from 'react';
import { quizTopics, QuizTopic } from '@/data/quiz-topics';
import { Brain, ArrowLeft, ArrowRight, HelpCircle, Award, Clock, ChevronRight } from 'lucide-react';

export default function QuizTopicsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const filteredTopics = activeTab === 'all'
    ? quizTopics
    : quizTopics.filter(t => t.difficulty === activeTab);

  const beginnerCount = quizTopics.filter(t => t.difficulty === 'beginner').length;
  const intermediateCount = quizTopics.filter(t => t.difficulty === 'intermediate').length;
  const advancedCount = quizTopics.filter(t => t.difficulty === 'advanced').length;

  return (
    <div className="quiz-topics-page">
      {/* Top Breadcrumbs */}
      <div className="breadcrumbs">
        <Link href="/challenges" className="crumb-link">
          <ArrowLeft size={14} />
          <span>Challenges & Quizzes</span>
        </Link>
        <span className="crumb-sep">/</span>
        <span className="crumb-active">Quizzes</span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="header-badge">
          <Brain size={15} />
          <span>Interactive Assessments</span>
        </div>
        <h1>🧠 VEGA Embedded Quizzes</h1>
        <p className="page-subtitle">
          Choose a topic to test and strengthen your knowledge.
        </p>
      </div>

      {/* Difficulty Filter Tabs */}
      <div className="tabs-bar">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Topics ({quizTopics.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'beginner' ? 'active' : ''}`}
          onClick={() => setActiveTab('beginner')}
        >
          Beginner ({beginnerCount})
        </button>
        <button
          className={`tab-btn ${activeTab === 'intermediate' ? 'active' : ''}`}
          onClick={() => setActiveTab('intermediate')}
        >
          Intermediate ({intermediateCount})
        </button>
        <button
          className={`tab-btn ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          Advanced ({advancedCount})
        </button>
      </div>

      {/* Topics Grid */}
      <div className="topics-grid">
        {filteredTopics.map((topic: QuizTopic) => (
          <Link
            key={topic.id}
            href={`/quiz/${topic.id}`}
            className={`topic-card ${topic.difficulty}`}
          >
            <div className="card-top">
              <div className="number-title-group">
                <span className="topic-num">{topic.topicNumber}</span>
                <h3 className="topic-title">{topic.title}</h3>
              </div>
              <span className={`diff-badge badge-${topic.difficulty}`}>
                {topic.difficulty.toUpperCase()}
              </span>
            </div>

            <p className="topic-desc">{topic.description}</p>

            <div className="card-bottom">
              <div className="meta-stats">
                <span className="meta-stat">
                  <HelpCircle size={13} />
                  <span>{topic.questions.length} Questions</span>
                </span>
                <span className="meta-stat">
                  <Award size={13} />
                  <span>{topic.points} Points</span>
                </span>
              </div>

              <span className="start-quiz-link">
                <span>Start Quiz</span>
                <ChevronRight size={15} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .quiz-topics-page {
          min-height: calc(100vh - 60px);
          padding: 2rem 2rem 5rem;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'General Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          margin-bottom: 2rem;
          color: var(--color-text-muted, #64748b);
        }

        .crumb-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--color-text-secondary, #94a3b8);
          text-decoration: none;
          transition: color 0.2s;
        }

        .crumb-link:hover {
          color: var(--color-accent-cyan, #06d6a0);
        }

        .crumb-sep {
          color: var(--color-border, #334155);
        }

        .crumb-active {
          color: var(--color-accent-cyan, #06d6a0);
          font-weight: 600;
        }

        .page-header {
          margin-bottom: 2.5rem;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.75rem;
          background: rgba(6, 214, 160, 0.08);
          border: 1px solid rgba(6, 214, 160, 0.25);
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--color-accent-cyan, #06d6a0);
          margin-bottom: 0.75rem;
        }

        .page-header h1 {
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--color-text-primary, #ffffff);
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          color: var(--color-text-secondary, #94a3b8);
          font-size: 1.05rem;
        }

        .tabs-bar {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--color-border, #1e293b);
          padding-bottom: 0.75rem;
          overflow-x: auto;
        }

        .tab-btn {
          background: transparent;
          border: 1px solid transparent;
          color: var(--color-text-muted, #94a3b8);
          font-size: 0.88rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: var(--color-text-primary, #ffffff);
          background: rgba(255, 255, 255, 0.04);
        }

        .tab-btn.active {
          color: var(--color-accent-cyan, #06d6a0);
          background: rgba(6, 214, 160, 0.08);
          border-color: rgba(6, 214, 160, 0.3);
        }

        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.25rem;
        }

        .topic-card {
          background: var(--color-bg-card, #10192e);
          border: 1px solid var(--color-border, #1e293b);
          border-radius: 12px;
          padding: 1.5rem;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .topic-card:hover {
          transform: translateY(-3px);
          border-color: rgba(56, 189, 248, 0.35);
          box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.35);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .number-title-group {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
        }

        .topic-num {
          font-family: var(--font-mono, monospace);
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--color-accent-cyan, #06d6a0);
          opacity: 0.8;
        }

        .topic-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-text-primary, #ffffff);
        }

        .diff-badge {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .badge-beginner {
          background: rgba(6, 214, 160, 0.12);
          color: #06d6a0;
          border: 1px solid rgba(6, 214, 160, 0.25);
        }

        .badge-intermediate {
          background: rgba(56, 189, 248, 0.12);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.25);
        }

        .badge-advanced {
          background: rgba(245, 158, 11, 0.12);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.25);
        }

        .topic-desc {
          color: var(--color-text-secondary, #94a3b8);
          font-size: 0.88rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }

        .card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          margin-top: auto;
        }

        .meta-stats {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .meta-stat {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.78rem;
          color: var(--color-text-muted, #94a3b8);
        }

        .start-quiz-link {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--color-accent-cyan, #06d6a0);
          transition: transform 0.2s;
        }

        .topic-card:hover .start-quiz-link {
          transform: translateX(3px);
        }

        @media (max-width: 768px) {
          .topics-grid {
            grid-template-columns: 1fr;
          }
          .quiz-topics-page {
            padding: 1.5rem 1rem 4rem;
          }
        }
      `}</style>
    </div>
  );
}

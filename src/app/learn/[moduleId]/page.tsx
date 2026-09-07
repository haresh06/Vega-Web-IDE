'use client';

import Link from 'next/link';
import { useState, useEffect, use, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { learningPaths } from '@/data/learning-content';
import LessonMarkdownRenderer from '@/components/learn/LessonMarkdownRenderer';
import { ArrowLeft, Clock, Award, Code2, Trophy, ArrowRight, Play, CheckCircle2 } from 'lucide-react';

function ModulePageContent({ moduleId }: { moduleId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lessonParam = searchParams.get('lesson');

  // Find module across all learning paths
  const module = learningPaths
    .flatMap(p => p.modules)
    .find(m => m.id === moduleId);

  // Determine initial lesson index based on ?lesson= query param
  const initialLessonIndex = module
    ? Math.max(0, module.lessons.findIndex(l => l.id === lessonParam))
    : 0;

  const [activeLesson, setActiveLesson] = useState(initialLessonIndex >= 0 ? initialLessonIndex : 0);

  // Sync state if URL query param changes
  useEffect(() => {
    if (module && lessonParam) {
      const idx = module.lessons.findIndex(l => l.id === lessonParam);
      if (idx !== -1 && idx !== activeLesson) {
        setActiveLesson(idx);
      }
    }
  }, [lessonParam, module]);

  if (!module) {
    return (
      <div className="module-not-found-wrapper">
        <div className="not-found-card">
          <h2>Module not found</h2>
          <p>The requested learning track could not be found or has been moved.</p>
          <Link href="/learn" className="btn-primary">
            <ArrowLeft size={16} />
            <span>Back to Learn Center</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleLessonChange = (index: number) => {
    setActiveLesson(index);
    const targetLesson = module.lessons[index];
    if (targetLesson) {
      router.push(`/learn/${module.id}?lesson=${targetLesson.id}`, { scroll: false });
    }
  };

  const lesson = module.lessons[activeLesson] || module.lessons[0];
  const activeVideoUrl = lesson?.videoUrl || module.videoUrl;
  const activeVideoTitle = lesson?.videoTitle || module.videoTitle || `${module.title} Video Guide`;

  return (
    <div className="lesson-page-container">
      {/* ========================================================
          PART 2: DEDICATED MODULE / COURSE LESSON SIDEBAR
      ======================================================== */}
      <aside className="lesson-nav-sidebar">
        {/* Top Course Information Card */}
        <div className="sidebar-course-card">
          <Link href="/learn" className="sidebar-back-btn">
            <ArrowLeft size={15} />
            <span>Back to Learn Center</span>
          </Link>

          <h2 className="sidebar-course-title">{module.title}</h2>

          <div className="sidebar-meta-badges">
            <span className={`difficulty-badge badge-${module.difficulty}`}>
              {module.difficulty.toUpperCase()}
            </span>
            <span className="meta-pill">
              <Clock size={12} className="meta-icon" />
              <span>{module.estimatedTime} min</span>
            </span>
            <span className="meta-pill">
              <Award size={12} className="meta-icon" />
              <span>{module.points} pts</span>
            </span>
          </div>
        </div>

        {/* Lesson List Navigation */}
        <div className="sidebar-lessons-section">
          <div className="lessons-header-label">
            <span>MODULE LESSONS</span>
            <span className="lessons-count-pill">{module.lessons.length}</span>
          </div>

          <div className="lessons-nav-list">
            {module.lessons.map((l, i) => {
              const isActive = i === activeLesson;
              return (
                <button
                  key={l.id}
                  className={`lesson-nav-item ${isActive ? 'active' : ''} ${l.completed ? 'completed' : ''}`}
                  onClick={() => handleLessonChange(i)}
                >
                  <div className="nav-item-icon-box">
                    {l.completed ? (
                      <CheckCircle2 size={16} className="status-icon-check" />
                    ) : isActive ? (
                      <Play size={14} className="status-icon-active" />
                    ) : (
                      <span className="status-dot-inactive" />
                    )}
                  </div>
                  <span className="nav-item-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="nav-item-title">{l.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Sidebar Action Buttons */}
        <div className="sidebar-bottom-actions">
          <Link
            href={`/ide?project=${module.id}`}
            className="sidebar-action-btn btn-action-ide"
          >
            <Code2 size={16} />
            <span>Code in VEGA Studio</span>
          </Link>
          <Link
            href="/challenges"
            className="sidebar-action-btn btn-action-quiz"
          >
            <Trophy size={16} />
            <span>Take Challenge</span>
          </Link>
        </div>
      </aside>

      {/* ========================================================
          PART 3: MAIN LESSON CONTENT AREA
      ======================================================== */}
      <main className="lesson-main-content">
        <div className="lesson-content-inner">
          {/* Top Lesson Header & Hierarchy */}
          <header className="main-lesson-header">
            <div className="lesson-category-row">
              <span className="lesson-step-badge">
                LESSON {activeLesson + 1} OF {module.lessons.length}
              </span>
              <span className="lesson-category-tag">
                {module.category.toUpperCase()} • {module.difficulty.toUpperCase()}
              </span>
            </div>

            <h1 className="main-lesson-title">{lesson.title}</h1>
          </header>

          {/* Video Tutorial Card (If Available) */}
          {activeVideoUrl && (
            <div className="lesson-video-card">
              <div className="video-aspect-ratio-box">
                <iframe
                  src={activeVideoUrl}
                  title={activeVideoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="video-footer-info">
                <span className="video-player-badge">🎬 VIDEO GUIDE</span>
                <span className="video-player-title">{activeVideoTitle}</span>
              </div>
            </div>
          )}

          {/* Lesson Body Content (Properly Parsed Markdown) */}
          <section className="lesson-body-section">
            <LessonMarkdownRenderer content={lesson.content} />
          </section>

          {/* Previous / Next Lesson Navigation Footer */}
          <footer className="lesson-navigation-footer">
            <button
              className="btn-nav-step btn-prev"
              disabled={activeLesson === 0}
              onClick={() => {
                handleLessonChange(activeLesson - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <ArrowLeft size={16} />
              <span>Previous Lesson</span>
            </button>

            <div className="lesson-progress-indicator">
              <span>Lesson {activeLesson + 1} of {module.lessons.length}</span>
            </div>

            {activeLesson < module.lessons.length - 1 ? (
              <button
                className="btn-nav-step btn-next"
                onClick={() => {
                  handleLessonChange(activeLesson + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <span>Next Lesson</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <Link href={`/ide?project=${module.id}`} className="btn-nav-step btn-finish">
                <span>Hands-on Code Lab</span>
                <Code2 size={16} />
              </Link>
            )}
          </footer>
        </div>
      </main>

      <style jsx>{`
        /* ========================================================
           GLOBAL LESSON PAGE LAYOUT & GENERAL SANS TYPOGRAPHY
        ======================================================== */
        .lesson-page-container {
          display: flex;
          width: 100%;
          min-height: 100vh;
          background: #080d1a;
          color: #e2e8f0;
          font-family: 'General Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* --------------------------------------------------------
           PART 2: MODULE / LESSON NAVIGATION SIDEBAR (320px)
        -------------------------------------------------------- */
        .lesson-nav-sidebar {
          width: 320px;
          min-width: 300px;
          max-width: 340px;
          background: #0c1222;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          flex-shrink: 0;
          padding: 1.5rem 1.25rem 1.5rem 1.25rem;
          box-sizing: border-box;
          z-index: 10;
        }

        .sidebar-course-card {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 1.25rem;
        }

        .sidebar-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #06d6a0;
          font-size: 0.82rem;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.2s ease, color 0.2s ease;
          width: fit-content;
        }

        .sidebar-back-btn:hover {
          transform: translateX(-3px);
          color: #38bdf8;
        }

        .sidebar-course-title {
          font-family: 'General Sans', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1.3;
          color: #ffffff;
          margin: 0;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .sidebar-meta-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .difficulty-badge {
          font-size: 0.68rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.04em;
        }

        .badge-easy {
          background: rgba(6, 214, 160, 0.15);
          color: #06d6a0;
          border: 1px solid rgba(6, 214, 160, 0.35);
        }

        .badge-medium {
          background: rgba(76, 201, 240, 0.15);
          color: #4cc9f0;
          border: 1px solid rgba(76, 201, 240, 0.35);
        }

        .badge-hard {
          background: rgba(255, 107, 53, 0.15);
          color: #ff6b35;
          border: 1px solid rgba(255, 107, 53, 0.35);
        }

        .meta-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.05);
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .meta-icon {
          color: #64748b;
        }

        /* Lesson List Navigation */
        .sidebar-lessons-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .lessons-header-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #64748b;
          text-transform: uppercase;
          padding: 0 4px;
        }

        .lessons-count-pill {
          background: rgba(255, 255, 255, 0.06);
          color: #94a3b8;
          padding: 2px 7px;
          border-radius: 10px;
          font-size: 0.68rem;
        }

        .lessons-nav-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .lesson-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 0.75rem 0.85rem;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          color: #94a3b8;
          font-family: 'General Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
        }

        .lesson-nav-item:hover {
          background: rgba(6, 214, 160, 0.06);
          border-color: rgba(6, 214, 160, 0.2);
          color: #ffffff;
          transform: translateX(2px);
        }

        .lesson-nav-item.active {
          background: linear-gradient(135deg, rgba(6, 214, 160, 0.16) 0%, rgba(56, 189, 248, 0.1) 100%);
          border-color: rgba(6, 214, 160, 0.45);
          color: #06d6a0;
          box-shadow: 0 4px 14px rgba(6, 214, 160, 0.12);
        }

        .nav-item-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          flex-shrink: 0;
        }

        .status-icon-check {
          color: #22c55e;
        }

        .status-icon-active {
          color: #06d6a0;
        }

        .status-dot-inactive {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #475569;
        }

        .nav-item-index {
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
        }

        .lesson-nav-item.active .nav-item-index {
          color: #06d6a0;
        }

        .nav-item-title {
          flex: 1;
          line-height: 1.35;
          word-break: break-word;
        }

        /* Bottom Sidebar Actions */
        .sidebar-bottom-actions {
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 0.7rem 1rem;
          border-radius: 8px;
          font-family: 'General Sans', sans-serif;
          font-size: 0.84rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .btn-action-ide {
          background: linear-gradient(135deg, #06d6a0, #0284c7);
          color: #041210;
          box-shadow: 0 4px 14px rgba(6, 214, 160, 0.25);
        }

        .btn-action-ide:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(6, 214, 160, 0.4);
        }

        .btn-action-quiz {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #e2e8f0;
        }

        .btn-action-quiz:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        /* --------------------------------------------------------
           PART 3: MAIN LESSON CONTENT AREA
        -------------------------------------------------------- */
        .lesson-main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem 4rem 6rem 4rem;
          box-sizing: border-box;
          overflow-y: auto;
        }

        .lesson-content-inner {
          width: 100%;
          max-width: 960px;
          display: flex;
          flex-direction: column;
        }

        .main-lesson-header {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-bottom: 2.25rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .lesson-category-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .lesson-step-badge {
          font-family: 'General Sans', sans-serif;
          font-size: 0.74rem;
          font-weight: 800;
          color: #06d6a0;
          background: rgba(6, 214, 160, 0.12);
          border: 1px solid rgba(6, 214, 160, 0.3);
          padding: 4px 10px;
          border-radius: 6px;
          letter-spacing: 0.06em;
        }

        .lesson-category-tag {
          font-size: 0.74rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.08em;
        }

        .main-lesson-title {
          font-family: 'General Sans', sans-serif;
          font-size: 2.4rem;
          font-weight: 900;
          line-height: 1.2;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.02em;
        }

        /* Video Player Card */
        .lesson-video-card {
          width: 100%;
          margin-bottom: 2.5rem;
          border-radius: 14px;
          overflow: hidden;
          background: #020611;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
        }

        .video-aspect-ratio-box {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
        }

        .video-aspect-ratio-box iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        .video-footer-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.9rem 1.25rem;
          background: #0a0f1d;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .video-player-badge {
          font-size: 0.7rem;
          font-weight: 800;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          padding: 2px 8px;
          border-radius: 4px;
          letter-spacing: 0.04em;
        }

        .video-player-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #f1f5f9;
        }

        /* Lesson Body Section */
        .lesson-body-section {
          width: 100%;
          margin-bottom: 3.5rem;
        }

        /* Navigation Footer */
        .lesson-navigation-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-nav-step {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.85rem 1.5rem;
          border-radius: 10px;
          font-family: 'General Sans', sans-serif;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          box-sizing: border-box;
        }

        .btn-prev {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #e2e8f0;
        }

        .btn-prev:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateX(-2px);
        }

        .btn-prev:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .btn-next, .btn-finish {
          background: linear-gradient(135deg, #06d6a0, #0284c7);
          color: #041210;
          border: none;
          box-shadow: 0 4px 18px rgba(6, 214, 160, 0.3);
        }

        .btn-next:hover, .btn-finish:hover {
          transform: translateX(2px);
          box-shadow: 0 6px 24px rgba(6, 214, 160, 0.45);
        }

        .lesson-progress-indicator {
          font-family: var(--font-mono, monospace);
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
        }

        /* Not Found Screen */
        .module-not-found-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          width: 100%;
          padding: 2rem;
          box-sizing: border-box;
        }

        .not-found-card {
          background: #0c1222;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 3rem;
          border-radius: 16px;
          text-align: center;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .lesson-page-container {
            flex-direction: column;
          }
          .lesson-nav-sidebar {
            width: 100%;
            min-width: 100%;
            max-width: 100%;
            height: auto;
            position: relative;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding: 1.5rem;
          }
          .lesson-main-content {
            padding: 2rem 1.5rem 4rem 1.5rem;
          }
          .main-lesson-title {
            font-size: 2rem;
          }
        }

        @media (max-width: 640px) {
          .lesson-navigation-footer {
            flex-direction: column;
            width: 100%;
          }
          .btn-nav-step {
            width: 100%;
            justify-content: center;
          }
          .main-lesson-title {
            font-size: 1.7rem;
          }
        }
      `}</style>
    </div>
  );
}

export default function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(params);

  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading Lesson...</div>}>
      <ModulePageContent moduleId={moduleId} />
    </Suspense>
  );
}


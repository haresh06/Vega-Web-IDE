'use client';

import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { quizTopics, QuizTopic, QuizQuestion } from '@/data/quiz-topics';
import {
  Brain,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Sparkles,
  ChevronRight,
  Lightbulb,
  Check,
  X,
  FileText
} from 'lucide-react';

export default function ReusableQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);

  // Match topic by id, or match legacy aliases (e.g. 'quiz-embedded-c' -> 'embedded-c-basics')
  const topic: QuizTopic | undefined = quizTopics.find(
    (t) =>
      t.id === quizId ||
      t.id === quizId.replace(/^quiz-/, '') ||
      (quizId === 'quiz-embedded-c' && t.id === 'embedded-c-basics') ||
      (quizId === 'quiz-gpio' && t.id === 'gpio') ||
      (quizId === 'quiz-uart' && t.id === 'uart') ||
      (quizId === 'quiz-spi' && t.id === 'spi') ||
      (quizId === 'quiz-i2c' && t.id === 'i2c')
  );

  // States
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, { selected: string; correct: boolean }>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Timer states
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && !quizCompleted) {
      if (!startTime) setStartTime(Date.now());
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, startTime]);

  if (!topic) {
    return (
      <div className="quiz-not-found-page">
        <div className="not-found-card card">
          <h2>Quiz Topic Not Found</h2>
          <p>We could not find a quiz matching &quot;{quizId}&quot;.</p>
          <Link href="/challenges/quizzes" className="btn-primary" style={{ marginTop: '1rem' }}>
            ← View All Quiz Topics
          </Link>
        </div>
        <style jsx>{`
          .quiz-not-found-page {
            min-height: calc(100vh - 60px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            font-family: 'General Sans', sans-serif;
          }
          .not-found-card {
            text-align: center;
            padding: 3rem;
            max-width: 500px;
          }
          .not-found-card h2 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }
          .not-found-card p {
            color: var(--color-text-secondary);
            margin-bottom: 1.5rem;
          }
        `}</style>
      </div>
    );
  }

  const questions = topic.questions;
  const currentQ: QuizQuestion = questions[currentQIndex];
  const progressPercent = Math.round(((currentQIndex + 1) / questions.length) * 100);

  // Tally counts
  const correctCount = Object.values(userAnswers).filter((a) => a.correct).length;
  const incorrectCount = Object.values(userAnswers).filter((a) => !a.correct).length;
  const answeredCount = Object.keys(userAnswers).length;
  const totalScore = correctCount * 10;
  const maxScore = questions.length * 10;
  const scorePercent = Math.round((correctCount / questions.length) * 100);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Handlers
  const handleStartQuiz = () => {
    setQuizStarted(true);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsChecked(false);
    setUserAnswers({});
    setQuizCompleted(false);
    setIsReviewMode(false);
  };

  const handleSelectOption = (option: string) => {
    if (isChecked) return; // Prevent changing after checking unless Try Again is clicked
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    const correct = selectedOption === currentQ.correctAns;
    setIsChecked(true);
    setIsCorrect(correct);

    // Save answer
    setUserAnswers((prev) => ({
      ...prev,
      [currentQIndex]: {
        selected: selectedOption,
        correct: correct,
      },
    }));
  };

  const handleTryAgain = () => {
    setIsChecked(false);
    setIsCorrect(false);
  };

  const handleNextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
      setIsCorrect(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRetakeQuiz = () => {
    handleStartQuiz();
  };

  return (
    <div className="quiz-container-page">
      {/* Top Breadcrumb Navigation */}
      <div className="quiz-breadcrumb-bar">
        <Link href="/challenges" className="crumb-link">
          Challenges & Quizzes
        </Link>
        <span className="crumb-sep">/</span>
        <Link href="/challenges/quizzes" className="crumb-link">
          Quizzes
        </Link>
        <span className="crumb-sep">/</span>
        <span className="crumb-active">{topic.title}</span>
      </div>

      {/* ================================================================== */}
      {/* 1. QUIZ SETUP / OVERVIEW SCREEN (Before Start)                    */}
      {/* ================================================================== */}
      {!quizStarted && (
        <div className="quiz-overview-card">
          <div className="overview-header">
            <span className={`diff-tag badge-${topic.difficulty}`}>
              {topic.difficulty.toUpperCase()} QUIZ
            </span>
            <span className="topic-num-badge">Topic #{topic.topicNumber}</span>
          </div>

          <h1 className="overview-title">{topic.title}</h1>
          <p className="overview-subtitle">{topic.description}</p>

          <div className="overview-desc-box">
            <p>{topic.longDescription}</p>
          </div>

          <div className="overview-meta-grid">
            <div className="meta-card">
              <HelpCircle size={20} className="meta-icon" />
              <div className="meta-info">
                <span className="meta-label">Questions</span>
                <span className="meta-val">{questions.length} Questions</span>
              </div>
            </div>

            <div className="meta-card">
              <Award size={20} className="meta-icon" />
              <div className="meta-info">
                <span className="meta-label">Total Points</span>
                <span className="meta-val">{topic.points} Points</span>
              </div>
            </div>

            <div className="meta-card">
              <Clock size={20} className="meta-icon" />
              <div className="meta-info">
                <span className="meta-label">Estimated Time</span>
                <span className="meta-val">{topic.estimatedTime}</span>
              </div>
            </div>

            <div className="meta-card">
              <Sparkles size={20} className="meta-icon" />
              <div className="meta-info">
                <span className="meta-label">Difficulty</span>
                <span className="meta-val" style={{ textTransform: 'capitalize' }}>
                  {topic.difficulty}
                </span>
              </div>
            </div>
          </div>

          <div className="overview-actions">
            <Link href="/challenges/quizzes" className="btn-secondary back-topics-btn">
              ← Back to Topics
            </Link>
            <button onClick={handleStartQuiz} className="btn-primary start-quiz-main-btn">
              <span>Start Quiz</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 2. REAL QUESTION-BY-QUESTION QUIZ SCREEN                           */}
      {/* ================================================================== */}
      {quizStarted && !quizCompleted && (
        <div className="quiz-active-wrapper">
          {/* Header Stats & Progress */}
          <div className="quiz-hud">
            <div className="hud-top">
              <div className="hud-title-wrap">
                <span className="hud-topic-title">{topic.title}</span>
                <span className="hud-q-count">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
              </div>
              <div className="hud-stats-pills">
                <span className="stat-pill correct" title="Correct answers">
                  <Check size={12} /> {correctCount}
                </span>
                <span className="stat-pill incorrect" title="Incorrect answers">
                  <X size={12} /> {incorrectCount}
                </span>
                <span className="stat-pill time" title="Time elapsed">
                  <Clock size={12} /> {formatTime(elapsedSeconds)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="hud-progress-bar">
              <div
                className="hud-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Active Question Card */}
          <div className="question-box">
            <div className="q-badge-row">
              <span className="q-index-pill">Question {currentQIndex + 1}</span>
              <span className="q-points-pill">⭐ {currentQ.points} Points</span>
            </div>

            <h2 className="q-prompt">{currentQ.question}</h2>

            {/* Monospace Code Block for C / Bitwise Code */}
            {currentQ.codeSnippet && (
              <div className="code-block-container">
                <div className="code-block-header">
                  <span className="code-dot red" />
                  <span className="code-dot yellow" />
                  <span className="code-dot green" />
                  <span className="code-lang">C / Hardware Register</span>
                </div>
                <pre className="code-content">
                  <code>{currentQ.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Multiple Choice Options (A, B, C, D) */}
            <div className="options-grid">
              {currentQ.options.map((opt, i) => {
                const optLetter = String.fromCharCode(65 + i);
                const isSelected = selectedOption === opt;
                const isThisCorrect = opt === currentQ.correctAns;

                let optionClass = 'option-btn';
                if (isChecked) {
                  if (isSelected && isCorrect) {
                    optionClass += ' correct-selected';
                  } else if (isSelected && !isCorrect) {
                    optionClass += ' wrong-selected';
                  } else if (isThisCorrect) {
                    optionClass += ' correct-reveal';
                  } else {
                    optionClass += ' disabled';
                  }
                } else if (isSelected) {
                  optionClass += ' selected';
                }

                return (
                  <button
                    key={i}
                    type="button"
                    className={optionClass}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isChecked}
                  >
                    <div className="opt-letter-circle">{optLetter}</div>
                    <span className="opt-text">{opt}</span>
                    {isChecked && isSelected && isCorrect && (
                      <Check size={18} className="opt-status-icon correct" />
                    )}
                    {isChecked && isSelected && !isCorrect && (
                      <X size={18} className="opt-status-icon wrong" />
                    )}
                    {isChecked && !isSelected && isThisCorrect && (
                      <Check size={18} className="opt-status-icon correct" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback Callout Box (After Checking Answer) */}
            {isChecked && (
              <div className={`feedback-box ${isCorrect ? 'correct' : 'wrong'}`}>
                <div className="feedback-header">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 size={20} className="feedback-icon correct" />
                      <div>
                        <h3>✓ Correct Answer</h3>
                        <p>Excellent! Your answer is correct.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} className="feedback-icon wrong" />
                      <div>
                        <h3>✕ Wrong Answer</h3>
                        <p>Your selected answer is incorrect.</p>
                      </div>
                    </>
                  )}
                </div>

                {!isCorrect && (
                  <div className="correct-answer-banner">
                    <span className="ans-label">Correct Answer:</span>
                    <span className="ans-val">{currentQ.correctAns}</span>
                  </div>
                )}

                <div className="explanation-section">
                  <div className="expl-heading">
                    <Lightbulb size={15} />
                    <span>Explanation</span>
                  </div>
                  <p className="expl-text">{currentQ.explanation}</p>
                </div>
              </div>
            )}

            {/* Action Bar (Check Answer / Next Question / Try Again) */}
            <div className="question-actions-bar">
              {!isChecked ? (
                <button
                  type="button"
                  className="btn-primary check-ans-btn"
                  onClick={handleCheckAnswer}
                  disabled={!selectedOption}
                >
                  <span>Check Answer</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <div className="checked-actions-group">
                  {!isCorrect && (
                    <button
                      type="button"
                      className="btn-secondary try-again-btn"
                      onClick={handleTryAgain}
                    >
                      <RotateCcw size={14} />
                      <span>Try Again</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-primary next-q-btn"
                    onClick={handleNextQuestion}
                  >
                    <span>
                      {currentQIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 3. QUIZ COMPLETION / RESULTS SCREEN                                */}
      {/* ================================================================== */}
      {quizCompleted && !isReviewMode && (
        <div className="results-card">
          <div className="results-badge">🎉 QUIZ COMPLETED</div>
          <h1 className="results-topic-title">{topic.title}</h1>
          <p className="results-topic-sub">{topic.difficulty.toUpperCase()} LEVEL</p>

          <div className="score-circle-wrapper">
            <div className="score-main-display">
              <span className="score-ratio">
                {correctCount} / {questions.length}
              </span>
              <span className="score-percentage">{scorePercent}%</span>
            </div>
          </div>

          <div className="results-stats-row">
            <div className="result-stat-chip correct">
              <CheckCircle2 size={16} />
              <span>{correctCount} Correct</span>
            </div>
            <div className="result-stat-chip incorrect">
              <XCircle size={16} />
              <span>{incorrectCount} Incorrect</span>
            </div>
            <div className="result-stat-chip points">
              <Award size={16} />
              <span>
                Score: {totalScore} / {maxScore}
              </span>
            </div>
            <div className="result-stat-chip time">
              <Clock size={16} />
              <span>Time: {formatTime(elapsedSeconds)}</span>
            </div>
          </div>

          <div className="results-actions">
            <button
              onClick={() => setIsReviewMode(true)}
              className="btn-secondary action-btn review-btn"
            >
              <FileText size={15} />
              <span>Review Answers</span>
            </button>
            <button onClick={handleRetakeQuiz} className="btn-secondary action-btn retake-btn">
              <RotateCcw size={15} />
              <span>Retake Quiz</span>
            </button>
            <Link href="/challenges/quizzes" className="btn-primary action-btn topics-btn">
              <BookOpen size={15} />
              <span>Back to Topics</span>
            </Link>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 4. REVIEW ANSWERS SCREEN                                           */}
      {/* ================================================================== */}
      {quizCompleted && isReviewMode && (
        <div className="review-wrapper">
          <div className="review-top-bar">
            <div>
              <h2>📝 Answer Review — {topic.title}</h2>
              <p>Review every question, selected answers, and detailed technical explanations.</p>
            </div>
            <button onClick={() => setIsReviewMode(false)} className="btn-secondary back-results-btn">
              ← Back to Results
            </button>
          </div>

          <div className="review-questions-list">
            {questions.map((q, idx) => {
              const uAns = userAnswers[idx];
              const isUserCorrect = uAns ? uAns.correct : false;

              return (
                <div
                  key={q.id}
                  className={`review-item-card ${isUserCorrect ? 'correct' : 'wrong'}`}
                >
                  <div className="review-item-header">
                    <span className="review-q-num">Question {idx + 1}</span>
                    <span className={`review-status-tag ${isUserCorrect ? 'correct' : 'wrong'}`}>
                      {isUserCorrect ? '✓ Correct' : '✕ Incorrect'}
                    </span>
                  </div>

                  <h3 className="review-q-text">{q.question}</h3>

                  {q.codeSnippet && (
                    <div className="code-block-container" style={{ margin: '0.75rem 0' }}>
                      <pre className="code-content">
                        <code>{q.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  <div className="review-answers-grid">
                    <div className={`answer-pill user ${isUserCorrect ? 'correct' : 'wrong'}`}>
                      <span className="pill-lbl">Your Answer:</span>
                      <span className="pill-txt">{uAns ? uAns.selected : 'Not Answered'}</span>
                    </div>

                    {!isUserCorrect && (
                      <div className="answer-pill correct-key">
                        <span className="pill-lbl">Correct Answer:</span>
                        <span className="pill-txt">{q.correctAns}</span>
                      </div>
                    )}
                  </div>

                  <div className="review-expl-box">
                    <div className="expl-heading">
                      <Lightbulb size={14} />
                      <span>Explanation:</span>
                    </div>
                    <p>{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="review-bottom-actions">
            <button onClick={handleRetakeQuiz} className="btn-secondary action-btn">
              <RotateCcw size={15} />
              <span>Retake Quiz</span>
            </button>
            <Link href="/challenges/quizzes" className="btn-primary action-btn">
              <span>Back to Topics</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        .quiz-container-page {
          min-height: calc(100vh - 60px);
          padding: 2rem 2rem 5rem;
          max-width: 900px;
          margin: 0 auto;
          font-family: 'General Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .quiz-breadcrumb-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          margin-bottom: 2rem;
          color: var(--color-text-muted, #64748b);
        }

        .crumb-link {
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

        /* 1. Overview Screen */
        .quiz-overview-card {
          background: var(--color-bg-card, #10192e);
          border: 1px solid var(--color-border, #1e293b);
          border-radius: 16px;
          padding: 2.5rem;
        }

        .overview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .diff-tag {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
        }

        .topic-num-badge {
          font-family: var(--font-mono, monospace);
          font-size: 0.8rem;
          color: var(--color-text-muted, #94a3b8);
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

        .overview-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--color-text-primary, #ffffff);
          margin-bottom: 0.5rem;
        }

        .overview-subtitle {
          color: var(--color-text-secondary, #94a3b8);
          font-size: 1.05rem;
          margin-bottom: 1.5rem;
        }

        .overview-desc-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 1.25rem;
          margin-bottom: 2rem;
        }

        .overview-desc-box p {
          color: #cbd5e1;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }

        .overview-meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .meta-card {
          background: var(--color-bg-input, #0b1329);
          border: 1px solid var(--color-border, #1e293b);
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .meta-icon {
          color: var(--color-accent-cyan, #06d6a0);
          flex-shrink: 0;
        }

        .meta-info {
          display: flex;
          flex-direction: column;
        }

        .meta-label {
          font-size: 0.72rem;
          color: var(--color-text-muted, #94a3b8);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .meta-val {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-text-primary, #ffffff);
        }

        .overview-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .back-topics-btn {
          font-size: 0.9rem;
          padding: 0.75rem 1.25rem;
        }

        .start-quiz-main-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          padding: 0.75rem 1.75rem;
          font-weight: 700;
        }

        /* 2. Real Active Quiz Screen */
        .quiz-active-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .quiz-hud {
          background: var(--color-bg-card, #10192e);
          border: 1px solid var(--color-border, #1e293b);
          border-radius: 12px;
          padding: 1rem 1.5rem;
        }

        .hud-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .hud-topic-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--color-text-primary, #ffffff);
          margin-right: 0.75rem;
        }

        .hud-q-count {
          font-size: 0.85rem;
          color: var(--color-text-muted, #94a3b8);
        }

        .hud-stats-pills {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.76rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
        }

        .stat-pill.correct {
          background: rgba(6, 214, 160, 0.12);
          color: #06d6a0;
          border: 1px solid rgba(6, 214, 160, 0.25);
        }

        .stat-pill.incorrect {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .stat-pill.time {
          background: rgba(255, 255, 255, 0.04);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-family: var(--font-mono, monospace);
        }

        .hud-progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 999px;
          overflow: hidden;
        }

        .hud-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #06d6a0, #38bdf8);
          transition: width 0.3s ease;
        }

        .question-box {
          background: var(--color-bg-card, #10192e);
          border: 1px solid var(--color-border, #1e293b);
          border-radius: 16px;
          padding: 2.25rem;
        }

        .q-badge-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .q-index-pill {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-accent-cyan, #06d6a0);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .q-points-pill {
          font-size: 0.78rem;
          font-weight: 700;
          color: #fbbf24;
        }

        .q-prompt {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--color-text-primary, #ffffff);
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        /* Code Block Styling */
        .code-block-container {
          background: #080e1e;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          margin-bottom: 1.5rem;
          overflow: hidden;
        }

        .code-block-header {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.85rem;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          gap: 6px;
        }

        .code-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .code-dot.red { background: #ef4444; }
        .code-dot.yellow { background: #f59e0b; }
        .code-dot.green { background: #10b981; }

        .code-lang {
          font-size: 0.72rem;
          font-family: var(--font-mono, monospace);
          color: var(--color-text-muted, #64748b);
          margin-left: 0.5rem;
        }

        .code-content {
          padding: 1rem;
          margin: 0;
          font-family: var(--font-mono, monospace);
          font-size: 0.88rem;
          line-height: 1.5;
          color: #38bdf8;
          overflow-x: auto;
        }

        /* Options */
        .options-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.75rem;
        }

        .option-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--color-bg-input, #0b1329);
          border: 1px solid var(--color-border, #1e293b);
          border-radius: 10px;
          color: var(--color-text-secondary, #cbd5e1);
          font-size: 0.95rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .option-btn:hover:not(:disabled) {
          border-color: rgba(56, 189, 248, 0.4);
          background: rgba(56, 189, 248, 0.04);
          color: #ffffff;
        }

        .option-btn.selected {
          border-color: var(--color-accent-cyan, #06d6a0);
          background: rgba(6, 214, 160, 0.08);
          color: #ffffff;
        }

        .option-btn.correct-selected {
          border-color: #06d6a0;
          background: rgba(6, 214, 160, 0.15);
          color: #ffffff;
        }

        .option-btn.wrong-selected {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.15);
          color: #ffffff;
        }

        .option-btn.correct-reveal {
          border-color: #06d6a0;
          background: rgba(6, 214, 160, 0.08);
          color: #ffffff;
        }

        .option-btn.disabled {
          opacity: 0.6;
          cursor: default;
        }

        .opt-letter-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
          flex-shrink: 0;
          color: #94a3b8;
        }

        .option-btn.selected .opt-letter-circle {
          background: #06d6a0;
          color: #0b1329;
        }

        .option-btn.correct-selected .opt-letter-circle,
        .option-btn.correct-reveal .opt-letter-circle {
          background: #06d6a0;
          color: #0b1329;
        }

        .option-btn.wrong-selected .opt-letter-circle {
          background: #ef4444;
          color: #ffffff;
        }

        .opt-text {
          flex-grow: 1;
          line-height: 1.4;
        }

        .opt-status-icon.correct { color: #06d6a0; }
        .opt-status-icon.wrong { color: #ef4444; }

        /* Feedback Callout Box */
        .feedback-box {
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.75rem;
          animation: fadeIn 0.25s ease;
        }

        .feedback-box.correct {
          background: rgba(6, 214, 160, 0.08);
          border: 1px solid rgba(6, 214, 160, 0.3);
        }

        .feedback-box.wrong {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .feedback-header {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .feedback-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 0.2rem;
        }

        .feedback-box.correct .feedback-header h3 { color: #06d6a0; }
        .feedback-box.wrong .feedback-header h3 { color: #ef4444; }

        .feedback-header p {
          font-size: 0.88rem;
          color: var(--color-text-secondary, #94a3b8);
          margin: 0;
        }

        .feedback-icon.correct { color: #06d6a0; flex-shrink: 0; margin-top: 2px; }
        .feedback-icon.wrong { color: #ef4444; flex-shrink: 0; margin-top: 2px; }

        .correct-answer-banner {
          background: rgba(6, 214, 160, 0.1);
          border: 1px solid rgba(6, 214, 160, 0.2);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .ans-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #06d6a0;
          text-transform: uppercase;
        }

        .ans-val {
          font-size: 0.9rem;
          font-weight: 600;
          color: #ffffff;
        }

        .explanation-section {
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .expl-heading {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: #fbbf24;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.4rem;
        }

        .expl-text {
          font-size: 0.92rem;
          line-height: 1.6;
          color: #cbd5e1;
          margin: 0;
        }

        /* Question Actions */
        .question-actions-bar {
          display: flex;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .check-ans-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.75rem;
          font-size: 0.95rem;
          font-weight: 700;
        }

        .checked-actions-group {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          width: 100%;
          justify-content: flex-end;
        }

        .try-again-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.75rem 1.25rem;
          font-size: 0.88rem;
        }

        .next-q-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.75rem;
          font-size: 0.95rem;
          font-weight: 700;
        }

        /* 3. Results Screen */
        .results-card {
          background: var(--color-bg-card, #10192e);
          border: 1px solid var(--color-border, #1e293b);
          border-radius: 16px;
          padding: 3rem 2rem;
          text-align: center;
        }

        .results-badge {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--color-accent-cyan, #06d6a0);
          background: rgba(6, 214, 160, 0.1);
          border: 1px solid rgba(6, 214, 160, 0.25);
          border-radius: 999px;
          padding: 0.35rem 1rem;
          margin-bottom: 1rem;
        }

        .results-topic-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--color-text-primary, #ffffff);
          margin-bottom: 0.3rem;
        }

        .results-topic-sub {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--color-text-muted, #94a3b8);
          letter-spacing: 0.06em;
          margin-bottom: 2rem;
        }

        .score-circle-wrapper {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(6, 214, 160, 0.15) 0%, rgba(11, 19, 41, 0.8) 70%);
          border: 3px solid #06d6a0;
          box-shadow: 0 0 30px rgba(6, 214, 160, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2.5rem;
        }

        .score-main-display {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .score-ratio {
          font-size: 2.2rem;
          font-weight: 800;
          color: #ffffff;
        }

        .score-percentage {
          font-size: 1.1rem;
          font-weight: 700;
          color: #06d6a0;
        }

        .results-stats-row {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2.5rem;
        }

        .result-stat-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1.1rem;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 600;
        }

        .result-stat-chip.correct {
          background: rgba(6, 214, 160, 0.1);
          color: #06d6a0;
          border: 1px solid rgba(6, 214, 160, 0.25);
        }

        .result-stat-chip.incorrect {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .result-stat-chip.points {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.25);
        }

        .result-stat-chip.time {
          background: rgba(255, 255, 255, 0.04);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-family: var(--font-mono, monospace);
        }

        .results-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.75rem 1.5rem;
          font-size: 0.92rem;
          font-weight: 700;
          text-decoration: none;
        }

        /* 4. Review Answers Screen */
        .review-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .review-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .review-top-bar h2 {
          font-size: 1.6rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }

        .review-top-bar p {
          color: #94a3b8;
          font-size: 0.9rem;
          margin: 0;
        }

        .review-questions-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .review-item-card {
          background: var(--color-bg-card, #10192e);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid var(--color-border, #1e293b);
        }

        .review-item-card.correct {
          border-left: 4px solid #06d6a0;
        }

        .review-item-card.wrong {
          border-left: 4px solid #ef4444;
        }

        .review-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .review-q-num {
          font-size: 0.78rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .review-status-tag {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
        }

        .review-status-tag.correct {
          background: rgba(6, 214, 160, 0.12);
          color: #06d6a0;
        }

        .review-status-tag.wrong {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
        }

        .review-q-text {
          font-size: 1.1rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.4;
          margin-bottom: 1rem;
        }

        .review-answers-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .answer-pill {
          padding: 0.6rem 0.85rem;
          border-radius: 6px;
          font-size: 0.88rem;
          display: flex;
          gap: 0.5rem;
        }

        .answer-pill.user.correct {
          background: rgba(6, 214, 160, 0.1);
          border: 1px solid rgba(6, 214, 160, 0.25);
          color: #06d6a0;
        }

        .answer-pill.user.wrong {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #ef4444;
        }

        .answer-pill.correct-key {
          background: rgba(6, 214, 160, 0.12);
          border: 1px solid rgba(6, 214, 160, 0.3);
          color: #ffffff;
        }

        .pill-lbl {
          font-weight: 700;
          font-size: 0.76rem;
          text-transform: uppercase;
          opacity: 0.8;
          white-space: nowrap;
        }

        .pill-txt {
          font-weight: 600;
        }

        .review-expl-box {
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 0.75rem;
          font-size: 0.88rem;
          line-height: 1.5;
          color: #cbd5e1;
        }

        .review-expl-box p {
          margin: 0;
        }

        .review-bottom-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1.5rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .quiz-container-page {
            padding: 1.5rem 1rem 4rem;
          }
          .quiz-overview-card,
          .question-box,
          .results-card {
            padding: 1.5rem;
          }
          .overview-actions,
          .checked-actions-group {
            flex-direction: column;
            gap: 0.75rem;
          }
          .start-quiz-main-btn,
          .back-topics-btn,
          .try-again-btn,
          .next-q-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

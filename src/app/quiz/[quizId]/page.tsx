'use client';

import Link from 'next/link';
import { useState, use } from 'react';
import { quizzes } from '@/data/learning-content';

export default function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const quiz = quizzes.find(q => q.id === quizId);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!quiz) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Quiz not found</h2>
        <p style={{ color: 'var(--color-text-secondary)', margin: '0.5rem 0 1rem' }}>Available quizzes:</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {quizzes.map(q => (
            <Link key={q.id} href={`/quiz/${q.id}`} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              {q.title}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQ];
  const totalPoints = quiz.questions.reduce((a, q) => a + q.points, 0);
  const score = submitted ? quiz.questions.reduce((a, q, i) => a + (answers[i] === q.correctAns ? q.points : 0), 0) : 0;

  const handleAnswer = (ans: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [currentQ]: ans }));
  };

  const handleSubmit = () => setSubmitted(true);

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="quiz-header">
          <Link href="/learn" className="back-link">← Back to Learn</Link>
          <h2>📝 {quiz.title}</h2>
          <div className="quiz-progress">
            <span>Question {currentQ + 1} of {quiz.questions.length}</span>
            <div className="progress-bar" style={{ width: '200px' }}>
              <div className="progress-bar-fill" style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {!submitted ? (
          <>
            <div className="question-card card">
              <div className="q-header">
                <span className={`badge badge-${question.type === 'mcq' ? 'info' : question.type === 'truefalse' ? 'easy' : question.type === 'code_output' ? 'medium' : 'hard'}`}>
                  {question.type.replace('_', ' ')}
                </span>
                <span className="q-points">⭐ {question.points} pts</span>
              </div>
              <h3 className="q-text">{question.question}</h3>
              <div className="q-options">
                {question.options.map((opt, i) => (
                  <button
                    key={i}
                    className={`q-option ${answers[currentQ] === opt ? 'selected' : ''}`}
                    onClick={() => handleAnswer(opt)}
                  >
                    <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="quiz-nav">
              <button className="btn-secondary" disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)}>← Previous</button>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {Object.keys(answers).length}/{quiz.questions.length} answered
              </span>
              {currentQ < quiz.questions.length - 1 ? (
                <button className="btn-primary" onClick={() => setCurrentQ(currentQ + 1)}>Next →</button>
              ) : (
                <button className="btn-primary" onClick={handleSubmit} disabled={Object.keys(answers).length < quiz.questions.length}>
                  Submit Quiz
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="quiz-results">
            <div className="results-header card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <h2 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{score >= totalPoints * 0.8 ? '🎉' : score >= totalPoints * 0.5 ? '👍' : '📚'}</h2>
              <h3>Score: <span className="gradient-text">{score} / {totalPoints}</span></h3>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                {score >= totalPoints * 0.8 ? 'Excellent work!' : score >= totalPoints * 0.5 ? 'Good job! Review the explanations below.' : 'Keep learning! Review the material and try again.'}
              </p>
              <div className="progress-bar" style={{ maxWidth: '300px', margin: '1rem auto 0' }}>
                <div className="progress-bar-fill" style={{
                  width: `${(score / totalPoints) * 100}%`,
                  background: score >= totalPoints * 0.8 ? '#2dc653' : score >= totalPoints * 0.5 ? '#fbbf24' : '#ef4444'
                }} />
              </div>
            </div>

            <div className="results-list">
              {quiz.questions.map((q, i) => {
                const correct = answers[i] === q.correctAns;
                return (
                  <div key={i} className={`result-item card ${correct ? 'correct' : 'incorrect'}`}>
                    <div className="result-header">
                      <span>{correct ? '✅' : '❌'} Q{i + 1}: {q.question}</span>
                    </div>
                    <div className="result-answer">
                      <span>Your answer: <strong>{answers[i] || 'Not answered'}</strong></span>
                      {!correct && <span>Correct: <strong style={{ color: 'var(--color-success)' }}>{q.correctAns}</strong></span>}
                    </div>
                    <div className="result-explanation">
                      💡 {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/learn" className="btn-primary">Continue Learning →</Link>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .quiz-page { max-width: 800px; margin: 0 auto; padding: 2rem; padding-bottom: 4rem; }
        .quiz-header { margin-bottom: 2rem; }
        .back-link { color: var(--color-text-muted); text-decoration: none; font-size: 0.8rem; display: block; margin-bottom: 1rem; }
        .quiz-header h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.75rem; }
        .quiz-progress { display: flex; align-items: center; gap: 1rem; font-size: 0.85rem; color: var(--color-text-muted); }

        .question-card { padding: 2rem; }
        .q-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .q-points { font-size: 0.85rem; color: var(--color-accent-yellow); font-weight: 600; }
        .q-text { font-size: 1.1rem; font-weight: 600; line-height: 1.6; margin-bottom: 1.5rem; white-space: pre-wrap; }
        .q-options { display: flex; flex-direction: column; gap: 0.6rem; }
        .q-option {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem;
          border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg-input);
          color: var(--color-text-primary); font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
          text-align: left; width: 100%;
        }
        .q-option:hover { border-color: var(--color-accent-cyan); }
        .q-option.selected { border-color: var(--color-accent-cyan); background: rgba(6,214,160,0.08); }
        .opt-letter {
          width: 28px; height: 28px; border-radius: 6px; background: var(--color-bg-card); display: flex;
          align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; flex-shrink: 0;
        }
        .q-option.selected .opt-letter { background: var(--color-accent-cyan); color: #000; }

        .quiz-nav {
          display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;
        }
        .quiz-nav button:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Results */
        .results-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
        .result-item { padding: 1.25rem; }
        .result-item.correct { border-left: 3px solid var(--color-success); }
        .result-item.incorrect { border-left: 3px solid var(--color-error); }
        .result-header { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; }
        .result-answer { font-size: 0.85rem; color: var(--color-text-secondary); display: flex; flex-direction: column; gap: 0.2rem; margin-bottom: 0.5rem; }
        .result-explanation { font-size: 0.82rem; color: var(--color-text-muted); padding: 0.75rem; background: var(--color-bg-input); border-radius: 6px; line-height: 1.5; }
      `}</style>
    </div>
  );
}

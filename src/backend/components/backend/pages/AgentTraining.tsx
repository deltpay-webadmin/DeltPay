import React, { useMemo, useState } from 'react';
import {
  GraduationCap,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  BookOpen,
  XCircle,
} from 'lucide-react';
import { CURRICULUM, gradeQuiz, ALL_LESSON_IDS, type TrainingLesson, type TrainingModule } from '../trainingContent';
import { useTraining, trainingActions } from '../trainingStore';

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        className={`h-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Quiz({ lesson, onPassed }: { lesson: TrainingLesson; onPassed: (score: number) => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(lesson.quiz.map(() => null));
  const [result, setResult] = useState<{ correct: number; total: number; passed: boolean } | null>(null);

  const allAnswered = answers.every(a => a !== null);

  const submit = () => {
    const r = gradeQuiz(answers, lesson.quiz);
    setResult(r);
    if (r.passed) onPassed(r.correct / r.total);
  };

  return (
    <div className="rounded-[8px] border border-indigo-100 bg-indigo-50/40 p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-indigo-600" />
        Knowledge check — pass to complete this lesson
      </p>
      {lesson.quiz.map((q, qi) => (
        <div key={qi}>
          <p className="text-sm font-medium text-gray-800 mb-1.5">{qi + 1}. {q.q}</p>
          <div className="space-y-1">
            {q.options.map((opt, oi) => {
              const chosen = answers[qi] === oi;
              const showState = result !== null;
              const isRight = oi === q.answer;
              return (
                <button
                  key={oi}
                  onClick={() => {
                    if (result?.passed) return;
                    setResult(null);
                    setAnswers(prev => prev.map((a, i) => (i === qi ? oi : a)));
                  }}
                  className={`w-full text-left px-3 py-2 rounded-[6px] border text-sm transition-colors ${
                    showState && chosen && isRight ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    : showState && chosen && !isRight ? 'border-red-300 bg-red-50 text-red-700'
                    : chosen ? 'border-indigo-400 bg-white text-gray-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {result === null ? (
        <button
          onClick={submit}
          disabled={!allAnswered}
          className="px-4 py-2 rounded-[6px] text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          Submit answers
        </button>
      ) : result.passed ? (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
          <CheckCircle className="w-4 h-4" />
          Passed — {result.correct}/{result.total}. Lesson complete.
        </p>
      ) : (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
          <XCircle className="w-4 h-4" />
          {result.correct}/{result.total} — review the marked answers and try again.
        </p>
      )}
    </div>
  );
}

export function AgentTraining() {
  const { completed, isLoading } = useTraining();
  const [openModule, setOpenModule] = useState<TrainingModule | null>(null);
  const [openLesson, setOpenLesson] = useState<TrainingLesson | null>(null);

  const doneCount = useMemo(
    () => ALL_LESSON_IDS.filter(id => completed[id] != null).length,
    [completed],
  );
  const overallPct = Math.round((doneCount / ALL_LESSON_IDS.length) * 100);
  const certified = overallPct === 100;

  // ── Lesson view ──
  if (openModule && openLesson) {
    const lessonIdx = openModule.lessons.findIndex(l => l.id === openLesson.id);
    const next = openModule.lessons[lessonIdx + 1] ?? null;
    const isDone = completed[openLesson.id] != null;
    return (
      <div className="px-6 py-6 max-w-3xl mx-auto space-y-5">
        <button
          onClick={() => setOpenLesson(null)}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {openModule.title}
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{openLesson.title}</h2>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {openLesson.minutes} min read
            {isDone && <span className="inline-flex items-center gap-1 text-emerald-600 ml-2"><CheckCircle className="w-3 h-3" /> Completed</span>}
          </p>
        </div>
        <div className="space-y-4">
          {openLesson.paragraphs.map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-gray-700">{p}</p>
          ))}
        </div>
        <div className="rounded-[8px] bg-gray-50 border border-gray-200 px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Key points</p>
          <ul className="space-y-1">
            {openLesson.keyPoints.map((k, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                {k}
              </li>
            ))}
          </ul>
        </div>
        {!isDone ? (
          <Quiz
            lesson={openLesson}
            onPassed={score => void trainingActions.completeLesson(openLesson.id, score)}
          />
        ) : (
          <p className="text-sm text-gray-400">Knowledge check passed. Re-read anytime.</p>
        )}
        {next && (
          <button
            onClick={() => setOpenLesson(next)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[6px] text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Next: {next.title}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // ── Module view ──
  if (openModule) {
    const moduleDone = openModule.lessons.filter(l => completed[l.id] != null).length;
    return (
      <div className="px-6 py-6 max-w-3xl mx-auto space-y-5">
        <button
          onClick={() => setOpenModule(null)}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          All modules
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{openModule.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{openModule.description}</p>
        </div>
        <ProgressBar pct={Math.round((moduleDone / openModule.lessons.length) * 100)} />
        <div className="space-y-2">
          {openModule.lessons.map((l, i) => {
            const done = completed[l.id] != null;
            return (
              <button
                key={l.id}
                onClick={() => setOpenLesson(l)}
                className="w-full flex items-center gap-3 rounded-[8px] border border-gray-200 bg-white px-4 py-3 text-left hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                {done
                  ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  : <Circle className="w-5 h-5 text-gray-300 shrink-0" />}
                <span className="flex-1">
                  <span className="block text-sm font-medium text-gray-900">{i + 1}. {l.title}</span>
                  <span className="block text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {l.minutes} min + knowledge check
                  </span>
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Overview ──
  return (
    <div className="px-6 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-gray-500 max-w-xl">
          Merchant services, taught properly: how payments work, how pricing really breaks down,
          how to sell it honestly, and how to run your Delt book. Pass every knowledge check to
          earn your certification.
        </p>
        {certified && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-full shrink-0">
            <Award className="w-3.5 h-3.5" />
            Delt Certified — Merchant Services
          </span>
        )}
      </div>

      <div className="bg-white rounded-[8px] border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            Your progress
          </p>
          <span className="text-xs text-gray-400">
            {isLoading ? 'Loading…' : `${doneCount}/${ALL_LESSON_IDS.length} lessons`}
          </span>
        </div>
        <ProgressBar pct={overallPct} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CURRICULUM.map((m, i) => {
          const done = m.lessons.filter(l => completed[l.id] != null).length;
          const pct = Math.round((done / m.lessons.length) * 100);
          return (
            <button
              key={m.id}
              onClick={() => setOpenModule(m)}
              className="rounded-[8px] border border-gray-200 bg-white p-5 text-left hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-wide">Module {i + 1}</p>
                {pct === 100 && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{m.title}</p>
              <p className="text-xs text-gray-500 mb-3">{m.description}</p>
              <ProgressBar pct={pct} />
              <p className="text-[11px] text-gray-400 mt-1.5">{done}/{m.lessons.length} lessons · ~{m.lessons.reduce((s, l) => s + l.minutes, 0)} min</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

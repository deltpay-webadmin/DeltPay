import { describe, it, expect } from 'vitest';
import { CURRICULUM, ALL_LESSON_IDS, gradeQuiz, PASS_RATIO } from '../trainingContent';

describe('curriculum integrity', () => {
  it('has six modules with at least three lessons each', () => {
    expect(CURRICULUM).toHaveLength(6);
    for (const m of CURRICULUM) {
      expect(m.lessons.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('lesson ids are globally unique', () => {
    expect(new Set(ALL_LESSON_IDS).size).toBe(ALL_LESSON_IDS.length);
  });

  it('every lesson has content, key points, and a valid quiz', () => {
    for (const m of CURRICULUM) {
      for (const l of m.lessons) {
        expect(l.paragraphs.length).toBeGreaterThanOrEqual(2);
        expect(l.keyPoints.length).toBeGreaterThanOrEqual(3);
        expect(l.quiz.length).toBeGreaterThanOrEqual(2);
        for (const q of l.quiz) {
          expect(q.options.length).toBeGreaterThanOrEqual(3);
          expect(q.answer).toBeGreaterThanOrEqual(0);
          expect(q.answer).toBeLessThan(q.options.length);
        }
      }
    }
  });

  it('every lesson has a positive reading time', () => {
    for (const m of CURRICULUM) {
      for (const l of m.lessons) expect(l.minutes).toBeGreaterThan(0);
    }
  });
});

describe('gradeQuiz', () => {
  const quiz = CURRICULUM[0].lessons[0].quiz; // 3 questions

  it('passes a perfect score', () => {
    const r = gradeQuiz(quiz.map(q => q.answer), quiz);
    expect(r).toEqual({ correct: quiz.length, total: quiz.length, passed: true });
  });

  it('fails an empty submission', () => {
    const r = gradeQuiz(quiz.map(() => null), quiz);
    expect(r.correct).toBe(0);
    expect(r.passed).toBe(false);
  });

  it(`applies the ${Math.round(PASS_RATIO * 100)}% pass threshold on a 3-question quiz`, () => {
    // 2/3 correct passes; 1/3 fails.
    const twoRight = quiz.map((q, i) => (i < 2 ? q.answer : (q.answer + 1) % q.options.length));
    expect(gradeQuiz(twoRight, quiz).passed).toBe(true);
    const oneRight = quiz.map((q, i) => (i < 1 ? q.answer : (q.answer + 1) % q.options.length));
    expect(gradeQuiz(oneRight, quiz).passed).toBe(false);
  });
});

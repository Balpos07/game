'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { DEFAULT_TRIVIA_QUESTIONS } from '@/data/questions';
import { getFirebaseDb } from '@/lib/firebase';
import type { Question } from '@/types/quiz';

export function useQuestionBank() {
  const [questions, setQuestions] = useState(DEFAULT_TRIVIA_QUESTIONS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const db = getFirebaseDb();
    if (!db) {
      const timeoutId = window.setTimeout(() => setReady(true), 0);
      return () => window.clearTimeout(timeoutId);
    }

    return onSnapshot(collection(db, 'questions'), snapshot => {
      const questionsById = new Map(DEFAULT_TRIVIA_QUESTIONS.map(question => [question.id, question]));
      snapshot.docs.forEach(document => {
        const question = { id: document.id, ...document.data() } as Question;
        questionsById.set(question.id, question);
      });
      setQuestions([...questionsById.values()]);
      setReady(true);
    }, error => {
      console.error('Question bank error:', error);
      setReady(true);
    });
  }, []);

  return { questions, ready };
}

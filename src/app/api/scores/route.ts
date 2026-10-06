import { Timestamp } from 'firebase-admin/firestore';
import { DEFAULT_TRIVIA_QUESTIONS } from '@/data/questions';
import { getAdminFirestore, serverUnavailable, verifyGoogleUser } from '@/lib/firebaseAdmin';

type ScoreAnswer = { questionId: string; selectedOptionIndex: number };

const BASE_POINTS: Record<string, number> = { easy: 100, medium: 200, hard: 300 };

function isScoreAnswer(value: unknown): value is ScoreAnswer {
  if (!value || typeof value !== 'object') return false;
  const answer = value as Partial<ScoreAnswer>;
  return typeof answer.questionId === 'string'
    && answer.questionId.length > 0
    && Number.isInteger(answer.selectedOptionIndex)
    && (answer.selectedOptionIndex as number) >= -1
    && (answer.selectedOptionIndex as number) <= 3;
}

export async function POST(request: Request) {
  let user: Awaited<ReturnType<typeof verifyGoogleUser>>;
  try {
    user = await verifyGoogleUser(request);
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return Response.json({ error: 'Sign in with Google to submit a verified score.' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'GOOGLE_SIGN_IN_REQUIRED') {
      return Response.json({ error: 'Google sign-in is required for leaderboard scores.' }, { status: 403 });
    }
    return serverUnavailable(error);
  }

  let payload: { answers?: unknown; challengeId?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  if (!Array.isArray(payload.answers) || payload.answers.length < 1 || payload.answers.length > 100 || !payload.answers.every(isScoreAnswer)) {
    return Response.json({ error: 'Submit between 1 and 100 valid answers.' }, { status: 400 });
  }
  const answers = payload.answers;
  const questionIds = answers.map(answer => answer.questionId);
  if (new Set(questionIds).size !== questionIds.length) {
    return Response.json({ error: 'Duplicate question answers are not allowed.' }, { status: 400 });
  }
  if (payload.challengeId !== undefined && (typeof payload.challengeId !== 'string' || payload.challengeId.length > 80)) {
    return Response.json({ error: 'Challenge identifier is invalid.' }, { status: 400 });
  }

  try {
    const db = getAdminFirestore();
    const remoteQuestionSnapshots = await Promise.all(
      questionIds.map(questionId => db.collection('questions').doc(questionId).get()),
    );
    const questionBank = new Map(DEFAULT_TRIVIA_QUESTIONS.map(question => [question.id, question]));
    remoteQuestionSnapshots.forEach((snapshot, index) => {
      if (snapshot.exists) questionBank.set(questionIds[index], { id: snapshot.id, ...snapshot.data() } as typeof DEFAULT_TRIVIA_QUESTIONS[number]);
    });
    const questions = questionIds.map(id => questionBank.get(id));
    if (questions.some(question => !question || !Array.isArray(question.options) || !Number.isInteger(question.correct_option_index) || !BASE_POINTS[question.difficulty])) {
      return Response.json({ error: 'One or more questions are no longer available.' }, { status: 400 });
    }

    const verifiedAnswers = answers.map((answer, index) => {
      const question = questions[index]!;
      return {
        isCorrect: answer.selectedOptionIndex === question.correct_option_index,
        points: answer.selectedOptionIndex === question.correct_option_index ? BASE_POINTS[question.difficulty] : 0,
      };
    });
    const score = verifiedAnswers.reduce((total, answer) => total + answer.points, 0);
    const correctAnswers = verifiedAnswers.filter(answer => answer.isCorrect).length;
    const totalQuestions = answers.length;
    const entry = {
      uid: user.uid,
      name: user.name,
      score,
      correctAnswers,
      totalQuestions,
      date: Date.now(),
      verified: true,
    };

    if (typeof payload.challengeId === 'string') {
      const challengeRef = db.collection('challenges').doc(payload.challengeId);
      const challengeSnapshot = await challengeRef.get();
      if (!challengeSnapshot.exists) return Response.json({ error: 'This friend challenge does not exist.' }, { status: 404 });
      const challenge = challengeSnapshot.data()!;
      const challengeExpiry = challenge.expiresAt instanceof Timestamp
        ? challenge.expiresAt.toMillis()
        : Number(challenge.expiresAt);
      if (!Number.isFinite(challengeExpiry) || challengeExpiry < Date.now()) {
        return Response.json({ error: 'This friend challenge has expired.' }, { status: 410 });
      }
      if (!Array.isArray(challenge.participantUids) || !challenge.participantUids.includes(user.uid)) {
        return Response.json({ error: 'Join the friend challenge before submitting a score.' }, { status: 403 });
      }
      if (!Array.isArray(challenge.questionIds) || challenge.questionIds.length !== questionIds.length
        || !challenge.questionIds.every((id: unknown) => typeof id === 'string' && questionIds.includes(id))) {
        return Response.json({ error: 'Answers must match the challenge question set.' }, { status: 400 });
      }
      const scoreRef = challengeRef.collection('scores').doc(user.uid);
      await db.runTransaction(async transaction => {
        const previousScore = await transaction.get(scoreRef);
        if (previousScore.exists) throw new Error('CHALLENGE_SCORE_ALREADY_SUBMITTED');
        transaction.create(scoreRef, entry);
      });
      return Response.json({ score, correctAnswers, totalQuestions, verified: true });
    }

    const today = new Date().toISOString().slice(0, 10);
    const dailyScoreRef = db.collection('leaderboard').doc(`${user.uid}_${today}`);
    await db.runTransaction(async transaction => {
      const previousScore = await transaction.get(dailyScoreRef);
      if (previousScore.exists && (previousScore.data()?.score ?? 0) >= score) {
        return;
      }
      transaction.set(dailyScoreRef, {
        ...entry,
        date: previousScore.data()?.date ?? Date.now(),
      });
    });

    const profileRef = db.collection('profiles').doc(user.uid);
    const profileSnapshot = await profileRef.get();
    const crewId = profileSnapshot.data()?.crewId;
    if (typeof crewId === 'string') {
      const membership = await db.collection('crews').doc(crewId).collection('members').doc(user.uid).get();
      if (membership.exists) {
        await db.collection('crews').doc(crewId).collection('dailyScores').doc(`${user.uid}_${today}`).set({
          uid: user.uid,
          name: user.name,
          score,
          correctAnswers,
          totalQuestions,
          date: Date.now(),
          verified: true,
        }, { merge: true });
      }
    }
    return Response.json({ score, correctAnswers, totalQuestions, verified: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'CHALLENGE_SCORE_ALREADY_SUBMITTED') {
      return Response.json({ error: 'You have already submitted a score for this challenge.' }, { status: 409 });
    }
    if (error instanceof Error && error.message.includes('FIREBASE_SERVICE_ACCOUNT_JSON')) {
      return serverUnavailable(error);
    }
    return serverUnavailable(error);
  }
}

import { createHash, randomBytes } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { DEFAULT_TRIVIA_QUESTIONS } from '@/data/questions';
import { getAdminFirestore, serverUnavailable, verifyGoogleUser } from '@/lib/firebaseAdmin';

const hashCode = (code: string) => createHash('sha256').update(code.trim().toUpperCase()).digest('hex');

async function getUser(request: Request) {
  try {
    return await verifyGoogleUser(request);
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return Response.json({ error: 'Sign in with Google to use friend and crew challenges.' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'GOOGLE_SIGN_IN_REQUIRED') {
      return Response.json({ error: 'Google sign-in is required.' }, { status: 403 });
    }
    return serverUnavailable(error);
  }
}

export async function POST(request: Request) {
  const user = await getUser(request);
  if (user instanceof Response) return user;

  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  try {
    const db = getAdminFirestore();

    if (payload.action === 'create-challenge') {
      const questionIds = payload.questionIds;
      if (!Array.isArray(questionIds) || questionIds.length !== 5
        || !questionIds.every(id => typeof id === 'string' && id.length > 0)
        || new Set(questionIds).size !== questionIds.length) {
        return Response.json({ error: 'A friend challenge must contain five unique questions.' }, { status: 400 });
      }

      const questionSnapshots = await Promise.all(questionIds.map(id => db.collection('questions').doc(id as string).get()));
      const defaultQuestionIds = new Set(DEFAULT_TRIVIA_QUESTIONS.map(question => question.id));
      if (questionIds.some((id, index) => !questionSnapshots[index].exists && !defaultQuestionIds.has(id as string))) {
        return Response.json({ error: 'One or more challenge questions are unavailable.' }, { status: 400 });
      }

      const code = randomBytes(8).toString('hex').toUpperCase();
      const challengeId = hashCode(code);
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      await db.collection('challenges').doc(challengeId).set({
        ownerUid: user.uid,
        questionIds,
        category: typeof payload.category === 'string' ? payload.category.slice(0, 40) : 'mixed',
        participantUids: [user.uid],
        status: 'open',
        createdAt: Date.now(),
        expiresAt,
      });
      return Response.json({ code, challengeId, expiresAt });
    }

    if (payload.action === 'join-challenge') {
      if (typeof payload.code !== 'string' || !/^[A-F0-9]{16}$/i.test(payload.code.trim())) {
        return Response.json({ error: 'Enter a valid 16-character friend challenge code.' }, { status: 400 });
      }
      const challengeRef = db.collection('challenges').doc(hashCode(payload.code));
      const result = await db.runTransaction(async transaction => {
        const challengeSnapshot = await transaction.get(challengeRef);
        if (!challengeSnapshot.exists) return { error: 'Challenge code not found.' as const, status: 404 };
        const challenge = challengeSnapshot.data()!;
        if (Number(challenge.expiresAt) < Date.now()) return { error: 'This challenge has expired.' as const, status: 410 };
        if (!challenge.participantUids.includes(user.uid)) {
          if (challenge.participantUids.length >= 16) return { error: 'This challenge is full.' as const, status: 409 };
          transaction.update(challengeRef, { participantUids: FieldValue.arrayUnion(user.uid) });
        }
        return { challengeId: challengeRef.id, questionIds: challenge.questionIds as string[] };
      });
      if ('error' in result) return Response.json({ error: result.error }, { status: result.status });
      return Response.json(result);
    }

    if (payload.action === 'challenge-board') {
      if (typeof payload.challengeId !== 'string' || !/^[a-f0-9]{64}$/.test(payload.challengeId)) {
        return Response.json({ error: 'Challenge is invalid.' }, { status: 400 });
      }
      const challengeRef = db.collection('challenges').doc(payload.challengeId);
      const challengeSnapshot = await challengeRef.get();
      if (!challengeSnapshot.exists) return Response.json({ error: 'Challenge not found.' }, { status: 404 });
      const challenge = challengeSnapshot.data()!;
      if (!challenge.participantUids.includes(user.uid)) return Response.json({ error: 'Join this challenge to view its leaderboard.' }, { status: 403 });
      const scoreSnapshot = await challengeRef.collection('scores').get();
      const scores = scoreSnapshot.docs.map(score => {
        const data = score.data();
        return { name: data.name, score: data.score, correctAnswers: data.correctAnswers, totalQuestions: data.totalQuestions };
      }).sort((a, b) => b.score - a.score || b.correctAnswers - a.correctAnswers);
      return Response.json({ scores });
    }

    if (payload.action === 'create-crew') {
      if (typeof payload.name !== 'string' || payload.name.trim().length < 3 || payload.name.trim().length > 40) {
        return Response.json({ error: 'Crew name must be between 3 and 40 characters.' }, { status: 400 });
      }
      const code = randomBytes(8).toString('hex').toUpperCase();
      const crewId = hashCode(code);
      const crewRef = db.collection('crews').doc(crewId);
      const batch = db.batch();
      batch.set(crewRef, {
        name: payload.name.trim(),
        ownerUid: user.uid,
        joinCodeHash: crewId,
        memberCount: 1,
        createdAt: Date.now(),
      });
      batch.set(crewRef.collection('members').doc(user.uid), {
        uid: user.uid,
        name: user.name,
        joinedAt: Date.now(),
      });
      batch.set(db.collection('profiles').doc(user.uid), { crewId }, { merge: true });
      await batch.commit();
      return Response.json({ crewId, code, name: payload.name.trim() });
    }

    if (payload.action === 'join-crew') {
      if (typeof payload.code !== 'string' || !/^[A-F0-9]{16}$/i.test(payload.code.trim())) {
        return Response.json({ error: 'Enter a valid 16-character crew code.' }, { status: 400 });
      }
      const crewRef = db.collection('crews').doc(hashCode(payload.code));
      const result = await db.runTransaction(async transaction => {
        const crewSnapshot = await transaction.get(crewRef);
        if (!crewSnapshot.exists) return { error: 'Crew code not found.' as const, status: 404 };
        const crew = crewSnapshot.data()!;
        const memberRef = crewRef.collection('members').doc(user.uid);
        const memberSnapshot = await transaction.get(memberRef);
        if (!memberSnapshot.exists && crew.memberCount >= 100) return { error: 'This crew is full.' as const, status: 409 };
        if (!memberSnapshot.exists) {
          transaction.create(memberRef, { uid: user.uid, name: user.name, joinedAt: Date.now() });
          transaction.update(crewRef, { memberCount: FieldValue.increment(1) });
        }
        transaction.set(db.collection('profiles').doc(user.uid), { crewId: crewRef.id }, { merge: true });
        return { crewId: crewRef.id, name: crew.name };
      });
      if ('error' in result) return Response.json({ error: result.error }, { status: result.status });
      return Response.json(result);
    }

    if (payload.action === 'my-crew') {
      const profileSnapshot = await db.collection('profiles').doc(user.uid).get();
      const crewId = profileSnapshot.data()?.crewId;
      if (typeof crewId !== 'string') return Response.json({ crew: null });

      const crewRef = db.collection('crews').doc(crewId);
      const [crewSnapshot, membershipSnapshot] = await Promise.all([
        crewRef.get(),
        crewRef.collection('members').doc(user.uid).get(),
      ]);
      if (!crewSnapshot.exists || !membershipSnapshot.exists) {
        return Response.json({ error: 'Your crew membership could not be found.' }, { status: 404 });
      }

      const crew = crewSnapshot.data()!;
      return Response.json({
        crew: {
          id: crewRef.id,
          name: crew.name,
          memberCount: crew.memberCount,
        },
      });
    }

    if (payload.action === 'crew-board') {
      const profileSnapshot = await db.collection('profiles').doc(user.uid).get();
      const crewId = profileSnapshot.data()?.crewId;
      if (typeof crewId !== 'string') return Response.json({ error: 'Join a crew to view its leaderboard.' }, { status: 404 });
      const crewRef = db.collection('crews').doc(crewId);
      const crewSnapshot = await crewRef.get();
      if (!crewSnapshot.exists) return Response.json({ error: 'Your crew could not be found.' }, { status: 404 });
      const members = await crewRef.collection('members').get();
      const scores = await crewRef.collection('dailyScores').get();
      const today = new Date().toISOString().slice(0, 10);
      const latestScores = new Map<string, { name: string; score: number; correctAnswers: number; totalQuestions: number }>();
      scores.docs.forEach(scoreDoc => {
        const score = scoreDoc.data();
        if (!scoreDoc.id.endsWith(`_${today}`) || !members.docs.some(member => member.id === score.uid)) return;
        latestScores.set(score.uid, {
          name: score.name,
          score: score.score,
          correctAnswers: score.correctAnswers,
          totalQuestions: score.totalQuestions,
        });
      });
      return Response.json({
        crew: { id: crewRef.id, name: crewSnapshot.data()?.name, memberCount: members.size },
        scores: [...latestScores.values()].sort((a, b) => b.score - a.score || b.correctAnswers - a.correctAnswers),
      });
    }

    return Response.json({ error: 'Unknown competition action.' }, { status: 400 });
  } catch (error) {
    return serverUnavailable(error);
  }
}

import { addDoc, collection } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase';
import { getLocalDateKey } from '@/lib/playerProgress';

export type GameEventType = 'round_started' | 'round_completed' | 'challenge_created' | 'challenge_joined';

export function trackGameEvent(eventType: GameEventType, category: string) {
  const db = getFirebaseDb();
  const currentUser = getFirebaseAuth()?.currentUser;
  if (!db || !currentUser || currentUser.isAnonymous) return;
  void addDoc(collection(db, 'gameEvents'), {
    uid: currentUser.uid,
    eventType,
    category: category.slice(0, 40),
    dateKey: getLocalDateKey(new Date()),
    createdAt: Date.now(),
  }).catch(error => console.error('Gameplay event tracking failed:', error));
}

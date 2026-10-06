'use client';

import { useEffect, useRef, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DEFAULT_PLAYER_PROGRESS, mergePlayerProgress, parsePlayerProgress, PLAYER_PROGRESS_KEY, type PlayerProgress } from '@/lib/playerProgress';
import { getFirebaseDb } from '@/lib/firebase';

type CloudSync = {
  uid: string | null;
  status: 'loading' | 'ready' | 'error';
  error: string | null;
};

export function usePlayerProgress(uid: string | null, authLoading: boolean) {
  const [progress, setProgress] = useState<PlayerProgress>(DEFAULT_PLAYER_PROGRESS);
  const [progressOwner, setProgressOwner] = useState<string | null>(null);
  const [localReady, setLocalReady] = useState(false);
  const [cloudSync, setCloudSync] = useState<CloudSync>({ uid: null, status: 'loading', error: null });
  const cloudWriteQueue = useRef<Promise<void>>(Promise.resolve());
  const activeUid = useRef<string | null>(uid);

  const ready = localReady && !authLoading && progressOwner === uid && (
    !uid || (cloudSync.uid === uid && cloudSync.status !== 'loading')
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(PLAYER_PROGRESS_KEY);
        if (saved) setProgress(parsePlayerProgress(JSON.parse(saved)));
        setProgressOwner(null);
      } catch (error) {
        console.error('Could not load player progress:', error);
        setCloudSync(current => ({ ...current, error: 'Saved progress on this device could not be read.' }));
      } finally {
        setLocalReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!localReady || authLoading) return;
    activeUid.current = uid;

    if (!uid) {
      const timeoutId = window.setTimeout(() => {
        try {
          const guestProgress = window.localStorage.getItem(PLAYER_PROGRESS_KEY);
          setProgress(guestProgress ? parsePlayerProgress(JSON.parse(guestProgress)) : DEFAULT_PLAYER_PROGRESS);
          setProgressOwner(null);
        } catch (error) {
          console.error('Could not restore guest progress:', error);
          setCloudSync({ uid: null, status: 'error', error: 'Guest progress on this device could not be restored.' });
          return;
        }
        setCloudSync({ uid: null, status: 'ready', error: null });
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    let cancelled = false;
    let fallbackProgress = DEFAULT_PLAYER_PROGRESS;

    const syncAccountProgress = async () => {
      const db = getFirebaseDb();
      if (!db) throw new Error('Cloud progress is unavailable because Firebase is not configured.');

      const accountLocalProgress = window.localStorage.getItem(`${PLAYER_PROGRESS_KEY}:${uid}`);
      const guestLocalProgress = accountLocalProgress
        ? parsePlayerProgress(JSON.parse(accountLocalProgress))
        : (() => {
            const guest = window.localStorage.getItem(PLAYER_PROGRESS_KEY);
            return guest ? parsePlayerProgress(JSON.parse(guest)) : DEFAULT_PLAYER_PROGRESS;
          })();
      fallbackProgress = guestLocalProgress;

      const profileRef = doc(db, 'profiles', uid);
      const profileSnapshot = await getDoc(profileRef);
      const profileData = profileSnapshot.data();
      const accountProgress = profileData?.playerProgress
        ? parsePlayerProgress(profileData.playerProgress)
        : DEFAULT_PLAYER_PROGRESS;
      const mergedProgress = mergePlayerProgress(guestLocalProgress, accountProgress);
      const accountProgressJson = JSON.stringify(accountProgress);

      if (!profileData?.playerProgress || JSON.stringify(mergedProgress) !== accountProgressJson) {
        await setDoc(profileRef, {
          playerProgress: mergedProgress,
          playerProgressUpdatedAt: Date.now(),
        }, { merge: true });
      }

      if (cancelled) return;
      setProgress(mergedProgress);
      setProgressOwner(uid);
      setCloudSync({ uid, status: 'ready', error: null });
    };

    syncAccountProgress().catch((error: unknown) => {
      console.error('Could not sync player progress:', error);
      if (cancelled) return;
      setProgress(fallbackProgress);
      setProgressOwner(uid);
      setCloudSync({
        uid,
        status: 'error',
        error: error instanceof Error ? error.message : 'Player progress could not be synced.',
      });
    });

    return () => {
      cancelled = true;
    };
  }, [uid, authLoading, localReady]);

  useEffect(() => {
    if (!localReady || progressOwner !== uid) return;
    try {
      const key = uid ? `${PLAYER_PROGRESS_KEY}:${uid}` : PLAYER_PROGRESS_KEY;
      window.localStorage.setItem(key, JSON.stringify(progress));
    } catch (error) {
      console.error('Could not save local player progress:', error);
      window.setTimeout(() => {
        setCloudSync(current => ({
          ...current,
          error: 'Progress could not be saved on this device. Check your browser storage settings.',
        }));
      }, 0);
    }
  }, [progress, localReady, progressOwner, uid]);

  useEffect(() => {
    if (!uid || cloudSync.uid !== uid || cloudSync.status !== 'ready') return;

    const payload = {
      playerProgress: progress,
      playerProgressUpdatedAt: Date.now(),
    };
    cloudWriteQueue.current = cloudWriteQueue.current
      .catch(() => undefined)
      .then(async () => {
        const db = getFirebaseDb();
        if (!db) throw new Error('Cloud progress is unavailable because Firebase is not configured.');
        await setDoc(doc(db, 'profiles', uid), payload, { merge: true });
        if (activeUid.current === uid) {
          setCloudSync(current => current.uid === uid ? { ...current, error: null } : current);
        }
      })
      .catch((error: unknown) => {
        console.error('Could not save player progress to the account:', error);
        if (activeUid.current === uid) {
          setCloudSync(current => current.uid === uid
            ? {
                ...current,
                error: error instanceof Error ? error.message : 'Player progress could not be saved to your account.',
              }
            : current);
        }
      });
  }, [progress, uid, cloudSync.uid, cloudSync.status]);

  return {
    progress,
    setProgress,
    ready,
    error: cloudSync.error,
    cloudConnected: Boolean(uid && cloudSync.uid === uid && cloudSync.status === 'ready'),
  };
}

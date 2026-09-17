import { useCallback, useRef, useEffect } from 'react';

export function useSoundEffects() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize lazily to respect browser autoplay policies
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      if (audioCtxRef.current?.state !== 'closed') {
        audioCtxRef.current?.close();
      }
    };
  }, []);

  const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, vol = 0.1) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // Envelope to prevent clicking sounds
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(vol, ctx.currentTime + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, []);

  const playCorrect = useCallback(() => {
    // A nice ascending major third ding
    playTone(523.25, 'sine', 0.1, 0.2); // C5
    setTimeout(() => playTone(659.25, 'sine', 0.2, 0.2), 100); // E5
  }, [playTone]);

  const playIncorrect = useCallback(() => {
    // A harsh low buzzer
    playTone(150, 'sawtooth', 0.3, 0.1);
  }, [playTone]);

  const playTick = useCallback(() => {
    // A short click
    playTone(800, 'square', 0.05, 0.02);
  }, [playTone]);

  const playFinished = useCallback(() => {
    // Arpeggio up
    playTone(261.63, 'sine', 0.1, 0.2);
    setTimeout(() => playTone(329.63, 'sine', 0.1, 0.2), 100);
    setTimeout(() => playTone(392.00, 'sine', 0.1, 0.2), 200);
    setTimeout(() => playTone(523.25, 'sine', 0.4, 0.2), 300);
  }, [playTone]);

  return { playCorrect, playIncorrect, playTick, playFinished };
}

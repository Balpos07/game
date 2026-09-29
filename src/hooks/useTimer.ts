import { useState, useEffect, useCallback } from 'react';

export const useTimer = (initialSeconds: number, onExpire: () => void) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      const timeoutId = setTimeout(() => {
        setIsRunning(false);
        onExpire();
      }, 0);

      return () => clearTimeout(timeoutId);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, timeLeft, onExpire]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback((newInitialSeconds?: number) => {
    setIsRunning(false);
    setTimeLeft(newInitialSeconds ?? initialSeconds);
  }, [initialSeconds]);

  const addTime = useCallback((seconds: number) => {
    setTimeLeft((prev) => prev + seconds);
  }, []);

  return { timeLeft, isRunning, startTimer, stopTimer, resetTimer, addTime };
};

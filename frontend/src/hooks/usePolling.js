import { useEffect, useRef } from 'react';

export const usePolling = (callback, interval) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // interval
  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };

    if (interval !== null) {
      const id = setInterval(tick, interval);
      return () => clearInterval(id);
    }
  }, [interval]);
};

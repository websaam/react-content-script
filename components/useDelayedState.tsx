import { useState, useEffect, useRef } from "react";

type SetStateAction<S> = S | ((prevState: S) => S);

type DispatchWithDelay<S> = (action: SetStateAction<S>, delay: number) => void;

export const useDelayedState = <S,>(
  initialState: S | (() => S)
): [S, DispatchWithDelay<S>] => {
  const [state, setState] = useState(initialState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setDelayedState: DispatchWithDelay<S> = (action, delay) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(action);
      timeoutRef.current = null;
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, setDelayedState];
};

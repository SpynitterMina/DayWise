
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface ScoreContextType {
  score: number;
  addScore: (points: number) => void;
  spendScore: (points: number) => boolean; 
  resetScore: () => void;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

const SCORE_STORAGE_KEY = 'daywiseUserScore_v3'; // Incremented version

export const ScoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [score, setScore] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedScore = localStorage.getItem(SCORE_STORAGE_KEY);
      if (storedScore) {
        const parsedScore = parseInt(storedScore, 10);
        if (!isNaN(parsedScore)) {
          setScore(parsedScore);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(SCORE_STORAGE_KEY, score.toString());
    }
  }, [score, isInitialized]);

  const addScore = useCallback((points: number) => {
    setScore(prevScore => {
      const newScore = prevScore + points;
      return newScore < 0 ? 0 : newScore; 
    });
  }, []);

  const spendScore = useCallback((points: number): boolean => {
    if (score >= points) {
      setScore(prevScore => prevScore - points);
      return true;
    }
    return false;
  }, [score]);

  const resetScore = useCallback(() => {
    setScore(0);
  }, []);

  return (
    <ScoreContext.Provider value={{ score, addScore, spendScore, resetScore }}>
      {children}
    </ScoreContext.Provider>
  );
};

export const useScore = (): ScoreContextType => {
  const context = useContext(ScoreContext);
  if (context === undefined) {
    throw new Error('useScore must be used within a ScoreProvider');
  }
  return context;
};

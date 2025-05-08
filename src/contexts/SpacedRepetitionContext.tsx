
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { format, addDays, differenceInCalendarDays, parseISO, isSameDay, startOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export interface SpacedRepetitionTask {
  id: string;
  title: string;
  content?: string; 
  firstReviewDate: string; 
  lastReviewedDate?: string; 
  nextReviewDate: string; 
  difficulty?: 'easy' | 'medium' | 'hard';
  intervalDays: number; 
  timesReviewed: number;
  createdAt: string; 
}

interface SpacedRepetitionContextType {
  tasks: SpacedRepetitionTask[];
  addTask: (taskData: Omit<SpacedRepetitionTask, 'id' | 'nextReviewDate' | 'intervalDays' | 'timesReviewed' | 'createdAt'>) => void;
  updateTask: (taskId: string, updates: Partial<SpacedRepetitionTask>) => void;
  deleteTask: (taskId: string) => void;
  markAsReviewed: (taskId: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  getTasksForDate: (date: Date) => SpacedRepetitionTask[];
}

const SpacedRepetitionContext = createContext<SpacedRepetitionContextType | undefined>(undefined);

const SR_TASKS_STORAGE_KEY = 'daywiseSRTasks_v3'; // Incremented version

const getNextReviewDate = (lastReviewedDate: string, intervalDays: number): string => {
  return format(addDays(parseISO(lastReviewedDate), intervalDays), 'yyyy-MM-dd');
};


const calculateNextInterval = (currentInterval: number, difficulty: 'easy' | 'medium' | 'hard', timesReviewed: number): number => {
  let newInterval = currentInterval;
  if (timesReviewed === 0) { 
    if (difficulty === 'easy') newInterval = 4;
    else if (difficulty === 'medium') newInterval = 1;
    else newInterval = 1; 
  } else {
    if (difficulty === 'easy') newInterval = Math.max(1, Math.round(currentInterval * 2.0));
    else if (difficulty === 'medium') newInterval = Math.max(1, Math.round(currentInterval * 1.5));
    else newInterval = Math.max(1, Math.round(currentInterval * 0.8)); 
  }
  return Math.min(newInterval, 180); 
};


export const SpacedRepetitionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<SpacedRepetitionTask[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTasks = localStorage.getItem(SR_TASKS_STORAGE_KEY);
      if (storedTasks) {
        try {
          setTasks(JSON.parse(storedTasks));
        } catch (e) {
          console.error("Failed to parse SR tasks from localStorage", e);
          localStorage.removeItem(SR_TASKS_STORAGE_KEY);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(SR_TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isInitialized]);

  const addTask = useCallback((taskData: Omit<SpacedRepetitionTask, 'id' | 'nextReviewDate' | 'intervalDays' | 'timesReviewed' | 'createdAt'>) => {
    const newTask: SpacedRepetitionTask = {
      ...taskData,
      id: `sr_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      nextReviewDate: taskData.firstReviewDate, 
      intervalDays: 1, 
      timesReviewed: 0,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask].sort((a,b) => a.nextReviewDate.localeCompare(b.nextReviewDate)));
    toast({ title: "Review Item Added", description: `"${taskData.title}" scheduled for review.`});
  }, [toast]);

  const updateTask = useCallback((taskId: string, updates: Partial<SpacedRepetitionTask>) => {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, ...updates } : task)
                        .sort((a,b) => a.nextReviewDate.localeCompare(b.nextReviewDate)));
    toast({ title: "Review Item Updated", description: "Changes saved."});
  }, [toast]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({ title: "Review Item Deleted", variant: "destructive"});
  }, [toast]);

  const markAsReviewed = useCallback((taskId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    setTasks(prev => {
      const taskIndex = prev.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prev;

      const task = prev[taskIndex];
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      
      const newTimesReviewed = task.timesReviewed + 1;
      const newIntervalDays = calculateNextInterval(task.intervalDays, difficulty, newTimesReviewed);
      const newNextReviewDate = getNextReviewDate(todayStr, newIntervalDays);

      const updatedTask: SpacedRepetitionTask = {
        ...task,
        lastReviewedDate: todayStr,
        nextReviewDate: newNextReviewDate,
        difficulty,
        intervalDays: newIntervalDays,
        timesReviewed: newTimesReviewed,
      };
      
      const newTasks = [...prev];
      newTasks[taskIndex] = updatedTask;
      
      toast({
        title: "Item Reviewed!",
        description: `"${task.title}" next review on ${format(parseISO(newNextReviewDate), 'PPP')}.`
      });
      return newTasks.sort((a,b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
    });
  }, [toast]);

  const getTasksForDate = useCallback((date: Date): SpacedRepetitionTask[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(task => task.nextReviewDate === dateStr);
  }, [tasks]);

  return (
    <SpacedRepetitionContext.Provider value={{ tasks, addTask, updateTask, deleteTask, markAsReviewed, getTasksForDate }}>
      {children}
    </SpacedRepetitionContext.Provider>
  );
};

export const useSpacedRepetition = (): SpacedRepetitionContextType => {
  const context = useContext(SpacedRepetitionContext);
  if (context === undefined) {
    throw new Error('useSpacedRepetition must be used within a SpacedRepetitionProvider');
  }
  return context;
};

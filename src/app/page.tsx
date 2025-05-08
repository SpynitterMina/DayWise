
'use client';

import { useState, useEffect, useTransition, useCallback, useRef } from 'react';
import type { Task as AiTask, SuggestTaskOrderingOutput } from '@/ai/flows/suggest-task-ordering';
import { suggestTaskOrdering } from '@/ai/flows/suggest-task-ordering';
import TaskForm from '@/components/daywise/TaskForm';
import TaskList from '@/components/daywise/TaskList';
import LofiPlayer from '@/components/daywise/LofiPlayer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useScore } from '@/contexts/ScoreContext';
import { achievementService } from '@/services/achievementService';
import type { JournalEntry } from '@/components/journal/JournalEditor';
import { Lightbulb, ListChecks, CalendarDays, Zap, Trash2, Music2, Loader2, Filter, Search } from 'lucide-react';
import Image from 'next/image';
import { z } from 'zod';
import { format, isPast, endOfDay, parseISO } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';


export type TaskTimerState = 'idle' | 'running' | 'paused';

export interface Task extends AiTask {
  completed: boolean;
  actualTimeSpent: number; // in seconds
  timerState: TaskTimerState;
  currentSegmentStartTime?: number; // timestamp when current running segment started
  completedAt: string | null; // ISO string timestamp of completion
  category?: string; 
  scheduledDate?: string; // YYYY-MM-DD
  failed?: boolean; // New property
}

const TASKS_STORAGE_KEY = 'daywiseTasks_v3'; // Incremented version

export default function DayWisePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingAi, startAiTransition] = useTransition();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const { score, addScore, spendScore } = useScore(); 
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFailedTaskEffect, setShowFailedTaskEffect] = useState(false);


  const timerIntervalsRef = useRef<Map<string, NodeJS.Timeout | number>>(new Map());


  const checkTaskAchievements = useCallback(() => {
    if (!isClient) return;
    const storedJournalEntries = localStorage.getItem('daywiseJournalEntries_v3'); 
    const journalEntries: JournalEntry[] = storedJournalEntries ? JSON.parse(storedJournalEntries) : [];
    
    const unlockedAchievements = achievementService.checkAllAchievements({ tasks, journalEntries, score });
    unlockedAchievements.forEach(ach => {
      if (ach.newlyUnlocked && ach.achievement) {
        addScore(ach.achievement.points); 
        toast({
          title: "Achievement Unlocked!",
          description: `${ach.achievement.name}: ${ach.achievement.description} (+${ach.achievement.points} pts)`,
          duration: 5000,
        });
      }
    });
  }, [tasks, addScore, toast, isClient, score]); 

  const checkForFailedTasks = useCallback(() => {
    if (!isClient) return;
    let pointsToDeduct = 0;
    let failedTasksExist = false;

    const updatedTasks = tasks.map(task => {
      if (!task.completed && task.scheduledDate && isPast(endOfDay(parseISO(task.scheduledDate))) && !task.failed) {
        pointsToDeduct += 5; 
        failedTasksExist = true;
        return { ...task, failed: true };
      }
      return task;
    });

    if (failedTasksExist) {
      setTasks(updatedTasks);
      if (pointsToDeduct > 0) {
        spendScore(pointsToDeduct); 
        toast({
          title: "Tasks Overdue",
          description: `Some tasks are overdue. ${pointsToDeduct} points deducted.`,
          variant: "destructive",
          duration: 7000,
        });
        setShowFailedTaskEffect(true);
        setTimeout(() => setShowFailedTaskEffect(false), 1500); 
      }
    }
  }, [tasks, setTasks, spendScore, toast, isClient]);


  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient) {
      const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks) {
        try {
          const loadedTasks: Task[] = JSON.parse(storedTasks);
          setTasks(loadedTasks.map(task => ({
            ...task,
            actualTimeSpent: task.actualTimeSpent || 0,
            timerState: task.timerState || 'idle',
            currentSegmentStartTime: task.currentSegmentStartTime || undefined,
            completedAt: task.completedAt || null, 
            category: task.category || undefined,
            scheduledDate: task.scheduledDate || undefined,
            failed: task.failed || false,
          })));
        } catch (e) {
          console.error("Failed to parse tasks from localStorage", e);
          localStorage.removeItem(TASKS_STORAGE_KEY); 
        }
      }
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      checkForFailedTasks(); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, tasks.length]); 


  useEffect(() => {
    if (isClient) {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      checkTaskAchievements();
    }
  }, [tasks, isClient, checkTaskAchievements]);

  useEffect(() => {
    return () => {
      timerIntervalsRef.current.forEach(intervalId => clearInterval(intervalId as NodeJS.Timeout));
      timerIntervalsRef.current.clear();
    };
  }, []);


  const addTask = (newTaskData: Omit<Task, 'id' | 'completed' | 'actualTimeSpent' | 'timerState' | 'completedAt' | 'failed'>) => {
    const uniqueId = `task_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTask: Task = {
      ...newTaskData,
      id: uniqueId,
      completed: false,
      actualTimeSpent: 0,
      timerState: 'idle',
      completedAt: null,
      failed: false,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    toast({
      title: "Task Added",
      description: `"${newTask.description}" has been added to your list.`,
    });
  };

  const toggleTaskCompletion = (taskId: string) => {
    let taskJustCompleted = false;
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const newCompletedStatus = !task.completed;
          let newCompletedAt: string | null = task.completedAt;
          let newFailedStatus = task.failed;

          if (newCompletedStatus && !task.completed) { 
            taskJustCompleted = true;
            newCompletedAt = new Date().toISOString();
            newFailedStatus = false; 
          } else if (!newCompletedStatus && task.completed) { 
             newCompletedAt = null;
             if (task.scheduledDate && isPast(endOfDay(parseISO(task.scheduledDate)))) {
                newFailedStatus = true;
             }
          }
          
          let newTimerState = task.timerState;
          if (newCompletedStatus && task.timerState === 'running') {
            const intervalId = timerIntervalsRef.current.get(taskId);
            if (intervalId) {
              clearInterval(intervalId as NodeJS.Timeout);
              timerIntervalsRef.current.delete(taskId);
            }
            newTimerState = 'paused'; 
            if(activeTimerTaskId === taskId) setActiveTimerTaskId(null);
          }
          return { ...task, completed: newCompletedStatus, timerState: newTimerState, completedAt: newCompletedAt, failed: newFailedStatus };
        }
        return task;
      })
    );

    if (taskJustCompleted) {
      addScore(10); 
      toast({
        title: "Task Complete!",
        description: "+10 points!",
      });
    }
  };

  const deleteTask = (taskId: string) => {
    const intervalId = timerIntervalsRef.current.get(taskId);
    if (intervalId) {
      clearInterval(intervalId as NodeJS.Timeout);
      timerIntervalsRef.current.delete(taskId);
    }
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    if (activeTimerTaskId === taskId) {
      setActiveTimerTaskId(null);
    }
    toast({
      title: "Task Deleted",
      description: "The task has been removed.",
      variant: "destructive",
    });
  };

  const handleSuggestOrder = async () => {
    const activeTasks = tasks.filter(t => !t.completed && !t.failed);
    if (activeTasks.length < 2) {
      toast({
        title: "Not enough active tasks",
        description: "Please have at least two non-completed, non-failed tasks to suggest an order.",
        variant: "destructive",
      });
      return;
    }
    startAiTransition(async () => {
      try {
        const aiTasksInput = activeTasks.map(({ id, description, estimatedTime }) => ({ id, description, estimatedTime }));
        
        const orderedAiTasksResult: SuggestTaskOrderingOutput = await suggestTaskOrdering({ tasks: aiTasksInput });

        if (!orderedAiTasksResult || orderedAiTasksResult.length === 0) {
          toast({ title: "AI Suggestion", description: "The AI did not provide a new task order or encountered an issue.", variant: "default" });
          return;
        }
        
        const taskMap = new Map(tasks.map(task => [task.id, task]));
        const reorderedActiveTasks: Task[] = [];
        
        orderedAiTasksResult.forEach(aiTask => {
          const originalTask = taskMap.get(aiTask.id);
          if (originalTask && !originalTask.completed && !originalTask.failed) { 
            reorderedActiveTasks.push({ ...originalTask, ...aiTask }); 
          }
        });
        
        const completedAndFailedTasks = tasks.filter(t => t.completed || t.failed);
        const nonReorderedActiveTasks = activeTasks.filter(t => !reorderedActiveTasks.find(rt => rt.id === t.id));
        
        setTasks([...reorderedActiveTasks, ...nonReorderedActiveTasks, ...completedAndFailedTasks]);

        toast({
          title: "Tasks Reordered",
          description: "AI has suggested a new order for your active tasks.",
        });
      } catch (error) {
        console.error("Error suggesting task order:", error);
        toast({
          title: "AI Error",
          description: `Could not reorder tasks. ${error instanceof Error ? error.message : 'Please try again.'}`,
          variant: "destructive",
        });
      }
    });
  };

  const clearAllTasks = () => {
    timerIntervalsRef.current.forEach(intervalId => clearInterval(intervalId as NodeJS.Timeout));
    timerIntervalsRef.current.clear();
    setTasks([]);
    setActiveTimerTaskId(null);
    toast({
      title: "All Tasks Cleared",
      description: "Your task list is now empty.",
    });
  };

  const handleTimerAction = (taskId: string, action: 'start' | 'pause' | 'reset') => {
    setTasks(prevTasks => prevTasks.map(currentTask => {
      let task = {...currentTask}; 

      if (action === 'start' && task.id !== taskId && task.timerState === 'running') {
        const otherIntervalId = timerIntervalsRef.current.get(task.id);
        if (otherIntervalId) {
          clearInterval(otherIntervalId as NodeJS.Timeout);
          timerIntervalsRef.current.delete(task.id);
        }
        task.timerState = 'paused';
      }

      if (task.id === taskId) {
        const existingIntervalId = timerIntervalsRef.current.get(taskId);
        if (existingIntervalId) {
          clearInterval(existingIntervalId as NodeJS.Timeout);
          timerIntervalsRef.current.delete(taskId);
        }

        switch (action) {
          case 'start':
            setActiveTimerTaskId(taskId);
            task.timerState = 'running';
            task.currentSegmentStartTime = Date.now();
            const newIntervalId = setInterval(() => {
              setTasks(currentListOfTasks => currentListOfTasks.map(t => 
                t.id === taskId ? {...t, actualTimeSpent: t.actualTimeSpent + 1} : t
              ));
            }, 1000);
            timerIntervalsRef.current.set(taskId, newIntervalId);
            break;
          case 'pause':
            setActiveTimerTaskId(null);
            task.timerState = 'paused';
            break;
          case 'reset':
            setActiveTimerTaskId(null);
            task.timerState = 'idle';
            task.actualTimeSpent = 0;
            break;
        }
      }
      return task;
    }));
  };

  const addManualTime = (taskId: string, timeInMinutes: number) => {
    if (isNaN(timeInMinutes) || timeInMinutes < 0) {
        toast({ title: "Invalid Time", description: "Please enter a valid positive number for minutes.", variant: "destructive" });
        return;
    }
    const timeInSeconds = timeInMinutes * 60;
    setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
            return { ...task, actualTimeSpent: (task.actualTimeSpent || 0) + timeInSeconds };
        }
        return task;
    }));
    toast({ title: "Time Added", description: `${timeInMinutes} minutes added to task.` });
  };


  const filteredTasks = tasks.filter(task => {
    const matchesSearchTerm = task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    return matchesSearchTerm && matchesCategory;
  }).sort((a, b) => { 
      if (a.failed && !b.failed) return 1;
      if (!a.failed && b.failed) return -1;
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0; 
  });

  const uniqueCategories = ['all', ...new Set(tasks.map(task => task.category).filter(Boolean) as string[])];


  if (!isClient) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background p-4">
         <div className="animate-pulse text-primary flex flex-col items-center">
          <Loader2 size={64} className="mb-4 animate-spin" />
          <p className="text-2xl font-semibold">Loading DayWise Tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showFailedTaskEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-red-500/30 backdrop-blur-sm pointer-events-none"
          />
        )}
      </AnimatePresence>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-1 space-y-8">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <ListChecks size={28} className="mr-3 text-primary" />
                Add New Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm onSubmit={addTask} />
            </CardContent>
          </Card>
          
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
             <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Lightbulb size={28} className="mr-3 text-accent" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <Button 
                onClick={handleSuggestOrder} 
                disabled={isLoadingAi || tasks.filter(t => !t.completed && !t.failed).length < 2}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isLoadingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap size={20} className="mr-2" />}
                {isLoadingAi ? 'Optimizing...' : 'Suggest Optimal Order'}
              </Button>
              <Button 
                onClick={clearAllTasks} 
                disabled={tasks.length === 0}
                variant="destructive" 
                className="w-full"
              >
                <Trash2 size={20} className="mr-2" />
                Clear All Tasks
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Music2 size={28} className="mr-3 text-primary" />
                Focus Music
              </CardTitle>
              <CardDescription>Set the mood for productivity.</CardDescription>
            </CardHeader>
            <CardContent>
              <LofiPlayer />
            </CardContent>
          </Card>

        </section>

        <section className="lg:col-span-2">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 min-h-[calc(100vh-12rem)]"> 
            <CardHeader>
              <CardTitle className="flex items-center text-3xl">
                <CalendarDays size={32} className="mr-3 text-primary" />
                Today's Schedule
              </CardTitle>
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="search"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <Separator className="my-4" />
            <CardContent>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Image 
                    src="https://picsum.photos/seed/productivity/400/300" 
                    alt="No tasks yet" 
                    width={300} 
                    height={225} 
                    className="mx-auto rounded-lg shadow-md mb-6"
                    data-ai-hint="empty state productivity"
                  />
                  <p className="text-xl text-muted-foreground">
                    {tasks.length === 0 ? "Your schedule is empty." : "No tasks match your filters."}
                  </p>
                  <p className="text-muted-foreground">
                    {tasks.length === 0 ? "Add some tasks to get started!" : "Try adjusting your search or category filter."}
                  </p>
                </div>
              ) : (
                <TaskList 
                  tasks={filteredTasks} 
                  setTasks={setTasks} 
                  onToggle={toggleTaskCompletion} 
                  onDelete={deleteTask}
                  onTimerAction={handleTimerAction}
                  activeTimerTaskId={activeTimerTaskId}
                  onAddManualTime={addManualTime}
                />
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}

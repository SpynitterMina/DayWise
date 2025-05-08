
import type { Task } from '@/app/page';
import type { JournalEntry } from '@/components/journal/JournalEditor';
import { format, parseISO, differenceInCalendarDays, startOfWeek, isWithinInterval, subDays, getDay, getHours } from 'date-fns';

export type AchievementID =
  
  | 'INITIATE'
  | 'DAILY_DYNAMO'
  | 'WEEKLY_WARRIOR'
  | 'STREAK_STARTER'
  | 'PLANNER_PRO'
  | 'TENACIOUS_TEN'
  | 'QUARTER_CENTURY_CLUB'
  | 'FIFTY_FINISHER'
  | 'CENTURION'
  | 'TASK_TITAN'
  | 'POINT_PIONEER'
  | 'HIGH_ROLLER'
  | 'ON_FIRE'
  | 'EARLY_BIRD'
  | 'NIGHT_OWL'
  | 'PERFECT_DAY' 
  | 'FLAWLESS_WEEK'
  | 'SUBJECT_SAVANT'
  | 'MARATHONER'
  | 'COMEBACK_KID'
  | 'META_ACHIEVER'
  
  | 'FIRST_JOURNAL_ENTRY'
  | 'FIVE_JOURNAL_ENTRIES'
  | 'TIME_TRACKER_MASTER_LV1'
  | 'TIME_TRACKER_MASTER_LV2';

export interface AchievementDefinition {
  id: AchievementID;
  name: string;
  description: string;
  icon: string;
  points: number;
  isSecret?: boolean;
  checkCondition: (data: AchievementCheckData) => boolean;
}

export interface UserAchievement {
  id: AchievementID;
  unlockedAt: string;
}

interface AchievementCheckData {
  tasks: Task[]; 
  journalEntries: JournalEntry[];
  score: number;
  allUserAchievements: UserAchievement[];
}

const ACHIEVEMENTS_STORAGE_KEY = 'daywiseUserAchievements_v5'; // Incremented version

const getUniqueCompletionDatesISO = (tasks: Task[]): string[] => {
  const dates = new Set<string>();
  tasks.forEach(task => {
    if (task.completed && task.completedAt) {
      try {
        dates.add(format(parseISO(task.completedAt), 'yyyy-MM-dd'));
      } catch (e) {
        console.warn(`Invalid date format for task ${task.id}: ${task.completedAt}`);
      }
    }
  });
  return Array.from(dates).sort((a, b) => a.localeCompare(b));
};


const achievementDefinitions: AchievementDefinition[] = [
  {
    id: 'INITIATE',
    name: 'Initiate!',
    description: 'Complete your first task.',
    icon: 'CheckSquare',
    points: 5,
    checkCondition: ({ tasks }) => tasks.some(t => t.completed),
  },
  {
    id: 'DAILY_DYNAMO',
    name: 'Daily Dynamo',
    description: 'Complete at least one task for 3 days in a row.',
    icon: 'Repeat',
    points: 10,
    checkCondition: ({ tasks }) => {
      const uniqueDates = getUniqueCompletionDatesISO(tasks);
      if (uniqueDates.length < 3) return false;
      for (let i = 0; i <= uniqueDates.length - 3; i++) {
        const d1 = parseISO(uniqueDates[i]);
        const d2 = parseISO(uniqueDates[i+1]);
        const d3 = parseISO(uniqueDates[i+2]);
        if (differenceInCalendarDays(d2, d1) === 1 && differenceInCalendarDays(d3, d2) === 1) {
          return true;
        }
      }
      return false;
    },
  },
  {
    id: 'WEEKLY_WARRIOR',
    name: 'Weekly Warrior',
    description: 'Complete tasks on 5 different days in a single week.',
    icon: 'CalendarCheck',
    points: 15,
    checkCondition: ({ tasks }) => {
      const completionDates = tasks
        .filter(t => t.completed && t.completedAt)
        .map(t => parseISO(t.completedAt!));

      if (completionDates.length === 0) return false;

      const activityByWeek: Record<string, Set<string>> = {};
      completionDates.forEach(date => {
        const weekStartStr = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'); 
        if (!activityByWeek[weekStartStr]) {
          activityByWeek[weekStartStr] = new Set();
        }
        activityByWeek[weekStartStr].add(format(date, 'yyyy-MM-dd'));
      });
      return Object.values(activityByWeek).some(daysInWeek => daysInWeek.size >= 5);
    },
  },
  {
    id: 'STREAK_STARTER',
    name: 'Streak Starter',
    description: 'Achieve a 7-day task completion streak.',
    icon: 'Flame',
    points: 20,
    checkCondition: ({ tasks }) => {
      const uniqueDates = getUniqueCompletionDatesISO(tasks);
      if (uniqueDates.length < 7) return false;
      
      let maxStreak = 0;
      let currentStreak = 0;
      if (uniqueDates.length > 0) {
          currentStreak = 1;
          maxStreak = 1;
          for (let i = 1; i < uniqueDates.length; i++) {
              const currentDate = parseISO(uniqueDates[i]);
              const previousDate = parseISO(uniqueDates[i-1]);
              if (differenceInCalendarDays(currentDate, previousDate) === 1) {
                  currentStreak++;
              } else {
                  currentStreak = 1; 
              }
              if (currentStreak > maxStreak) {
                  maxStreak = currentStreak;
              }
          }
      }
      return maxStreak >= 7;
    },
  },
  {
    id: 'PLANNER_PRO',
    name: 'Planner Pro',
    description: 'Schedule tasks for a full week ahead.',
    icon: 'CalendarRange',
    points: 25,
    checkCondition: ({ tasks }) => {
        
        if (!tasks.some(t => t.scheduledDate)) return false;

        const today = new Date();
        const nextSevenDays = Array.from({length: 7}, (_, i) => format(subDays(today, -i), 'yyyy-MM-dd')); 
        
        const scheduledDates = new Set(tasks.filter(t => t.scheduledDate).map(t => t.scheduledDate));

        return nextSevenDays.every(day => scheduledDates.has(day));
    },
  },
  {
    id: 'TENACIOUS_TEN',
    name: 'Tenacious Ten',
    description: 'Complete 10 tasks successfully.',
    icon: 'ListChecks',
    points: 10,
    checkCondition: ({ tasks }) => tasks.filter(t => t.completed).length >= 10,
  },
  {
    id: 'QUARTER_CENTURY_CLUB',
    name: 'Quarter Century Club',
    description: 'Complete 25 tasks.',
    icon: 'Gem',
    points: 25,
    checkCondition: ({ tasks }) => tasks.filter(t => t.completed).length >= 25,
  },
  {
    id: 'FIFTY_FINISHER',
    name: 'Fifty Finisher',
    description: 'Complete 50 tasks.',
    icon: 'Medal',
    points: 50,
    checkCondition: ({ tasks }) => tasks.filter(t => t.completed).length >= 50,
  },
  {
    id: 'CENTURION',
    name: 'Centurion',
    description: 'Complete 100 tasks.',
    icon: 'ShieldCheck',
    points: 100,
    checkCondition: ({ tasks }) => tasks.filter(t => t.completed).length >= 100,
  },
  {
    id: 'TASK_TITAN',
    name: 'Task Titan',
    description: 'Complete 250 tasks.',
    icon: 'Crown',
    points: 150,
    checkCondition: ({ tasks }) => tasks.filter(t => t.completed).length >= 250,
  },
  {
    id: 'POINT_PIONEER',
    name: 'Point Pioneer',
    description: 'Earn your first 100 points.',
    icon: 'Star',
    points: 10, 
    checkCondition: ({ score }) => score >= 100,
  },
  {
    id: 'HIGH_ROLLER',
    name: 'High Roller',
    description: 'Earn 1,000 points.',
    icon: 'Stars',
    points: 25,
    checkCondition: ({ score }) => score >= 1000,
  },
  {
    id: 'ON_FIRE',
    name: 'On Fire!',
    description: 'Complete 5 tasks in a single day.',
    icon: 'Zap',
    points: 20,
    checkCondition: ({ tasks }) => {
      const tasksByCompletionDay: Record<string, number> = {};
      tasks.forEach(task => {
        if (task.completed && task.completedAt) {
          try {
            const day = format(parseISO(task.completedAt), 'yyyy-MM-dd');
            tasksByCompletionDay[day] = (tasksByCompletionDay[day] || 0) + 1;
          } catch {}
        }
      });
      return Object.values(tasksByCompletionDay).some(count => count >= 5);
    },
  },
  {
    id: 'EARLY_BIRD',
    name: 'Early Bird',
    description: 'Complete a task before 9 AM.',
    icon: 'Sunrise',
    points: 10,
    checkCondition: ({ tasks }) => {
      return tasks.some(t => {
        if (t.completed && t.completedAt) {
          try {
            return getHours(parseISO(t.completedAt)) < 9;
          } catch { return false; }
        }
        return false;
      });
    },
  },
  {
    id: 'NIGHT_OWL',
    name: 'Night Owl',
    description: 'Complete a task after 9 PM.',
    icon: 'Moon',
    points: 10,
    checkCondition: ({ tasks }) => {
      return tasks.some(t => {
        if (t.completed && t.completedAt) {
           try {
            return getHours(parseISO(t.completedAt)) >= 21; 
          } catch { return false; }
        }
        return false;
      });
    },
  },
  {
    id: 'PERFECT_DAY',
    name: 'Perfect Day',
    description: 'Complete all planned tasks for a single day (min. 3 tasks).',
    icon: 'Award',
    points: 50,
    checkCondition: ({ tasks }) => {
        const tasksByScheduledDay: Record<string, Task[]> = {};
        tasks.forEach(task => {
            const scheduleDay = task.scheduledDate ? task.scheduledDate : (task.completedAt ? format(parseISO(task.completedAt), 'yyyy-MM-dd') : null);
            if (scheduleDay) {
                if (!tasksByScheduledDay[scheduleDay]) {
                    tasksByScheduledDay[scheduleDay] = [];
                }
                tasksByScheduledDay[scheduleDay].push(task);
            }
        });

        return Object.values(tasksByScheduledDay).some(dayTasks => {
            const plannedTasks = dayTasks.filter(t => t.scheduledDate || t.completedAt); 
            return plannedTasks.length >= 3 && plannedTasks.every(t => t.completed && t.completedAt && format(parseISO(t.completedAt), 'yyyy-MM-dd') === (t.scheduledDate || format(parseISO(t.completedAt), 'yyyy-MM-dd')));
        });
    },
  },
  {
    id: 'FLAWLESS_WEEK',
    name: 'Flawless Week',
    description: 'Complete all scheduled tasks for an entire week (min. 1 task per day, 5 days).',
    icon: 'CalendarHeart',
    points: 100,
    checkCondition: ({ tasks }) => {
        
        if (!tasks.some(t => t.scheduledDate)) return false;

        const tasksByWeek: Record<string, { scheduled: Task[], completedOnTime: Task[] }> = {};

        tasks.forEach(task => {
            if (task.scheduledDate) {
                try {
                    const scheduleDateObj = parseISO(task.scheduledDate);
                    const weekStartStr = format(startOfWeek(scheduleDateObj, { weekStartsOn: 1 }), 'yyyy-MM-dd');
                    if (!tasksByWeek[weekStartStr]) {
                        tasksByWeek[weekStartStr] = { scheduled: [], completedOnTime: [] };
                    }
                    tasksByWeek[weekStartStr].scheduled.push(task);
                    if (task.completed && task.completedAt) {
                        if (format(parseISO(task.completedAt), 'yyyy-MM-dd') === task.scheduledDate) {
                            tasksByWeek[weekStartStr].completedOnTime.push(task);
                        }
                    }
                } catch {}
            }
        });
        
        return Object.values(tasksByWeek).some(weekData => {
            if (weekData.scheduled.length === 0) return false;
            const uniqueScheduledDays = new Set(weekData.scheduled.map(t => t.scheduledDate)).size;
            return uniqueScheduledDays >= 5 && weekData.scheduled.length === weekData.completedOnTime.length;
        });
    },
  },
  {
    id: 'SUBJECT_SAVANT',
    name: 'Subject Savant',
    description: 'Complete 10 tasks in 3 different self-defined subjects/categories.',
    icon: 'Library',
    points: 30,
    checkCondition: ({ tasks }) => {
      if (!tasks.some(t => t.category)) return false;
      const completedTasksWithCategory = tasks.filter(t => t.completed && t.category);
      const tasksByCategory: Record<string, number> = {};
      completedTasksWithCategory.forEach(task => {
        const category = task.category!;
        tasksByCategory[category] = (tasksByCategory[category] || 0) + 1;
      });
      const categoriesWith10Tasks = Object.values(tasksByCategory).filter(count => count >= 10).length;
      return categoriesWith10Tasks >= 3;
    },
  },
  {
    id: 'MARATHONER',
    name: 'Marathoner',
    description: 'Complete a task that you estimated would take over 2 hours.',
    icon: 'Waypoints',
    points: 25,
    checkCondition: ({ tasks }) => tasks.some(t => t.completed && t.estimatedTime > 120),
  },
  {
    id: 'COMEBACK_KID',
    name: 'Comeback Kid',
    description: 'Complete a task after missing a day in your streak.',
    icon: 'Undo2',
    points: 15,
    checkCondition: ({ tasks }) => {
      const uniqueDates = getUniqueCompletionDatesISO(tasks);
      if (uniqueDates.length < 2) return false; 

      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
      const dayBeforeYesterdayStr = format(subDays(today, 2), 'yyyy-MM-dd');

      const completedToday = uniqueDates.includes(todayStr);
      const completedYesterday = uniqueDates.includes(yesterdayStr);
      const completedDayBeforeYesterday = uniqueDates.includes(dayBeforeYesterdayStr);

      return completedToday && !completedYesterday && completedDayBeforeYesterday;
    },
  },
  {
    id: 'META_ACHIEVER',
    name: 'Meta Achiever',
    description: 'Unlock 5 other achievements.',
    icon: 'Combine',
    points: 30,
    
    checkCondition: ({ allUserAchievements }) => allUserAchievements.filter(ach => ach.id !== 'META_ACHIEVER').length >= 5,
  },
  {
    id: 'FIRST_JOURNAL_ENTRY',
    name: 'Reflective Start',
    description: 'Write your first journal entry.',
    icon: 'BookOpen',
    points: 10,
    checkCondition: ({ journalEntries }) => journalEntries.length >= 1,
  },
  {
    id: 'FIVE_JOURNAL_ENTRIES',
    name: 'Consistent Chronicler',
    description: 'Write 5 journal entries.',
    icon: 'NotebookText',
    points: 20,
    checkCondition: ({ journalEntries }) => journalEntries.length >= 5,
  },
  {
    id: 'TIME_TRACKER_MASTER_LV1',
    name: 'Time Apprentice',
    description: 'Track a total of 1 hour across your tasks.',
    icon: 'Hourglass',
    points: 15,
    checkCondition: ({ tasks }) => tasks.reduce((total, t) => total + (t.actualTimeSpent || 0), 0) >= 3600, 
  },
  {
    id: 'TIME_TRACKER_MASTER_LV2',
    name: 'Time Journeyman',
    description: 'Track a total of 5 hours across your tasks.',
    icon: 'Timer', 
    points: 30,
    checkCondition: ({ tasks }) => tasks.reduce((total, t) => total + (t.actualTimeSpent || 0), 0) >= 18000, 
  },
];

function loadUserAchievements(): UserAchievement[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse achievements from localStorage", e);
    localStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY);
    return [];
  }
}

function saveUserAchievements(achievements: UserAchievement[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
}

function unlockAchievement(id: AchievementID): { achievement: AchievementDefinition | undefined, newlyUnlocked: boolean } {
  let userAchievements = loadUserAchievements(); 
  if (userAchievements.some(ach => ach.id === id)) {
    return { achievement: achievementDefinitions.find(def => def.id === id), newlyUnlocked: false };
  }

  const definition = achievementDefinitions.find(def => def.id === id);
  if (definition) {
    const newAchievement: UserAchievement = {
      id,
      unlockedAt: new Date().toISOString(),
    };
    userAchievements.push(newAchievement);
    saveUserAchievements(userAchievements);
    return { achievement: definition, newlyUnlocked: true };
  }
  return { achievement: undefined, newlyUnlocked: false };
}

function checkAllAchievements(data: { tasks: Task[]; journalEntries: JournalEntry[]; score: number }): Array<{achievement: AchievementDefinition | undefined, newlyUnlocked: boolean}> {
  const unlockedResults: Array<{achievement: AchievementDefinition | undefined, newlyUnlocked: boolean}> = [];
  
  const achievementsBeforeThisCheck = loadUserAchievements(); 

  for (const def of achievementDefinitions) {
    
    if (!achievementsBeforeThisCheck.some(ach => ach.id === def.id)) { 
      const dataForCondition: AchievementCheckData = {
        tasks: data.tasks,
        journalEntries: data.journalEntries,
        score: data.score,
        allUserAchievements: achievementsBeforeThisCheck, 
      };

      if (def.checkCondition(dataForCondition)) {
        const result = unlockAchievement(def.id); 
        if(result.newlyUnlocked) {
           unlockedResults.push(result);
           
        }
      }
    }
  }
  return unlockedResults;
}

function getAllAchievementDefinitions(): AchievementDefinition[] {
  
  return [...achievementDefinitions];
}

export const achievementService = {
  loadUserAchievements,
  checkAllAchievements,
  getAllAchievementDefinitions,
};

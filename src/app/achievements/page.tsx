
'use client';

import { useEffect, useState } from 'react';
import { achievementService, type UserAchievement, type AchievementDefinition } from '@/services/achievementService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, Lock, Trophy, Award, Zap, ListChecks, BookOpen, Hourglass, Timer as TimerIconLucide, CheckSquare, NotebookText, Loader2,
  Repeat, CalendarCheck, Flame, CalendarRange, Gem, Medal, ShieldCheck, Crown, Star, Stars, Sunrise, Moon, CalendarHeart, Library, Waypoints, Undo2, Combine 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { LucideProps } from 'lucide-react'; 
import React from 'react';
import { useScore } from '@/contexts/ScoreContext'; // Import useScore to pass score to achievement checker

interface AchievementStatus extends AchievementDefinition {
  unlocked: boolean;
  unlockedAt?: string;
}

const iconMap: Record<string, React.FC<LucideProps>> = {
  CheckSquare: CheckSquare,
  ListChecks: ListChecks,
  Zap: Zap,
  Award: Award,
  BookOpen: BookOpen,
  NotebookText: NotebookText,
  Hourglass: Hourglass,
  Timer: TimerIconLucide, 
  Repeat: Repeat, 
  CalendarCheck: CalendarCheck, 
  Flame: Flame, 
  CalendarRange: CalendarRange, 
  Gem: Gem, 
  Medal: Medal, 
  ShieldCheck: ShieldCheck, 
  Crown: Crown, 
  Star: Star, 
  Stars: Stars, 
  Sunrise: Sunrise, 
  Moon: Moon, 
  CalendarHeart: CalendarHeart, 
  Library: Library, 
  Waypoints: Waypoints, 
  Undo2: Undo2, 
  Combine: Combine, 
  Trophy: Trophy, 
};


const getIconComponent = (iconName: string): React.FC<LucideProps> => {
  return iconMap[iconName] || Trophy; 
};


export default function AchievementsPage() {
  const [achievementsStatus, setAchievementsStatus] = useState<AchievementStatus[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { score } = useScore(); // Get score for passing to achievement checks if needed by definitions

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) { 
        const definitions = achievementService.getAllAchievementDefinitions();
        // The `achievementService.loadUserAchievements()` internally handles fetching user's unlocked achievements.
        // For displaying status, we directly use it. For *checking* achievements, services pass necessary data.
        const userAchievements = achievementService.loadUserAchievements(); 

        const statuses = definitions.map(def => {
        const unlockedEntry = userAchievements.find(ua => ua.id === def.id);
        return {
            ...def,
            unlocked: !!unlockedEntry,
            unlockedAt: unlockedEntry?.unlockedAt,
        };
        });
        setAchievementsStatus(statuses.sort((a,b) => (a.unlocked === b.unlocked) ? 0 : a.unlocked ? -1 : 1));
    }
  }, [isClient, score]); // Add score as dep in case some future achievements shown here depend on it dynamically

  if (!isClient || achievementsStatus.length === 0 && isClient) { // Show loader if not client or if client but no achievements loaded yet
    return (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background p-4">
            <div className="animate-pulse text-primary flex flex-col items-center">
                <Loader2 size={64} className="mb-4 animate-spin" />
                <p className="text-2xl font-semibold">Loading Achievements...</p>
            </div>
        </div>
    );
  }
  
  const unlockedCount = achievementsStatus.filter(a => a.unlocked).length;
  const totalCount = achievementsStatus.length;
  const progressPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center">
          <Trophy className="mr-3 text-primary" size={32}/> My Achievements
        </h1>
        <p className="text-muted-foreground">Track your progress and celebrate your victories!</p>
      </div>
      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <Progress value={progressPercentage} aria-label={`${progressPercentage}% achievements unlocked`} className="flex-grow"/>
            <span className="text-sm font-medium text-primary">{progressPercentage}%</span>
          </div>
          <p className="text-center text-muted-foreground">
            You've unlocked {unlockedCount} out of {totalCount} achievements. Keep going!
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievementsStatus.map(ach => {
          const IconComponent = getIconComponent(ach.icon);
          return (
            <Card 
              key={ach.id} 
              className={`shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col ${ach.unlocked ? 'border-green-500/70 bg-green-500/5' : 'border-border bg-card opacity-70 hover:opacity-100'}`}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-medium">{ach.name}</CardTitle>
                   <Badge variant={ach.unlocked ? 'default' : 'secondary'} className={`${ach.unlocked ? 'bg-green-600 text-white' : ''} text-xs`}>
                    {ach.points} Points
                  </Badge>
                </div>
                <IconComponent size={28} className={ach.unlocked ? 'text-green-500' : 'text-muted-foreground/50'} />
              </CardHeader>
              <CardContent className="space-y-2 flex-grow flex flex-col justify-between">
                <p className={`text-sm flex-grow ${ach.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {ach.description}
                </p>
                <div className="flex items-center justify-end text-xs mt-2">
                  {ach.unlocked ? (
                    <span className="text-green-600 font-semibold flex items-center">
                      <CheckCircle size={14} className="mr-1" /> Unlocked {ach.unlockedAt ? `on ${new Date(ach.unlockedAt).toLocaleDateString()}`: ''}
                    </span>
                  ) : (
                    <span className="text-muted-foreground flex items-center">
                      <Lock size={14} className="mr-1" /> Locked
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Brain, PlusCircle, Loader2, ListChecks, Trash2, Check, Edit3 } from 'lucide-react';
import { format, parseISO, addDays, differenceInCalendarDays, isSameDay, isBefore, startOfDay } from 'date-fns';
import { SpacedRepetitionTask, SpacedRepetitionContext } from '@/contexts/SpacedRepetitionContext';
import { useSpacedRepetition } from '@/contexts/SpacedRepetitionContext';
import SRTaskItem from '@/components/spaced-repetition/SRTaskItem';
import SRTaskForm from '@/components/spaced-repetition/SRTaskForm';
import SRCalendarView from '@/components/spaced-repetition/SRCalendarView';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function SpacedRepetitionPage() {
  const { tasks, addTask, updateTask, deleteTask, markAsReviewed, getTasksForDate } = useSpacedRepetition();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setIsLoading(false); 
  }, []);
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const tasksForSelectedDate = selectedDate ? getTasksForDate(selectedDate) : [];

  if (!isClient || isLoading) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background p-4">
        <div className="animate-pulse text-primary flex flex-col items-center">
          <Brain size={64} className="mb-4 animate-spin" />
          <p className="text-2xl font-semibold">Loading Spaced Repetition...</p>
        </div>
      </div>
    );
  }
  

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1 flex items-center">
            <Brain className="mr-3 text-primary" /> Spaced Repetition
          </h1>
          <p className="text-muted-foreground">Master your learning with smart review schedules.</p>
        </div>
      </div>
      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-7 space-y-6"> {/* Calendar takes 7/12ths */}
           <SRCalendarView selectedDate={selectedDate} onDateSelect={handleDateSelect} tasks={tasks}/>
        </section>

        <section className="lg:col-span-5 flex flex-col space-y-6"> {/* Form and Task List take 5/12ths, flex-col for height distribution */}
            <SRTaskForm />
            <Card className="shadow-xl flex-grow flex flex-col"> {/* Task list card grows to fill space */}
                 <CardHeader>
                    <CardTitle>
                        Tasks for {selectedDate ? format(selectedDate, 'PPP') : 'Selected Date'}
                    </CardTitle>
                    <CardDescription>
                        {tasksForSelectedDate.length > 0 
                            ? `You have ${tasksForSelectedDate.length} item(s) to review.`
                            : "No items scheduled for this date."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden"> {/* Content area also grows and handles overflow */}
                  <ScrollArea className="h-full pr-3"> {/* ScrollArea takes full height of its parent CardContent */}
                    {tasksForSelectedDate.length > 0 ? (
                        <ul className="space-y-3">
                            {tasksForSelectedDate.map(task => (
                                <SRTaskItem key={task.id} task={task} />
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            Select a date on the calendar to see items.
                        </p>
                    )}
                  </ScrollArea>
                </CardContent>
            </Card>
        </section>
      </div>
    </div>
  );
}

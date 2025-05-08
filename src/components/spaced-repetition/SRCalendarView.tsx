
'use client';

import { Calendar, type CalendarProps } from "@/components/ui/calendar";
import type { SpacedRepetitionTask } from "@/contexts/SpacedRepetitionContext";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { isSameDay, isPast, startOfDay, parseISO, isToday, format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { buttonVariants } from "@/components/ui/button";


interface SRCalendarViewProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  tasks: SpacedRepetitionTask[];
}

export default function SRCalendarView({ selectedDate, onDateSelect, tasks }: SRCalendarViewProps) {
  
  const getDayStylesAndTasks = (day: Date): { className: string; tasksOnDay: SpacedRepetitionTask[] } => {
    const today = startOfDay(new Date());
    const dayStart = startOfDay(day);
    let className = "";

    const tasksOnDay = tasks.filter(task => {
        try {
            if (task.nextReviewDate && typeof task.nextReviewDate === 'string') {
                return isSameDay(parseISO(task.nextReviewDate), dayStart);
            }
            return false;
        } catch (e) {
            console.warn("Invalid date in SR task for calendar view:", task.nextReviewDate, task.title);
            return false;
        }
    });
    
    if (tasksOnDay.length > 0) {
      const isOverdue = tasksOnDay.some(task => isPast(dayStart) && !isToday(dayStart) && (!task.lastReviewedDate || !isSameDay(parseISO(task.lastReviewedDate!), dayStart)) );
      const isReviewedOnThisDay = tasksOnDay.every(task => task.lastReviewedDate && isSameDay(parseISO(task.lastReviewedDate!), dayStart));

      if (isOverdue) {
        className = "bg-red-500/70 text-white hover:bg-red-600/80 focus:bg-red-600/80"; 
      } else if (isReviewedOnThisDay && (isPast(dayStart) && !isToday(dayStart))) {
         className = "bg-blue-500/70 text-white hover:bg-blue-600/80 focus:bg-blue-600/80"; 
      } else { 
         className = "bg-green-500/70 text-white hover:bg-green-600/80 focus:bg-green-600/80"; 
      }
    }
    return { className, tasksOnDay };
  };


  return (
    <Card className="shadow-lg h-auto overflow-hidden">
        <CardHeader>
            <CardTitle>Review Calendar</CardTitle>
            <CardDescription>
                Color Key: <span className="text-green-600 font-semibold">Green</span> (Scheduled), <span className="text-red-600 font-semibold">Red</span> (Overdue), <span className="text-blue-600 font-semibold">Blue</span> (Reviewed), <span className="text-primary font-semibold">Primary Blue</span> (Selected), <span className="text-accent font-semibold">Accent Teal</span> (Today)
            </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-0 sm:p-2 md:p-4">
        <TooltipProvider>
        <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            className="p-0 w-full max-w-full" 
            numberOfMonths={1} 
            classNames={{
                months: "flex flex-col space-y-4 w-full", 
                month: "space-y-4 w-full", 
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-lg font-medium", 
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  buttonVariants({ variant: "outline" }),
                  "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100" 
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full",
                head_cell: 
                  "text-muted-foreground rounded-md w-[calc(100%/7)] h-10 md:h-12 font-normal text-[0.8rem] flex items-center justify-center", 
                row: "flex w-full mt-2",
                cell: 
                  cn("w-[calc(100%/7)] h-16 md:h-20 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                  "flex items-center justify-center" 
                  ), 
                day: (date) => {
                  const { className: dynamicDayClassName } = getDayStylesAndTasks(date);
                  return cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-14 w-14 md:h-16 md:w-16 p-0 font-normal flex items-center justify-center relative rounded-md",
                    dynamicDayClassName
                  );
                },
                day_selected: 
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md !ring-2 !ring-primary !ring-offset-2", 
                day_today: 
                  "bg-accent text-accent-foreground ring-2 ring-accent rounded-md", 
                day_outside:
                  "day-outside text-muted-foreground opacity-30 aria-selected:bg-accent/50 aria-selected:text-muted-foreground rounded-md", 
                day_disabled: 
                  "text-muted-foreground opacity-50 rounded-md",
                day_range_end: 
                  "day-range-end rounded-md",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-md",
                day_hidden: 
                  "invisible",
            }}
            components={{
                DayContent: ({ date }) => { 
                    const { tasksOnDay } = getDayStylesAndTasks(date);
                    const dayOfMonth = format(date, 'd');
                    return (
                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                            <span className="text-base sm:text-lg font-medium z-10">
                                {dayOfMonth}
                            </span>
                            {tasksOnDay.length > 0 && (
                                <Tooltip delayDuration={100}>
                                    <TooltipTrigger asChild>
                                        {/* Small dot indicator, moved to bottom right to avoid overlap */}
                                        <div className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full bg-blue-600 shadow-md border border-background z-20" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs text-xs" side="top">
                                        <p className="font-semibold mb-1">{format(date, 'PPP')}: ({tasksOnDay.length} task(s))</p>
                                        <ul className="list-disc list-inside space-y-0.5">
                                            {tasksOnDay.slice(0,3).map(t => <li key={t.id} className="truncate">{t.title}</li>)}
                                            {tasksOnDay.length > 3 && <li>And {tasksOnDay.length-3} more...</li>}
                                        </ul>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    );
                },
            }}
        />
        </TooltipProvider>
        </CardContent>
    </Card>
  );
}


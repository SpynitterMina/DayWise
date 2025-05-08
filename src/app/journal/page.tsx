
'use client';

import { useState, useEffect, useCallback } from 'react';
import JournalEditor, { type JournalEntry } from '@/components/journal/JournalEditor';
import PastEntriesDisplay from '@/components/journal/PastEntriesDisplay';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Loader2, BookOpen as BookOpenIcon } from 'lucide-react'; 
import { useScore } from '@/contexts/ScoreContext';
import { achievementService } from '@/services/achievementService';
import type { Task } from '@/app/page';
import { useToast } from '@/hooks/use-toast';

const JOURNAL_ENTRIES_STORAGE_KEY = 'daywiseJournalEntries_v3'; // Incremented version

export default function JournalPage() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined); 
  const [currentDateString, setCurrentDateString] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [editingEntryContent, setEditingEntryContent] = useState<string>(''); 
  const [maxCalendarDate, setMaxCalendarDate] = useState<Date | undefined>(undefined);
  
  const { score, addScore } = useScore(); 
  const { toast } = useToast();

  const checkJournalAchievements = useCallback(() => {
    if(!isClient) return;
    const storedTasks = localStorage.getItem('daywiseTasks_v3'); 
    const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
    
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
  }, [journalEntries, addScore, toast, isClient, score]); 

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const today = new Date();
      setSelectedDate(today); 
      setCurrentDateString(format(today, 'yyyy-MM-dd'));
      setMaxCalendarDate(today);

      const storedEntries = localStorage.getItem(JOURNAL_ENTRIES_STORAGE_KEY);
      if (storedEntries) {
        try {
          const parsedEntries: JournalEntry[] = JSON.parse(storedEntries);
          setJournalEntries(parsedEntries.sort((a,b) => b.date.localeCompare(a.date)));
        } catch (e) {
          console.error("Failed to parse journal entries from localStorage", e);
          localStorage.removeItem(JOURNAL_ENTRIES_STORAGE_KEY);
        }
      }
    }
  }, [isClient]); 
  
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem(JOURNAL_ENTRIES_STORAGE_KEY, JSON.stringify(journalEntries));
      checkJournalAchievements();
    }
  }, [journalEntries, isClient, checkJournalAchievements]);

  useEffect(() => {
    if (selectedDate) {
      const newDateString = format(selectedDate, 'yyyy-MM-dd');
      setCurrentDateString(newDateString);
      const entryForSelectedDate = journalEntries.find(e => e.date === newDateString);
      setEditingEntryContent(entryForSelectedDate ? entryForSelectedDate.content : '');
    }
  }, [selectedDate, journalEntries]);


  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleJournalSaved = (newEntryToSave: JournalEntry) => {
    let isNewEntryForTheDay = false;
    setJournalEntries(prevEntries => {
      const existingEntryIndex = prevEntries.findIndex(entry => entry.date === newEntryToSave.date);
      let updatedEntries;
      if (existingEntryIndex > -1) {
        updatedEntries = [...prevEntries];
        updatedEntries[existingEntryIndex] = newEntryToSave;
      } else {
        isNewEntryForTheDay = true;
        updatedEntries = [...prevEntries, newEntryToSave];
      }
      return updatedEntries.sort((a,b) => b.date.localeCompare(a.date));
    });

    if (newEntryToSave.date === currentDateString) {
        setEditingEntryContent(newEntryToSave.content);
    }

    if (isNewEntryForTheDay) {
        addScore(5); 
        toast({
          title: "Journal Entry Added!",
          description: "+5 points for reflecting!",
        });
    }
  };

  const handleLoadEntry = (entryToLoad: JournalEntry) => {
    try {
      const dateOfEntry = parseISO(entryToLoad.date);
      if (!isNaN(dateOfEntry.getTime())) {
          setSelectedDate(dateOfEntry); 
      } else {
          toast({ title: "Error", description: "Could not load entry due to invalid date.", variant: "destructive"});
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not parse date for entry.", variant: "destructive"});
      console.error("Error parsing date for journal entry: ", error);
    }
  };
  

  if (!isClient) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background p-4">
         <div className="animate-pulse text-primary flex flex-col items-center">
          <BookOpenIcon size={64} className="mb-4 animate-spin" />
          <p className="text-2xl font-semibold">Loading Journal...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">My Journal</h1>
          <p className="text-muted-foreground">A space for your daily thoughts and reflections.</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full sm:w-auto justify-start text-left font-normal min-w-[240px]"
              aria-label="Select journal date"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              disabled={(date) => {
                if (!maxCalendarDate) return true; 
                return date > maxCalendarDate || date < new Date("2000-01-01");
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <Separator />
      
      {currentDateString && ( 
        <JournalEditor
            key={currentDateString} 
            currentDateString={currentDateString}
            onJournalSaved={handleJournalSaved}
            initialContent={editingEntryContent}
        />
      )}
      
      <Separator className="my-8"/>
      
      <PastEntriesDisplay entries={journalEntries} onLoadEntry={handleLoadEntry} />
    </div>
  );
}


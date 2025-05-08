
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Save, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface JournalEditorProps {
  currentDateString: string;
  onJournalSaved: (entry: JournalEntry) => void;
  initialContent?: string;
}

export interface JournalEntry {
  date: string;
  content: string;
  promptsUsed?: string[];
}

const PREDEFINED_JOURNAL_QUESTIONS = [
  "What was the highlight of your day and why?",
  "What is one thing you learned today, big or small?",
  "What challenge did you face, and how did you (or could you) overcome it?",
  "What are you grateful for today?",
  "How did you take care of yourself today (physically, mentally, emotionally)?",
  "What task felt most rewarding to complete?",
  "If you could change one thing about today, what would it be and why?",
  "What are you looking forward to tomorrow?",
  "What small step did you take towards a larger goal?",
  "Describe a moment today where you felt proud of yourself.",
  "What emotions were most prominent for you today?",
  "Is there anything you've been procrastinating on? What's one tiny step to start?",
  "What unexpected thing happened today?",
  "How did you help someone else, or how did someone help you?",
  "What's one thing you want to remember about today a year from now?",
  "Did any of your tasks today align with your long-term aspirations? How so?",
  "What was the most difficult decision you had to make today?",
  "If today was a chapter in your life's book, what would its title be?",
  "What new idea or perspective did you encounter today?",
  "What made you smile or laugh today?",
  "How did your energy levels fluctuate throughout the day?",
  "What could you have done differently to make today even better?",
  "Describe a conversation that stood out to you today.",
  "What are you currently curious about?",
  "If you had an extra hour today, how would you have spent it?",
  "What progress did you make on a personal project or hobby?",
  "What is one act of kindness you witnessed or performed today?",
  "What part of your routine is serving you well, and what part might need adjusting?",
  "What are you most proud of accomplishing this week so far?",
  "Reflect on a moment of quiet or solitude. What did you notice?"
];

// Function to get N random elements from an array
function getRandomElements<T>(arr: T[], n: number): T[] {
  if (n >= arr.length) {
    return [...arr]; // Return a copy of all elements if n is too large
  }
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export default function JournalEditor({ currentDateString, onJournalSaved, initialContent = '' }: JournalEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setContent(initialContent);
    setSuggestedPrompts([]); // Clear prompts when date changes or initial content reloads
  }, [initialContent, currentDateString]);

  const handleGetIdeas = () => {
    const randomPrompts = getRandomElements(PREDEFINED_JOURNAL_QUESTIONS, 3);
    setSuggestedPrompts(randomPrompts);
    toast({
      title: 'Ideas Generated',
      description: 'Here are some questions to guide your reflection!',
    });
  };

  const handleSaveJournal = () => {
    if (content.trim() === '') {
      toast({
        title: 'Empty Journal',
        description: 'Please write something before saving.',
        variant: 'destructive',
      });
      return;
    }

    const entry: JournalEntry = {
      date: currentDateString,
      content: content,
      promptsUsed: suggestedPrompts.filter(p => content.toLowerCase().includes(p.toLowerCase().split('?')[0])),
    };

    onJournalSaved(entry);

    toast({
      title: 'Journal Saved',
      description: `Your entry for ${currentDateString} has been saved.`,
    });
    setSuggestedPrompts([]); // Clear prompts after saving
  };

  const insertPromptIntoJournal = (promptText: string) => {
    const formattedPrompt = promptText.endsWith('?') ? `## ${promptText}\n\n` : `${promptText}\n\n`;
    setContent(prev => `${prev}${prev.trim() ? '\n\n' : ''}${formattedPrompt}`);
    // Optionally, remove the prompt from the suggested list once used, or highlight it
    // setSuggestedPrompts(prev => prev.filter(p => p !== promptText));
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 text-primary" />
          Journal for {currentDateString}
        </CardTitle>
        <CardDescription>Reflect on your day. What went well? What were the challenges?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Start writing your journal entry here... Click 'Get Ideas' for some guiding questions."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          className="w-full p-3 border rounded-md shadow-inner focus:ring-primary focus:border-primary text-base"
          aria-label={`Journal entry for ${currentDateString}`}
        />
        {suggestedPrompts.length > 0 && (
          <div className="space-y-3 p-4 bg-secondary/50 rounded-md border border-dashed border-accent">
            <h4 className="font-semibold text-accent flex items-center"><Lightbulb size={18} className="mr-2" />Guiding Questions:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {suggestedPrompts.map((prompt, index) => (
                <li key={index} className="hover:text-accent cursor-pointer" onClick={() => insertPromptIntoJournal(prompt)}>
                  {prompt}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground/70">Click a question to add it to your journal.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button onClick={handleGetIdeas} variant="outline">
          <Lightbulb size={20} className="mr-2" />
          Get Ideas
        </Button>
        <Button onClick={handleSaveJournal} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
          <Save size={20} className="mr-2" />
          Save Journal
        </Button>
      </CardFooter>
    </Card>
  );
}

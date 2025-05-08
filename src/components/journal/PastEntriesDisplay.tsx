'use client';

import type { JournalEntry } from './JournalEditor'; // Use the same interface
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookMarked, ChevronDown, ChevronUp } from 'lucide-react';

interface PastEntriesDisplayProps {
  entries: JournalEntry[];
  onLoadEntry: (entry: JournalEntry) => void;
}

export default function PastEntriesDisplay({ entries, onLoadEntry }: PastEntriesDisplayProps) {
  if (entries.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookMarked className="mr-2 text-primary" />
            Past Journal Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You have no past journal entries saved in this browser.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
           <BookMarked className="mr-2 text-primary" />
          Past Journal Entries
        </CardTitle>
        <CardDescription>Review your previous reflections.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {entries.sort((a,b) => b.date.localeCompare(a.date)).map((entry) => ( // Sort by date descending
            <AccordionItem value={entry.date} key={entry.date} className="border bg-card rounded-md shadow-sm">
              <AccordionTrigger className="p-4 hover:bg-secondary/50 rounded-t-md">
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium text-lg text-primary">{entry.date}</span>
                  <span className="text-sm text-muted-foreground mr-2">
                    {entry.content.substring(0, 50)}{entry.content.length > 50 ? '...' : ''}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t bg-background rounded-b-md">
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {entry.content}
                </div>
                {entry.promptsUsed && entry.promptsUsed.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-dashed">
                    <h5 className="font-semibold text-sm text-accent mb-1">Prompts Used:</h5>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                      {entry.promptsUsed.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
                <Button 
                  onClick={() => onLoadEntry(entry)} 
                  variant="outline" 
                  size="sm"
                  className="mt-4"
                >
                  Load this entry to edit
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

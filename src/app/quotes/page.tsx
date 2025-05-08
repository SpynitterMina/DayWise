
'use client';

import { useState, useEffect } from 'react';
import { useSavedQuotes, type SavedQuote } from '@/contexts/SavedQuotesContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'; // For future tag input
import { Separator } from '@/components/ui/separator';
import { Bookmark, Trash2, Save, Edit3, Loader2, MessageSquareQuote, Tag, PlusCircle as PlusCircleIcon } from 'lucide-react'; // Updated import
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

export default function SavedQuotesPage() {
  const { savedQuotes, removeQuote, updateQuoteNotes, addQuote } = useSavedQuotes();
  const [isClient, setIsClient] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState('');
  const [manualQuoteText, setManualQuoteText] = useState('');
  const [manualQuoteAuthor, setManualQuoteAuthor] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEditNotes = (quote: SavedQuote) => {
    setEditingQuoteId(quote.id);
    setCurrentNotes(quote.notes || '');
  };

  const handleSaveNotes = (quoteId: string) => {
    updateQuoteNotes(quoteId, currentNotes);
    setEditingQuoteId(null);
  };

  const handleAddManualQuote = () => {
    if (!manualQuoteText.trim()) {
        toast({title: "Quote Text Required", description: "Please enter the quote text.", variant: "destructive"});
        return;
    }
    const success = addQuote(manualQuoteText, manualQuoteAuthor || undefined);
    if (success) {
        setManualQuoteText('');
        setManualQuoteAuthor('');
    }
  };

  if (!isClient) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background p-4">
        <div className="animate-pulse text-primary flex flex-col items-center">
          <Loader2 size={64} className="mb-4 animate-spin" />
          <p className="text-2xl font-semibold">Loading Saved Quotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center">
          <Bookmark className="mr-3 text-primary" size={32} /> My Saved Quotes
        </h1>
        <p className="text-muted-foreground">Your personal collection of inspiration and wisdom.</p>
      </div>
      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center"><MessageSquareQuote className="mr-2"/>Add a New Quote Manually</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            <Textarea 
                placeholder="Enter quote text here..."
                value={manualQuoteText}
                onChange={(e) => setManualQuoteText(e.target.value)}
                rows={3}
            />
            <Input 
                placeholder="Author (Optional)"
                value={manualQuoteAuthor}
                onChange={(e) => setManualQuoteAuthor(e.target.value)}
            />
        </CardContent>
        <CardFooter>
            <Button onClick={handleAddManualQuote}>
                <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Quote to Collection
            </Button>
        </CardFooter>
      </Card>

      {savedQuotes.length === 0 ? (
        <Card className="shadow-md text-center py-12">
          <CardHeader>
            <CardTitle>No Quotes Saved Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <Bookmark size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Start saving quotes that inspire you! You can save them from the header or add them manually here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {savedQuotes.map(quote => (
              <motion.div
                key={quote.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                  <CardHeader className="pb-3">
                    <blockquote className="text-lg font-semibold italic text-foreground leading-tight">
                      "{quote.text}"
                    </blockquote>
                    {quote.author && (
                      <p className="text-sm text-muted-foreground mt-1 text-right">- {quote.author}</p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2">
                    {editingQuoteId === quote.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={currentNotes}
                          onChange={(e) => setCurrentNotes(e.target.value)}
                          placeholder="Add your thoughts or reflections..."
                          rows={3}
                          className="text-sm"
                        />
                         {/* Future: Tag input component could go here */}
                      </div>
                    ) : (
                      <>
                        {quote.notes ? (
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap italic bg-secondary/30 p-2 rounded-md">
                            <strong>My Notes:</strong> {quote.notes}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground/70 italic">No notes yet.</p>
                        )}
                        {/* Future: Display tags here */}
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch gap-2 pt-3 border-t mt-auto">
                    <div className="flex justify-between items-center w-full">
                        <p className="text-xs text-muted-foreground">
                            Saved: {format(new Date(quote.savedAt), "PPP p")}
                        </p>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuote(quote.id)}
                            className="text-destructive/70 hover:text-destructive h-7 w-7"
                            aria-label="Delete quote"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                    {editingQuoteId === quote.id ? (
                      <Button onClick={() => handleSaveNotes(quote.id)} size="sm">
                        <Save size={16} className="mr-2" /> Save Notes
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleEditNotes(quote)}>
                        <Edit3 size={16} className="mr-2" /> {quote.notes ? 'Edit Notes' : 'Add Notes'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

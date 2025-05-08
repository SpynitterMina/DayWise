
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SavedQuote {
  id: string; 
  text: string;
  author?: string; 
  notes?: string; 
  savedAt: string; 
  tags?: string[]; 
}

interface SavedQuotesContextType {
  savedQuotes: SavedQuote[];
  addQuote: (quoteText: string, author?: string) => boolean; 
  removeQuote: (quoteId: string) => void;
  updateQuoteNotes: (quoteId: string, notes: string) => void;
  getQuoteById: (quoteId: string) => SavedQuote | undefined;
}

const SavedQuotesContext = createContext<SavedQuotesContextType | undefined>(undefined);

const SAVED_QUOTES_STORAGE_KEY = 'daywiseSavedQuotes_v3'; // Incremented version

export const SavedQuotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedQuotes = localStorage.getItem(SAVED_QUOTES_STORAGE_KEY);
      if (storedQuotes) {
        try {
          setSavedQuotes(JSON.parse(storedQuotes));
        } catch (e) {
          console.error("Failed to parse saved quotes from localStorage", e);
          localStorage.removeItem(SAVED_QUOTES_STORAGE_KEY);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(SAVED_QUOTES_STORAGE_KEY, JSON.stringify(savedQuotes));
    }
  }, [savedQuotes, isInitialized]);

  const addQuote = useCallback((quoteText: string, author?: string): boolean => {
    const trimmedText = quoteText.trim();
    if (savedQuotes.some(q => q.text.trim() === trimmedText)) {
      toast({ title: "Quote Already Saved", description: "This quote is already in your collection.", variant: "default" });
      return false;
    }

    const newQuote: SavedQuote = {
      id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, 
      text: trimmedText,
      author,
      savedAt: new Date().toISOString(),
      notes: '',
      tags: [],
    };
    setSavedQuotes(prev => [newQuote, ...prev].sort((a,b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()));
    toast({ title: "Quote Saved!", description: `"${trimmedText.substring(0,30)}..." added to your collection.`});
    return true;
  }, [savedQuotes, toast]);

  const removeQuote = useCallback((quoteId: string) => {
    setSavedQuotes(prev => prev.filter(q => q.id !== quoteId));
    toast({ title: "Quote Removed", variant: "destructive"});
  }, [toast]);

  const updateQuoteNotes = useCallback((quoteId: string, notes: string) => {
    setSavedQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, notes: notes } : q));
    toast({ title: "Notes Updated", description: "Your notes for the quote have been saved." });
  }, [toast]);
  
  const getQuoteById = useCallback((quoteId: string) => {
    return savedQuotes.find(q => q.id === quoteId);
  }, [savedQuotes]);


  return (
    <SavedQuotesContext.Provider value={{ savedQuotes, addQuote, removeQuote, updateQuoteNotes, getQuoteById }}>
      {children}
    </SavedQuotesContext.Provider>
  );
};

export const useSavedQuotes = (): SavedQuotesContextType => {
  const context = useContext(SavedQuotesContext);
  if (context === undefined) {
    throw new Error('useSavedQuotes must be used within a SavedQuotesProvider');
  }
  return context;
};

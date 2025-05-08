
'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Youtube, Music, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialLofiTracks = [
  { id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio - Beats to Relax/Study To' },
  { id: '5qap5aO4i9A', title: 'Lofi Hip Hop Radio - Beats to Sleep/Chill To' },
  { id: 'DWcJFNfaw9c', title: 'Coffee Shop Radio // 24/7 Lofi Hip-Hop Beats' },
  { id: 'kgx4WGK0oNU', title: 'Japanese Lofi Radio 24/7 | Chill Lofi Beats' },
  { id: 'rUxyKA_-grg', title: 'Chillhop Radio - Jazzy & Lofi Hip Hop Beats' },
];

interface CustomTrack {
  id: string; // YouTube video ID
  title: string; // User-defined title or fetched title
}

const CUSTOM_TRACKS_STORAGE_KEY = 'daywiseCustomLofiTracks_v3'; // Incremented version

export default function LofiPlayer() {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(initialLofiTracks[0].id);
  const [customVideoUrlOrIdInput, setCustomVideoUrlOrIdInput] = useState<string>('');
  const [customVideoTitleInput, setCustomVideoTitleInput] = useState<string>('');
  const [inputError, setInputError] = useState<string>('');
  const [customTracks, setCustomTracks] = useState<CustomTrack[]>([]);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedTracks = localStorage.getItem(CUSTOM_TRACKS_STORAGE_KEY);
      if (storedTracks) {
        try {
          setCustomTracks(JSON.parse(storedTracks));
        } catch (e) {
          console.error("Failed to parse custom tracks from localStorage", e);
          localStorage.removeItem(CUSTOM_TRACKS_STORAGE_KEY);
        }
      }
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(CUSTOM_TRACKS_STORAGE_KEY, JSON.stringify(customTracks));
    }
  }, [customTracks, isClient]);

  const handleTrackChange = (videoId: string) => {
    setSelectedTrackId(videoId);
    setCustomVideoUrlOrIdInput(''); 
    setCustomVideoTitleInput('');
    setInputError('');
  };

  const extractVideoId = (urlOrId: string): string | null => {
    if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
      return urlOrId; // It's already an ID
    }
    // Regex to extract video ID from common YouTube URL formats
    const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/;
    const match = urlOrId.match(youtubeRegex);
    return match ? match[1] : null;
  };

  const handleAddCustomTrack = () => {
    const urlOrId = customVideoUrlOrIdInput.trim();
    const title = customVideoTitleInput.trim() || `Custom Track: ${urlOrId}`;

    if (urlOrId === '') {
      setInputError('Please enter a YouTube Video ID or URL.');
      return;
    }

    const videoId = extractVideoId(urlOrId);

    if (!videoId) {
      setInputError('Invalid YouTube Video ID or URL format. Ensure it is a valid YouTube link or an 11-character ID.');
      return;
    }
    
    if (customTracks.some(track => track.id === videoId) || initialLofiTracks.some(track => track.id === videoId)) {
      setInputError('This video ID already exists in your lists.');
      return;
    }

    const newCustomTrack: CustomTrack = { id: videoId, title };
    setCustomTracks(prev => [...prev, newCustomTrack]);
    setSelectedTrackId(videoId); 
    setCustomVideoUrlOrIdInput('');
    setCustomVideoTitleInput('');
    setInputError('');
    toast({ title: "Custom Track Added!", description: `"${title}" added to your music.` });
  };

  const handleRemoveCustomTrack = (trackIdToRemove: string) => {
    setCustomTracks(prev => prev.filter(track => track.id !== trackIdToRemove));
    if (selectedTrackId === trackIdToRemove) {
      setSelectedTrackId(initialLofiTracks[0]?.id || ''); 
    }
    toast({ title: "Custom Track Removed", variant: "destructive" });
  };


  return (
    <div className="space-y-4">
      <Select onValueChange={handleTrackChange} value={selectedTrackId}>
        <SelectTrigger className="w-full" aria-label="Select Lofi Track">
          <SelectValue placeholder="Select a lofi station" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Recommended Stations</SelectLabel>
            {initialLofiTracks.map(track => (
              <SelectItem key={track.id} value={track.id}>
                {track.title}
              </SelectItem>
            ))}
          </SelectGroup>
          {customTracks.length > 0 && (
            <SelectGroup>
              <SelectLabel>Your Custom Tracks</SelectLabel>
              {customTracks.map(track => (
                <SelectItem key={track.id} value={track.id} className="flex justify-between items-center">
                  <span>{track.title}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
      
      {customTracks.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          <h4 className="text-sm font-medium text-muted-foreground">Manage Your Tracks:</h4>
          {customTracks.map(track => (
            <div key={track.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded-md">
              <span className="text-xs truncate flex-grow ">{track.title} (ID: {track.id})</span>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveCustomTrack(track.id)} className="h-6 w-6 text-destructive/70 hover:text-destructive">
                <Trash2 size={14}/>
              </Button>
            </div>
          ))}
        </div>
      )}


      <div className="space-y-2 border-t pt-4">
        <p className="text-sm text-muted-foreground text-center">Add your own YouTube track (ID or URL):</p>
        <Input 
          type="text"
          placeholder="YouTube Video ID or URL"
          value={customVideoUrlOrIdInput}
          onChange={(e) => {
            setCustomVideoUrlOrIdInput(e.target.value);
            if(inputError) setInputError('');
          }}
          className={inputError ? 'border-destructive' : ''}
        />
        <Input 
          type="text"
          placeholder="Custom Title (Optional)"
          value={customVideoTitleInput}
          onChange={(e) => setCustomVideoTitleInput(e.target.value)}
        />
        <Button onClick={handleAddCustomTrack} variant="outline" className="w-full">
            <PlusCircle size={18} className="mr-2"/> Add to My Music
        </Button>
        {inputError && <p className="text-xs text-destructive text-center">{inputError}</p>}
      </div>

      {selectedTrackId && (
        <Card className="overflow-hidden shadow-lg rounded-lg">
          <CardContent className="p-0 aspect-video bg-black">
            <iframe
              key={selectedTrackId} 
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedTrackId}?autoplay=0&rel=0&modestbranding=1`}
              title="Lofi Music Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="rounded-b-lg"
            ></iframe>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

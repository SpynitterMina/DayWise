
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { rewardService } from '@/services/rewardService'; // To check for mascot accessories

// Array of random compliments
const compliments = [
  "You're doing great! Keep up the fantastic work!",
  "Amazing focus! You're crushing those tasks.",
  "Productivity level: Expert! Nice job.",
  "Look at you go! Making progress like a champ.",
  "Every task completed is a step forward. Well done!",
  "Your dedication is inspiring!",
  "You're on a roll! Keep that momentum going.",
  "Excellent work! Treat yourself to a short break.",
  "Master of tasks, that's what you are!",
  "Another one bites the dust! Great job on that task.",
];

export default function SiteMascot() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [mascotAccessories, setMascotAccessories] = useState<string[]>([]);


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if(isClient){
      const mascotState = rewardService.getMascotState();
      setMascotAccessories(mascotState.accessories);
      // Simulate mascot appearance (e.g., after some time or an event)
      const timer = setTimeout(() => {
        setMessage(compliments[Math.floor(Math.random() * compliments.length)]);
        setIsVisible(true);
      }, 15000); // Appears after 15 seconds with a random compliment

      // Auto-dismiss after a while
      const dismissTimer = setTimeout(() => {
        setIsVisible(false);
      }, 25000); // Hides after 10 more seconds (total 25s)

      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
      };
    }
  }, [isClient]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isClient || !isVisible || !message) return null;

  const hasTinyHat = mascotAccessories.includes('MASCOT_HAT_TINY');

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.3 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-4 right-4 z-[100] p-4 bg-card text-card-foreground rounded-xl shadow-2xl w-80 border border-primary/30"
          data-ai-hint="mascot popup"
        >
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0"
            onClick={handleClose}
            aria-label="Close mascot message"
          >
            <X size={16} />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image
                src="https://picsum.photos/seed/mascot/80/80"
                alt="DayWise Mascot"
                width={60}
                height={60}
                className="rounded-full border-2 border-primary"
              />
              {hasTinyHat && (
                 <div 
                    className="absolute -top-2 -right-1 text-2xl transform -rotate-[25deg]"
                    aria-label="Mascot has a tiny hat"
                    title="Tiny Hat!">
                    🎩
                 </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">DayWise Buddy</p>
              <p className="text-xs text-muted-foreground">{message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

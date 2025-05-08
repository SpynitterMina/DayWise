
'use client';

import Link from 'next/link';
import { CalendarDays, BookOpen, Home, Trophy, Star, ShoppingBag, User as UserIcon, Brain, BookmarkPlus, Loader2, Bookmark } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useScore } from '@/contexts/ScoreContext';
import { Badge } from '@/components/ui/badge';
import AvatarWithFrame from '@/components/profile/AvatarWithFrame';
import { useUser } from '@/contexts/UserContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useSavedQuotes } from '@/contexts/SavedQuotesContext'; // Import useSavedQuotes
import { useToast } from '@/hooks/use-toast';


const navItems = [
  { href: '/', label: 'Tasks', icon: Home },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/spaced-repetition', label: 'Review', icon: Brain },
  { href: '/quotes', label: 'Quotes', icon: Bookmark }, 
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/rewards', label: 'Rewards', icon: ShoppingBag },
  { href: '/profile', label: 'Profile', icon: UserIcon },
];

const PREDEFINED_MOTIVATIONAL_QUOTES = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Strive not to be a success, but rather to be of value. - Albert Einstein",
  "The mind is everything. What you think you become. - Buddha",
  "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
  "The best way to predict the future is to create it. - Peter Drucker",
  "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "Act as if what you do makes a difference. It does. - William James",
  "The journey of a thousand miles begins with a single step. - Lao Tzu",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "Well done is better than well said. - Benjamin Franklin",
  "You miss 100% of the shots you don't take. - Wayne Gretzky",
  "The harder I work, the luckier I get. - Samuel Goldwyn",
  "Dream big and dare to fail. - Norman Vaughan",
  "It does not matter how slowly you go as long as you do not stop. - Confucius",
  "Everything you’ve ever wanted is on the other side of fear. - George Addair",
  "Start where you are. Use what you have. Do what you can. - Arthur Ashe",
  "The secret of getting ahead is getting started. - Mark Twain",
  "Limitations live only in our minds. But if we use our imaginations, our possibilities become limitless. - Jamie Paolinetti",
  "What you get by achieving your goals is not as important as what you become by achieving your goals. - Zig Ziglar",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
  "I find that the harder I work, the more luck I seem to have. - Thomas Jefferson",
  "Success usually comes to those who are too busy to be looking for it. - Henry David Thoreau",
  "If you are not willing to risk the usual, you will have to settle for the ordinary. - Jim Rohn",
  "Opportunities don't happen. You create them. - Chris Grosser",
  "Try not to become a man of success. Rather become a man of value. - Albert Einstein",
  "It is never too late to be what you might have been. - George Eliot",
  "The only place where success comes before work is in the dictionary. - Vidal Sassoon",
  "All our dreams can come true if we have the courage to pursue them. - Walt Disney",
  "If you want to achieve greatness stop asking for permission. - Anonymous",
  "Things work out best for those who make the best of how things work out. - John Wooden",
  "To live a creative life, we must lose our fear of being wrong. - Anonymous",
  "If you are not willing to learn, no one can help you. If you are determined to learn, no one can stop you. - Zig Ziglar",
  "Just one small positive thought in the morning can change your whole day. - Dalai Lama",
  "You can't use up creativity. The more you use, the more you have. - Maya Angelou",
  "The best revenge is massive success. - Frank Sinatra",
  "I have not failed. I've just found 10,000 ways that won't work. - Thomas A. Edison",
  "What seems to us as bitter trials are often blessings in disguise. - Oscar Wilde",
  "The distance between insanity and genius is measured only by success. - Bruce Feirstein",
  "When you stop chasing the wrong things, you give the right things a chance to catch you. - Lolly Daskal",
  "I believe that the only courage anybody ever needs is the courage to follow your own dreams. - Oprah Winfrey",
  "No masterpiece was ever created by a lazy artist. - Anonymous",
  "Happiness is a butterfly, which when pursued, is always beyond your grasp, but which, if you will sit down quietly, may alight upon you. - Nathaniel Hawthorne",
  "If you can't explain it simply, you don't understand it well enough. - Albert Einstein",
  "Blessed are those who can give without remembering and take without forgetting. - Anonymous",
  "Do one thing every day that scares you. - Eleanor Roosevelt",
  "What's the point of being alive if you don't at least try to do something remarkable. - Anonymous",
  "Life is not about finding yourself. Life is about creating yourself. - Lolly Daskal",
  "Nothing in the world is more common than unsuccessful people with talent. - Anonymous",
  "Knowledge is being aware of what you can do. Wisdom is knowing when not to do it. - Anonymous",
  "Your problem isn't the problem. Your reaction is the problem. - Anonymous",
  "You can do anything, but not everything. - Anonymous",
  "Innovation distinguishes between a leader and a follower. - Steve Jobs",
  "There are two types of people who will tell you that you cannot make a difference in this world: those who are afraid to try and those who are afraid you will succeed. - Ray Goforth",
  "Thinking should become your capital asset, no matter whatever ups and downs you come across in your life. - A.P.J. Abdul Kalam",
  "I find that when you have a real interest in life and a curious life, that sleep is not the most important thing. - Martha Stewart",
  "It’s not what you look at that matters, it’s what you see. - Anonymous",
  "The road to success and the road to failure are almost exactly the same. - Colin R. Davis",
  "The function of leadership is to produce more leaders, not more followers. - Ralph Nader",
  "Success is liking yourself, liking what you do, and liking how you do it. - Maya Angelou",
  "As we look ahead into the next century, leaders will be those who empower others. - Bill Gates",
  "A real entrepreneur is somebody who has no safety net underneath them. - Henry Kravis",
  "The first step toward success is taken when you refuse to be a captive of the environment in which you first find yourself. - Mark Caine",
  "People who succeed have momentum. The more they succeed, the more they want to succeed, and the more they find a way to succeed. Similarly, when someone is failing, the tendency is to get on a downward spiral that can even become a self-fulfilling prophecy. - Tony Robbins",
  "When I dare to be powerful - to use my strength in the service of my vision, then it becomes less and less important whether I am afraid. - Audre Lorde",
  "Whenever you find yourself on the side of the majority, it is time to pause and reflect. - Mark Twain",
  "The successful warrior is the average man, with laser-like focus. - Bruce Lee",
  "Develop success from failures. Discouragement and failure are two of the surest stepping stones to success. - Dale Carnegie",
  "If you don’t design your own life plan, chances are you’ll fall into someone else’s plan. And guess what they have planned for you? Not much. - Jim Rohn",
  "If you want to make a permanent change, stop focusing on the size of your problems and start focusing on the size of you! - T. Harv Eker",
  "You can’t connect the dots looking forward; you can only connect them looking backwards. So you have to trust that the dots will somehow connect in your future. You have to trust in something – your gut, destiny, life, karma, whatever. This approach has never let me down, and it has made all the difference in my life. - Steve Jobs",
  "Successful people do what unsuccessful people are not willing to do. Don't wish it were easier; wish you were better. - Jim Rohn",
  "The No. 1 reason people fail in life is because they listen to their friends, family, and neighbors. - Napoleon Hill",
  "In my experience, there is only one motivation, and that is desire. No reasons or principle contain it or stand against it. - Jane Smiley",
  "Success does not consist in never making mistakes but in never making the same one a second time. - George Bernard Shaw",
  "I don’t want to get to the end of my life and find that I lived just the length of it. I want to have lived the width of it as well. - Diane Ackerman",
  "You must expect great things of yourself before you can do them. - Michael Jordan",
  "Motivation is what gets you started. Habit is what keeps you going. - Jim Ryun",
  "People rarely succeed unless they have fun in what they are doing. - Dale Carnegie",
  "There is no chance, no destiny, no fate, that can hinder or control the firm resolve of a determined soul. - Ella Wheeler Wilcox",
  "Our greatest fear should not be of failure but of succeeding at things in life that don’t really matter. - Francis Chan",
  "You’ve got to get up every morning with determination if you’re going to go to bed with satisfaction. - George Lorimer",
  "A goal is not always meant to be reached; it often serves simply as something to aim at. - Bruce Lee",
  "Success is ... knowing your purpose in life, growing to reach your maximum potential, and sowing seeds that benefit others. - John C. Maxwell",
  "Be miserable. Or motivate yourself. Whatever has to be done, it's always your choice. - Wayne Dyer",
  "To accomplish great things, we must not only act, but also dream, not only plan, but also believe. - Anatole France",
  "Most of the important things in the world have been accomplished by people who have kept on trying when there seemed to be no help at all. - Dale Carnegie",
  "You measure the size of the accomplishment by the obstacles you had to overcome to reach your goals. - Booker T. Washington",
  "Real difficulties can be overcome; it is only the imaginary ones that are unconquerable. - Theodore N. Vail",
  "It is better to fail in originality than to succeed in imitation. - Herman Melville",
  "What would you do if you weren't afraid? - Spencer Johnson",
  "Little minds are tamed and subdued by misfortune; but great minds rise above it. - Washington Irving",
  "Failure is the condiment that gives success its flavor. - Truman Capote",
  "Don't let what you cannot do interfere with what you can do. - John R. Wooden",
  "You may have to fight a battle more than once to win it. - Margaret Thatcher",
  "A man can be as great as he wants to be. If you believe in yourself and have the courage, the determination, the dedication, the competitive drive and if you are willing to sacrifice the little things in life and pay the price for the things that are worthwhile, it can be done. - Vince Lombardi"
];


export default function AppHeader() {
  const pathname = usePathname();
  const { score } = useScore();
  const { profile } = useUser();
  const { addQuote } = useSavedQuotes();
  const { toast } = useToast();
  
  const [currentQuote, setCurrentQuote] = useState('');
  const [currentAuthor, setCurrentAuthor] = useState<string | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);
  

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchNewQuote = useCallback(() => {
    if (!isClient) return; 
    
    const randomIndex = Math.floor(Math.random() * PREDEFINED_MOTIVATIONAL_QUOTES.length);
    const fullQuote = PREDEFINED_MOTIVATIONAL_QUOTES[randomIndex];
    const parts = fullQuote.split(' - ');
    if (parts.length > 1) {
      setCurrentQuote(parts[0]);
      setCurrentAuthor(parts.slice(1).join(' - '));
    } else {
      setCurrentQuote(fullQuote);
      setCurrentAuthor(undefined);
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      fetchNewQuote(); 
      const quoteInterval = setInterval(fetchNewQuote, 30000); 
      return () => clearInterval(quoteInterval);
    }
  }, [isClient, fetchNewQuote]);

  const handleSaveQuote = () => {
    if (currentQuote) {
      const success = addQuote(currentQuote, currentAuthor);
      if (success) {
        toast({ title: "Quote Saved!", description: "You can find it in your 'Quotes' tab." });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 py-3 px-4 md:px-8 shadow-md bg-background/80 backdrop-blur-md">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-1">
          <Link href="/" className="flex items-center space-x-3 group">
            <CalendarDays size={28} className="text-primary group-hover:animate-pulse" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              DayWise
            </h1>
          </Link>
          <div className="flex items-center space-x-3 md:space-x-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1 cursor-default" aria-label={`Current score: ${score}`}>
                    <Star size={18} className="text-yellow-400" />
                    <Badge variant="secondary" className="text-base md:text-lg font-semibold px-2.5 py-0.5 md:px-3 md:py-1 tabular-nums">{score}</Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your current points!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <nav className="flex items-center space-x-0.5 md:space-x-1" aria-label="Main navigation">
              {navItems.map((item) => (
                 <TooltipProvider key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-1.5 p-1.5 md:p-2 rounded-md hover:bg-accent/10 transition-colors text-sm",
                          pathname === item.href ? "text-primary font-semibold bg-accent/5" : "text-muted-foreground"
                        )}
                        aria-current={pathname === item.href ? "page" : undefined}
                      >
                        {item.href === '/profile' ? <AvatarWithFrame size={20}/> : <item.icon size={18} aria-hidden="true" />}
                        <span className="hidden sm:inline">{item.label}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                       <p>{item.label === 'Profile' ? profile.username : item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </nav>
          </div>
        </div>
        <div className="h-10 flex items-center justify-center text-center group"> 
          {isClient && (
            <AnimatePresence mode="wait">
              {currentQuote ? (
                <motion.div
                  key={currentQuote} 
                  initial={{ opacity: 0, y: -15, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 15 }}
                  className="flex items-center"
                >
                  <p className="text-md md:text-lg text-foreground/90 font-serif italic mx-auto">
                    "{currentQuote}" 
                    {currentAuthor && <span className="text-sm text-muted-foreground not-italic"> - {currentAuthor}</span>}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 text-primary/70 hover:text-primary"
                    onClick={handleSaveQuote}
                    aria-label="Save quote"
                  >
                    <BookmarkPlus size={16} />
                  </Button>
                </motion.div>
              ) : (
                <Loader2 size={18} className="animate-spin text-muted-foreground" />
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </header>
  );
}



'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag, CheckCircle, Gem, Palette, Lock, Star, Zap, Paintbrush, Eye, Moon, Sun, Sparkles, Construction, Gift, KeyRound, TrendingUp, Award, ShieldCheck, CaseSensitive, Music2, GraduationCap, Smile, Sprout, Droplets, Waves, Trees, Flame, Sunrise, Minimize2, MinusSquare, Gamepad2, MountainSnow, UserSquare } from 'lucide-react';
import { rewardService, type RewardDefinition, type OwnedReward } from '@/services/rewardService';
import { useScore } from '@/contexts/ScoreContext';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext'; 
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge as UiBadge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';

type LucideIconName = keyof typeof LucideIcons;


export default function RewardsPage() {
  const [isClient, setIsClient] = useState(false);
  const [allRewards, setAllRewards] = useState<RewardDefinition[]>([]);
  const [ownedRewards, setOwnedRewards] = useState<OwnedReward[]>([]);
  
  const { score, spendScore } = useScore();
  const { refreshEquippedCosmetics } = useUser();
  const { setTheme } = useTheme(); 
  const { toast } = useToast();

  const fetchRewardsData = useCallback(() => {
    if (isClient) {
      setAllRewards(rewardService.getAllRewardDefinitions());
      setOwnedRewards(rewardService.getOwnedRewards());
    }
  }, [isClient]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetchRewardsData();
  }, [fetchRewardsData]);

  const handlePurchase = (rewardId: RewardDefinition['id']) => {
    const definition = rewardService.getRewardDefinition(rewardId);
    if(!definition) return;

    const result = rewardService.purchaseReward(rewardId, score);
    if (result.success) {
      spendScore(definition.points);
      fetchRewardsData(); 
      refreshEquippedCosmetics(); 
      toast({
        title: "Reward Purchased!",
        description: result.message,
      });
       
      if (definition.effect?.type === 'site_theme') {
        setTheme(definition.effect.value as string); 
        toast({ title: "Theme Applied!", description: `${definition.name} is now active.` });
      }
      if (rewardId === 'MASCOT_HAT_TINY') {
        rewardService.addMascotAccessory(rewardId);
      }
    } else {
      toast({
        title: "Purchase Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };


  if (!isClient) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background p-4">
        <div className="animate-pulse text-primary flex flex-col items-center">
          <Loader2 size={64} className="mb-4 animate-spin" />
          <p className="text-2xl font-semibold">Loading Rewards Store...</p>
        </div>
      </div>
    );
  }

  const getRewardIcon = (reward: RewardDefinition): React.ReactNode => {
    const IconComponent = reward.icon ? LucideIcons[reward.icon as LucideIconName] : null;
    if (IconComponent) {
      return <IconComponent size={36} className="text-primary" />;
    }
    switch(reward.category) {
      case 'Profile Decoration': return <Palette size={36} className="text-pink-500" />;
      case 'Site Theme': return <Paintbrush size={36} className="text-purple-500" />;
      case 'Utility': return <Zap size={36} className="text-yellow-500" />;
      case 'Title': return <CaseSensitive size={36} className="text-orange-500" />;
      case 'Points & Boosts': return <TrendingUp size={36} className="text-green-500" />;
      case 'Mascot Interaction': return <Sparkles size={36} className="text-teal-500" />;
      case 'Fun & Misc': return <Gift size={36} className="text-indigo-500" />;
      case 'Sound & Visual FX': return <Music2 size={36} className="text-cyan-500" />;
      case 'Content Unlock': return <KeyRound size={36} className="text-lime-500" />;
      case 'Tab Theme': 
        if (reward.id === 'THEME_TASKS_OCEAN') return <Waves size={36} className="text-blue-400" />;
        if (reward.id === 'THEME_JOURNAL_FOREST') return <Trees size={36} className="text-green-700" />;
        if (reward.id === 'THEME_REVIEW_COSMIC') return <Sparkles size={36} className="text-purple-400" />;
        if (reward.id === 'THEME_ACHIEVEMENTS_VOLCANIC') return <Flame size={36} className="text-red-500" />;
        if (reward.id === 'THEME_REWARDS_TREASURE') return <Gem size={36} className="text-yellow-400" />;
        if (reward.id === 'THEME_PROFILE_SUNSET') return <Sunrise size={36} className="text-orange-400" />;
        return <Paintbrush size={36} className="text-purple-500" />;
      default: return <ShoppingBag size={36} className="text-primary" />;
    }
  };

  const displayRewards = allRewards;


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center">
            <ShoppingBag className="mr-3 text-primary" size={32} />
            Rewards Store
          </h1>
          <p className="text-muted-foreground">
            Spend your hard-earned points on cool cosmetics and utilities!
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-secondary p-2 px-4 rounded-lg shadow">
          <Star size={24} className="text-yellow-400" />
          <span className="text-xl font-semibold text-foreground">{score} Points</span>
        </div>
      </div>
      
      <Separator />

      {displayRewards.length === 0 ? (
         <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Store Highlights</CardTitle>
            <CardDescription>Check back soon for exciting rewards!</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
             <Construction size={64} className="mx-auto text-primary mb-6" data-ai-hint="store empty construction"/>
            <p className="text-2xl font-semibold text-primary">Store is Empty!</p>
            <p className="text-muted-foreground mt-2">
              We're working hard to stock up. Stay tuned!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayRewards.map((reward) => {
            const isOwned = rewardService.isRewardOwned(reward.id);
            const ownedInstance = isOwned ? rewardService.getOwnedRewardInstance(reward.id) : undefined;
            const definition = rewardService.getRewardDefinition(reward.id) || reward;
            
            let canPurchase = !isOwned || (definition?.type === 'rebuyable-cosmetic-stack' || definition?.type === 'temporary-cosmetic' || definition?.type === 'temporary-boost' || definition?.type === 'one-time-consumable');
             if(isOwned && definition?.type === 'one-time-consumable' && definition.maxOwnable){
                 const currentOwnedCount = ownedRewards.filter(or => or.id === reward.id && (or.usesLeft === undefined || or.usesLeft > 0)).length;
                 if(currentOwnedCount >= definition.maxOwnable) canPurchase = false;
             }
             if(isOwned && definition?.type === 'one-time-permanent') canPurchase = false;


            return (
              <Card 
                key={reward.id} 
                className={cn(
                  "shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col",
                  isOwned && (reward.type === 'one-time-permanent' || (reward.type === 'one-time-consumable' && ownedInstance?.usesLeft === 0)) ? "opacity-60 bg-secondary/30" : "bg-card"
                )}
              >
                <CardHeader className="pb-3 items-center">
                  <div className="w-full h-24 bg-muted rounded-t-lg flex items-center justify-center mb-2">
                    {getRewardIcon(reward)}
                  </div>
                  <CardTitle className="text-lg font-medium leading-tight text-center h-12 flex items-center justify-center">{reward.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-1 text-sm">
                  <p className="text-muted-foreground min-h-[40px] text-xs">{reward.description}</p>
                  <UiBadge variant="outline" className="text-xs">{reward.category}</UiBadge>
                   {ownedInstance?.usesLeft !== undefined && <p className="text-xs text-accent">Uses left: {ownedInstance.usesLeft}</p>}
                   {ownedInstance?.expiresAt && <p className="text-xs text-destructive">Expires: {new Date(ownedInstance.expiresAt).toLocaleDateString()}</p>}
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-3 mt-auto">
                  <span className="text-lg font-semibold text-primary flex items-center">
                    <Star size={16} className="mr-1 text-yellow-500" /> {reward.points}
                  </span>
                  <Button
                    onClick={() => handlePurchase(reward.id)}
                    disabled={!canPurchase || score < reward.points}
                    size="sm"
                    variant={isOwned && reward.type === 'one-time-permanent' ? "outline" : "default"}
                    className={cn(isOwned && reward.type === 'one-time-permanent' ? "cursor-not-allowed" : "")}
                  >
                    {isOwned && reward.type === 'one-time-permanent' ? (
                      <><CheckCircle size={16} className="mr-1" /> Owned</>
                    ) : !canPurchase && isOwned ? (
                       <><CheckCircle size={16} className="mr-1" /> Max Owned</>
                    ) : (
                      <><ShoppingBag size={16} className="mr-1" /> Buy</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

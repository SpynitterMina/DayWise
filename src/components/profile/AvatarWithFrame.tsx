
'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { rewardService } from '@/services/rewardService';
import { useEffect, useState } from 'react';

interface AvatarWithFrameProps {
  size?: number;
  className?: string;
}

export default function AvatarWithFrame({ size = 40, className }: AvatarWithFrameProps) {
  const { profile } = useUser();
  const [frameStyle, setFrameStyle] = useState<React.CSSProperties>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient) {
      const activeFrameDef = rewardService.getEquippedCosmeticForSlot('Profile Decoration', 'avatar_frame');
      let newFrameStyle: React.CSSProperties = {};
      if (activeFrameDef?.effect?.value === 'gold') {
        newFrameStyle = { border: '3px solid gold', borderRadius: '50%', padding: '2px' };
      } else if (activeFrameDef?.effect?.value === 'glow_primary') {
        newFrameStyle = {
          boxShadow: '0 0 10px 2px hsl(var(--primary)), 0 0 5px 1px hsl(var(--primary) / 0.7)',
          borderRadius: '50%',
          padding: '2px',
        };
      }
      setFrameStyle(newFrameStyle);
    }
  }, [profile, isClient]); // Re-run if profile or equipped items might change

  if (!isClient) {
    return (
      <div
        className={cn("rounded-full bg-muted flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        aria-label="Loading avatar"
      >
        {/* Simple placeholder for SSR/initial load */}
      </div>
    );
  }


  return (
    <div
      className={cn("relative rounded-full", className)}
      style={{ ...frameStyle, width: size, height: size }}
      data-ai-hint="profile avatar"
    >
      <Image
        src={profile.avatarUrl}
        alt={profile.username || 'User Avatar'}
        width={size - (frameStyle.padding ? Number(String(frameStyle.padding).replace('px',''))*2 : 0) - (frameStyle.border ? Number(String(frameStyle.border).split(' ')[0].replace('px',''))*2 : 0) } // Adjust for padding/border
        height={size - (frameStyle.padding ? Number(String(frameStyle.padding).replace('px',''))*2 : 0) - (frameStyle.border ? Number(String(frameStyle.border).split(' ')[0].replace('px',''))*2 : 0) }
        className="rounded-full object-cover"
      />
    </div>
  );
}

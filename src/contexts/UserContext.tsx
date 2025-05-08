
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { RewardID, RewardCategory } from '@/config/rewardsConfig';
import { rewardService }  from '@/services/rewardService'; 

export interface UserProfileData {
  username: string;
  avatarUrl: string;
  bannerUrl?: string;
  title?: string; 
  profileBackgroundColor?: string;
  
}

interface UserContextType {
  profile: UserProfileData;
  updateProfile: (data: Partial<UserProfileData>) => void;
  getEquippedCosmetic: (category: RewardCategory, effectType: any) 
    => RewardID | undefined; 
  equippedCosmetics: rewardService.EquippedCosmetics;
  refreshEquippedCosmetics: () => void;
}

const USER_PROFILE_STORAGE_KEY = 'daywiseUserProfile_v3'; // Incremented version

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultProfile: UserProfileData = {
  username: 'DayWise User',
  avatarUrl: 'https://picsum.photos/seed/avatar/100/100', 
  
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfileData>(defaultProfile);
  const [isInitialized, setIsInitialized] = useState(false);
  const [equippedCosmetics, setEquippedCosmetics] = useState<rewardService.EquippedCosmetics>({});

  const refreshEquippedCosmetics = useCallback(() => {
    if (typeof window !== 'undefined') {
      setEquippedCosmetics(rewardService.getEquippedCosmetics());
    }
  }, []);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
      if (storedProfile) {
        try {
          setProfile(JSON.parse(storedProfile));
        } catch (e) {
          console.error("Failed to parse user profile from localStorage", e);
          localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
        }
      }
      refreshEquippedCosmetics();
      setIsInitialized(true);
    }
  }, [refreshEquippedCosmetics]);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    }
  }, [profile, isInitialized]);

  
  useEffect(() => {
    if (isInitialized) {
        const activeBannerDef = rewardService.getEquippedCosmeticForSlot('Profile Decoration', 'profile_banner');
        const activeBgColorDef = rewardService.getEquippedCosmeticForSlot('Profile Decoration', 'profile_background');
        const activeTitleDef = rewardService.getEquippedCosmeticForSlot('Title', 'username_style');


        setProfile(prev => ({
            ...prev,
            bannerUrl: activeBannerDef?.effect?.value as string || defaultProfile.bannerUrl,
            profileBackgroundColor: activeBgColorDef?.effect?.value as string || defaultProfile.profileBackgroundColor,
            title: activeTitleDef?.effect?.value as string || defaultProfile.title,
        }));
    }
  }, [equippedCosmetics, isInitialized]);


  const updateProfile = useCallback((data: Partial<UserProfileData>) => {
    setProfile(prev => ({ ...prev, ...data }));
  }, []);

  const getEquippedCosmetic = useCallback((category: RewardCategory, effectType: any): RewardID | undefined => {
    const categoryKey = `${category}_${effectType}`;
    return equippedCosmetics[categoryKey];
  }, [equippedCosmetics]);


  return (
    <UserContext.Provider value={{ profile, updateProfile, getEquippedCosmetic, equippedCosmetics, refreshEquippedCosmetics }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

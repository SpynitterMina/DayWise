
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { rewardService } from '@/services/rewardService'; 

export type ThemeName = 'default' | 'dark' | 'zen' | 'minimalist' | 'retro' | 'rainbow' | 
                        'ocean' | 'forest' | 'cosmic' | 'volcanic' | 'treasure' | 'sunset'; 

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (themeName: ThemeName | string) => void; 
  getTabTheme: (tabKey: string) => ThemeName | undefined;
  activeTabThemes: Record<string, ThemeName>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'daywiseAppTheme_v3'; // Incremented version
const TAB_THEME_STORAGE_KEY_PREFIX = 'daywiseTabTheme_';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>('default');
  const [activeTabThemes, setActiveTabThemes] = useState<Record<string, ThemeName>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const applyThemeToBody = (themeName: ThemeName) => {
    document.documentElement.classList.remove('dark', 'zen', 'minimalist', 'retro', 'rainbow', 'ocean', 'forest', 'cosmic', 'volcanic', 'treasure', 'sunset'); 
    if (themeName !== 'default') {
      document.documentElement.classList.add(themeName);
    }
    if (themeName === 'dark') { 
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  };
  
  const loadAndApplyEquippedThemes = useCallback(() => {
    if (typeof window !== 'undefined') {
      
      const globalThemeDef = rewardService.getEquippedCosmeticForSlot('Site Theme', 'site_theme');
      const storedGlobalTheme = localStorage.getItem(THEME_STORAGE_KEY);
      let currentGlobalTheme: ThemeName = 'default';

      if (globalThemeDef && globalThemeDef.effect?.value) {
        currentGlobalTheme = globalThemeDef.effect.value as ThemeName;
      } else if (storedGlobalTheme) {
        currentGlobalTheme = storedGlobalTheme as ThemeName;
      }
      setThemeState(currentGlobalTheme);
      applyThemeToBody(currentGlobalTheme);


      
      const newActiveTabThemes: Record<string, ThemeName> = {};
      const rewardDefs = rewardService.getAllRewardDefinitions();
      const equippedCosmetics = rewardService.getEquippedCosmetics();

      rewardDefs.forEach(def => {
        if (def.category === 'Tab Theme' && def.effect?.type === 'tab_theme' && def.effect.target) {
           const equipKey = `Tab Theme_tab_theme_${def.effect.target}`;
           if(equippedCosmetics[equipKey] === def.id) {
             newActiveTabThemes[def.effect.target] = def.effect.value as ThemeName;
           }
        }
      });
      setActiveTabThemes(newActiveTabThemes);
    }
  }, []);


  useEffect(() => {
    setIsInitialized(true);
    loadAndApplyEquippedThemes();
    
    
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'daywiseUserEquippedCosmetics_v3') { 
            loadAndApplyEquippedThemes();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [loadAndApplyEquippedThemes]);


  const setTheme = useCallback((themeNameInput: ThemeName | string) => {
    const themeName = themeNameInput as ThemeName;
    setThemeState(themeName);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, themeName);
      applyThemeToBody(themeName);

      
      const themeReward = rewardService.getAllRewardDefinitions().find(r => r.effect?.type === 'site_theme' && r.effect.value === themeName);
      if (themeReward) {
        rewardService.equipCosmetic(themeReward.id);
      }
    }
  }, []);

  const getTabTheme = useCallback((tabKey: string): ThemeName | undefined => {
    return activeTabThemes[tabKey];
  }, [activeTabThemes]);


  return (
    <ThemeContext.Provider value={{ theme, setTheme, getTabTheme, activeTabThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

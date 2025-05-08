
'use client';

import { allRewardDefinitions, type RewardDefinition, type RewardID, type RewardCategory, type RewardEffect } from '@/config/rewardsConfig';
import { addDays, isAfter } from 'date-fns';

const OWNED_REWARDS_STORAGE_KEY = 'daywiseUserOwnedRewards_v3'; // Incremented version
const EQUIPPED_COSMETICS_STORAGE_KEY = 'daywiseUserEquippedCosmetics_v3'; // Incremented version
const MASCOT_STATE_KEY = 'daywiseMascotState_v3'; // Incremented version

export interface OwnedReward {
  id: RewardID;
  purchasedAt: string; 
  expiresAt?: string;   
  usesLeft?: number;
  isActive?: boolean; 
}

export interface EquippedCosmetics {
  [key: string]: RewardID | undefined; 
}

interface MascotState {
  accessories: RewardID[];
  customMessage?: string;
}


function loadData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error(`Failed to parse ${key} from localStorage`, e);
    localStorage.removeItem(key);
    return defaultValue;
  }
}

function saveData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}


export function getAllRewardDefinitions(): RewardDefinition[] {
  return allRewardDefinitions;
}

export function getRewardDefinition(id: RewardID): RewardDefinition | undefined {
  return allRewardDefinitions.find(def => def.id === id);
}

export function getOwnedRewards(): OwnedReward[] {
  let rewards = loadData<OwnedReward[]>(OWNED_REWARDS_STORAGE_KEY, []);
  const now = new Date();
  rewards = rewards.filter(r => {
    if (r.expiresAt && isAfter(now, new Date(r.expiresAt))) {
      const def = getRewardDefinition(r.id);
      if (def && def.effect && (def.type === 'temporary-cosmetic' || def.type === 'temporary-boost')) {
        const categoryKey = `${def.category}_${def.effect.type}`;
        const equipped = getEquippedCosmetics();
        if (equipped[categoryKey] === r.id) {
          unequipCosmetic(def.category, def.effect.type);
        }
      }
      return false; 
    }
    return true;
  });
  saveData(OWNED_REWARDS_STORAGE_KEY, rewards); 
  return rewards;
}

export function isRewardOwned(id: RewardID): boolean {
  const owned = getOwnedRewards();
  return owned.some(r => r.id === id);
}

export function getOwnedRewardInstance(id: RewardID): OwnedReward | undefined {
  return getOwnedRewards().find(r => r.id === id);
}

export function purchaseReward(id: RewardID, currentScore: number): { success: boolean; newScore: number; message: string } {
  const definition = getRewardDefinition(id);
  if (!definition) {
    return { success: false, newScore: currentScore, message: 'Reward not found.' };
  }

  if (currentScore < definition.points) {
    return { success: false, newScore: currentScore, message: 'Not enough points.' };
  }

  let ownedRewards = getOwnedRewards();
  const existingOwned = ownedRewards.find(r => r.id === id);

  if (definition.type === 'one-time-permanent' && existingOwned) {
    return { success: false, newScore: currentScore, message: 'You already own this permanent unlock.' };
  }
  
  if (definition.type === 'one-time-consumable' && definition.maxOwnable) {
      const count = ownedRewards.filter(r => r.id === id && (r.usesLeft === undefined || r.usesLeft > 0)).length;
      if (count >= definition.maxOwnable) {
          return { success: false, newScore: currentScore, message: `You can only own ${definition.maxOwnable} of this item.` };
      }
  }

  const newOwnedReward: OwnedReward = {
    id,
    purchasedAt: new Date().toISOString(),
  };

  if (definition.durationDays) {
    newOwnedReward.expiresAt = addDays(new Date(), definition.durationDays).toISOString();
  }
  if (definition.uses) {
    newOwnedReward.usesLeft = definition.uses;
  }
   if (definition.type === 'temporary-boost' || (definition.type === 'one-time-consumable' && definition.effect?.type === 'points_multiplier')) {
    newOwnedReward.isActive = false; 
  }

  ownedRewards.push(newOwnedReward); 
  saveData(OWNED_REWARDS_STORAGE_KEY, ownedRewards);
  
  if (definition.effect && (definition.type === 'one-time-permanent' || definition.type === 'rebuyable-cosmetic-equip' || definition.type === 'temporary-cosmetic')) {
      if (definition.effect.type === 'site_theme' || definition.effect.type === 'tab_theme') {
          
          equipCosmetic(id); 
      } else {
          const categoryKey = `${definition.category}_${definition.effect.type}`;
          const equipped = getEquippedCosmetics();
          if(!equipped[categoryKey] || definition.type === 'rebuyable-cosmetic-equip' || definition.type === 'temporary-cosmetic') { 
              equipCosmetic(id);
          }
      }
  }

  return { success: true, newScore: currentScore - definition.points, message: `${definition.name} purchased successfully!` };
}

export function consumeRewardUse(id: RewardID): boolean {
  let ownedRewards = getOwnedRewards();
  const rewardIndex = ownedRewards.findIndex(r => r.id === id);
  if (rewardIndex === -1) return false;

  const reward = ownedRewards[rewardIndex];
  if (reward.usesLeft === undefined || reward.usesLeft <= 0) return false;

  reward.usesLeft -= 1;
  saveData(OWNED_REWARDS_STORAGE_KEY, ownedRewards);
  return true;
}

export function activateBoost(id: RewardID): boolean {
  let ownedRewards = getOwnedRewards();
  const reward = ownedRewards.find(r => r.id === id);
  const definition = getRewardDefinition(id);

  if (!reward || !definition || (definition.type !== 'temporary-boost' && definition.type !== 'one-time-consumable')) return false;
  if (reward.isActive) return false; 
  if (reward.usesLeft !== undefined && reward.usesLeft <=0) return false; 

  if (definition.effect) {
      ownedRewards.forEach(r => {
          const def = getRewardDefinition(r.id);
          if(r.isActive && def?.effect?.type === definition.effect?.type && r.id !== id) {
              r.isActive = false;
          }
      });
  }
  
  reward.isActive = true;
  if (definition.uses) { 
      if (reward.usesLeft === undefined) reward.usesLeft = definition.uses; 
      if(reward.usesLeft > 0) reward.usesLeft--;
      else return false; 
  }
  if (definition.durationDays && !reward.expiresAt) { 
      reward.expiresAt = addDays(new Date(), definition.durationDays).toISOString();
  }

  saveData(OWNED_REWARDS_STORAGE_KEY, ownedRewards);
  return true;
}

export function deactivateBoost(id: RewardID): void {
  let ownedRewards = getOwnedRewards();
  const reward = ownedRewards.find(r => r.id === id);
  if (reward && reward.isActive) {
    reward.isActive = false;
    saveData(OWNED_REWARDS_STORAGE_KEY, ownedRewards);
  }
}

export function getActiveBoosts(): OwnedReward[] {
    const now = new Date();
    return getOwnedRewards().filter(r => {
        const def = getRewardDefinition(r.id);
        if (!def || (def.type !== 'temporary-boost' && def.type !== 'one-time-consumable')) return false;
        if (!r.isActive) return false;
        if (r.expiresAt && isAfter(now, new Date(r.expiresAt))) {
            r.isActive = false; 
            return false;
        }
        return true;
    });
}


export function getEquippedCosmetics(): EquippedCosmetics {
  return loadData<EquippedCosmetics>(EQUIPPED_COSMETICS_STORAGE_KEY, {});
}

export function equipCosmetic(rewardId: RewardID): void {
  const definition = getRewardDefinition(rewardId);
  if (!definition || !definition.effect) return;
  if (!isRewardOwned(rewardId)) return; 

  const categoryKey = `${definition.category}_${definition.effect.type}`;
  
  let equipped = getEquippedCosmetics();
  
  const finalKey = definition.effect.type === 'tab_theme' && definition.effect.target 
    ? `${categoryKey}_${definition.effect.target}` 
    : categoryKey;

  equipped[finalKey] = rewardId;
  saveData(EQUIPPED_COSMETICS_STORAGE_KEY, equipped);
}

export function unequipCosmetic(category: RewardCategory, effectType: RewardEffect['type'], effectTarget?: string): void {
  const categoryKey = `${category}_${effectType}`;
  const finalKey = effectType === 'tab_theme' && effectTarget 
    ? `${categoryKey}_${effectTarget}` 
    : categoryKey;
    
  let equipped = getEquippedCosmetics();
  delete equipped[finalKey];
  saveData(EQUIPPED_COSMETICS_STORAGE_KEY, equipped);
}

export function getEquippedCosmeticForSlot(category: RewardCategory, effectType: RewardEffect['type'], effectTarget?: string): RewardDefinition | undefined {
    const equippedMap = getEquippedCosmetics();
    const categoryKey = `${category}_${effectType}`;
    const finalKey = effectType === 'tab_theme' && effectTarget 
      ? `${categoryKey}_${effectTarget}` 
      : categoryKey;

    const equippedId = equippedMap[finalKey];

    if (equippedId) {
        const def = getRewardDefinition(equippedId);
        const ownedInstance = getOwnedRewardInstance(equippedId);
        if (def && ownedInstance) {
            if(ownedInstance.expiresAt && isAfter(new Date(), new Date(ownedInstance.expiresAt))) {
                unequipCosmetic(category, effectType, effectTarget); 
                return undefined;
            }
            return def;
        }
    }
    return undefined;
}


export function getMascotState(): MascotState {
    return loadData<MascotState>(MASCOT_STATE_KEY, { accessories: [] });
}
export function addMascotAccessory(accessoryId: RewardID): void {
    if(!isRewardOwned(accessoryId)) return;
    const state = getMascotState();
    if(!state.accessories.includes(accessoryId)){
        state.accessories.push(accessoryId);
        saveData(MASCOT_STATE_KEY, state);
    }
}

export const rewardService = {
  getAllRewardDefinitions,
  getRewardDefinition,
  getOwnedRewards,
  isRewardOwned,
  getOwnedRewardInstance,
  purchaseReward,
  consumeRewardUse,
  activateBoost,
  deactivateBoost,
  getActiveBoosts,
  getEquippedCosmetics,
  equipCosmetic,
  unequipCosmetic,
  getEquippedCosmeticForSlot,
  getMascotState,
  addMascotAccessory,
};

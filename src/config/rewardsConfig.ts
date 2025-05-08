
export type RewardID =
  | 'GOLDEN_AVATAR_FRAME' | 'FOUNDER_BADGE' | 'EXCLUSIVE_ANIMATED_BANNER' | 'ZEN_MODE_THEME'
  | 'CUSTOM_FONT_UNLOCK' | 'BETA_TESTER_TITLE' | 'RENAME_POINTS' | 'MASCOT_MESSAGE'
  | 'EASTER_EGG_PAGE' | 'DOUBLE_POINTS_VOUCHER'
  | 'AVATAR_PACK_STANDARD' | 'AVATAR_PACK_THEMED_SCIFI' | 'PROFILE_BANNER_BASIC_NATURE'
  | 'PROFILE_BANNER_PREMIUM_SPACE' | 'PROFILE_GLOW_7D' | 'USERNAME_COLOR_BLUE_7D'
  | 'PROFILE_BG_COLOR_LIGHTPINK' | 'PROFILE_BG_GRADIENT_SUNSET' | 'ANIMATED_EMOTICON_PACK_HAPPY'
  | 'TITLE_FOCUSED_FOX_30D' | 'TITLE_TASK_NINJA_30D' | 'TITLE_STUDY_SENSEI_30D'
  | 'SOUND_COMPLETE_SPARKLE' | 'CONFETTI_COMPLETE_10X' | 'THEME_MINIMALIST_7D'
  | 'THEME_DARK_MODE_PERMANENT' | 'THEME_RETRO_GAME_7D' | 'THEME_RAINBOW_1H' 
  | 'CURSOR_PACK_FUNKY' | 'FONT_STYLE_PACK_SERIF' | 'STICKER_PACK_CUTE_ANIMALS'
  | 'BOOST_FOCUS_1H' | 'BOOST_POINT_SURGE_3TASKS' | 'STREAK_SHIELD_1USE_WEEKLY'
  | 'TASK_SNOOZE_3USE' | 'HIGHLIGHT_COLOR_PURPLE'
  | 'MASCOT_HAT_TINY' | 'MASCOT_CARD_WELLDONE' | 'UNLOCK_JOKE_STUDY'
  | 'UNLOCK_QUOTE_MOTIVATIONAL' | 'MODE_DANCE_PARTY_5MIN' | 'LOADING_MSG_CUSTOM'
  | 'PROFILE_MOOD_HAPPY' | 'VIRTUAL_HIGH_FIVE' | 'CONFETTI_LOGIN_NEXT'
  | 'SFX_8BIT_7D' | 'VIRTUAL_PLANT_PROFILE' | 'WATER_VIRTUAL_PLANT'
  | 'COMMUNITY_STATS_ACCESS' | 'SUBMIT_TASK_IDEA'
  // Individual Tab Themes
  | 'THEME_TASKS_OCEAN' | 'THEME_JOURNAL_FOREST' | 'THEME_REVIEW_COSMIC' | 'THEME_ACHIEVEMENTS_VOLCANIC' | 'THEME_REWARDS_TREASURE' | 'THEME_PROFILE_SUNSET';


export type RewardCategory =
  | 'Profile Decoration' | 'Site Theme' | 'Utility' | 'Title'
  | 'Points & Boosts' | 'Mascot Interaction' | 'Fun & Misc' | 'Sound & Visual FX' | 'Content Unlock' | 'Tab Theme';

export type RewardType =
  | 'one-time-permanent'       
  | 'one-time-consumable'      
  | 'rebuyable-cosmetic-equip' 
  | 'rebuyable-cosmetic-stack' 
  | 'temporary-cosmetic'       
  | 'temporary-boost'          
  | 'service';                   

export interface RewardEffect {
  type: 'avatar_frame' | 'profile_badge' | 'profile_banner' | 'site_theme' | 'custom_font' 
        | 'points_multiplier' | 'streak_protection' | 'task_visual' | 'completion_sound' 
        | 'completion_vfx' | 'cursor_style' | 'loading_message' | 'profile_mood_icon' 
        | 'sfx_pack' | 'virtual_item' | 'access_page' | 'username_style' | 'profile_background' | 'tab_theme';
  value: any; 
  target?: string; 
}

export interface RewardDefinition {
  id: RewardID;
  name: string;
  description: string;
  points: number;
  category: RewardCategory;
  type: RewardType;
  icon?: string; 
  previewImage?: string; 
  effect?: RewardEffect;
  durationDays?: number; 
  maxOwnable?: number; 
  uses?: number; 
}

export const allRewardDefinitions: RewardDefinition[] = [
  // Site Themes
  {
    id: 'ZEN_MODE_THEME', name: 'Zen Mode Theme', description: 'Ultra-minimalist, distraction-free site theme.',
    points: 1500, category: 'Site Theme', type: 'one-time-permanent', icon: 'Minimize2',
    effect: { type: 'site_theme', value: 'zen' }
  },
  {
    id: 'THEME_MINIMALIST_7D', name: 'Minimalist Theme (7 Days)', description: 'A clean, temporary theme for focused work.',
    points: 100, category: 'Site Theme', type: 'temporary-cosmetic', icon: 'MinusSquare', durationDays: 7,
    effect: { type: 'site_theme', value: 'minimalist' }
  },
  {
    id: 'THEME_DARK_MODE_PERMANENT', name: 'Dark Mode Theme', description: 'A sleek permanent dark mode for the site.',
    points: 500, category: 'Site Theme', type: 'one-time-permanent', icon: 'Moon',
    effect: { type: 'site_theme', value: 'dark' }
  },
  {
    id: 'THEME_RETRO_GAME_7D', name: 'Retro Game Theme (7 Days)', description: 'A fun, pixel-art style theme.',
    points: 150, category: 'Site Theme', type: 'temporary-cosmetic', icon: 'Gamepad2', durationDays: 7,
    effect: { type: 'site_theme', value: 'retro' }
  },
  {
    id: 'THEME_RAINBOW_1H', name: 'Rainbow Burst Theme (1 Hour)', description: 'A vibrant, temporary splash of color everywhere!',
    points: 50, category: 'Site Theme', type: 'temporary-cosmetic', icon: 'Palette', durationDays: (1/24), 
    effect: { type: 'site_theme', value: 'rainbow' }
  },

  // Individual Tab Themes
  {
    id: 'THEME_TASKS_OCEAN', name: 'Tasks: Ocean Depths', description: 'A calming blue/green theme for your Tasks page.',
    points: 200, category: 'Tab Theme', type: 'rebuyable-cosmetic-equip', icon: 'Waves',
    effect: { type: 'tab_theme', value: 'ocean', target: 'tasksPage' }
  },
  {
    id: 'THEME_JOURNAL_FOREST', name: 'Journal: Forest Retreat', description: 'Earthy tones for your Journal page.',
    points: 200, category: 'Tab Theme', type: 'rebuyable-cosmetic-equip', icon: 'Trees',
    effect: { type: 'tab_theme', value: 'forest', target: 'journalPage' }
  },
  {
    id: 'THEME_REVIEW_COSMIC', name: 'Review: Cosmic Flow', description: 'Dark blues and purples for Spaced Repetition.',
    points: 200, category: 'Tab Theme', type: 'rebuyable-cosmetic-equip', icon: 'Sparkles', 
    effect: { type: 'tab_theme', value: 'cosmic', target: 'reviewPage' }
  },
   {
    id: 'THEME_ACHIEVEMENTS_VOLCANIC', name: 'Achievements: Volcanic Ash', description: 'Fiery theme for your Achievements page.',
    points: 200, category: 'Tab Theme', type: 'rebuyable-cosmetic-equip', icon: 'Flame',
    effect: { type: 'tab_theme', value: 'volcanic', target: 'achievementsPage' }
  },
  {
    id: 'THEME_REWARDS_TREASURE', name: 'Rewards: Treasure Trove', description: 'Gold and gem theme for the Rewards Store.',
    points: 200, category: 'Tab Theme', type: 'rebuyable-cosmetic-equip', icon: 'Gem',
    effect: { type: 'tab_theme', value: 'treasure', target: 'rewardsPage' }
  },
   {
    id: 'THEME_PROFILE_SUNSET', name: 'Profile: Sunset Glow', description: 'Warm orange/purple theme for your Profile page.',
    points: 200, category: 'Tab Theme', type: 'rebuyable-cosmetic-equip', icon: 'Sunrise', 
    effect: { type: 'tab_theme', value: 'sunset', target: 'profilePage' }
  },

  // Other existing rewards
  {
    id: 'GOLDEN_AVATAR_FRAME', name: 'Golden Avatar Frame', description: 'A unique, prestigious frame for your profile picture.',
    points: 2500, category: 'Profile Decoration', type: 'one-time-permanent', icon: 'Award',
    effect: { type: 'avatar_frame', value: 'gold' }
  },
  {
    id: 'FOUNDER_BADGE', name: '"Founder" Profile Badge', description: 'A special badge for early adopters or special achievers.',
    points: 0, category: 'Profile Decoration', type: 'one-time-permanent', icon: 'ShieldCheck', 
    effect: { type: 'profile_badge', value: 'Founder' }
  },
   {
    id: 'RENAME_POINTS', name: 'Rename Your Points', description: 'Ability to rename "Points" to something custom for your account view (e.g., "Brain Cells").',
    points: 5000, category: 'Fun & Misc', type: 'service', icon: 'Edit3' // Service indicates it might need manual or special handling
  },
   {
    id: 'DOUBLE_POINTS_VOUCHER', name: '"Double Points" Voucher (24h)', description: 'Activates 2x points for all tasks completed in the next 24 hours.',
    points: 1000, category: 'Points & Boosts', type: 'one-time-consumable', icon: 'Zap',
    effect: { type: 'points_multiplier', value: 2 }, durationDays: 1, uses: 1
  },
  {
    id: 'AVATAR_PACK_STANDARD', name: 'Standard Avatar Pack', description: 'Unlock a pack of 5 new avatar images.',
    points: 150, category: 'Profile Decoration', type: 'rebuyable-cosmetic-stack', icon: 'UserSquare', 
    effect: { type: 'virtual_item', value: 'avatar_pack_standard' } // Assumes avatars are handled by some other system
  },
  {
    id: 'PROFILE_BANNER_BASIC_NATURE', name: 'Basic Profile Banner: Nature', description: 'A calm nature-themed static banner.',
    points: 200, category: 'Profile Decoration', type: 'rebuyable-cosmetic-equip', icon: 'MountainSnow', 
    effect: { type: 'profile_banner', value: 'https://picsum.photos/seed/naturebanner/1200/250' }
  },
  {
    id: 'PROFILE_GLOW_7D', name: 'Temporary Profile Glow (7 Days)', description: 'Adds a subtle glow effect around your avatar.',
    points: 100, category: 'Profile Decoration', type: 'temporary-cosmetic', icon: 'Sparkles', durationDays: 7, 
    effect: { type: 'avatar_frame', value: 'glow_primary' }
  },
  {
    id: 'PROFILE_BG_COLOR_LIGHTPINK', name: 'Profile Background: Light Pink', description: 'Set your profile card background to a soft light pink.',
    points: 50, category: 'Profile Decoration', type: 'rebuyable-cosmetic-equip', icon: 'Palette',
    effect: { type: 'profile_background', value: 'hsl(340, 100%, 95%)'} 
  },
  {
    id: 'TITLE_FOCUSED_FOX_30D', name: 'Title: "Focused Fox" (30 Days)', description: 'Display this fun title under your name.',
    points: 300, category: 'Title', type: 'temporary-cosmetic', icon: 'CaseSensitive', durationDays: 30,
    effect: { type: 'username_style', value: 'Focused Fox' }
  },
  {
    id: 'SOUND_COMPLETE_SPARKLE', name: 'Task Sound: Sparkle', description: 'A delightful sparkle sound on task completion.',
    points: 75, category: 'Sound & Visual FX', type: 'rebuyable-cosmetic-equip', icon: 'Music2',
    effect: { type: 'completion_sound', value: 'sparkle.mp3' } // Assumes sound files are handled elsewhere
  },
   {
    id: 'STREAK_SHIELD_1USE_WEEKLY', name: 'Streak Shield', description: 'Protects your task streak once if a day is missed. Max 1 per week.',
    points: 750, category: 'Utility', type: 'one-time-consumable', icon: 'Shield', uses: 1, maxOwnable: 1
  },
  {
    id: 'MASCOT_HAT_TINY', name: 'Mascot Accessory: Tiny Hat', description: 'Give your site mascot a dapper tiny hat!',
    points: 120, category: 'Mascot Interaction', type: 'rebuyable-cosmetic-stack', icon: 'GraduationCap',
    effect: { type: 'virtual_item', value: 'mascot_hat_tiny'}
  },
  {
    id: 'UNLOCK_JOKE_STUDY', name: 'Unlock a Study Joke', description: 'Displays a study-related joke for you.',
    points: 20, category: 'Fun & Misc', type: 'one-time-consumable', icon: 'Smile', uses: 1
  },
  {
    id: 'VIRTUAL_PLANT_PROFILE', name: 'Virtual Desk Plant', description: 'A small digital plant for your profile page.',
    points: 200, category: 'Profile Decoration', type: 'one-time-permanent', icon: 'Sprout',
    effect: {type: 'virtual_item', value: 'plant_seedling'} // Could link to a specific image or state
  },
  {
    id: 'WATER_VIRTUAL_PLANT', name: 'Water Your Plant', description: 'Help your virtual plant grow!',
    points: 10, category: 'Fun & Misc', type: 'one-time-consumable', icon: 'Droplets', uses: 1, // Changed from Profile Decoration
  },
];

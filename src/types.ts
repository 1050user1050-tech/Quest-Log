import { LucideIcon } from 'lucide-react';

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Elite';
export type TaskArea = string;

export interface AreaDefinition {
  id: string;
  name: string;
  iconName: string;
  color: 'rose' | 'blue' | 'indigo' | 'amber' | 'emerald';
  levelConfig: LevelConfig;
  decayConfig?: {
    xpPerDay: number;
    graceDays: number;
  };
}

export type Priority = 'None' | 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  name: string;
  xp: number;
  areaXP?: Record<TaskArea, number>;
  money: number;
  difficulty: Difficulty;
  priority: Priority;
  tags: string[];
  completed: boolean;
  completedAt?: number;
  dueDate?: string; // ISO string YYYY-MM-DD
  staminaCost?: number;
  isRepeating?: boolean;
  repeatInterval?: number; // Days
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconName: string;
  requirementType: 'tasks' | 'xp' | 'difficulty' | 'shop' | 'deadline';
  requirementValue: number;
  type: 'title' | 'curse' | 'feat'; // Added category
  reward?: {
    xp?: number;
    money?: number;
  };
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  iconName: string;
  imageUrl?: string; // New field for custom images
  buffType: 'xp' | 'money' | 'speed' | 'stamina';
  buffValue: number; // e.g. 1.2 for 20% boost
  category: string;
  itemType?: 'permanent' | 'consumable';
  duration?: number; // in seconds
}

export interface ActiveBuff {
  id: string;
  itemId: string;
  name: string;
  buffType: StoreItem['buffType'];
  buffValue: number;
  endTime: number;
  iconName: string;
}

export interface LevelConfig {
  baseXP: number;
  scalingType: 'fixed' | 'percentage' | 'hybrid' | 'progressive';
  scalingValue: number; // e.g. 100 for fixed, 1.1 for 10%
  fixedIncrease?: number; // for hybrid
  progressiveStep?: number; // for progressive
}

export interface Title {
  id: string;
  name: string;
  description: string;
  buffType: 'xp' | 'money' | 'speed' | 'stamina';
  buffValue: number;
  iconName: string;
}

export interface DungeonTask {
  id: string;
  name: string;
  difficulty: Difficulty;
  completed: boolean;
  completedAt?: number;
  xp: number;
  money: number;
  tags: string[];
}

export interface DungeonRoom {
  id: string;
  name: string;
  description: string;
  tasks: DungeonTask[];
  completed: boolean;
  reward?: {
    gold?: number;
    itemId?: string;
    titleId?: string;
  };
}

export interface Dungeon {
  id: string;
  name: string;
  description: string;
  rooms: DungeonRoom[];
  iconName: string;
  showInQuestLog: boolean;
  isCompleted: boolean;
}

export interface UserStats {
  xp: number;
  level: number;
  money: number;
  inventory: StoreItem[];
  activeBuffs?: ActiveBuff[];
  unlockedAchievements: string[]; // IDs
  unlockedTitles?: string[]; // IDs
  activeTitleId?: string | null;
  totalTasksCompleted: number;
  shopUsageCount: number;
  areaXP: Record<TaskArea, number>;
  areaLastActivity: Record<TaskArea, number>;
  stamina: {
    current: number;
    max: number;
  };
  avatarUrl?: string;
  levelConfig?: LevelConfig;
}

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Hard: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Elite: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

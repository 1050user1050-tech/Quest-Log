/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { 
  LayoutDashboard, 
  ListTodo, 
  Store, 
  Settings, 
  Plus, 
  Trophy, 
  Coins, 
  Zap, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Package,
  Trash2,
  Sword,
  Shield,
  Search,
  User as UserIcon,
  Crown,
  Calendar as CalendarIcon,
  Medal,
  Clock,
  ChevronLeft,
  Star,
  Heart,
  Users,
  Moon,
  Briefcase,
  Coffee,
  Battery,
  HelpCircle,
  Minus,
  Upload,
  Camera,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language, TranslationSchema } from './translations';
import { 
  Task, 
  StoreItem, 
  UserStats, 
  Difficulty, 
  DIFFICULTY_COLORS, 
  Achievement, 
  TaskArea, 
  AreaDefinition, 
  LevelConfig,
  Dungeon,
  DungeonRoom,
  DungeonTask,
  Title,
  ActiveBuff
} from './types';

// Constants
// Helper Functions
const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const calculateLevelInfo = (xp: number, config: LevelConfig) => {
  let level = 1;
  let remainingXP = xp;
  let xpForNextLevel = config.baseXP;

  const maxIters = 1000;
  let iters = 0;

  while (remainingXP >= xpForNextLevel && iters < maxIters) {
    remainingXP -= xpForNextLevel;
    level++;
    
    switch (config.scalingType) {
      case 'fixed':
        xpForNextLevel += config.scalingValue;
        break;
      case 'percentage':
        xpForNextLevel = Math.round(xpForNextLevel * config.scalingValue);
        break;
      case 'hybrid':
        xpForNextLevel = Math.round(xpForNextLevel * config.scalingValue) + (config.fixedIncrease || 0);
        break;
      case 'progressive':
        const step = (config.progressiveStep || 0) * (level - 1);
        xpForNextLevel += config.scalingValue + step;
        break;
    }
    
    if (xpForNextLevel <= 0) xpForNextLevel = 1;
    iters++;
  }

  const percent = (remainingXP / xpForNextLevel) * 100;
  return { level, currentXPInLevel: remainingXP, nextLevelXP: xpForNextLevel, progressPercent: percent };
};

const INITIAL_AREAS: AreaDefinition[] = [
  { id: 'Health', name: 'Saúde', iconName: 'Heart', color: 'rose', levelConfig: { baseXP: 500, scalingType: 'fixed', scalingValue: 0 } },
  { id: 'Social', name: 'Social', iconName: 'Users', color: 'blue', levelConfig: { baseXP: 500, scalingType: 'fixed', scalingValue: 0 } },
  { id: 'Sleep', name: 'Sono', iconName: 'Moon', color: 'indigo', levelConfig: { baseXP: 500, scalingType: 'fixed', scalingValue: 0 } },
  { id: 'Work', name: 'Carreira', iconName: 'Briefcase', color: 'amber', levelConfig: { baseXP: 500, scalingType: 'fixed', scalingValue: 0 } },
  { id: 'Leisure', name: 'Mente', iconName: 'Coffee', color: 'emerald', levelConfig: { baseXP: 500, scalingType: 'fixed', scalingValue: 0 } },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', name: 'Task Master', description: 'Complete 10 tasks', iconName: 'CheckCircle2', requirementType: 'tasks', requirementValue: 10, type: 'feat', reward: { money: 500 } },
  { id: 'a2', name: 'XP Hoarder', description: 'Earn 1000 total XP', iconName: 'Trophy', requirementType: 'xp', requirementValue: 1000, type: 'feat', reward: { money: 200 } },
  { id: 'a3', name: 'Elite Hunter', description: 'Complete a Hard or Elite task', iconName: 'Sword', requirementType: 'difficulty', requirementValue: 1, type: 'title', reward: { xp: 200 } },
  { id: 'a4', name: 'Big Spender', description: 'Use the shop 5 times', iconName: 'Store', requirementType: 'shop', requirementValue: 5, type: 'feat', reward: { xp: 100 } },
  { id: 'a5', name: 'Speed Runner', description: 'Complete a task before its deadline', iconName: 'Clock', requirementType: 'deadline', requirementValue: 1, type: 'curse', reward: { money: 300 } },
];

const PRIORITY_COLORS: Record<string, string> = {
  None: 'bg-slate-500/20 text-slate-400 border-white/5',
  Low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Urgent: 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-bold animate-pulse',
};

// Initial Mock Data
const INITIAL_TASKS: Task[] = [
  { id: '1', name: 'Morning Exercise', xp: 50, areaXP: { Health: 50 }, money: 10, difficulty: 'Easy', priority: 'Medium', completed: false, dueDate: new Date().toISOString().split('T')[0], staminaCost: 20 },
  { id: '2', name: 'Read for 30 minutes', xp: 100, areaXP: { Work: 100 }, money: 20, difficulty: 'Medium', priority: 'Low', completed: false, staminaCost: 10 },
  { id: '3', name: 'Coffee with Friends', xp: 150, areaXP: { Social: 150 }, money: 20, difficulty: 'Medium', priority: 'Low', completed: false, staminaCost: 5 },
  { id: '4', name: 'Deep Sleep Mastery', xp: 100, areaXP: { Sleep: 100 }, money: 150, difficulty: 'Hard', priority: 'High', completed: false, staminaCost: -20 },
];

const INITIAL_STORE: StoreItem[] = [
  { id: 'i1', name: 'Focus Potion', description: 'Increases XP gained by 25%', price: 50, iconName: 'Zap', buffType: 'xp', buffValue: 1.25, category: 'Buff' },
  { id: 'i2', name: 'Lucky Coin', description: 'Increases money gained by 50%', price: 100, iconName: 'Coins', buffType: 'money', buffValue: 1.5, category: 'Buff' },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('ql_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  
  const [storeItems, setStoreItems] = useState<StoreItem[]>(() => {
    const saved = localStorage.getItem('ql_store');
    return saved ? JSON.parse(saved) : INITIAL_STORE;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('ql_achievements');
    return saved ? JSON.parse(saved) : ACHIEVEMENTS;
  });

  const [areas, setAreas] = useState<AreaDefinition[]>(() => {
    const saved = localStorage.getItem('ql_areas');
    return saved ? JSON.parse(saved) : INITIAL_AREAS;
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('ql_stats');
    const defaultStats: UserStats = { 
      xp: 0, 
      level: 1, 
      money: 100, 
      inventory: [],
      unlockedAchievements: [],
      totalTasksCompleted: 0,
      shopUsageCount: 0,
      areaXP: {},
      areaLastActivity: {},
      stamina: {
        current: 100,
        max: 100
      },
      levelConfig: {
        baseXP: 1000,
        scalingType: 'fixed',
        scalingValue: 0
      }
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultStats, ...parsed };
      } catch (e) {
        return defaultStats;
      }
    }
    return defaultStats;
  });

  const [activeTab, setActiveTab] = useState<'questlog' | 'store' | 'manager' | 'profile' | 'calendar' | 'titles' | 'inventory' | 'dungeons'>('questlog');
  const [managerSubTab, setManagerSubTab] = useState<'tasks' | 'dungeons' | 'xp' | 'achievements' | 'store' | 'areas' | 'titles'>('tasks');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('ql_language');
    return (saved as Language) || 'pt';
  });

  const t = translations[language];
  const [titles, setTitles] = useState<Title[]>(() => {
    const saved = localStorage.getItem('ql_titles');
    const defaultTitles: Title[] = [
      { id: 't1', name: 'Aprendiz Silencioso', description: 'Um herói que iniciou sua jornada.', buffType: 'xp', buffValue: 1.05, iconName: 'Crown' },
      { id: 't2', name: 'Caçador de Recompensas', description: 'Especialista em acumular riquezas.', buffType: 'money', buffValue: 1.1, iconName: 'Coins' }
    ];
    return saved ? JSON.parse(saved) : defaultTitles;
  });
  const [dungeons, setDungeons] = useState<Dungeon[]>(() => {
    const saved = localStorage.getItem('ql_dungeons');
    return saved ? JSON.parse(saved) : [];
  });
  const [taskFilters, setTaskFilters] = useState({
    difficulty: 'All',
    priority: 'All',
    status: 'Active',
    search: '',
    showDungeonTasks: false
  });
  const [editingDungeon, setEditingDungeon] = useState<Dungeon | null>(null);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [editingArea, setEditingArea] = useState<AreaDefinition | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'level' | 'achievement' }[]>([]);

  useEffect(() => {
    // Daily Stamina Reset Logic
    const lastResetDate = localStorage.getItem('ql_last_stamina_reset');
    const today = new Date().toISOString().split('T')[0];

    if (lastResetDate !== today) {
      setUserStats(prev => ({
        ...prev,
        stamina: { ...prev.stamina, current: 100 }
      }));
      localStorage.setItem('ql_last_stamina_reset', today);
      addNotification(t.messages.staminaRestored, 'achievement');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ql_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('ql_store', JSON.stringify(storeItems));
  }, [storeItems]);

  useEffect(() => {
    localStorage.setItem('ql_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('ql_areas', JSON.stringify(areas));
  }, [areas]);

  useEffect(() => {
    localStorage.setItem('ql_dungeons', JSON.stringify(dungeons));
  }, [dungeons]);

  useEffect(() => {
    localStorage.setItem('ql_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('ql_stats', JSON.stringify(userStats));
  }, [userStats]);

  // Derived Values
  const levelInfo = useMemo(() => {
    const config = userStats.levelConfig || { baseXP: 1000, scalingType: 'fixed', scalingValue: 0 };
    return calculateLevelInfo(userStats.xp, config);
  }, [userStats.xp, userStats.levelConfig]);

  const currentLevel = levelInfo.level;
  const currentXPPercent = levelInfo.progressPercent;

  useEffect(() => {
    if (currentLevel > userStats.level) {
      // Level Up!
      const levelDiff = currentLevel - userStats.level;
      const reward = levelDiff * 250; // 250 Gold per level
      
      setUserStats(prev => ({ ...prev, level: currentLevel, money: prev.money + reward }));
      addNotification(`Level Up! Reached Level ${currentLevel}. Reward: ${reward} Gold.`, 'level');
    }
  }, [currentLevel, userStats.level]);

  useEffect(() => {
    // XP Decay Logic
    const lastDecayCheck = localStorage.getItem('ql_last_decay_check');
    const now = Date.now();
    const lastCheck = lastDecayCheck ? parseInt(lastDecayCheck) : now;
    
    if (now - lastCheck > 3600000) { // Check every hour
      const hoursPassed = (now - lastCheck) / 3600000;
      const daysPassed = hoursPassed / 24;
      
      setUserStats(prev => {
        const newAreaXP = { ...prev.areaXP };
        let changed = false;
        
        areas.forEach(area => {
          if (area.decayConfig && area.decayConfig.xpPerDay > 0) {
            const lastActivity = prev.areaLastActivity?.[area.id] || 0;
            const msSinceActivity = now - lastActivity;
            const daysSinceActivity = msSinceActivity / (1000 * 60 * 60 * 24);
            
            if (daysSinceActivity > area.decayConfig.graceDays) {
              const decayDays = daysSinceActivity - area.decayConfig.graceDays;
              // Only apply decay for the part that overlaps with the current check interval
              // This is a simplified version: just calculate decay based on days passed since last check
              // if we are already in the decay period.
              const amountToDecay = area.decayConfig.xpPerDay * Math.min(daysPassed, decayDays);
              
              if (amountToDecay > 0 && newAreaXP[area.id] > 0) {
                newAreaXP[area.id] = Math.max(0, newAreaXP[area.id] - amountToDecay);
                changed = true;
              }
            }
          }
        });
        
        if (changed) return { ...prev, areaXP: newAreaXP };
        return prev;
      });
      
      localStorage.setItem('ql_last_decay_check', now.toString());
    }
  }, [areas]);

  useEffect(() => {
    // Repeating Tasks Logic
    const lastRepeatCheck = localStorage.getItem('ql_last_repeat_check');
    const now = Date.now();
    const lastCheck = lastRepeatCheck ? parseInt(lastRepeatCheck) : 0;
    
    // Check every hour
    if (now - lastCheck > 3600000) {
      setTasks(prevTasks => {
        let changed = false;
        const newTasks = prevTasks.map(task => {
          if (task.completed && task.isRepeating && task.repeatInterval && task.completedAt) {
            const msSinceCompletion = now - task.completedAt;
            const msInterval = task.repeatInterval * 24 * 60 * 60 * 1000;
            
            if (msSinceCompletion >= msInterval) {
              changed = true;
              return { ...task, completed: false, completedAt: undefined };
            }
          }
          return task;
        });
        return changed ? newTasks : prevTasks;
      });
      localStorage.setItem('ql_last_repeat_check', now.toString());
    }
  }, []);

  useEffect(() => {
    checkAchievements();
  }, [tasks, userStats.xp, userStats.shopUsageCount]);

  const activeBuffs = useMemo(() => {
    const buffs: Record<string, number> = {};
    
    // Permanent buffs from inventory
    userStats.inventory.forEach(item => {
      if (item.itemType !== 'consumable') {
        buffs[item.buffType] = (buffs[item.buffType] || 1) * item.buffValue;
      }
    });

    // Temporary buffs
    userStats.activeBuffs?.forEach(buff => {
      if (buff.endTime > Date.now()) {
        buffs[buff.buffType] = (buffs[buff.buffType] || 1) * buff.buffValue;
      }
    });

    // Title Bonus
    if (userStats.activeTitleId) {
      const activeTitle = titles.find(t => t.id === userStats.activeTitleId);
      if (activeTitle) {
        buffs[activeTitle.buffType] = (buffs[activeTitle.buffType] || 1) * activeTitle.buffValue;
      }
    }

    return buffs;
  }, [userStats.inventory, userStats.activeBuffs, userStats.activeTitleId, titles]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setUserStats(prev => {
        if (!prev.activeBuffs || prev.activeBuffs.length === 0) return prev;
        const active = prev.activeBuffs.filter(b => b.endTime > now);
        if (active.length === prev.activeBuffs.length) return prev;
        return { ...prev, activeBuffs: active };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredTasks = useMemo(() => {
    const priorityOrder: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1, None: 0 };

    let allDisplayTasks = [...tasks];

    if (taskFilters.showDungeonTasks) {
      dungeons.forEach(dungeon => {
        dungeon.rooms.forEach(room => {
          if (!room.completed) {
            room.tasks.forEach(dt => {
              if (!dt.completed) {
                // Convert DungeonTask to Task for display
                const mappedTask: Task = {
                  ...dt,
                  id: `dt:${dungeon.id}:${room.id}:${dt.id}`,
                  priority: 'None',
                  completed: dt.completed,
                  name: `[${dungeon.name}] ${dt.name}`
                };
                allDisplayTasks.push(mappedTask);
              }
            });
          }
        });
      });
    }

    return allDisplayTasks.filter(task => {
      const matchSearch = (task.name || '').toLowerCase().includes(taskFilters.search.toLowerCase());
      const matchDifficulty = taskFilters.difficulty === 'All' || task.difficulty === taskFilters.difficulty;
      const matchPriority = taskFilters.priority === 'All' || (task.priority || 'None') === taskFilters.priority;
      const matchStatus = 
        taskFilters.status === 'All' || 
        (taskFilters.status === 'Active' && !task.completed) || 
        (taskFilters.status === 'Completed' && task.completed);
      
      return matchSearch && matchDifficulty && matchPriority && matchStatus;
    }).sort((a, b) => {
      // Sort by priority first
      const pA = priorityOrder[a.priority || 'None'] || 0;
      const pB = priorityOrder[b.priority || 'None'] || 0;
      if (pA !== pB) return pB - pA;
      // Then completion (incomplete first)
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return 0;
    });
  }, [tasks, taskFilters, dungeons]);

  // Actions
  const addNotification = (message: string, type: 'level' | 'achievement' | 'error') => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, message, type: type as any }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const checkAchievements = () => {
    const unlockedAchievements = userStats.unlockedAchievements || [];
    achievements.forEach(achievement => {
      if (unlockedAchievements.includes(achievement.id)) return;

      let unlocked = false;
      switch (achievement.requirementType) {
        case 'tasks':
          unlocked = userStats.totalTasksCompleted >= achievement.requirementValue;
          break;
        case 'xp':
          unlocked = userStats.xp >= achievement.requirementValue;
          break;
        case 'difficulty':
          unlocked = tasks.some(t => t.completed && (t.difficulty === 'Hard' || t.difficulty === 'Elite'));
          break;
        case 'shop':
          unlocked = userStats.shopUsageCount >= achievement.requirementValue;
          break;
        case 'deadline':
          unlocked = tasks.some(t => t.completed && t.dueDate && t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] <= t.dueDate);
          break;
      }

      if (unlocked) {
        setUserStats(prev => ({
          ...prev,
          unlockedAchievements: [...prev.unlockedAchievements, achievement.id],
          money: prev.money + (achievement.reward?.money || 0),
          xp: prev.xp + (achievement.reward?.xp || 0)
        }));
        addNotification(`Achievement Unlocked: ${achievement.name}!`, 'achievement');
      }
    });
  };

  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(7),
      completed: false
    };
    setTasks([...tasks, newTask]);
  };

  const completeTask = (id: string) => {
    let task: Task | undefined;
    let isDungeonTask = false;
    let dungeonId = '';
    let roomId = '';
    let dungeonTaskId = '';

    if (id.startsWith('dt:')) {
      isDungeonTask = true;
      const [, dId, rId, dtId] = id.split(':');
      dungeonId = dId;
      roomId = rId;
      dungeonTaskId = dtId;
      
      const dungeon = dungeons.find(d => d.id === dungeonId);
      const room = dungeon?.rooms.find(r => r.id === roomId);
      const dTask = room?.tasks.find(t => t.id === dungeonTaskId);
      
      if (dTask) {
        task = { 
          ...dTask, 
          priority: 'None', 
          completed: dTask.completed,
          name: dTask.name 
        } as Task;
      }
    } else {
      task = tasks.find(t => t.id === id);
    }

    if (!task || task.completed) return;

    const staminaCost = task.staminaCost || 0;
    if (staminaCost > 0 && userStats.stamina.current < staminaCost) {
      addNotification("Low Stamina! Rest to recover energy.", 'achievement');
      return;
    }

    const xpBuff = activeBuffs.xp || 1;
    const moneyBuff = activeBuffs.money || 1;

    const gainedXP = Math.round(task.xp * xpBuff);
    const gainedMoney = Math.round(task.money * moneyBuff);

    setUserStats(prev => {
      const newAreaXP = { ...prev.areaXP };
      const newAreaLastActivity = { ...prev.areaLastActivity };
      if (task?.areaXP) {
        Object.entries(task.areaXP).forEach(([area, amount]) => {
          const areaKey = area as TaskArea;
          const xpAmount = typeof amount === 'number' ? amount : 0;
          newAreaXP[areaKey] = (newAreaXP[areaKey] || 0) + Math.round(xpAmount * xpBuff);
          newAreaLastActivity[areaKey] = Date.now();
        });
      }

      return {
        ...prev,
        xp: prev.xp + gainedXP,
        money: prev.money + gainedMoney,
        totalTasksCompleted: (prev.totalTasksCompleted || 0) + 1,
        areaXP: newAreaXP,
        areaLastActivity: newAreaLastActivity,
        stamina: {
          ...prev.stamina,
          current: Math.min(prev.stamina.max, Math.max(0, prev.stamina.current - staminaCost))
        }
      };
    });

    if (isDungeonTask) {
      setDungeons(prevDungeons => {
        return prevDungeons.map(dungeon => {
          if (dungeon.id === dungeonId) {
            const newRooms = dungeon.rooms.map(room => {
              if (room.id === roomId) {
                const newTasks = room.tasks.map(dt => 
                  dt.id === dungeonTaskId ? { ...dt, completed: true, completedAt: Date.now() } : dt
                );
                
                // Check if all tasks in room are completed
                const allDone = newTasks.every(t => t.completed);
                if (allDone && !room.completed) {
                  // Give Room Rewards
                  if (room.reward) {
                    if (room.reward.gold) {
                      setUserStats(s => ({ ...s, money: s.money + (room.reward?.gold || 0) }));
                      addNotification(`Sala Limpa! Recompensa: ${room.reward.gold} Gold.`, 'achievement');
                    }
                    if (room.reward.itemId) {
                      const item = storeItems.find(i => i.id === room.reward?.itemId);
                      if (item) {
                        setUserStats(s => ({ ...s, inventory: [...s.inventory, item] }));
                        addNotification(`Sala Limpa! Item encontrado: ${item.name}.`, 'achievement');
                      }
                    }
                    if (room.reward.titleId) {
                      const title = titles.find(t => t.id === room.reward?.titleId);
                      if (title) {
                        const alreadyHas = userStats.unlockedTitles?.includes(title.id);
                        if (!alreadyHas) {
                          setUserStats(s => ({ 
                            ...s, 
                            unlockedTitles: [...(s.unlockedTitles || []), title.id] 
                          }));
                          addNotification(`Sala Limpa! Título desbloqueado: ${title.name}.`, 'achievement');
                        }
                      }
                    }
                  } else {
                    addNotification(`Sala "${room.name}" Limpa!`, 'achievement');
                  }
                }

                return { ...room, tasks: newTasks, completed: allDone };
              }
              return room;
            });

            const dungeonCompleted = newRooms.every(r => r.completed);
            if (dungeonCompleted && !dungeon.isCompleted) {
              addNotification(`DUNGEON CLEARED: ${dungeon.name}!`, 'achievement');
            }

            return { ...dungeon, rooms: newRooms, isCompleted: dungeonCompleted };
          }
          return dungeon;
        });
      });
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true, completedAt: Date.now() } : t));
    }
  };

  const consumeItem = (fullId: string) => {
    const parts = fullId.split('-');
    if (parts.length < 3) return;
    const realId = parts[1];
    const index = parseInt(parts[2]);

    const item = userStats.inventory[index];
    if (!item || item.id !== realId) return;

    if (item.itemType === 'consumable') {
      const newInventory = [...userStats.inventory];
      newInventory.splice(index, 1);

      if (item.duration) {
        const newBuff = {
          id: Math.random().toString(36).substring(7),
          itemId: item.id,
          name: item.name,
          buffType: item.buffType,
          buffValue: item.buffValue,
          endTime: Date.now() + (item.duration * 1000),
          iconName: item.iconName
        };

        setUserStats(prev => ({
          ...prev,
          inventory: newInventory,
          activeBuffs: [...(prev.activeBuffs || []), newBuff]
        }));
        addNotification(`${item.name} consumed! Buff activated.`, 'achievement');
      } else {
        setUserStats(prev => ({ ...prev, inventory: newInventory }));
        addNotification(`${item.name} used!`, 'achievement');
      }
    }
  };

  const restCharacter = () => {
    setUserStats(prev => ({
      ...prev,
      stamina: { ...prev.stamina, current: prev.stamina.max }
    }));
    addNotification("Character Rested! Energy restored.", 'achievement');
  };

  const buyItem = (item: StoreItem) => {
    if (userStats.money >= item.price) {
      setUserStats(prev => ({
        ...prev,
        money: prev.money - item.price,
        inventory: [...prev.inventory, item],
        shopUsageCount: (prev.shopUsageCount || 0) + 1
      }));
    }
  };

  const addStoreItem = (item: Omit<StoreItem, 'id'>) => {
    const newItem: StoreItem = {
      ...item,
      id: 'i-' + Math.random().toString(36).substring(7)
    };
    setStoreItems([...storeItems, newItem]);
  };

  const addAchievement = (achievement: Omit<Achievement, 'id'>) => {
    const newAchievement: Achievement = {
      ...achievement,
      id: 'a-' + Math.random().toString(36).substring(7)
    };
    setAchievements([...achievements, newAchievement]);
  };

  const handleExport = () => {
    const data = {
      tasks,
      storeItems,
      achievements,
      areas,
      userStats,
      language,
      titles,
      dungeons
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `questlog_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tasks) setTasks(data.tasks);
        if (data.storeItems) setStoreItems(data.storeItems);
        if (data.achievements) setAchievements(data.achievements);
        if (data.areas) setAreas(data.areas);
        if (data.userStats) setUserStats(data.userStats);
        if (data.language) setLanguage(data.language);
        if (data.titles) setTitles(data.titles);
        if (data.dungeons) setDungeons(data.dungeons);
        
        addNotification(t.notifications.importSuccess, 'achievement');
      } catch (err) {
        addNotification(t.notifications.importError, 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <nav className="w-20 md:w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col pt-8">
        <div className="px-6 mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 flex items-center justify-center rounded-xl shadow-lg shadow-indigo-600/20">
            <Sword className="text-white w-6 h-6" />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight text-white">QuestLog</span>
        </div>

        <div className="flex-1 px-4 space-y-2">
          <SidebarLink 
            icon={<ListTodo className="w-5 h-5" />} 
            label={t.tabs.questlog} 
            active={activeTab === 'questlog'} 
            onClick={() => setActiveTab('questlog')} 
          />
          <SidebarLink 
            icon={<CalendarIcon className="w-5 h-5" />} 
            label={t.tabs.calendar} 
            active={activeTab === 'calendar'} 
            onClick={() => setActiveTab('calendar')} 
          />
          <SidebarLink 
            icon={<Medal className="w-5 h-5" />} 
            label={t.tabs.titles} 
            active={activeTab === 'titles'} 
            onClick={() => setActiveTab('titles')} 
          />
          <SidebarLink 
            icon={<Package className="w-5 h-5" />} 
            label={t.tabs.inventory} 
            active={activeTab === 'inventory'} 
            onClick={() => setActiveTab('inventory')} 
          />
          <SidebarLink 
            icon={<Store className="w-5 h-5" />} 
            label={t.tabs.store} 
            active={activeTab === 'store'} 
            onClick={() => setActiveTab('store')} 
          />
          <SidebarLink 
            icon={<UserIcon className="w-5 h-5" />} 
            label={t.tabs.profile} 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
          <SidebarLink 
            icon={<Sword className="w-5 h-5" />} 
            label={t.tabs.dungeons} 
            active={activeTab === 'dungeons'} 
            onClick={() => setActiveTab('dungeons')} 
          />
          <div className="pt-8 pb-4">
            <div className="h-px bg-white/5 mx-2 mb-4" />
            <SidebarLink 
              icon={<Settings className="w-5 h-5" />} 
              label={t.tabs.manager} 
              active={activeTab === 'manager'} 
              onClick={() => setActiveTab('manager')} 
            />
          </div>
        </div>

        {/* User Mini Profile */}
        <div className="p-6 border-t border-white/10 bg-black/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center font-bold text-xs text-white">
              L{currentLevel}
            </div>
            <div className="hidden md:block truncate flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Adventurer</span>
                <span className="text-[10px] text-indigo-300">{Math.floor(levelInfo.currentXPInLevel)} / {levelInfo.nextLevelXP}</span>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full mt-1 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${currentXPPercent}%` }}
                  className="h-full bg-indigo-500" 
                />
              </div>
            </div>
          </div>

          <div className="hidden md:block space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
              <span className="text-rose-400 flex items-center gap-1">
                <Battery className="w-3 h-3" />
                Stamina
              </span>
              <span className="text-rose-300">{userStats.stamina.current} / {userStats.stamina.max}</span>
            </div>
            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                animate={{ width: `${(userStats.stamina.current / userStats.stamina.max) * 100}%` }}
                className={`h-full transition-colors ${userStats.stamina.current < 30 ? 'bg-rose-500' : 'bg-rose-400'} shadow-[0_0_8px_rgba(244,63,94,0.4)]`} 
              />
            </div>
            {userStats.stamina.current < 50 && (
              <button 
                onClick={restCharacter}
                className="w-full mt-2 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all"
              >
                Tirar um Cochilo (Rest)
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-amber-400 font-mono text-sm leading-none bg-black/40 p-2 rounded-lg border border-white/5">
            <Coins className="w-4 h-4" />
            <span>{userStats.money.toLocaleString()} Gold</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-transparent pb-20">
        <header className="sticky top-0 z-10 px-8 py-6 flex items-center justify-between bg-black/10 backdrop-blur-md border-b border-white/10">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold text-white capitalize leading-tight">
              {activeTab === 'questlog' && t.tabs.questlog}
              {activeTab === 'calendar' && t.tabs.calendar}
              {activeTab === 'titles' && t.tabs.titles}
              {activeTab === 'inventory' && t.tabs.inventory}
              {activeTab === 'store' && t.tabs.store}
              {activeTab === 'profile' && t.tabs.profile}
              {activeTab === 'dungeons' && t.tabs.dungeons}
              {activeTab === 'manager' && t.tabs.manager}
            </h2>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">{t.messages.welcome}</p>
          </div>
          <div className="flex items-center gap-4">
            {activeTab === 'questlog' && (
              <button 
                onClick={() => (document.getElementById('modal-add-task') as any)?.showModal()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                {t.actions.create}
              </button>
            )}
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer backdrop-blur-sm transition-colors">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'questlog' && (
              <motion.div 
                key="questlog"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard label="Total Quests" value={tasks.length} subValue={`${tasks.filter(t => !t.completed).length} Active`} icon={<LayoutDashboard />} color="amber" />
                  <StatCard label="Gold Accumulation" value={userStats.money} subValue="Current Balance" icon={<Coins />} color="emerald" />
                  <StatCard label="Experience Level" value={currentLevel} subValue={`${userStats.xp} total XP`} icon={<Trophy />} color="rose" />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{t.labels.searchQuest}</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder={t.labels.searchQuest}
                        value={taskFilters.search ?? ''} 
                        onChange={(e) => setTaskFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{t.labels.status}</label>
                    <select 
                      value={taskFilters.status ?? 'All'} 
                      onChange={(e) => setTaskFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white cursor-pointer hover:border-white/20 transition-all outline-none appearance-none font-bold"
                    >
                      <option value="All">{t.statusNames.all}</option>
                      <option value="Active">{t.statusNames.active}</option>
                      <option value="Completed">{t.statusNames.completed}</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{t.labels.rank}</label>
                    <select 
                      value={taskFilters.difficulty ?? 'All'} 
                      onChange={(e) => setTaskFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white cursor-pointer hover:border-white/20 transition-all outline-none appearance-none font-bold"
                    >
                      <option value="All">{t.statusNames.all}</option>
                      <option value="Easy">{t.rankNames.easy}</option>
                      <option value="Medium">{t.rankNames.medium}</option>
                      <option value="Hard">{t.rankNames.hard}</option>
                      <option value="Elite">{t.rankNames.elite}</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{t.labels.priority}</label>
                    <select 
                      value={taskFilters.priority ?? 'All'} 
                      onChange={(e) => setTaskFilters(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white cursor-pointer hover:border-white/20 transition-all outline-none appearance-none font-bold"
                    >
                      <option value="All">{t.statusNames.all}</option>
                      <option value="Urgent">{t.priorityNames.urgent}</option>
                      <option value="High">{t.priorityNames.high}</option>
                      <option value="Medium">{t.priorityNames.medium}</option>
                      <option value="Low">{t.priorityNames.low}</option>
                      <option value="None">{t.priorityNames.none}</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{t.labels.showDungeonTasks}</label>
                    <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-2 hover:border-white/20 transition-all cursor-pointer h-[38px]" onClick={() => setTaskFilters(prev => ({ ...prev, showDungeonTasks: !prev.showDungeonTasks }))}>
                       <input type="checkbox" checked={taskFilters.showDungeonTasks} onChange={() => {}} className="w-4 h-4 accent-indigo-500 pointer-events-none" />
                       <span className="text-[10px] font-bold text-white uppercase">{t.labels.showDungeonTasks}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <h3 className="font-bold text-lg text-white">{t.messages.searchResults} ({filteredTasks.length})</h3>
                    <div className="flex gap-2 text-xs text-slate-400">
                       Filtrado por: {taskFilters.status}, {taskFilters.difficulty}
                    </div>
                  </div>
                  <div className="divide-y divide-white/5">
                    {filteredTasks.map(task => (
                      <TaskRow key={task.id} task={task} t={t} onComplete={() => completeTask(task.id)} />
                    ))}
                    {filteredTasks.length === 0 && (
                      <div className="p-12 text-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>{t.messages.noQuestsFound} {t.messages.noQuestsDesc}</p>
                      </div>
                    )}
                  </div>
                </div>

                {taskFilters.status === 'Active' && tasks.filter(t => t.completed).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-white pt-4 uppercase text-xs tracking-widest">{t.messages.completedRecently}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tasks.filter(t => t.completed).slice(-4).reverse().map(task => (
                        <CompletedTaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'dungeons' && (
              <motion.div 
                key="dungeons"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {dungeons.map(dungeon => (
                    <DungeonCard 
                      key={dungeon.id} 
                      dungeon={dungeon} 
                      storeItems={storeItems}
                      titles={titles}
                      onProgressTask={(roomId, taskId) => completeTask(`dt:${dungeon.id}:${roomId}:${taskId}`)}
                    />
                  ))}
                  {dungeons.length === 0 && (
                    <div className="md:col-span-2 p-20 text-center border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                       <Sword className="w-16 h-16 mx-auto mb-6 text-slate-700 opacity-50" />
                       <h3 className="text-xl font-bold text-white mb-2">{t.messages.noDungeons}</h3>
                       <p className="text-slate-400">{t.messages.noDungeonsDesc}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div 
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CalendarView tasks={tasks} onCompleteTask={completeTask} />
              </motion.div>
            )}

            {activeTab === 'titles' && (
              <motion.div 
                key="titles"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <TitlesCursesView 
                  stats={userStats} 
                  achievements={achievements} 
                  titles={titles}
                  onSelectTitle={(id) => setUserStats(prev => ({ ...prev, activeTitleId: id }))}
                />
              </motion.div>
            )}

              {activeTab === 'inventory' && (
              <motion.div 
                key="inventory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <InventoryView stats={userStats} onConsume={consumeItem} />
              </motion.div>
            )}

            {activeTab === 'store' && (
              <motion.div 
                key="store"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white">Items & Relics</h3>
                    <p className="text-gray-500 text-sm">Enhance your abilities with divine artifacts.</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
                    <Coins className="text-amber-500 w-5 h-5" />
                    <span className="font-mono font-bold text-amber-500">{userStats.money.toLocaleString()} Gold</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {storeItems.map(item => (
                    <StoreItemCard key={item.id} item={item} onBuy={() => buyItem(item)} canAfford={userStats.money >= item.price} />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                <div className="lg:col-span-1 space-y-6">
                   <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center shadow-xl">
                      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 p-1 relative mb-6 shadow-lg shadow-indigo-500/20 group cursor-pointer overflow-hidden">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                          {userStats.avatarUrl ? (
                            <img src={userStats.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-full h-full text-white/80 p-4" />
                          )}
                        </div>
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                          <Camera className="w-8 h-8 mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{t.labels.changeAvatar}</span>
                          <input 
                            type="file" 
                            accept="image/png, image/jpeg" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const base64 = await fileToDataURL(file);
                                  setUserStats(prev => ({ ...prev, avatarUrl: base64 }));
                                  addNotification(t.notifications.avatarUpdated, 'achievement');
                                } catch (err) {
                                  addNotification('Error processing image.', 'error');
                                }
                              }
                            }}
                          />
                        </label>
                        <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white font-bold text-sm px-3 py-1 rounded-full border-4 border-slate-900 shadow-lg z-10">
                          LVL {currentLevel}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Mestre Herói</h3>
                      <p className="text-indigo-400 text-[10px] mb-6 uppercase tracking-[0.2em] font-bold">MASTER QUEST HUNTER</p>
                      
                      <div className="space-y-4 text-left">
                        <div>
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                             <span className="text-slate-400">Total Experience</span>
                             <span className="text-indigo-300">{userStats.xp} XP</span>
                          </div>
                          <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                             <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${currentXPPercent}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-white/5">
                           <span className="text-slate-400 text-xs font-semibold uppercase">Quests Cleared</span>
                           <span className="text-white font-mono font-bold">{tasks.filter(t => t.completed).length}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                           <span className="text-slate-400 text-xs font-semibold uppercase">Wealth Rank</span>
                           <span className="text-emerald-400 font-mono text-sm font-bold">Wealthy</span>
                        </div>
                      </div>
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-6 shadow-xl">
                      <h3 className="font-bold text-white uppercase text-sm tracking-widest bg-white/[0.02] -mx-6 -mt-6 p-4 border-b border-white/10">Áreas de Especialização</h3>
                      <div className="space-y-5">
                        {areas.map(area => (
                          <AreaProgress 
                            key={area.id}
                            label={area.name} 
                            xp={userStats.areaXP?.[area.id] || 0} 
                            icon={getIconByName(area.iconName)} 
                            color={area.color}
                            config={area.levelConfig}
                          />
                        ))}
                        {areas.length === 0 && (
                          <div className="py-8 text-center">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-slate-500 text-xs italic">Nenhuma especialização definida.</p>
                          </div>
                        )}
                      </div>
                    </div>
                </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-4 shadow-xl">
                      <h4 className="font-bold flex items-center gap-2 text-white uppercase text-xs tracking-widest">
                        <Zap className="w-4 h-4 text-indigo-500" />
                        {t.stats.activeBuffs}
                      </h4>
                      <div className="space-y-2">
                         {Object.entries(activeBuffs).map(([type, value]) => (
                           <div key={type} className="flex justify-between items-center text-sm p-3 bg-black/20 rounded-xl border border-white/5">
                             <span className="capitalize text-slate-300">{type} Boost</span>
                             <span className="text-emerald-400 font-bold">+{Math.round(((value as number) - 1) * 100)}%</span>
                           </div>
                         ))}
                         {Object.keys(activeBuffs).length === 0 && <p className="text-slate-500 text-xs italic text-center py-2">{t.stats.noBuffs}</p>}
                      </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                       <h3 className="font-bold text-white uppercase text-sm tracking-widest">{t.stats.inventory}</h3>
                    </div>
                    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {userStats.inventory.map((item, idx) => (
                        <div key={idx} className="aspect-square bg-black/40 rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center gap-2 text-center group relative cursor-help transition-all hover:bg-black/60">
                           <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-1 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                              <Package className="w-6 h-6" />
                           </div>
                           <span className="text-[10px] font-bold text-slate-100 uppercase truncate w-full tracking-tighter">{item.name}</span>
                           
                           {/* Tooltip */}
                           <div className="absolute inset-x-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none bg-slate-900 border border-white/10 p-3 rounded-xl flex flex-col justify-center items-center shadow-2xl z-20 translate-y-2 group-hover:translate-y-0">
                              <span className="text-[10px] text-indigo-400 font-bold mb-1 uppercase tracking-widest">{item.name}</span>
                              <span className="text-[10px] text-slate-300 leading-tight">{item.description}</span>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-white/10 border-8 border-transparent border-t-slate-900"></div>
                           </div>
                        </div>
                      ))}
                      {userStats.inventory.length === 0 && (
                        <div className="col-span-full py-16 text-center text-slate-600 font-medium">
                          Bolsos vazios. A jornada está apenas começando.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                      <h3 className="font-bold text-white uppercase text-xs tracking-widest leading-none">{t.stats.recentFeats}</h3>
                    </div>
                    <div className="p-6 space-y-4">
                       {tasks.filter(t => t.completed).slice(-5).reverse().map(task => (
                         <div key={task.id} className="flex items-center gap-4 text-sm bg-black/20 p-4 rounded-xl border border-white/5 hover:bg-black/40 transition-colors">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <div className="flex-1">
                               <p className="font-bold text-white tracking-tight">{task.name}</p>
                               <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{new Date(task.completedAt!).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-indigo-400 font-mono font-bold leading-none">+{task.xp} XP</p>
                               <p className="text-amber-400 font-mono text-[10px] font-bold mt-1">+$ {task.money}</p>
                            </div>
                         </div>
                       ))}
                       {tasks.filter(t => t.completed).length === 0 && <p className="text-center py-8 text-slate-600">Nenhuma tarefa concluída ainda.</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'manager' && (
              <motion.div 
                key="manager"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Sub-Navigation Menu */}
                <div className="flex flex-wrap gap-2 bg-black/20 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
                  {[
                    { id: 'areas', label: t.managerTabs.areas, icon: <LayoutDashboard className="w-3.5 h-3.5" />, desc: 'Gerencie áreas de foco e níveis de maestria.' },
                    { id: 'xp', label: t.managerTabs.xp, icon: <Zap className="w-3.5 h-3.5" />, desc: 'Configure curvas de XP e multiplicadores globais.' },
                    { id: 'store', label: t.managerTabs.store, icon: <Store className="w-3.5 h-3.5" />, desc: 'Adicione itens e bônus para a loja de recompensas.' },
                    { id: 'dungeons', label: t.managerTabs.dungeons, icon: <Sword className="w-3.5 h-3.5" />, desc: 'Crie grandes projetos divididos em etapas e recompensas.' },
                    { id: 'titles', label: t.managerTabs.titles, icon: <Crown className="w-3.5 h-3.5" />, desc: 'Crie e gerencie títulos lendários com bônus exclusivos.' },
                    { id: 'achievements', label: t.managerTabs.achievements, icon: <Trophy className="w-3.5 h-3.5" />, desc: 'Defina marcos lendários e desafios para o seu herói.' },
                    { id: 'tasks', label: t.managerTabs.tasks, icon: <Settings className="w-3.5 h-3.5" />, desc: 'Configurações técnicas e manutenção do sistema.' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setManagerSubTab(tab.id as any)}
                      className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all relative group/tab ${
                        managerSubTab === tab.id 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                      <div className="ml-1 opacity-40 hover:opacity-100 transition-opacity">
                        <HelpCircle className="w-3 h-3" />
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 p-3 bg-slate-900 border border-white/10 rounded-xl text-[9px] text-slate-300 font-medium normal-case tracking-normal shadow-2xl opacity-0 invisible group-hover/tab:opacity-100 group-hover/tab:visible transition-all pointer-events-none z-50 text-center">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 bg-slate-900 border-r border-b border-white/10 rotate-45" />
                        {tab.desc}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {managerSubTab === 'areas' && (
                      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-indigo-500/30 p-8 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <LayoutDashboard className="w-24 h-24 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3 relative z-10">
                       <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                       {editingArea ? t.actions.editDomain : t.actions.addDomain}
                    </h3>
                    <form className="space-y-4 relative z-10" onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const areaData: Partial<AreaDefinition> = {
                        name: formData.get('name') as string,
                        iconName: formData.get('iconName') as string,
                        color: formData.get('color') as any,
                        levelConfig: {
                          baseXP: parseInt(formData.get('baseXP') as string) || 500,
                          scalingType: formData.get('scalingType') as any,
                          scalingValue: parseFloat(formData.get('scalingValue') as string) || 0,
                          fixedIncrease: parseInt(formData.get('fixedIncrease') as string) || 0,
                          progressiveStep: parseInt(formData.get('progressiveStep') as string) || 0,
                        },
                        decayConfig: {
                          xpPerDay: parseInt(formData.get('decayXP') as string) || 0,
                          graceDays: parseInt(formData.get('decayGrace') as string) || 0
                        }
                      };

                      if (editingArea) {
                        setAreas(prev => prev.map(a => a.id === editingArea.id ? { ...a, ...areaData } as AreaDefinition : a));
                        setEditingArea(null);
                      } else {
                        const newId = (formData.get('name') as string).replace(/\s+/g, '') + '_' + Date.now();
                        const newArea: AreaDefinition = {
                          ...areaData,
                          id: newId
                        } as AreaDefinition;
                        setAreas(prev => [...prev, newArea]);
                      }
                      (e.target as any).reset();
                    }}>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {t.labels.areaName}
                            <InfoTooltip text="O nome da categoria ou especialização do seu herói." />
                          </label>
                          <input name="name" required defaultValue={editingArea?.name} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-medium" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.labels.icon}</label>
                          <select name="iconName" defaultValue={editingArea?.iconName || 'Star'} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white appearance-none cursor-pointer text-xs font-bold">
                            <option value="Heart">Heart</option>
                            <option value="Users">Users</option>
                            <option value="Moon">Moon</option>
                            <option value="Briefcase">Briefcase</option>
                            <option value="Coffee">Coffee</option>
                            <option value="Star">Star</option>
                            <option value="Zap">Zap</option>
                            <option value="Shield">Shield</option>
                            <option value="Sword">Sword</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.labels.color}</label>
                          <select name="color" defaultValue={editingArea?.color || 'indigo'} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white appearance-none cursor-pointer text-xs font-bold">
                            <option value="rose">Rose (Red)</option>
                            <option value="blue">Blue</option>
                            <option value="indigo">Indigo (Purple)</option>
                            <option value="amber">Amber (Yellow)</option>
                            <option value="emerald">Emerald (Green)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {t.labels.scalingType}
                            <InfoTooltip text="Como o XP necessário para o próximo nível aumenta. 'Percentage' é crescimento exponencial." />
                          </label>
                          <select name="scalingType" defaultValue={editingArea?.levelConfig.scalingType || 'fixed'} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white appearance-none cursor-pointer text-[10px] font-bold">
                            <option value="fixed">Fixed Add</option>
                            <option value="percentage">Growth %</option>
                            <option value="hybrid">Hybrid (% + Fixed)</option>
                            <option value="progressive">Progressive Step</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-2 pt-2">
                         <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">XP Progression Settings</label>
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
                            <div className="space-y-2">
                              <label className="text-[8px] font-bold text-slate-600 uppercase">Base XP</label>
                              <input name="baseXP" type="number" required defaultValue={editingArea?.levelConfig.baseXP || 500} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-white font-mono text-[10px]" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] font-bold text-slate-600 uppercase">Mult / Add</label>
                              <input name="scalingValue" type="number" step="0.01" required defaultValue={editingArea?.levelConfig.scalingValue || 0} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-white font-mono text-[10px]" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] font-bold text-slate-600 uppercase">Fixed (H)</label>
                              <input name="fixedIncrease" type="number" defaultValue={editingArea?.levelConfig.fixedIncrease || 0} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-white font-mono text-[10px]" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] font-bold text-slate-600 uppercase">Prog. Step</label>
                              <input name="progressiveStep" type="number" defaultValue={editingArea?.levelConfig.progressiveStep || 0} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-white font-mono text-[10px]" />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-2 pt-2">
                         <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                           Inactivity Decay (Degrade XP)
                           <InfoTooltip text="Se você ficar inativo por muito tempo, sua maestria nesta área diminuirá gradualmente." />
                         </label>
                         <div className="grid grid-cols-2 gap-4 bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                            <div className="space-y-2">
                              <label className="text-[8px] font-bold text-slate-600 uppercase">XP Loss Per Day</label>
                              <input name="decayXP" type="number" defaultValue={editingArea?.decayConfig?.xpPerDay || 0} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-white font-mono text-[10px]" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] font-bold text-slate-600 uppercase">Grace Days (No Decay)</label>
                              <input name="decayGrace" type="number" defaultValue={editingArea?.decayConfig?.graceDays || 0} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-white font-mono text-[10px]" />
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button type="submit" className="flex-1 py-3 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/40 text-indigo-100 rounded-xl font-bold transition-all uppercase tracking-widest text-[10px]">
                          {editingArea ? t.actions.save : t.actions.create}
                        </button>
                        {editingArea && (
                          <button type="button" onClick={() => setEditingArea(null)} className="py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold transition-all uppercase tracking-widest text-[10px]">
                            {t.actions.discard}
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                {managerSubTab === 'xp' && (
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                       <Zap className="w-5 h-5 text-indigo-500" />
                       {t.labels.editProfile}
                    </h3>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      <div className="bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">{t.stats.level}</p>
                        <input 
                          type="number" 
                          value={userStats.level ?? 1} 
                          onChange={(e) => {
                            const newLevel = parseInt(e.target.value) || 1;
                            const config = userStats.levelConfig || { baseXP: 1000, scalingType: 'fixed', scalingValue: 0 };
                            // Calculate XP required for this level
                            let targetXP = 0;
                            for (let i = 1; i < newLevel; i++) {
                              targetXP += calculateLevelInfo(targetXP, config).nextLevelXP;
                            }
                            setUserStats(prev => ({ ...prev, level: newLevel, xp: targetXP }));
                          }}
                          className="bg-transparent border-b border-white/10 w-full text-2xl font-bold font-mono focus:border-indigo-500 outline-none text-indigo-400"
                        />
                      </div>
                      <div className="bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">{t.labels.currentXP}</p>
                        <input 
                          type="number" 
                          value={userStats.xp ?? 0} 
                          onChange={(e) => setUserStats(prev => ({ ...prev, xp: parseInt(e.target.value) || 0 }))}
                          className="bg-transparent border-b border-white/10 w-full text-2xl font-bold font-mono focus:border-indigo-500 outline-none text-white"
                        />
                      </div>
                      <div className="bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">{t.stats.money}</p>
                        <input 
                          type="number" 
                          value={userStats.money ?? 0} 
                          onChange={(e) => setUserStats(prev => ({ ...prev, money: parseInt(e.target.value) || 0 }))}
                          className="bg-transparent border-b border-white/10 w-full text-2xl font-bold font-mono focus:border-emerald-500 outline-none text-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-10">
                      <div className="bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner relative group">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">{t.stats.stamina} ({t.labels.active})</p>
                        <div className="flex items-center gap-4">
                          <input 
                            type="number" 
                            value={userStats.stamina?.current ?? 0} 
                            onChange={(e) => setUserStats(prev => ({ ...prev, stamina: { ...prev.stamina, current: parseInt(e.target.value) || 0 } }))}
                            className="bg-transparent border-b border-white/10 w-full text-2xl font-bold font-mono focus:border-amber-500 outline-none text-amber-500"
                          />
                          <button 
                            onClick={() => setUserStats(prev => ({ ...prev, stamina: { ...prev.stamina, current: prev.stamina.max } }))} 
                            className="shrink-0 p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-all opacity-0 group-hover:opacity-100"
                            title={t.actions.refill}
                          >
                            <Zap className="w-5 h-5 fill-current" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">{t.labels.maxStamina}</p>
                        <input 
                          type="number" 
                          value={userStats.stamina?.max ?? 100} 
                          onChange={(e) => setUserStats(prev => ({ ...prev, stamina: { ...prev.stamina, max: parseInt(e.target.value) || 100 } }))}
                          className="bg-transparent border-b border-white/10 w-full text-2xl font-bold font-mono focus:border-indigo-500 outline-none text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em]">{t.labels.levelScale}</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            Base XP (Level 1)
                            <InfoTooltip text="XP total necessária para atingir o Nível 2 a partir do 1." />
                          </label>
                          <input 
                            type="number" 
                            value={userStats.levelConfig?.baseXP || 1000} 
                            onChange={(e) => setUserStats(prev => ({ 
                              ...prev, 
                              levelConfig: { ...(prev.levelConfig || { scalingType: 'fixed', scalingValue: 0 } as any), baseXP: parseInt(e.target.value) || 100 } 
                            }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition-all font-mono text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Scaling Type</label>
                              <select 
                                value={userStats.levelConfig?.scalingType || 'fixed'}
                                onChange={(e) => setUserStats(prev => ({ 
                                  ...prev, 
                                  levelConfig: { ...(prev.levelConfig || { baseXP: 1000, scalingValue: 0 } as any), scalingType: e.target.value as any } 
                                }))}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white appearance-none cursor-pointer text-xs font-bold"
                              >
                                <option value="fixed">Linear (+ fixed XP)</option>
                                <option value="percentage">Exponential (growth %)</option>
                                <option value="hybrid">Hybrid (% + Fixed)</option>
                                <option value="progressive">Progressive Step</option>
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                Base Scaling / Mult
                              </label>
                              <input 
                                type="number" 
                                step="0.01"
                                value={userStats.levelConfig?.scalingValue || 0} 
                                onChange={(e) => setUserStats(prev => ({ 
                                  ...prev, 
                                  levelConfig: { ...(prev.levelConfig || { baseXP: 1000, scalingType: 'fixed' } as any), scalingValue: parseFloat(e.target.value) || 0 } 
                                }))}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition-all font-mono text-sm"
                                placeholder="1.1 or 100"
                              />
                           </div>
                        </div>

                        {(userStats.levelConfig?.scalingType === 'hybrid' || userStats.levelConfig?.scalingType === 'progressive') && (
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Fixed Add (Hybrid)</label>
                                <input 
                                  type="number" 
                                  value={userStats.levelConfig?.fixedIncrease || 0} 
                                  onChange={(e) => setUserStats(prev => ({ 
                                    ...prev, 
                                    levelConfig: { ...(prev.levelConfig || { baseXP: 1000, scalingType: 'hybrid' } as any), fixedIncrease: parseInt(e.target.value) || 0 } 
                                  }))}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition-all font-mono text-sm"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Prog. Step (Prog.)</label>
                                <input 
                                  type="number" 
                                  value={userStats.levelConfig?.progressiveStep || 0} 
                                  onChange={(e) => setUserStats(prev => ({ 
                                    ...prev, 
                                    levelConfig: { ...(prev.levelConfig || { baseXP: 1000, scalingType: 'progressive' } as any), progressiveStep: parseInt(e.target.value) || 0 } 
                                  }))}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition-all font-mono text-sm"
                                />
                             </div>
                          </div>
                        )}
                        <p className="text-[9px] text-slate-500 italic">
                          {userStats.levelConfig?.scalingType === 'fixed' 
                            ? `Level 1 requires ${userStats.levelConfig.baseXP} XP. Each level adds ${userStats.levelConfig.scalingValue} XP to the requirement.`
                            : `Level 1 requires ${userStats.levelConfig?.baseXP} XP. Each level requirement grows by ${Math.round(((userStats.levelConfig?.scalingValue || 1) - 1) * 100)}%.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {managerSubTab === 'store' && (
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                       <Shield className="w-5 h-5 text-indigo-500" />
                       {editingItem ? 'Edit Ancient Relic' : 'Black Market Forge'}
                    </h3>
                    <form className="space-y-4" onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const itemData = {
                        name: formData.get('name') as string,
                        description: formData.get('description') as string,
                        price: parseInt(formData.get('price') as string),
                        iconName: formData.get('iconName') as string || 'Package',
                        imageUrl: formData.get('imageUrl') as string || undefined,
                        buffType: formData.get('buffType') as any,
                        buffValue: parseFloat(formData.get('buffValue') as string),
                        itemType: formData.get('itemType') as any,
                        duration: parseInt(formData.get('duration') as string) || 0,
                        category: 'Equipment'
                      };

                      if (editingItem) {
                        setStoreItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...itemData } : i));
                        setEditingItem(null);
                      } else {
                        addStoreItem(itemData);
                      }
                      (e.target as any).reset();
                    }}>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Item Name</label>
                        <input name="name" required defaultValue={editingItem?.name} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-700" placeholder="e.g. Damascus Blade" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Description</label>
                        <textarea name="description" required defaultValue={editingItem?.description} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all h-24 resize-none font-medium placeholder:text-slate-700" placeholder="What does this item do..." />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Item Image (Icon)</label>
                        <div className="flex gap-4">
                          <div className="w-20 h-20 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                            {editingItem?.imageUrl || (document.getElementById('forge-image-input') as HTMLInputElement)?.value ? (
                              <img 
                                src={editingItem?.imageUrl || (document.getElementById('forge-image-input') as HTMLInputElement)?.value} 
                                id="forge-image-preview" 
                                alt="Preview" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <Package className="w-8 h-8 text-slate-700" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <input 
                              id="forge-image-input" 
                              name="imageUrl" 
                              defaultValue={editingItem?.imageUrl} 
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-700 text-xs" 
                              placeholder="https://... ou faça upload" 
                              onChange={(e) => {
                                const preview = document.getElementById('forge-image-preview') as HTMLImageElement;
                                if (preview) preview.src = e.target.value;
                              }}
                            />
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400 text-[10px] font-bold uppercase cursor-pointer hover:bg-indigo-500/20 transition-all">
                              <Upload className="w-3.5 h-3.5" />
                              Upload PNG
                              <input 
                                type="file" 
                                accept="image/png, image/jpeg" 
                                className="hidden" 
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const base64 = await fileToDataURL(file);
                                    const input = document.getElementById('forge-image-input') as HTMLInputElement;
                                    const preview = document.getElementById('forge-image-preview') as HTMLImageElement;
                                    if (input) input.value = base64;
                                    if (preview) preview.src = base64;
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Price (Gold)</label>
                          <input name="price" type="number" required defaultValue={editingItem?.price} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                            Buff Type
                            <InfoTooltip text="Qual status heróico este item melhora permanentemente (ou temporariamente se consumível)." />
                          </label>
                          <select name="buffType" defaultValue={editingItem?.buffType} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500/50 cursor-pointer font-medium">
                            <option value="xp">XP Multiplier</option>
                            <option value="money">Gold Multiplier</option>
                            <option value="stamina">Stamina Multiplier</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                            Item Type
                            <InfoTooltip text="'Permanent' aplica o bônus enquanto estiver no inventário. 'Consumable' deve ser usado e tem duração limitada." />
                          </label>
                          <select name="itemType" defaultValue={editingItem?.itemType || 'permanent'} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500/50 cursor-pointer font-medium">
                            <option value="permanent">Permanent (Relic)</option>
                            <option value="consumable">Consumable (Potion/Scroll)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                            Duration (Seconds)
                            <InfoTooltip text="Apenas para itens consumíveis. Tempo que o buff permanecerá ativo." />
                          </label>
                          <input name="duration" type="number" defaultValue={editingItem?.duration || 3600} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono" placeholder="3600" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Buff Value (e.g. 1.2 for 20%)</label>
                        <input name="buffValue" type="number" step="0.01" required defaultValue={editingItem?.buffValue} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono" placeholder="1.2" />
                      </div>
                      <div className="flex gap-4">
                        <button type="submit" className="flex-1 py-4 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/40 text-indigo-100 rounded-xl font-bold transition-all mt-4 hover:border-indigo-500/60 shadow-lg active:scale-95 uppercase tracking-widest text-xs">
                          {editingItem ? 'Save Changes' : 'Sanctify & Add to Store'}
                        </button>
                        {editingItem && (
                          <button type="button" onClick={() => setEditingItem(null)} className="py-4 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold transition-all mt-4 uppercase tracking-widest text-xs">
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                    
                    <div className="mt-12 space-y-6 pt-12 border-t border-white/5">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        Banir Relíquias (Remover do Mercado)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {storeItems.map(item => (
                          <div key={item.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center overflow-hidden border border-white/5">
                                 {item.imageUrl ? (
                                   <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                 ) : (
                                   <Package className="w-5 h-5 text-indigo-400" />
                                 )}
                               </div>
                               <div>
                                 <p className="text-sm font-bold text-white uppercase leading-none">{item.name}</p>
                                 <p className="text-[10px] text-slate-500 mt-1">{item.price} Gold • {item.buffType.toUpperCase()}</p>
                               </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => setEditingItem(item)}
                                className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-all"
                                title="Editar"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm(`Tem certeza que deseja banir o item "${item.name}"?`)) {
                                    setStoreItems(prev => prev.filter(i => i.id !== item.id));
                                    addNotification(`${item.name} foi banido do mercado.`, 'achievement');
                                  }
                                }}
                                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all"
                                title="Banir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {managerSubTab === 'dungeons' && (
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                       <Sword className="w-5 h-5 text-indigo-500" />
                       {editingDungeon ? 'Edit Expedition Plan' : 'Dungeon Architect'}
                       <InfoTooltip text="Crie projetos massivos divididos em 'Salas'. Cada sala contém tarefas e recompensas únicas." />
                    </h3>
                    <form className="space-y-6" onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      
                      const dungeonData = {
                        name: formData.get('name') as string,
                        description: formData.get('description') as string,
                        iconName: formData.get('iconName') as string || 'Sword',
                        showInQuestLog: formData.get('showInQuestLog') === 'on',
                        rooms: editingDungeon ? editingDungeon.rooms : [
                          {
                            id: Math.random().toString(36).substring(7),
                            name: 'Sala de Entrada',
                            description: 'O início da jornada.',
                            tasks: [],
                            completed: false,
                            reward: { gold: 100 }
                          }
                        ],
                        isCompleted: editingDungeon ? editingDungeon.isCompleted : false
                      };

                      if (editingDungeon) {
                        setDungeons(prev => prev.map(d => d.id === editingDungeon.id ? { ...d, ...dungeonData } : d));
                        setEditingDungeon(null);
                      } else {
                        const newDungeon: Dungeon = {
                          ...dungeonData,
                          id: Math.random().toString(36).substring(7)
                        };
                        setDungeons([...dungeons, newDungeon]);
                      }
                      (e.target as any).reset();
                    }}>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Dungeon Title</label>
                        <input name="name" required defaultValue={editingDungeon?.name} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-medium" placeholder="Ex: Projeto Monolito" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Expedition Scope</label>
                        <textarea name="description" required defaultValue={editingDungeon?.description} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 h-20 resize-none font-medium" placeholder="Descrição do projeto..." />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Icon</label>
                          <select name="iconName" defaultValue={editingDungeon?.iconName} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer font-medium text-xs">
                             <option value="Sword">Sword (Combat)</option>
                             <option value="Shield">Shield (Protection)</option>
                             <option value="Crown">Crown (Glory)</option>
                             <option value="Zap">Zap (Energy)</option>
                             <option value="Package">Package (Collection)</option>
                             <option value="Star">Star (Special)</option>
                          </select>
                        </div>
                        <div className="flex items-end pb-1 px-4 mb-1">
                           <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3 w-full">
                              <input name="showInQuestLog" type="checkbox" defaultChecked={editingDungeon?.showInQuestLog} className="w-4 h-4 accent-indigo-500" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Visible in Log</span>
                           </div>
                        </div>
                      </div>

                      {editingDungeon && (
                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Room Matrix</h4>
                            <button 
                              type="button"
                              onClick={() => {
                                const newRoom: DungeonRoom = {
                                  id: Math.random().toString(36).substring(7),
                                  name: 'Nova Sala',
                                  description: 'Descrições da sala...',
                                  tasks: [],
                                  completed: false,
                                  reward: { gold: 50 }
                                };
                                setDungeons(prev => prev.map(d => d.id === editingDungeon.id ? { ...d, rooms: [...d.rooms, newRoom] } : d));
                                setEditingDungeon(prev => prev ? { ...prev, rooms: [...prev.rooms, newRoom] } : null);
                              }}
                              className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors"
                            >
                              + Add Room
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {editingDungeon.rooms.map((room, rIdx) => (
                              <div key={room.id} className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-bold text-slate-600 uppercase">Room Name</label>
                                    <input 
                                      value={room.name || ''} 
                                      onChange={(e) => {
                                        const newRooms = [...editingDungeon.rooms];
                                        newRooms[rIdx] = { ...room, name: e.target.value };
                                        setEditingDungeon({ ...editingDungeon, rooms: newRooms });
                                      }}
                                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-bold" 
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-bold text-slate-600 uppercase">
                                      Title Reward (Select ID)
                                      <InfoTooltip text="Escolha um título lendário que o herói desbloqueará ao dominar esta sala." />
                                    </label>
                                    <select 
                                      value={room.reward?.titleId || ''} 
                                      onChange={(e) => {
                                        const newRooms = [...editingDungeon.rooms];
                                        newRooms[rIdx] = { ...room, reward: { ...room.reward, titleId: e.target.value } };
                                        setEditingDungeon({ ...editingDungeon, rooms: newRooms });
                                      }}
                                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[9px] font-bold"
                                    >
                                      <option value="">Nenhum Título</option>
                                      {titles.map(title => <option key={title.id} value={title.id}>{title.name}</option>)}
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-bold text-slate-600 uppercase text-amber-500">Gold Reward</label>
                                    <input 
                                      type="number"
                                      value={room.reward?.gold || 0} 
                                      onChange={(e) => {
                                        const newRooms = [...editingDungeon.rooms];
                                        newRooms[rIdx] = { ...room, reward: { ...room.reward, gold: parseInt(e.target.value) || 0 } };
                                        setEditingDungeon({ ...editingDungeon, rooms: newRooms });
                                      }}
                                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-mono" 
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-bold text-slate-600 uppercase">
                                      Item Reward (Select ID)
                                      <InfoTooltip text="Selecione um item (relic ou consumível) da loja para ser entregue como espólio de guerra." />
                                    </label>
                                    <select 
                                      value={room.reward?.itemId || ''} 
                                      onChange={(e) => {
                                        const newRooms = [...editingDungeon.rooms];
                                        newRooms[rIdx] = { ...room, reward: { ...room.reward, itemId: e.target.value } };
                                        setEditingDungeon({ ...editingDungeon, rooms: newRooms });
                                      }}
                                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[9px] font-bold"
                                    >
                                      <option value="">Nenhum Item</option>
                                      {storeItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                                    </select>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <label className="text-[8px] font-bold text-slate-500 uppercase">Room Tasks</label>
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        const newTask: DungeonTask = { id: Math.random().toString(36).substring(7), name: 'Nova Tarefa', difficulty: 'Easy', completed: false, xp: 50, money: 50 };
                                        const newRooms = [...editingDungeon.rooms];
                                        newRooms[rIdx] = { ...room, tasks: [...room.tasks, newTask] };
                                        setEditingDungeon({ ...editingDungeon, rooms: newRooms });
                                      }}
                                      className="text-[8px] text-indigo-400 hover:text-indigo-300 uppercase font-bold"
                                    >
                                      + Add Task
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 gap-2">
                                    {room.tasks.map((task, tIdx) => (
                                      <div key={task.id} className="flex gap-2 items-center bg-black/40 p-2 rounded-lg border border-white/5">
                                        <input 
                                          value={task.name || ''} 
                                          onChange={(e) => {
                                            const newTasks = [...room.tasks];
                                            newTasks[tIdx] = { ...task, name: e.target.value };
                                            const newRooms = [...editingDungeon.rooms];
                                            newRooms[rIdx] = { ...room, tasks: newTasks };
                                            setEditingDungeon({ ...editingDungeon, rooms: newRooms });
                                          }}
                                          className="flex-1 bg-transparent border-b border-white/10 text-[10px] text-white focus:outline-none" 
                                        />
                                        <input 
                                          type="number"
                                          value={task.xp ?? 0} 
                                          onChange={(e) => {
                                            const newTasks = [...room.tasks];
                                            newTasks[tIdx] = { ...task, xp: parseInt(e.target.value) || 0 };
                                            const newRooms = [...editingDungeon.rooms];
                                            newRooms[rIdx] = { ...room, tasks: newTasks };
                                            setEditingDungeon({ ...editingDungeon, rooms: newRooms });
                                          }}
                                          className="w-12 bg-transparent border-b border-white/10 text-[10px] text-indigo-400 text-center focus:outline-none" 
                                        />
                                        <button 
                                          type="button" 
                                          onClick={() => {
                                            const newTasks = room.tasks.filter((_, i) => i !== tIdx);
                                            const newRooms = [...editingDungeon.rooms];
                                            newRooms[rIdx] = { ...room, tasks: newTasks };
                                            setEditingDungeon({ ...editingDungeon, rooms: newRooms });
                                          }}
                                          className="text-rose-500 hover:text-rose-400 p-1"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <button 
                                  type="button"
                                  onClick={() => {
                                    const newRooms = editingDungeon.rooms.filter((_, i) => i !== rIdx);
                                    setEditingDungeon({ ...editingDungeon, rooms: newRooms });
                                  }}
                                  className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[8px] font-bold uppercase rounded-lg border border-rose-500/10 transition-all"
                                >
                                  Remove Room
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4">
                        <button type="submit" className="flex-1 py-4 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/40 text-indigo-100 rounded-xl font-bold transition-all mt-4 hover:border-indigo-500/60 shadow-lg active:scale-95 uppercase tracking-widest text-xs">
                          {editingDungeon ? 'Confirm Mutations' : 'Manifest Dungeon'}
                        </button>
                        {editingDungeon && (
                          <button type="button" onClick={() => setEditingDungeon(null)} className="py-4 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold transition-all mt-4 uppercase tracking-widest text-xs">
                            Abort
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                {managerSubTab === 'titles' && (
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                       <Crown className="w-5 h-5 text-indigo-500" />
                       Forge de Títulos
                       <InfoTooltip text="Crie títulos que podem ser equipados para ganhar bônus permanentes (enquanto equipados)." />
                    </h3>
                    <form className="space-y-4" onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const titleData: Title = {
                        id: Math.random().toString(36).substring(7),
                        name: formData.get('name') as string,
                        description: formData.get('description') as string,
                        buffType: formData.get('buffType') as any,
                        buffValue: parseFloat(formData.get('buffValue') as string),
                        iconName: formData.get('iconName') as string || 'Crown'
                      };

                      setTitles([...titles, titleData]);
                      (e.target as any).reset();
                    }}>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Nome do Título</label>
                        <input name="name" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-medium" placeholder="Ex: Matador de Dragões" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Epopéia (Descrição)</label>
                        <textarea name="description" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 h-20 resize-none font-medium" placeholder="A história por trás deste título..." />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Tipo de Bônus</label>
                          <select name="buffType" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer font-medium text-xs">
                            <option value="xp">XP Bonus (Multiplicador)</option>
                            <option value="money">Gold Bonus (Multiplicador)</option>
                            <option value="stamina">Stamina Regen (Mult)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Valor (ex: 1.1 = +10%)</label>
                          <input name="buffValue" type="number" step="0.01" required defaultValue="1.1" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all font-mono" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Símbolo (Icon)</label>
                        <select name="iconName" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer font-medium text-xs">
                           <option value="Crown">Crown (Realeza)</option>
                           <option value="Sword">Sword (Guerreiro)</option>
                           <option value="Shield">Shield (Tanque)</option>
                           <option value="Zap">Zap (Rápido)</option>
                           <option value="Star">Star (Místico)</option>
                           <option value="Heart">Heart (Vitalidade)</option>
                           <option value="Skull">Skull (Sinistro)</option>
                        </select>
                      </div>

                      <button type="submit" className="w-full py-4 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/40 text-indigo-100 rounded-xl font-bold transition-all mt-4 uppercase tracking-widest text-xs">
                        Forge Título
                      </button>
                    </form>
                  </div>
                )}

                {managerSubTab === 'achievements' && (
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                       <Trophy className="w-5 h-5 text-indigo-500" />
                       {editingAchievement ? 'Edit Legends & Mythos' : 'Achievement Forge'}
                    </h3>
                    <form className="space-y-4" onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const achData = {
                        name: formData.get('name') as string,
                        description: formData.get('description') as string,
                        iconName: formData.get('iconName') as string || 'Trophy',
                        requirementType: formData.get('requirementType') as any,
                        requirementValue: parseInt(formData.get('requirementValue') as string),
                        type: formData.get('type') as any,
                        reward: {
                          money: parseInt(formData.get('moneyReward') as string) || 0,
                          xp: parseInt(formData.get('xpReward') as string) || 0
                        }
                      };

                      if (editingAchievement) {
                        setAchievements(prev => prev.map(a => a.id === editingAchievement.id ? { ...a, ...achData } : a));
                        setEditingAchievement(null);
                      } else {
                        addAchievement(achData);
                      }
                      (e.target as any).reset();
                    }}>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Achievement Name</label>
                        <input name="name" required defaultValue={editingAchievement?.name} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-700" placeholder="e.g. Slayer of Worlds" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Requirement Context</label>
                        <textarea name="description" required defaultValue={editingAchievement?.description} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all h-20 resize-none font-medium placeholder:text-slate-700" placeholder="How do they unlock this?" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Req. Type</label>
                          <select name="requirementType" defaultValue={editingAchievement?.requirementType} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500/50 cursor-pointer font-medium text-xs">
                            <option value="tasks">Tasks Completed</option>
                            <option value="xp">Total XP</option>
                            <option value="difficulty">Elite Mission</option>
                            <option value="shop">Market Purchases</option>
                            <option value="deadline">Speed Mastery</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Value</label>
                          <input name="requirementValue" type="number" required defaultValue={editingAchievement?.requirementValue} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Category</label>
                            <select name="type" defaultValue={editingAchievement?.type} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500/50 cursor-pointer font-medium text-xs">
                                <option value="feat">Feat of Strength</option>
                                <option value="title">Honorable Title</option>
                                <option value="curse">Destined Curse</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Icon Alias</label>
                            <select name="iconName" defaultValue={editingAchievement?.iconName} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500/50 cursor-pointer font-medium text-xs">
                                <option value="Trophy">Trophy</option>
                                <option value="Medal">Medal</option>
                                <option value="Crown">Crown</option>
                                <option value="Sword">Sword</option>
                                <option value="Shield">Shield</option>
                                <option value="Clock">Clock</option>
                            </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Reward Gold</label>
                          <input name="moneyReward" type="number" defaultValue={editingAchievement?.reward?.money} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Reward XP</label>
                          <input name="xpReward" type="number" defaultValue={editingAchievement?.reward?.xp} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono" />
                        </div>
                      </div>

                      <div className="flex gap-4">
                          <button type="submit" className="flex-1 py-4 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/40 text-indigo-100 rounded-xl font-bold transition-all mt-4 hover:border-indigo-500/60 shadow-lg active:scale-95 uppercase tracking-widest text-xs">
                          {editingAchievement ? t.actions.edit : t.actions.create}
                        </button>
                        {editingAchievement && (
                          <button type="button" onClick={() => setEditingAchievement(null)} className="py-4 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold transition-all mt-4 uppercase tracking-widest text-xs">
                            {t.actions.discard}
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {managerSubTab === 'dungeons' && (
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl overflow-hidden">
                    <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
                      <Sword className="w-4 h-4 text-indigo-400" />
                      {t.labels.expeditionLogs}
                    </h3>
                      <div className="space-y-3">
                         {dungeons.map(dungeon => (
                           <div key={dungeon.id} className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all text-indigo-400 bg-indigo-500/10 border-indigo-500/20`}>
                                 <Sword className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                 <p className="font-bold text-white text-xs">{dungeon.name}</p>
                                 <p className="text-[9px] text-slate-500 uppercase font-mono">{dungeon.rooms.length} {t.labels.rooms} • {dungeon.isCompleted ? t.labels.cleared : t.labels.active}</p>
                              </div>
                              <div className="text-right shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                    onClick={() => setEditingDungeon(dungeon)} 
                                    className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/20 transition-all"
                                    title={t.actions.edit}
                                 >
                                    <Settings className="w-4 h-4" />
                                 </button>
                                 <button 
                                    onClick={() => {
                                      if(confirm(`${t.actions.delete} "${dungeon.name}"?`)) {
                                        setDungeons(prev => prev.filter(d => d.id !== dungeon.id));
                                      }
                                    }} 
                                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg border border-rose-500/20 transition-all"
                                    title={t.actions.delete}
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                         ))}
                         {dungeons.length === 0 && <p className="text-center py-4 text-slate-500 text-xs italic">{t.labels.noDungeonsRegistered}</p>}
                      </div>
                    </div>
                  )}

                  {managerSubTab === 'areas' && (
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl overflow-hidden border-indigo-500/10">
                      <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                        {t.labels.domainList}
                      </h3>
                      <div className="space-y-3">
                         {areas.map(area => (
                           <div key={area.id} className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all text-indigo-400 bg-indigo-500/10 border-indigo-500/20`}>
                                 {getIconByName(area.iconName)}
                              </div>
                              <div className="flex-1">
                                 <p className="font-bold text-white text-xs">{area.name}</p>
                                 <p className="text-[9px] text-slate-500 uppercase font-mono">ID: {area.id.split('_')[0]}</p>
                              </div>
                              <div className="text-right shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                    onClick={() => setEditingArea(area)} 
                                    className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/20 transition-all"
                                    title="Edit Domain"
                                 >
                                    <Settings className="w-4 h-4" />
                                 </button>
                                 <button 
                                    onClick={() => {
                                      if(confirm(`Eradicate specialization "${area.name}"? This will not delete XP associated with the ID but will remove it from UI.`)) {
                                        setAreas(prev => prev.filter(a => a.id !== area.id));
                                      }
                                    }} 
                                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg border border-rose-500/20 transition-all"
                                    title="Remove Domain"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                         ))}
                         {areas.length === 0 && <p className="text-center py-4 text-slate-500 text-xs italic">No domains established yet.</p>}
                      </div>
                    </div>
                  )}

                  {managerSubTab === 'store' && (
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl overflow-hidden">
                      <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">{t.labels.stockInventory}</h3>
                      <div className="space-y-3">
                         {storeItems.map(item => (
                           <div key={item.id} className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                              <div className="w-12 h-12 bg-indigo-500/5 rounded-lg flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform overflow-hidden">
                                 {item.imageUrl ? (
                                   <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                 ) : (
                                   <Package className="w-6 h-6" />
                                 )}
                              </div>
                              <div className="flex-1">
                                 <p className="font-bold text-white text-sm">{item.name}</p>
                                 <p className="text-[10px] text-slate-500 truncate max-w-[150px] uppercase font-bold tracking-tight">{item.description}</p>
                              </div>
                              <div className="text-right shrink-0 flex items-center gap-2">
                                 <p className="text-amber-400 font-mono text-xs font-bold leading-none bg-amber-500/5 px-2 py-1.5 rounded-md border border-amber-500/10">$ {item.price}</p>
                                 <div className="flex items-center">
                                   <button 
                                      onClick={() => setEditingItem(item)} 
                                      className="text-indigo-400 p-2 hover:bg-indigo-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                   >
                                      <Settings className="w-4 h-4" />
                                   </button>
                                   <button 
                                      onClick={() => setStoreItems(prev => prev.filter(i => i.id !== item.id))} 
                                      className="text-rose-500 p-2 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                    </div>
                  )}

                  {managerSubTab === 'achievements' && (
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl overflow-hidden">
                       <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">{t.labels.legendsBureau}</h3>
                      <div className="space-y-3">
                         {achievements.map(ach => (
                           <div key={ach.id} className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all
                                ${ach.type === 'curse' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}
                              `}>
                                 {ach.iconName === 'Trophy' && <Trophy className="w-5 h-5" />}
                                 {ach.iconName === 'Medal' && <Medal className="w-5 h-5" />}
                                 {ach.iconName === 'Crown' && <Crown className="w-5 h-5" />}
                                 {ach.iconName === 'Sword' && <Sword className="w-5 h-5" />}
                                 {ach.iconName === 'Shield' && <Shield className="w-5 h-5" />}
                                 {ach.iconName === 'Clock' && <Clock className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                 <p className="font-bold text-white text-xs">{ach.name}</p>
                                 <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">{ach.type}</p>
                              </div>
                              <div className="text-right shrink-0 flex items-center gap-2">
                                 <div className="flex items-center">
                                   <button 
                                      onClick={() => setEditingAchievement(ach)} 
                                      className="text-indigo-400 p-2 hover:bg-indigo-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                   >
                                      <Settings className="w-4 h-4" />
                                   </button>
                                   <button 
                                      onClick={() => setAchievements(prev => prev.filter(a => a.id !== ach.id))} 
                                      className="text-rose-500 p-2 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                    </div>
                  )}

                  {managerSubTab === 'tasks' && (
                    <div className="space-y-6">
                      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-indigo-500/10 p-6 shadow-xl relative overflow-hidden group">
                        <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
                           <Settings className="w-4 h-4 text-indigo-400" />
                           {t.labels.language}
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                           {(['en', 'pt', 'es'] as Language[]).map(lang => (
                             <button
                               key={lang}
                               onClick={() => setLanguage(lang)}
                               className={`py-4 px-2 rounded-xl border font-bold uppercase text-[10px] tracking-widest transition-all ${
                                 language === lang 
                                   ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' 
                                   : 'bg-black/40 border-white/10 text-slate-400 hover:bg-white/5'
                               }`}
                             >
                               {lang === 'en' && 'English'}
                               {lang === 'pt' && 'Português'}
                               {lang === 'es' && 'Español'}
                             </button>
                           ))}
                        </div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
                        <h3 className="font-bold text-white uppercase text-xs tracking-widest flex items-center gap-2">
                           <Upload className="w-4 h-4 text-emerald-400" />
                           {t.labels.backup}
                        </h3>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.labels.autoSave}</p>
                        <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg">
                          <p className="text-[9px] text-indigo-300 leading-relaxed font-medium">
                            <Info className="w-3 h-3 inline mr-1" />
                            {t.labels.linuxHelp}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button 
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 py-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                          >
                            <Plus className="w-4 h-4 rotate-45" /> 
                            {t.labels.exportData}
                          </button>
                          <label className="flex items-center justify-center gap-2 py-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer text-center">
                            <Upload className="w-4 h-4" />
                            {t.labels.importData}
                            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                          </label>
                        </div>
                      </div>

                      <div className="bg-rose-950/20 border border-rose-500/20 p-6 rounded-2xl backdrop-blur-sm shadow-xl">
                       <h4 className="text-rose-400 font-bold mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">
                         <AlertCircle className="w-4 h-4" />
                         {t.labels.dangerZone}
                       </h4>
                      <p className="text-rose-400/60 text-[10px] mb-4 uppercase font-bold tracking-wide">{t.labels.resetDesc}</p>
                      <button 
                        onClick={() => {
                          if (confirm('Delete all data?')) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }}
                        className="w-full px-4 py-3 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-100 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                      >
                        {t.labels.resetApp}
                      </button>
                    </div>
                   </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </main>

      {/* Notifications */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div 
              key={n.id}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-4 max-w-sm
                ${n.type === 'level' ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-100' : 
                  n.type === 'achievement' ? 'bg-amber-600/20 border-amber-500/30 text-amber-100' :
                  'bg-rose-600/20 border-rose-500/30 text-rose-100'}
              `}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                ${n.type === 'level' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 
                  n.type === 'achievement' ? 'bg-amber-500 shadow-lg shadow-amber-500/20' :
                  'bg-rose-500 shadow-lg shadow-rose-500/20'}
              `}>
                {n.type === 'level' ? <Zap className="w-5 h-5 text-white" /> : 
                 n.type === 'achievement' ? <Trophy className="w-5 h-5 text-white" /> :
                 <AlertCircle className="w-5 h-5 text-white" />}
              </div>
              <p className="text-sm font-bold leading-tight">{n.message}</p>
              <button 
                onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                className="opacity-50 hover:opacity-100 transition-opacity ml-2"
              >✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal: Add Task */}
      <dialog id="modal-add-task" className="bg-slate-950 backdrop-blur-2xl text-white p-0 rounded-2xl border border-white/10 backdrop:bg-black/80 backdrop:backdrop-blur-sm w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-transparent flex items-center justify-between">
           <h3 className="text-xl font-bold flex items-center gap-3 uppercase tracking-tighter">
             <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-600/20">
               <Plus className="w-4 h-4 text-white" />
             </div>
             {t.actions.createTask}
           </h3>
           <form method="dialog">
             <button className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-slate-400 hover:text-white transition-all">✕</button>
           </form>
        </div>
        <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <form id="form-add-task" onSubmit={(e) => {
             e.preventDefault();
             const formData = new FormData(e.currentTarget);
             
             const areaXP: Partial<Record<TaskArea, number>> = {};
             const area = formData.get('area') as TaskArea;
             if (area) {
               areaXP[area] = parseInt(formData.get('xp') as string);
             }

             addTask({
               name: formData.get('name') as string,
               description: formData.get('description') as string,
               xp: parseInt(formData.get('xp') as string),
               money: parseInt(formData.get('money') as string),
               difficulty: formData.get('difficulty') as Difficulty,
               priority: (formData.get('priority') as any) || 'None',
               dueDate: (formData.get('dueDate') as string) || undefined,
               areaXP,
               staminaCost: parseInt(formData.get('staminaCost') as string) || 0,
               isRepeating: formData.get('isRepeating') === 'on',
               repeatInterval: parseInt(formData.get('repeatInterval') as string) || undefined
             });
             (e.currentTarget.closest('dialog') as any)?.close();
             (e.target as any).reset();
           }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t.labels.taskName}</label>
                <input name="name" required autoFocus className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-700 shadow-inner" placeholder={t.labels.taskName} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t.labels.taskDescription}</label>
                <textarea name="description" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-700 shadow-inner min-h-[100px]" placeholder={t.labels.taskDescription} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t.labels.targetArea}</label>
                  <select name="area" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 appearance-none cursor-pointer font-medium">
                    <option value="General">General</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t.stats.stamina}</label>
                  <div className="relative">
                    <Battery className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500/50" />
                    <input name="staminaCost" type="number" required defaultValue="10" className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 font-mono" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t.labels.rewardXp}</label>
                  <div className="relative">
                    <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/50" />
                    <input name="xp" type="number" required defaultValue="100" className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t.labels.rewardGold}</label>
                  <div className="relative">
                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" />
                    <input name="money" type="number" required defaultValue="50" className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-mono" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t.labels.rank}</label>
                  <select name="difficulty" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 appearance-none cursor-pointer font-medium">
                    <option value="Easy">{t.rankNames.easy}</option>
                    <option value="Medium">{t.rankNames.medium}</option>
                    <option value="Hard">{t.rankNames.hard}</option>
                    <option value="Elite">{t.rankNames.elite}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t.labels.priority}</label>
                  <select name="priority" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 appearance-none cursor-pointer font-medium">
                    <option value="None">{t.priorityNames.none}</option>
                    <option value="Low">{t.priorityNames.low}</option>
                    <option value="Medium">{t.priorityNames.medium}</option>
                    <option value="High">{t.priorityNames.high}</option>
                    <option value="Urgent">{t.priorityNames.urgent}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t.labels.repeatingTask}</label>
                  <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl px-4 py-4">
                    <input name="isRepeating" type="checkbox" className="w-5 h-5 accent-indigo-500 rounded border-white/10" />
                    <span className="text-sm font-medium text-slate-300">{t.labels.respawns}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t.labels.intervalDays}</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input name="repeatInterval" type="number" defaultValue="1" min="1" className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-mono" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                 <div className="flex-1 text-xs">
                   <button type="button" onClick={() => (document.getElementById('modal-add-task') as any)?.close()} className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 text-slate-400 hover:text-white transition-all uppercase tracking-widest">{t.actions.abort}</button>
                 </div>
                 <button type="submit" className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-xl shadow-indigo-600/30 active:scale-95 transition-all text-sm uppercase tracking-[0.15em]">{t.actions.publish}</button>
              </div>
           </form>
        </div>
      </dialog>
    </div>
  );
}

// Helper Components
function CalendarView({ tasks, onCompleteTask }: { tasks: Task[]; onCompleteTask: (id: string) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (task.dueDate && !task.completed) {
        map[task.dueDate] = [...(map[task.dueDate] || []), task];
      }
    });
    return map;
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
        <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-indigo-500" />
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg border border-white/10 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg border border-white/10 transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
          <div key={day} className="text-center py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{day}</div>
        ))}
        
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square bg-transparent" />
        ))}
        
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dayTasks = tasksByDay[dateStr] || [];
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <div key={d} className={`min-h-[100px] p-2 rounded-xl border transition-all hover:bg-white/[0.02] relative group
              ${isToday ? 'bg-indigo-600/10 border-indigo-500/40' : 'bg-white/5 border-white/10'}
            `}>
              <span className={`text-xs font-bold ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>{d}</span>
              <div className="mt-2 space-y-1">
                {dayTasks.map(task => (
                  <button 
                    key={task.id}
                    onClick={() => onCompleteTask(task.id)}
                    className="w-full text-left p-1.5 rounded-md bg-indigo-600/20 border border-indigo-500/20 text-[9px] font-bold text-indigo-100 hover:bg-indigo-600/40 transition-all truncate"
                    title={task.name}
                  >
                    • {task.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TitlesCursesView({ stats, achievements, titles, onSelectTitle }: { stats: UserStats, achievements: Achievement[], titles: Title[], onSelectTitle: (id: string) => void }) {
  const unlockedAchievements = stats.unlockedAchievements || [];
  const unlockedTitles = stats.unlockedTitles || [];
  
  return (
    <div className="space-y-12">
      <section>
        <h3 className="text-xl font-bold text-indigo-400 mb-6 uppercase tracking-widest flex items-center gap-3">
          <Crown className="w-6 h-6" />
          Títulos de Glória
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {titles.map(title => {
            const isUnlocked = unlockedTitles.includes(title.id);
            const isActive = stats.activeTitleId === title.id;

            return (
              <div 
                key={title.id} 
                onClick={() => isUnlocked && onSelectTitle(title.id)}
                className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl transition-all relative group overflow-hidden cursor-pointer
                  ${isUnlocked 
                    ? (isActive ? 'bg-indigo-600/30 border-indigo-400 text-white ring-2 ring-indigo-500/50' : 'bg-indigo-600/10 border-indigo-500/30 text-white hover:bg-indigo-600/20') 
                    : 'bg-white/5 border-white/10 text-slate-500 grayscale opacity-60 cursor-not-allowed'}
                `}
              >
                {isActive && (
                  <div className="absolute top-4 right-4 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl border
                    ${isUnlocked 
                      ? (isActive ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-indigo-600/20 border-indigo-500/20 text-indigo-400') 
                      : 'bg-white/5 border-white/10 text-slate-500'}
                  `}>
                    {React.createElement((LucideIcons as any)[title.iconName] || Crown, { className: "w-6 h-6" })}
                  </div>
                  <div>
                    <h4 className={`font-bold uppercase tracking-tight ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>{title.name}</h4>
                    <p className="text-xs leading-tight mt-1">{title.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span>Bônus de Título</span>
                    <span className="text-emerald-400">+{Math.round((title.buffValue - 1) * 100)}% {title.buffType.toUpperCase()}</span>
                  </div>
                  {!isUnlocked && (
                    <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest text-center py-1 bg-black/20 rounded-md">
                      Bloqueado
                    </div>
                  )}
                  {isActive && (
                    <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest text-center py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                      Equipado
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {achievements.filter(a => a.type === 'title').map(achievement => {
             const isUnlocked = unlockedAchievements.includes(achievement.id);
             return (
               <AchievementCard key={achievement.id} achievement={achievement} isUnlocked={isUnlocked} />
             );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-rose-500 mb-6 uppercase tracking-widest flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          Maldições do Destino
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.filter(a => a.type === 'curse').map(achievement => {
             const isUnlocked = unlockedAchievements.includes(achievement.id);
             return (
               <AchievementCard key={achievement.id} achievement={achievement} isUnlocked={isUnlocked} isCurse />
             );
          })}
        </div>
      </section>
    </div>
  );
}

function InventoryView({ stats, onConsume }: { stats: UserStats, onConsume: (id: string) => void }) {
  const now = Date.now();
  
  return (
    <div className="space-y-8">
      {stats.activeBuffs && stats.activeBuffs.length > 0 && (
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-md">
          <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Efeitos Ativos
          </h4>
          <div className="flex flex-wrap gap-3">
            {stats.activeBuffs.map(buff => {
              const remaining = Math.max(0, Math.round((buff.endTime - now) / 1000));
              const minutes = Math.floor(remaining / 60);
              const seconds = remaining % 60;
              
              return (
                <div key={buff.id} className="bg-black/40 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                  <div className="text-indigo-400">
                    {React.createElement((LucideIcons as any)[buff.iconName] || Zap, { className: "w-4 h-4" })}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white uppercase leading-none">{buff.name}</p>
                    <p className="text-[9px] text-indigo-400 font-mono mt-1">{minutes}:{seconds.toString().padStart(2, '0')} restante</p>
                  </div>
                  <div className="ml-2 text-[9px] font-bold text-emerald-400">
                    {buff.buffValue}x
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
          <Package className="w-6 h-6 text-indigo-400" />
          Itens Guardados
        </h3>
        
        {stats.inventory.length === 0 ? (
          <div className="py-20 text-center text-slate-600">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="font-medium">Seu inventário está vazio. Visite o Mercado Negro para adquirir relíquias.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {stats.inventory.map((item, idx) => (
              <div key={idx} className="bg-black/40 rounded-2xl border border-white/10 p-5 flex flex-col items-center gap-4 group transition-all hover:bg-black/60 shadow-lg">
                <div className="w-full aspect-square bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform overflow-hidden relative">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Package className="w-12 h-12" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-sm p-2 text-center border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-bold text-white uppercase tracking-widest">{item.category}</span>
                  </div>
                </div>
                <div className="text-center w-full">
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight truncate">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">{item.description}</p>
                </div>
                <div className="w-full pt-3 border-t border-white/5 space-y-3">
                   <div className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-bold uppercase
                     ${item.buffType === 'xp' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' : 
                       item.buffType === 'money' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' :
                       item.buffType === 'stamina' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/10' :
                       'bg-indigo-500/10 text-indigo-500 border border-indigo-500/10'}
                   `}>
                     <Zap className="w-3 h-3" />
                     {item.buffValue}x {item.buffType.toUpperCase()}
                   </div>
                   
                   {item.itemType === 'consumable' && (
                     <button 
                       onClick={() => onConsume(`inv-${item.id}-${idx}`)}
                       className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-100 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95"
                     >
                       Usar Item {item.duration ? `(${Math.floor(item.duration/60)}min)` : ''}
                     </button>
                   )}

                   {item.itemType !== 'consumable' && (
                     <div className="text-center py-2 text-[8px] font-bold text-slate-600 uppercase tracking-widest border border-white/5 rounded-lg">
                       Item Passivo
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const AchievementCard: React.FC<{ achievement: any, isUnlocked: boolean, isCurse?: boolean }> = ({ achievement, isUnlocked, isCurse }) => {
  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl transition-all relative group overflow-hidden
      ${isUnlocked 
        ? (isCurse ? 'bg-rose-500/10 border-rose-500/30 text-white' : 'bg-indigo-600/10 border-indigo-500/30 text-white') 
        : 'bg-white/5 border-white/10 text-slate-500 grayscale opacity-60'}
    `}>
       {isUnlocked && (
         <div className={`absolute top-4 right-4 ${isCurse ? 'text-rose-500' : 'text-emerald-400'}`}>
            {isCurse ? <AlertCircle className="w-5 h-5" /> : <Star className="w-5 h-5 fill-current" />}
         </div>
       )}
       
       <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-xl border
            ${isUnlocked 
              ? (isCurse ? 'bg-rose-500/20 border-rose-500/20 text-rose-400' : 'bg-indigo-600/20 border-indigo-500/20 text-indigo-400') 
              : 'bg-white/5 border-white/10 text-slate-500'}
          `}>
             {React.createElement((LucideIcons as any)[achievement.iconName] || Trophy, { className: "w-6 h-6" })}
          </div>
          <div>
             <h4 className={`font-bold uppercase tracking-tight ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>{achievement.name}</h4>
             <p className="text-xs leading-tight mt-1">{achievement.description}</p>
          </div>
       </div>

       <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
             <span>{isCurse ? 'Efeito Colateral' : 'Recompensa'}</span>
             <div className="flex gap-2">
                {achievement.reward?.money && <span className="text-amber-400">${achievement.reward.money} Gold</span>}
                {achievement.reward?.xp && <span className="text-indigo-400">+{achievement.reward.xp} XP</span>}
                {isCurse && <span className="text-rose-400">Destino Selado</span>}
             </div>
          </div>
          {!isUnlocked && (
            <div className="w-full bg-white/5 h-1 border border-white/10 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-slate-700 w-1/3" />
            </div>
          )}
       </div>
    </div>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="relative group inline-block ml-1 align-top">
      <HelpCircle className="w-3 h-3 text-slate-500 hover:text-indigo-400 cursor-help transition-colors" />
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 bg-slate-900 border border-white/10 rounded-xl text-[9px] text-slate-300 font-medium normal-case tracking-normal shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 text-center">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 bg-slate-900 border-r border-b border-white/10 rotate-45" />
        {text}
      </div>
    </div>
  );
}

const DungeonCard: React.FC<{ dungeon: Dungeon, storeItems: StoreItem[], titles: Title[], onProgressTask: (roomId: string, taskId: string) => void }> = ({ dungeon, storeItems, titles, onProgressTask }) => {
  const totalTasks = dungeon.rooms.reduce((acc, r) => acc + r.tasks.length, 0);
  const completedTasks = dungeon.rooms.reduce((acc, r) => acc + r.tasks.filter(t => t.completed).length, 0);
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className={`p-8 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all relative overflow-hidden group
      ${dungeon.isCompleted 
        ? 'bg-gradient-to-br from-emerald-600/10 to-indigo-900/40 border-emerald-500/30' 
        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
      }`}>
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-all group-hover:scale-110
              ${dungeon.isCompleted ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-indigo-600 text-white shadow-indigo-600/30'}`}>
              {React.createElement((LucideIcons as any)[dungeon.iconName] || Sword, { size: 30 })}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-1 group-hover:text-indigo-400 transition-colors">{dungeon.name}</h3>
              <p className="text-xs text-slate-400 max-w-md line-clamp-2">{dungeon.description}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border
              ${dungeon.isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
              {dungeon.isCompleted ? 'Explorada' : 'Em Progresso'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span>Progresso da Expedição</span>
            <span className="text-white">{Math.round(progressPercent)}%</span>
            <span className="text-[10px] text-slate-600">{completedTasks}/{totalTasks}</span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className={`h-full shadow-[0_0_10px_rgba(79,70,229,0.3)] 
                ${dungeon.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
            />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Salas da Dungeon</h4>
          <div className="space-y-3">
            {dungeon.rooms.map((room, idx) => (
              <div key={room.id} className={`p-4 rounded-xl border transition-all 
                ${room.completed 
                  ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' 
                  : 'bg-black/20 border-white/5'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {idx + 1}
                    </span>
                    <h5 className={`font-bold text-xs uppercase tracking-widest ${room.completed ? 'text-emerald-400 line-through' : 'text-white'}`}>
                      {room.name}
                    </h5>
                  </div>
                  {room.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="text-[8px] font-bold text-slate-500 uppercase">Aguardando Missões</div>
                  )}
                </div>

                {!room.completed && (
                  <div className="space-y-2 ml-9">
                    {room.tasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between group/task">
                        <span className={`text-[11px] ${task.completed ? 'text-slate-600 line-through' : 'text-slate-400 group-hover/task:text-indigo-300 transition-colors'}`}>
                          • {task.name}
                        </span>
                        {!task.completed && (
                          <button 
                            onClick={() => onProgressTask(room.id, task.id)}
                            className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest bg-indigo-500/5 px-2 py-1 rounded transition-colors"
                          >
                            Finalizar
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {room.completed && room.reward && (
                  <div className="ml-9 flex flex-wrap gap-2 pt-1">
                    {room.reward.gold && (
                      <span className="text-[8px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        +{room.reward.gold} Gold Coletado
                      </span>
                    )}
                    {room.reward.titleId && (
                      <span className="text-[8px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                        Título: {titles.find(t => t.id === room.reward?.titleId)?.name || 'Desconhecido'}
                      </span>
                    )}
                    {room.reward.itemId && (
                      <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <Package className="w-2.5 h-2.5" />
                        Item: {storeItems.find(i => i.id === room.reward?.itemId)?.name || 'Desconhecido'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-12 -right-12 p-8 opacity-5 pointer-events-none rotate-12 transition-transform group-hover:scale-125">
        <Sword size={240} />
      </div>
    </div>
  );
}

const AreaProgress: React.FC<{ label: string, xp: number, icon: React.ReactNode, color: string, config?: LevelConfig }> = ({ label, xp, icon, color, config }) => {
  const levelInfo = useMemo(() => {
    const cfg = config || { baseXP: 500, scalingType: 'fixed', scalingValue: 0 };
    const info = calculateLevelInfo(xp, cfg);
    return { level: info.level, percent: info.progressPercent };
  }, [xp, config]);
  
  const colors: Record<string, string> = {
    rose: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]',
    blue: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]',
    indigo: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]',
    amber: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    emerald: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
  };

  const textColors: Record<string, string> = {
    rose: 'text-rose-400 font-bold',
    blue: 'text-blue-400 font-bold',
    indigo: 'text-indigo-400 font-bold',
    amber: 'text-amber-400 font-bold',
    emerald: 'text-emerald-400 font-bold',
  };

  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`${textColors[color]} opacity-50 group-hover:opacity-100 transition-opacity`}>
            {React.cloneElement(icon as React.ReactElement, { size: 14 })}
          </div>
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-slate-500">LVL</span>
          <span className={`text-xs font-bold ${textColors[color]}`}>{levelInfo.level}</span>
        </div>
      </div>
      <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          animate={{ width: `${levelInfo.percent}%` }}
          className={`h-full ${colors[color]}`} 
        />
      </div>
    </div>
  );
}

function getIconByName(name: string) {
  switch (name) {
    case 'Heart': return <Heart />;
    case 'Users': return <Users />;
    case 'Moon': return <Moon />;
    case 'Briefcase': return <Briefcase />;
    case 'Coffee': return <Coffee />;
    case 'Star': return <Star />;
    case 'Zap': return <Zap />;
    case 'Shield': return <Shield />;
    case 'Sword': return <Sword />;
    default: return <Package />;
  }
}

function SidebarLink({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group
        ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
      `}
    >
      <div className={`${active ? 'scale-110' : 'group-hover:scale-110 text-slate-500'} transition-transform shrink-0`}>
        {icon}
      </div>
      <span className="hidden md:block font-semibold text-sm tracking-tight">{label}</span>
      {active && <div className="absolute right-3 hidden md:block opacity-50"><ChevronRight className="w-4 h-4" /></div>}
    </button>
  );
}

function StatCard({ label, value, subValue, icon, color }: { label: string, value: string | number, subValue: string, icon: React.ReactNode, color: 'amber' | 'emerald' | 'rose' }) {
  const colors = {
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} backdrop-blur-md shadow-xl flex items-start justify-between group overflow-hidden relative`}>
      <div className="relative z-10">
        <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
        <p className="text-3xl font-bold font-mono tracking-tighter text-white mb-2">{typeof value === 'number' && label.includes('Gold') ? '$ ' + value.toLocaleString() : value}</p>
        <p className="text-xs opacity-70 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {subValue}
        </p>
      </div>
      <div className={`p-3 rounded-xl bg-current ${colors[color]} scale-125 absolute -right-2 top-4 opacity-10 group-hover:scale-150 group-hover:-rotate-12 transition-transform`}>
        {icon}
      </div>
    </div>
  );
}

function TaskRow({ task, t, onComplete }: { task: Task; t: TranslationSchema; onComplete: () => void; key?: string | number }) {
  const colorClass = DIFFICULTY_COLORS[task.difficulty];
  const priorityClass = PRIORITY_COLORS[task.priority || 'None'];
  
  const translatedDifficulty = {
    'Easy': t.rankNames.easy,
    'Medium': t.rankNames.medium,
    'Hard': t.rankNames.hard,
    'Elite': t.rankNames.elite
  }[task.difficulty];

  const translatedPriority = {
    'None': t.priorityNames.none,
    'Low': t.priorityNames.low,
    'Medium': t.priorityNames.medium,
    'High': t.priorityNames.high,
    'Urgent': t.priorityNames.urgent
  }[task.priority || 'None'];

  return (
    <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-white/[0.04] transition-all group backdrop-blur-[2px]">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onComplete}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 group/btn shrink-0
            ${task.completed ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/10 hover:border-emerald-500 hover:bg-emerald-500/10'}
          `}
        >
          <CheckCircle2 className={`w-6 h-6 ${task.completed ? 'text-emerald-500' : 'text-transparent group-hover/btn:text-emerald-500'}`} />
        </button>
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h4 className={`text-lg font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight ${task.completed ? 'line-through opacity-50' : ''}`}>{task.name}</h4>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${colorClass}`}>
              {translatedDifficulty}
            </span>
            {task.priority !== 'None' && (
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${priorityClass}`}>
                {translatedPriority}
              </span>
            )}
            {task.isRepeating && (
              <span className="px-2 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {t.labels.repeating}
              </span>
            )}
            {task.areaXP && Object.keys(task.areaXP).length > 0 && (
              <span className="px-2 py-0.5 rounded border border-slate-500/30 bg-slate-500/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <LayoutDashboard className="w-2.5 h-2.5" />
                {Object.keys(task.areaXP)[0]}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
             <div className="flex items-center gap-1.5 text-amber-500/80 font-mono text-xs">
                <Trophy className="w-3.5 h-3.5" />
                <span>{task.xp} XP</span>
             </div>
             <div className="flex items-center gap-1.5 text-emerald-500/80 font-mono text-xs">
                <Coins className="w-3.5 h-3.5" />
                <span>{task.money}G</span>
             </div>
             {task.staminaCost !== undefined && (
               <div className={`flex items-center gap-1.5 font-mono text-xs ${task.staminaCost > 0 ? 'text-rose-400/80' : 'text-emerald-400/80'}`}>
                  <Battery className="w-3.5 h-3.5" />
                  <span>{task.staminaCost > 0 ? `-${task.staminaCost}` : `+${Math.abs(task.staminaCost)}`}</span>
               </div>
             )}
          </div>
          {task.description && (
            <p className="text-xs text-slate-400 mt-2 line-clamp-2 italic">{task.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between md:justify-end gap-4 pl-14 md:pl-0">
         <button onClick={onComplete} className="md:opacity-0 group-hover:opacity-100 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-xs font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20">
           {t.labels.claimContract}
         </button>
      </div>
    </div>
  );
}

function CompletedTaskCard({ task }: { task: Task; key?: string | number }) {
  return (
    <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl flex items-center justify-between opacity-80">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        <div>
          <p className="font-bold text-white text-sm line-through decoration-emerald-500/50">{task.name}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">{new Date(task.completedAt!).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-emerald-500 font-mono text-sm leading-none">CLEARED</p>
        <p className="text-[10px] text-gray-500 mt-1">+{task.xp} XP</p>
      </div>
    </div>
  );
}

function StoreItemCard({ item, onBuy, canAfford }: { item: StoreItem; onBuy: () => void; canAfford: boolean; key?: string | number }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col group hover:border-indigo-500/40 transition-all hover:translate-y-[-4px]">
      <div className="flex items-start justify-between mb-6">
        <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-inner border border-white/10 backdrop-blur-sm overflow-hidden">
           {item.imageUrl ? (
             <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
           ) : (
             <>
               {item.iconName === 'Zap' && <Zap className="w-8 h-8" />}
               {item.iconName === 'Coins' && <Coins className="w-8 h-8" />}
               {item.iconName === 'Package' && <Package className="w-8 h-8" />}
               {['Zap', 'Coins', 'Package'].indexOf(item.iconName) === -1 && <Sword className="w-8 h-8" />}
             </>
           )}
        </div>
        <div className="text-right">
           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">{item.category}</span>
        </div>
      </div>
      
      <div className="flex-1 space-y-2 mb-6">
        <h4 className="text-xl font-bold text-white tracking-tight">{item.name}</h4>
        <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
        <div className="flex items-center gap-2 pt-2">
           <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
             ${item.buffType === 'xp' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
               item.buffType === 'money' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
               item.buffType === 'stamina' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
               'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'}
           `}>
             <Crown className="w-3.5 h-3.5" />
             {item.buffType.toUpperCase()} BOOSTER
           </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-500" />
          <span className="text-lg font-bold font-mono text-white">{item.price}</span>
        </div>
        <button 
          onClick={onBuy}
          disabled={!canAfford}
          className={`px-5 py-2 rounded-xl font-bold text-sm transition-all active:scale-95
            ${canAfford 
              ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20' 
              : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'}
          `}
        >
          {canAfford ? 'PURCHASE' : 'INSUFFICIENT GOLD'}
        </button>
      </div>
    </div>
  );
}

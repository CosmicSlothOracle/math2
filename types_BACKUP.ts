
export type CategoryGroup = 'A' | 'B' | 'C';

export type TaskType = 
  | 'choice' 
  | 'input' 
  | 'boolean' 
  | 'shorttext' 
  | 'visualChoice' 
  | 'wager'
  | 'interactive_alien_scanner'
  | 'interactive_laser_parcours';

export interface Task {
  id: string;
  question: string;
  type: TaskType;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  placeholder?: string;
  visualData?: any; 
  wagerOptions?: number[]; 
  interactiveData?: any;
}

export interface TermDefinition {
  term: string;
  definition: string;
  visual?: string; 
}

export interface LearningUnit {
  id: string;
  group: CategoryGroup;
  category: 'Basics' | 'Konstruktion' | 'Berechnung' | 'Transformation' | 'Koordinaten' | 'Modellierung';
  title: string;
  description: string;
  detailedInfo: string;
  examples: string[];
  tasks: Task[]; 
  difficulty: 'Einfach' | 'Mittel' | 'Schwer';
  coinsReward: number; 
  bounty: number;      
  definitionId?: string;
  keywords: string[];
}

export interface GeometryDefinition {
  id: string;
  groupId: CategoryGroup;
  title: string;
  description: string;
  formula: string;
  terms: TermDefinition[];
  visual: string;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'avatar' | 'effect' | 'feature' | 'voucher' | 'calculator';
  cost: number;
  value: string;
  icon?: string; 
  description: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  coins: number;
  totalEarned: number;
  completedUnits: string[]; 
  masteredUnits: string[];  
  preClearedUnits: string[]; 
  unlockedItems: string[]; 
  activeEffects: string[]; 
  calculatorSkin: string; 
  xp: number;
  solvedQuestionIds: string[]; 
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
  avatar: string;
  type?: 'chat' | 'system';
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

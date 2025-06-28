export interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  imageUrl: string;
  category: 'herb' | 'vegetable' | 'fruit' | 'flower' | 'succulent';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  careSchedule: {
    watering: number; // days between watering
    fertilizing: number; // days between fertilizing
    pruning?: number; // days between pruning
  };
  growthTime: number; // days to maturity
  sunlight: 'low' | 'medium' | 'high';
  waterNeeds: 'low' | 'medium' | 'high';
  tips: string[];
}

export interface UserPlant {
  id: string;
  userId: string;
  plantId: string;
  plant: Plant;
  nickname: string;
  sowDate: string;
  growthPercent: number;
  location: string;
  notes?: string;
  isActive: boolean;
  lastWatered?: string;
  lastFertilized?: string;
  nextWateringDue?: string;
  nextFertilizingDue?: string;
}

export interface CareReminder {
  id: string;
  user_plant_id: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'harvesting';
  due_date: string;
  completed: boolean;
  notes?: string;
}

export interface TasksByDate {
  [date: string]: CareReminder[];
}

export interface DiagnosisResult {
  id: string;
  imageUrl: string;
  plantHealth: 'healthy' | 'warning' | 'critical';
  issues: {
    type: string;
    confidence: number;
    description: string;
    treatment: string;
  }[];
  recommendations: string[];
  timestamp: string;
}
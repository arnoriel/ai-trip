// src/types.ts

export interface UserPreferences {
  destination: string;
  days: number;
  budget: 'Budget' | 'Moderate' | 'Luxury';
  interests: string[]; // e.g., ["Nature", "Food", "History"]
}

export interface Activity {
  time: string;
  activity: string;
  description: string;
  estimatedCost: string;
}

export interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
}

export interface TripData {
  id: string;
  destination: string;
  createdAt: string;
  preferences: UserPreferences;
  itinerary: DayPlan[];
}
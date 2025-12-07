// src/lib/types.ts
export type UserProfile = {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  height: number; // in cm
  weight: number; // in kg
  goal: 'Weight Loss' | 'Muscle Gain' | 'Maintenance' | 'Toning';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  location: 'Home' | 'Gym' | 'Outdoor';
  diet: 'Veg' | 'Non-Veg' | 'Vegan' | 'Keto' | 'Paleo';
  medicalHistory: string;
};

export type Exercise = {
  name: string;
  sets: number;
  reps: string; // e.g., "8-12 reps"
  rest: string; // e.g., "60s"
};

export type DailyWorkout = {
  day: string; // e.g., "Day 1: Push"
  focus: string;
  exercises: Exercise[];
  imageDescription: string; // Description for a daily workout image
};

export type Meal = {
  name: string; // e.g., "Scrambled Eggs and Toast"
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  description: string; // e.g., "2 eggs, 1 slice whole wheat toast"
};

export type DailyDiet = {
  day: string;
  meals: Meal[];
  imageDescription: string; // Description for a daily diet image
};

export type FitnessPlan = {
  motivationQuote: string;
  aiTips: string[];
  workoutPlan: DailyWorkout[];
  dietPlan: DailyDiet[];
};
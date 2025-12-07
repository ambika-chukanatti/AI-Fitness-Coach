'use client';

import { useForm } from 'react-hook-form';
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const goals = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Toning'] as const;
const levels = ['Beginner', 'Intermediate', 'Advanced'] as const;
const locations = ['Home', 'Gym', 'Outdoor'] as const;
const diets = ['Veg', 'Non-Veg', 'Vegan', 'Keto', 'Paleo'] as const;
const genders = ['Male', 'Female', 'Other'] as const;

export function PlanForm({ onGenerate }: { onGenerate: (data: UserProfile) => void }) {
  const { register, handleSubmit, setValue, formState: { isSubmitting, errors } } = useForm<UserProfile>({
    defaultValues: {
      name: '',
      age: 25,
      height: 175,
      weight: 70,
      medicalHistory: '',
    },
  });

  const onSubmit = (data: UserProfile) => {
    onGenerate(data);
  };

  return (
    <Card className="max-w-xl mx-auto my-8 relative"> 
      <CardHeader>
        <CardTitle className="text-3xl text-center pt-2">AI Fitness Coach Setup 🤖</CardTitle>
        <CardDescription className="text-center">Tell us about yourself to generate your personalized plan.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" {...register('age', { valueAsNumber: true, required: true, min: 14 })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" type="number" {...register('height', { valueAsNumber: true, required: true, min: 50 })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" {...register('weight', { valueAsNumber: true, required: true, min: 20 })} />
            </div>
              <div className="space-y-2">
              <Label>Gender</Label>
              <Select onValueChange={(val) => setValue('gender', val as UserProfile['gender'])} required>
                <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                <SelectContent>{genders.map(g => (<SelectItem key={g} value={g}>{g}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fitness Goal</Label>
              <Select onValueChange={(val) => setValue('goal', val as UserProfile['goal'])} required>
                <SelectTrigger><SelectValue placeholder="Select Goal" /></SelectTrigger>
                <SelectContent>{goals.map(g => (<SelectItem key={g} value={g}>{g}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fitness Level</Label>
              <Select onValueChange={(val) => setValue('level', val as UserProfile['level'])} required>
                <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                <SelectContent>{levels.map(l => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent>
              </Select>
            </div>
              <div className="space-y-2">
              <Label>Workout Location</Label>
              <Select onValueChange={(val) => setValue('location', val as UserProfile['location'])} required>
                <SelectTrigger><SelectValue placeholder="Select Location" /></SelectTrigger>
                <SelectContent>{locations.map(l => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dietary Preference</Label>
              <Select onValueChange={(val) => setValue('diet', val as UserProfile['diet'])} required>
                <SelectTrigger><SelectValue placeholder="Select Diet" /></SelectTrigger>
                <SelectContent>{diets.map(d => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History / Notes (Optional)</Label>
            <Textarea id="medicalHistory" {...register('medicalHistory')} placeholder="e.g., knee injury, dietary restrictions..." />
          </div>

          <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting}>
            {isSubmitting ? 'Generating Plan... This may take a moment ⏳' : 'Generate My AI Plan 🚀'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
'use client';

import { useState } from 'react';
import { PlanForm } from '@/components/app/PlanForm';
import { FitnessPlan, UserProfile } from '@/lib/types';
import { PlanDisplay } from '@/components/app/PlanDisplay';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

import { ThemeToggler } from '@/components/app/ThemeToggler'; 

export default function HomePage() {
  const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async (data: UserProfile) => {
    setLoading(true);
    setError(null);
    setPlan(null);
    setProfile(data);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to fetch plan from AI service.';
        throw new Error(errorMessage);
      }

      const generatedPlan: FitnessPlan = await response.json();
      setPlan(generatedPlan);

    } catch (err: any) {
      console.error(err);
      setError('An error occurred: ' + (err.message || 'Check console for details.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setPlan(null);
    setProfile(null);
  };
  
  return (
    <div className="relative min-h-screen"> 
      
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggler />
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
          <h1 className="text-4xl font-bold mb-4 animate-pulse">
            Building Your Personalized Plan...
          </h1>
          <p className="text-xl text-muted-foreground">
            The AI is crafting a week of workouts and meals. Please wait.
          </p>
          <div className="w-16 h-16 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full animate-spin mt-6"></div>
        </div>
      )}

      {error && (
        <div className="p-4 max-w-2xl mx-auto my-8">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Generating Plan</AlertTitle>
            <AlertDescription>
              {error} <br/> Please check your API key, your environment variables, and retry.
            </AlertDescription>
          </Alert>
          <Button onClick={handleRegenerate} className="mt-4">
              Try Again
          </Button>
        </div>
      )}

      {plan && profile && (
        <ScrollArea className="h-screen w-full">
          <PlanDisplay plan={plan} profile={profile} onRegenerate={handleRegenerate} />
        </ScrollArea>
      )}

      {!loading && !error && !plan && (
        <main className="p-4 bg-background min-h-screen">
          <PlanForm onGenerate={handleGeneratePlan} />
        </main>
      )}
      
    </div>
  );
}
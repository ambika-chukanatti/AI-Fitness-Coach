'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FitnessPlan, UserProfile, DailyWorkout, DailyDiet, Exercise, Meal } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Zap, RefreshCw, Download, Volume2, ChevronDown, VolumeX, Loader2 } from 'lucide-react'; 

import { PDFDownloadLink } from '@react-pdf/renderer';
import { MyPlanPDF } from './PdfDocument'; 

import GeneratedImageDisplay from './GeneratedImageDisplay'; 

const IMAGE_REQUEST_COOLDOWN = 5000; 
const IMAGE_GENERATION_TIMEOUT = 30000; 

type ItemState = {
    imageUrl?: string;
    isLoading: boolean;
    error: string | null;
    isOpen: boolean;
};

type ExerciseState = Exercise & ItemState;
type MealState = Meal & ItemState;


const getCacheKey = (day: string, itemName: string) => 
    `cache_img_${day.toLowerCase().replace(/\s/g, '_')}_${itemName.toLowerCase().replace(/\s/g, '_')}`;

const fetchImage = async (description: string): Promise<string> => {
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), IMAGE_GENERATION_TIMEOUT);

    try {
        const response = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description }),
            signal: controller.signal, 
        });
        
        clearTimeout(timeoutId); 

        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait a moment.');
            }
            throw new Error(data.error || 'Failed to generate image.');
        }
        
        return data.imageUrl;

    } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error(`Image generation timed out after ${IMAGE_GENERATION_TIMEOUT / 1000} seconds. Please retry.`);
        }
        throw error;
    }
};


const WorkoutCard = React.memo(({ dayPlan }: { dayPlan: DailyWorkout }) => {
    
    const initialExerciseState: ExerciseState[] = dayPlan.exercises.map(ex => ({
        ...ex,
        imageUrl: typeof window !== 'undefined' ? localStorage.getItem(getCacheKey(dayPlan.day, ex.name)) || undefined : undefined,
        isLoading: false,
        error: null,
        isOpen: false,
    }));

    const [exercisesState, setExercisesState] = useState(initialExerciseState);
    const lastRequestTimeRef = useRef(0);

    const handleGenerateImage = useCallback(async (index: number, prompt: string) => {
        setExercisesState(prev => 
            prev.map((exState, i) => i === index ? { ...exState, isLoading: true, error: null } : exState)
        );

        try {
            const imageUrl = await fetchImage(`${prompt}, ${dayPlan.focus} exercise form, photorealistic, gym background`);
            const cacheKey = getCacheKey(dayPlan.day, prompt);
            localStorage.setItem(cacheKey, imageUrl);

            setExercisesState(prev => 
                prev.map((exState, i) => i === index ? { ...exState, imageUrl, isLoading: false } : exState)
            );
            lastRequestTimeRef.current = Date.now();

        } catch (err: any) {
            setExercisesState(prev => 
                prev.map((exState, i) => i === index ? { ...exState, error: err.message, isLoading: false } : exState)
            );
        }
    }, [dayPlan.day, dayPlan.focus]);


    const handleRegenerateClick = useCallback((index: number, exerciseName: string, exercisePrompt: string) => {
        const timeElapsed = Date.now() - lastRequestTimeRef.current;
        if (timeElapsed < IMAGE_REQUEST_COOLDOWN) {
            const remainingTime = Math.ceil((IMAGE_REQUEST_COOLDOWN - timeElapsed) / 1000);
            setExercisesState(prev => 
                prev.map((exState, i) => i === index ? { ...exState, error: `Rate limit: Wait ${remainingTime}s.`, isLoading: false } : exState)
            );
            return;
        }

        localStorage.removeItem(getCacheKey(dayPlan.day, exerciseName));
        setExercisesState(prev => {
            const newState = [...prev];
            newState[index] = { ...newState[index], imageUrl: undefined, error: null };
            return newState;
        });
        
        handleGenerateImage(index, exercisePrompt);
    }, [dayPlan.day, handleGenerateImage]);


    const handleTriggerClick = (index: number, exerciseName: string, exercisePrompt: string) => {
        const exState = exercisesState[index];
        const isCurrentlyOpen = exState.isOpen;
        const isCached = !!exState.imageUrl;
        
        setExercisesState(prev => {
            const newState = [...prev];
            newState[index] = { ...newState[index], isOpen: !isCurrentlyOpen };
            return newState;
        });

        if (!isCurrentlyOpen && !isCached) {
            const timeElapsed = Date.now() - lastRequestTimeRef.current;
            if (timeElapsed < IMAGE_REQUEST_COOLDOWN) {
                const remainingTime = Math.ceil((IMAGE_REQUEST_COOLDOWN - timeElapsed) / 1000);
                setExercisesState(prev => 
                    prev.map((state, i) => i === index ? { ...state, error: `Rate limit: Wait ${remainingTime}s.`, isLoading: false } : state)
                );
                return; 
            }
            handleGenerateImage(index, exercisePrompt);
        }
    };


    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="text-xl">🏋️ {dayPlan.day} - {dayPlan.focus}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <ul className="space-y-3">
                    {exercisesState.map((exState, index) => (
                        <li key={index} className="border-b border-gray-100 dark:border-gray-800 pb-3 last:border-b-0 last:pb-0">
                            <Collapsible 
                                open={exState.isOpen}
                                onOpenChange={() => handleTriggerClick(index, exState.name, exState.name)}
                            >
                                <CollapsibleTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        className="w-full justify-between px-2 py-1 h-auto text-base font-semibold text-left transition-colors 
                                            hover:bg-blue-50 dark:hover:bg-blue-900/50 
                                            text-gray-900 dark:text-gray-100"
                                    >
                                        <span className="flex flex-col items-start">
                                            <span>{index + 1}. {exState.name}</span>
                                            <span className="text-xs font-normal text-muted-foreground mt-0.5">{exState.sets} Sets / {exState.reps} / {exState.rest} Rest</span>
                                        </span>
                                        <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${exState.isOpen ? 'rotate-180' : 'rotate-0'}`} />
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="p-2 pb-0">
                                    <GeneratedImageDisplay
                                        imageUrl={exState.imageUrl}
                                        isLoading={exState.isLoading}
                                        error={exState.error}
                                        onRegenerate={() => handleRegenerateClick(index, exState.name, exState.name)}
                                    />
                                </CollapsibleContent>
                            </Collapsible>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
});
WorkoutCard.displayName = 'WorkoutCard';


const DietCard = React.memo(({ dayPlan }: { dayPlan: DailyDiet }) => {
    
    const initialMealState: MealState[] = dayPlan.meals.map(meal => ({
        ...meal,
        imageUrl: typeof window !== 'undefined' ? localStorage.getItem(getCacheKey(dayPlan.day, meal.name)) || undefined : undefined,
        isLoading: false,
        error: null,
        isOpen: false,
    }));
    
    const [mealsState, setMealsState] = useState(initialMealState);
    const lastRequestTimeRef = useRef(0);

    const handleGenerateImage = useCallback(async (index: number, prompt: string) => {
        setMealsState(prev => prev.map((mealState, i) => i === index ? { ...mealState, isLoading: true, error: null } : mealState));

        try {
            const imageUrl = await fetchImage(`${prompt}, realistic food photography, high angle, studio lighting`);
            const cacheKey = getCacheKey(dayPlan.day, prompt);
            localStorage.setItem(cacheKey, imageUrl);

            setMealsState(prev => prev.map((mealState, i) => i === index ? { ...mealState, imageUrl, isLoading: false } : mealState));
            lastRequestTimeRef.current = Date.now();

        } catch (err: any) {
            setMealsState(prev => prev.map((mealState, i) => i === index ? { ...mealState, error: err.message, isLoading: false } : mealState));
        }
    }, [dayPlan.day]); 

    const handleRegenerateClick = useCallback((index: number, mealName: string, mealPrompt: string) => {
        const timeElapsed = Date.now() - lastRequestTimeRef.current;
        if (timeElapsed < IMAGE_REQUEST_COOLDOWN) {
            const remainingTime = Math.ceil((IMAGE_REQUEST_COOLDOWN - timeElapsed) / 1000);
            setMealsState(prev => prev.map((mealState, i) => i === index ? { ...mealState, error: `Rate limit: Wait ${remainingTime}s.`, isLoading: false } : mealState));
            return;
        }

        localStorage.removeItem(getCacheKey(dayPlan.day, mealName));
        setMealsState(prev => {
            const newState = [...prev];
            newState[index] = { ...newState[index], imageUrl: undefined, error: null };
            return newState;
        });
        handleGenerateImage(index, mealPrompt);
    }, [dayPlan.day, handleGenerateImage]);

    const handleTriggerClick = (index: number, mealName: string, mealPrompt: string) => {
        const mealState = mealsState[index];
        const isCurrentlyOpen = mealState.isOpen;
        const isCached = !!mealState.imageUrl;
        
        setMealsState(prev => {
            const newState = [...prev];
            newState[index] = { ...newState[index], isOpen: !isCurrentlyOpen };
            return newState;
        });

        if (!isCurrentlyOpen && !isCached) {
            const timeElapsed = Date.now() - lastRequestTimeRef.current;
            if (timeElapsed < IMAGE_REQUEST_COOLDOWN) {
                const remainingTime = Math.ceil((IMAGE_REQUEST_COOLDOWN - timeElapsed) / 1000);
                setMealsState(prev => prev.map((state, i) => i === index ? { ...state, error: `Rate limit: Wait ${remainingTime}s.`, isLoading: false } : state));
                return;
            }
            handleGenerateImage(index, mealPrompt);
        }
    };

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="text-xl">🥗 {dayPlan.day} - Meal Plan</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <ul className="space-y-3">
                    {mealsState.map((mealState, index) => (
                        <li key={index} className="border-b border-gray-100 dark:border-gray-800 pb-3 last:border-b-0 last:pb-0">
                            <Collapsible 
                                open={mealState.isOpen}
                                onOpenChange={() => handleTriggerClick(index, mealState.name, mealState.name)}
                            >
                                <CollapsibleTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        className="w-full justify-between px-2 py-1 h-auto text-base font-semibold text-left transition-colors 
                                            hover:bg-green-50 dark:hover:bg-green-900/50 
                                            text-gray-900 dark:text-gray-100"
                                    >
                                        <span className="flex flex-col items-start">
                                            <span>{mealState.type}: {mealState.name}</span>
                                            <span className="text-xs font-normal text-muted-foreground mt-0.5">{mealState.description}</span>
                                        </span>
                                        <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${mealState.isOpen ? 'rotate-180' : 'rotate-0'}`} />
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="p-2 pb-0">
                                    <GeneratedImageDisplay
                                        imageUrl={mealState.imageUrl}
                                        isLoading={mealState.isLoading}
                                        error={mealState.error}
                                        onRegenerate={() => handleRegenerateClick(index, mealState.name, mealState.name)}
                                    />
                                </CollapsibleContent>
                            </Collapsible>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
});
DietCard.displayName = 'DietCard';


interface PlanDisplayProps {
    plan: FitnessPlan;
    profile: UserProfile;
    onRegenerate: () => void;
}

export function PlanDisplay({ plan, profile, onRegenerate }: PlanDisplayProps) {
    const [speakingPlan, setSpeakingPlan] = useState<'Workout' | 'Diet' | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleReadPlan = useCallback((section: 'Workout' | 'Diet') => {
        const synth = window.speechSynthesis;
        if (synth.speaking && speakingPlan === section) { synth.cancel(); setSpeakingPlan(null); return; }
        if (synth.speaking && speakingPlan !== section) { synth.cancel(); }

        let textToSpeak = '';
        if (section === 'Workout') {
            textToSpeak = plan.workoutPlan.map(dayPlan => {
                const exercises = dayPlan.exercises.map(ex => `${ex.name}. ${ex.sets} sets of ${ex.reps}.`).join(' ');
                return `For ${dayPlan.day}, focus on ${dayPlan.focus}. Exercises: ${exercises}.`;
            }).join(' ');
        } else if (section === 'Diet') {
            textToSpeak = plan.dietPlan.map(dayPlan => {
                const meals = dayPlan.meals.map(meal => `${meal.type}: ${meal.name}.`).join(' ');
                return `For ${dayPlan.day}, your meal plan is: ${meals}.`;
            }).join(' ');
        }
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.0; 
        utterance.onstart = () => setSpeakingPlan(section);
        utterance.onend = () => setSpeakingPlan(null);
        synth.speak(utterance);
    }, [plan.workoutPlan, plan.dietPlan, speakingPlan]);


    const renderReadButton = (section: 'Workout' | 'Diet') => {
        const isSpeaking = speakingPlan === section;
        const Icon = isSpeaking ? VolumeX : Volume2;
        const text = isSpeaking ? `Stop Reading ${section}` : `Read My ${section} Plan`;

        return (
            <Button 
                onClick={() => handleReadPlan(section)} 
                className="w-full mb-4" 
                variant={isSpeaking ? "destructive" : "outline"}
                disabled={typeof window !== 'undefined' && !('speechSynthesis' in window)}
            >
                <Icon className="w-4 h-4 mr-2" /> {text}
            </Button>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 sm:px-8 max-w-4xl relative">

            <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-2">
                Hello, {profile.name}! Your AI Plan is Ready 🎉
            </h1>
            <p className="text-center text-base sm:text-lg text-muted-foreground mb-6 px-2">
                Goal: <span className="font-semibold text-blue-500 dark:text-blue-400">{profile.goal}</span> | Level: {profile.level} | Location: {profile.location}
            </p>
            
            <Card className="mb-6 bg-yellow-50 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700 mx-auto max-w-lg"> 
                <CardContent className="p-4 text-center">
                    <p className="italic text-lg sm:text-xl break-words">"{plan.motivationQuote}"</p>
                    <span className="text-sm text-muted-foreground">— AI Coach</span>
                </CardContent>
            </Card>
            
            {/* FIX 2: Removed px-2 from the button group as it was redundant and contributing to overflow */}
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-8">
                <Button onClick={onRegenerate} variant="outline" className="w-full sm:w-auto"><RefreshCw className="w-4 h-4 mr-2" /> Regenerate Plan</Button>
                
                {isClient ? (
                    <PDFDownloadLink 
                        document={<MyPlanPDF plan={plan} profile={profile} />} 
                        fileName={`${profile.name.replace(/\s+/g, '_')}_Fitness_Plan.pdf`}
                    >
                        {({ loading }) => (
                            <Button variant="secondary" disabled={loading} className="w-full sm:w-auto"> 
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing PDF...</>
                                ) : (
                                    <><Download className="w-4 h-4 mr-2" /> Download PDF</>
                                )}
                            </Button>
                        )}
                    </PDFDownloadLink>
                ) : (
                    <Button variant="secondary" disabled className="w-full sm:w-auto"> 
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading PDF...
                    </Button>
                )}
            </div>

            <Tabs defaultValue="workout" className="w-full">
                <TabsList className="flex w-full justify-between p-1 bg-muted rounded-lg"> 
                    <TabsTrigger value="workout" className="flex-1 text-sm sm:text-base">🏋️ Workout Plan</TabsTrigger>
                    <TabsTrigger value="diet" className="flex-1 text-sm sm:text-base">🥗 Diet Plan</TabsTrigger>
                </TabsList>

                <TabsContent value="workout" id="workout-content" className="mt-4">
                    {renderReadButton('Workout')}
                    {plan.workoutPlan.map((dayPlan, index) => (
                        <WorkoutCard key={index} dayPlan={dayPlan} />
                    ))}
                </TabsContent>

                <TabsContent value="diet" id="diet-content" className="mt-4">
                    {renderReadButton('Diet')}
                    {plan.dietPlan.map((dayPlan, index) => (
                        <DietCard key={index} dayPlan={dayPlan} />
                    ))}
                </TabsContent>
            </Tabs>
            
            <Separator className="my-8" />
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl flex items-center"><Zap className="w-5 h-5 mr-2 text-green-500" /> AI Lifestyle Tips</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                        {plan.aiTips.map((tip, i) => (
                            <li key={i} className="break-words text-sm sm:text-base">{tip}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <div className="h-16"></div>
        </div>
    );
}

export { WorkoutCard, DietCard };
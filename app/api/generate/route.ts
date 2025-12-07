// src/app/api/generate/route.ts (Using Google Gemini for Structured JSON)
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { UserProfile } from '@/lib/types';

const ai = new GoogleGenAI({});

const planSchema = {
    type: 'object',
    properties: {
        motivationQuote: { type: 'string' },
        aiTips: { type: 'array', items: { type: 'string' } },
        workoutPlan: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    day: { type: 'string' },
                    focus: { type: 'string' },
                    exercises: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                sets: { type: 'number' },
                                reps: { type: 'string' },
                                rest: { type: 'string' },
                            },
                            required: ['name', 'sets', 'reps', 'rest'],
                        },
                    },
                    imageDescription: { 
                        type: 'string',
                        description: 'A concise, hyper-detailed, and visually descriptive Stable Image Core prompt (max 75 words) for a hero image representing this daily workout plan.'
                    },
                },
                required: ['day', 'focus', 'exercises', 'imageDescription'],
            },
        },
        dietPlan: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    day: { type: 'string' },
                    meals: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                type: { type: 'string', enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
                                description: { type: 'string' },
                            },
                            required: ['name', 'type', 'description'],
                        },
                    },
                    imageDescription: { 
                        type: 'string',
                        description: 'A concise, hyper-detailed, and visually descriptive Stable Image Core prompt (max 75 words) for a hero image representing this daily diet plan/main meal.'
                    },
                },
                required: ['day', 'meals', 'imageDescription'],
            },
        },
    },
    required: ['motivationQuote', 'aiTips', 'workoutPlan', 'dietPlan'],
};

export async function POST(req: Request) {
    try {
        const profile: UserProfile = await req.json();

        const systemPrompt = `You are an expert AI fitness and nutrition coach. Your sole task is to generate a comprehensive 7-day fitness plan and diet plan based on the user's profile.
        
        CRITICAL: Your entire response MUST be a single, valid JSON object that strictly adheres to the provided JSON schema. DO NOT include any text, markdown, or commentary outside of the JSON block.
        
        PLAN REQUIREMENTS:
        1. Workout Plan: Create 7 days of routines. For each daily workout, generate a concise, detailed Stable Image Core prompt (max 75 words) for the 'imageDescription' property.
        2. Diet Plan: Create 7 days of meal breakdowns. For each daily diet plan, generate a concise, detailed Stable Image Core prompt (max 75 words) for the 'imageDescription' property.
        3. Tips & Quote: Provide a specific motivational quote and three actionable tips.`;

        const userPrompt = `USER PROFILE:
        - Name: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}
        - Body: ${profile.height}cm / ${profile.weight}kg
        - Primary Goal: ${profile.goal}
        - Current Level: ${profile.level}
        - Location: ${profile.location} (Design exercises for this location)
        - Diet Preference: ${profile.diet}
        - Medical/Notes: ${profile.medicalHistory || 'None'}`;


        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'user', parts: [{ text: userPrompt }] },
            ],
            config: {
                responseMimeType: 'application/json',
                responseSchema: planSchema,
                temperature: 0.7,
            },
        });

        if (!response.text) {
            console.error('Gemini response text was empty:', response);
            return NextResponse.json({ error: 'AI failed to generate plan content.' }, { status: 500 });
        }

        const jsonText = response.text.trim();
        const cleanJsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        
        const plan = JSON.parse(cleanJsonText);
        
        return NextResponse.json(plan, { status: 200 });

    } catch (error) {
        console.error('AI Generation Error (Gemini):', error);
        return NextResponse.json({ error: 'Failed to generate plan from AI. Check Gemini key/quota.' }, { status: 500 });
    }
}
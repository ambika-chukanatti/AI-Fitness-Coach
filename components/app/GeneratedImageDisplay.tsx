// src/components/app/GeneratedImageDisplay.tsx
"use client";

import React from 'react';
import { Loader2, RefreshCcw } from 'lucide-react'; 
import { Button } from '@/components/ui/button'; 

interface ImageDisplayProps {
  imageUrl: string | undefined;
  isLoading: boolean;
  error: string | null;
  onRegenerate: () => void; 
}

export default function GeneratedImageDisplay({ imageUrl, isLoading, error, onRegenerate }: ImageDisplayProps) {

  const baseClasses = "w-full aspect-video rounded-xl flex flex-col items-center justify-center p-4 mt-4 shadow-md";

  if (imageUrl) {
    return (
      <div className={`${baseClasses} relative bg-gray-100 overflow-hidden shadow-md`}>
        <img 
          src={imageUrl} 
          alt="Visualization of exercise or meal"
          className="w-full h-full object-cover animate-in fade-in duration-500"
        />
        <button
          onClick={onRegenerate}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white/80 hover:bg-black/80 transition-colors z-10"
          title="Clear cache and regenerate"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${baseClasses} bg-gray-100 text-gray-500 shadow-inner border-2 border-dashed border-gray-200`}>
        <Loader2 className="w-10 h-10 animate-spin mb-2 text-blue-500" />
        <p className="text-sm font-medium">Creating image...</p>
        <p className="text-xs mt-1 text-center">(First time generation can take up to 30 seconds.)</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mt-4">
        <div className={`${baseClasses} bg-red-50 text-red-500 border border-red-200 shadow-none`}>
          <p className="text-sm font-bold mb-2">Could not generate image</p>
          <p className="text-xs mt-1 text-center">Error: {error}</p>
        </div>
        <Button onClick={onRegenerate} className="w-full mt-2" variant="outline">
          <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full mt-4">
        <div className={`${baseClasses} bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 shadow-none text-muted-foreground`}>
            <p className="text-sm mb-2">Tap 'Generate Image' to visualize this item.</p>
        </div>
        <Button onClick={onRegenerate} className="w-full mt-2">
            <RefreshCcw className="w-4 h-4 mr-2" /> Generate Image
        </Button>
    </div>
  );
}
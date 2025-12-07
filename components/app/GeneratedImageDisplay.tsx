"use client";

import React from 'react';
import { Loader2, RefreshCcw } from 'lucide-react'; 

interface ImageDisplayProps {
  imageUrl: string | undefined;
  isLoading: boolean;
  error: string | null;
  onRegenerate: () => void; 
}

export default function GeneratedImageDisplay({ imageUrl, isLoading, error, onRegenerate }: ImageDisplayProps) {

  if (imageUrl) {
    return (
      <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden shadow-md mt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imageUrl} 
          alt="Visualization of exercise"
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
      <div className="w-full h-64 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-500 shadow-inner border-2 border-dashed border-gray-200 mt-4">
        <Loader2 className="w-10 h-10 animate-spin mb-2 text-blue-500" />
        <p className="text-sm font-medium">Creating image...</p>
        <p className="text-xs mt-1">(First time generation takes a few seconds)</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 bg-red-50 rounded-xl flex flex-col items-center justify-center text-red-500 p-4 border border-red-200 mt-4">
        <p className="text-sm font-bold mb-2">Could not generate image</p>
        <p className="text-xs mt-1">Click the exercise name again to retry.</p>
        <p className="text-xs mt-1">Error: {error}</p>
      </div>
    );
  }

  return null;
}
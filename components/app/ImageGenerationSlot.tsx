"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCcw, ImageIcon } from 'lucide-react'; 

interface ImageSlotProps {
  prompt: string;
  altText: string;
  cacheKey: string; 
}

export default function ImageGenerationSlot({ prompt, altText, cacheKey }: ImageSlotProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false); 

  useEffect(() => {
    const cachedImage = localStorage.getItem(`image_cache_${cacheKey}`);
    if (cachedImage) {
      setImageUrl(cachedImage);
      setHasAttemptedGeneration(true); 
    }
  }, [cacheKey]); 

  const generateImage = async () => {
    setIsLoading(true);
    setError(null);
    setHasAttemptedGeneration(true); 

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      const generatedUrl = data.imageUrl;
      setImageUrl(generatedUrl);
      localStorage.setItem(`image_cache_${cacheKey}`, generatedUrl);

    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };


  if (imageUrl) {
    return (
      <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imageUrl} 
          alt={altText}
          className="w-full h-full object-cover animate-in fade-in duration-500"
        />
        <button
          onClick={() => {
            localStorage.removeItem(`image_cache_${cacheKey}`);
            setImageUrl(null);
            setHasAttemptedGeneration(false); 
          }}
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
      <div className="w-full h-64 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-500 shadow-inner border-2 border-dashed border-gray-200">
        <Loader2 className="w-10 h-10 animate-spin mb-2 text-blue-500" />
        <p className="text-sm font-medium">Creating image...</p>
        <p className="text-xs mt-1">(This takes a few seconds)</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 bg-red-50 rounded-xl flex flex-col items-center justify-center text-red-500 p-4 border border-red-200">
        <p className="text-sm font-bold mb-2">Could not generate image</p>
        <button 
          onClick={generateImage}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 rounded-lg shadow-sm hover:bg-red-100 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  if (hasAttemptedGeneration === true) {
      return (
        <div 
          onClick={generateImage}
          className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex flex-col items-center justify-center cursor-pointer group border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-300 hover:shadow-md"
        >
          <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
            <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
          </div>
          <p className="text-gray-600 font-semibold group-hover:text-blue-600">Click to Generate AI Image</p>
          <p className="text-gray-400 text-xs mt-1">Visualization based on plan</p>
        </div>
      );
  }
  
  return (
    <div className="flex justify-center pt-2">
      <button 
        onClick={generateImage}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
      >
        <ImageIcon className="w-4 h-4" /> Generate Visualization
      </button>
    </div>
  );
}
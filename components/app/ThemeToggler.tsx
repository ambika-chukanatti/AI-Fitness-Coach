'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggler() {
  const { resolvedTheme, setTheme } = useTheme();

  const isCurrentlyDark = resolvedTheme === 'dark';
  
  return (
    <div className="flex space-x-1">
      
      <Button
        onClick={() => setTheme('light')}
        variant={!isCurrentlyDark ? "default" : "ghost"} 
        size="icon"
        aria-label="Switch to Light Mode"
        className={
          !isCurrentlyDark 
            ? "bg-amber-500 hover:bg-amber-600 text-white" 
            : "hover:bg-muted-foreground/10" 
        }
      >
        <Sun className="h-5 w-5" />
      </Button>

      <Button
        onClick={() => setTheme('dark')}
        variant={isCurrentlyDark ? "default" : "ghost"} 
        size="icon"
        aria-label="Switch to Dark Mode"
        className={
          isCurrentlyDark 
            ? "bg-indigo-700 hover:bg-indigo-800 text-white" 
            : "hover:bg-muted-foreground/10" 
        }
      >
        <Moon className="h-5 w-5" />
      </Button>
      
    </div>
  );
}
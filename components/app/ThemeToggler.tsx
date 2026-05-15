'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggler() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isCurrentlyDark = resolvedTheme === 'dark';

  return (
    <div className="flex space-x-2">
      <Button
        onClick={() => setTheme('light')}
        variant={!isCurrentlyDark ? "default" : "ghost"}
        size="icon"
        aria-label="Switch to Light Mode"
        className={`w-11 h-11 ${
          !isCurrentlyDark
            ? "bg-amber-500 hover:bg-amber-600 text-white"
            : "hover:bg-muted-foreground/10"
        }`}
      >
        <Sun className="h-6 w-6" />
      </Button>

      <Button
        onClick={() => setTheme('dark')}
        variant={isCurrentlyDark ? "default" : "ghost"}
        size="icon"
        aria-label="Switch to Dark Mode"
        className={`w-11 h-11 ${
          isCurrentlyDark
            ? "bg-indigo-700 hover:bg-indigo-800 text-white"
            : "hover:bg-muted-foreground/10"
        }`}
      >
        <Moon className="h-6 w-6" />
      </Button>
    </div>
  );
}
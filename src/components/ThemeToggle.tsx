import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

/** Light/dark toggle. Renders a stable placeholder until mounted to avoid hydration/flash mismatches. */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary/60 text-foreground transition-colors hover:bg-secondary hover:text-primary ${className}`}
    >
      {mounted && (
        <>
          <Sun className={`absolute h-4 w-4 transition-all duration-300 ${isDark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'}`} />
          <Moon className={`absolute h-4 w-4 transition-all duration-300 ${isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'}`} />
        </>
      )}
    </button>
  );
}

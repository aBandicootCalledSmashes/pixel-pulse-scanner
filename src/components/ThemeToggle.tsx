
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize theme based on localStorage or system preference
  useEffect(() => {
    // Check local storage first
    const savedTheme = localStorage.getItem("theme");
    let prefersDark;
    
    if (savedTheme) {
      prefersDark = savedTheme === "dark";
    } else {
      // Fall back to system preference
      prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    
    setIsDarkMode(prefersDark);
    
    // Apply the theme
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Update localStorage
    localStorage.setItem("theme", newMode ? "dark" : "light");
    
    // Toggle dark class on root element
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-9 h-9"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-yellow-300" />
      ) : (
        <Moon className="h-5 w-5 text-purple-600" />
      )}
      <span className="sr-only">{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
    </Button>
  );
}

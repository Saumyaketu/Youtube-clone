"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { getUserLocation } from "../lib/location";

type ThemeMode = "auto" | "light" | "dark";

interface CustomThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

const SOUTH_INDIAN_STATES = [
  "tamil nadu",
  "kerala",
  "karnataka",
  "andhra pradesh",
  "telangana",
];

function ThemeLogic({ mode }: { mode: ThemeMode }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    let cancelled = false;
    const applyTheme = async () => {
      if (mode === "light") {
        setTheme("light");
        return;
      }
      if (mode === "dark") {
        setTheme("dark");
        return;
      }

      const { state } = await getUserLocation();
      if (cancelled) return;

      const currentHour = new Date().getHours();
      const isTimeBetween10And12 = currentHour >= 10 && currentHour < 12;
      const isSouthIndia = state && SOUTH_INDIAN_STATES.includes(state);

      const shouldBeLight = isSouthIndia && isTimeBetween10And12;
      setTheme(shouldBeLight ? "light" : "dark");
    };

    applyTheme();

    return () => {
      cancelled = true;
    };
  }, [mode, setTheme]);

  return null;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("auto");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("youtube-theme-preference") as ThemeMode;
    if (stored === "light" || stored === "dark" || stored === "auto") {
      setModeState(stored);
    }
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("youtube-theme-preference", newMode);
  };

  return (
    <CustomThemeContext.Provider value={{ mode, setMode }}>
      <NextThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {mounted && <ThemeLogic mode={mode} />}
        {children}
      </NextThemeProvider>
    </CustomThemeContext.Provider>
  );
}

export const useCustomTheme = () => {
  const context = useContext(CustomThemeContext);
  if (!context) throw new Error("useCustomTheme must be used within ThemeProvider");
  return context;
};

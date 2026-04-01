"use client";
import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";

const SOUTH_INDIAN_STATES = [
  "tamil nadu",
  "kerala",
  "karnataka",
  "andhra pradesh",
  "telangana",
];

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [initialTheme, setInitialTheme] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const detect = async () => {
      try {
        const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
        const data = await res.json();
        const userState = data.region ? data.region.toLowerCase() : "unknown";

        const currentHour = new Date().getHours();
        const isTimeBetween10And12 = currentHour >= 10 && currentHour < 12;
        const isSouthIndia = userState && SOUTH_INDIAN_STATES.includes(userState);

        const shouldBeLight = isSouthIndia && isTimeBetween10And12;
        if (!cancelled) setInitialTheme(shouldBeLight ? "light" : "dark");
      } catch (e) {
        if (!cancelled) setInitialTheme("dark");
      }
    };
    detect();
    return () => {
      cancelled = true;
    };
  }, []);

  const themeFallback = initialTheme ?? "dark";

  return (
    <NextThemeProvider attribute="class" defaultTheme={themeFallback} enableSystem={false}>
      {children}
    </NextThemeProvider>
  );
}

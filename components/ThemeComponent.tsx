"use client";

import { useTheme } from "next-themes";
import { SunMoon } from "lucide-react";

interface ThemeComponentProps {
  className?: Array<string>;
}

export default function ThemeComponent(props: ThemeComponentProps) {
  const { theme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }
  return (
    <button
      type="button"
      className={`
        flex justify-between items-center 
        ${props.className}`}
      onClick={toggleTheme}
    >
      <SunMoon />
    </button>
  );
}

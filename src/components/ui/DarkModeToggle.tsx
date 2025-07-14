"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { toggleDarkMode } from "@/store/slices/uiSlice";
import { useEffect } from "react";

export default function DarkModeToggle() {
  const dispatch = useDispatch<AppDispatch>();
  const { darkMode } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    // Load dark mode preference from localStorage on mount
    if (typeof window !== "undefined") {
      const savedDarkMode = localStorage.getItem("darkMode");
      if (savedDarkMode !== null) {
        const isDark = savedDarkMode === "true";
        if (isDark !== darkMode) {
          dispatch({ type: "ui/setDarkMode", payload: isDark });
        }
      }
    }
  }, [dispatch, darkMode]);

  return (
    <button
      onClick={() => dispatch(toggleDarkMode())}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      style={{
        backgroundColor: darkMode ? "#3b82f6" : "#d1d5db",
      }}
      aria-label="Toggle dark mode"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          darkMode ? "translate-x-6" : "translate-x-1"
        }`}
      />
      <span className="sr-only">
        {darkMode ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </button>
  );
}

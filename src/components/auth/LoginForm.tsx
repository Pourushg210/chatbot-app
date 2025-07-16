"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { setAuth } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      dispatch(setAuth({ token: data.token, role: data.role, username }));
      if (data.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/chat");
      }
    } catch (err: unknown) {
      let message = "Login failed";
      if (err instanceof Error) message = err.message;
      setError(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded shadow"
    >
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-700 dark:text-gray-200">
        Login
      </h2>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <div className="mb-4">
        <label className="block mb-1 text-gray-700 dark:text-gray-200">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border rounded text-gray-900 dark:text-white"
          required
        />
      </div>
      <label className="block mb-1 text-gray-700 dark:text-gray-200">
        Password
      </label>
      <div className="mb-6 relative flex items-center">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded text-gray-900 dark:text-white pr-10"
          required
        />
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-0 bottom-0 my-auto text-gray-500 dark:text-gray-300 focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? (
            // Eye-off SVG (original, h-5 w-5)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12C4.5 7.5 8.25 4.5 12 4.5s7.5 3 9.75 7.5c-2.25 4.5-6 7.5-9.75 7.5S4.5 16.5 2.25 12z"
              />
            </svg>
          ) : (
            // Heroicons Eye (larger)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12C4.5 7.5 8.25 4.5 12 4.5s7.5 3 9.75 7.5c-2.25 4.5-6 7.5-9.75 7.5S4.5 16.5 2.25 12z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18"
              />
            </svg>
          )}
        </button>
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
      >
        Login
      </button>
    </form>
  );
}

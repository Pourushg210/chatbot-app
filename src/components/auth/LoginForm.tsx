"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { setAuth } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import PasswordEye from "../icons/PasswordEye";
import Image from "next/image";

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
    <div className="flex flex-col md:flex-row min-h-screen items-stretch justify-center bg-white dark:bg-gray-900 relative">
      {/* Absolutely positioned Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 absolute top-4 left-2 md:top-6 md:left-4 z-10"
      >
        <span className="mr-1 text-lg">←</span>
        <span>Back</span>
      </button>
      {/* Image Section */}
      <div className="w-full md:w-1/2 h-64 md:h-screen relative flex justify-center items-center p-0 md:p-0">
        <Image
          src="/images/login-visuals.png"
          alt="Login Visual"
          fill
          className="object-contain md:rounded-l-lg"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ position: "absolute" }}
        />
      </div>
      {/* Form Section */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-6 md:p-12 bg-gray-100 dark:bg-gray-800 md:rounded-r-lg">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
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
              <PasswordEye showPassword={showPassword} />
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

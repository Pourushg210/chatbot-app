"use client";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-2 text-red-600">Access Denied</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          You do not have permission to view this page.
        </p>
        <a href="/auth/login" className="text-indigo-600 hover:underline">
          Return to Login
        </a>
      </div>
    </div>
  );
}

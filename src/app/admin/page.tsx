"use client";

import ProtectedRoute from "@/components/ui/ProtectedRoute";
import Dashboard from "@/components/admin/Dashboard";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Dashboard />
    </ProtectedRoute>
  );
}

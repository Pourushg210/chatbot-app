"use client";

import ProtectedRoute from "@/components/ui/ProtectedRoute";
import ChatInterface from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <ChatInterface />
    </ProtectedRoute>
  );
}

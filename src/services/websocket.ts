import { io, Socket } from "socket.io-client";
import { store } from "../store/store";
import {
  addMessage,
  setTyping,
  setError,
  setConnectionStatus,
} from "../store/slices/chatSlice";

interface WebSocketMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: string;
  type: "text" | "voice";
  conversationId: string;
  metadata?: {
    questionId?: string;
    answer?: string;
    confidence?: number;
  };
}

interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId: string, token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3002",
      {
        auth: {
          token,
          userId,
        },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      }
    );

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      store.dispatch(setError(null));
      store.dispatch(setConnectionStatus("connected"));
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      store.dispatch(setConnectionStatus("disconnected"));
      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      this.reconnectAttempts++;
      store.dispatch(setConnectionStatus("error"));

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        store.dispatch(
          setError("Failed to connect to chat server. Please refresh the page.")
        );
      }
    });

    // Chat events
    this.socket.on("message", (message: WebSocketMessage) => {
      console.log("Received message:", message);
      store.dispatch(addMessage(message));
    });

    this.socket.on("typing", (data: TypingIndicator) => {
      console.log("Typing indicator:", data);
      store.dispatch(setTyping(data.isTyping));
    });

    this.socket.on("message_delivered", (messageId: string) => {
      console.log("Message delivered:", messageId);
      // Could update message status in the future
    });

    this.socket.on("error", (error: string) => {
      console.error("WebSocket error:", error);
      store.dispatch(setError(error));
    });
  }

  sendMessage(message: Omit<WebSocketMessage, "id" | "timestamp">) {
    if (!this.socket?.connected) {
      store.dispatch(setError("Not connected to chat server"));
      return false;
    }

    this.socket.emit("send_message", message);
    return true;
  }

  sendTypingIndicator(conversationId: string, isTyping: boolean) {
    if (!this.socket?.connected) return;

    this.socket.emit("typing", {
      conversationId,
      isTyping,
    });
  }

  joinConversation(conversationId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("join_conversation", { conversationId });
  }

  leaveConversation(conversationId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("leave_conversation", { conversationId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
export default websocketService;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: string;
  type: "text" | "voice";
  metadata?: {
    questionId?: string;
    answer?: string;
    confidence?: number;
  };
}

export interface Conversation {
  id: string;
  userId: string;
  botConfigurationId: string;
  messages: Message[];
  status: "active" | "completed" | "abandoned";
  startedAt: string;
  endedAt?: string;
  sessionLength?: number;
}

interface ChatState {
  currentConversation: Conversation | null;
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
  voiceEnabled: boolean;
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
}

const initialState: ChatState = {
  currentConversation: null,
  conversations: [],
  isLoading: false,
  error: null,
  isTyping: false,
  voiceEnabled: false,
  isConnected: false,
  connectionStatus: "disconnected",
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    startConversation: (state, action: PayloadAction<Conversation>) => {
      state.currentConversation = action.payload;
      state.conversations.push(action.payload);
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      if (state.currentConversation) {
        state.currentConversation.messages.push(action.payload);
      }
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    endConversation: (state) => {
      if (state.currentConversation) {
        state.currentConversation.status = "completed";
        state.currentConversation.endedAt = new Date().toISOString();
        state.currentConversation = null;
      }
    },
    setVoiceEnabled: (state, action: PayloadAction<boolean>) => {
      state.voiceEnabled = action.payload;
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
    },
    setConnectionStatus: (
      state,
      action: PayloadAction<
        "connecting" | "connected" | "disconnected" | "error"
      >
    ) => {
      state.connectionStatus = action.payload;
      state.isConnected = action.payload === "connected";
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      state.connectionStatus = action.payload ? "connected" : "disconnected";
    },
  },
});

export const {
  setLoading,
  setError,
  setConversations,
  startConversation,
  addMessage,
  setTyping,
  endConversation,
  setVoiceEnabled,
  clearCurrentConversation,
  setConnectionStatus,
  setConnected,
} = chatSlice.actions;

export default chatSlice.reducer;

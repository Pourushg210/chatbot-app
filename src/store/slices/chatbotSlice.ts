import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface QuestionFlow {
  id: string;
  question: string;
  type: "text" | "multiple_choice" | "yes_no";
  options?: string[];
  required: boolean;
  nextStep?: string;
  triggers?: string[];
}

export interface BotConfiguration {
  id: string;
  name: string;
  description: string;
  flows: QuestionFlow[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChatbotState {
  configurations: BotConfiguration[];
  currentConfiguration: BotConfiguration | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatbotState = {
  configurations: [
    {
      id: "1",
      name: "Customer Support Bot",
      description:
        "Handles common customer support inquiries and ticket creation",
      flows: [
        {
          id: "1-1",
          question: "What type of issue are you experiencing?",
          type: "multiple_choice",
          options: [
            "Technical Problem",
            "Billing Issue",
            "Account Access",
            "General Inquiry",
          ],
          required: true,
        },
        {
          id: "1-2",
          question: "Please describe your issue in detail",
          type: "text",
          required: true,
        },
        {
          id: "1-3",
          question: "What is your priority level?",
          type: "multiple_choice",
          options: ["Low", "Medium", "High", "Critical"],
          required: true,
        },
      ],
      isActive: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "2",
      name: "Lead Generation Bot",
      description: "Collects lead information and qualifies prospects",
      flows: [
        {
          id: "2-1",
          question: "What is your company size?",
          type: "multiple_choice",
          options: [
            "1-10 employees",
            "11-50 employees",
            "51-200 employees",
            "200+ employees",
          ],
          required: true,
        },
        {
          id: "2-2",
          question: "What is your primary business need?",
          type: "text",
          required: true,
        },
        {
          id: "2-3",
          question: "Are you the decision maker?",
          type: "yes_no",
          required: true,
        },
      ],
      isActive: true,
      createdAt: "2024-01-02T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    },
  ],
  currentConfiguration: null,
  isLoading: false,
  error: null,
};

const chatbotSlice = createSlice({
  name: "chatbot",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setConfigurations: (state, action: PayloadAction<BotConfiguration[]>) => {
      state.configurations = action.payload;
    },
    addConfiguration: (state, action: PayloadAction<BotConfiguration>) => {
      state.configurations.push(action.payload);
    },
    updateConfiguration: (state, action: PayloadAction<BotConfiguration>) => {
      const index = state.configurations.findIndex(
        (config) => config.id === action.payload.id
      );
      if (index !== -1) {
        state.configurations[index] = action.payload;
      }
    },
    deleteConfiguration: (state, action: PayloadAction<string>) => {
      state.configurations = state.configurations.filter(
        (config) => config.id !== action.payload
      );
    },
    setCurrentConfiguration: (
      state,
      action: PayloadAction<BotConfiguration | null>
    ) => {
      state.currentConfiguration = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setConfigurations,
  addConfiguration,
  updateConfiguration,
  deleteConfiguration,
  setCurrentConfiguration,
} = chatbotSlice.actions;

export default chatbotSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface QuestionOption {
  label: string;
  value: string;
  next?: string;
}

export interface QuestionFlow {
  id: string;
  question: string;
  type: "text" | "multiple_choice" | "yes_no";
  options?: QuestionOption[];
  required: boolean;
  next?: string | { [answer: string]: string };
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
            { label: "Technical Problem", value: "Technical Problem" },
            { label: "Billing Issue", value: "Billing Issue" },
            { label: "Account Access", value: "Account Access" },
            { label: "General Inquiry", value: "General Inquiry" },
          ],
          required: true,
          next: {
            "Technical Problem": "1-2",
            "Billing Issue": "1-2",
            "Account Access": "1-2",
            "General Inquiry": "1-3",
          },
        },
        {
          id: "1-2",
          question: "Please describe your issue in detail",
          type: "text",
          required: true,
          next: {
            "": "1-3",
          },
        },
        {
          id: "1-3",
          question: "What is your priority level?",
          type: "multiple_choice",
          options: [
            { label: "Low", value: "Low" },
            { label: "Medium", value: "Medium" },
            { label: "High", value: "High" },
            { label: "Critical", value: "Critical" },
          ],
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
            { label: "1-10 employees", value: "1-10 employees" },
            { label: "11-50 employees", value: "11-50 employees" },
            { label: "51-200 employees", value: "51-200 employees" },
            { label: "200+ employees", value: "200+ employees" },
          ],
          required: true,
          next: {
            "1-10 employees": "2-2",
            "11-50 employees": "2-2",
            "51-200 employees": "2-2",
            "200+ employees": "2-2",
          },
        },
        {
          id: "2-2",
          question: "What is your primary business need?",
          type: "text",
          required: true,
          next: {
            "": "2-3",
          },
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

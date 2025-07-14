import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ConversationMetrics {
  totalConversations: number;
  averageSessionLength: number;
  completionRate: number;
  dropOffRate: number;
}

export interface QuestionAnalytics {
  questionId: string;
  question: string;
  timesAsked: number;
  timesAnswered: number;
  averageResponseTime: number;
  successRate: number;
}

export interface TimeSeriesData {
  date: string;
  conversations: number;
  messages: number;
  uniqueUsers: number;
}

export interface AnalyticsData {
  metrics: ConversationMetrics;
  topQuestions: QuestionAnalytics[];
  timeSeriesData: TimeSeriesData[];
  recentActivity: {
    conversations: number;
    messages: number;
    activeUsers: number;
  };
}

interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  dateRange: {
    start: string;
    end: string;
  };
}

const initialState: AnalyticsState = {
  data: null,
  isLoading: false,
  error: null,
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    end: new Date().toISOString(),
  },
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setAnalyticsData: (state, action: PayloadAction<AnalyticsData>) => {
      state.data = action.payload;
    },
    setDateRange: (
      state,
      action: PayloadAction<{ start: string; end: string }>
    ) => {
      state.dateRange = action.payload;
    },
    updateMetrics: (
      state,
      action: PayloadAction<Partial<ConversationMetrics>>
    ) => {
      if (state.data) {
        state.data.metrics = { ...state.data.metrics, ...action.payload };
      }
    },
    clearAnalytics: (state) => {
      state.data = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setAnalyticsData,
  setDateRange,
  updateMetrics,
  clearAnalytics,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;

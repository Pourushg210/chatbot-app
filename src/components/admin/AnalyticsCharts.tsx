"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsCharts() {
  const [activeChart, setActiveChart] = useState("overview");

  const chartTabs = [
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "conversations", name: "Conversations", icon: "💬" },
    { id: "questions", name: "Questions", icon: "❓" },
    { id: "performance", name: "Performance", icon: "📈" },
  ];

  // Mock data for demonstration
  const mockTimeSeriesData = [
    { date: "2024-01-01", conversations: 45, messages: 234, uniqueUsers: 32 },
    { date: "2024-01-02", conversations: 52, messages: 287, uniqueUsers: 38 },
    { date: "2024-01-03", conversations: 48, messages: 256, uniqueUsers: 35 },
    { date: "2024-01-04", conversations: 61, messages: 312, uniqueUsers: 42 },
    { date: "2024-01-05", conversations: 55, messages: 298, uniqueUsers: 39 },
    { date: "2024-01-06", conversations: 67, messages: 345, uniqueUsers: 45 },
    { date: "2024-01-07", conversations: 73, messages: 378, uniqueUsers: 51 },
  ];

  const mockTopQuestions = [
    {
      question: "How do I reset my password?",
      timesAsked: 156,
      successRate: 89,
    },
    {
      question: "What are your business hours?",
      timesAsked: 134,
      successRate: 95,
    },
    { question: "How can I contact support?", timesAsked: 98, successRate: 92 },
    { question: "Where is my order?", timesAsked: 87, successRate: 78 },
    {
      question: "How do I cancel my subscription?",
      timesAsked: 76,
      successRate: 85,
    },
  ];

  const mockConversationMetrics = {
    totalConversations: 1247,
    averageSessionLength: 4.2,
    completionRate: 78.5,
    dropOffRate: 21.5,
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Chart Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeChart === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        {activeChart === "overview" && (
          <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-600">
                  Total Conversations
                </h3>
                <p className="text-2xl font-bold text-blue-900">
                  {mockConversationMetrics.totalConversations}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-600">
                  Avg Session Length
                </h3>
                <p className="text-2xl font-bold text-green-900">
                  {mockConversationMetrics.averageSessionLength}m
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-600">
                  Completion Rate
                </h3>
                <p className="text-2xl font-bold text-purple-900">
                  {mockConversationMetrics.completionRate}%
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-red-600">
                  Drop-off Rate
                </h3>
                <p className="text-2xl font-bold text-red-900">
                  {mockConversationMetrics.dropOffRate}%
                </p>
              </div>
            </div>

            {/* Time Series Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Conversation Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockTimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="conversations"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="messages"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="uniqueUsers"
                    stroke="#ffc658"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeChart === "conversations" && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Daily Conversation Volume
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockTimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="conversations"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Messages per Conversation
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockTimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeChart === "questions" && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Top Questions Asked
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockTopQuestions} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="question" type="category" width={200} />
                  <Tooltip />
                  <Bar dataKey="timesAsked" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Question Success Rates
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockTopQuestions}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ question, successRate }) =>
                      `${question}: ${successRate}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="successRate"
                  >
                    {mockTopQuestions.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeChart === "performance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Completion vs Drop-off
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Completed",
                          value: mockConversationMetrics.completionRate,
                        },
                        {
                          name: "Dropped",
                          value: mockConversationMetrics.dropOffRate,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#00C49F" />
                      <Cell fill="#FF8042" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Session Length Distribution
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      { range: "0-2min", count: 45 },
                      { range: "2-5min", count: 78 },
                      { range: "5-10min", count: 34 },
                      { range: "10+min", count: 12 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

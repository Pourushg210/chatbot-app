"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { addMessage, startConversation } from "@/store/slices/chatSlice";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useRouter } from "next/navigation";

export default function WebSocketTest() {
  const router = useRouter();
  const [inputMessage, setInputMessage] = useState("");
  const [testConversationId] = useState("test-conversation-" + Date.now());

  const dispatch = useDispatch<AppDispatch>();
  const { currentConversation, isConnected, connectionStatus } = useSelector(
    (state: RootState) => state.chat
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { sendMessage, sendTypingIndicator } = useWebSocket();

  useEffect(() => {
    // Create a test conversation if none exists
    if (!currentConversation && isAuthenticated) {
      const conversation = {
        id: testConversationId,
        userId: "test-user",
        botConfigurationId: "test-config",
        messages: [],
        status: "active" as const,
        startedAt: new Date().toISOString(),
      };
      dispatch(startConversation(conversation));
    }
  }, [currentConversation, isAuthenticated, dispatch, testConversationId]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !currentConversation) return;

    const message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user" as const,
      timestamp: new Date().toISOString(),
      type: "text" as const,
    };

    dispatch(addMessage(message));

    // Send via WebSocket
    sendMessage({
      content: inputMessage,
      sender: "user",
      type: "text",
      conversationId: currentConversation.id,
    });

    setInputMessage("");
  };

  const handleTyping = (isTyping: boolean) => {
    if (currentConversation) {
      sendTypingIndicator(currentConversation.id, isTyping);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mb-4"
        >
          ← Home
        </button>
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            WebSocket Test
          </h1>

          {/* Connection Status */}
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Connection Status
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {connectionStatus}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Conversation ID: {currentConversation?.id || "None"}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="mb-6 h-96 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Messages
            </h2>
            {currentConversation?.messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white ml-auto max-w-xs"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white max-w-xs"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
            {currentConversation?.messages.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center">
                No messages yet. Start typing to test WebSocket functionality!
              </p>
            )}
          </div>

          {/* Input */}
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !isConnected}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>

          {/* Test Controls */}
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Test Controls
            </h3>
            <div className="flex space-x-4">
              <button
                onClick={() => handleTyping(true)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Start Typing
              </button>
              <button
                onClick={() => handleTyping(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Stop Typing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

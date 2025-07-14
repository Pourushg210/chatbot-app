"use client";

import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  addMessage,
  setTyping,
  startConversation,
} from "@/store/slices/chatSlice";
import { useWebSocket } from "@/hooks/useWebSocket";
import voiceService from "@/services/voiceService";
import VoiceSettings from "./VoiceSettings";
import { useRouter } from "next/navigation";

export default function ChatInterface() {
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { currentConversation, isTyping, isConnected, connectionStatus } =
    useSelector((state: RootState) => state.chat);
  const { currentConfiguration } = useSelector(
    (state: RootState) => state.chatbot
  );
  const { sendMessage: sendWebSocketMessage } = useWebSocket();
  const router = useRouter();
  const { role } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check if Web Speech API is supported
    setVoiceSupported(voiceService.isSupported());
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    console.log("Sending message:", inputMessage);
    console.log("Current conversation:", currentConversation);
    console.log("WebSocket connected:", isConnected);

    // Create conversation if it doesn't exist
    let conversationToUse = currentConversation;
    if (!currentConversation) {
      console.log("Creating new conversation");
      const newConversation = {
        id: `conv-${Date.now()}`,
        userId: "user-1",
        botConfigurationId: currentConfiguration?.id || "default",
        messages: [],
        status: "active" as const,
        startedAt: new Date().toISOString(),
      };
      dispatch(startConversation(newConversation));
      conversationToUse = newConversation;
    }

    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user" as const,
      timestamp: new Date().toISOString(),
      type: "text" as const,
    };

    console.log("Dispatching user message:", userMessage);
    dispatch(addMessage(userMessage));

    // Send message via WebSocket if connected
    if (isConnected && conversationToUse) {
      console.log("Sending via WebSocket");
      sendWebSocketMessage({
        content: inputMessage,
        sender: "user",
        type: "text",
        conversationId: conversationToUse.id,
      });
    } else {
      console.log(
        "WebSocket not connected or no conversation - message will still be displayed locally"
      );
    }

    setInputMessage("");

    // Simulate bot response
    dispatch(setTyping(true));
    setTimeout(() => {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        content: `Thanks for your message: "${inputMessage}". How can I help you further?`,
        sender: "bot" as const,
        timestamp: new Date().toISOString(),
        type: "text" as const,
      };
      console.log("Dispatching bot message:", botMessage);
      dispatch(addMessage(botMessage));
      dispatch(setTyping(false));
    }, 1500);
  };

  const handleVoiceInput = () => {
    if (!voiceSupported) return;

    if (!isListening) {
      setIsListening(true);
      setInterimTranscript("");

      voiceService.startListening(
        (transcript, isFinal) => {
          if (isFinal) {
            setInputMessage(transcript);
            setIsListening(false);
            setInterimTranscript("");
          } else {
            setInterimTranscript(transcript);
          }
        },
        (error) => {
          console.error("Voice recognition error:", error);
          setIsListening(false);
          setInterimTranscript("");
        },
        () => {
          console.log("Voice recognition started");
        },
        () => {
          setIsListening(false);
          setInterimTranscript("");
        }
      );
    } else {
      voiceService.stopListening();
      setIsListening(false);
      setInterimTranscript("");
    }
  };

  const handleSpeakMessage = async (
    message: string,
    sender: "user" | "bot"
  ) => {
    if (!voiceSupported) return;

    setIsSpeaking(true);
    try {
      await voiceService.speakMessage(message, sender);
    } catch (error) {
      console.error("Speech synthesis error:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currentConfiguration?.name || "Chatbot Assistant"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentConfiguration?.description || "How can I help you today?"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isTyping ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            ></span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isTyping ? "Typing..." : "Online"}
            </span>
            <div className="flex items-center space-x-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {connectionStatus}
              </span>
            </div>
            {role === "admin" && (
              <button
                onClick={() => router.push("/admin")}
                className="ml-4 px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Admin Mode
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {currentConversation?.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm">{message.content}</p>
                {voiceSupported && (
                  <button
                    onClick={() =>
                      handleSpeakMessage(message.content, message.sender)
                    }
                    disabled={isSpeaking}
                    className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Speak message"
                  >
                    {isSpeaking ? "🔊" : "🔊"}
                  </button>
                )}
              </div>
              <p
                className={`text-xs mt-1 ${
                  message.sender === "user"
                    ? "text-indigo-200"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {interimTranscript && (
          <div className="flex justify-end">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-indigo-400 text-white">
              <p className="text-sm italic">{interimTranscript}</p>
              <p className="text-xs mt-1 text-indigo-200">Listening...</p>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows={1}
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>

          <div className="flex items-center space-x-2">
            {voiceSupported && (
              <>
                <button
                  onClick={handleVoiceInput}
                  disabled={isListening}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  title="Voice input"
                >
                  {isListening ? "🎤" : "🎤"}
                </button>
                <button
                  onClick={() => setShowVoiceSettings(true)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Voice settings"
                >
                  ⚙️
                </button>
              </>
            )}

            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
            <button
              onClick={() => {
                setInputMessage("Test message");
                setTimeout(() => handleSendMessage(), 100);
              }}
              className="px-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
              title="Test message sending"
            >
              Test
            </button>
          </div>
        </div>
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettings
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
      />
    </div>
  );
}

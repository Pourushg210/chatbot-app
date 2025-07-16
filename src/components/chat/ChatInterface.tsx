"use client";

import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import VoiceSettings from "./VoiceSettings";
import { useRouter } from "next/navigation";
import voiceService from "@/services/voiceService";
import { useWebSocket } from "@/hooks/useWebSocket";
import { LogOut } from "lucide-react";

export default function ChatInterface() {
  const [inputMessage, setInputMessage] = useState("");
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { currentConversation, isTyping, isConnected } = useSelector(
    (state: RootState) => state.chat
  );
  const { currentConfiguration, configurations } = useSelector(
    (state: RootState) => state.chatbot
  );
  // Use the first active configuration as default if none selected
  const botConfig =
    currentConfiguration ||
    configurations.find((cfg) => cfg.isActive) ||
    configurations[0];
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [chatHistory, setChatHistory] = useState<
    { sender: "bot" | "user"; content: string; id: string }[]
  >([]);
  const [sessionEnded, setSessionEnded] = useState(false);
  const router = useRouter();
  const { role } = useSelector((state: RootState) => state.auth);
  const {
    isConnected: wsIsConnected,
    sendMessage,
    sendTypingIndicator,
  } = useWebSocket();

  useEffect(() => {
    // Check if Web Speech API is supported
    // setVoiceSupported(voiceService.isSupported()); // This line was removed
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  useEffect(() => {
    // On mount or new session, show the first unanswered question
    if (botConfig && botConfig.flows.length > 0 && chatHistory.length === 0) {
      setCurrentStep(0);
      setAnswers({});
      setSessionEnded(false);
      setChatHistory([
        {
          sender: "bot",
          content: botConfig.flows[0].question,
          id: botConfig.flows[0].id,
        },
      ]);
    }
  }, [botConfig, chatHistory.length]);

  const handleUserAnswer = (answer: string) => {
    if (!botConfig || sessionEnded) return;
    const flow = botConfig.flows[currentStep];
    if (answers[flow.id]) return;
    if (flow.required && !answer.trim()) return;
    setAnswers((prev) => ({ ...prev, [flow.id]: answer }));
    setChatHistory((prev) => [
      ...prev,
      { sender: "user", content: answer, id: `user-${flow.id}` },
    ]);
    // Send message via WebSocket if connected and conversation exists
    if (wsIsConnected && currentConversation) {
      sendMessage({
        content: answer,
        sender: "user",
        type: "text",
        conversationId: currentConversation.id,
      });
    }
    // Find next unanswered question
    let nextStep = currentStep + 1;
    while (
      nextStep < botConfig.flows.length &&
      answers[botConfig.flows[nextStep].id]
    ) {
      nextStep++;
    }
    if (nextStep < botConfig.flows.length) {
      setTimeout(() => {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "bot",
            content: botConfig.flows[nextStep].question,
            id: botConfig.flows[nextStep].id,
          },
        ]);
        setCurrentStep(nextStep);
      }, 600);
    } else {
      // End session
      setTimeout(() => {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "bot",
            content:
              "Thank you! Your responses have been submitted. You will be contacted shortly.You can click the button below to start a new session for other questions.\nSession has ended.",
            id: "bot-end",
          },
        ]);
        setSessionEnded(true);
      }, 600);
    }
    setInputMessage("");
  };

  const handleNewSession = () => {
    setAnswers({});
    setChatHistory([]);
    setCurrentStep(0);
    setSessionEnded(false);
  };

  // Voice input handlers
  const handleVoiceInput = () => {
    if (!isListening) {
      setIsListening(true);
      setInterimTranscript("");
      voiceService.startListening(
        (transcript, isFinal) => {
          setInputMessage(transcript);
          setInterimTranscript(isFinal ? "" : transcript);
        },
        () => {
          setIsListening(false);
          setInterimTranscript("");
        },
        () => setIsListening(true),
        () => setIsListening(false)
      );
    } else {
      voiceService.stopListening();
      setIsListening(false);
      setInterimTranscript("");
    }
  };

  // Voice output handler
  const handleSpeakBotMessage = async () => {
    const lastBotMsg = [...chatHistory]
      .reverse()
      .find((msg) => msg.sender === "bot");
    if (lastBotMsg) {
      setIsSpeaking(true);
      try {
        await voiceService.speakMessage(lastBotMsg.content, "bot");
      } catch {}
      setIsSpeaking(false);
    }
  };

  const handleLogout = () => {
    router.push("/auth/login");
  };

  // Render input based on current question type
  let inputArea = null;
  if (botConfig && currentStep < botConfig.flows.length && !sessionEnded) {
    const flow = botConfig.flows[currentStep];
    if (answers[flow.id]) {
      // Already answered, skip input
      inputArea = null;
    } else if (flow.type === "multiple_choice" && flow.options) {
      inputArea = (
        <div className="flex flex-wrap gap-2 mt-2">
          {flow.options.map((opt) => (
            <button
              key={opt.value || opt.label}
              onClick={() => handleUserAnswer(opt.label)}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    } else if (flow.type === "yes_no") {
      inputArea = (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => handleUserAnswer("Yes")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Yes
          </button>
          <button
            onClick={() => handleUserAnswer("No")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            No
          </button>
        </div>
      );
    } else {
      inputArea = (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputMessage.trim() || !flow.required)
              handleUserAnswer(inputMessage.trim());
          }}
          className="flex gap-2 mt-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              if (wsIsConnected && currentConversation) {
                sendTypingIndicator(currentConversation.id, true);
              }
            }}
            className="flex-1 px-4 py-2 border rounded text-gray-900 dark:text-white"
            placeholder={
              isListening
                ? interimTranscript || "Listening..."
                : "Type your answer..."
            }
            required={flow.required}
            disabled={sessionEnded}
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`px-3 py-2 rounded ${
              isListening
                ? "bg-yellow-400 text-black"
                : "bg-gray-200 text-gray-700"
            }`}
            title={isListening ? "Stop Listening" : "Start Voice Input"}
            disabled={sessionEnded}
          >
            {isListening ? "🎤..." : "🎤"}
          </button>
          <button
            type="button"
            onClick={handleSpeakBotMessage}
            className={`px-3 py-2 rounded ${
              isSpeaking
                ? "bg-blue-400 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            title="Play last bot message"
            disabled={sessionEnded || isSpeaking}
          >
            {isSpeaking ? "🔊..." : "🔊"}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            disabled={sessionEnded}
          >
            Send
          </button>
          <button
            type="button"
            onClick={() => setShowVoiceSettings(true)}
            className="px-3 py-2 rounded bg-gray-200 text-gray-700 ml-1"
            title="Voice Settings"
          >
            ⚙️
          </button>
        </form>
      );
    }
  } else if (sessionEnded) {
    inputArea = (
      <div className="flex flex-col items-center gap-2">
        <span className="text-gray-500">Session has ended.</span>
        <button
          onClick={handleNewSession}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Start New Session
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {botConfig?.name || "Chatbot Assistant"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {botConfig?.description || "How can I help you today?"}
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
                {isConnected ? "Connected" : "Disconnected"}
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
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800 rounded-full transition"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      {/* Chat bubbles */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Input area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        {inputArea}
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettings
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import voiceService from "@/services/voiceService";

export default function VoiceTest() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [testText, setTestText] = useState(
    "Hello, this is a test of the voice synthesis system."
  );
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [selectedVoice, setSelectedVoice] = useState("default");
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [language, setLanguage] = useState("en-US");

  useEffect(() => {
    setVoiceSupported(voiceService.isSupported());
    setAvailableVoices(voiceService.getAvailableVoices());
  }, []);

  const startListening = () => {
    if (!voiceSupported) return;

    setIsListening(true);
    setTranscript("");
    setInterimTranscript("");

    voiceService.startListening(
      (text, isFinal) => {
        if (isFinal) {
          setTranscript(text);
          setInterimTranscript("");
          setIsListening(false);

          // Process voice commands
          const command = voiceService.processVoiceCommand(text);
          if (command) {
            handleVoiceCommand(command);
          }
        } else {
          setInterimTranscript(text);
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
  };

  const stopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
    setInterimTranscript("");
  };

  const speakText = async (text: string) => {
    if (!voiceSupported) return;

    setIsSpeaking(true);
    try {
      await voiceService.speak(text, {
        voice: selectedVoice,
        pitch,
        rate,
        volume: 1,
      });
    } catch (error) {
      console.error("Speech synthesis error:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleVoiceCommand = (command: string) => {
    switch (command) {
      case "repeat":
        speakText(testText);
        break;
      case "clear":
        setTranscript("");
        setInterimTranscript("");
        break;
      case "help":
        speakText("Available commands: repeat, clear, help, stop");
        break;
      default:
        console.log("Unknown command:", command);
    }
  };

  const speakBotMessage = async () => {
    await voiceService.speakMessage(
      "This is a bot message with different voice settings.",
      "bot"
    );
  };

  const speakUserMessage = async () => {
    await voiceService.speakMessage(
      "This is a user message with normal voice settings.",
      "user"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Advanced Voice Features Test
          </h1>

          {/* Voice Support Status */}
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Voice Support Status
            </h2>
            <div className="flex items-center space-x-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  voiceSupported ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {voiceSupported
                  ? "Voice features supported"
                  : "Voice features not supported"}
              </span>
            </div>
          </div>

          {/* Speech Recognition */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Speech Recognition
            </h2>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={!voiceSupported}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isListening
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isListening ? "Stop Listening" : "Start Listening"}
                </button>
                <button
                  onClick={() => setTranscript("")}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Clear Transcript
                </button>
              </div>

              {interimTranscript && (
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Listening:</strong> {interimTranscript}
                  </p>
                </div>
              )}

              {transcript && (
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Transcript:</strong> {transcript}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Text-to-Speech */}
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Text-to-Speech
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Text
                </label>
                <textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => speakText(testText)}
                  disabled={!voiceSupported || isSpeaking}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSpeaking ? "Speaking..." : "Speak Text"}
                </button>
                <button
                  onClick={speakBotMessage}
                  disabled={!voiceSupported || isSpeaking}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Speak Bot Message
                </button>
                <button
                  onClick={speakUserMessage}
                  disabled={!voiceSupported || isSpeaking}
                  className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Speak User Message
                </button>
              </div>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Voice Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Voice
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="default">Default</option>
                  {availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pitch: {pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Speed: {rate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Voice Commands */}
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Voice Commands
            </h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Try saying these commands while listening:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>
                  <strong>&quot;repeat&quot;</strong> - Repeats the test text
                </li>
                <li>
                  <strong>&quot;clear&quot;</strong> - Clears the transcript
                </li>
                <li>
                  <strong>&quot;help&quot;</strong> - Speaks available commands
                </li>
                <li>
                  <strong>&quot;stop&quot;</strong> - Stops current speech
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Test Buttons */}
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Tests
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => speakText("Hello, how are you today?")}
                disabled={!voiceSupported || isSpeaking}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                Greeting
              </button>
              <button
                onClick={() => speakText("The weather is sunny today.")}
                disabled={!voiceSupported || isSpeaking}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                Weather
              </button>
              <button
                onClick={() =>
                  speakText("Thank you for using our voice system.")
                }
                disabled={!voiceSupported || isSpeaking}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
              >
                Thanks
              </button>
              <button
                onClick={() =>
                  speakText("This is a test of the emergency broadcast system.")
                }
                disabled={!voiceSupported || isSpeaking}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                Emergency
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

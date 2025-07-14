interface VoiceServiceConfig {
  language?: string;
  voice?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private isSpeaking = false;
  private config: VoiceServiceConfig = {
    language: "en-US",
    voice: "default",
    pitch: 1,
    rate: 1,
    volume: 1,
  };

  constructor() {
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
  }

  private initializeSpeechRecognition() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.config.language || "en-US";
    }
  }

  private initializeSpeechSynthesis() {
    if ("speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  setConfig(config: Partial<VoiceServiceConfig>) {
    this.config = { ...this.config, ...config };
    if (this.recognition) {
      this.recognition.lang = this.config.language || "en-US";
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  getAvailableLanguages(): string[] {
    if (!this.recognition) return [];
    return [
      "en-US",
      "en-GB",
      "es-ES",
      "fr-FR",
      "de-DE",
      "it-IT",
      "pt-BR",
      "ja-JP",
      "ko-KR",
      "zh-CN",
    ];
  }

  startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: string) => void,
    onStart?: () => void,
    onEnd?: () => void
  ): boolean {
    if (!this.recognition || this.isListening) return false;

    this.isListening = true;
    onStart?.();

    this.recognition.onstart = () => {
      console.log("Speech recognition started");
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript, true);
      } else if (interimTranscript) {
        onResult(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      this.isListening = false;
      onError?.(event.error);
      onEnd?.();
    };

    this.recognition.onend = () => {
      console.log("Speech recognition ended");
      this.isListening = false;
      onEnd?.();
    };

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      this.isListening = false;
      onError?.("Failed to start speech recognition");
      onEnd?.();
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string, options?: Partial<VoiceServiceConfig>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech synthesis not supported"));
        return;
      }

      // Stop any current speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Apply configuration
      const config = { ...this.config, ...options };
      utterance.lang = config.language || "en-US";
      utterance.pitch = config.pitch || 1;
      utterance.rate = config.rate || 1;
      utterance.volume = config.volume || 1;

      // Set voice if specified
      if (config.voice && config.voice !== "default") {
        const voices = this.synthesis.getVoices();
        const selectedVoice = voices.find(
          (voice) => voice.name === config.voice
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        console.log("Speech synthesis started");
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        console.log("Speech synthesis ended");
        resolve();
      };

      utterance.onerror = (event: any) => {
        this.isSpeaking = false;
        console.error("Speech synthesis error:", event.error);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  isListeningActive(): boolean {
    return this.isListening;
  }

  isSpeakingActive(): boolean {
    return this.isSpeaking;
  }

  isSupported(): boolean {
    return !!(this.recognition && this.synthesis);
  }

  // Advanced features
  async speakMessage(message: string, sender: "user" | "bot"): Promise<void> {
    const config =
      sender === "bot"
        ? { rate: 0.9, pitch: 1.1 } // Slower, slightly higher pitch for bot
        : { rate: 1.0, pitch: 1.0 }; // Normal for user messages

    await this.speak(message, config);
  }

  async speakTypingIndicator(): Promise<void> {
    await this.speak("I'm typing...", { rate: 0.8, pitch: 1.2 });
  }

  // Voice commands
  processVoiceCommand(transcript: string): string | null {
    const lowerTranscript = transcript.toLowerCase();

    if (
      lowerTranscript.includes("stop") ||
      lowerTranscript.includes("cancel")
    ) {
      this.stopSpeaking();
      return "Stopped speaking";
    }

    if (lowerTranscript.includes("repeat")) {
      return "repeat";
    }

    if (lowerTranscript.includes("clear")) {
      return "clear";
    }

    if (lowerTranscript.includes("help")) {
      return "help";
    }

    return null;
  }
}

export const voiceService = new VoiceService();
export default voiceService;

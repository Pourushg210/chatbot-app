interface VoiceServiceConfig {
  language?: string;
  voice?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognition = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionEvent = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionErrorEvent = any;

interface VoiceServiceConfig {
  language?: string;
  voice?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

type SenderType = "user" | "bot";

// Declare webkitSpeechRecognition in global scope
declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
}

class VoiceService {
  private recognition: SpeechRecognition | null = null;
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
  private initialized = false; // Prevent double init

  // Remove window usage from constructor
  constructor() {}

  // Call this from useEffect in the client
  public initialize() {
    if (this.initialized) return;
    if (typeof window !== "undefined") {
      this.initializeSpeechRecognition();
      this.initializeSpeechSynthesis();
      this.initialized = true;
    }
  }

  private initializeSpeechRecognition() {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (
          window as {
            SpeechRecognition?: typeof window.SpeechRecognition;
            webkitSpeechRecognition?: typeof window.SpeechRecognition;
          }
        ).SpeechRecognition ||
        (
          window as {
            SpeechRecognition?: typeof window.SpeechRecognition;
            webkitSpeechRecognition?: typeof window.SpeechRecognition;
          }
        ).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = this.config.language || "en-US";
      }
    }
  }

  private initializeSpeechSynthesis() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  setConfig(config: Partial<VoiceServiceConfig>) {
    this.config = { ...this.config, ...config };
    if (this.recognition) {
      this.recognition.lang = this.config.language ?? "en-US";
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis?.getVoices() ?? [];
  }

  getAvailableLanguages(): string[] {
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

    this.recognition.onstart = () => console.log("Speech recognition started");

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }

      if (final) onResult(final, true);
      else if (interim) onResult(interim, false);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
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
      if (!this.synthesis)
        return reject(new Error("Speech synthesis not supported"));

      this.synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const config = { ...this.config, ...options };

      utterance.lang = config.language ?? "en-US";
      utterance.pitch = config.pitch ?? 1;
      utterance.rate = config.rate ?? 1;
      utterance.volume = config.volume ?? 1;

      if (config.voice && config.voice !== "default") {
        const voice = this.synthesis
          .getVoices()
          .find((v) => v.name === config.voice);
        if (voice) utterance.voice = voice;
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

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        console.error("Speech synthesis error:", event.error);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking(): void {
    this.synthesis?.cancel();
    this.isSpeaking = false;
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

  async speakMessage(message: string, sender: SenderType): Promise<void> {
    const config: Partial<VoiceServiceConfig> =
      sender === "bot" ? { rate: 0.9, pitch: 1.1 } : { rate: 1.0, pitch: 1.0 };

    await this.speak(message, config);
  }

  async speakTypingIndicator(): Promise<void> {
    await this.speak("I'm typing...", { rate: 0.8, pitch: 1.2 });
  }

  processVoiceCommand(transcript: string): string | null {
    const command = transcript.toLowerCase();

    if (command.includes("stop") || command.includes("cancel")) {
      this.stopSpeaking();
      return "Stopped speaking";
    }
    if (command.includes("repeat")) return "repeat";
    if (command.includes("clear")) return "clear";
    if (command.includes("help")) return "help";

    return null;
  }
}

export const voiceService = new VoiceService();
export default voiceService;

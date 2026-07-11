/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, Image, User, Bot, Loader2, Sparkles, AlertCircle, Headphones, Volume2, ArrowRight } from "lucide-react";
import { ChatMessage, UserProfile } from "./types";

interface AIChatProps {
  userProfile: UserProfile;
  onSendMessage: (message: string, base64Image?: string) => Promise<void>;
  chatHistory: ChatMessage[];
  isLoading: boolean;
}

// Preset visual images for camera scanning simulations
const SCAN_PRESETS = [
  {
    id: "ticket",
    name: "Scan FIFA Match Ticket",
    prompt: "Scan this Match Ticket. Where is my seat and what gate should I enter?",
    previewEmoji: "🎫",
    // Small base64 mockup representing a ticket image
    base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAADklEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  },
  {
    id: "wallet",
    name: "Scan Lost Item (Wallet)",
    prompt: "I found this black leather wallet on a bench near Food Court B. Can you report it to Lost and Found?",
    previewEmoji: "👛",
    base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAADklEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  },
  {
    id: "crowd",
    name: "Scan Corridor (Congestion)",
    prompt: "This is the current crowd at the Southwest entrance. It looks very busy. What are the alternative routes?",
    previewEmoji: "👥",
    base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAADklEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }
];

const SUGGESTED_QUESTIONS = [
  "Where is my seat?",
  "Which gate has the shortest queue?",
  "I lost my wallet. What should I do?",
  "What halal food stalls are nearby?",
  "Where is the nearest wheelchair-accessible washroom?"
];

export default function AIChat({ userProfile, onSendMessage, chatHistory, isLoading }: AIChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<typeof SCAN_PRESETS[0] | null>(null);
  const [ttsActiveMessageId, setTtsActiveMessageId] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && !selectedPreset) return;
    
    const base64Img = selectedPreset ? selectedPreset.base64 : undefined;
    onSendMessage(inputValue || selectedPreset!.prompt, base64Img);
    
    setInputValue("");
    setSelectedPreset(null);
  };

  // Simulating voice speech-to-text typing
  const handleVoiceToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate listening and transcribe mock text after 3.5 seconds
      setTimeout(() => {
        setInputValue("Where is the nearest medical first aid room? My friend is feeling dizzy.");
        setIsRecording(false);
      }, 3500);
    } else {
      setIsRecording(false);
    }
  };

  // Simulating text-to-speech feedback (spoken out loud using standard Web Speech Synthesis)
  const speakMessage = (msgId: string, text: string) => {
    if (ttsActiveMessageId === msgId) {
      window.speechSynthesis.cancel();
      setTtsActiveMessageId(null);
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set matching voice according to preferred language
    const langMap: Record<string, string> = {
      "English": "en-US",
      "Spanish": "es-ES",
      "French": "fr-FR",
      "Portuguese": "pt-PT",
      "Arabic": "ar-SA",
      "Hindi": "hi-IN"
    };
    utterance.lang = langMap[userProfile.preferredLanguage] || "en-US";
    
    utterance.onend = () => setTtsActiveMessageId(null);
    setTtsActiveMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800 p-4 shadow-xl">
      {/* Active Header */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-100 flex items-center gap-1.5">
              Smart Stadium Assistant
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Gemini 3.5
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Active in <strong className="text-indigo-400">{userProfile.preferredLanguage}</strong> • Roles: {userProfile.role}
            </p>
          </div>
        </div>
        
        {/* Connection status indicator */}
        <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded text-[10px] text-emerald-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          ONLINE
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4 min-h-[250px] max-h-[480px]">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Bot className="w-12 h-12 text-slate-700 mb-3 animate-bounce" />
            <p className="font-display font-medium text-slate-300 text-sm">
              FIFA World Cup 2026 Virtual Assistant
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Ask me for real-time routing, crowd updates, lost and found, translation, or report an incident.
            </p>

            <div className="w-full mt-6 space-y-2 text-left">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Suggested Questions</span>
              <div className="flex flex-col gap-2">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(q)}
                    className="text-xs text-left text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/20 border border-slate-800 hover:border-indigo-900/50 p-2.5 rounded-xl transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          chatHistory.map((msg) => {
            const isBot = msg.sender === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isBot 
                    ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-400" 
                    : "bg-slate-800 border border-slate-700 text-slate-300"
                }`}>
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="flex flex-col gap-1">
                  <div className={`p-3 rounded-2xl relative shadow ${
                    isBot 
                      ? "bg-slate-800/80 text-slate-100 rounded-tl-none border border-slate-700" 
                      : "bg-indigo-600 text-white rounded-tr-none"
                  }`}>
                    <p className="text-xs md:text-sm whitespace-pre-line leading-relaxed">
                      {msg.text}
                    </p>

                    {/* Pre-uploaded mockup image placeholder if present */}
                    {msg.imageUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-slate-700/50 bg-slate-900">
                        <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/50 text-[9px] text-indigo-300 font-mono">
                          <span>📷 Prescan Camera Simulation Active</span>
                        </div>
                        <div className="h-14 bg-indigo-950/20 flex items-center justify-center text-xl">
                          🎫 🔍
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Speech playback & Timestamp info */}
                  <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                    isBot ? "justify-start" : "justify-end"
                  }`}>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    
                    {isBot && (
                      <button
                        onClick={() => speakMessage(msg.id, msg.text)}
                        className={`hover:text-indigo-400 flex items-center gap-1 py-0.5 px-1 rounded transition-colors ${
                          ttsActiveMessageId === msg.id ? "bg-indigo-950/50 text-indigo-400 border border-indigo-900/50" : ""
                        }`}
                        title="Text-to-Speech Player"
                        aria-label="Speak message out loud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        {ttsActiveMessageId === msg.id ? "Playing..." : "Speak"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Preset camera scan simulator row */}
      <div className="mb-3">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5">
          📷 Camera Scanning Simulator
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SCAN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(selectedPreset?.id === preset.id ? null : preset)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border shrink-0 transition-all ${
                selectedPreset?.id === preset.id
                  ? "bg-indigo-600/20 text-indigo-300 border-indigo-500"
                  : "bg-slate-800/60 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
              aria-label={`Select scanner simulator preset: ${preset.name}`}
            >
              <span>{preset.previewEmoji}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Equalizer simulation bar */}
      {isRecording && (
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl mb-3 text-xs text-slate-300">
          <Headphones className="w-4 h-4 text-indigo-400 animate-pulse" />
          <div className="flex-1 flex items-center gap-1">
            <span className="w-1 bg-indigo-500 h-4 animate-bounce rounded-full"></span>
            <span className="w-1 bg-indigo-500 h-2.5 animate-bounce rounded-full delay-75"></span>
            <span className="w-1 bg-indigo-500 h-5 animate-bounce rounded-full delay-150"></span>
            <span className="w-1 bg-indigo-500 h-3 animate-bounce rounded-full delay-200"></span>
            <span className="w-1 bg-indigo-500 h-1 animate-bounce rounded-full delay-75"></span>
            <span className="w-1 bg-indigo-500 h-3.5 animate-bounce rounded-full"></span>
            <span className="w-1 bg-indigo-500 h-1.5 animate-bounce rounded-full delay-100"></span>
          </div>
          <span className="font-mono text-[10px] text-indigo-400">Speech-to-Text active...</span>
          <button
            onClick={() => setIsRecording(false)}
            className="text-slate-500 hover:text-white"
            aria-label="Cancel speech input recording"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Preset query overlay display */}
      {selectedPreset && (
        <div className="bg-slate-950 border border-indigo-950 rounded-xl p-2.5 mb-3 text-xs flex justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedPreset.previewEmoji}</span>
            <div>
              <p className="text-indigo-400 font-bold text-[10px] uppercase font-mono tracking-wider">
                Prescan Image Selected
              </p>
              <p className="text-slate-300 italic">{selectedPreset.prompt}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedPreset(null)}
            className="text-slate-500 hover:text-white shrink-0 text-xs px-1"
            aria-label="Remove preset image"
          >
            ✕
          </button>
        </div>
      )}

      {/* Send Input Bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <button
          type="button"
          onClick={handleVoiceToggle}
          className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
            isRecording 
              ? "bg-rose-600/20 text-rose-400 border-rose-500" 
              : "bg-slate-800/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
          }`}
          title="Speak into Microphone Simulator"
          aria-label="Toggle microphone simulation for text chat"
        >
          <Mic className={`w-4 h-4 ${isRecording ? "animate-pulse" : ""}`} />
        </button>

        <input
          type="text"
          id="chat-question-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={selectedPreset ? "Click Send to analyze image..." : "Type your stadium question..."}
          disabled={isRecording}
          className="flex-1 bg-slate-800 border border-slate-800 focus:border-indigo-600 focus:outline-none rounded-xl text-xs md:text-sm text-slate-100 px-4 py-3 placeholder:text-slate-500 disabled:opacity-50"
          aria-label="Type your question about the stadium"
        />

        <button
          type="submit"
          disabled={isLoading || (!inputValue.trim() && !selectedPreset)}
          className="p-3 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send question to AI assistant"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}

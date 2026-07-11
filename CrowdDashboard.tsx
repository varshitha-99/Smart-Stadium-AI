/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Eye, Volume2, Type, Accessibility, Sparkles, Loader2, Camera, HelpCircle, Check } from "lucide-react";
import { UserProfile } from "./types";

interface AccessibilitySuiteProps {
  userProfile: UserProfile;
  onChangeProfileSetting: (setting: keyof UserProfile, value: any) => void;
  onAnalyzeScene: (message: string, base64Image: string) => Promise<string>;
}

// Preset captures representing simulated camera imagery in the stadium
const ACCESSIBILITY_SCENE_PRESETS = [
  {
    id: "ticket-scan",
    name: "FIFA Match Ticket (Scan QR/Seat)",
    emoji: "🎫",
    prompt: "Read this World Cup match ticket. Tell me the teams playing, the date, time, gate number, block number, and row/seat info in a clear spoken manner for a vision-impaired fan.",
    // Sample base64 pixel
    base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAADklEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  },
  {
    id: "corridor-ramp",
    name: "View Corridor (Scene Description)",
    emoji: "♿",
    prompt: "Analyze this stadium ramp corridor. Describe what you see, and confirm if there are any wheelchair obstacles, high-gradient slopes, or step hazards.",
    base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAADklEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  },
  {
    id: "signboard",
    name: "Signboard Translator (Signboard Capture)",
    emoji: "🪧",
    prompt: "Scan this signboard. It has text written in Spanish: 'ENTRADA DE SILLAS DE RUEDAS - ELEVADORES CONECTADOS'. Translate it, and explain where it leads.",
    base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAADklEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }
];

export default function AccessibilitySuite({
  userProfile,
  onChangeProfileSetting,
  onAnalyzeScene
}: AccessibilitySuiteProps) {
  const [selectedScene, setSelectedScene] = useState<typeof ACCESSIBILITY_SCENE_PRESETS[0] | null>(null);
  const [sceneAnalysis, setSceneAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const triggerSceneAnalysis = async () => {
    if (!selectedScene) return;
    setIsLoading(true);
    setSceneAnalysis(null);
    try {
      const responseText = await onAnalyzeScene(selectedScene.prompt, selectedScene.base64);
      setSceneAnalysis(responseText);
      
      // If Text-to-Speech is enabled, speak the description automatically!
      if (userProfile.textToSpeech) {
        speakResponse(responseText);
      }
    } catch (error) {
      setSceneAnalysis("Error analyzing camera capture. Please verify your Gemini connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const speakResponse = (text: string) => {
    window.speechSynthesis.cancel();
    if (isPlayingVoice) {
      setIsPlayingVoice(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlayingVoice(false);
    setIsPlayingVoice(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl shadow-xl h-full">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Accessibility className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-slate-100">
            A11y Assistance Center
          </h3>
          <p className="text-[10px] text-slate-400">
            Smart sensory aids, large layouts, and Gemini visual descriptions
          </p>
        </div>
      </div>

      {/* Toggles for settings */}
      <div className="space-y-3">
        {/* High contrast */}
        <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-xs font-semibold text-slate-200 block">High Contrast Mode</span>
              <span className="text-[10px] text-slate-400 block">Switches display colors to stark solid colors (Black & White)</span>
            </div>
          </div>
          <label htmlFor="a11y-high-contrast" className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="a11y-high-contrast"
              checked={userProfile.highContrast}
              onChange={(e) => onChangeProfileSetting("highContrast", e.target.checked)}
              className="sr-only peer"
              aria-label="Toggle high contrast display mode"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
          </label>
        </div>

        {/* Large font */}
        <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <Type className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Large Text Scaling</span>
              <span className="text-[10px] text-slate-400 block">Increases typography size by 15% across all modules</span>
            </div>
          </div>
          <label htmlFor="a11y-large-text" className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="a11y-large-text"
              checked={userProfile.largeText}
              onChange={(e) => onChangeProfileSetting("largeText", e.target.checked)}
              className="sr-only peer"
              aria-label="Toggle large text font size scaling"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
          </label>
        </div>

        {/* Text to Speech toggle */}
        <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-sky-400" />
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Text-to-Speech Narration</span>
              <span className="text-[10px] text-slate-400 block">Reads out routes and Gemini alerts out loud automatically</span>
            </div>
          </div>
          <label htmlFor="a11y-tts" className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="a11y-tts"
              checked={userProfile.textToSpeech}
              onChange={(e) => onChangeProfileSetting("textToSpeech", e.target.checked)}
              className="sr-only peer"
              aria-label="Toggle text to speech screen narrator description"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
          </label>
        </div>
      </div>

      {/* Visual Camera Assistance (Presets for simulation) */}
      <div className="border-t border-slate-800 pt-3 flex-1 flex flex-col gap-2">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
          Gemini Camera Capture & Vision Aid
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {ACCESSIBILITY_SCENE_PRESETS.map((scene) => (
            <button
              key={scene.id}
              onClick={() => {
                setSelectedScene(scene);
                setSceneAnalysis(null);
              }}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                selectedScene?.id === scene.id
                  ? "bg-indigo-600/20 text-indigo-300 border-indigo-500"
                  : "bg-slate-950/50 text-slate-400 border-slate-800/80 hover:border-slate-700"
              }`}
              aria-label={`Select accessibility simulation preset scene: ${scene.name}`}
            >
              <span className="text-xl mb-1">{scene.emoji}</span>
              <span className="text-[10px] font-bold line-clamp-1">{scene.name}</span>
            </button>
          ))}
        </div>

        {selectedScene && (
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl mt-1 space-y-3">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 font-mono flex items-center gap-1">
                <Camera className="w-3 h-3 text-indigo-400 animate-pulse" />
                CAPTURE TARGET READY
              </span>
              <span className="text-indigo-400">{selectedScene.emoji} Prescan</span>
            </div>
            
            <p className="text-xs text-slate-400 italic">
              <strong>Prompt:</strong> "{selectedScene.prompt}"
            </p>

            <button
              onClick={triggerSceneAnalysis}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing frames with Gemini Vision...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze Camera with Gemini Vision</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Vision Analysis output */}
        {sceneAnalysis && (
          <div className="bg-indigo-950/20 border border-indigo-900/30 p-3.5 rounded-xl space-y-2 mt-2">
            <div className="flex justify-between items-center border-b border-indigo-900/30 pb-1.5">
              <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider font-bold">
                Spoken Assistance readout
              </span>
              <button
                onClick={() => speakResponse(sceneAnalysis)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800"
                aria-label={isPlayingVoice ? "Stop speaking scene analysis" : "Play scene analysis as spoken narration"}
              >
                <Volume2 className="w-3 h-3" />
                {isPlayingVoice ? "Stop Audio" : "Play Speech"}
              </button>
            </div>
            <p className="text-xs md:text-sm text-indigo-200 leading-relaxed italic">
              "{sceneAnalysis}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Languages, Globe, ArrowRight, Loader2, BookOpen, Volume2 } from "lucide-react";
import { UserProfile } from "./types";

interface MultilingualAssistantProps {
  userProfile: UserProfile;
  onChangeProfileSetting: (setting: keyof UserProfile, value: any) => void;
  onTranslateText: (text: string, targetLanguage: string) => Promise<string>;
}

// Preset texts reflecting various languages seen at the World Cup
const TRANSLATION_PRESETS = [
  {
    id: "sign-es",
    name: "Spanish Warning Sign",
    lang: "Spanish",
    text: "ATENCIÓN: Debido a trabajos de mantenimiento en las rampas occidentales, por favor use el ascensor norte en el bloque 101."
  },
  {
    id: "menu-fr",
    name: "French Food Menu Kiosk",
    lang: "French",
    text: "Menu Matchday: Saucisse de Toulouse grillée, frites croustillantes salées, boisson gazeuse fraîche au choix."
  },
  {
    id: "alert-ar",
    name: "Arabic Emergency Broadcast",
    lang: "Arabic",
    text: "تنبيه أمني: يرجى إبقاء الممرات فارغة. في حالة الطوارئ، توجه فوراً نحو نقطة التجمع ألفا."
  },
  {
    id: "ticket-pt",
    name: "Portuguese Ticket Guideline",
    lang: "Portuguese",
    text: "Instruções de entrada: Apresente o código QR legível na tela do celular. Mantenha os documentos em mãos."
  }
];

export default function MultilingualAssistant({
  userProfile,
  onChangeProfileSetting,
  onTranslateText
}: MultilingualAssistantProps) {
  const [customText, setCustomText] = useState("");
  const [translationResult, setTranslationResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const triggerTranslation = async (textToTranslate: string) => {
    if (!textToTranslate) return;
    setIsLoading(true);
    setTranslationResult(null);
    try {
      const translated = await onTranslateText(textToTranslate, userProfile.preferredLanguage);
      setTranslationResult(translated);
    } catch (error) {
      setTranslationResult(`Failed to translate. Check your Gemini configurations.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl shadow-xl h-full">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Languages className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-slate-100">
            Multilingual AI Translator
          </h3>
          <p className="text-[10px] text-slate-400">
            Translates food menus, signage, announcements, and match info instantly
          </p>
        </div>
      </div>

      {/* Select Preferred Language */}
      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
        <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block mb-1">
          Your Preferred Language
        </span>
        <div className="relative">
          <select
            value={userProfile.preferredLanguage}
            onChange={(e) => onChangeProfileSetting("preferredLanguage", e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-600 text-xs rounded-lg py-2.5 px-3 text-slate-100 outline-none"
          >
            <option value="English">🇬🇧 English</option>
            <option value="Spanish">🇪🇸 Spanish (Español)</option>
            <option value="French">🇫🇷 French (Français)</option>
            <option value="Portuguese">🇵🇹 Portuguese (Português)</option>
            <option value="Arabic">🇸🇦 Arabic (العربية)</option>
            <option value="Hindi">🇮🇳 Hindi (हिन्दी)</option>
          </select>
        </div>
      </div>

      {/* Select preset texts to translate */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
          Preset Translation Presets (Signage & Menus)
        </span>
        <div className="grid grid-cols-2 gap-2">
          {TRANSLATION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setCustomText(preset.text);
                triggerTranslation(preset.text);
              }}
              className="text-left bg-slate-950/40 hover:bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-[10px] transition-all text-slate-300"
              aria-label={`Select translation preset: ${preset.name}`}
            >
              <div className="font-semibold text-indigo-400 flex justify-between items-center mb-1">
                <span>{preset.name}</span>
                <span>{preset.lang === "Spanish" ? "🇪🇸" : preset.lang === "French" ? "🇫🇷" : preset.lang === "Arabic" ? "🇸🇦" : "🇵🇹"}</span>
              </div>
              <p className="line-clamp-2 text-[10px] text-slate-400 italic">"{preset.text}"</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Translate Input text box */}
      <div className="space-y-2 flex-1 flex flex-col">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
          Translate Custom Message
        </span>
        <textarea
          id="translation-custom-input"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Type any announcements, menu items, or directions you found..."
          className="w-full h-16 bg-slate-800 border border-slate-800 focus:border-indigo-600 rounded-xl text-xs text-slate-100 p-3 placeholder:text-slate-500 focus:outline-none resize-none"
          aria-label="Custom message to translate"
        />

        <button
          onClick={() => triggerTranslation(customText)}
          disabled={isLoading || !customText.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-50"
          aria-label="Translate custom message"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Translating content...</span>
            </>
          ) : (
            <>
              <Globe className="w-4 h-4" />
              <span>Translate to {userProfile.preferredLanguage}</span>
            </>
          )}
        </button>
      </div>

      {/* Translation outputs */}
      {translationResult && (
        <div className="bg-indigo-950/20 border border-indigo-900/30 p-3.5 rounded-xl space-y-1.5">
          <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider font-bold block border-b border-indigo-900/30 pb-1">
            Translation Output ({userProfile.preferredLanguage})
          </span>
          <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-semibold italic">
            "{translationResult}"
          </p>
        </div>
      )}
    </div>
  );
}

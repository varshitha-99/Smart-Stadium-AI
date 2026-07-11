/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Compass, Accessibility, Cpu, Globe } from "lucide-react";

interface OnboardingScreenProps {
  onGetStarted: () => void;
}

export default function OnboardingScreen({ onGetStarted }: OnboardingScreenProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0A0A0A] flex flex-col justify-between p-6 md:p-12 select-none z-50">
      
      {/* 🏟️ STUNNING HIGH-VISIBILITY FOOTBALL GROUND BACKGROUND & VIGNETTE OVERLAY */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ 
            scale: 1.02, 
            opacity: 1,
            transition: { duration: 2.5, ease: "easeOut" }
          }}
          className="w-full h-full"
        >
          {/* Extremely high-resolution vibrant aerial football pitch under bright stadium lights */}
          <img
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop"
            alt="FIFA 2026 Football Ground Pitch Night"
            className="w-full h-full object-cover object-center filter brightness-[1.05] contrast-[1.1] saturate-[1.25]"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        {/* Soft Vignette and Smooth Light Gradient Overlay to allow the pitch to glow through perfectly */}
        <div className="absolute inset-0 bg-radial-vignette opacity-30 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/35 to-transparent z-10" />
      </div>

      {/* 🏆 TOP GLASSMORPHISM BRANDING BADGE (Top-Left Aligned) */}
      <div className="relative z-20 w-full flex justify-start pt-4 md:pt-6">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
          className="backdrop-blur-md bg-black/40 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2.5 shadow-xl shadow-black/40 hover:border-white/20 transition-all duration-300"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E1062C] text-[11px] animate-pulse shadow-md shadow-[#E1062C]/50">
            ⚽
          </span>
          <span className="text-[10px] md:text-xs font-mono font-black tracking-[0.2em] text-[#CFCFCF] uppercase">
            FIFA WORLD CUP 2026
          </span>
        </motion.div>
      </div>

      {/* 🚀 ONBOARDING MAIN CONTENT PANEL WITH LUXURY GLASSMORPHIC CARD */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 1.0, ease: "easeOut" }}
        className="relative z-20 w-full max-w-lg mr-auto flex flex-col p-6 md:p-8 pb-8 backdrop-blur-xl bg-black/65 border border-white/10 rounded-3xl shadow-2xl shadow-black/80 mt-auto"
      >
        
        {/* Futuristic sports-tech badges */}
        <div className="flex flex-wrap gap-2 mb-5 opacity-95">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-semibold text-[#CFCFCF]">
            <Compass className="w-3 h-3 text-[#2563EB]" /> Navigation
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-semibold text-[#CFCFCF]">
            <Cpu className="w-3 h-3 text-[#E1062C]" /> Real-Time AI
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-semibold text-[#CFCFCF]">
            <Accessibility className="w-3 h-3 text-emerald-400" /> Accessible
          </div>
        </div>

        {/* Headline text */}
        <div className="text-left">
          <h2 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.05] drop-shadow-2xl">
            Smart <br />
            <span className="bg-gradient-to-r from-white via-slate-100 to-[#CFCFCF] bg-clip-text text-transparent">
              Stadium AI
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mt-4 text-[13px] sm:text-sm text-[#CFCFCF]/90 leading-relaxed font-sans max-w-md font-normal">
            AI-powered navigation, real-time crowd insights, multilingual assistance, accessibility support, and intelligent stadium operations—all in one seamless experience.
          </p>
        </div>

        {/* 🔘 PREMIUM ACTION BUTTONS */}
        <div className="mt-6 flex flex-col gap-3.5">
          {/* Main Get Started Red Button */}
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={onGetStarted}
            className="relative w-full py-3.5 bg-[#E1062C] text-white font-bold text-sm sm:text-base rounded-full shadow-lg shadow-[#E1062C]/25 flex items-center justify-center gap-2 transition-all duration-300 group overflow-hidden cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        </div>

        {/* THREE ONBOARDING DOT INDICATORS */}
        <div className="flex justify-start gap-2 mt-6 px-1">
          <span className="w-6 h-1.5 rounded-full bg-[#E1062C] transition-all duration-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700 hover:bg-slate-500 cursor-pointer transition-all duration-300" onClick={onGetStarted} />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700 hover:bg-slate-500 cursor-pointer transition-all duration-300" onClick={onGetStarted} />
        </div>

      </motion.div>
    </div>
  );
}

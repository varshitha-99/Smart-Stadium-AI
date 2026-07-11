/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, Navigation, Users, Accessibility, Languages, 
  Shield, User, Bell, Volume2, Sparkles, AlertTriangle, 
  HelpCircle, Compass, RefreshCcw, Wifi, Pocket, Play 
} from "lucide-react";

import { UserRole, UserProfile, Facility, Incident, Volunteer, Alert, ChatMessage, StadiumState } from "./types";
import StadiumMap from "./StadiumMap";
import AIChat from "./AIChat";
import NavigationModule from "./NavigationModule";
import CrowdDashboard from "./CrowdDashboard";
import AccessibilitySuite from "./AccessibilitySuite";
import MultilingualAssistant from "./MultilingualAssistant";
import OrganizerStaffDashboard from "./OrganizerStaffDashboard";
import VolunteerDashboard from "./VolunteerDashboard";
import ProfileModule from "./ProfileModule";
import OnboardingScreen from "./OnboardingScreen";

export default function App() {
  // --- USER PROFILE STATE ---
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "user-fan-1",
    name: "Alex Johnson",
    email: "alex.worldcup2026@gmail.com",
    role: UserRole.FAN,
    preferredLanguage: "English",
    ticketCode: "ARG-BRA-2026-N7",
    seatNo: "Sec 107, Row K",
    gateNo: "Gate E (South Entrance)",
    accessibilityEnabled: false,
    highContrast: false,
    largeText: false,
    textToSpeech: false
  });

  // --- STADIUM LIVE DATABASE STATE (synced from backend) ---
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stadiumStats, setStadiumStats] = useState<StadiumState>({
    occupancy: 68430,
    maxCapacity: 80000,
    parkingAvailable: 412,
    parkingTotal: 3500
  });

  // --- NAVIGATION STATE ---
  const [routeSource, setRouteSource] = useState<Facility | null>(null);
  const [routeDestination, setRouteDestination] = useState<Facility | null>(null);
  const [navigationPath, setNavigationPath] = useState<{ x: number; y: number }[] | null>(null);
  const [routeSteps, setRouteSteps] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);

  // --- MAP FILTER CONFIGS ---
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showWheelchairRoutes, setShowWheelchairRoutes] = useState(false);

  // --- CHAT STATE ---
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // --- APP LOADING & TAB STATES ---
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "nav" | "crowd" | "a11y" | "translate" | "roles" | "ticket">("chat");
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);

  // --- FETCH STADIUM STATES ON LOAD ---
  const syncStadiumData = async () => {
    setIsMapLoading(true);
    try {
      const res = await fetch("/api/stadium");
      const data = await res.json();
      if (data) {
        setFacilities(data.facilities || []);
        setIncidents(data.incidents || []);
        setVolunteers(data.volunteers || []);
        setAlerts(data.alerts || []);
        if (data.stadiumState) {
          setStadiumStats(data.stadiumState);
        }
      }
    } catch (error) {
      console.error("Failed to sync live stadium data from Express API:", error);
    } finally {
      setIsMapLoading(false);
    }
  };

  useEffect(() => {
    syncStadiumData();
    // Poll data every 10 seconds to simulate dynamic crowd shifts
    const interval = setInterval(syncStadiumData, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- PROFILE UPDATE HANDLER ---
  const handleProfileChange = (setting: keyof UserProfile, value: any) => {
    setUserProfile((prev) => ({
      ...prev,
      [setting]: value
    }));
  };

  // --- FEATURE 1: AI SMART NAVIGATION API CALL ---
  const handleGetRoute = async (sourceId: string, destId: string, accessibilityEnabled: boolean) => {
    setIsApiLoading(true);
    try {
      const response = await fetch("/api/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId, destId, accessibilityEnabled })
      });
      const data = await response.json();
      if (data.success) {
        setNavigationPath(data.path);
        setRouteSteps(data.steps);
        setEstimatedTime(data.estimatedTime);
        setEstimatedDistance(data.distance);
        
        // Auto Speak route steps if TTS enabled
        if (userProfile.textToSpeech) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(data.steps);
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsApiLoading(false);
    }
  };

  // --- FEATURE 3: TRANSLATE TEXT API CALL ---
  const handleTranslateText = async (text: string, targetLanguage: string): Promise<string> => {
    setIsApiLoading(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage })
      });
      const data = await response.json();
      return data.translatedText || text;
    } catch (e) {
      console.error(e);
      return text;
    } finally {
      setIsApiLoading(false);
    }
  };

  // --- FEATURE 4: CAMERA SCENE ANALYSIS API CALL (ACCESSIBILITY) ---
  const handleAnalyzeScene = async (message: string, base64Image: string): Promise<string> => {
    setIsApiLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message, 
          imageUrl: base64Image,
          preferredLanguage: userProfile.preferredLanguage 
        })
      });
      const data = await response.json();
      return data.text || "Scene described successfully.";
    } catch (e) {
      console.error(e);
      return "Failed to analyze scene.";
    } finally {
      setIsApiLoading(false);
    }
  };

  // --- CHAT SEND MESSAGE API CALL ---
  const handleSendMessage = async (text: string, base64Image?: string) => {
    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      text,
      imageUrl: base64Image,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setIsApiLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: newHistory,
          imageUrl: base64Image,
          preferredLanguage: userProfile.preferredLanguage,
          isWheelchairUser: userProfile.accessibilityEnabled
        })
      });
      const data = await response.json();
      if (data.success) {
        const botMsg: ChatMessage = {
          id: "msg-bot-" + Date.now(),
          sender: "assistant",
          text: data.text,
          timestamp: new Date().toISOString()
        };
        setChatHistory((prev) => [...prev, botMsg]);

        // Speak aloud automatically if TTS enabled
        if (userProfile.textToSpeech) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(data.text);
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsApiLoading(false);
    }
  };

  // --- FEATURE 2 & 5: RE-ROUTING & OPERATIONAL ADVISORY FROM GEMINI ---
  const handleGetAIRecommendations = async (): Promise<string> => {
    try {
      const response = await fetch("/api/ai-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentRole: userProfile.role })
      });
      const data = await response.json();
      return data.recommendations || "Perform normal checks on Gate E.";
    } catch (error) {
      console.error(error);
      return "Relieve pressure at Gate E by broadcasting south concourse reroutes.";
    }
  };

  // --- OPERATIONAL CONTROL HANDLERS (EXPRESS DB UPDATES) ---
  const handleToggleGate = async (facilityId: string, isOpen: boolean) => {
    try {
      const response = await fetch("/api/stadium/toggle-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facilityId, isOpen })
      });
      const data = await response.json();
      if (data.success) {
        setFacilities((prev) => prev.map(f => f.id === facilityId ? { ...f, isOpen, waitTime: isOpen ? 10 : 999 } : f));
        setAlerts(data.alerts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateCrowd = async (facilityId: string, crowdLevel: string, waitTime: number) => {
    try {
      const response = await fetch("/api/stadium/update-crowd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facilityId, crowdLevel, waitTime })
      });
      const data = await response.json();
      if (data.success) {
        setFacilities((prev) => prev.map(f => f.id === facilityId ? data.facility : f));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReportIncident = async (title: string, description: string, locationId: string, severity: string) => {
    try {
      const response = await fetch("/api/stadium/report-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, locationId, severity, reportedBy: userProfile.name })
      });
      const data = await response.json();
      if (data.success) {
        setIncidents(data.incidents);
        setAlerts(data.alerts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    try {
      const response = await fetch("/api/stadium/resolve-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId })
      });
      const data = await response.json();
      if (data.success) {
        setIncidents(data.incidents);
        setVolunteers(data.volunteers);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeployVolunteer = async (volunteerId: string, locationId: string, incidentId?: string) => {
    try {
      const response = await fetch("/api/stadium/deploy-volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId, locationId, incidentId })
      });
      const data = await response.json();
      if (data.success) {
        setVolunteers(data.volunteers);
        setIncidents(data.incidents);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger simulated goals celebration pushes
  const triggerGoalCelebration = async () => {
    try {
      const response = await fetch("/api/stadium/trigger-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeTeam: "Argentina",
          awayTeam: "Brazil",
          scorer: "Julian Alvarez",
          minute: 54
        })
      });
      const data = await response.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {showOnboarding ? (
        <motion.div
          key="onboarding"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-full h-screen"
        >
          <OnboardingScreen
            onGetStarted={() => {
              setShowOnboarding(false);
              setActiveTab("chat");
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="app-main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className={`min-h-screen w-full flex flex-col md:flex-row transition-colors duration-500 ${
            userProfile.highContrast ? "accessibility-high-contrast" : "bg-slate-950 text-slate-100"
          } ${
            userProfile.largeText ? "accessibility-large-text" : ""
          }`}
        >
      
      {/* 🧭 SIDEBAR NAVIGATION (HIGH DENSITY THEME SPECIFIC - w-20 desktop layout) */}
      <aside className={`w-full md:w-20 border-b md:border-b-0 md:border-r border-slate-800/80 flex md:flex-col items-center justify-between p-2.5 md:py-5 md:px-0 md:h-screen md:sticky md:top-0 z-50 shrink-0 select-none ${
        userProfile.highContrast ? "bg-black border-2 border-white" : "bg-[#1E293B]"
      }`}>
        {/* Top Logo Branding */}
        <div className="flex md:flex-col items-center gap-2.5">
          <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/15 shrink-0 animate-pulse">
            <Bot className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="md:hidden font-display font-black text-[13px] text-slate-100 tracking-tight flex items-center gap-1.5">
            Smart Stadium AI
            <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase font-mono">
              WC '26
            </span>
          </span>
        </div>

        {/* Snug Navigation Links */}
        <nav className="flex md:flex-col gap-1 md:gap-2.5 overflow-x-auto md:overflow-y-auto no-scrollbar max-w-[65%] md:max-w-none md:my-auto py-0.5 px-1 items-center">
          {/* AI Chat Tab */}
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex flex-col items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-xl transition-all shrink-0 ${
              activeTab === "chat"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
            title="AI Chat Assistant"
            aria-label="AI Chat Assistant Tab"
          >
            <Bot className="w-4.5 h-4.5 md:w-5 md:h-5" />
            <span className="text-[8px] md:text-[9px] mt-0.5 md:mt-1 font-semibold leading-none text-center">AI Chat</span>
          </button>

          {/* Wayfinding Tab */}
          <button
            onClick={() => setActiveTab("nav")}
            className={`flex flex-col items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-xl transition-all shrink-0 ${
              activeTab === "nav"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
            title="Stadium Wayfinding"
            aria-label="Stadium Wayfinding Tab"
          >
            <Navigation className="w-4.5 h-4.5 md:w-5 md:h-5" />
            <span className="text-[8px] md:text-[9px] mt-0.5 md:mt-1 font-semibold leading-none text-center">Wayfind</span>
          </button>

          {/* Crowd Load Tab */}
          <button
            onClick={() => setActiveTab("crowd")}
            className={`flex flex-col items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-xl transition-all shrink-0 ${
              activeTab === "crowd"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
            title="Crowd Monitor"
            aria-label="Crowd Monitor Tab"
          >
            <Users className="w-4.5 h-4.5 md:w-5 md:h-5" />
            <span className="text-[8px] md:text-[9px] mt-0.5 md:mt-1 font-semibold leading-none text-center">Crowd</span>
          </button>

          {/* Accessibility sensory Tab */}
          <button
            onClick={() => setActiveTab("a11y")}
            className={`flex flex-col items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-xl transition-all shrink-0 ${
              activeTab === "a11y"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
            title="Accessibility Suite"
            aria-label="Accessibility and Sensory Suite Tab"
          >
            <Accessibility className="w-4.5 h-4.5 md:w-5 md:h-5" />
            <span className="text-[8px] md:text-[9px] mt-0.5 md:mt-1 font-semibold leading-none text-center">Sensory</span>
          </button>

          {/* Multilingual Translator Tab */}
          <button
            onClick={() => setActiveTab("translate")}
            className={`flex flex-col items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-xl transition-all shrink-0 ${
              activeTab === "translate"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
            title="Translator"
            aria-label="Multilingual Translator Tab"
          >
            <Languages className="w-4.5 h-4.5 md:w-5 md:h-5" />
            <span className="text-[8px] md:text-[9px] mt-0.5 md:mt-1 font-semibold leading-none text-center">Translate</span>
          </button>

          {/* Operations Hub Tab */}
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex flex-col items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-xl transition-all shrink-0 ${
              activeTab === "roles"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
            title="Operational Control Hub"
            aria-label="Operational Control Hub Tab"
          >
            <Shield className="w-4.5 h-4.5 md:w-5 md:h-5" />
            <span className="text-[8px] md:text-[9px] mt-0.5 md:mt-1 font-semibold leading-none text-center">Ops Hub</span>
          </button>

          {/* Passport Ticket Tab */}
          <button
            onClick={() => setActiveTab("ticket")}
            className={`flex flex-col items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-xl transition-all shrink-0 ${
              activeTab === "ticket"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
            title="Passport Access Pass"
            aria-label="Passport and Ticket Access Pass Tab"
          >
            <User className="w-4.5 h-4.5 md:w-5 md:h-5" />
            <span className="text-[8px] md:text-[9px] mt-0.5 md:mt-1 font-semibold leading-none text-center">Passport</span>
          </button>
        </nav>

        {/* Small bottom footer on desktop */}
        <div className="hidden md:flex flex-col items-center gap-1 text-slate-500 font-mono text-[9px] leading-none">
          <span>FIFA</span>
          <span>2026</span>
        </div>
      </aside>

      {/* 💻 MAIN APPNET DASHBOARD GRID WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ⚽ COMPACT LIVE SCORE TICKER */}
        <div className="w-full bg-[#1E293B] border-b border-slate-800 text-[11px] px-4 py-1.5 flex justify-between items-center z-40 select-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="font-mono tracking-wider font-semibold text-slate-300 uppercase text-[10px]">
              FIFA WORLD CUP 2026™ LIVE MATCH
            </span>
            <span className="bg-indigo-600 px-1 py-0.5 rounded text-[9px] text-white font-bold ml-1">
              22' MINS
            </span>
          </div>

          <div className="font-display font-bold flex items-center gap-2 text-xs">
            <span className="text-slate-200">ARGENTINA 🇦🇷</span>
            <span className="text-indigo-400 text-[11px] font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">1 - 0</span>
            <span className="text-slate-200">🇧🇷 BRAZIL</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-400 font-mono text-[10px]">
            <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5 text-emerald-400" /> Wi-Fi Active</span>
            <span>•</span>
            <span>Pitch: 34°C</span>
          </div>
        </div>

        {/* SPECIFIC HEADER BRANDING */}
        <header className="px-4 md:px-6 py-2 border-b border-slate-800 bg-[#1E293B]/65 backdrop-blur-md sticky top-0 z-30 flex flex-col sm:flex-row gap-2 justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-display font-black text-sm md:text-base text-slate-100 tracking-tight flex items-center gap-2">
                Smart Stadium AI
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                  World Cup 2026 Edition
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Interactive venue mapping, crowd로드 monitoring, and multimodal operations
              </p>
            </div>
          </div>

          {/* Quick Roster switcher & synchronization buttons */}
          <div className="flex items-center gap-2 text-[11px] w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-xl">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[9px] text-slate-500 uppercase font-mono">Role:</span>
              <select
                value={userProfile.role}
                onChange={(e) => handleProfileChange("role", e.target.value as UserRole)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-[11px]"
              >
                <option value={UserRole.FAN} className="bg-slate-900 text-slate-200">🎟️ Fan</option>
                <option value={UserRole.VOLUNTEER} className="bg-slate-900 text-slate-200">🤝 Volunteer</option>
                <option value={UserRole.STAFF} className="bg-slate-900 text-slate-200">👮 Staff</option>
                <option value={UserRole.ORGANIZER} className="bg-slate-900 text-slate-200">👑 Organizer</option>
              </select>
            </div>

            <button
              onClick={syncStadiumData}
              className="p-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 rounded-xl transition-all"
              title="Manual sync stadium state"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
            </button>
          </div>
        </header>

        {/* COMPACT BENTO-STYLE DASHBOARD GRID */}
        <main className="px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start flex-1 w-full max-w-[1550px] mx-auto">
          
          {/* LEFT COLUMN: INTERACTIVE STADIUM MAP (lg:col-span-5) */}
          <section className="lg:col-span-5 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-display font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                Stadium Arena Map
              </h2>
              
              {/* Quick Map checkboxes */}
              <div className="flex gap-2.5 text-[10px] font-mono">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHeatmap}
                    onChange={(e) => setShowHeatmap(e.target.checked)}
                    className="rounded border-slate-800 text-indigo-600 focus:ring-0 bg-slate-900 w-3 h-3"
                  />
                  <span>Heatmap</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showWheelchairRoutes}
                    onChange={(e) => setShowWheelchairRoutes(e.target.checked)}
                    className="rounded border-slate-800 text-indigo-600 focus:ring-0 bg-slate-900 w-3 h-3"
                  />
                  <span>A11y Trails</span>
                </label>
              </div>
            </div>

            {/* Stadium Vector Map Component */}
            <StadiumMap
              facilities={facilities}
              selectedFacility={selectedFacility}
              onSelectFacility={(fac) => {
                setSelectedFacility(fac);
                if (fac) {
                  if (!routeSource) {
                    setRouteSource(fac);
                  } else if (!routeDestination && routeSource.id !== fac.id) {
                    setRouteDestination(fac);
                  }
                }
              }}
              navigationPath={navigationPath}
              routeSource={routeSource}
              routeDestination={routeDestination}
              showHeatmap={showHeatmap}
              showWheelchairRoutes={showWheelchairRoutes}
              incidents={incidents}
              volunteers={volunteers}
            />

            {/* Simulation controls */}
            <div className="bg-[#1E293B]/80 border border-slate-800/80 p-3 rounded-xl shadow">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
                Operations Simulator Controls
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* Simulated Goal Celebrations */}
                <button
                  onClick={triggerGoalCelebration}
                  className="text-left bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-2 transition-all text-[11px]"
                >
                  <span className="text-xs block">⚽</span>
                  <span className="font-bold text-slate-200 block mt-0.5">Simulate Goal Score</span>
                  <p className="text-[10px] text-slate-500 leading-tight">Triggers live broadcast alerts & crowd spikes.</p>
                </button>

                {/* Instant Seat navigation shortcut */}
                <button
                  onClick={() => {
                    const seatFac = facilities.find(f => f.id === "block-107");
                    const gateFac = facilities.find(f => f.id === "gate-e");
                    if (seatFac && gateFac) {
                      setRouteSource(gateFac);
                      setRouteDestination(seatFac);
                      handleGetRoute(gateFac.id, seatFac.id, userProfile.accessibilityEnabled);
                      setActiveTab("nav");
                    }
                  }}
                  className="text-left bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-2 transition-all text-[11px]"
                >
                  <span className="text-xs block">🎫</span>
                  <span className="font-bold text-slate-200 block mt-0.5">Route to My Seat</span>
                  <p className="text-[10px] text-slate-500 leading-tight">Plots route from South Gate E to Block 107.</p>
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: UTILITY ACTIVE TAB WORKSPACE (lg:col-span-7) */}
          <section className="lg:col-span-7 flex flex-col gap-3">
            {/* Active module content workspace window */}
            <div className="flex-1 min-h-[350px]">
              <AnimatePresence mode="wait">
                {activeTab === "chat" && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full"
                  >
                    <AIChat
                      userProfile={userProfile}
                      onSendMessage={handleSendMessage}
                      chatHistory={chatHistory}
                      isLoading={isApiLoading}
                    />
                  </motion.div>
                )}

                {activeTab === "nav" && (
                  <motion.div
                    key="nav"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full"
                  >
                    <NavigationModule
                      facilities={facilities}
                      onSelectRoute={handleGetRoute}
                      routeSource={routeSource}
                      routeDestination={routeDestination}
                      setRouteSource={setRouteSource}
                      setRouteDestination={setRouteDestination}
                      navigationPath={navigationPath}
                      routeSteps={routeSteps}
                      estimatedTime={estimatedTime}
                      estimatedDistance={estimatedDistance}
                      isLoading={isApiLoading}
                      accessibilityEnabled={userProfile.accessibilityEnabled}
                      setAccessibilityEnabled={(v) => handleProfileChange("accessibilityEnabled", v)}
                    />
                  </motion.div>
                )}

                {activeTab === "crowd" && (
                  <motion.div
                    key="crowd"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full"
                  >
                    <CrowdDashboard
                      facilities={facilities}
                      onGetAIRecommendations={handleGetAIRecommendations}
                      stadiumOccupancy={stadiumStats.occupancy}
                      maxCapacity={stadiumStats.maxCapacity}
                    />
                  </motion.div>
                )}

                {activeTab === "a11y" && (
                  <motion.div
                    key="a11y"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full"
                  >
                    <AccessibilitySuite
                      userProfile={userProfile}
                      onChangeProfileSetting={handleProfileChange}
                      onAnalyzeScene={handleAnalyzeScene}
                    />
                  </motion.div>
                )}

                {activeTab === "translate" && (
                  <motion.div
                    key="translate"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full"
                  >
                    <MultilingualAssistant
                      userProfile={userProfile}
                      onChangeProfileSetting={handleProfileChange}
                      onTranslateText={handleTranslateText}
                    />
                  </motion.div>
                )}

                {activeTab === "roles" && (
                  <motion.div
                    key="roles"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full space-y-4"
                  >
                    {userProfile.role === UserRole.FAN ? (
                      <div className="bg-[#1E293B]/80 border border-slate-800 p-8 rounded-2xl text-center space-y-4 shadow-xl">
                        <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto text-xl">
                          🔐
                        </div>
                        <div className="max-w-xs mx-auto">
                          <h3 className="font-display font-extrabold text-sm text-slate-200">
                            Operations Dashboard Locked
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            You are currently logged in as a <strong>Fan</strong>. Operational dashboards are reserved for Rostered Volunteers, Stadium Staff, and Organizers.
                          </p>
                        </div>
                        
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-w-sm mx-auto space-y-3">
                          <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase font-bold block">
                            Switch Role Simulator
                          </span>
                          <div className="flex flex-col gap-2 text-xs">
                            <button
                              onClick={() => handleProfileChange("role", UserRole.VOLUNTEER)}
                              className="w-full bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-slate-300 font-semibold"
                            >
                              🤝 Simulate as Rostered Volunteer
                            </button>
                            <button
                              onClick={() => handleProfileChange("role", UserRole.ORGANIZER)}
                              className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-xl text-white font-semibold"
                            >
                              👑 Simulate as Command Center Organizer
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : userProfile.role === UserRole.VOLUNTEER ? (
                      <VolunteerDashboard
                        facilities={facilities}
                        incidents={incidents}
                        volunteers={volunteers}
                        onUpdateCrowd={handleUpdateCrowd}
                        onResolveIncident={handleResolveIncident}
                      />
                    ) : (
                      <OrganizerStaffDashboard
                        facilities={facilities}
                        incidents={incidents}
                        volunteers={volunteers}
                        stadiumOccupancy={stadiumStats.occupancy}
                        maxCapacity={stadiumStats.maxCapacity}
                        parkingAvailable={stadiumStats.parkingAvailable}
                        parkingTotal={stadiumStats.parkingTotal}
                        onToggleGate={handleToggleGate}
                        onReportIncident={handleReportIncident}
                        onDeployVolunteer={handleDeployVolunteer}
                        onResolveIncident={handleResolveIncident}
                        onGetAIRecommendations={handleGetAIRecommendations}
                      />
                    )}
                  </motion.div>
                )}

                {activeTab === "ticket" && (
                  <motion.div
                    key="ticket"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full"
                  >
                    <ProfileModule
                      userProfile={userProfile}
                      onChangeProfileSetting={handleProfileChange}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </main>

        {/* FOOTER & LIVE PUSH NOTIFICATIONS BAR */}
        <footer className="w-full px-4 md:px-6 py-4 mt-auto border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 select-none">
          <p>© 2026 FIFA World Cup™ Smart Arena Coordinator. Built with Gemini Pro Advanced Vision.</p>
          
          {alerts.length > 0 && (
            <div className="bg-[#1E293B] border border-slate-800 p-2 rounded-xl flex items-center gap-3.5 max-w-sm shadow-md">
              <span className="text-base shrink-0">🔔</span>
              <div className="flex-1 min-w-0">
                <span className="text-[8px] font-mono bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-1 py-0.5 rounded font-bold uppercase">
                  {alerts[0].type} alert
                </span>
                <p className="text-slate-300 truncate font-semibold text-[10px] mt-0.5">{alerts[0].title}</p>
                <p className="text-[9px] text-slate-400 truncate leading-tight">{alerts[0].message}</p>
              </div>
              <button
                onClick={() => {
                  setAlerts((prev) => prev.slice(1));
                }}
                className="text-[9px] text-slate-500 hover:text-white shrink-0 bg-slate-900/60 px-1.5 py-0.5 rounded"
              >
                Dismiss
              </button>
            </div>
          )}
        </footer>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

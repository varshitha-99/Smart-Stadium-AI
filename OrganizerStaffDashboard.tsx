/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Navigation, MapPin, Loader2, ArrowRightLeft, Clock, Compass, HelpCircle } from "lucide-react";
import { Facility, FacilityType } from "./types";

interface NavigationModuleProps {
  facilities: Facility[];
  onSelectRoute: (sourceId: string, destId: string, accessibilityEnabled: boolean) => Promise<void>;
  routeSource: Facility | null;
  routeDestination: Facility | null;
  setRouteSource: (f: Facility | null) => void;
  setRouteDestination: (f: Facility | null) => void;
  navigationPath: { x: number; y: number }[] | null;
  routeSteps: string | null;
  estimatedTime: number | null;
  estimatedDistance: number | null;
  isLoading: boolean;
  accessibilityEnabled: boolean;
  setAccessibilityEnabled: (v: boolean) => void;
}

export default function NavigationModule({
  facilities,
  onSelectRoute,
  routeSource,
  routeDestination,
  setRouteSource,
  setRouteDestination,
  navigationPath,
  routeSteps,
  estimatedTime,
  estimatedDistance,
  isLoading,
  accessibilityEnabled,
  setAccessibilityEnabled
}: NavigationModuleProps) {
  const [sourceSearch, setSourceSearch] = useState("");
  const [destSearch, setDestSearch] = useState("");

  const filteredSources = facilities
    .filter(f => f.name.toLowerCase().includes(sourceSearch.toLowerCase()))
    .slice(0, 5);

  const filteredDests = facilities
    .filter(f => f.name.toLowerCase().includes(destSearch.toLowerCase()))
    .slice(0, 5);

  const swapSourceDest = () => {
    const temp = routeSource;
    setRouteSource(routeDestination);
    setRouteDestination(temp);
  };

  const triggerRouting = () => {
    if (routeSource && routeDestination) {
      onSelectRoute(routeSource.id, routeDestination.id, accessibilityEnabled);
    }
  };

  // Helper to get category headers for POIs
  const getFacilityEmoji = (type: FacilityType) => {
    switch (type) {
      case FacilityType.ENTRANCE: return "🚪";
      case FacilityType.EXIT: return "🚪";
      case FacilityType.SEAT: return "💺";
      case FacilityType.FOOD_COURT:
      case FacilityType.FOOD_STALL: return "🍔";
      case FacilityType.WASHROOM:
      case FacilityType.ACCESSIBLE_WASHROOM: return "🚾";
      case FacilityType.MEDICAL:
      case FacilityType.FIRST_AID: return "❤️";
      case FacilityType.SECURITY: return "👮";
      case FacilityType.ELEVATOR: return "🛗";
      case FacilityType.PARKING: return "🅿️";
      case FacilityType.TAXI: return "🚕";
      case FacilityType.BUS: return "🚌";
      default: return "📍";
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl shadow-xl h-full">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Navigation className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-slate-100">
            AI Smart Wayfinding
          </h3>
          <p className="text-[10px] text-slate-400">
            Custom segmenting path & conversational directions by Gemini AI
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="flex flex-col gap-3 relative">
        {/* Source selector */}
        <div className="relative">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Starting Location</span>
          <div className="relative">
            <input
              type="text"
              id="nav-search-start-input"
              value={routeSource ? routeSource.name : sourceSearch}
              onChange={(e) => {
                setRouteSource(null);
                setSourceSearch(e.target.value);
              }}
              placeholder="Search seat, block, gate, restrooms..."
              className="w-full bg-slate-800 border border-slate-800 focus:border-indigo-600 text-xs text-slate-100 rounded-xl py-2.5 pl-8 pr-4"
              aria-label="Search starting location"
            />
            <MapPin className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-3" />
            
            {routeSource && (
              <button
                onClick={() => { setRouteSource(null); setSourceSearch(""); }}
                className="absolute right-2.5 top-2.5 text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded"
                aria-label="Clear starting location input"
              >
                Clear
              </button>
            )}
          </div>

          {/* Source dropdown search suggestions */}
          {!routeSource && sourceSearch && filteredSources.length > 0 && (
            <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1 overflow-hidden">
              {filteredSources.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setRouteSource(f); setSourceSearch(f.name); }}
                  className="w-full text-left text-xs text-slate-300 hover:text-white hover:bg-slate-900 px-3 py-2 rounded-lg flex items-center gap-2"
                  aria-label={`Select starting location: ${f.name}`}
                >
                  <span>{getFacilityEmoji(f.type)}</span>
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button floating in right side */}
        <div className="absolute right-4 top-[40px] z-10">
          <button
            onClick={swapSourceDest}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-slate-300 hover:text-white transition-colors"
            title="Swap Source and Destination"
            aria-label="Swap starting location and destination"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 rotate-90" />
          </button>
        </div>

        {/* Destination selector */}
        <div className="relative">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Destination Location</span>
          <div className="relative">
            <input
              type="text"
              id="nav-search-dest-input"
              value={routeDestination ? routeDestination.name : destSearch}
              onChange={(e) => {
                setRouteDestination(null);
                setDestSearch(e.target.value);
              }}
              placeholder="Search washroom, food stall, VIP..."
              className="w-full bg-slate-800 border border-slate-800 focus:border-indigo-600 text-xs text-slate-100 rounded-xl py-2.5 pl-8 pr-4"
              aria-label="Search destination location"
            />
            <MapPin className="w-3.5 h-3.5 text-rose-500 absolute left-2.5 top-3" />
            
            {routeDestination && (
              <button
                onClick={() => { setRouteDestination(null); setDestSearch(""); }}
                className="absolute right-2.5 top-2.5 text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded"
                aria-label="Clear destination input"
              >
                Clear
              </button>
            )}
          </div>

          {/* Dest dropdown search suggestions */}
          {!routeDestination && destSearch && filteredDests.length > 0 && (
            <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1 overflow-hidden">
              {filteredDests.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setRouteDestination(f); setDestSearch(f.name); }}
                  className="w-full text-left text-xs text-slate-300 hover:text-white hover:bg-slate-900 px-3 py-2 rounded-lg flex items-center gap-2"
                  aria-label={`Select destination location: ${f.name}`}
                >
                  <span>{getFacilityEmoji(f.type)}</span>
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Accessibility Checkbox for wheel chairs */}
      <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-sm">♿</span>
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Wheelchair Assistance Routing</span>
            <span className="text-[10px] text-slate-400 block">Prioritizes elevator lifts, low-gradient ramps & level corridors</span>
          </div>
        </div>
        <label htmlFor="nav-accessibility-toggle" className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="nav-accessibility-toggle"
            checked={accessibilityEnabled}
            onChange={(e) => setAccessibilityEnabled(e.target.checked)}
            className="sr-only peer"
            aria-label="Request wheelchair assistance routing path"
          />
          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
        </label>
      </div>

      {/* Calculate Route Trigger Button */}
      <button
        onClick={triggerRouting}
        disabled={isLoading || !routeSource || !routeDestination}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-display font-medium py-3 rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Generate Route and Walkthrough Directions"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Calculating dynamic paths...</span>
          </>
        ) : (
          <>
            <Compass className="w-4 h-4" />
            <span>Generate Route & Walkthrough</span>
          </>
        )}
      </button>

      {/* Map Hint helper */}
      {!routeSource && !routeDestination && (
        <p className="text-[10px] text-indigo-400 italic text-center">
          💡 Quick Tip: Click facilities directly on the map to set them as route targets.
        </p>
      )}

      {/* Route results panel */}
      {navigationPath && routeSteps && (
        <div className="flex-1 overflow-y-auto bg-slate-950/50 rounded-xl border border-slate-800 p-3 mt-1 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">EST. WALKING TIME</span>
              <p className="text-sm font-bold text-indigo-400 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                {estimatedTime} mins
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">WALK DISTANCE</span>
              <p className="text-sm font-bold text-indigo-400 flex items-center justify-center gap-1 mt-0.5">
                <Compass className="w-3.5 h-3.5" />
                {estimatedDistance} meters
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Gemini Natural Guidance
            </span>
            <div className="bg-indigo-950/20 border border-indigo-900/30 p-3 rounded-xl">
              <p className="text-xs md:text-sm text-indigo-200 italic leading-relaxed">
                "{routeSteps}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

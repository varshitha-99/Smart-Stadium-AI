/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Users, AlertTriangle, ArrowRight, Loader2, RefreshCcw, ThumbsUp, Activity } from "lucide-react";
import { Facility, FacilityType } from "./types";

interface CrowdDashboardProps {
  facilities: Facility[];
  onGetAIRecommendations: () => Promise<string>;
  stadiumOccupancy: number;
  maxCapacity: number;
}

export default function CrowdDashboard({
  facilities,
  onGetAIRecommendations,
  stadiumOccupancy,
  maxCapacity
}: CrowdDashboardProps) {
  const [aiTips, setAiTips] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter gates
  const entrances = facilities.filter(f => f.type === FacilityType.ENTRANCE);
  
  // Find critical gates
  const criticalGates = entrances.filter(g => g.crowdLevel === "Critical" || g.crowdLevel === "High");
  // Find fast gates
  const fastGates = entrances.filter(g => g.crowdLevel === "Low" && g.isOpen);

  // Find busy washrooms/food
  const busyFacilities = facilities
    .filter(f => f.type !== FacilityType.SEAT && f.type !== FacilityType.ENTRANCE && f.type !== FacilityType.EXIT)
    .filter(f => f.crowdLevel === "Critical" || f.crowdLevel === "High")
    .slice(0, 3);

  // Find clean/empty facilities of same types
  const emptyFacilities = facilities
    .filter(f => f.type !== FacilityType.SEAT && f.type !== FacilityType.ENTRANCE && f.type !== FacilityType.EXIT)
    .filter(f => f.crowdLevel === "Low" && f.isOpen)
    .slice(0, 3);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const tips = await onGetAIRecommendations();
      setAiTips(tips);
    } catch (e) {
      setAiTips("### Live Recommendations\n- Open Gate F auxiliary lanes.\n- Reroute South Plaza shuttle buses to North Parking P1.");
    } finally {
      setIsLoading(false);
    }
  };

  const occupancyPercent = Math.round((stadiumOccupancy / maxCapacity) * 100);

  return (
    <div className="flex flex-col gap-4 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl shadow-xl h-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-100">
              Crowd Load Diagnostics
            </h3>
            <p className="text-[10px] text-slate-400">
              Live capacity monitoring and AI rerouting suggestions
            </p>
          </div>
        </div>
        
        {/* Occupancy Indicator */}
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">STADIUM LOAD</span>
          <span className="text-xs font-bold text-indigo-400">{stadiumOccupancy.toLocaleString()} / {maxCapacity.toLocaleString()} ({occupancyPercent}%)</span>
        </div>
      </div>

      {/* Load Meter graph bar */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span>Current Attendees inside</span>
          <span>Max Capacity</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-500 h-full transition-all duration-1000"
            style={{ width: `${occupancyPercent}%` }}
          />
        </div>
      </div>

      {/* Grid for Critical bottlenecks vs alternatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Busy Gates bottlenecks */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Active Bottlenecks
          </span>
          <div className="space-y-2">
            {criticalGates.map((gate) => (
              <div key={gate.id} className="flex justify-between items-center text-xs">
                <span className="text-slate-200 font-semibold">{gate.name}</span>
                <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                  Wait: {gate.waitTime}m ({gate.crowdLevel})
                </span>
              </div>
            ))}
            {criticalGates.length === 0 && (
              <p className="text-[10px] text-slate-500 italic">No critical gate bottleneck reported.</p>
            )}
          </div>
        </div>

        {/* Shorter queue alternatives */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <ThumbsUp className="w-3.5 h-3.5" />
            Fast Alternates
          </span>
          <div className="space-y-2">
            {fastGates.map((gate) => (
              <div key={gate.id} className="flex justify-between items-center text-xs">
                <span className="text-slate-200 font-semibold">{gate.name}</span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                  Wait: {gate.waitTime}m ({gate.crowdLevel})
                </span>
              </div>
            ))}
            {fastGates.length === 0 && (
              <p className="text-[10px] text-slate-500 italic">No alternative gate currently open.</p>
            )}
          </div>
        </div>
      </div>

      {/* Facilities loads list */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
          Dining / Washroom Congestions
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Overcrowded facilities */}
          <div className="space-y-1.5">
            <span className="text-slate-500 text-[10px] uppercase">AVOID (High wait time)</span>
            <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5">
              {busyFacilities.map((fac) => (
                <div key={fac.id} className="flex justify-between items-center">
                  <span className="text-slate-300 truncate max-w-[130px]">{fac.name}</span>
                  <span className="text-rose-400 font-mono text-[10px]">{fac.waitTime}m wait</span>
                </div>
              ))}
            </div>
          </div>

          {/* Empty facilities */}
          <div className="space-y-1.5">
            <span className="text-slate-500 text-[10px] uppercase">USE INSTEAD (Zero wait)</span>
            <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5">
              {emptyFacilities.map((fac) => (
                <div key={fac.id} className="flex justify-between items-center">
                  <span className="text-slate-300 truncate max-w-[130px]">{fac.name}</span>
                  <span className="text-emerald-400 font-mono text-[10px]">{fac.waitTime}m wait</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gemini Live suggestions trigger */}
      <div className="border-t border-slate-800 pt-3 mt-1">
        <button
          onClick={fetchRecommendations}
          disabled={isLoading}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-display font-medium py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-40"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Querying Gemini flow engines...</span>
            </>
          ) : (
            <>
              <RefreshCcw className="w-4 h-4 text-indigo-400" />
              <span>Consult Gemini Live Dispersal AI</span>
            </>
          )}
        </button>

        {aiTips && (
          <div className="bg-indigo-950/20 border border-indigo-900/30 p-3.5 rounded-xl mt-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs">🤖</span>
              <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider font-bold">
                Gemini Flow Intelligence advice
              </span>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed italic whitespace-pre-line">
              {aiTips}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

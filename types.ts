/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Shield, MapPin, Users, ToggleLeft, ToggleRight, AlertCircle, Sparkles, Loader2, Play, CheckCircle } from "lucide-react";
import { Facility, FacilityType, Incident, Volunteer } from "./types";

interface OrganizerStaffDashboardProps {
  facilities: Facility[];
  incidents: Incident[];
  volunteers: Volunteer[];
  stadiumOccupancy: number;
  maxCapacity: number;
  parkingAvailable: number;
  parkingTotal: number;
  onToggleGate: (facilityId: string, isOpen: boolean) => Promise<void>;
  onReportIncident: (title: string, description: string, locationId: string, severity: string) => Promise<void>;
  onDeployVolunteer: (volunteerId: string, locationId: string, incidentId?: string) => Promise<void>;
  onResolveIncident: (incidentId: string) => Promise<void>;
  onGetAIRecommendations: () => Promise<string>;
}

export default function OrganizerStaffDashboard({
  facilities,
  incidents,
  volunteers,
  stadiumOccupancy,
  maxCapacity,
  parkingAvailable,
  parkingTotal,
  onToggleGate,
  onReportIncident,
  onDeployVolunteer,
  onResolveIncident,
  onGetAIRecommendations
}: OrganizerStaffDashboardProps) {
  const [recText, setRecText] = useState<string | null>(null);
  const [isRecLoading, setIsRecLoading] = useState(false);

  // Form states for reporting incident
  const [newIncTitle, setNewIncTitle] = useState("");
  const [newIncDesc, setNewIncDesc] = useState("");
  const [newIncLoc, setNewIncLoc] = useState("");
  const [newIncSeverity, setNewIncSeverity] = useState("High");

  // Selection states for dispatching volunteer
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>("");
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>("");

  const entrances = facilities.filter(f => f.type === FacilityType.ENTRANCE);
  const openIncidents = incidents.filter(i => i.status !== "Resolved");
  const availableVolunteers = volunteers.filter(v => v.status === "Available");

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncTitle || !newIncDesc || !newIncLoc) return;
    
    await onReportIncident(newIncTitle, newIncDesc, newIncLoc, newIncSeverity);
    
    // reset
    setNewIncTitle("");
    setNewIncDesc("");
    setNewIncLoc("");
  };

  const handleDispatch = async () => {
    if (!selectedVolunteerId) return;
    
    // Find incident to grab its location
    const incident = incidents.find(i => i.id === selectedIncidentId);
    const targetLocId = incident ? incident.locationId : "info-desk";

    await onDeployVolunteer(selectedVolunteerId, targetLocId, selectedIncidentId || undefined);

    // reset selections
    setSelectedIncidentId("");
    setSelectedVolunteerId("");
  };

  const fetchAIRecommendations = async () => {
    setIsRecLoading(true);
    try {
      const recommendations = await onGetAIRecommendations();
      setRecText(recommendations);
    } catch (error) {
      setRecText("### Operational Recommendations\n- **Crowd flow**: Open Gates C and D to relieve Gate E pressure.\n- **First Aid**: Deploy medical teams near Gate E for hydration alerts.");
    } finally {
      setIsRecLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-md">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Arena Occupancy</span>
          <p className="text-lg md:text-xl font-bold font-display text-indigo-400 mt-1">
            {stadiumOccupancy.toLocaleString()}
          </p>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            {Math.round(stadiumOccupancy / maxCapacity * 100)}% Max limit ({maxCapacity.toLocaleString()})
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-md">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Parking Slots</span>
          <p className="text-lg md:text-xl font-bold font-display text-emerald-400 mt-1">
            {parkingAvailable} / {parkingTotal}
          </p>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            {Math.round(parkingAvailable / parkingTotal * 100)}% vacant lots
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-md col-span-1">
          <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold text-rose-400">Open Incidents</span>
          <p className="text-lg md:text-xl font-bold font-display text-rose-500 mt-1">
            {openIncidents.length}
          </p>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            Requires dispatch operations
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-md col-span-1">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Staff Available</span>
          <p className="text-lg md:text-xl font-bold font-display text-sky-400 mt-1">
            {availableVolunteers.length} / {volunteers.length}
          </p>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            Active rostered guides
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Entrance Gate Toggles */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2.5">
            Stadium Perimeter Gate Security Controls
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {entrances.map((gate) => (
              <div 
                key={gate.id} 
                className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-semibold block text-slate-200 truncate max-w-[100px]">{gate.name.replace("(Entrance)", "")}</span>
                  <span className={`text-[9px] font-semibold ${gate.isOpen ? "text-emerald-400" : "text-rose-500"}`}>
                    {gate.isOpen ? "OPEN" : "CLOSED"}
                  </span>
                </div>
                <button
                  onClick={() => onToggleGate(gate.id, !gate.isOpen)}
                  className="text-slate-400 hover:text-white"
                >
                  {gate.isOpen ? (
                    <ToggleRight className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-500" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Volunteer Dispatch Console */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2.5">
              Volunteer Dispatch & Task Coordinator
            </span>
            
            <div className="space-y-3 text-xs">
              {/* Select Incident */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Target Incident</label>
                <select
                  value={selectedIncidentId}
                  onChange={(e) => setSelectedIncidentId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg py-2 px-2.5 outline-none"
                >
                  <option value="">General Deployment (No Specific Incident)</option>
                  {openIncidents.map((i) => (
                    <option key={i.id} value={i.id}>
                      [{i.severity}] {i.title} ({i.locationName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Volunteer */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Rostered Volunteer</label>
                <select
                  value={selectedVolunteerId}
                  onChange={(e) => setSelectedVolunteerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg py-2 px-2.5 outline-none"
                >
                  <option value="">Choose Available Volunteer...</option>
                  {availableVolunteers.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} - {v.role} ({v.locationName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleDispatch}
            disabled={!selectedVolunteerId}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-40"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Dispatch Volunteer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Incident List */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Command Center Incident Log
          </span>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {incidents.map((inc) => (
              <div 
                key={inc.id} 
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      inc.severity === "Emergency" ? "bg-rose-500 animate-ping" : "bg-amber-400"
                    }`}></span>
                    <strong className="text-slate-200">{inc.title}</strong>
                  </div>
                  <p className="text-[10px] text-slate-400">{inc.description}</p>
                  <div className="flex gap-2 text-[9px] text-slate-500">
                    <span>Location: <strong className="text-slate-400">{inc.locationName}</strong></span>
                    <span>• Reporter: {inc.reportedBy}</span>
                  </div>
                  {inc.assignedVolunteerName && (
                    <div className="text-[9px] bg-indigo-950/40 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/30 inline-block">
                      Dispatched: {inc.assignedVolunteerName}
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between items-end shrink-0">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                    inc.status === "Resolved" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : inc.status === "Dispatched"
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    {inc.status}
                  </span>

                  {inc.status !== "Resolved" && (
                    <button
                      onClick={() => onResolveIncident(inc.id)}
                      className="text-[9px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5 mt-2 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/30"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report New Incident */}
        <form onSubmit={handleCreateIncident} className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-2.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Manually Log New Incident
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Incident Title</label>
              <input
                type="text"
                value={newIncTitle}
                onChange={(e) => setNewIncTitle(e.target.value)}
                placeholder="e.g. Spill, Medical request..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 px-2.5 text-slate-100"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Target Location</label>
              <select
                value={newIncLoc}
                onChange={(e) => setNewIncLoc(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-2 text-slate-200"
                required
              >
                <option value="">Select facility...</option>
                {facilities.filter(f => f.type !== FacilityType.SEAT).map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 block mb-0.5">Short Description</label>
              <input
                type="text"
                value={newIncDesc}
                onChange={(e) => setNewIncDesc(e.target.value)}
                placeholder="e.g. Fan slipped on wet steps, needs ice pack."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 px-2.5 text-slate-100"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Severity</label>
              <select
                value={newIncSeverity}
                onChange={(e) => setNewIncSeverity(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 px-2 text-slate-200"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold py-2 rounded-xl transition-all shadow-md mt-1"
          >
            Log Emergency Incident
          </button>
        </form>
      </div>

      {/* Organizer Advisory recommendations from Gemini */}
      <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <button
          onClick={fetchAIRecommendations}
          disabled={isRecLoading}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-display font-medium py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
        >
          {isRecLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Synthesizing command center recommendations...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Consult Gemini Command Advisory AI</span>
            </>
          )}
        </button>

        {recText && (
          <div className="bg-indigo-950/20 border border-indigo-900/30 p-4 rounded-xl mt-3 space-y-2">
            <div className="flex items-center gap-1.5 border-b border-indigo-900/30 pb-1.5">
              <span>🛡️</span>
              <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider font-bold">
                Strategic AI Recommendations
              </span>
            </div>
            <div className="text-xs md:text-sm text-indigo-200 leading-relaxed italic whitespace-pre-line">
              {recText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

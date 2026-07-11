/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MapPin, Navigation, Info, Shield, Users, Activity, Eye, Compass } from "lucide-react";
import { Facility, FacilityType, Incident, Volunteer } from "./types";

interface StadiumMapProps {
  facilities: Facility[];
  selectedFacility: Facility | null;
  onSelectFacility: (facility: Facility | null) => void;
  navigationPath: { x: number; y: number }[] | null;
  routeSource: Facility | null;
  routeDestination: Facility | null;
  showHeatmap: boolean;
  showWheelchairRoutes: boolean;
  incidents: Incident[];
  volunteers: Volunteer[];
}

export default function StadiumMap({
  facilities,
  selectedFacility,
  onSelectFacility,
  navigationPath,
  routeSource,
  routeDestination,
  showHeatmap,
  showWheelchairRoutes,
  incidents,
  volunteers
}: StadiumMapProps) {
  const [hoveredFacility, setHoveredFacility] = useState<Facility | null>(null);

  // Helper to resolve color based on crowd level
  const getCrowdColorClass = (crowdLevel: string) => {
    switch (crowdLevel) {
      case "Low":
        return "fill-emerald-500/30 stroke-emerald-500";
      case "Medium":
        return "fill-amber-500/30 stroke-amber-500";
      case "High":
        return "fill-orange-600/35 stroke-orange-600";
      case "Critical":
        return "fill-rose-700/40 stroke-rose-600";
      default:
        return "fill-slate-700/30 stroke-slate-500";
    }
  };

  const getMarkerIcon = (type: FacilityType) => {
    switch (type) {
      case FacilityType.ENTRANCE:
      case FacilityType.EXIT:
        return "🚪";
      case FacilityType.FOOD_COURT:
      case FacilityType.FOOD_STALL:
        return "🍔";
      case FacilityType.WASHROOM:
      case FacilityType.ACCESSIBLE_WASHROOM:
        return "🚾";
      case FacilityType.MEDICAL:
      case FacilityType.FIRST_AID:
        return "❤️";
      case FacilityType.SECURITY:
        return "👮";
      case FacilityType.ELEVATOR:
        return "🛗";
      case FacilityType.WHEELCHAIR_ROUTE:
        return "♿";
      case FacilityType.PARKING:
        return "🅿️";
      case FacilityType.TAXI:
        return "🚕";
      case FacilityType.BUS:
        return "🚌";
      default:
        return "📍";
    }
  };

  return (
    <div className="relative w-full aspect-square md:aspect-[4/3] bg-slate-950 rounded-2xl border border-slate-800 p-4 overflow-hidden select-none shadow-2xl">
      {/* Map Header / Legend */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2 text-[10px] md:text-xs bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
          <span>Low Crowd</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-600 block"></span>
          <span>High</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 block"></span>
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1 border-l border-slate-700 pl-2 text-indigo-400">
          <span className="animate-ping w-1.5 h-1.5 rounded-full bg-indigo-400 block"></span>
          <span>Volunteers</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-10 flex gap-1 bg-slate-900/90 backdrop-blur-md px-2 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-400">
        <Compass className="w-4 h-4 text-slate-400 animate-pulse" />
        <span className="font-mono text-[10px]">FIFA 2026 STADIUM ARENA</span>
      </div>

      {/* Primary Stadium Layout Render */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        id="stadium-vector-map"
      >
        {/* Outer Circle (Concourse Ring) */}
        <circle
          cx="50"
          cy="50"
          r="48"
          className="fill-slate-900 stroke-slate-800 stroke-[0.8]"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          className="fill-none stroke-slate-800/40 stroke-[0.5] stroke-dasharray-[1,1]"
        />
        
        {/* Pitch Area (Center Zone) */}
        <g id="stadium-pitch">
          {/* Outer field lines */}
          <rect
            x="38"
            y="38"
            width="24"
            height="24"
            rx="1.5"
            className="fill-emerald-900/45 stroke-emerald-500/30 stroke-[0.5]"
          />
          {/* Inner pitch lines */}
          <rect
            x="40"
            y="40"
            width="20"
            height="20"
            className="fill-emerald-800/20 stroke-emerald-500/20 stroke-[0.3]"
          />
          {/* Midfield line */}
          <line
            x1="50"
            y1="40"
            x2="50"
            y2="60"
            className="stroke-emerald-500/20 stroke-[0.3]"
          />
          {/* Center circle */}
          <circle
            cx="50"
            cy="50"
            r="3.5"
            className="fill-none stroke-emerald-500/20 stroke-[0.3]"
          />
        </g>

        {/* Dynamic Heatmap Overlay */}
        {showHeatmap && (
          <g id="heatmap-overlay" className="pointer-events-none">
            {facilities.map((fac) => {
              let color = "rgba(16, 185, 129, 0.15)";
              let radius = 6;
              if (fac.crowdLevel === "Medium") {
                color = "rgba(245, 158, 11, 0.25)";
                radius = 8;
              } else if (fac.crowdLevel === "High") {
                color = "rgba(234, 88, 12, 0.4)";
                radius = 11;
              } else if (fac.crowdLevel === "Critical") {
                color = "rgba(225, 29, 72, 0.55)";
                radius = 14;
              }
              return (
                <circle
                  key={`heat-${fac.id}`}
                  cx={fac.x}
                  cy={fac.y}
                  r={radius}
                  fill={color}
                  className="blur-[2px] transition-all duration-1000"
                />
              );
            })}
          </g>
        )}

        {/* 12 Seating Blocks (Shaded by occupancy) */}
        <g id="seating-blocks">
          {facilities
            .filter((f) => f.type === FacilityType.SEAT)
            .map((fac) => {
              // Calculate angles for ring segmenting
              const idx = parseInt(fac.id.replace("block-", "")) - 101;
              const angleStart = (idx * 30 * Math.PI) / 180 - Math.PI / 12;
              const angleEnd = ((idx + 1) * 30 * Math.PI) / 180 - Math.PI / 12;
              
              const innerRadius = 24;
              const outerRadius = 32;
              
              const x1 = 50 + innerRadius * Math.cos(angleStart);
              const y1 = 50 + innerRadius * Math.sin(angleStart);
              const x2 = 50 + outerRadius * Math.cos(angleStart);
              const y2 = 50 + outerRadius * Math.sin(angleStart);
              
              const x3 = 50 + outerRadius * Math.cos(angleEnd);
              const y3 = 50 + outerRadius * Math.sin(angleEnd);
              const x4 = 50 + innerRadius * Math.cos(angleEnd);
              const y4 = 50 + innerRadius * Math.sin(angleEnd);

              const pathData = `
                M ${x1} ${y1}
                L ${x2} ${y2}
                A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3}
                L ${x4} ${y4}
                A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}
                Z
              `;

              const isSelected = selectedFacility?.id === fac.id;

              return (
                <path
                  key={fac.id}
                  d={pathData}
                  className={`${getCrowdColorClass(fac.crowdLevel)} cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? "stroke-white stroke-[0.8] fill-indigo-600/45" 
                      : "stroke-slate-800 hover:fill-slate-400/25 stroke-[0.2]"
                  }`}
                  onClick={() => onSelectFacility(fac)}
                  onMouseEnter={() => setHoveredFacility(fac)}
                  onMouseLeave={() => setHoveredFacility(null)}
                />
              );
            })}
        </g>

        {/* Wheelchair Paths (Optional toggle overlay) */}
        {showWheelchairRoutes && (
          <g id="wheelchair-priority-routes" className="pointer-events-none">
            {/* Wheelchair route around West Concourse */}
            <path
              d="M 5 50 A 45 45 0 0 1 50 5"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.6"
              strokeDasharray="1,1"
              className="opacity-70"
            />
            <path
              d="M 5 50 A 45 45 0 0 0 50 95"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.6"
              strokeDasharray="1,1"
              className="opacity-70"
            />
          </g>
        )}

        {/* AI Navigation Walkway Path (Calculated on backend) */}
        {navigationPath && navigationPath.length > 1 && (
          <g id="navigation-path">
            {/* Pulsing glow background path */}
            <path
              d={`M ${navigationPath.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-50 animate-pulse"
            />
            {/* Sharp core path */}
            <path
              d={`M ${navigationPath.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
              fill="none"
              stroke="#818cf8"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1.5,1.5"
            />
            
            {/* Route Source Glow Anchor */}
            <circle
              cx={navigationPath[0].x}
              cy={navigationPath[0].y}
              r="1.8"
              fill="#22c55e"
              className="stroke-white stroke-[0.2]"
            />
            {/* Route Destination Glow Anchor */}
            <circle
              cx={navigationPath[navigationPath.length - 1].x}
              cy={navigationPath[navigationPath.length - 1].y}
              r="2.2"
              fill="#ef4444"
              className="stroke-white stroke-[0.2] animate-bounce"
            />
          </g>
        )}

        {/* Clickable POI Markers */}
        <g id="facility-poi-markers">
          {facilities
            .filter((f) => f.type !== FacilityType.SEAT)
            .map((fac) => {
              const isSelected = selectedFacility?.id === fac.id;
              const isSource = routeSource?.id === fac.id;
              const isDest = routeDestination?.id === fac.id;

              let ringColor = "stroke-slate-500";
              let baseFill = "fill-slate-900";
              
              if (isSource) {
                ringColor = "stroke-emerald-400 stroke-[0.6]";
                baseFill = "fill-emerald-950";
              } else if (isDest) {
                ringColor = "stroke-rose-500 stroke-[0.8]";
                baseFill = "fill-rose-950";
              } else if (isSelected) {
                ringColor = "stroke-indigo-400 stroke-[0.6]";
                baseFill = "fill-indigo-950";
              }

              // Hide exit gates unless specifically focused to prevent clutter, 
              // except major ones or if they're selected.
              if (fac.type === FacilityType.EXIT && !isSelected && !isSource && !isDest && hoveredFacility?.id !== fac.id) {
                return null;
              }

              return (
                <g
                  key={fac.id}
                  transform={`translate(${fac.x}, ${fac.y})`}
                  className="cursor-pointer"
                  onClick={() => onSelectFacility(fac)}
                  onMouseEnter={() => setHoveredFacility(fac)}
                  onMouseLeave={() => setHoveredFacility(null)}
                >
                  {/* Invisible larger hit target for stable mouse hover/click interaction */}
                  <circle
                    r="4"
                    className="fill-transparent stroke-none pointer-events-auto"
                  />
                  <circle
                    r={isSelected ? "2.3" : "1.8"}
                    className={`${baseFill} ${ringColor} stroke-[0.35] shadow-lg transition-all duration-200`}
                  />
                  <text
                    y="0.6"
                    fontSize="1.2"
                    textAnchor="middle"
                    className="select-none pointer-events-none font-sans font-bold fill-white"
                  >
                    {getMarkerIcon(fac.type).substring(0, 2)}
                  </text>
                </g>
              );
            })}
        </g>

        {/* Live Volunteer Location Pins */}
        <g id="live-volunteer-dots">
          {volunteers
            .filter((v) => v.status !== "Offline")
            .map((vol) => {
              const volLocation = facilities.find((f) => f.id === vol.currentLocationId);
              if (!volLocation) return null;
              
              // Shift volunteer slightly so they don't overlay exactly on center of POI
              const vx = volLocation.x + 1.8;
              const vy = volLocation.y + 1.8;

              return (
                <g key={`live-vol-${vol.id}`} className="pointer-events-none">
                  {/* Outer pulsing ping */}
                  <circle
                    cx={vx}
                    cy={vy}
                    r="1.6"
                    fill="#818cf8"
                    className="opacity-60 animate-ping"
                  />
                  {/* Inner core dot */}
                  <circle
                    cx={vx}
                    cy={vy}
                    r="0.8"
                    fill="#4f46e5"
                    stroke="#ffffff"
                    strokeWidth="0.15"
                  />
                </g>
              );
            })}
        </g>

        {/* Live Incident Pins (Security, Medical) */}
        <g id="live-incident-pings">
          {incidents
            .filter((i) => i.status !== "Resolved")
            .map((inc) => {
              const incLoc = facilities.find((f) => f.id === inc.locationId);
              if (!incLoc) return null;

              // Shift slightly
              const ix = incLoc.x - 1.8;
              const iy = incLoc.y - 1.8;

              const isEmergency = inc.severity === "Emergency" || inc.severity === "High";
              const pinColor = isEmergency ? "#f43f5e" : "#fbbf24";

              return (
                <g key={`live-inc-${inc.id}`} className="cursor-pointer" onClick={() => {
                  const facility = facilities.find(f => f.id === inc.locationId);
                  if (facility) onSelectFacility(facility);
                }}>
                  <circle
                    cx={ix}
                    cy={iy}
                    r="2.2"
                    fill={pinColor}
                    className="opacity-40 animate-ping"
                  />
                  <circle
                    cx={ix}
                    cy={iy}
                    r="1"
                    fill={pinColor}
                    stroke="#ffffff"
                    strokeWidth="0.2"
                  />
                  <text
                    x={ix}
                    y={iy + 0.3}
                    fontSize="0.9"
                    textAnchor="middle"
                    fill="#ffffff"
                    className="font-bold select-none pointer-events-none"
                  >
                    ⚠️
                  </text>
                </g>
              );
            })}
        </g>
      </svg>

      {/* Hover Information Floating Panel */}
      {hoveredFacility && (
        <div
          className="absolute bottom-4 left-4 z-20 pointer-events-none bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 shadow-xl max-w-xs transition-opacity duration-200"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm">{getMarkerIcon(hoveredFacility.type)}</span>
            <span className="font-display font-semibold text-xs text-white truncate">
              {hoveredFacility.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>Crowd: <strong className={hoveredFacility.crowdLevel === "Critical" || hoveredFacility.crowdLevel === "High" ? "text-rose-400" : "text-emerald-400"}>{hoveredFacility.crowdLevel}</strong></span>
            {hoveredFacility.waitTime > 0 && hoveredFacility.isOpen && (
              <span>• Wait: <strong>{hoveredFacility.waitTime}m</strong></span>
            )}
            {!hoveredFacility.isOpen && <span className="text-rose-500 font-bold">• CLOSED</span>}
          </div>
        </div>
      )}

      {/* Selected Facility Panel overlay */}
      {selectedFacility && (
        <div className="absolute bottom-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700 shadow-2xl max-w-sm flex flex-col gap-2">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-wider bg-slate-800 text-indigo-400 px-1.5 py-0.5 rounded uppercase">
                {selectedFacility.type.replace("_", " ")}
              </span>
              <h4 className="font-display font-bold text-sm text-slate-100 mt-1">
                {selectedFacility.name}
              </h4>
            </div>
            <button
              onClick={() => onSelectFacility(null)}
              className="text-slate-500 hover:text-white text-xs px-1.5 py-0.5 rounded border border-slate-800 hover:bg-slate-800"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">
            {selectedFacility.description}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-2 mt-1">
            <div>
              <span className="text-slate-500 text-[10px]">CROWD STATUS</span>
              <p className={`font-semibold ${
                selectedFacility.crowdLevel === "Critical" || selectedFacility.crowdLevel === "High" 
                  ? "text-rose-400" 
                  : selectedFacility.crowdLevel === "Medium"
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}>
                {selectedFacility.crowdLevel} ({selectedFacility.crowdPercent}%)
              </p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">WAIT TIME</span>
              <p className="font-semibold text-slate-200">
                {selectedFacility.isOpen ? `${selectedFacility.waitTime} mins` : "N/A (Closed)"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

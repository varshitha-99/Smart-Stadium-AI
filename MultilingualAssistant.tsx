/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User, Shield, Key, FileText, Settings, Globe, Eye, Sparkles } from "lucide-react";
import { UserProfile, UserRole } from "./types";

interface ProfileModuleProps {
  userProfile: UserProfile;
  onChangeProfileSetting: (setting: keyof UserProfile, value: any) => void;
}

export default function ProfileModule({
  userProfile,
  onChangeProfileSetting
}: ProfileModuleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Interactive Mobile Match Ticket / Passport card */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-950 border border-indigo-600 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[240px] text-white">
        {/* Abstract World Cup decorative element */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex justify-between items-start">
          <div>
            <span className="text-[9px] font-mono tracking-widest bg-white/10 px-2 py-0.5 rounded uppercase">
              FIFA World Cup 2026™
            </span>
            <h4 className="font-display font-bold text-sm tracking-tight mt-1.5 uppercase">
              Digital Mobile Pass
            </h4>
          </div>
          <span className="text-xl">⚽</span>
        </div>

        {/* Seat / Gate / QR Details */}
        <div className="my-3 border-y border-white/10 py-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[8px] text-slate-300 block uppercase font-mono">GATE</span>
            <span className="text-sm font-bold font-display">{userProfile.gateNo || "E"}</span>
          </div>
          <div>
            <span className="text-[8px] text-slate-300 block uppercase font-mono">SEAT</span>
            <span className="text-sm font-bold font-display">{userProfile.seatNo || "Sec 107, Row K"}</span>
          </div>
          <div>
            <span className="text-[8px] text-slate-300 block uppercase font-mono">SERIAL</span>
            <span className="text-[9px] font-mono text-slate-200 block truncate">{userProfile.ticketCode || "ARG-BRA-2026-X8"}</span>
          </div>
        </div>

        {/* Ticket bottom */}
        <div className="flex justify-between items-center text-xs">
          <div>
            <span className="text-[8px] text-slate-300 block uppercase font-mono">ATTENDEE</span>
            <p className="font-semibold text-slate-100">{userProfile.name}</p>
          </div>
          <div className="bg-white p-1 rounded-md shrink-0 select-none">
            {/* Mimic a tiny pixel qr code */}
            <div className="w-8 h-8 bg-slate-900 grid grid-cols-3 gap-0.5 p-0.5">
              <div className="bg-white"></div>
              <div className="bg-slate-900"></div>
              <div className="bg-white"></div>
              <div className="bg-slate-900"></div>
              <div className="bg-white"></div>
              <div className="bg-slate-900"></div>
              <div className="bg-white"></div>
              <div className="bg-white"></div>
              <div className="bg-slate-900"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Roles & Settings */}
      <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-4 md:col-span-2 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-indigo-400" />
            User Access & Simulation Credentials
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Choose Role */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 block font-bold">Your Active App Role</label>
              <select
                value={userProfile.role}
                onChange={(e) => onChangeProfileSetting("role", e.target.value as UserRole)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl py-2.5 px-3 outline-none focus:border-indigo-600"
              >
                <option value={UserRole.FAN}>🟢 {UserRole.FAN} Dashboard</option>
                <option value={UserRole.VOLUNTEER}>🔵 {UserRole.VOLUNTEER} Dashboard</option>
                <option value={UserRole.STAFF}>🟡 {UserRole.STAFF} (Security & Facilities)</option>
                <option value={UserRole.ORGANIZER}>👑 {UserRole.ORGANIZER} (Operational Command Center)</option>
              </select>
              <span className="text-[9px] text-indigo-300 block italic">
                Changing your role dynamically alters app interfaces and controls instantly.
              </span>
            </div>

            {/* Change Profile Details */}
            <div className="space-y-2">
              <div>
                <label htmlFor="profile-attendee-name" className="text-[10px] text-slate-400 block font-bold mb-0.5">Attendee Name</label>
                <input
                  type="text"
                  id="profile-attendee-name"
                  value={userProfile.name}
                  onChange={(e) => onChangeProfileSetting("name", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg py-1.5 px-2.5"
                  aria-label="Attendee Name"
                />
              </div>
              <div>
                <label htmlFor="profile-attendee-email" className="text-[10px] text-slate-400 block font-bold mb-0.5">Email Address</label>
                <input
                  type="email"
                  id="profile-attendee-email"
                  value={userProfile.email}
                  onChange={(e) => onChangeProfileSetting("email", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg py-1.5 px-2.5"
                  aria-label="Email Address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security / Legal Mock footer */}
        <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center text-[10px] text-slate-500 mt-4">
          <span className="flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-slate-600" />
            FIFA Mobile ID Encrypted
          </span>
          <span className="flex items-center gap-1 uppercase font-mono">
            <Sparkles className="w-3 h-3 text-indigo-500/60" />
            FIFA 2026 Stadium Cloud Link
          </span>
        </div>
      </div>
    </div>
  );
}

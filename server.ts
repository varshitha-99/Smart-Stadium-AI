/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

import { INITIAL_FACILITIES } from "./src/stadiumData";
import { calculateRoute } from "./src/routingUtils";
import { Facility, FacilityType, Incident, Volunteer, Alert, ChatMessage, UserRole, StadiumState } from "./src/types";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json({ limit: "20mb" }));

// Custom Security and Resource Caching Middleware
app.use((req, res, next) => {
  // Security and Resource Caching Middleware
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Content Security Policy supporting development protocols (HTTP/WS) and secure production protocols (HTTPS/WSS)
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' http: https:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' http: https:; " +
    "style-src 'self' 'unsafe-inline' http: https: https://fonts.googleapis.com; " +
    "font-src 'self' data: http: https: https://fonts.gstatic.com; " +
    "img-src 'self' data: http: https: blob:; " +
    "connect-src 'self' http: https: ws: wss:;"
  );
  next();
});

const PORT = 3000;

// Initialize Google GenAI Client
// Standard telemetry User-Agent header is set to 'aistudio-build'
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper to call generateContent with model fallbacks to survive "503 Service Unavailable" or rate limit spikes
async function generateContentWithFallback(params: {
  model?: string;
  contents: any;
  config?: any;
}): Promise<any> {
  const primaryModel = params.model || "gemini-3.5-flash";
  // Fallbacks: gemini-3.1-flash-lite is incredibly fast and reliable, while gemini-3.1-pro-preview is highly capable.
  const backupModels = ["gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];

  try {
    return await ai.models.generateContent({
      ...params,
      model: primaryModel,
    });
  } catch (err: any) {
    console.warn(`Primary Gemini model (${primaryModel}) failed. Error:`, err?.message || err);
    
    // Try each fallback model in order
    for (const backupModel of backupModels) {
      if (backupModel === primaryModel) continue;
      try {
        console.log(`Attempting Gemini fallback model: ${backupModel}`);
        return await ai.models.generateContent({
          ...params,
          model: backupModel,
        });
      } catch (fallbackErr: any) {
        console.warn(`Fallback model (${backupModel}) failed. Error:`, fallbackErr?.message || fallbackErr);
      }
    }
    
    // If all models fail, rethrow the original error
    throw err;
  }
}

// --- IN-MEMORY DATABASE STATE (Mocks Firestore Collections) ---
let facilitiesState: Facility[] = [...INITIAL_FACILITIES];

let incidentsState: Incident[] = [
  {
    id: "incident-1",
    title: "Crowd Congestion at South Plaza",
    description: "Extremely heavy bottleneck building up outside Gate E (South Entrance) due to peak taxi drop-offs.",
    locationId: "gate-e",
    locationName: "Gate E (South Entrance)",
    severity: "High",
    status: "Open",
    reportedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    reportedBy: "Sensor System (Gate E Gateways)"
  },
  {
    id: "incident-2",
    title: "Unattended Backpack Near Block 104",
    description: "A black sports backpack has been left unattended on a bench near Food Stall Pizza Goal.",
    locationId: "pizza-goal",
    locationName: "Pizza Goal (Stall 3)",
    severity: "Medium",
    status: "Open",
    reportedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    reportedBy: "Volunteer Carlos"
  }
];

let volunteersState: Volunteer[] = [
  {
    id: "vol-1",
    name: "Carlos Silva",
    role: "Multilingual Guide (ES/PT)",
    status: "Available",
    currentLocationId: "info-desk",
    locationName: "FIFA Information Desk",
    tasksCompleted: 12,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
  },
  {
    id: "vol-2",
    name: "Aisha Rahal",
    role: "Accessibility Escort",
    status: "Available",
    currentLocationId: "gate-g",
    locationName: "Gate G (West Entrance)",
    tasksCompleted: 8,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  },
  {
    id: "vol-3",
    name: "John Smith",
    role: "Medical Logistics Support",
    status: "Busy",
    currentLocationId: "medical-center",
    locationName: "Stadium Medical Center",
    tasksCompleted: 15,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
  },
  {
    id: "vol-4",
    name: "Yuki Tanaka",
    role: "Crowd Flow Assistant",
    status: "Available",
    currentLocationId: "gate-a",
    locationName: "Gate A (North Entrance)",
    tasksCompleted: 10,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop"
  }
];

let alertsState: Alert[] = [
  {
    id: "alert-1",
    type: "emergency",
    title: "EMERGENCY: South Concourse Crowd Reroute",
    message: "Due to high congestion at Gate E, fans are advised to walk around to Gate D (Southeast) or Gate F (Southwest) for instant entry. Entry times under 2 mins.",
    timestamp: new Date().toISOString(),
    isRead: false
  },
  {
    id: "alert-2",
    type: "weather",
    title: "Weather Advisory: High Heat Index",
    message: "Temperatures on the pitch are 34°C. Hydration points are offering FREE chilled water at Stations East and West on Concourse Level 1.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isRead: false
  },
  {
    id: "alert-3",
    type: "goal",
    title: "GOAL! Argentina 1 - 0 Brazil (Demo)",
    message: "Lionel Messi scores an incredible free-kick in the 18th minute! The crowd level in Blocks 101-104 is currently peaking.",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    isRead: true
  }
];

let stadiumGlobalState: StadiumState = {
  occupancy: 68430,
  maxCapacity: 80000,
  parkingAvailable: 412,
  parkingTotal: 3500
};

// --- API ENDPOINTS ---

// Retrieve stadium states
app.get("/api/stadium", (req, res) => {
  res.json({
    facilities: facilitiesState,
    incidents: incidentsState,
    volunteers: volunteersState,
    alerts: alertsState,
    stadiumState: stadiumGlobalState
  });
});

// Toggle a Gate (Organizer / Staff)
app.post("/api/stadium/toggle-gate", (req, res) => {
  const { facilityId, isOpen } = req.body;
  const index = facilitiesState.findIndex(f => f.id === facilityId);
  if (index !== -1) {
    facilitiesState[index].isOpen = isOpen;
    // Update wait time when closed
    facilitiesState[index].waitTime = isOpen ? 10 : 999;
    
    // Create an alert about gate changes
    const alert: Alert = {
      id: "alert-" + Date.now(),
      type: "gate",
      title: `Gate Status Update: ${facilitiesState[index].name}`,
      message: `${facilitiesState[index].name} has been ${isOpen ? "OPENED" : "CLOSED"} by operations team. Please consult the interactive routing assistant.`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    alertsState.unshift(alert);

    res.json({ success: true, facility: facilitiesState[index], alerts: alertsState });
  } else {
    res.status(404).json({ error: "Facility not found" });
  }
});

// Update crowd levels manually (Simulating Volunteer reporting)
app.post("/api/stadium/update-crowd", (req, res) => {
  const { facilityId, crowdLevel, waitTime } = req.body;
  const index = facilitiesState.findIndex(f => f.id === facilityId);
  if (index !== -1) {
    facilitiesState[index].crowdLevel = crowdLevel;
    facilitiesState[index].waitTime = waitTime;
    
    // Set matching percentage
    let pct = 20;
    if (crowdLevel === "Medium") pct = 50;
    if (crowdLevel === "High") pct = 80;
    if (crowdLevel === "Critical") pct = 98;
    facilitiesState[index].crowdPercent = pct;

    res.json({ success: true, facility: facilitiesState[index] });
  } else {
    res.status(404).json({ error: "Facility not found" });
  }
});

// Report incident (Emergency / Security / Fan / Volunteer)
app.post("/api/stadium/report-incident", (req, res) => {
  const { title, description, locationId, severity, reportedBy } = req.body;
  
  const location = facilitiesState.find(f => f.id === locationId);
  const locationName = location ? location.name : "Unknown Location";

  const newIncident: Incident = {
    id: "incident-" + Date.now(),
    title,
    description,
    locationId,
    locationName,
    severity,
    status: "Open",
    reportedAt: new Date().toISOString(),
    reportedBy: reportedBy || "Anonymous Fan"
  };

  incidentsState.unshift(newIncident);

  // Trigger high priority alert if Emergency or High severity
  if (severity === "Emergency" || severity === "High") {
    const alert: Alert = {
      id: "alert-" + Date.now(),
      type: "emergency",
      title: `OPERATIONAL ALERT: ${title}`,
      message: `A ${severity} level incident has been reported at ${locationName}: ${description}. Response teams are dispatching.`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    alertsState.unshift(alert);
  }

  res.json({ success: true, incidents: incidentsState, alerts: alertsState });
});

// Resolve an incident
app.post("/api/stadium/resolve-incident", (req, res) => {
  const { incidentId } = req.body;
  const index = incidentsState.findIndex(i => i.id === incidentId);
  if (index !== -1) {
    incidentsState[index].status = "Resolved";
    
    // Free up any assigned volunteer
    const volId = incidentsState[index].assignedVolunteerId;
    if (volId) {
      const vIdx = volunteersState.findIndex(v => v.id === volId);
      if (vIdx !== -1) {
        volunteersState[vIdx].status = "Available";
        volunteersState[vIdx].tasksCompleted += 1;
      }
    }

    res.json({ success: true, incidents: incidentsState, volunteers: volunteersState });
  } else {
    res.status(404).json({ error: "Incident not found" });
  }
});

// Dispatch / Deploy Volunteer
app.post("/api/stadium/deploy-volunteer", (req, res) => {
  const { volunteerId, locationId, incidentId } = req.body;
  
  const volIndex = volunteersState.findIndex(v => v.id === volunteerId);
  if (volIndex === -1) {
    return res.status(404).json({ error: "Volunteer not found" });
  }

  const location = facilitiesState.find(f => f.id === locationId);
  const locName = location ? location.name : "Operations Center";

  volunteersState[volIndex].status = "Busy";
  volunteersState[volIndex].currentLocationId = locationId;
  volunteersState[volIndex].locationName = locName;

  if (incidentId) {
    const incIndex = incidentsState.findIndex(i => i.id === incidentId);
    if (incIndex !== -1) {
      incidentsState[incIndex].status = "Dispatched";
      incidentsState[incIndex].assignedVolunteerId = volunteerId;
      incidentsState[incIndex].assignedVolunteerName = volunteersState[volIndex].name;
    }
  }

  res.json({ success: true, volunteers: volunteersState, incidents: incidentsState });
});

// Trigger a mock goal alert (Organizer or for testing)
app.post("/api/stadium/trigger-goal", (req, res) => {
  const { homeTeam, awayTeam, scorer, minute } = req.body;
  const alert: Alert = {
    id: "alert-" + Date.now(),
    type: "goal",
    title: `GOAL scored! ${homeTeam} vs ${awayTeam}`,
    message: `Incredible play! ${scorer} scores in the ${minute}' minute! Celebrate safely and keep aisles clear.`,
    timestamp: new Date().toISOString(),
    isRead: false
  };
  alertsState.unshift(alert);
  res.json({ success: true, alerts: alertsState });
});

// --- AI SMART NAVIGATION ENDPOINT ---
app.post("/api/navigation", async (req, res) => {
  const { sourceId, destId, accessibilityEnabled } = req.body;

  const source = facilitiesState.find(f => f.id === sourceId);
  const dest = facilitiesState.find(f => f.id === destId);

  if (!source || !dest) {
    return res.status(400).json({ error: "Invalid source or destination ID" });
  }

  const { path: pathCoordinates, distance: metersDistance, estimatedTime, intermediaryText } = calculateRoute(source, dest, facilitiesState);

  // Use Gemini AI to explain the directions naturally
  try {
    const prompt = `
      You are the Smart Stadium AI Guide for the FIFA World Cup 2026.
      A fan needs spoken navigation instructions to walk:
      FROM: ${source.name} (${source.description})
      TO: ${dest.name} (${dest.description})
      
      STATS:
      Distance: ${metersDistance} meters
      Estimated Walking Time: ${estimatedTime} minutes
      Path context: ${intermediaryText}
      Accessibility/Wheelchair Route Toggle: ${accessibilityEnabled ? "ENABLED (User needs flat wheelchair ramps, elevators, and wide corridors)" : "DISABLED"}
      
      Generate a warm, friendly, natural-sounding, clear walk-through instruction like:
      "Head out of the North Stand, walk past Food Court A for about 40 meters, take the elevator down to Concourse Level 1, and your seat is right around the corner on your left."
      
      Keep your description very natural and tailored to stadium layouts, under 70 words. If accessibility is enabled, explicitly guide them through elevators, wheelchair routes, or escalators.
    `;

    const response = await generateContentWithFallback({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const aiWalkthrough = response.text || `Walk straight for ${metersDistance} meters, ${intermediaryText}. Your destination is ahead (Estimated time: ${estimatedTime} mins).`;

    res.json({
      success: true,
      path: pathCoordinates,
      distance: metersDistance,
      estimatedTime,
      steps: aiWalkthrough,
      source,
      destination: dest
    });

  } catch (error: any) {
    console.error("Gemini Navigation API error:", error);
    res.json({
      success: true,
      path: pathCoordinates,
      distance: metersDistance,
      estimatedTime,
      steps: `Walk straight from ${source.name} towards the concourse, ${intermediaryText}, and continue until you reach ${dest.name}. Walking time is approximately ${estimatedTime} minutes.`,
      source,
      destination: dest
    });
  }
});

// --- AI CHAT ASSISTANT ENDPOINT ---
app.post("/api/chat", async (req, res) => {
  const { message, history, imageUrl, preferredLanguage, isWheelchairUser } = req.body;

  try {
    let systemInstruction = `
      You are Smart Stadium AI, a premium virtual assistant designed for the FIFA World Cup 2026 stadium applet.
      You assist fans, volunteers, stadium security staff, and organizers with real-time match details, stadium seating routing, facilities (washrooms, food court, prayer rooms, medical help), emergency reporting, lost and found, and accessibility.
      
      Tone: Conversational, warm, helpful, composed, and concise. Avoid promotional sales pitches.
      Keep responses under 130 words. Support Markdown styling.
      
      Current Game Detail: FIFA World Cup 2026 Grand Match - Argentina vs Brazil (Live score: 1 - 0).
      
      User Profile Info:
      Preferred Language: ${preferredLanguage || "English"}
      Wheelchair User: ${isWheelchairUser ? "Yes (prioritize accessibility, elevators, flat ramps)" : "No"}
      
      Always respond in the user's Preferred Language: ${preferredLanguage || "English"}.
    `;

    // Package contents
    const contents: any[] = [];

    // Add conversation history (up to 6 messages to stay fast and within limits)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-6);
      recentHistory.forEach((msg: ChatMessage) => {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    }

    // Add active prompt and optional image
    const parts: any[] = [];
    if (imageUrl) {
      // imageUrl is expected as "data:image/jpeg;base64,..." or similar
      const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        });
      }
    }

    parts.push({ text: message });
    contents.push({ role: "user", parts });

    const response = await generateContentWithFallback({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({
      success: true,
      text: response.text || "I am here to assist you with any questions about the World Cup stadium."
    });

  } catch (error: any) {
    console.error("Gemini Chat API error:", error);
    res.status(500).json({ error: "Failed to communicate with AI model. Please verify your secrets configuration." });
  }
});

// --- AI OPERATIONAL INTELLIGENCE / RECOMMENDATIONS ---
app.post("/api/ai-recommendations", async (req, res) => {
  const { currentRole } = req.body;

  const criticalFacilities = facilitiesState.filter(f => f.crowdLevel === "Critical" || f.crowdLevel === "High");
  const openIncidents = incidentsState.filter(i => i.status !== "Resolved");
  const closedGates = facilitiesState.filter(f => f.type === FacilityType.ENTRANCE && !f.isOpen);

  try {
    const prompt = `
      You are the Stadium Command Center director's GenAI advisor.
      We are running the Argentina vs Brazil match (Live 1-0).
      
      STADIUM STATUS LOGS:
      1. Occupancy: ${stadiumGlobalState.occupancy} / ${stadiumGlobalState.maxCapacity} (${Math.round(stadiumGlobalState.occupancy / stadiumGlobalState.maxCapacity * 100)}% Capacity)
      2. High/Critical Congestion Areas: 
         ${criticalFacilities.map(f => `- ${f.name} (Crowd Level: ${f.crowdLevel}, Wait Time: ${f.waitTime} mins)`).join("\n")}
      3. Active Incidents:
         ${openIncidents.map(i => `- ${i.title} (${i.severity} severity) at ${i.locationName} - Status: ${i.status}`).join("\n")}
      4. Closed Gates:
         ${closedGates.map(g => `- ${g.name}`).join("\n")}
      5. Available Parking: ${stadiumGlobalState.parkingAvailable} / ${stadiumGlobalState.parkingTotal} lots.
      
      Generate a list of 4 highly strategic, actionable recommendations for the Organizer dashboard.
      Format as elegant markdown bullets. Start with a 1-sentence analytical overview.
      Example actions:
      - "Deploy 2 Volunteers from Info Desk to Gate E bottleneck."
      - "Broadcast bilingual Arabic/Spanish/French announcement redirecting South Concourse fans to Gate F."
      - "Open Gate D/F to relieve egress wait times."
      - "Dispatch security team to address the unattended backpack at Pizza Goal."
      
      Keep recommendations professional, brief, and incredibly practical. Avoid boilerplate. Under 140 words.
    `;

    const response = await generateContentWithFallback({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      recommendations: response.text || "Monitor Gate E congestion closely. Ensure medical staff is briefed about thermal index levels."
    });

  } catch (error: any) {
    console.error("Gemini Recommendations error:", error);
    res.json({
      success: true,
      recommendations: "### Operational Recommendations\n- **Gate Bottlenecks**: Open secondary lines at Gate E to relieve south corridor congestion.\n- **First Aid Coordination**: Deploy volunteers to hydration stations in East Wing due to high temperatures.\n- **Security Coordination**: Despatch team Carlos to inspect the unattended item reported at Stall 3."
    });
  }
});

// --- MULTILINGUAL TRANSLATION ENDPOINT ---
app.post("/api/translate", async (req, res) => {
  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: "Text and target language are required" });
  }

  try {
    const prompt = `
      Translate the following stadium alert, ticket instruction, or food menu text strictly into: ${targetLanguage}.
      Do not include any greeting, context, or preambles. Only output the exact translated text.
      Text to translate:
      "${text}"
    `;

    const response = await generateContentWithFallback({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      translatedText: response.text?.trim() || text
    });

  } catch (error: any) {
    console.error("Gemini Translation error:", error);
    res.json({
      success: true,
      translatedText: `[Translated to ${targetLanguage}]: ${text}`
    });
  }
});


// --- VITE DEV SERVER & STATIC MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Production environment detected. Serving static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      maxAge: "1y",
      etag: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Stadium AI Server running on http://localhost:${PORT}`);
  });
}

startServer();

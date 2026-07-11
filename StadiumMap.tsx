@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Space Grotesk", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

/* Base modifications for World Cup aesthetics */
.bg-radial-vignette {
  background: radial-gradient(circle, transparent 30%, rgba(10, 10, 10, 0.8) 100%);
}

body {
  font-family: var(--font-sans);
  background-color: #0f172a; /* Slate 900 base for immersive stadium ambient look */
  color: #f1f5f9;
  overflow-x: hidden;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #1e293b;
}
::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Modern pulsing effects for heatmap markers */
@keyframes pulse-low {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
}
@keyframes pulse-medium {
  0%, 100% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.4); }
  50% { transform: scale(1.3); opacity: 1; box-shadow: 0 0 8px 4px rgba(234, 179, 8, 0.6); }
}
@keyframes pulse-high {
  0%, 100% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { transform: scale(1.4); opacity: 1; box-shadow: 0 0 12px 6px rgba(239, 68, 68, 0.7); }
}

.marker-pulse-low {
  animation: pulse-low 2s infinite ease-in-out;
}
.marker-pulse-medium {
  animation: pulse-medium 1.5s infinite ease-in-out;
}
.marker-pulse-high {
  animation: pulse-high 1.2s infinite ease-in-out;
}

/* Accessibility Large Text class */
.accessibility-large-text {
  font-size: 1.15rem !important;
}
.accessibility-large-text h1, .accessibility-large-text .text-2xl {
  font-size: 2rem !important;
}
.accessibility-large-text h2, .accessibility-large-text .text-xl {
  font-size: 1.5rem !important;
}
.accessibility-large-text h3, .accessibility-large-text .text-lg {
  font-size: 1.35rem !important;
}
.accessibility-large-text button, .accessibility-large-text p, .accessibility-large-text span {
  font-size: 1.15rem !important;
}

/* Accessibility High Contrast classes */
.accessibility-high-contrast {
  background-color: #000000 !important;
  color: #ffffff !important;
}
.accessibility-high-contrast .bg-slate-800,
.accessibility-high-contrast .bg-slate-900,
.accessibility-high-contrast .bg-slate-950,
.accessibility-high-contrast .bg-gray-800,
.accessibility-high-contrast .bg-gray-900 {
  background-color: #111111 !important;
  border: 2px solid #ffffff !important;
}
.accessibility-high-contrast text,
.accessibility-high-contrast p,
.accessibility-high-contrast h1,
.accessibility-high-contrast h2,
.accessibility-high-contrast h3,
.accessibility-high-contrast span {
  color: #ffffff !important;
}
.accessibility-high-contrast button {
  background-color: #ffffff !important;
  color: #000000 !important;
  border: 2px solid #ffffff !important;
  font-weight: 800 !important;
}
.accessibility-high-contrast button:hover {
  background-color: #dddddd !important;
}

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, query, where, orderBy, serverTimestamp
} from "firebase/firestore";

// ─── Firebase ────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAdYOWVOY1KSc6Ns1l3CV3sW-Y6kxhJHWg",
  authDomain: "the-contrarian.firebaseapp.com",
  projectId: "the-contrarian",
  storageBucket: "the-contrarian.firebasestorage.app",
  messagingSenderId: "1043559632677",
  appId: "1:1043559632677:web:4a9bd084a7782c3e98d4cc"
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ─── Users ────────────────────────────────────────────────────────────────────
const USERS = [
  { name: "user77",  pin: "773124" },
  { name: "user2",   pin: "201014" },
  { name: "user3",   pin: "14300"  },
];

// ─── Theme Context ────────────────────────────────────────────────────────────
const ThemeCtx = createContext();
const useTheme = () => useContext(ThemeCtx);

// ─── CSS-in-JS tokens ─────────────────────────────────────────────────────────
const DARK = {
  bg:        "#0d0d0f",
  bgAlt:     "#131316",
  surface:   "#18181c",
  surface2:  "#202026",
  border:    "#2c2c35",
  borderFocus:"#5b5bd6",
  accent:    "#5b5bd6",
  accentSoft:"rgba(91,91,214,0.12)",
  bull:      "#22c55e",
  bullSoft:  "rgba(34,197,94,0.12)",
  bear:      "#ef4444",
  bearSoft:  "rgba(239,68,68,0.12)",
  gold:      "#f59e0b",
  goldSoft:  "rgba(245,158,11,0.12)",
  cyan:      "#06b6d4",
  cyanSoft:  "rgba(6,182,212,0.12)",
  orange:    "#f97316",
  orangeSoft:"rgba(249,115,22,0.12)",
  text:      "#f1f1f3",
  text2:     "#9191a4",
  text3:     "#52525f",
  danger:    "#ef4444",
};

const LIGHT = {
  bg:        "#f8f8fb",
  bgAlt:     "#ffffff",
  surface:   "#ffffff",
  surface2:  "#f1f1f6",
  border:    "#e2e2ea",
  borderFocus:"#5b5bd6",
  accent:    "#5b5bd6",
  accentSoft:"rgba(91,91,214,0.08)",
  bull:      "#16a34a",
  bullSoft:  "rgba(22,163,74,0.08)",
  bear:      "#dc2626",
  bearSoft:  "rgba(220,38,38,0.08)",
  gold:      "#d97706",
  goldSoft:  "rgba(217,119,6,0.08)",
  cyan:      "#0891b2",
  cyanSoft:  "rgba(8,145,178,0.08)",
  orange:    "#ea580c",
  orangeSoft:"rgba(234,88,12,0.08)",
  text:      "#111114",
  text2:     "#52525f",
  text3:     "#9191a4",
  danger:    "#dc2626",
};

// ─── Global Styles ─────────────────────────────────────────────────────────────
function GlobalStyles({ t }) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      html { font-size: 16px; -webkit-text-size-adjust: 100%; }

      body {
        font-family: 'DM Sans', sans-serif;
        background: ${t.bg};
        color: ${t.text};
        min-height: 100dvh;
        -webkit-font-smoothing: antialiased;
        transition: background 0.2s, color 0.2s;
      }

      input, select, textarea, button { font-family: inherit; }

      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 4px; }

      .mono { font-family: 'DM Mono', monospace; }

      /* ── Chip / Toggle Button ── */
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 7px 13px;
        border-radius: 8px;
        border: 1.5px solid ${t.border};
        background: ${t.surface2};
        color: ${t.text2};
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
        white-space: nowrap;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }
      .chip:hover { border-color: ${t.text3}; color: ${t.text}; }
      .chip.active-bull { background: ${t.bullSoft}; border-color: ${t.bull}; color: ${t.bull}; }
      .chip.active-bear { background: ${t.bearSoft}; border-color: ${t.bear}; color: ${t.bear}; }
      .chip.active-accent { background: ${t.accentSoft}; border-color: ${t.accent}; color: ${t.accent}; }
      .chip.active-gold { background: ${t.goldSoft}; border-color: ${t.gold}; color: ${t.gold}; }
      .chip.active-cyan { background: ${t.cyanSoft}; border-color: ${t.cyan}; color: ${t.cyan}; }
      .chip.active-orange { background: ${t.orangeSoft}; border-color: ${t.orange}; color: ${t.orange}; }

      /* ── Field ── */
      .field-label {
        display: block;
        font-size: 11.5px;
        font-weight: 600;
        color: ${t.text3};
        letter-spacing: 0.04em;
        text-transform: uppercase;
        margin-bottom: 7px;
      }

      .field-input {
        width: 100%;
        background: ${t.surface2};
        border: 1.5px solid ${t.border};
        border-radius: 10px;
        color: ${t.text};
        font-size: 14px;
        padding: 10px 13px;
        outline: none;
        transition: border-color 0.15s;
        appearance: none;
        -webkit-appearance: none;
      }
      .field-input:focus { border-color: ${t.borderFocus}; }
      .field-input::placeholder { color: ${t.text3}; }

      select.field-input {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239191a4' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        padding-right: 36px;
      }

      textarea.field-input { resize: vertical; min-height: 72px; line-height: 1.5; }

      /* ── Card ── */
      .card {
        background: ${t.surface};
        border: 1px solid ${t.border};
        border-radius: 14px;
        padding: 18px;
        margin-bottom: 12px;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .card-title {
        font-size: 13px;
        font-weight: 700;
        color: ${t.text2};
        letter-spacing: 0.05em;
        text-transform: uppercase;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .card-title-dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: ${t.accent};
        flex-shrink: 0;
      }

      /* ── Chip group ── */
      .chip-group {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      /* ── Divider ── */
      .divider {
        border: none;
        border-top: 1px solid ${t.border};
        margin: 16px 0;
      }

      /* ── Grid ── */
      .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
      @media (max-width: 600px) {
        .g2 { grid-template-columns: 1fr 1fr; }
        .g3 { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 380px) {
        .g2 { grid-template-columns: 1fr; }
        .g3 { grid-template-columns: 1fr; }
      }

      /* ── Spacer ── */
      .sp8 { height: 8px; }
      .sp12 { height: 12px; }
      .sp16 { height: 16px; }

      /* ── Badge ── */
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 5px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.03em;
      }
      .badge-bull { background: ${t.bullSoft}; color: ${t.bull}; }
      .badge-bear { background: ${t.bearSoft}; color: ${t.bear}; }
      .badge-win  { background: ${t.bullSoft}; color: ${t.bull}; }
      .badge-loss { background: ${t.bearSoft}; color: ${t.bear}; }
      .badge-be   { background: ${t.goldSoft}; color: ${t.gold}; }
      .badge-skip { background: ${t.surface2}; color: ${t.text3}; }
      .badge-t1   { background: ${t.cyanSoft}; color: ${t.cyan}; }
      .badge-t2   { background: ${t.goldSoft}; color: ${t.gold}; }
      .badge-accent { background: ${t.accentSoft}; color: ${t.accent}; }

      /* ── Bottom nav ── */
      .bottom-nav {
        position: fixed;
        bottom: 0; left: 0; right: 0;
        background: ${t.surface};
        border-top: 1px solid ${t.border};
        display: flex;
        z-index: 100;
        padding-bottom: env(safe-area-inset-bottom, 0px);
      }

      .nav-btn {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 10px 6px;
        background: none;
        border: none;
        cursor: pointer;
        color: ${t.text3};
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.04em;
        transition: color 0.15s;
        -webkit-tap-highlight-color: transparent;
      }
      .nav-btn.active { color: ${t.accent}; }
      .nav-btn svg { width: 20px; height: 20px; }

      /* ── Top bar ── */
      .topbar {
        position: sticky;
        top: 0;
        z-index: 90;
        background: ${t.bg};
        border-bottom: 1px solid ${t.border};
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      /* ── Primary Button ── */
      .btn-primary {
        width: 100%;
        padding: 14px;
        background: ${t.accent};
        color: #fff;
        border: none;
        border-radius: 12px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: opacity 0.15s, transform 0.1s;
        -webkit-tap-highlight-color: transparent;
      }
      .btn-primary:active { transform: scale(0.98); opacity: 0.9; }

      .btn-ghost {
        padding: 8px 14px;
        background: ${t.surface2};
        color: ${t.text2};
        border: 1.5px solid ${t.border};
        border-radius: 9px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
        -webkit-tap-highlight-color: transparent;
      }
      .btn-ghost:hover { border-color: ${t.text2}; color: ${t.text}; }

      .btn-danger {
        padding: 8px 14px;
        background: ${t.bearSoft};
        color: ${t.bear};
        border: 1.5px solid ${t.bear};
        border-radius: 9px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      /* ── Icon button ── */
      .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px; height: 34px;
        border-radius: 8px;
        border: 1.5px solid ${t.border};
        background: ${t.surface2};
        color: ${t.text2};
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.15s;
        -webkit-tap-highlight-color: transparent;
      }
      .icon-btn:hover { border-color: ${t.text2}; color: ${t.text}; }
      .icon-btn svg { width: 16px; height: 16px; }

      /* ── Modal ── */
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.6);
        z-index: 200;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 0;
        backdrop-filter: blur(4px);
      }
      @media (min-width: 600px) {
        .modal-overlay { align-items: center; padding: 24px; }
      }

      .modal-box {
        background: ${t.surface};
        border-radius: 20px 20px 0 0;
        border: 1px solid ${t.border};
        width: 100%;
        max-width: 520px;
        max-height: 90dvh;
        overflow-y: auto;
        padding: 20px 20px calc(20px + env(safe-area-inset-bottom, 0px));
        animation: slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1);
      }
      @media (min-width: 600px) {
        .modal-box {
          border-radius: 20px;
          padding: 28px;
        }
      }

      @keyframes slideUp {
        from { transform: translateY(40px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }

      /* ── Toast ── */
      .toast {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: ${t.text};
        color: ${t.bg};
        padding: 10px 18px;
        border-radius: 99px;
        font-size: 13px;
        font-weight: 600;
        z-index: 300;
        opacity: 0;
        transition: all 0.25s;
        white-space: nowrap;
        pointer-events: none;
      }
      .toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      /* ── Journal list item ── */
      .journal-item {
        background: ${t.surface};
        border: 1px solid ${t.border};
        border-radius: 12px;
        padding: 14px 16px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: border-color 0.15s;
        -webkit-tap-highlight-color: transparent;
      }
      .journal-item:hover { border-color: ${t.accent}; }

      /* ── Stat card ── */
      .stat-card {
        background: ${t.surface};
        border: 1px solid ${t.border};
        border-radius: 12px;
        padding: 14px 16px;
      }

      /* ── Conflict highlight ── */
      .conflict-zone {
        background: ${t.orangeSoft};
        border: 1.5px solid ${t.orange};
        border-radius: 10px;
        padding: 14px;
        margin-top: 10px;
      }

      /* ── Pin input ── */
      .pin-dot {
        width: 14px; height: 14px;
        border-radius: 50%;
        border: 2px solid ${t.border};
        background: transparent;
        transition: all 0.15s;
      }
      .pin-dot.filled {
        background: ${t.accent};
        border-color: ${t.accent};
      }

      /* ── Layout toggle ── */
      .layout-btn {
        display: flex; align-items: center; justify-content: center;
        width: 32px; height: 32px;
        border-radius: 7px;
        border: 1.5px solid ${t.border};
        background: transparent;
        color: ${t.text3};
        cursor: pointer;
        transition: all 0.15s;
        -webkit-tap-highlight-color: transparent;
      }
      .layout-btn.active {
        background: ${t.accentSoft};
        border-color: ${t.accent};
        color: ${t.accent};
      }
      .layout-btn svg { width: 14px; height: 14px; }

      /* ── Instrument pill ── */
      .inst-pill {
        padding: 5px 12px;
        border-radius: 99px;
        font-size: 12px;
        font-weight: 700;
        border: 1.5px solid ${t.border};
        background: transparent;
        color: ${t.text3};
        cursor: pointer;
        transition: all 0.15s;
        -webkit-tap-highlight-color: transparent;
      }
      .inst-pill.active {
        background: ${t.accentSoft};
        border-color: ${t.accent};
        color: ${t.accent};
      }

      /* ── Section heading ── */
      .section-heading {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: ${t.text3};
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }
      .section-heading::after {
        content: '';
        flex: 1;
        height: 1px;
        background: ${t.border};
      }

      /* ── Analytics problem item ── */
      .prob-item {
        background: ${t.surface};
        border: 1px solid ${t.border};
        border-radius: 10px;
        padding: 14px;
      }

      /* scrollable page content above nav */
      .page-content {
        padding: 16px;
        padding-bottom: calc(80px + env(safe-area-inset-bottom, 16px));
      }

      @media (min-width: 768px) {
        .page-content { padding: 24px; max-width: 800px; margin: 0 auto; padding-bottom: 100px; }
      }

      /* grid layout for journal cards */
      .journal-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      @media (min-width: 600px) {
        .journal-grid { grid-template-columns: repeat(3, 1fr); }
      }

      .journal-grid-item {
        background: ${t.surface};
        border: 1px solid ${t.border};
        border-radius: 12px;
        padding: 12px;
        cursor: pointer;
        transition: border-color 0.15s;
        -webkit-tap-highlight-color: transparent;
      }
      .journal-grid-item:hover { border-color: ${t.accent}; }

      /* subtle shimmer on load */
      @keyframes shimmer {
        0% { opacity: 0.5; }
        50% { opacity: 1; }
        100% { opacity: 0.5; }
      }
      .loading { animation: shimmer 1.5s infinite; }

      /* brother card accent */
      .brother-card {
        background: ${t.surface};
        border: 1px solid ${t.orange};
        border-radius: 14px;
        padding: 18px;
        margin-bottom: 12px;
      }

      /* empty state */
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: ${t.text3};
      }
      .empty-state .icon {
        font-size: 40px;
        margin-bottom: 12px;
      }
      .empty-state p {
        font-size: 14px;
        line-height: 1.6;
      }

      /* ── Subtext ── */
      .subtext {
        font-size: 12px;
        color: ${t.text3};
        line-height: 1.5;
      }
    `}</style>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const todayDow = () => ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];

function useToast() {
  const [msg, setMsg] = useState("");
  const [visible, setVisible] = useState(false);
  const show = useCallback((m) => {
    setMsg(m); setVisible(true);
    setTimeout(() => setVisible(false), 2200);
  }, []);
  return { msg, visible, show };
}

// ─── Small UI primitives ──────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function ChipGroup({ options, value, onChange, colorMap = {} }) {
  return (
    <div className="chip-group">
      {options.map(opt => {
        const v = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const isActive = value === v;
        const cls = isActive ? `chip active-${colorMap[v] || "accent"}` : "chip";
        return (
          <button key={v} className={cls} onClick={() => onChange(isActive ? "" : v)}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Select({ value, onChange, options, placeholder = "—" }) {
  return (
    <select className="field-input" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
          {typeof o === "string" ? o : o.label}
        </option>
      ))}
    </select>
  );
}

function Input({ value, onChange, type = "text", placeholder = "" }) {
  return (
    <input
      className="field-input"
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Textarea({ value, onChange, placeholder = "" }) {
  return (
    <textarea
      className="field-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Log: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Journal: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  ),
  Analytics: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  Sun: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Moon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  List: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  Grid: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  Step: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

// ─── EMPTY FORM STATE ──────────────────────────────────────────────────────────
const EMPTY_FORM = {
  instrument: "NAS100",
  date: today(),
  dow: todayDow(),
  // Session meta
  news: "", newsSession: "",
  // Daily bias
  bias: "", biasConf: "",
  biasSource: "", poiAge: "",
  oldPoiReact: "",
  consecExp: "", dayAfter3: "", consecOutcome: "", htfReached: "",
  // CRT conflict
  crtSignal: "", dailyDraw: "", crtAligned: "", crtWinner: "", crtNotes: "",
  // 4H
  tradeType: "", h4Exp: "", h4C2: "", htfAlign: "",
  // Session
  asiaProfile: "", liqSwept: "", londonRevTime: "",
  asiaExtreme: "", noSweepPoi: "", smtNoSweep: "", corrSwept: "",
  londonProfile: "", nyProfile: "", nyPoi: "",
  // Trade execution
  tradeTaken: "", noTradeReason: "", sessionTraded: "",
  cisd_tf: "", cisdDropReason: "", cisdNeeded: "",
  entryTier: "", entryTf: "", bosShape: "", consolSweep: "", longBosEntry: "",
  smtEntry: "", smtPair: "",
  entryTime: "", outcome: "", rr: "", t1Hit: "", htfHit: "",
  // POI
  poiType: "", poiTf: "", randomSwing: "",
  // Notes
  notes: "",
  // Brother
  broAvail: "", broOutcome: "", broRr: "",
};

// ─── LOGIN SCREEN ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const { t } = useTheme();
  // Default is always user77. The user field is a hidden edit — triple-tap the
  // avatar to open a discreet user switcher.
  const [activeUser, setActiveUser] = useState("user77");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [avatarTaps, setAvatarTaps] = useState(0);
  const [showSwitcher, setShowSwitcher] = useState(false);

  // Keyboard support
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Backspace") { handleKey("del"); return; }
      if (/^[0-9]$/.test(e.key)) { handleKey(e.key); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const handleKey = (k) => {
    if (k === "del") { setPin(p => p.slice(0, -1)); setError(""); return; }
    const user = USERS.find(u => u.name === activeUser);
    if (pin.length >= user.pin.length) return;
    const next = pin + k;
    setPin(next);
    if (next.length === user.pin.length) {
      if (next === user.pin) { onLogin(user.name); }
      else { setError("Wrong PIN"); setTimeout(() => setPin(""), 400); setTimeout(() => setError(""), 1200); }
    }
  };

  const handleAvatarTap = () => {
    const next = avatarTaps + 1;
    setAvatarTaps(next);
    if (next >= 3) { setShowSwitcher(true); setAvatarTaps(0); }
    setTimeout(() => setAvatarTaps(0), 1000);
  };

  const currentUser = USERS.find(u => u.name === activeUser);

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: t.bg,
    }}>
      <div style={{ width: "100%", maxWidth: 320 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            onClick={handleAvatarTap}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56, height: 56,
              borderRadius: 16,
              background: t.accentSoft,
              border: `1.5px solid ${t.accent}`,
              marginBottom: 18,
              cursor: "default",
              userSelect: "none",
              WebkitTapHighlightColor: "transparent",
            }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: "-0.3px" }}>Backtest Journal</div>
          <div style={{ fontSize: 13, color: t.text3, marginTop: 5 }}>ERL / IRL Strategy Tracker</div>
        </div>

        {/* PIN dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 10 }}>
          {Array.from({ length: currentUser.pin.length }).map((_, i) => (
            <div key={i} className={`pin-dot ${i < pin.length ? "filled" : ""}`} />
          ))}
        </div>
        {error
          ? <div style={{ textAlign: "center", fontSize: 13, color: t.bear, marginBottom: 14, minHeight: 20 }}>{error}</div>
          : <div style={{ minHeight: 34, marginBottom: 0 }} />
        }

        {/* Numpad */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
          {["1","2","3","4","5","6","7","8","9","","0","del"].map((k, i) => (
            <button key={i} onClick={() => k && handleKey(k)} style={{
              height: 56,
              borderRadius: 12,
              border: `1.5px solid ${k ? t.border : "transparent"}`,
              background: k ? t.surface2 : "transparent",
              color: k === "del" ? t.bear : t.text,
              fontSize: k === "del" ? 14 : 20,
              fontWeight: 600,
              cursor: k ? "pointer" : "default",
              transition: "all 0.1s",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {k === "del" ? "⌫" : k}
            </button>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: t.text3 }}>
          or type on keyboard
        </div>
      </div>

      {/* Hidden user switcher — only appears after 3 taps on logo */}
      {showSwitcher && (
        <div className="modal-overlay" onClick={() => setShowSwitcher(false)}>
          <div className="modal-box" style={{ maxWidth: 300 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text2, marginBottom: 14 }}>Switch user</div>
            {USERS.map(u => (
              <button key={u.name} onClick={() => {
                setActiveUser(u.name);
                setPin("");
                setError("");
                setShowSwitcher(false);
              }} style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "11px 14px",
                background: activeUser === u.name ? t.accentSoft : t.surface2,
                border: `1.5px solid ${activeUser === u.name ? t.accent : t.border}`,
                borderRadius: 10, marginBottom: 8,
                cursor: "pointer", color: t.text, fontSize: 14, fontWeight: 600,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: t.accentSoft,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: t.accent, fontWeight: 700, fontSize: 13, flexShrink: 0,
                }}>{u.name[0].toUpperCase()}</div>
                {u.name}
                {activeUser === u.name && <span style={{ marginLeft: "auto", color: t.accent, fontSize: 12 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LOG SESSION PAGE ──────────────────────────────────────────────────────────
function LogPage({ onSave, editData, onCancelEdit, toast }) {
  const { t } = useTheme();
  const [form, setForm] = useState(editData || EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (editData) setForm(editData); }, [editData]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.date) { toast("Please set a date"); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
    if (!editData) setForm({ ...EMPTY_FORM, date: today(), dow: todayDow() });
  };

  const INSTRUMENTS = ["NAS100","EURUSD","XAUUSD"];
  const SMT_PAIRS = {
    NAS100: "US500, US30",
    EURUSD: "GBPUSD, DXY",
    XAUUSD: "XAUGBP, XAUEUR",
  };

  return (
    <div className="page-content">
      {editData && (
        <div style={{
          background: t.goldSoft,
          border: `1.5px solid ${t.gold}`,
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}>
          <span style={{ fontSize: 13, color: t.gold, fontWeight: 600 }}>✏️ Editing session</span>
          <button className="btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={onCancelEdit}>Cancel</button>
        </div>
      )}

      {/* ── Instrument ── */}
      <div className="section-heading">Instrument</div>
      <div className="chip-group" style={{ marginBottom: 16 }}>
        {INSTRUMENTS.map(inst => (
          <button key={inst}
            className={`inst-pill ${form.instrument === inst ? "active" : ""}`}
            onClick={() => set("instrument", inst)}>
            {inst}
          </button>
        ))}
      </div>
      {form.instrument && (
        <div style={{ fontSize: 12, color: t.text3, marginBottom: 16 }}>
          SMT pairs: <span style={{ color: t.text2 }}>{SMT_PAIRS[form.instrument]}</span>
        </div>
      )}

      {/* ── Session Info ── */}
      <div className="section-heading">Session Info</div>
      <div className="card">
        <div className="g2" style={{ marginBottom: 12 }}>
          <Field label="Date"><Input type="date" value={form.date} onChange={v => set("date", v)} /></Field>
          <Field label="Day">
            <Select value={form.dow} onChange={v => set("dow", v)}
              options={["Monday","Tuesday","Wednesday","Thursday","Friday"]} />
          </Field>
        </div>
        <Field label="High-Impact News Today?">
          <ChipGroup options={[{value:"yes",label:"Yes"},{value:"no",label:"No"}]}
            value={form.news} onChange={v => set("news", v)}
            colorMap={{ yes: "bear", no: "bull" }} />
        </Field>
        {form.news === "yes" && (
          <Field label="News Session">
            <ChipGroup options={["London","New York","Both"]}
              value={form.newsSession} onChange={v => set("newsSession", v)} />
          </Field>
        )}
      </div>

      {/* ── Daily Bias ── */}
      <div className="section-heading">Daily Bias</div>
      <div className="card">
        <Field label="Bias Direction">
          <ChipGroup
            options={[{value:"bull",label:"Bullish"},{value:"bear",label:"Bearish"},{value:"none",label:"No Clear Bias"}]}
            value={form.bias} onChange={v => set("bias", v)}
            colorMap={{ bull:"bull", bear:"bear", none:"gold" }} />
        </Field>
        <Field label="Confidence">
          <ChipGroup options={["High","Medium","Low"]}
            value={form.biasConf} onChange={v => set("biasConf", v)}
            colorMap={{ High:"bull", Low:"bear", Medium:"gold" }} />
        </Field>

        <hr className="divider" />

        <Field label="Bias Source">
          <Select value={form.biasSource} onChange={v => set("biasSource", v)}
            options={["Recent candles only","Old OB / FVG","Both aligned","HTF draw only"]} />
        </Field>
        {(form.biasSource === "Old OB / FVG" || form.biasSource === "Both aligned") && (
          <>
            <Field label="POI Age">
              <ChipGroup
                options={[{value:"recent",label:"0–2 wks"},{value:"medium",label:"2–8 wks"},{value:"old",label:"2–3 mo"},{value:"vold",label:"3m+"}]}
                value={form.poiAge} onChange={v => set("poiAge", v)} />
            </Field>
            <Field label="Did Price Actually React to That Old POI?">
              <ChipGroup options={["Yes","No","Partial"]}
                value={form.oldPoiReact} onChange={v => set("oldPoiReact", v)}
                colorMap={{ Yes:"bull", No:"bear", Partial:"gold" }} />
            </Field>
          </>
        )}

        <hr className="divider" />

        <Field label="Consecutive Expansion Candles (same direction into today)">
          <ChipGroup options={["1","2","3","4+"]}
            value={form.consecExp} onChange={v => set("consecExp", v)} />
        </Field>
        {(form.consecExp === "3" || form.consecExp === "4+") && (
          <>
            <Field label="Is Today Day 4+ After 3 Consecutive Expansions?">
              <ChipGroup options={["Yes","No"]}
                value={form.dayAfter3} onChange={v => set("dayAfter3", v)}
                colorMap={{ Yes:"gold", No:"accent" }} />
            </Field>
            {form.dayAfter3 === "Yes" && (
              <>
                <Field label="HTF Target Reached Before Today?">
                  <ChipGroup options={["Yes — Target Hit","No — Still In Range"]}
                    value={form.htfReached} onChange={v => set("htfReached", v)}
                    colorMap={{ "Yes — Target Hit":"bull", "No — Still In Range":"gold" }} />
                </Field>
                <Field label="What Actually Happened Today">
                  <ChipGroup options={["Reversed","Continued Expanding","Consolidated"]}
                    value={form.consecOutcome} onChange={v => set("consecOutcome", v)}
                    colorMap={{ Reversed:"bear", "Continued Expanding":"bull", Consolidated:"gold" }} />
                </Field>
              </>
            )}
          </>
        )}

        {/* CRT Conflict — contextual, auto-detects alignment */}
        <hr className="divider" />
        <div style={{ fontSize: 12, fontWeight: 700, color: t.text2, marginBottom: 10 }}>CRT vs Daily Draw</div>
        <div className="g2" style={{ marginBottom: 12 }}>
          <Field label="CRT Signal">
            <ChipGroup
              options={[{value:"bull",label:"Bullish"},{value:"bear",label:"Bearish"}]}
              value={form.crtSignal}
              onChange={v => {
                const draw = form.dailyDraw;
                const aligned = (v === "bull" && draw === "up") || (v === "bear" && draw === "down");
                const conflict = (v && draw && draw !== "unclear") ? (aligned ? "aligned" : "conflict") : "";
                set("crtSignal", v);
                set("crtAligned", conflict);
              }}
              colorMap={{ bull:"bull", bear:"bear" }} />
          </Field>
          <Field label="Daily Draw">
            <ChipGroup
              options={[{value:"up",label:"Up"},{value:"down",label:"Down"},{value:"unclear",label:"Unclear"}]}
              value={form.dailyDraw}
              onChange={v => {
                const sig = form.crtSignal;
                const aligned = (sig === "bull" && v === "up") || (sig === "bear" && v === "down");
                const conflict = (sig && v && v !== "unclear") ? (aligned ? "aligned" : "conflict") : "";
                set("dailyDraw", v);
                set("crtAligned", conflict);
              }}
              colorMap={{ up:"bull", down:"bear", unclear:"gold" }} />
          </Field>
        </div>
        {/* Auto-detected alignment indicator */}
        {form.crtAligned && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 8, marginBottom: 12,
            background: form.crtAligned === "aligned" ? "rgba(34,197,94,0.1)" : "rgba(249,115,22,0.1)",
            border: `1px solid ${form.crtAligned === "aligned" ? t.bull : t.orange}`,
            fontSize: 12, fontWeight: 700,
            color: form.crtAligned === "aligned" ? t.bull : t.orange,
          }}>
            {form.crtAligned === "aligned" ? "✓ Aligned" : "⚠ Conflict detected"}
          </div>
        )}
        {form.crtAligned === "conflict" && (
          <div className="conflict-zone">
            <Field label="Which One Was Correct?">
              <ChipGroup
                options={[{value:"draw",label:"Daily Draw Won"},{value:"crt",label:"CRT Was Right"},{value:"both",label:"Both Played"},{value:"neither",label:"Neither / Chop"}]}
                value={form.crtWinner} onChange={v => set("crtWinner", v)} />
            </Field>
            <Field label="Notes on Conflict">
              <Textarea value={form.crtNotes} onChange={v => set("crtNotes", v)}
                placeholder="What did price actually do? Which was the right read in hindsight?" />
            </Field>
          </div>
        )}
      </div>

      {/* ── 4H Profile ── */}
      <div className="section-heading">4H Profile</div>
      <div className="card">
        <Field label="Trade Structure Type">
          <ChipGroup
            options={[{value:"erl_irl",label:"ERL→IRL"},{value:"irl_erl",label:"IRL→ERL"},{value:"erl_erl",label:"ERL→ERL"}]}
            value={form.tradeType} onChange={v => set("tradeType", v)} />
        </Field>
        <Field label="Post-Asia 4H Candle — Supports Expansion?">
          <ChipGroup
            options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"unclear",label:"Unclear"}]}
            value={form.h4Exp} onChange={v => set("h4Exp", v)}
            colorMap={{ yes:"bull", no:"bear", unclear:"gold" }} />
        </Field>
        <Field label="4H Candle 2 Present at POI? (or random swing?)">
          <ChipGroup
            options={[{value:"yes",label:"Yes — At POI"},{value:"random",label:"No — Random Swing"}]}
            value={form.h4C2} onChange={v => set("h4C2", v)}
            colorMap={{ yes:"bull", random:"gold" }} />
        </Field>
        {form.h4C2 === "random" && (
          <div style={{ fontSize: 12, color: t.text3, padding: "8px 10px", background: t.surface2, borderRadius: 8, marginTop: -4 }}>
            Track this — data will show if random 4H swings are tradeable
          </div>
        )}
        <Field label="1H + 4H Candle 2/3 Alignment">
          <ChipGroup
            options={[{value:"perfect",label:"Both Aligned ✓"},{value:"4h_only",label:"4H Only"},{value:"1h_only",label:"1H Only"},{value:"none",label:"Neither"}]}
            value={form.htfAlign} onChange={v => set("htfAlign", v)}
            colorMap={{ perfect:"bull", "4h_only":"gold", "1h_only":"gold", none:"bear" }} />
        </Field>
      </div>

      {/* ── Session Profile ── */}
      <div className="section-heading">Session Profile</div>
      <div className="card">
        <Field label="Asian Session Range">
          <ChipGroup options={["Tight","Medium","Wide"]}
            value={form.asiaProfile} onChange={v => set("asiaProfile", v)} />
        </Field>
        <Field label="London Swept Asian Liquidity?">
          <ChipGroup
            options={[{value:"low",label:"Swept Low"},{value:"high",label:"Swept High"},{value:"both",label:"Both"},{value:"no",label:"No Sweep"}]}
            value={form.liqSwept} onChange={v => set("liqSwept", v)}
            colorMap={{ low:"bull", high:"bear", both:"cyan", no:"gold" }} />
        </Field>

        {/* No sweep — contextual */}
        {form.liqSwept === "no" && (
          <div style={{
            background: t.goldSoft,
            border: `1px solid ${t.gold}`,
            borderRadius: 10,
            padding: 14,
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.gold, marginBottom: 10 }}>No-Sweep Day</div>
            <Field label="Did Asia Make the High / Low of the Day?">
              <ChipGroup options={["Yes","No"]}
                value={form.asiaExtreme} onChange={v => set("asiaExtreme", v)}
                colorMap={{ Yes:"gold", No:"accent" }} />
            </Field>
            <Field label="What Did Price React To Instead?">
              <Select value={form.noSweepPoi} onChange={v => set("noSweepPoi", v)}
                options={["15min FVG","15min OB","1H FVG","1H OB","4H FVG","4H OB","Asian range boundary","Asian range midpoint","Previous day POI","Nothing visible"]} />
            </Field>
            <Field label="Did Correlated Pair Sweep Where This One Didn't? (SMT)">
              <ChipGroup options={["Yes","No","N/A"]}
                value={form.smtNoSweep} onChange={v => set("smtNoSweep", v)}
                colorMap={{ Yes:"bull", No:"bear" }} />
            </Field>
            {form.smtNoSweep === "Yes" && (
              <Field label="Which Pair + What It Did">
                <Textarea value={form.corrSwept} onChange={v => set("corrSwept", v)}
                  placeholder={`e.g. US500 swept its Asian low while NAS100 didn't — confirmed bullish anyway`} />
              </Field>
            )}
          </div>
        )}

        <Field label="London Reversal Time">
          <Input type="time" value={form.londonRevTime} onChange={v => set("londonRevTime", v)} />
        </Field>

        <hr className="divider" />

        <Field label="London Session Profile">
          <ChipGroup
            options={[{value:"manip_rev",label:"Manip → Reverse"},{value:"consol",label:"Consolidation"},{value:"manip_fail",label:"Manip → Failed Rev"},{value:"expand",label:"Pure Expansion"}]}
            value={form.londonProfile} onChange={v => set("londonProfile", v)} />
        </Field>
        <Field label="New York Profile">
          <ChipGroup
            options={[{value:"continue",label:"Continue London"},{value:"manip_cont",label:"Manip → Continue"},{value:"re_manip",label:"Re-Manip → Reverse"},{value:"chop",label:"Chop"}]}
            value={form.nyProfile} onChange={v => set("nyProfile", v)} />
        </Field>
        {(form.nyProfile === "continue" || form.nyProfile === "manip_cont") && (
          <Field label="What POI Did NY React To Before Continuing?">
            <Select value={form.nyPoi} onChange={v => set("nyPoi", v)}
              options={["London Open Price","London High","London Low","15min FVG (London)","1H OB (London)","4H OB","Daily Level","Nothing clear"]} />
          </Field>
        )}
      </div>

      {/* ── Trade Execution ── */}
      <div className="section-heading">Trade Execution</div>
      <div className="card">
        <Field label="Did You Take a Trade?">
          <ChipGroup
            options={[{value:"yes",label:"Yes"},{value:"no",label:"No Trade"},{value:"missed",label:"Missed Valid Setup"}]}
            value={form.tradeTaken} onChange={v => set("tradeTaken", v)}
            colorMap={{ yes:"bull", no:"accent", missed:"gold" }} />
        </Field>

        {form.tradeTaken === "no" && (
          <Field label="Reason — No Trade">
            <Select value={form.noTradeReason} onChange={v => set("noTradeReason", v)}
              options={["No clear daily bias","No liquidity sweep","4H didn't support expansion","News avoidance","Setup appeared after session","CRT / Draw conflict unresolved","Bias traded too early","No valid POI reached","Other"]} />
          </Field>
        )}

        {(form.tradeTaken === "yes" || form.tradeTaken === "missed") && (
          <>
            <Field label="Session Traded">
              <ChipGroup options={["London","New York","Both"]}
                value={form.sessionTraded} onChange={v => set("sessionTraded", v)} />
            </Field>

            <hr className="divider" />

            {/* CISD section — contextual */}
            <div style={{ fontSize: 12, fontWeight: 700, color: t.text2, marginBottom: 10 }}>CISD</div>
            <Field label="CISD Identified On">
              <ChipGroup
                options={[{value:"15m",label:"15min"},{value:"5m",label:"5min (dropped)"},{value:"confirmed",label:"15m confirmed + 5m entry"}]}
                value={form.cisd_tf} onChange={v => set("cisd_tf", v)} />
            </Field>
            {form.cisd_tf === "5m" && (
              <Field label="Why Did You Drop to 5min?">
                <Select value={form.cisdDropReason} onChange={v => set("cisdDropReason", v)}
                  options={["Too many candles in delivery — move progressing fast","Already inside POI","After liquidity sweep"]} />
              </Field>
            )}
            <Field label="Was CISD Actually Needed? (e.g. already inside POI / after clear sweep)">
              <ChipGroup
                options={[{value:"yes",label:"Yes — Required"},{value:"skipped",label:"Skipped — Still Valid"},{value:"unclear",label:"Unclear"}]}
                value={form.cisdNeeded} onChange={v => set("cisdNeeded", v)}
                colorMap={{ yes:"bull", skipped:"gold", unclear:"accent" }} />
            </Field>

            <hr className="divider" />

            {/* Entry tier — contextual */}
            <div style={{ fontSize: 12, fontWeight: 700, color: t.text2, marginBottom: 10 }}>Entry</div>
            <Field label="Entry Tier">
              <ChipGroup
                options={[{value:"t1",label:"Tier 1 — Full BOS Confirm"},{value:"t2",label:"Tier 2 — Early (OB / 50%)"}]}
                value={form.entryTier} onChange={v => set("entryTier", v)}
                colorMap={{ t1:"cyan", t2:"gold" }} />
            </Field>
            <Field label="BOS Timeframe">
              <ChipGroup options={[{value:"15m",label:"15min"},{value:"5m",label:"5min"},{value:"3m",label:"3min"},{value:"1m",label:"1min"}]}
                value={form.entryTf} onChange={v => set("entryTf", v)} />
            </Field>

            <Field label="BOS Shape">
              <ChipGroup
                options={[{value:"v",label:"Clean V"},{value:"consol",label:"Consolidation"},{value:"long",label:"Long BOS"}]}
                value={form.bosShape} onChange={v => set("bosShape", v)} />
            </Field>

            {form.bosShape === "consol" && (
              <Field label="In Consolidation — Did It Sweep the Range Before Breaking?">
                <ChipGroup
                  options={[{value:"yes",label:"Yes — Swept"},{value:"no",label:"No — Broke Direct"}]}
                  value={form.consolSweep} onChange={v => set("consolSweep", v)}
                  colorMap={{ yes:"bull", no:"gold" }} />
              </Field>
            )}

            {form.bosShape === "long" && (
              <Field label="Long BOS — How Did You Handle Entry?">
                <ChipGroup
                  options={[{value:"50pct",label:"Waited 50% Pullback"},{value:"fvg",label:"Entered at FVG"},{value:"close",label:"Entered at Close"}]}
                  value={form.longBosEntry} onChange={v => set("longBosEntry", v)} />
              </Field>
            )}

            <Field label="SMT Divergence Used for Confirmation?">
              <ChipGroup options={["Yes","No"]}
                value={form.smtEntry} onChange={v => set("smtEntry", v)}
                colorMap={{ Yes:"bull", No:"accent" }} />
            </Field>
            {form.smtEntry === "Yes" && (
              <Field label="SMT — Which Pair + What You Saw">
                <Textarea value={form.smtPair} onChange={v => set("smtPair", v)}
                  placeholder={`e.g. NAS100 lower low, US500 higher low — bullish divergence`} />
              </Field>
            )}

            <hr className="divider" />

            {/* 1H POI */}
            <Field label="POI That Held / Reacted">
              <div className="g2">
                <Select value={form.poiType} onChange={v => set("poiType", v)}
                  options={["FVG","Order Block","OB + FVG","Previous structure","Mitigation block","Nothing visible"]} />
                <Select value={form.poiTf} onChange={v => set("poiTf", v)}
                  options={["15min","1H","4H","Daily"]} placeholder="Timeframe" />
              </div>
            </Field>

            <hr className="divider" />

            {/* Outcome */}
            {form.tradeTaken === "yes" && (
              <>
                <div className="g2" style={{ marginBottom: 12 }}>
                  <Field label="Entry Time"><Input type="time" value={form.entryTime} onChange={v => set("entryTime", v)} /></Field>
                  <Field label="RR Achieved"><Input type="number" value={form.rr} onChange={v => set("rr", v)} placeholder="e.g. 2.5" /></Field>
                </div>
                <Field label="Outcome">
                  <ChipGroup
                    options={[{value:"win",label:"Win"},{value:"loss",label:"Loss"},{value:"be",label:"Breakeven"}]}
                    value={form.outcome} onChange={v => set("outcome", v)}
                    colorMap={{ win:"bull", loss:"bear", be:"gold" }} />
                </Field>
                <Field label="First Target Hit?">
                  <ChipGroup options={["Yes","No"]}
                    value={form.t1Hit} onChange={v => set("t1Hit", v)}
                    colorMap={{ Yes:"bull", No:"bear" }} />
                </Field>
                <Field label="HTF Target Hit?">
                  <ChipGroup options={["Yes","No","Partial"]}
                    value={form.htfHit} onChange={v => set("htfHit", v)}
                    colorMap={{ Yes:"bull", No:"bear", Partial:"gold" }} />
                </Field>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Notes ── */}
      <div className="section-heading">Notes</div>
      <div className="card">
        <Field label="Session Observations / Emotional Points / Rule Temptations">
          <Textarea value={form.notes} onChange={v => set("notes", v)}
            placeholder="What happened, what tempted you to break rules, what stood out..." />
        </Field>
      </div>

      {/* ── Brother ── */}
      <div className="section-heading">Brother's Setup</div>
      <div className="brother-card">
        <div style={{ fontSize: 12, color: t.text3, marginBottom: 14 }}>
          Tracked separately
        </div>
        <Field label="Setup Available Today?">
          <ChipGroup options={["Yes","No"]}
            value={form.broAvail} onChange={v => set("broAvail", v)}
            colorMap={{ Yes:"orange", No:"accent" }} />
        </Field>
        {form.broAvail === "Yes" && (
          <>
            <Field label="Outcome">
              <ChipGroup
                options={[{value:"win",label:"Win (1:2)"},{value:"loss",label:"Loss"},{value:"be",label:"BE"},{value:"na",label:"N/A"}]}
                value={form.broOutcome} onChange={v => set("broOutcome", v)}
                colorMap={{ win:"bull", loss:"bear", be:"gold" }} />
            </Field>
            <Field label="RR Achieved (target 1:2)">
              <Input type="number" value={form.broRr} onChange={v => set("broRr", v)} placeholder="e.g. 2.0" />
            </Field>
          </>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : editData ? "Update Session" : "Save Session"}
        </button>
      </div>
    </div>
  );
}

// ─── JOURNAL PAGE ──────────────────────────────────────────────────────────────
function JournalPage({ sessions, onEdit, onDelete }) {
  const { t } = useTheme();
  const [layout, setLayout] = useState("scroll"); // scroll | grid | step
  const [instFilter, setInstFilter] = useState("ALL");
  const [detail, setDetail] = useState(null);

  const filtered = instFilter === "ALL"
    ? sessions
    : sessions.filter(s => s.instrument === instFilter);

  const sorted = [...filtered].sort((a, b) => b.date?.localeCompare?.(a.date) || 0);

  const badge = (outcome) => {
    if (outcome === "win") return <span className="badge badge-win">WIN</span>;
    if (outcome === "loss") return <span className="badge badge-loss">LOSS</span>;
    if (outcome === "be") return <span className="badge badge-be">BE</span>;
    return <span className="badge badge-skip">—</span>;
  };

  // ── Step view (card flip one by one) ──
  const [stepIdx, setStepIdx] = useState(0);
  useEffect(() => { setStepIdx(0); }, [instFilter]);

  return (
    <div className="page-content">
      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
        <div className="chip-group">
          {["ALL","NAS100","EURUSD","XAUUSD"].map(i => (
            <button key={i}
              className={`inst-pill ${instFilter === i ? "active" : ""}`}
              onClick={() => setInstFilter(i)}>{i}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[{k:"scroll",Icon:Icon.List},{k:"grid",Icon:Icon.Grid},{k:"step",Icon:Icon.Step}].map(({k, Icon: Ic}) => (
            <button key={k} className={`layout-btn ${layout === k ? "active" : ""}`} onClick={() => setLayout(k)}>
              <Ic />
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12, color: t.text3, marginBottom: 12 }}>
        {sorted.length} session{sorted.length !== 1 ? "s" : ""}
      </div>

      {sorted.length === 0 && (
        <div className="empty-state">
          <div className="icon">📋</div>
          <p>No sessions logged yet.<br />Head to the Log tab to start tracking.</p>
        </div>
      )}

      {/* ── SCROLL LAYOUT ── */}
      {layout === "scroll" && sorted.map(s => (
        <div key={s.id} className="journal-item" onClick={() => setDetail(s)}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{s.date}</span>
              <span style={{ fontSize: 12, color: t.text3, marginLeft: 8 }}>{s.dow}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="badge badge-accent">{s.instrument}</span>
              {s.bias === "bull" && <span className="badge badge-bull">BULL</span>}
              {s.bias === "bear" && <span className="badge badge-bear">BEAR</span>}
              {badge(s.outcome)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {s.rr && <span style={{ fontSize: 12, color: parseFloat(s.rr) >= 0 ? t.bull : t.bear, fontWeight: 700, fontFamily: "DM Mono, monospace" }}>{s.rr}R</span>}
            {s.liqSwept && <span style={{ fontSize: 12, color: t.text3 }}>{s.liqSwept === "no" ? "No Sweep" : `Swept ${s.liqSwept}`}</span>}
            {s.londonRevTime && <span style={{ fontSize: 12, color: t.text3, fontFamily: "DM Mono, monospace" }}>⏰ {s.londonRevTime}</span>}
            {s.entryTier === "t1" && <span className="badge badge-t1">T1</span>}
            {s.entryTier === "t2" && <span className="badge badge-t2">T2</span>}
            {s.crtAligned === "conflict" && <span style={{ fontSize: 12, color: t.orange, fontWeight: 600 }}>⚠ CRT/Draw</span>}
          </div>
          {s.notes && <div style={{ fontSize: 12, color: t.text3, marginTop: 6, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.notes}</div>}
        </div>
      ))}

      {/* ── GRID LAYOUT ── */}
      {layout === "grid" && (
        <div className="journal-grid">
          {sorted.map(s => (
            <div key={s.id} className="journal-grid-item" onClick={() => setDetail(s)}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 4 }}>{s.date}</div>
              <div style={{ marginBottom: 6 }}>
                <span className="badge badge-accent" style={{ fontSize: 10 }}>{s.instrument}</span>
              </div>
              {badge(s.outcome)}
              {s.rr && <div style={{ fontSize: 13, fontWeight: 700, color: parseFloat(s.rr) >= 0 ? t.bull : t.bear, marginTop: 4, fontFamily: "DM Mono, monospace" }}>{s.rr}R</div>}
              {s.crtAligned === "conflict" && <div style={{ fontSize: 11, color: t.orange, marginTop: 4 }}>⚠ Conflict</div>}
            </div>
          ))}
        </div>
      )}

      {/* ── STEP LAYOUT ── */}
      {layout === "step" && sorted.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button className="btn-ghost" disabled={stepIdx === 0} onClick={() => setStepIdx(i => i - 1)}>← Prev</button>
            <span style={{ fontSize: 12, color: t.text3 }}>{stepIdx + 1} / {sorted.length}</span>
            <button className="btn-ghost" disabled={stepIdx === sorted.length - 1} onClick={() => setStepIdx(i => i + 1)}>Next →</button>
          </div>
          <SessionDetailCard s={sorted[stepIdx]} t={t} badge={badge} onEdit={onEdit} onDelete={onDelete} />
        </div>
      )}

      {/* ── Detail Modal ── */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{detail.date} · {detail.instrument}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="icon-btn" onClick={() => { onEdit(detail); setDetail(null); }}><Icon.Edit /></button>
                <button className="icon-btn" style={{ color: t.bear, borderColor: t.bear }} onClick={() => { onDelete(detail.id); setDetail(null); }}><Icon.Trash /></button>
                <button className="icon-btn" onClick={() => setDetail(null)}><Icon.Close /></button>
              </div>
            </div>
            <SessionDetailCard s={detail} t={t} badge={badge} />
          </div>
        </div>
      )}
    </div>
  );
}

function SessionDetailCard({ s, t, badge, onEdit, onDelete }) {
  const Row = ({ label, value }) => value ? (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "7px 0", borderBottom: `1px solid ${t.border}` }}>
      <span style={{ fontSize: 12, color: t.text3, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: t.text, textAlign: "right", fontWeight: 500, maxWidth: "60%" }}>{value}</span>
    </div>
  ) : null;

  return (
    <div className="card">
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <span className="badge badge-accent">{s.instrument}</span>
        {s.bias === "bull" && <span className="badge badge-bull">BULL</span>}
        {s.bias === "bear" && <span className="badge badge-bear">BEAR</span>}
        {badge(s.outcome)}
        {s.entryTier === "t1" && <span className="badge badge-t1">T1</span>}
        {s.entryTier === "t2" && <span className="badge badge-t2">T2</span>}
        {s.rr && <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "DM Mono, monospace", color: parseFloat(s.rr) >= 0 ? t.bull : t.bear }}>{s.rr}R</span>}
      </div>
      <Row label="Day" value={s.dow} />
      <Row label="News" value={s.news} />
      <Row label="Bias Confidence" value={s.biasConf} />
      <Row label="Bias Source" value={s.biasSource} />
      <Row label="CRT Alignment" value={s.crtAligned} />
      {s.crtAligned === "conflict" && <Row label="CRT Winner" value={s.crtWinner} />}
      <Row label="Trade Type" value={s.tradeType} />
      <Row label="4H Expansion" value={s.h4Exp} />
      <Row label="Liq Swept" value={s.liqSwept} />
      <Row label="London Rev Time" value={s.londonRevTime} />
      <Row label="London Profile" value={s.londonProfile} />
      <Row label="NY Profile" value={s.nyProfile} />
      <Row label="CISD TF" value={s.cisd_tf} />
      <Row label="Entry TF" value={s.entryTf} />
      <Row label="BOS Shape" value={s.bosShape} />
      <Row label="SMT Used" value={s.smtEntry} />
      <Row label="POI Type" value={s.poiType} />
      <Row label="HTF Hit" value={s.htfHit} />
      <Row label="Bro Setup" value={s.broAvail} />
      {s.broRr && <Row label="Bro RR" value={`${s.broRr}R`} />}
      {s.notes && (
        <div style={{ marginTop: 10, padding: "10px 12px", background: t.surface2, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: t.text3, marginBottom: 4, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Notes</div>
          <div style={{ fontSize: 13, color: t.text2, lineHeight: 1.5 }}>{s.notes}</div>
        </div>
      )}
      {onEdit && onDelete && (
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={() => onEdit(s)}>Edit</button>
          <button className="btn-danger" style={{ flex: 1 }} onClick={() => onDelete(s.id)}>Delete</button>
        </div>
      )}
    </div>
  );
}

// ─── ANALYTICS PAGE ────────────────────────────────────────────────────────────
function AnalyticsPage({ sessions }) {
  const { t } = useTheme();
  const [instFilter, setInstFilter] = useState("ALL");

  const s = instFilter === "ALL" ? sessions : sessions.filter(x => x.instrument === instFilter);
  const traded = s.filter(x => x.tradeTaken === "yes");
  const wins = traded.filter(x => x.outcome === "win");
  const rrs = traded.filter(x => x.rr).map(x => parseFloat(x.rr));
  const avgRR = rrs.length ? (rrs.reduce((a,b)=>a+b,0)/rrs.length).toFixed(1) : null;
  const wr = traded.length ? Math.round(wins.length / traded.length * 100) : null;

  const Stat = ({ label, value, color, sub }) => (
    <div className="stat-card">
      <div style={{ fontSize: 11, color: t.text3, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || t.accent, lineHeight: 1 }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: 11, color: t.text3, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  // Problem analyses
  const analyses = {
    p1_old_poi: (() => {
      const old = s.filter(x => x.poiAge === "old" || x.poiAge === "vold");
      const reacted = old.filter(x => x.oldPoiReact === "Yes" || x.oldPoiReact === "Partial");
      return old.length ? `${reacted.length}/${old.length} old POIs caused reaction (${Math.round(reacted.length/old.length*100)}%)` : null;
    })(),
    p2_consec: (() => {
      const d4 = s.filter(x => x.dayAfter3 === "Yes");
      const rev = d4.filter(x => x.consecOutcome === "Reversed");
      return d4.length ? `Day 4 reversed in ${rev.length}/${d4.length} cases (${Math.round(rev.length/d4.length*100)}%)` : null;
    })(),
    p3_no_sweep: (() => {
      const ns = s.filter(x => x.liqSwept === "no");
      const pois = {};
      ns.forEach(x => { if (x.noSweepPoi) pois[x.noSweepPoi] = (pois[x.noSweepPoi]||0)+1; });
      const top = Object.entries(pois).sort((a,b)=>b[1]-a[1])[0];
      return ns.length ? `${ns.length} no-sweep days — top POI: ${top?.[0] || "unknown"}` : null;
    })(),
    p4_cisd_drop: (() => {
      const d = traded.filter(x => x.cisd_tf === "5m");
      const dw = d.filter(x => x.outcome === "win");
      const norm = traded.filter(x => x.cisd_tf === "15m");
      const nw = norm.filter(x => x.outcome === "win");
      if (!d.length && !norm.length) return null;
      return `5min drop: ${dw.length}/${d.length} wins | 15min: ${nw.length}/${norm.length} wins`;
    })(),
    p5_tier: (() => {
      const t1 = traded.filter(x => x.entryTier === "t1");
      const t2 = traded.filter(x => x.entryTier === "t2");
      const t1w = t1.filter(x => x.outcome === "win");
      const t2w = t2.filter(x => x.outcome === "win");
      if (!t1.length && !t2.length) return null;
      const t1rrs = t1.filter(x=>x.rr).map(x=>parseFloat(x.rr));
      const t2rrs = t2.filter(x=>x.rr).map(x=>parseFloat(x.rr));
      const t1avg = t1rrs.length ? (t1rrs.reduce((a,b)=>a+b,0)/t1rrs.length).toFixed(1) : "—";
      const t2avg = t2rrs.length ? (t2rrs.reduce((a,b)=>a+b,0)/t2rrs.length).toFixed(1) : "—";
      return `T1: ${t1w.length}/${t1.length} wins · ${t1avg}R avg | T2: ${t2w.length}/${t2.length} wins · ${t2avg}R avg`;
    })(),
    p6_tf_cheat: (() => {
      const by = {};
      ["15m","5m","3m","1m"].forEach(tf => {
        const arr = traded.filter(x => x.entryTf === tf);
        const w = arr.filter(x => x.outcome === "win");
        if (arr.length) by[tf] = `${w.length}/${arr.length}`;
      });
      return Object.keys(by).length ? Object.entries(by).map(([k,v]) => `${k}: ${v}`).join(" | ") : null;
    })(),
    p7_consol_no_sweep: (() => {
      const c = traded.filter(x => x.bosShape === "consol" && x.consolSweep === "no");
      const cw = c.filter(x => x.outcome === "win");
      return c.length ? `No-sweep consolidation entries: ${cw.length}/${c.length} wins` : null;
    })(),
    p8_long_bos: (() => {
      const lb = traded.filter(x => x.bosShape === "long");
      const methods = {};
      lb.forEach(x => { if (x.longBosEntry) methods[x.longBosEntry] = (methods[x.longBosEntry]||0)+1; });
      return lb.length ? `${lb.length} long BOS cases — ` + Object.entries(methods).map(([k,v]) => `${k}: ${v}x`).join(", ") : null;
    })(),
    p9_news: (() => {
      const nd = s.filter(x => x.news === "yes");
      const nt = nd.filter(x => x.tradeTaken === "yes");
      const nw = nt.filter(x => x.outcome === "win");
      return nd.length ? `${nd.length} news days — ${nt.length} trades — ${nt.length ? Math.round(nw.length/nt.length*100)+"% WR" : "none taken"}` : null;
    })(),
    p10_ny_poi: (() => {
      const cont = s.filter(x => x.nyProfile === "continue" || x.nyProfile === "manip_cont");
      const pois = {};
      cont.forEach(x => { if (x.nyPoi) pois[x.nyPoi] = (pois[x.nyPoi]||0)+1; });
      const top = Object.entries(pois).sort((a,b)=>b[1]-a[1])[0];
      return cont.length ? `${cont.length} NY continuation days — top POI: ${top?.[0] || "no data"}` : null;
    })(),
    p11_crt: (() => {
      const conf = s.filter(x => x.crtAligned === "conflict");
      const draw = conf.filter(x => x.crtWinner === "draw");
      const crt = conf.filter(x => x.crtWinner === "crt");
      const both = conf.filter(x => x.crtWinner === "both");
      return conf.length ? `${conf.length} conflicts — Draw won: ${draw.length} | CRT: ${crt.length} | Both: ${both.length}` : null;
    })(),
    london_time: (() => {
      const times = s.filter(x => x.londonRevTime).map(x => x.londonRevTime);
      const buckets = { "07:00–07:30": 0, "07:30–08:00": 0, "08:00–08:30": 0, "08:30–09:00": 0, "09:00–09:30": 0, "09:30–10:00": 0, "10:00+": 0 };
      times.forEach(time => {
        const [h, m] = time.split(":").map(Number);
        const mins = h * 60 + m;
        if (mins < 450) buckets["07:00–07:30"]++;
        else if (mins < 480) buckets["07:30–08:00"]++;
        else if (mins < 510) buckets["08:00–08:30"]++;
        else if (mins < 540) buckets["08:30–09:00"]++;
        else if (mins < 570) buckets["09:00–09:30"]++;
        else if (mins < 600) buckets["09:30–10:00"]++;
        else buckets["10:00+"]++;
      });
      const top = Object.entries(buckets).sort((a,b)=>b[1]-a[1])[0];
      return times.length ? `Top window: ${top[0]} (${top[1]} sessions) of ${times.length} logged` : null;
    })(),
    bro: (() => {
      const avail = s.filter(x => x.broAvail === "Yes");
      const trades = avail.filter(x => x.broOutcome && x.broOutcome !== "na");
      const wins = trades.filter(x => x.broOutcome === "win");
      const rrs = avail.filter(x=>x.broRr).map(x=>parseFloat(x.broRr));
      const avg = rrs.length ? (rrs.reduce((a,b)=>a+b,0)/rrs.length).toFixed(1) : null;
      return {
        avail: s.length ? Math.round(avail.length/s.length*100) + "%" : "—",
        wr: trades.length ? Math.round(wins.length/trades.length*100) + "%" : "—",
        rr: avg ? avg + "R" : "—",
      };
    })(),
  };

  const ProbItem = ({ num, label, value, highlight }) => (
    <div className="prob-item" style={highlight ? { borderColor: t.orange } : {}}>
      <div style={{ fontSize: 10, fontWeight: 700, color: highlight ? t.orange : t.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{num}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 12, color: value ? t.text2 : t.text3, lineHeight: 1.4, fontFamily: value ? "DM Mono, monospace" : "inherit" }}>
        {value || "Not enough data yet"}
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="chip-group" style={{ marginBottom: 16 }}>
        {["ALL","NAS100","EURUSD","XAUUSD"].map(i => (
          <button key={i}
            className={`inst-pill ${instFilter === i ? "active" : ""}`}
            onClick={() => setInstFilter(i)}>{i}</button>
        ))}
      </div>

      {/* Overview */}
      <div className="section-heading">Overview</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <Stat label="Sessions" value={s.length} />
        <Stat label="Trades" value={traded.length} />
        <Stat label="Win Rate" value={wr !== null ? wr + "%" : null} color={wr >= 60 ? t.bull : wr >= 40 ? t.gold : t.bear} />
        <Stat label="Avg RR" value={avgRR ? avgRR + "R" : null} color={t.cyan} />
        <Stat label="Best RR" value={rrs.length ? Math.max(...rrs).toFixed(1) + "R" : null} color={t.bull} />
        <Stat label="Missed" value={s.filter(x=>x.tradeTaken==="missed").length} color={t.gold} />
      </div>

      {/* Strategy Questions */}
      <div className="section-heading">Strategy Questions</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <ProbItem num="Old POI Reaction" label="Do 2–3mo+ POIs still work for daily bias?" value={analyses.p1_old_poi} />
        <ProbItem num="Consecutive Expansion" label="After 3 expansions — does day 4 reverse?" value={analyses.p2_consec} />
        <ProbItem num="No-Sweep Days" label="When London doesn't sweep — what holds?" value={analyses.p3_no_sweep} />
        <ProbItem num="CISD Drop Safety" label="Is 15m→5m CISD drop safe vs staying 15m?" value={analyses.p4_cisd_drop} />
        <ProbItem num="Entry Tier Comparison" label="Tier 1 (BOS) vs Tier 2 (OB/50%) — which performs?" value={analyses.p5_tier} />
        <ProbItem num="Timeframe Cheat" label="BOS on lower TF — which timeframe works best?" value={analyses.p6_tf_cheat} />
        <ProbItem num="Consol Without Sweep" label="Consolidation breaks without range sweep — valid?" value={analyses.p7_consol_no_sweep} />
        <ProbItem num="Long BOS Handling" label="Long BOS — 50%, FVG or just close?" value={analyses.p8_long_bos} />
        <ProbItem num="News Days" label="Should you trade on high-impact news days?" value={analyses.p9_news} />
        <ProbItem num="NY Continuation POI" label="What does NY react to before continuing?" value={analyses.p10_ny_poi} />
        <ProbItem num="CRT vs Daily Draw" label="Conflict — which one wins?" value={analyses.p11_crt} highlight />
        <ProbItem num="London Timing" label="When does London most often reverse?" value={analyses.london_time} />
      </div>

      {/* Brother */}
      <div className="section-heading">Brother's Method</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        {[
          { label: "Available", value: analyses.bro.avail },
          { label: "Win Rate", value: analyses.bro.wr },
          { label: "Avg RR", value: analyses.bro.rr },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card" style={{ borderColor: t.orange }}>
            <div style={{ fontSize: 10, color: t.orange, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: t.orange }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isDark, setIsDark] = useState(false);
  const t = isDark ? DARK : LIGHT;

  const [user, setUser] = useState(() => localStorage.getItem("bt_user") || null);
  const [tab, setTab] = useState("log");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const { msg: toastMsg, visible: toastVisible, show: showToast } = useToast();

  const COLLECTION = user ? `backtest_${user}` : null;

  // Load sessions
  useEffect(() => {
    if (!COLLECTION) return;
    setLoading(true);
    getDocs(query(collection(db, COLLECTION), orderBy("createdAt", "desc")))
      .then(snap => {
        setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      })
      .catch(() => {
        // fallback: no ordering if field missing
        getDocs(collection(db, COLLECTION)).then(snap => {
          setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      })
      .finally(() => setLoading(false));
  }, [COLLECTION]);

  const handleLogin = (name) => {
    localStorage.setItem("bt_user", name);
    setUser(name);
  };

  const handleLogout = () => {
    localStorage.removeItem("bt_user");
    setUser(null);
    setSessions([]);
  };

  const handleSave = async (form) => {
    try {
      if (editData && editData.id) {
        // Update
        const ref = doc(db, COLLECTION, editData.id);
        const { id, createdAt, ...rest } = form;
        await updateDoc(ref, { ...rest, updatedAt: serverTimestamp() });
        setSessions(prev => prev.map(s => s.id === editData.id ? { ...s, ...rest } : s));
        showToast("Session updated ✓");
        setEditData(null);
        setTab("journal");
      } else {
        // Add
        const docRef = await addDoc(collection(db, COLLECTION), {
          ...form,
          createdAt: serverTimestamp(),
        });
        setSessions(prev => [{ id: docRef.id, ...form }, ...prev]);
        showToast("Session saved ✓");
        setTab("journal");
      }
    } catch (e) {
      console.error(e);
      showToast("Error saving — check connection");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      setSessions(prev => prev.filter(s => s.id !== id));
      showToast("Deleted");
    } catch (e) {
      showToast("Error deleting");
    }
  };

  const handleEdit = (session) => {
    setEditData(session);
    setTab("log");
  };

  if (!user) {
    return (
      <ThemeCtx.Provider value={{ t, isDark, setIsDark }}>
        <GlobalStyles t={t} />
        <LoginScreen onLogin={handleLogin} />
      </ThemeCtx.Provider>
    );
  }

  return (
    <ThemeCtx.Provider value={{ t, isDark, setIsDark }}>
      <GlobalStyles t={t} />

      {/* Top Bar */}
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            borderRadius: 8,
            background: t.accentSoft,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text, lineHeight: 1 }}>Backtest</div>
            <div style={{ fontSize: 10, color: t.text3, lineHeight: 1.2 }}>{user}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="icon-btn" onClick={() => setIsDark(d => !d)}>
            {isDark ? <Icon.Sun /> : <Icon.Moon />}
          </button>
          <button className="icon-btn" onClick={handleLogout} style={{ color: t.bear }}>
            <Icon.Logout />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: 20, textAlign: "center", color: t.text3, fontSize: 13 }} className="loading">
          Loading sessions...
        </div>
      )}

      {/* Pages */}
      {!loading && (
        <>
          {tab === "log" && (
            <LogPage
              onSave={handleSave}
              editData={editData}
              onCancelEdit={() => setEditData(null)}
              toast={showToast}
            />
          )}
          {tab === "journal" && (
            <JournalPage
              sessions={sessions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          {tab === "analytics" && (
            <AnalyticsPage sessions={sessions} />
          )}
        </>
      )}

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {[
          { key: "log",       label: "Log",       Icon: Icon.Log },
          { key: "journal",   label: "Journal",   Icon: Icon.Journal },
          { key: "analytics", label: "Analytics", Icon: Icon.Analytics },
        ].map(({ key, label, Icon: Ic }) => (
          <button key={key} className={`nav-btn ${tab === key ? "active" : ""}`} onClick={() => setTab(key)}>
            <Ic />
            {label}
          </button>
        ))}
      </nav>

      {/* Toast */}
      <div className={`toast ${toastVisible ? "show" : ""}`}>{toastMsg}</div>
    </ThemeCtx.Provider>
  );
}
import { useState } from "react";
import { useLocation } from "wouter";
import { useI18n } from "@/contexts/I18nContext";
import { Language } from "@/i18n";

const ADMIN_UID = "123456789252";

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "vi", label: "Tiếng Việt" },
];

export default function LandingPage() {
  const [uid, setUid] = useState("");
  const [, setLocation] = useLocation();
  const { t, language, setLanguage } = useI18n();

  const handleConfirm = () => {
    const trimmed = uid.trim();
    if (!trimmed) return;
    if (trimmed === ADMIN_UID) {
      setLocation("/admin");
    } else {
      setLocation(`/form/${trimmed}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <div className="scanline" />

      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,100,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,100,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Language selector */}
      <div className="absolute top-4 right-4 z-10">
        <select
          data-testid="language-selector"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-black border border-green-700 text-green-400 text-sm px-3 py-1.5 rounded focus:outline-none focus:border-green-400 cursor-pointer"
          style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.code} value={opt.code} className="bg-black">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-md">
        {/* Title */}
        <div className="text-center">
          <div className="text-green-600 text-xs tracking-widest mb-3 font-mono uppercase">
            [ SERVER MIGRATION SYSTEM ]
          </div>
          <h1
            className="title-glow text-white font-bold leading-tight"
            style={{
              fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
              fontFamily: "'Rajdhani', 'Noto Sans KR', sans-serif",
              letterSpacing: "0.05em",
            }}
            data-testid="text-app-title"
          >
            {t("appTitle")}
          </h1>
          <div className="mt-3 h-px w-48 mx-auto bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-60" />
        </div>

        {/* UID input box */}
        <div className="w-full green-gradient-border green-glow rounded-lg p-6">
          <label
            className="block text-green-400 text-xs tracking-widest uppercase mb-3 font-mono"
            htmlFor="uid-input"
          >
            PLAYER UID
          </label>
          <input
            id="uid-input"
            data-testid="input-uid"
            type="text"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("uidPlaceholder")}
            className="w-full bg-transparent text-green-300 placeholder-green-800 font-mono text-lg border-b border-green-800 focus:border-green-500 focus:outline-none pb-2 transition-colors"
          />
          <button
            data-testid="button-confirm"
            onClick={handleConfirm}
            disabled={!uid.trim()}
            className="mt-5 w-full py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-green-900 disabled:text-green-700 text-black font-bold rounded text-sm tracking-widest uppercase transition-all duration-200 font-mono"
          >
            {t("confirm")}
          </button>
        </div>

        {/* Decorative bottom line */}
        <div className="text-green-800 text-xs font-mono tracking-wider">
          DWS &#x2022; 252 &#x2022; MIGRATION PROTOCOL
        </div>
      </div>
    </div>
  );
}

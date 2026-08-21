import React, { useState } from "react";
import { Menu, Bell, Globe, ChevronDown, CheckCircle2, Sparkles, Volume2 } from "lucide-react";
import { LanguageCode } from "../types";
import { SUPPORTED_LANGUAGES } from "../data/languages";

interface HeaderProps {
  currentPage: string;
  onOpenMobileMenu: () => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  selectedLang: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onOpenAudioAssistant?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onOpenMobileMenu,
  unreadCount = 3,
  onOpenNotifications,
  selectedLang,
  onSelectLanguage,
  onOpenAudioAssistant,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const getPageTitle = () => {
    switch (currentPage) {
      case "report":
        return "REPORT POLLUTION";
      case "intelligence":
        return "AI INTELLIGENCE";
      case "map":
        return "LIVE MAP";
      case "government":
        return "GOVERNMENT";
      case "action":
        return "TAKE ACTION";
      default:
        return "AIRWATCH";
    }
  };

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  return (
    <header
      id="top-header-bar"
      className="sticky top-0 z-30 w-full bg-[#F8F8F4]/90 backdrop-blur-md border-b border-[#E3E8E5] px-4 lg:px-8 py-3.5 flex items-center justify-between transition-all"
    >
      {/* Left side: Hamburger & Page indicator */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-toggle-btn"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#26332F] hover:bg-[#E9F0EC] transition cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#556963] uppercase">
            {getPageTitle()}
          </span>
          {currentPage === "map" && (
            <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              LIVE TELEMETRY
            </span>
          )}
        </div>
      </div>

      {/* Center on mobile */}
      <div className="sm:hidden">
        <span className="text-[10px] font-bold tracking-[0.18em] text-[#556963] uppercase">
          {getPageTitle()}
        </span>
      </div>

      {/* Right side controls: Voice Assistant, Language, Notification, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Voice Assistant Trigger Button */}
        {onOpenAudioAssistant && (
          <button
            id="header-voice-assistant-btn"
            onClick={onOpenAudioAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E9F7F1] hover:bg-[#D5EBE2] text-[#16866B] border border-[#C5DDD4] text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Open Multilingual AI Voice Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#16866B]" />
            <span className="hidden sm:inline">AI Voice</span>
            <span className="text-[10px] bg-[#16866B] text-white px-1.5 py-0.2 rounded-sm font-extrabold">
              {currentLangObj.flag} {selectedLang}
            </span>
          </button>
        )}

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            id="lang-selector-btn"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#26332F] hover:bg-[#E9F0EC] border border-transparent hover:border-[#D5DDD9] transition cursor-pointer"
            title="Choose Preferred Language for UI and AI Audio"
          >
            <Globe className="w-3.5 h-3.5 text-[#16866B]" />
            <span className="font-bold">{currentLangObj.flag} {selectedLang}</span>
            <ChevronDown className="w-3 h-3 text-[#74817C]" />
          </button>

          {langMenuOpen && (
            <div
              id="lang-dropdown-menu"
              className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-[#E3E8E5] py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 max-h-72 overflow-y-auto"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#74817C] uppercase border-b border-[#F0F3F1]">
                PREFERRED LANGUAGE (UI & AUDIO)
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onSelectLanguage(lang.code);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#E9F7F1] flex items-center justify-between transition cursor-pointer ${
                    selectedLang === lang.code
                      ? "text-[#16866B] font-bold bg-[#F4FAF7]"
                      : "text-[#26332F]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-[#74817C]">({lang.label})</span>
                  </span>
                  {selectedLang === lang.code && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16866B]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button
          id="notifications-bell-btn"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-[#26332F] hover:bg-[#E9F0EC] transition cursor-pointer"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4 text-[#26332F]" />
          {unreadCount > 0 && (
            <span
              id="notification-badge-dot"
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F97316] rounded-full ring-2 ring-[#F8F8F4]"
            />
          )}
        </button>

        {/* User Avatar */}
        <div
          id="user-profile-badge"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E3EFEA] text-[#16866B] font-bold text-xs border border-[#C5DDD4] shadow-xs cursor-pointer hover:bg-[#D5EBE2] transition"
          title="AirWatch Citizen AM"
        >
          AM
        </div>
      </div>
    </header>
  );
};

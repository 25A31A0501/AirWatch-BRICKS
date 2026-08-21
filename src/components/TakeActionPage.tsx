import React, { useState } from "react";
import {
  Flame,
  Car,
  Wheat,
  Recycle,
  Leaf,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  Heart,
  Share2,
} from "lucide-react";
import { ClimateAction } from "../types";
import { CLIMATE_ACTIONS } from "../data/actionsData";

interface TakeActionPageProps {
  onNavigateToReport: () => void;
}

export const TakeActionPage: React.FC<TakeActionPageProps> = ({ onNavigateToReport }) => {
  const [selectedAction, setSelectedAction] = useState<ClimateAction | null>(null);
  const [pledges, setPledges] = useState<{ [id: string]: boolean }>({});
  const [copiedLink, setCopiedLink] = useState(false);

  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case "Flame":
        return <span className="text-2xl">🔥</span>;
      case "Car":
        return <span className="text-2xl">🚗</span>;
      case "Wheat":
        return <span className="text-2xl">🌾</span>;
      case "Recycle":
        return <span className="text-2xl">♻️</span>;
      case "Leaf":
        return <span className="text-2xl">🌿</span>;
      case "AlertTriangle":
        return <span className="text-2xl">📢</span>;
      default:
        return <Leaf className="w-6 h-6 text-[#16866B]" />;
    }
  };

  const handleTogglePledge = (id: string) => {
    setPledges((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalPledges = Object.values(pledges).filter(Boolean).length;

  return (
    <div id="take-action-page" className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Title & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#16866B] uppercase">
            CLIMATE ACTION LIBRARY
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#26332F] tracking-tight">
            What you can do
          </h1>
          <p className="text-sm sm:text-base text-[#74817C] max-w-2xl font-normal leading-relaxed">
            Cleaner air is a shared effort. Small choices and timely reports help protect the people
            around you.
          </p>
        </div>

        {/* Action Counter Pill */}
        <div
          id="actions-count-pill"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E9F7F1] border border-[#CDEEE1] text-xs font-semibold text-[#16866B] self-start md:self-auto shadow-xs"
        >
          <Leaf className="w-4 h-4 text-[#16866B]" />
          <span>{CLIMATE_ACTIONS.length} actions to start today</span>
        </div>
      </div>

      {/* Everyday Impact Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#E3E8E5] pb-3">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#16866B] uppercase">
              EVERYDAY IMPACT
            </span>
            <h2 className="text-2xl font-extrabold text-[#26332F] tracking-tight">
              Small actions. Clearer air.
            </h2>
          </div>
          <span className="text-xs text-[#74817C] hidden sm:inline">Choose one to begin</span>
        </div>

        {/* 6 Grid Action Cards matching screenshot */}
        <div
          id="action-cards-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {CLIMATE_ACTIONS.map((act) => {
            const isPledged = pledges[act.id];
            return (
              <div
                key={act.id}
                id={`action-card-${act.id}`}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E3E8E5] hover:border-[#B2D8CB] hover:shadow-md transition-all duration-200 flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#F8FAF9] flex items-center justify-center border border-[#E3E8E5] group-hover:scale-105 transition">
                      {getActionIcon(act.iconName)}
                    </div>
                    {isPledged && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16866B] bg-[#E9F7F1] px-2.5 py-1 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-[#16866B]" /> Pledged
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[#26332F] group-hover:text-[#16866B] transition">
                    {act.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#74817C] leading-relaxed">
                    {act.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#F0F3F1] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedAction(act)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16866B] hover:text-[#126F58] transition group-hover:translate-x-0.5 cursor-pointer"
                  >
                    <span>Take action</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[10px] font-medium text-[#9DAAA5]">{act.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Impact Banner */}
      <div className="bg-gradient-to-r from-[#123C35] to-[#16866B] rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-[10px] font-bold tracking-widest text-[#35BFAE] uppercase">
            CITIZEN CLIMATE MOVEMENT
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            See active smoke or factory breach right now?
          </h3>
          <p className="text-xs sm:text-sm text-[#C9E7E0] max-w-xl">
            Empower your local community by reporting immediately. AI verifies ground truth within
            60 seconds.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToReport}
          className="px-6 py-3.5 rounded-xl bg-white hover:bg-[#F4FAF7] text-[#123C35] font-bold text-xs tracking-wide shrink-0 transition shadow-lg cursor-pointer"
        >
          Report Pollution Now →
        </button>
      </div>

      {/* Practical Action Modal */}
      {selectedAction && (
        <div
          id="action-details-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-[#E3E8E5] shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-[#F0F3F1] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#E9F7F1] flex items-center justify-center border border-[#CDEEE1]">
                  {getActionIcon(selectedAction.iconName)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#16866B]">
                    {selectedAction.category}
                  </span>
                  <h3 className="text-xl font-bold text-[#26332F]">{selectedAction.title}</h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedAction(null)}
                className="p-1 rounded-lg text-[#74817C] hover:text-[#26332F] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Impact score */}
              <div className="px-3.5 py-2 rounded-xl bg-[#F0F7F4] border border-[#CDEEE1] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#16866B]">Calculated Net Benefit:</span>
                <span className="font-bold text-[#123C35]">{selectedAction.impactScore}</span>
              </div>

              {/* Step by step checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#26332F] uppercase tracking-wider">
                  Recommended Action Steps:
                </h4>
                <ul className="space-y-2">
                  {selectedAction.steps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-[#475450] leading-normal"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#E9F7F1] text-[#16866B] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Helpful Tips */}
              <div className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#E3E8E5] space-y-1.5">
                <h4 className="text-[11px] font-bold text-[#26332F] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#16866B]" /> Scientific Context:
                </h4>
                {selectedAction.tips.map((tip, idx) => (
                  <p key={idx} className="text-xs text-[#74817C] leading-relaxed">
                    • {tip}
                  </p>
                ))}
              </div>

              {/* Hotline contact */}
              {selectedAction.hotline && (
                <div className="text-xs text-[#556963] font-medium flex items-center gap-2 pt-1">
                  <PhoneCall className="w-3.5 h-3.5 text-[#16866B]" />
                  <span>Support: {selectedAction.hotline}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleTogglePledge(selectedAction.id);
                  setSelectedAction(null);
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs tracking-wide transition shadow-xs flex items-center justify-center gap-2 ${
                  pledges[selectedAction.id]
                    ? "bg-[#E9F7F1] text-[#16866B] border border-[#16866B]"
                    : "bg-[#16866B] hover:bg-[#126F58] text-white"
                }`}
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>
                  {pledges[selectedAction.id]
                    ? "Pledged to practice this ✓"
                    : "I pledge to take this action"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: selectedAction.title,
                      text: selectedAction.description,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(
                      `${selectedAction.title} - ${selectedAction.description}`
                    );
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }
                }}
                className="py-3 px-3.5 rounded-xl border border-[#D5DDD9] hover:bg-[#F8FAF9] text-[#26332F] text-xs font-semibold"
                title="Share action"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

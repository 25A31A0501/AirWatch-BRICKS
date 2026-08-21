import React from "react";
import { Bell, X, AlertOctagon, CheckCircle2, ShieldAlert, Sparkles, ExternalLink } from "lucide-react";
import { Incident } from "../types";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  incidents,
  onSelectIncident,
}) => {
  if (!isOpen) return null;

  const criticalIncidents = incidents.filter((i) => i.severity === "Critical").slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-white h-full shadow-2xl border-l border-[#E3E8E5] flex flex-col justify-between animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#F0F3F1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E9F7F1] text-[#16866B] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#26332F]">Climate Notifications</h3>
              <p className="text-[10px] text-[#74817C]">Real-time BRICS AirWatch Signals</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#74817C] hover:text-[#26332F]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div className="text-[10px] font-bold tracking-widest text-[#74817C] uppercase">
            URGENT SIGNALS ({criticalIncidents.length})
          </div>

          {criticalIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => {
                onSelectIncident(inc);
                onClose();
              }}
              className="p-3.5 rounded-xl bg-[#FAFAF8] hover:bg-[#F0F7F4] border border-[#E3E8E5] hover:border-[#16866B] transition cursor-pointer space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono text-[#16866B]">{inc.id}</span>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-sm">
                  CRITICAL
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#26332F]">{inc.type}</h4>
              <p className="text-[11px] text-[#74817C] truncate">{inc.location}</p>
              <div className="flex items-center justify-between pt-1 text-[10px] text-[#556963]">
                <span>AQI: {inc.aqi}</span>
                <span>{inc.reportedAt}</span>
              </div>
            </div>
          ))}

          {/* System Notification Item */}
          <div className="p-3 rounded-xl bg-[#E9F7F1]/60 border border-[#CDEEE1] text-xs text-[#123C35] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-[#16866B]" />
              <span>AI Sensor Interoperability</span>
            </div>
            <p className="text-[11px] text-[#556963] leading-relaxed">
              Automated Sentinel-5P satellite tropospheric data feed synced 4 mins ago.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F0F3F1] bg-[#F8FAF9]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#16866B] hover:bg-[#126F58] text-white text-xs font-bold transition shadow-xs"
          >
            Close Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

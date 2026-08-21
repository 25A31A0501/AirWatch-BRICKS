import React from "react";
import {
  Camera,
  Sparkles,
  MapPin,
  ShieldCheck,
  Leaf,
  Wind,
  X,
  Radio,
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  criticalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: "report", label: "Report Pollution", icon: Camera },
    { id: "intelligence", label: "AI Intelligence", icon: Sparkles },
    { id: "map", label: "Live Map", icon: MapPin },
    { id: "government", label: "Government", icon: ShieldCheck, hasDot: true },
    { id: "action", label: "Take Action", icon: Leaf },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          id="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#123C35] text-white flex flex-col justify-between border-r border-[#194E45] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                id="brand-logo-badge"
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#35BFAE] to-[#16866B] flex items-center justify-center shadow-lg shadow-[#16866B]/20 text-[#123C35]"
              >
                <Wind className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-[11px] font-black tracking-[0.22em] text-[#35BFAE] uppercase">
                    BRICS
                  </span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight leading-none uppercase mt-0.5">
                  AirWatch
                </h1>
                <p className="text-[9px] font-bold tracking-[0.2em] text-[#7EADA5] uppercase mt-1">
                  CLIMATE RESPONSE NETWORK
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              id="sidebar-close-button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#7EADA5] hover:text-white hover:bg-[#1A4D44] transition"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Demo Simulated Tag */}
          <div
            id="demo-status-pill"
            className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0D2D28] border border-[#1B4B42] text-[11px] font-medium text-[#7EADA5] w-full"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35BFAE] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#35BFAE]"></span>
            </span>
            <span className="tracking-wide">DEMO / SIMULATED DATA</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    onSelectPage(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition-all duration-200 group text-left ${
                    isActive
                      ? "bg-[#16866B] text-white shadow-sm shadow-[#16866B]/30"
                      : "text-[#A1C2BC] hover:text-white hover:bg-[#184840]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                        isActive ? "text-white" : "text-[#7EADA5]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.hasDot && (
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Status */}
        <div className="p-6 border-t border-[#194E45] bg-[#0E312B]/40">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-[#10B981]"></span>
            <span className="text-xs font-medium text-[#C2DFD9]">
              All systems operational
            </span>
          </div>
          <p className="text-[10px] text-[#69938B] leading-tight flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#35BFAE]" />
            BRICS climate interoperability network · v0.9 demo
          </p>
        </div>
      </aside>
    </>
  );
};

import React, { useState } from "react";
import { Sparkles, Mic, Volume2 } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { ReportPollutionPage } from "./components/ReportPollutionPage";
import { AiIntelligencePage } from "./components/AiIntelligencePage";
import { LiveMapPage } from "./components/LiveMapPage";
import { GovernmentPage } from "./components/GovernmentPage";
import { TakeActionPage } from "./components/TakeActionPage";
import { SimulateEventModal } from "./components/SimulateEventModal";
import { IncidentDetailsModal } from "./components/IncidentDetailsModal";
import { NotificationDrawer } from "./components/NotificationDrawer";
import { AiAudioAssistantModal } from "./components/AiAudioAssistantModal";
import { INITIAL_INCIDENTS } from "./data/initialData";
import { Incident, IncidentStatus, LanguageCode } from "./types";
import { SUPPORTED_LANGUAGES } from "./data/languages";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("report");
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("EN");
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [featuredIncident, setFeaturedIncident] = useState<Incident>(INITIAL_INCIDENTS[0]);
  const [selectedIncidentForMap, setSelectedIncidentForMap] = useState<Incident | null>(
    INITIAL_INCIDENTS[0]
  );
  const [selectedIncidentForModal, setSelectedIncidentForModal] = useState<Incident | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAudioAssistantOpen, setIsAudioAssistantOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [todayReportCount, setTodayReportCount] = useState(18);

  const langInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  // When a citizen submits a new report
  const handleIncidentCreated = (newIncident: Incident) => {
    setIncidents((prev) => [newIncident, ...prev]);
    setFeaturedIncident(newIncident);
    setSelectedIncidentForMap(newIncident);
    setTodayReportCount((c) => c + 1);
  };

  // When a simulated event is triggered
  const handleSimulateIncident = (simulatedIncident: Incident) => {
    setIncidents((prev) => [simulatedIncident, ...prev]);
    setFeaturedIncident(simulatedIncident);
    setSelectedIncidentForMap(simulatedIncident);
    setTodayReportCount((c) => c + 1);
  };

  // When government or user updates incident lifecycle status
  const handleUpdateIncidentStatus = (
    id: string,
    newStatus: IncidentStatus,
    assignedTeam?: string
  ) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const updated = {
            ...inc,
            status: newStatus,
            assignedTeam: assignedTeam || inc.assignedTeam,
          };
          if (featuredIncident.id === id) {
            setFeaturedIncident(updated);
          }
          if (selectedIncidentForModal?.id === id) {
            setSelectedIncidentForModal(updated);
          }
          return updated;
        }
        return inc;
      })
    );
  };

  // Navigation helpers
  const handleNavigateToIntelligence = (incident?: Incident) => {
    if (incident) {
      setFeaturedIncident(incident);
    }
    setCurrentPage("intelligence");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateToMap = (incident?: Incident) => {
    if (incident) {
      setSelectedIncidentForMap(incident);
    }
    setCurrentPage("map");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateToGovernment = (incident?: Incident) => {
    if (incident) {
      setSelectedIncidentForModal(incident);
    }
    setCurrentPage("government");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateToReport = () => {
    setCurrentPage("report");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const criticalCount = incidents.filter((i) => i.severity === "Critical").length;

  return (
    <div className="min-h-screen bg-[#F8F8F4] flex font-sans antialiased text-[#26332F] relative">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={(page) => setCurrentPage(page)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        criticalCount={criticalCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Top Header */}
        <Header
          currentPage={currentPage}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          unreadCount={criticalCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          selectedLang={currentLanguage}
          onSelectLanguage={(lang) => setCurrentLanguage(lang)}
          onOpenAudioAssistant={() => setIsAudioAssistantOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentPage === "report" && (
            <ReportPollutionPage
              onIncidentCreated={handleIncidentCreated}
              onNavigateToIntelligence={handleNavigateToIntelligence}
              onNavigateToMap={handleNavigateToMap}
              todayReportCount={todayReportCount}
              currentLanguage={currentLanguage}
              onLanguageChange={(lang) => setCurrentLanguage(lang)}
            />
          )}

          {currentPage === "intelligence" && (
            <AiIntelligencePage
              incidents={incidents}
              featuredIncident={featuredIncident}
              onSelectFeatured={(inc) => setFeaturedIncident(inc)}
              onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
              onNavigateToMap={handleNavigateToMap}
              onNavigateToGovernment={handleNavigateToGovernment}
              currentLanguage={currentLanguage}
              onLanguageChange={(lang) => setCurrentLanguage(lang)}
            />
          )}

          {currentPage === "map" && (
            <LiveMapPage
              incidents={incidents}
              selectedIncident={selectedIncidentForMap}
              onSelectIncident={(inc) => setSelectedIncidentForMap(inc)}
              onNavigateToGovernment={handleNavigateToGovernment}
              onNavigateToIntelligence={handleNavigateToIntelligence}
              currentLanguage={currentLanguage}
              onLanguageChange={(lang) => setCurrentLanguage(lang)}
              onOpenAudioAssistant={() => setIsAudioAssistantOpen(true)}
            />
          )}

          {currentPage === "government" && (
            <GovernmentPage
              incidents={incidents}
              onUpdateIncidentStatus={handleUpdateIncidentStatus}
              onOpenDetailsModal={(inc) => setSelectedIncidentForModal(inc)}
              onNavigateToIntelligence={handleNavigateToIntelligence}
            />
          )}

          {currentPage === "action" && (
            <TakeActionPage onNavigateToReport={handleNavigateToReport} />
          )}
        </main>
      </div>

      {/* Floating Global AI Audio Assistant Button */}
      <button
        id="floating-ai-audio-assistant-btn"
        onClick={() => setIsAudioAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#123C35] hover:bg-[#16866B] text-white p-3.5 sm:px-4 sm:py-3 rounded-2xl shadow-xl border border-[#35BFAE]/30 flex items-center gap-2.5 transition-all hover:scale-105 group cursor-pointer"
        title={`Open AI Audio Assistant in ${langInfo.label}`}
      >
        <div className="relative flex items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35BFAE] opacity-75"></span>
          <div className="w-8 h-8 rounded-xl bg-[#16866B] flex items-center justify-center text-white shadow-xs">
            <Volume2 className="w-4 h-4" />
          </div>
        </div>

        <div className="hidden sm:block text-left">
          <div className="text-[10px] font-extrabold tracking-wider text-[#35BFAE] uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI VOICE ASSISTANT
          </div>
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>{langInfo.flag} {langInfo.nativeName}</span>
            <span className="text-[10px] text-[#A1C2BC] font-normal">({currentLanguage})</span>
          </div>
        </div>
      </button>

      {/* Multilingual Voice Assistant Modal */}
      <AiAudioAssistantModal
        isOpen={isAudioAssistantOpen}
        onClose={() => setIsAudioAssistantOpen(false)}
        currentLanguage={currentLanguage}
        onLanguageChange={(lang) => setCurrentLanguage(lang)}
        incidents={incidents}
        currentCity={featuredIncident?.location?.split(",")[0] || "Hyderabad"}
        currentPage={currentPage}
      />

      {/* Modals & Drawers */}
      <SimulateEventModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onSimulateIncident={handleSimulateIncident}
      />

      <IncidentDetailsModal
        incident={selectedIncidentForModal}
        onClose={() => setSelectedIncidentForModal(null)}
        onUpdateStatus={handleUpdateIncidentStatus}
        onNavigateToMap={handleNavigateToMap}
        onNavigateToIntelligence={handleNavigateToIntelligence}
        currentLanguage={currentLanguage}
        onLanguageChange={(lang) => setCurrentLanguage(lang)}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        incidents={incidents}
        onSelectIncident={(inc) => {
          setSelectedIncidentForModal(inc);
          setSelectedIncidentForMap(inc);
        }}
      />
    </div>
  );
}

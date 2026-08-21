import React, { useState } from "react";
import {
  Activity,
  AlertOctagon,
  CheckCircle2,
  Users,
  Download,
  Filter,
  Search,
  ShieldCheck,
  Building2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  FileText,
  AlertTriangle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Incident, IncidentStatus } from "../types";

interface GovernmentPageProps {
  incidents: Incident[];
  onUpdateIncidentStatus: (id: string, newStatus: IncidentStatus, assignedTeam?: string) => void;
  onOpenDetailsModal: (incident: Incident) => void;
  onNavigateToIntelligence: (incident: Incident) => void;
}

export const GovernmentPage: React.FC<GovernmentPageProps> = ({
  incidents,
  onUpdateIncidentStatus,
  onOpenDetailsModal,
  onNavigateToIntelligence,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncidentForAction, setSelectedIncidentForAction] = useState<Incident | null>(null);
  const [assignTeamModalOpen, setAssignTeamModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("Regional PCB Task Force 4");
  const [customActionNote, setCustomActionNote] = useState("");
  const [exportNoticeSuccess, setExportNoticeSuccess] = useState(false);

  // Statistics
  const activeCount = incidents.filter((i) => i.status !== "Resolved").length;
  const criticalCount = incidents.filter((i) => i.severity === "Critical").length;
  const resolvedCount = 27 + incidents.filter((i) => i.status === "Resolved").length;
  const teamsCount = 8;

  // Filtered incidents
  const filtered = incidents.filter((inc) => {
    if (statusFilter === "Active" && inc.status === "Resolved") return false;
    if (statusFilter === "Critical" && inc.severity !== "Critical") return false;
    if (statusFilter === "Resolved" && inc.status !== "Resolved") return false;
    if (statusFilter === "Investigating" && inc.status !== "Investigating") return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.id.toLowerCase().includes(q) ||
        inc.location.toLowerCase().includes(q) ||
        inc.type.toLowerCase().includes(q) ||
        inc.severity.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const availableTeams = [
    "Regional Pollution Control Board (SPCB) - Rapid Unit",
    "Municipal Solid Waste Enforcement Squad",
    "Industrial Environmental Safety Inspectorate",
    "Agricultural Stubble Surveillance Directorate",
    "Hazardous Chemical & Plume Neutralization Team",
    "Coastal Environment Protection Wing",
  ];

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Location,PollutionType,AQI,Confidence,Severity,Status,AssignedTeam\n" +
      incidents
        .map(
          (i) =>
            `${i.id},"${i.location}","${i.type}",${i.aqi},${i.confidence}%,${i.severity},${i.status},"${i.assignedTeam || "None"}"`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BRICS_AirWatch_Incident_Register_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAssignTeamSubmit = () => {
    if (selectedIncidentForAction) {
      onUpdateIncidentStatus(
        selectedIncidentForAction.id,
        "Response deployed",
        selectedTeam
      );
      setAssignTeamModalOpen(false);
      setSelectedIncidentForAction(null);
    }
  };

  return (
    <div id="government-response-page" className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#16866B] uppercase">
            AUTHORITY RESPONSE DESK
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#26332F] tracking-tight">
            Government response center
          </h1>
          <p className="text-sm sm:text-base text-[#74817C] max-w-2xl font-normal leading-relaxed">
            A clear operational view for turning verified incidents into coordinated action.
          </p>
        </div>

        {/* Authority Workspace Pill Button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div
            id="authority-workspace-badge"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E9F7F1] border border-[#16866B]/30 text-xs font-bold text-[#16866B] shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-[#16866B]" />
            <span>Authority workspace</span>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Incidents */}
        <div
          id="gov-stat-active"
          className="bg-white rounded-2xl p-5 border border-[#E3E8E5] shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-[#E9F7F1] text-[#16866B] flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#26332F]">{activeCount}</div>
            <div className="text-xs font-medium text-[#26332F]">Active incidents</div>
          </div>
        </div>

        {/* Card 2: Critical Incidents */}
        <div
          id="gov-stat-critical"
          className="bg-white rounded-2xl p-5 border border-[#E3E8E5] shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#26332F]">
              {criticalCount < 10 ? `0${criticalCount}` : criticalCount}
            </div>
            <div className="text-xs font-medium text-[#26332F]">Critical incidents</div>
          </div>
        </div>

        {/* Card 3: Resolved Today */}
        <div
          id="gov-stat-resolved"
          className="bg-white rounded-2xl p-5 border border-[#E3E8E5] shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#26332F]">{resolvedCount}</div>
            <div className="text-xs font-medium text-[#26332F]">Resolved today</div>
          </div>
        </div>

        {/* Card 4: Response Teams */}
        <div
          id="gov-stat-teams"
          className="bg-white rounded-2xl p-5 border border-[#E3E8E5] shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#26332F]">
              {teamsCount < 10 ? `0${teamsCount}` : teamsCount}
            </div>
            <div className="text-xs font-medium text-[#26332F]">Response teams</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-[#E3E8E5] shadow-xs overflow-hidden">
        {/* Table Header Section */}
        <div className="p-6 border-b border-[#F0F3F1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#16866B] uppercase">
              LIVE INCIDENT REGISTER
            </span>
            <h2 className="text-xl font-extrabold text-[#26332F] tracking-tight">
              Verified pollution events
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter pills */}
            <div className="flex items-center bg-[#F8FAF9] p-1 rounded-lg border border-[#D5DDD9] text-xs">
              {["All", "Active", "Critical", "Investigating", "Resolved"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1 font-semibold rounded-md transition ${
                    statusFilter === tab
                      ? "bg-white text-[#16866B] shadow-2xs"
                      : "text-[#74817C] hover:text-[#26332F]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Export view */}
            <button
              id="export-view-btn"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#D5DDD9] hover:bg-[#F8FAF9] text-xs font-bold text-[#26332F] transition cursor-pointer"
            >
              <span>Export view</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#16866B]" />
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBF9] border-b border-[#E3E8E5] text-[#74817C] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-6">INCIDENT</th>
                <th className="py-3.5 px-6">LOCATION</th>
                <th className="py-3.5 px-6">SIGNAL</th>
                <th className="py-3.5 px-6">PRIORITY</th>
                <th className="py-3.5 px-6">CONFIDENCE</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3F1]">
              {filtered.map((inc) => (
                <tr
                  key={inc.id}
                  className="hover:bg-[#F8FAF9] transition-colors group cursor-pointer"
                  onClick={() => onOpenDetailsModal(inc)}
                >
                  {/* Incident ID */}
                  <td className="py-4 px-6 font-mono font-bold text-[#26332F]">
                    <div>{inc.id}</div>
                    <div className="text-[10px] font-sans font-normal text-[#74817C]">
                      Citizen + sensor
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-4 px-6 text-[#26332F] font-medium">
                    <div>{inc.location}</div>
                    <div className="text-[10px] text-[#74817C]">{inc.weather}</div>
                  </td>

                  {/* Signal */}
                  <td className="py-4 px-6 text-[#26332F] font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16866B]"></span>
                      {inc.type}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        inc.severity === "Critical"
                          ? "text-red-600"
                          : inc.severity === "High"
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          inc.severity === "Critical"
                            ? "bg-red-600 animate-pulse"
                            : inc.severity === "High"
                            ? "bg-amber-600"
                            : "bg-emerald-600"
                        }`}
                      />
                      {inc.severity}
                    </span>
                  </td>

                  {/* Confidence */}
                  <td className="py-4 px-6 font-bold text-[#16866B]">{inc.confidence}%</td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                        inc.status === "Resolved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : inc.status === "Response deployed"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : inc.status === "Investigating"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {inc.status === "New" ? "Needs response" : inc.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-6 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    {inc.status === "New" && (
                      <button
                        type="button"
                        onClick={() => onUpdateIncidentStatus(inc.id, "Investigating")}
                        className="text-xs font-bold text-[#16866B] hover:underline"
                      >
                        Investigate
                      </button>
                    )}

                    {inc.status === "Investigating" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedIncidentForAction(inc);
                          setAssignTeamModalOpen(true);
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Assign Team
                      </button>
                    )}

                    {inc.status === "Response deployed" && (
                      <button
                        type="button"
                        onClick={() => onUpdateIncidentStatus(inc.id, "Resolved")}
                        className="text-xs font-bold text-amber-600 hover:underline"
                      >
                        Resolve
                      </button>
                    )}

                    {inc.status === "Resolved" && (
                      <span className="text-xs text-emerald-600 font-semibold">Closed ✓</span>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenDetailsModal(inc)}
                      className="text-xs font-semibold text-[#74817C] hover:text-[#26332F] ml-2"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BRICS Climate Coordination Interoperability Banner */}
      <div
        id="brics-climate-coordination-section"
        className="bg-[#0C2D25] text-white rounded-2xl p-6 sm:p-8 border border-[#164E41] shadow-lg"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-5 space-y-2">
            <span className="font-label text-[11px] font-bold tracking-[0.15em] text-[#35BFAE] uppercase block">
              BRICS CLIMATE COORDINATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
              One region, shared signals.
            </h2>
            <p className="font-body text-xs sm:text-sm text-white/75 font-normal leading-relaxed max-w-md">
              Interoperability status for shared pollution models and cross-border alerts.
            </p>
          </div>

          {/* Right Column: Country Sync Cards Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Brazil */}
              <div className="p-3 sm:p-3.5 rounded-xl border border-white/15 bg-white/5 backdrop-blur-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-label text-xs font-bold text-[#35BFAE]">BR</span>
                  <span className="font-heading text-xs sm:text-sm font-bold text-white">Brazil</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/70 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#35BFAE] shrink-0" />
                  <span className="font-body">Model synced</span>
                </div>
              </div>

              {/* Russia */}
              <div className="p-3 sm:p-3.5 rounded-xl border border-white/15 bg-white/5 backdrop-blur-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-label text-xs font-bold text-[#35BFAE]">RU</span>
                  <span className="font-heading text-xs sm:text-sm font-bold text-white">Russia</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/70 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#35BFAE] shrink-0" />
                  <span className="font-body">Model synced</span>
                </div>
              </div>

              {/* India */}
              <div className="p-3 sm:p-3.5 rounded-xl border border-white/15 bg-white/5 backdrop-blur-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-label text-xs font-bold text-[#35BFAE]">IN</span>
                  <span className="font-heading text-xs sm:text-sm font-bold text-white">India</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/80 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#35BFAE] shrink-0" />
                  <span className="font-body">Live alerts</span>
                </div>
              </div>

              {/* China */}
              <div className="p-3 sm:p-3.5 rounded-xl border border-white/15 bg-white/5 backdrop-blur-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-label text-xs font-bold text-[#35BFAE]">CN</span>
                  <span className="font-heading text-xs sm:text-sm font-bold text-white">China</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/70 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#35BFAE] shrink-0" />
                  <span className="font-body">Model synced</span>
                </div>
              </div>

              {/* South Africa */}
              <div className="p-3 sm:p-3.5 rounded-xl border border-white/15 bg-white/5 backdrop-blur-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-label text-xs font-bold text-[#35BFAE]">ZA</span>
                  <span className="font-heading text-xs sm:text-sm font-bold text-white">South Africa</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/70 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#35BFAE] shrink-0" />
                  <span className="font-body">Model synced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Team Modal */}
      {assignTeamModalOpen && selectedIncidentForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E3E8E5] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0F3F1] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#16866B]" />
                <h3 className="text-lg font-bold text-[#26332F]">
                  Deploy Response Team to {selectedIncidentForAction.id}
                </h3>
              </div>
              <button
                onClick={() => setAssignTeamModalOpen(false)}
                className="text-[#74817C] hover:text-[#26332F] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#26332F] mb-1">Select Authority Unit</label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5DDD9] bg-[#FAFAF8] text-xs font-medium text-[#26332F]"
                >
                  {availableTeams.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#26332F] mb-1">
                  Enforcement Notice / Directives
                </label>
                <textarea
                  rows={3}
                  value={customActionNote}
                  onChange={(e) => setCustomActionNote(e.target.value)}
                  placeholder="e.g. Issue Section 31A statutory notice under Air Pollution Control Act and deploy particulate scrubber inspection."
                  className="w-full p-2.5 rounded-xl border border-[#D5DDD9] bg-[#FAFAF8] text-xs text-[#26332F] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setAssignTeamModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#74817C] hover:bg-[#F8FAF9]"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTeamSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#16866B] hover:bg-[#126F58] text-white text-xs font-bold shadow-xs transition"
              >
                Confirm Dispatch & Alert Team →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

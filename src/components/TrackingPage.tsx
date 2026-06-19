import { useState, useEffect } from "react";
import {
  Layers, Users, TrendingUp, CheckCircle, Clock, AlertCircle, AlertTriangle, Truck, Eye, FileText, Check, CheckSquare, Sparkles, LogOut, Code, ClipboardList, Info, HelpCircle, X, CheckCheck, Search,
  ArrowRight, ShieldCheck, Mail, Database, RefreshCw, Plus, Trash2, Calendar, RotateCcw
} from "lucide-react";
import { User, Project, Process, Subcontractor, WorkOrder, InventoryItem, Notification } from "../types";
import NotificationsDrawer from "./NotificationsDrawer";
import TrackingTimeline from "./TrackingTimeline";
import ProjectDetailsModal from "./ProjectDetailsModal";

const formatDate = (dateString: string | undefined) => {
  if (!dateString || dateString === 'N/A') return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const formatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return formatter.format(date);
};

interface TrackingPageProps {
  workOrderId: string | null;
  workOrders: WorkOrder[];
  projects: Project[];
  processes: Process[];
  subcontractors: Subcontractor[];
  users: any[];
}

export default function TrackingPage({ workOrderId, workOrders, projects, processes, subcontractors, users }: TrackingPageProps) {
    const [viewingProjectDetailsId, setViewingProjectDetailsId] = useState<string | null>(null);
  const [selectedWoId, setSelectedWoId] = useState<string | null>(workOrderId);

  const currentWo = workOrders.find((w) => w.WorkOrderId === (selectedWoId || workOrderId));

  if (!currentWo) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border shadow-xs max-w-md mx-auto text-slate-500 text-xs">
        No active tracking logs present. Onboard and dispatch material from Store Manager.
      </div>
    );
  }

  const project = projects.find((p) => {
    const proc = processes.find((proc) => proc.ProcessId === currentWo.ProcessId);
    return p.ProjectId === proc?.ProjectId;
  });

  const sub = subcontractors.find((s) => s.SubcontractorId === currentWo.SubcontractorId);
  const driver = users.find((u) => u.role === "PORTER_DRIVER"); // simulated driver representation

  return (
    <div className="space-y-6 animate-fade-in text-xs">

      {/* Option selectors for track selection */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-slate-150 p-4 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Select Active Logistics Order ID:</h3>
          <p className="text-[10px] text-slate-400 mt-1">Direct orbit tracking connects transport logs dynamically</p>
        </div>

        <select
          value={selectedWoId || workOrderId || ""}
          onChange={(e) => setSelectedWoId(e.target.value)}
          className="bg-slate-50 border border-slate-205 rounded px-2.5 py-1.5 font-bold font-mono"
        >
          {workOrders.map((w) => (
            <option key={w.WorkOrderId} value={w.WorkOrderId}>
              {w.WorkOrderCode} - {w.Status.replace(/^\d_/, "")}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 -z-0" />
        <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-[9px] font-mono tracking-wider font-bold text-indigo-400 uppercase">
          SECURE SATELLITE ORBIT DESK
        </span>
        <h2 className="text-lg sm:text-xl font-bold mt-2 font-mono">{currentWo.WorkOrderCode} - LOG LOGISTICS</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 relative z-10 text-[11px] text-slate-350 font-mono">
          <div>
            <span className="text-slate-450 block text-[9px] font-bold">PROJECT CODE:</span>
            <span className="font-semibold text-white">{project ? project.ProjectName : "ActiveWear Polo"}</span>
          </div>
          <div>
            <span className="text-slate-450 block text-[9px] font-bold">SUBCONTRACTOR:</span>
            <span className="font-semibold text-white">{sub ? sub.CompanyName : "Kalai Dyeing"}</span>
          </div>
          <div>
            <span className="text-slate-450 block text-[9px] font-bold">DRIVER ID:</span>
            <span className="font-semibold text-white">{driver ? driver.name : "Venkatesh Porter"}</span>
          </div>
          <div>
            <span className="text-slate-450 block text-[9px] font-bold">LOAD STRENGTH:</span>
            <span className="font-bold text-indigo-300">{currentWo.TotalQuantity} {currentWo.Unit}</span>
          </div>
        </div>
      </div>

      {/* Embedded interactive mapping visualizer */}
      <TrackingTimeline
        workOrder={currentWo}
        subcontractor={sub || null}
        driver={driver || null}
      />

      {viewingProjectDetailsId && (
        <ProjectDetailsModal
          projectId={viewingProjectDetailsId}
          onClose={() => setViewingProjectDetailsId(null)}
          projects={projects}
          processes={processes}
        />
      )}

    </div>
  );
}
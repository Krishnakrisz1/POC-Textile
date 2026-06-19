import { useState, useEffect } from "react";
import {
  Layers, Users, TrendingUp, CheckCircle, Clock, AlertCircle, AlertTriangle, Truck, Eye, FileText, Check, CheckSquare, Sparkles, LogOut, Code, ClipboardList, Info, HelpCircle, X, CheckCheck, Search,
  ArrowRight, ShieldCheck, Mail, Database, RefreshCw, Plus, Trash2, Calendar, RotateCcw
} from "lucide-react";
import { User, Project, Process, Subcontractor, WorkOrder, InventoryItem, Notification } from "../types";
import NotificationsDrawer from "./NotificationsDrawer";
import TrackingTimeline from "./TrackingTimeline";

const formatDate = (dateString: string | undefined) => {
  if (!dateString || dateString === 'N/A') return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const formatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return formatter.format(date);
};

export default function ProjectDetailsModal({ projectId, onClose, projects, processes }: { projectId: string, onClose: () => void, projects: Project[], processes: Process[] }) {
  const project = projects.find(p => p.ProjectId === projectId);
  if (!project) return null;
  const projectProcesses = processes.filter(p => p.ProjectId === projectId);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{project.ProjectName}</h2>
            <p className="text-xs font-mono text-slate-500 mt-1">{project.ProjectCode}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400 hover:text-slate-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Project Details</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <span className="block text-slate-500 mb-1">Customer Name</span>
                  <span className="font-bold text-slate-800">{project.CustomerName}</span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">Status</span>
                  <span className="font-bold text-slate-800">{project.Status}</span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">Order Qty</span>
                  <span className="font-bold text-slate-800">{(project as any).OrderQuantity || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">Priority</span>
                  <span className="font-bold text-slate-800">{project.Priority || 'Normal'}</span>
                </div>
              </div>
              <div className="text-xs">
                <span className="block text-slate-500 mb-1">Order Instruction</span>
                <span className="font-medium text-slate-700 bg-slate-50 p-2 rounded block">{project.OrderInstruction || 'None'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Timeline</h3>
              <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                {project.Timeline?.map((t, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1">
                    <span className="text-slate-600 font-medium flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                      {t.milestone}
                    </span>
                    <span className="font-mono font-bold text-slate-800">{formatDate(t.dueDate)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Process Pipeline ({projectProcesses.length})</h3>
            <div className="space-y-3">
              {projectProcesses.map(proc => (
                <div key={proc.ProcessId} className="bg-slate-50 border border-slate-150 rounded-xl p-4 transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                        {proc.ProcessName}
                        <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                          {proc.ProcessType}
                        </span>
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase bg-white px-2 py-0.5 rounded border border-slate-200">{proc.Status}</span>
                  </div>
                  <div className="mt-3 text-xs bg-white p-2.5 rounded border border-slate-100 text-slate-600">
                    <span className="font-bold text-slate-400 block mb-1 uppercase tracking-wider text-[9px]">Instructions</span>
                    <span className="font-medium text-slate-700">"{proc.ProcessInstruction || "No specific instructions provided."}"</span>
                  </div>
                  <div className="mt-3 text-[10px] flex gap-4 text-slate-500 border-t border-slate-100 pt-2">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> <span className="font-bold">{proc.ExpectedDeliveryDays} days</span></span>
                    <span className="flex items-center gap-1"><CheckSquare className="h-3 w-3" /> <span className="font-bold">{proc.QCRequired ? 'Strict QC' : 'Standard'}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
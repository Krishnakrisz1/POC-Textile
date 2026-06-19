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
  const formatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return formatter.format(date);
};

interface ProjectOwnerProps {
  projects: Project[];
  processes: Process[];
  workOrders: WorkOrder[];
  users: User[];
  currentUser: User;
  onAcknowledgeProject: (id: string) => Promise<void>;
  onAssignProcessOwner: () => void;
  onViewDetails?: (id: string) => void;
}

export default function ProjectOwnerDashboard({ projects, processes, workOrders, users, currentUser, onAcknowledgeProject, onAssignProcessOwner, onViewDetails }: ProjectOwnerProps) {
  const [assigningProcId, setAssigningProcId] = useState<string | null>(null);
  const [assignedLeadId, setAssignedLeadId] = useState("user-5");

  const myProjects = projects.filter((p) => p.ProjectOwnerId === currentUser.id && (p.Status === "Approved" || p.Status === "InProgress"));

  const handleOwnerAssignment = async (e: any) => {
    e.preventDefault();
    if (!assigningProcId) return;

    try {
      const res = await fetch(`/api/processes/${assigningProcId}/assign-owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ProcessOwnerId: assignedLeadId })
      });

      if (res.ok) {
        setAssigningProcId(null);
        onAssignProcessOwner();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-3">{currentUser.name}</h2>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {myProjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-150 p-12 text-center text-slate-500">
            No projects currently assigned. Select "Ramesh ProjectHead" or "Senthil Operations" mock role.
          </div>
        ) : (
          myProjects.map((p) => {
            const myProcs = processes.filter((proc) => proc.ProjectId === p.ProjectId);

            return (
              <div key={p.ProjectId} className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{p.ProjectName}</h3>
                      <span className="font-mono text-[10px] bg-slate-55 bg-indigo-50 text-indigo-805 rounded px-2 py-0.5 font-bold">
                        {p.ProjectCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Customer Contract: <span className="font-bold">{p.CustomerName}</span></p>
                    <div className="flex gap-4 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                      <p className="text-[10px] text-slate-500">Timeline: <span className="font-bold">{formatDate(p.Timeline?.[0]?.dueDate)} – {formatDate(p.Timeline?.[p.Timeline?.length - 1]?.dueDate)}</span></p>
                      <p className="text-[10px] text-slate-500">Order Qty: <span className="font-bold">{(p as any).OrderQuantity || 0}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.Status === "Approved" ? (
                      <button
                        onClick={() => onAcknowledgeProject(p.ProjectId)}
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white px-4 py-2 transition-all cursor-pointer shadow-md"
                      >
                        Acknowledge & Start Production Plan
                      </button>
                    ) : (
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                        Active Production: {p.Status}
                      </span>
                    )}
                    <button onClick={() => onViewDetails && onViewDetails(p.ProjectId)} className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors" title="View Full Details">
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Sub processes inside the project */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">
                    Associated Sub-processing Pipelines ({myProcs.length})
                  </h4>

                  {myProcs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No sub-processes found. Use Admin persona to add weaving or dyeing.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {myProcs.map((proc) => {
                        const procWorkOrders = workOrders.filter(w => w.ProcessId === proc.ProcessId);
                        
                        return (
                          <div key={proc.ProcessId} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-4">
                            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                              <div>
                                <h5 className="text-xs font-extrabold text-slate-800">{proc.ProcessName}</h5>
                                {proc.ProcessType && !proc.ProcessName.includes(proc.ProcessType) && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold font-mono bg-indigo-50 border border-indigo-100 text-indigo-600 block w-max mt-1">
                                    {proc.ProcessType}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-right">
                                <div className="text-[10px] text-slate-500 font-bold block mb-1">
                                  Owner: <span className="font-bold text-slate-800">{proc.ProcessOwnerId ? "Assigned" : "Unassigned"}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setAssigningProcId(proc.ProcessId)}
                                  className={`text-[9px] border px-2 py-1 rounded font-bold transition-colors cursor-pointer ${proc.ProcessOwnerId ? "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm" : "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"}`}
                                >
                                  {proc.ProcessOwnerId ? "Reassign" : "Assign Owner"}
                                </button>
                              </div>
                            </div>

                            {/* Detailed Work Order Status History inside Process */}
                            {procWorkOrders.length > 0 && (
                              <div className="space-y-4">
                                <h6 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Active Work Orders ({procWorkOrders.length})</h6>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {procWorkOrders.map(wo => (
                                    <div key={wo.WorkOrderId} className="bg-white border border-slate-150 rounded-xl p-4 shadow-sm text-xs space-y-3">
                                      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                                        <span className="font-bold text-slate-800 font-mono text-[11px]">{wo.WorkOrderCode}</span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                          wo.Status === "7_Completed" ? "bg-emerald-100 text-emerald-805" :
                                          wo.Status === "PulledBack_Verified" ? "bg-emerald-100 text-emerald-700" :
                                          wo.Status.includes("PulledBack") ? "bg-orange-100 text-orange-700" :
                                          "bg-indigo-50 text-indigo-700"
                                        }`}>
                                          {wo.Status.replace(/_/g, " ")}
                                        </span>
                                      </div>

                                      <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-100">
                                        <h6 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock className="h-3 w-3" /> Detailed Status History</h6>
                                        <ul className="space-y-2 border-l-2 border-slate-200 pl-3 ml-1 mt-2">
                                          <li className="relative">
                                            <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-slate-300 border-2 border-white"></span>
                                            <p className="text-[10px] text-slate-500 font-bold">{formatDate(wo.CreatedAt)}</p>
                                            <p className="text-xs text-slate-800 font-semibold">Work Order Created <span className="text-slate-400 font-normal">by Process Owner</span></p>
                                          </li>
                                          {wo.DispatchDate && (
                                            <li className="relative">
                                              <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-slate-300 border-2 border-white"></span>
                                              <p className="text-[10px] text-slate-500 font-bold">{formatDate(wo.DispatchDate)}</p>
                                              <p className="text-xs text-slate-800 font-semibold">Dispatched / Material Prepared</p>
                                            </li>
                                          )}
                                          {wo.pullbackRequestedAt && (
                                            <li className="relative">
                                              <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-orange-400 border-2 border-white"></span>
                                              <p className="text-[10px] text-orange-600 font-bold">{formatDate(wo.pullbackRequestedAt)}</p>
                                              <p className="text-xs text-slate-800 font-semibold">Pullback Requested <span className="text-slate-400 font-normal">by Process Owner</span></p>
                                              <p className="text-[9px] text-slate-500 mt-0.5">Reason: {wo.pullbackReason}</p>
                                            </li>
                                          )}
                                          {wo.pullbackPickupOTPGeneratedAt && (
                                            <li className="relative">
                                              <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-blue-400 border-2 border-white"></span>
                                              <p className="text-[10px] text-blue-600 font-bold">{formatDate(wo.pullbackPickupOTPGeneratedAt)}</p>
                                              <p className="text-xs text-slate-800 font-semibold">Pickup OTP Generated <span className="text-slate-400 font-normal">by Subcontractor</span></p>
                                            </li>
                                          )}
                                          {wo.pullbackPickupVerifiedAt && (
                                            <li className="relative">
                                              <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white"></span>
                                              <p className="text-[10px] text-emerald-600 font-bold">{formatDate(wo.pullbackPickupVerifiedAt)}</p>
                                              <p className="text-xs text-slate-800 font-semibold">Driver Pickup Verified <span className="text-slate-400 font-normal">by Driver</span></p>
                                            </li>
                                          )}
                                          {wo.pullbackReceiptOTPGeneratedAt && (
                                            <li className="relative">
                                              <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-blue-400 border-2 border-white"></span>
                                              <p className="text-[10px] text-blue-600 font-bold">{formatDate(wo.pullbackReceiptOTPGeneratedAt)}</p>
                                              <p className="text-xs text-slate-800 font-semibold">Receipt OTP Generated <span className="text-slate-400 font-normal">by Store Owner</span></p>
                                            </li>
                                          )}
                                          {wo.pullbackReceiptVerifiedAt && (
                                            <li className="relative">
                                              <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white"></span>
                                              <p className="text-[10px] text-emerald-600 font-bold">{formatDate(wo.pullbackReceiptVerifiedAt)}</p>
                                              <p className="text-xs text-slate-800 font-semibold">Warehouse Receipt Verified <span className="text-slate-400 font-normal">by Driver</span></p>
                                            </li>
                                          )}
                                          {wo.pullbackVerifiedAt && (
                                            <li className="relative">
                                              <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-600 border-2 border-white"></span>
                                              <p className="text-[10px] text-emerald-700 font-bold">{formatDate(wo.pullbackVerifiedAt)}</p>
                                              <p className="text-xs text-slate-800 font-semibold">Pullback Verified <span className="text-slate-400 font-normal">by Process Owner</span></p>
                                            </li>
                                          )}
                                        </ul>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

      </div>

      {/* Model Reassignment Overlay */}
      {assigningProcId && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-150 shadow-2xl p-6 w-full max-w-sm text-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Reassign Subproduction Line Lead</h4>
            <form onSubmit={handleOwnerAssignment} className="space-y-4">
              <div>
                <label className="block text-slate-500 mb-1">Select Process Owner</label>
                <select
                  value={assignedLeadId}
                  onChange={(e) => setAssignedLeadId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-201 rounded-lg px-3 py-2 text-slate-805"
                >
                  {users.filter(u => u.role === "PROCESS_OWNER").map((u, idx) => (
                    <option key={u.id} value={u.id}>Process Owner {idx + 1}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningProcId(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                >
                  Assign Process Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
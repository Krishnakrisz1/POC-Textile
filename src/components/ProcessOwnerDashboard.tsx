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

interface ProcessOwnerProps {
  projects: Project[];
  processes: Process[];
  subcontractors: Subcontractor[];
  workOrders: WorkOrder[];
  currentUser: User;
  onStartProcess: (id: string) => Promise<void>;
  onRaiseWorkOrder: (data: any) => Promise<void>;
  onPullBackOrder: (woId: string, data: any) => Promise<void>;
  onAssignReturnPickup: (woId: string, driverId: string) => Promise<void>;
  onViewWo: (woId: string) => void;
  onUpdateStatus: (woId: string, status: string) => Promise<void>;
  onViewDetails?: (id: string) => void;
}

export default function ProcessOwnerDashboard({ projects, processes, subcontractors, workOrders, currentUser, onStartProcess, onRaiseWorkOrder, onPullBackOrder, onAssignReturnPickup, onViewWo, onUpdateStatus, onViewDetails }: ProcessOwnerProps) {
  const [activeProcessId, setActiveProcessId] = useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = useState("");
  const [matName, setMatName] = useState("Grey Yarn 40s combed");
  const [matCode, setMatCode] = useState("inv-1"); // grey yarn comb
  const [matQuantity, setMatQuantity] = useState(500);
  const [matUnit, setMatUnit] = useState("kg");
  const [expectedDays, setExpectedDays] = useState(10);

  const [pullingWoId, setPullingWoId] = useState<string | null>(null);
  const [pullReason, setPullReason] = useState<"Delay" | "QualityIssue" | "NonResponse" | "CapacityProblem">("Delay");

  const [assigningDriverWoId, setAssigningDriverWoId] = useState<string | null>(null);
  const [pickupDriverId, setPickupDriverId] = useState("user-9");
  const [statusFilter, setStatusFilter] = useState("All");

  const myProcesses = processes.filter((p) => p.ProcessOwnerId === currentUser.id).reverse();
  const filteredProcesses = statusFilter === "All" ? myProcesses : myProcesses.filter(p => p.Status === statusFilter);

  const handleRaiseOrderSubmit = async (e: any) => {
    e.preventDefault();
    if (!activeProcessId || !selectedSubId) return;

    // Calculate return date
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + expectedDays);

    const woPayload = {
      ProcessId: activeProcessId,
      SubcontractorId: selectedSubId,
      MaterialDetails: [{ ItemId: matCode, ItemName: matName, Quantity: Number(matQuantity), Unit: matUnit }],
      TotalQuantity: matQuantity,
      Unit: matUnit,
      ExpectedReturnDate: returnDate.toISOString().split("T")[0],
      CreatedBy: currentUser.id
    };

    await onRaiseWorkOrder(woPayload);
    setActiveProcessId(null);
  };

  const handlePullBackSubmit = async (e: any) => {
    e.preventDefault();
    if (!pullingWoId) return;

    await onPullBackOrder(pullingWoId, {
      Reason: pullReason,
      InitiatedBy: currentUser.id
    });
    setPullingWoId(null);
  };

  const handleAssignDriverSubmit = async (e: any) => {
    e.preventDefault();
    if (!assigningDriverWoId) return;

    await onAssignReturnPickup(assigningDriverWoId, pickupDriverId);
    setAssigningDriverWoId(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left: processes and orders */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-850 tracking-tight">Assigned Subproduction Lines</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Assigned">Assigned</option>
              <option value="InProgress">InProgress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {filteredProcesses.length === 0 ? (
            <div className="text-slate-550 text-xs py-8 text-center italic">
              No processing steps found for the selected filter.
            </div>
          ) : (
            <div className="space-y-4.5">
              {filteredProcesses.map((p) => {
                const wos = workOrders.filter((w) => w.ProcessId === p.ProcessId);
                const hasOrder = wos.length > 0;
                const proj = projects.find(pr => pr.ProjectId === p.ProjectId);

                return (
                  <div key={p.ProcessId} className="border border-slate-105 rounded-2xl p-4 bg-slate-50/30 text-xs space-y-3.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{proj?.ProjectCode || p.ProjectId}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-indigo-655 font-bold block">
                          {p.ProcessType}
                        </span>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2">
                        <span className="rounded bg-slate-900 text-white text-[9px] px-2 py-0.5 font-bold uppercase">
                          {p.Status}
                        </span>
                        <button onClick={() => onViewDetails && onViewDetails(p.ProjectId)} className="flex items-center gap-1.5 px-2 py-1 border border-slate-200 rounded text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors" title="View Full Project Details">
                          <Info className="h-3 w-3" /> Details
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-slate-100 flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-slate-400 font-bold block">Project Name:</span>
                          <span className="text-slate-800 font-semibold">{proj?.ProjectName || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block">Customer:</span>
                          <span className="text-slate-800 font-semibold">{proj?.CustomerName || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block">Order Qty:</span>
                          <span className="text-slate-800 font-semibold">{(proj as any)?.OrderQuantity || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block">Timeline:</span>
                          <span className="text-slate-800 font-semibold">{formatDate(proj?.Timeline?.[0]?.dueDate)} – {formatDate(proj?.Timeline?.[proj.Timeline.length - 1]?.dueDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                      {p.Status === "Assigned" && (
                        <button
                          onClick={() => onStartProcess(p.ProcessId)}
                          className="rounded-lg bg-slate-950 font-bold hover:bg-slate-850 px-3 py-1.5 text-white cursor-pointer"
                        >
                          Mark Production Active
                        </button>
                      )}

                      {p.Status === "InProgress" && !hasOrder && (
                        <button
                          onClick={() => {
                            setActiveProcessId(p.ProcessId);
                            // Pre-fill matching subcontractor
                            const match = subcontractors.find((s) => s.ProcessTypes.includes(p.ProcessType));
                            if (match) setSelectedSubId(match.SubcontractorId);
                          }}
                          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold text-white px-3.5 py-1.5 cursor-pointer"
                        >
                          Raise Material Request to Store
                        </button>
                      )}

                      {hasOrder && (
                        <span className="text-emerald-805 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded font-bold uppercase tracking-wider text-[10px]">
                          Work Orders Dispatched
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Raise Work Order Modal view context */}
        <div className="space-y-6">
          {activeProcessId ? (
            <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs space-y-4 animate-slide-up">
              <h3 className="text-sm font-bold text-slate-850 border-b border-slate-50 pb-2">
                Raise Material Request
              </h3>

              <form onSubmit={handleRaiseOrderSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Verify subcontractor Destination</label>
                  <select
                    value={selectedSubId}
                    onChange={(e) => setSelectedSubId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-201 rounded-lg px-3 py-2 text-slate-805"
                    required
                  >
                    <option value="">-- Choose Subcontractor --</option>
                    {subcontractors.map((s) => (
                      <option key={s.SubcontractorId} value={s.SubcontractorId}>
                        {s.CompanyName} ({s.ProcessTypes.join(", ")})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Material item Name</label>
                    <select
                      value={matCode}
                      onChange={(e) => {
                        const codes: Record<string, string> = {
                          "inv-1": "Grey Yarn 40s combed",
                          "inv-2": "Grey Fabric Interlock",
                          "inv-3": "Dyed Jersey Fabric Royal Blue",
                          "inv-4": "Cut Chest Panels Cotton"
                        };
                        setMatCode(e.target.value);
                        setMatName(codes[e.target.value]);
                      }}
                      className="w-full bg-slate-50 border border-slate-201 rounded-lg px-3 py-2 text-slate-805"
                    >
                      <option value="inv-1">Grey Yarn COMVED 40s</option>
                      <option value="inv-2">Grey Fabric Interlock Roll</option>
                      <option value="inv-3">Dyed Royal Blue rolls</option>
                      <option value="inv-4">Cut Panels Cotton</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Weighing / Measure Quantity</label>
                    <input
                      type="number"
                      value={matQuantity}
                      onChange={(e) => setMatQuantity(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition duration-150 cursor-pointer text-center"
                >
                  Confirm & Request Materials from Store
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-4">My Supervised Dispatched Orders ({workOrders.length})</h3>

              <div className="space-y-3">
                {workOrders.map((wo) => {
                  const sub = subcontractors.find((s) => s.SubcontractorId === wo.SubcontractorId);

                  return (
                    <div key={wo.WorkOrderId} className="border border-slate-100 p-4 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 font-mono text-[13px]">{wo.WorkOrderCode}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          wo.Status === "7_Completed" ? "bg-emerald-100 text-emerald-805" :
                          wo.Status === "PulledBack_Verified" ? "bg-emerald-100 text-emerald-700" :
                          wo.Status === "PulledBack_Received" ? "bg-rose-100 text-rose-700" :
                          wo.Status.includes("PulledBack") ? "bg-orange-100 text-orange-700" :
                          "bg-indigo-50 text-indigo-700"
                        }`}>
                          {wo.Status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500">
                        <span>Sub: {sub ? sub.CompanyName.split(" ")[0] : "Center"}</span>
                        <span>Quantity: {wo.TotalQuantity} {wo.Unit}</span>
                      </div>

                      {wo.Status.includes("PulledBack") && (
                        <div className="bg-slate-50 border border-slate-100 rounded p-2 text-[10px] space-y-1">
                          <div className="font-bold text-slate-700">Pullback Audit</div>
                          {wo.pullbackReason && <div>Reason: <span className="font-semibold text-slate-600">{wo.pullbackReason}</span></div>}
                          {wo.pullbackRequestedAt && <div>Requested: <span className="font-mono text-slate-500">{formatDate(wo.pullbackRequestedAt)}</span></div>}
                          {wo.pullbackReceivedAt && <div>Received: <span className="font-mono text-slate-500">{formatDate(wo.pullbackReceivedAt)}</span></div>}
                          {wo.pullbackVerifiedAt && <div>Verified: <span className="font-mono text-emerald-600">{formatDate(wo.pullbackVerifiedAt)}</span></div>}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t border-slate-50 items-center justify-between">
                        <button
                          onClick={() => onViewWo(wo.WorkOrderId)}
                          className="text-[10px] text-slate-650 font-bold hover:underline"
                        >
                          Tracking Timeline Map
                        </button>

                        <div className="flex gap-1.5 ml-auto">
                          {wo.Status === "5_ReturnInTransit" && (
                            <button
                              onClick={() => setAssigningDriverWoId(wo.WorkOrderId)}
                              className="rounded bg-slate-900 text-white font-bold py-1 px-2.5 text-[10px] cursor-pointer"
                            >
                              Assign Porter Pickup
                            </button>
                          )}
                          
                          {wo.Status === "PulledBack_Received" && (
                            <button
                              onClick={async () => {
                                await fetch(`/api/work-orders/${wo.WorkOrderId}/verify-pullback`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" }
                                });
                                window.location.reload();
                              }}
                              className="rounded border border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold py-1 px-2.5 text-[10px] cursor-pointer shadow-xs"
                            >
                              Verify Pullback Receipt
                            </button>
                          )}

                          {wo.Status === "3_ReceivedBySubcontractor" && (
                            <button
                              onClick={() => onUpdateStatus(wo.WorkOrderId, "4_InProcessAtSubcontractor")}
                              className="rounded border border-indigo-300 hover:bg-indigo-50 text-indigo-700 font-bold py-1 px-2.5 text-[10px] cursor-pointer"
                            >
                              Confirm Processing Started
                            </button>
                          )}
                          {wo.Status === "4_InProcessAtSubcontractor" && (
                            <button
                              onClick={() => onUpdateStatus(wo.WorkOrderId, "4.5_ProcessCompleted")}
                              className="rounded border border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold py-1 px-2.5 text-[10px] cursor-pointer"
                            >
                              Mark Process Completed
                            </button>
                          )}

                          {wo.Status === "4.5_ProcessCompleted" && (
                            <button
                              onClick={async () => {
                                await fetch("/api/return/create", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ WorkOrderId: wo.WorkOrderId })
                                });
                                window.location.reload();
                              }}
                              className="rounded bg-slate-900 hover:bg-slate-800 text-white font-bold py-1 px-2.5 text-[10px] cursor-pointer"
                            >
                              Create Material Pickup Request
                            </button>
                          )}

                          {wo.Status === "6_ReceivedAtCompanyStore" && (
                            <button
                              onClick={() => onUpdateStatus(wo.WorkOrderId, "7_Completed")}
                              className="rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-3 text-[10px] cursor-pointer shadow-md"
                            >
                              Close Process (Finalize)
                            </button>
                          )}

                          {!wo.Status.includes("PulledBack") && wo.Status !== "7_Completed" && (
                            <button
                              onClick={() => {
                                setPullingWoId(wo.WorkOrderId);
                              }}
                              className="rounded border border-rose-220 hover:bg-rose-50 text-rose-600 font-bold py-1 px-2.5 text-[10px] cursor-pointer"
                            >
                              Emergency Pullback Recalls
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* EMERGENCY PULLBACK OVERLAY */}
      {pullingWoId && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 w-full max-w-md text-xs space-y-4">
            <div className="flex items-center gap-1.5 text-rose-600 font-bold">
              <AlertTriangle className="h-5 w-5" />
              <h4>Emergency Handover Pullback Action</h4>
            </div>

            <p className="text-slate-500">
              This initiates a rapid inventory recall. Reclaims ownership stamps & automatically submits materials for alternate subcontracting.
            </p>

            <form onSubmit={handlePullBackSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-500 mb-1">Emergency Recall Trigger Reason</label>
                <select
                  value={pullReason}
                  onChange={(e: any) => setPullReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-201 rounded-lg px-3 py-2 text-slate-805 font-bold"
                >
                  <option value="Delay">Severe Subcontractor SLA Delay</option>
                  <option value="QualityIssue">Chemical/Physical Quality Issues</option>
                  <option value="NonResponse">Communication Delay/No Response</option>
                  <option value="CapacityProblem">Capacity Failure on Site</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold pt-2">
                <button
                  type="button"
                  onClick={() => setPullingWoId(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                >
                  Acknowledge Emergency Pullback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN DRIVER MODEL */}
      {assigningDriverWoId && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-xs space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Truck className="h-4.5 w-4.5 text-slate-650" />
              Assign Porter Driver for Return Handover
            </h4>

            <form onSubmit={handleAssignDriverSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-500 mb-1">Select Driver</label>
                <select
                  value={pickupDriverId}
                  onChange={(e) => setPickupDriverId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-201 rounded-lg px-3 py-2 font-bold"
                >
                  <option value="user-9">Venkatesh Porter (+91 9361112222)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAssigningDriverWoId(null)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-550 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded cursor-pointer"
                >
                  Assign Driver & Issue Handover OTP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
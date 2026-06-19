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

interface SuperAdminProps {
  projects: Project[];
  workOrders: WorkOrder[];
  subcontractors: Subcontractor[];
  onApproveProject: (id: string) => Promise<void>;
  onRejectProject: (id: string) => Promise<void>;
  onViewProject: (id: string) => void;
  onNavigate: (path: string) => void;
  onSelectWo: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export default function SuperAdminDashboard({ projects, workOrders, subcontractors, onApproveProject, onRejectProject, onViewProject, onNavigate, onSelectWo, onViewDetails }: SuperAdminProps) {
  const [metrics, setMetrics] = useState<any>({
    totalWorkOrders: 8,
    inTransitToSubcontractor: 2,
    inProcessAtSubcontractor: 3,
    pendingDispatch: 1,
    returnInTransit: 1,
    completedThisMonth: 1,
    pullbacks: 0,
    overdue: 1
  });

  const getKPIs = async () => {
    try {
      const res = await fetch("/api/dashboard/superadmin");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.kpis);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getKPIs();
  }, [projects, workOrders]);

  const pendingApproval = projects.filter((p) => p.Status === "PendingApproval");

  return (
    <div className="space-y-8 animate-fade-in">

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        {[
          { label: "TOTAL PROJECTS", val: metrics.totalWorkOrders || 25, border: "border-l-slate-400", text: "text-slate-800", desc: "Supervised order lines", icon: <ClipboardList className="h-4 w-4 text-slate-400" /> },
          { label: "ACTIVE PROJECTS", val: 18, border: "border-l-blue-500", text: "text-blue-600", desc: "In assembly & weaving", icon: <CheckCircle className="h-4 w-4 text-slate-400" /> },
          { label: "COMPLETED PROJECTS", val: 2, border: "border-l-emerald-500", text: "text-emerald-600", desc: "Passed final QA", icon: <CheckCircle className="h-4 w-4 text-slate-400" /> },
          { label: "DELAYED PROJECTS", val: 3, border: "border-l-red-500", text: "text-red-600", desc: "Actions required", icon: <AlertTriangle className="h-4 w-4 text-slate-400" /> },
          { label: "MATERIAL IN TRANSIT", val: 12, border: "border-l-cyan-500", text: "text-cyan-600", desc: "OTP monitored", icon: <Truck className="h-4 w-4 text-slate-400" /> },
          { label: "CONTRACTOR LOAD", val: 18, border: "border-l-indigo-500", text: "text-indigo-600", desc: "Processing stages", icon: <Layers className="h-4 w-4 text-slate-400" /> },
          { label: "PENDING APPROVAL", val: 5, border: "border-l-orange-500", text: "text-orange-600", desc: "Needs MD sign-off", icon: <FileText className="h-4 w-4 text-slate-400" /> }
        ].map((kpi) => (
          <div key={kpi.label} className={`bg-white rounded-lg border border-slate-200 border-l-4 ${kpi.border} p-3 shadow-xs flex flex-col justify-between`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{kpi.label}</span>
              {kpi.icon}
            </div>
            <div>
              <span className={`text-2xl font-black font-sans tracking-tight ${kpi.text}`}>
                {kpi.val}
              </span>
              <p className="text-[9px] text-slate-400 mt-1 truncate">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid containing Section 2 and 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* SECTION 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  SECTION 2 : PROJECT HEALTH DASHBOARD <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Live Core</span>
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">Real-time tracking of active orders, milestone ratios, and delay risks. Click a row to load the drill-down sequence.</p>
              </div>
              <div className="flex gap-2">
                <div className="relative hidden sm:block">
                  <input type="text" placeholder="Search Owner, Buyer..." className="pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md bg-slate-50 text-slate-700 focus:outline-none w-48" />
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <select className="border border-slate-200 rounded-md bg-white text-[11px] font-semibold text-slate-700 px-2 py-1.5 focus:outline-none cursor-pointer">
                  <option>All Statuses</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                    <th className="pb-3 w-[15%]">Project ID</th>
                    <th className="pb-3 w-[15%]">Buyer</th>
                    <th className="pb-3 w-[15%]">Project Owner</th>
                    <th className="pb-3 w-[10%]">Order Qty</th>
                    <th className="pb-3 w-[10%]">Start Date</th>
                    <th className="pb-3 w-[10%]">Due Date</th>
                    <th className="pb-3 w-[15%]">Progress Monitor</th>
                    <th className="pb-3 w-[10%]">State</th>
                    <th className="pb-3 w-[10%] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map(p => {
                    const isPending = p.Status === "PendingApproval";
                    let prog = isPending ? 0 : 50;
                    let state = "Active";
                    let stateColor = "bg-blue-50 text-blue-600 border-blue-100";

                    if (isPending) {
                      state = "Pending";
                      stateColor = "bg-orange-50 text-orange-600 border-orange-100";
                    } else if (p.Status === "Completed") {
                      state = "Completed";
                      stateColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                      prog = 100;
                    }

                    return (
                      <tr key={p.ProjectId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 pr-2 font-bold text-slate-800 text-[11px] flex items-center gap-2">
                          {p.ProjectCode || p.ProjectName}
                        </td>
                        <td className="py-3 pr-2 font-bold text-slate-700 text-[11px]">{p.CustomerName}</td>
                        <td className="py-3 pr-2 text-slate-600 text-[11px]">{p.ProjectOwnerId}</td>
                        <td className="py-3 pr-2 font-bold text-slate-800 text-[11px]">{(p as any).OrderQuantity || "N/A"}</td>
                        <td className="py-3 pr-2 font-mono text-slate-500 text-[10px]">{formatDate(p.Timeline?.[0]?.dueDate)}</td>
                        <td className="py-3 pr-2 font-mono text-slate-500 text-[10px]">{formatDate(p.Timeline?.[p.Timeline.length - 1]?.dueDate)}</td>
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${state === 'Pending' ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${prog}%` }}></div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-600">{prog}%</span>
                          </div>
                        </td>
                        <td className="py-3 pr-2">
                          <span className={`px-2 py-1 rounded text-[9px] font-bold border ${stateColor}`}>{state}</span>
                        </td>
                        <td className="py-3 text-right">
                          {isPending ? (
                            <div className="flex gap-1 justify-end">
                              <button onClick={() => onApproveProject(p.ProjectId)} className="p-1 border border-emerald-200 rounded text-emerald-500 hover:bg-emerald-50 cursor-pointer transition-colors" title="Approve Contract">
                                <Check className="h-3 w-3" />
                              </button>
                              <button onClick={() => onRejectProject(p.ProjectId)} className="p-1 border border-rose-200 rounded text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors" title="Reject">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1 justify-end">
                              <button onClick={() => onViewDetails && onViewDetails(p.ProjectId)} className="p-1 border border-indigo-200 rounded text-indigo-500 hover:bg-indigo-50 cursor-pointer transition-colors" title="View Details">
                                <Info className="h-3 w-3" />
                              </button>
                              <button onClick={() => onViewProject(p.ProjectId)} className="p-1 border border-slate-200 rounded text-slate-400 hover:text-blue-600 hover:border-blue-300 bg-white cursor-pointer transition-colors" title="Drill Down">
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {/* SECTION 4 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                  SECTION 4 : PROCESS DETAIL / POLO-001
                </h3>
                <h2 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-3">
                  PRINTING EXECUTION CHECKLIST
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-blue-100">3/5 Steps</span>
                </h2>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-sm uppercase tracking-widest cursor-pointer">
                <RotateCcw className="h-3 w-3" /> Simulate Step
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center mb-6">
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Subcontractor Firm</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                  <Users className="h-3.5 w-3.5 text-emerald-500" /> PQR Printers
                </div>
              </div>
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Assigned Process Owner</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                  <ClipboardList className="h-3.5 w-3.5 text-blue-500" /> Ravi Teja
                </div>
              </div>
            </div>

            <div className="space-y-0 relative pl-2 flex-1">
              <div className="absolute left-[15px] top-3 bottom-6 w-px bg-slate-200 z-0"></div>

              {[
                { title: "Artwork Approval", desc: "Completed step", time: "2026-06-16 14:00", state: "done" },
                { title: "Screen Preparation", desc: "Completed step", time: "2026-06-16 16:30", state: "done" },
                { title: "Printing", desc: "Completed step", time: "2026-06-17 08:00", state: "done" },
                { title: "Curing", desc: "Current execution phase", state: "current" },
                { title: "QC Inspection", desc: "Scheduled queue", state: "queue" },
              ].map((step, idx) => (
                <div key={idx} className="relative z-10 flex gap-4 pb-5 last:pb-0">
                  <div className="mt-1 bg-white">
                    {step.state === 'done' ? (
                      <div className="h-4 w-4 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-white shadow-xs">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                      </div>
                    ) : step.state === 'current' ? (
                      <div className="h-4 w-4 rounded-full border-2 border-blue-500 flex items-center justify-center bg-white shadow-xs">
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-slate-200 bg-white"></div>
                    )}
                  </div>
                  <div className="flex-1 flex justify-between items-start">
                    <div>
                      <h4 className={`text-xs font-bold ${step.state === 'queue' ? 'text-slate-400' : 'text-slate-900'}`}>{step.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                    {step.state === 'done' && (
                      <span className="text-[9px] font-mono border border-slate-200 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" /> {step.time}
                      </span>
                    )}
                    {step.state === 'current' && (
                      <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">In Production</span>
                    )}
                    {step.state === 'queue' && (
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Queued</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">
              SECTION 3 : PROJECT DRILL DOWN / <span className="text-blue-600">POLO-001</span>
            </h3>
            <h2 className="text-sm font-black text-slate-800 tracking-tight">PROCESS EXECUTION FLOW</h2>
          </div>
          <div className="border border-slate-200 rounded-lg p-2 px-3 text-right">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Overall Progress</span>
            <div className="flex items-center gap-3">
              <span className="text-lg font-black text-slate-800 tracking-tight leading-none">75%</span>
              <div className="h-4 w-1.5 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { id: "01", name: "Knitting", status: "COMPLETED", yield: 100, vendor: "ABC Knitters", admin: "Prakash P", active: false, color: "emerald" },
            { id: "02", name: "Dyeing", status: "COMPLETED", yield: 100, vendor: "XYZ Dye House", admin: "Kumar Sw...", active: false, color: "emerald" },
            { id: "03", name: "Printing", status: "IN PROGRESS", yield: 80, vendor: "PQR Printers", admin: "Ravi Teja", active: true, color: "blue" },
            { id: "04", name: "Stitching", status: "DELAYED", yield: 30, vendor: "LMN Stitc...", admin: "Arun Kumar", active: false, color: "rose" },
            { id: "05", name: "Packing", status: "NOT STARTED", yield: 0, vendor: "SK Packers", admin: "Mehra Dev", active: false, color: "slate" },
          ].map(card => (
            <div key={card.id} className={`rounded-xl bg-white p-4 ${card.active ? 'border-blue-500 border-2 shadow-sm' : 'border-slate-200 border'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${card.active ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                  <Layers className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-full">{card.id}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm tracking-tight">{card.name}</h4>
              <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 mb-4 ${card.color === 'emerald' ? 'text-emerald-600' : card.color === 'blue' ? 'text-blue-600' : card.color === 'rose' ? 'text-rose-600' : 'text-slate-400'}`}>{card.status}</p>

              <div className="mb-4">
                <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  <span>Progress</span>
                  <span>{card.yield}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${card.color === 'emerald' ? 'bg-emerald-500' : card.color === 'blue' ? 'bg-blue-500' : card.color === 'rose' ? 'bg-rose-500' : 'bg-slate-200'}`} style={{ width: `${card.yield}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Sub-Contractor</span>
                  <span className="text-[10px] font-bold text-slate-700 truncate block">{card.vendor}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Process Owner</span>
                  <span className="text-[10px] font-bold text-slate-700 truncate block">{card.admin}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              SECTION 5 : MATERIAL VISIBILITY TRACKING <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest border border-indigo-100">Transit Log</span>
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Logistical flow audit from raw yard stock to subcontracting floors. Click any row to track its exact OTP sequence in Section 6.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative hidden sm:block">
              <input type="text" placeholder="Search Material..." className="pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md bg-slate-50 text-slate-700 focus:outline-none w-48" />
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <select className="border border-slate-200 rounded-md bg-white text-[11px] font-semibold text-slate-700 px-2 py-1.5 focus:outline-none cursor-pointer">
              <option>All Flows</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                <th className="pb-3">Material Unit</th>
                <th className="pb-3">Project Ref</th>
                <th className="pb-3">Manufacturing Stage</th>
                <th className="pb-3">Custodian Contractor</th>
                <th className="pb-3">Allotted Quantity</th>
                <th className="pb-3">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { unit: "5000 KG Yarn", mat: "MAT-001", ref: "POLO-001", stage: "Knitting", vendor: "ABC Knitters", qty: "5000 KG", status: "Delivered", statusColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                { unit: "4000 KG Grey Fabric", mat: "MAT-002", ref: "POLO-001", badge: "Tracking", stage: "Dyeing", vendor: "XYZ Dye House", qty: "4000 KG", status: "Processing", statusColor: "text-blue-600 bg-blue-50 border-blue-100" },
                { unit: "3000 KG Printed Fabric", mat: "MAT-003", ref: "TSHIRT-002", stage: "Stitching", vendor: "LMN Stitching", qty: "3000 KG", status: "Return Transit", statusColor: "text-amber-600 bg-amber-50 border-amber-100" },
                { unit: "2500 KG Polyster Yarn", mat: "MAT-004", ref: "JACKET-004", stage: "Knitting", vendor: "ABC Knitters", qty: "2500 KG", status: "Delivered", statusColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                { unit: "1800 KG Nylon Fabric", mat: "MAT-005", ref: "JACKET-004", stage: "Dyeing", vendor: "XYZ Dye House", qty: "1800 KG", status: "Delivered", statusColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                { unit: "1200 KG Chino Cotton Yarn", mat: "MAT-006", ref: "CHINO-005", stage: "Knitting", vendor: "ABC Knitters", qty: "1200 KG", status: "In Transit", statusColor: "text-indigo-600 bg-indigo-50 border-indigo-100" },
              ].map(row => (
                <tr key={row.mat} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                      {row.unit}
                      {row.badge && <span className="bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">Tracking</span>}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{row.mat}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">{row.ref}</span>
                  </td>
                  <td className="py-3 pr-4 text-[11px] font-semibold text-slate-600">{row.stage}</td>
                  <td className="py-3 pr-4 font-bold text-slate-800 text-[11px]">{row.vendor}</td>
                  <td className="py-3 pr-4 font-bold text-slate-800 text-[11px]">{row.qty}</td>
                  <td className="py-3">
                    <span className={`text-[9px] font-bold px-2 py-1 rounded border ${row.statusColor}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
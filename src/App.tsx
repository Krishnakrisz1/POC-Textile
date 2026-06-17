import { useState, useEffect } from "react";
import {
  Layers, Users, TrendingUp, CheckCircle, Clock, AlertCircle, Ship, BookOpen,
  ArrowRight, ShieldCheck, Mail, Database, RefreshCw, Plus, Trash2, Calendar, RotateCcw,
  AlertTriangle, Truck, Eye, FileText, Check, CheckSquare, Sparkles, LogOut, Code, ClipboardList, Info, HelpCircle, X, CheckCheck
} from "lucide-react";
import { User, Project, Process, Subcontractor, WorkOrder, InventoryItem, Notification } from "./types";
import NotificationsDrawer from "./components/NotificationsDrawer";
import TrackingTimeline from "./components/TrackingTimeline";

export default function App() {
  // Navigation State
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem("textile_poc_user");
    if (saved) return JSON.parse(saved);
    return {
      id: "user-1",
      name: "Kalyan MD",
      email: "krishnajayanth54@gmail.com",
      phone: "+91 9443210123",
      role: "SUPER_ADMIN",
      roleName: "SuperAdmin (MD)"
    };
  });
  const [currentPath, setCurrentPath] = useState(() => {
    return localStorage.getItem("textile_poc_path") || "/";
  });
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("textile_poc_user", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("textile_poc_path", currentPath);
  }, [currentPath]);

  // Global Sync Status
  const [projects, setProjects] = useState<Project[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  const usersList: User[] = [
    { id: "user-1", name: "SuperAdmin", email: "krishnajayanth54@gmail.com", phone: "", role: "SUPER_ADMIN", roleName: "SuperAdmin" },
    { id: "user-2", name: "Admin", email: "admin@company.com", phone: "", role: "ADMIN", roleName: "Admin" },
    { id: "user-3", name: "Project Owner", email: "po1@company.com", phone: "", role: "PROJECT_OWNER", roleName: "Project Owner" },
    { id: "user-5", name: "Process Owner", email: "pro1@company.com", phone: "", role: "PROCESS_OWNER", roleName: "Process Owner" },
    { id: "user-8", name: "Store Owner", email: "store@company.com", phone: "", role: "INVENTORY_OWNER", roleName: "Store Owner" },
    { id: "user-9", name: "Driver", email: "driver1@company.com", phone: "", role: "PORTER_DRIVER", roleName: "Driver" }
  ];

  // Sync Backend State
  const syncDatabase = async () => {
    setLoading(true);
    try {
      const projRes = await fetch("/api/projects");
      const procRes = await fetch("/api/processes");
      const subRes = await fetch("/api/subcontractors");
      const woRes = await fetch("/api/work-orders");
      const invRes = await fetch("/api/inventory");
      const userRes = await fetch("/api/users");

      if (projRes.ok) setProjects(await projRes.json());
      if (procRes.ok) setProcesses(await procRes.json());
      if (subRes.ok) setSubcontractors(await subRes.json());
      if (woRes.ok) setWorkOrders(await woRes.json());
      if (invRes.ok) setInventory(await invRes.json());
      if (userRes.ok) {
        const use = await userRes.json();
        setAllUsers(use.map((u: any) => ({
          id: u.UserId || u.id,
          name: u.Name || u.name,
          email: u.Email || u.email,
          phone: u.Phone || u.phone,
          role: u.RoleCode || u.role,
          roleName: u.RoleName || u.roleName
        })));
      }
    } catch (e) {
      console.error(e);
      setErrorText("Failed to establish server synchronization. Verify backend is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncDatabase();
  }, []);

  const handleRoleSwitch = (userId: string) => {
    const selected = usersList.find(u => u.id === userId);
    if (selected) {
      setCurrentUser({
        id: selected.id,
        name: selected.name,
        email: selected.email,
        phone: "+91 9900000000",
        role: selected.role as any,
        roleName: selected.roleName
      });
      // Redirect route context on swap
      if (selected.role === "SUPER_ADMIN") setCurrentPath("/superadmin/dashboard");
      else if (selected.role === "ADMIN") setCurrentPath("/admin/dashboard");
      else if (selected.role === "PROJECT_OWNER") setCurrentPath("/project-owner/dashboard");
      else if (selected.role === "PROCESS_OWNER") setCurrentPath("/process-owner/dashboard");
      else if (selected.role === "INVENTORY_OWNER") setCurrentPath("/inventory/dashboard");
      else if (selected.role === "PORTER_DRIVER") setCurrentPath("/driver/my-deliveries");
      else setCurrentPath("/");

      setSuccessText(`Logged in as simulated worker: ${selected.name}`);
      setTimeout(() => setSuccessText(""), 3000);
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">

      {/* Sleek Interface Sidebar Navigation */}
      <aside className="hidden lg:flex w-64 bg-[#0F172A] text-slate-300 flex-col shrink-0 border-r border-[#1E293B]">
        {/* Top Branding Section with custom spacing */}
        <div className="px-6 py-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-600 p-2 text-white shadow-md shadow-blue-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight leading-tight">
                Sakthithara
              </h1>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Textile Systems
              </span>
            </div>
          </div>
        </div>

        {/* Navigation - Elegant states matching the 'Sleek Interface' specification */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => {
              if (currentUser.role === "SUPER_ADMIN") setCurrentPath("/superadmin/dashboard");
              else if (currentUser.role === "ADMIN") setCurrentPath("/admin/dashboard");
              else if (currentUser.role === "PROJECT_OWNER") setCurrentPath("/project-owner/dashboard");
              else if (currentUser.role === "PROCESS_OWNER") setCurrentPath("/process-owner/dashboard");
              else if (currentUser.role === "INVENTORY_OWNER") setCurrentPath("/inventory/dashboard");
              else if (currentUser.role === "PORTER_DRIVER") setCurrentPath("/driver/my-deliveries");
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${currentPath === "/" || currentPath.endsWith("dashboard") || currentPath === "/driver/my-deliveries"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
          >
            <ClipboardList className="h-4.5 w-4.5" />
            <span>My Dashboard</span>
          </button>

          {workOrders.length > 0 && (
            <button
              onClick={() => {
                setSelectedWorkOrderId(workOrders[0].WorkOrderId);
                setCurrentPath(`/tracking/${workOrders[0].WorkOrderId}`);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${currentPath.startsWith("/tracking/")
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
            >
              <Truck className="h-4.5 w-4.5" />
              <span>Live Tracker</span>
            </button>
          )}


        </nav>

        {/* Profile Footer display in Sidebar - elegant avatar indicator */}
        <div className="p-6 border-t border-slate-800 shrink-0 bg-[#0B1222] text-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-705 flex items-center justify-center font-bold text-blue-400 font-mono">
              {currentUser.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-white truncate leading-none mb-1">{currentUser.name}</h4>
              <p className="text-[10px] text-slate-400 truncate leading-none font-medium">{currentUser.roleName}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile/Tablet Header with beautiful compact buttons */}
        <div className="lg:hidden bg-[#0F172A] text-slate-100 px-4 py-3 sticky top-0 z-35 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="rounded bg-blue-600 p-1.5 text-white">
              <Layers className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-white text-sm tracking-tight">Sakthithara</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (currentUser.role === "SUPER_ADMIN") setCurrentPath("/superadmin/dashboard");
                else if (currentUser.role === "ADMIN") setCurrentPath("/admin/dashboard");
                else if (currentUser.role === "PROJECT_OWNER") setCurrentPath("/project-owner/dashboard");
                else if (currentUser.role === "PROCESS_OWNER") setCurrentPath("/process-owner/dashboard");
                else if (currentUser.role === "INVENTORY_OWNER") setCurrentPath("/inventory/dashboard");
                else if (currentUser.role === "PORTER_DRIVER") setCurrentPath("/driver/my-deliveries");
              }}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300"
              title="Dashboard"
            >
              <ClipboardList className="h-4 w-4" />
            </button>
            {workOrders.length > 0 && (
              <button
                onClick={() => {
                  setSelectedWorkOrderId(workOrders[0].WorkOrderId);
                  setCurrentPath(`/tracking/${workOrders[0].WorkOrderId}`);
                }}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-300"
                title="Live Tracker"
              >
                <Truck className="h-4 w-4" />
              </button>
            )}

          </div>
        </div>

        {/* Global Dashboard Header (Sleek Interface specifications) */}
        <header className="bg-white h-16 shadow-xs border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none">
              {currentPath === "/" || currentPath.endsWith("dashboard") || currentPath === "/driver/my-deliveries"
                ? "Project Control Room"
                : currentPath.startsWith("/tracking/")
                  ? "Live Orbit Tracking Desk"
                  : "Partner Production Gateway"}
            </h2>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1.5 leading-none shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              System Live
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* System Time clock metadata */}
            <div className="hidden md:flex flex-col text-right font-mono text-[10px] text-slate-400 shrink-0">
              <span className="font-bold text-slate-500 uppercase tracking-wide leading-none mb-0.5">System Time (IST)</span>
              <span>{new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })}</span>
            </div>

            {/* Quick Simulation Select */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-lg shrink-0">
              <select
                value={currentUser.id}
                onChange={(e) => handleRoleSwitch(e.target.value)}
                className="bg-white border-0 text-[11px] font-bold text-slate-800 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer"
                id="select-user-role"
              >
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <button
                onClick={syncDatabase}
                title="Sync database changes"
                className="rounded-lg p-1.5 hover:bg-slate-200 bg-white border border-slate-150 text-slate-500 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={async () => {
                  if (window.confirm("Are you sure you want to reset the mock database? All testing data will be lost.")) {
                    await fetch("/api/reset", { method: "POST" });
                    syncDatabase();
                    setSuccessText("Database successfully reset to mock defaults.");
                    setTimeout(() => setSuccessText(""), 3000);
                  }
                }}
                title="Reset Database to Mock Defaults"
                className="rounded-lg p-1.5 hover:bg-rose-100 bg-white border border-slate-150 text-rose-500 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Global info bars / alert status */}
        {errorText && (
          <div className="bg-rose-50 border-b border-rose-100 px-4 py-3 text-xs text-rose-800 font-semibold text-center animate-fade-in">
            {errorText}
          </div>
        )}
        {successText && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3 text-xs text-emerald-800 font-bold text-center animate-fade-in">
            {successText}
          </div>
        )}

        {/* Sleek slate content area with off-white background */}
        <main className="flex-1 bg-[#F8FAFC] w-full px-4 py-8 sm:px-8 overflow-y-auto">

          {/* Render Views dynamic matching Router Path state */}
          {currentPath === "/" || currentPath.endsWith("dashboard") ? (
            currentUser.role === "SUPER_ADMIN" ? (
              <SuperAdminDashboard
                projects={projects}
                workOrders={workOrders}
                subcontractors={subcontractors}
                onApproveProject={async (id) => {
                  await fetch(`/api/projects/${id}/approve`, { method: "POST" });
                  syncDatabase();
                }}
                onRejectProject={async (id) => {
                  await fetch(`/api/projects/${id}/reject`, { method: "POST" });
                  syncDatabase();
                }}
                onViewProject={(id) => {
                  setSelectedWorkOrderId(id);
                  setCurrentPath(`/tracking/${id}`);
                }}
                onNavigate={setCurrentPath}
                onSelectWo={(woId) => {
                  setSelectedWorkOrderId(woId);
                  setCurrentPath(`/tracking/${woId}`);
                }}
              />
            ) : currentUser.role === "ADMIN" ? (
              <AdminDashboard
                projects={projects}
                subcontractors={subcontractors}
                users={usersList}
                onOnboardProject={syncDatabase}
                onOnboardProcess={syncDatabase}
                onAddSubcontractor={syncDatabase}
                onAddUser={syncDatabase}
                onNavigate={setCurrentPath}
              />
            ) : currentUser.role === "PROJECT_OWNER" ? (
              <ProjectOwnerDashboard
                projects={projects}
                processes={processes}
                users={allUsers.length > 0 ? allUsers : usersList}
                currentUser={currentUser}
                onAcknowledgeProject={async (id) => {
                  await fetch(`/api/processes?projectId=${id}`); // Trigger list preps
                  const projRes = await fetch(`/api/projects/${id}`);
                  const projObj = await projRes.json();
                  projObj.Status = "InProgress";
                  await fetch(`/api/processes`);
                  syncDatabase();
                }}
                onAssignProcessOwner={syncDatabase}
              />
            ) : currentUser.role === "PROCESS_OWNER" ? (
              <ProcessOwnerDashboard
                processes={processes}
                subcontractors={subcontractors}
                workOrders={workOrders}
                currentUser={currentUser}
                onStartProcess={async (id) => {
                  await fetch(`/api/processes/${id}/start`, { method: "POST" });
                  syncDatabase();
                }}
                onRaiseWorkOrder={async (woData) => {
                  await fetch("/api/work-orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(woData)
                  });
                  syncDatabase();
                }}
                onPullBackOrder={async (id, pbData) => {
                  await fetch(`/api/work-orders/${id}/pull-back`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(pbData)
                  });
                  setSuccessText("Secure PullBack triggered. Material closed out & reconstituted safely.");
                  setTimeout(() => setSuccessText(""), 3000);
                  syncDatabase();
                }}
                onAssignReturnPickup={async (woId, driverId) => {
                  await fetch(`/api/return/assign-driver`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ WorkOrderId: woId, DriverId: driverId })
                  });
                  setSuccessText("Assigned driver for return pickup.");
                  setTimeout(() => setSuccessText(""), 3000);
                  syncDatabase();
                }}
                onUpdateStatus={async (woId, status) => {
                  await fetch("/api/work-orders/" + woId + "/status", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status })
                  });
                  syncDatabase();
                }}
                onViewWo={(woId) => {
                  setSelectedWorkOrderId(woId);
                  setCurrentPath(`/tracking/${woId}`);
                }}
              />
            ) : currentUser.role === "INVENTORY_OWNER" ? (
              <InventoryOwnerDashboard
                workOrders={workOrders}
                inventory={inventory}
                users={allUsers.length > 0 ? allUsers : usersList}
                onPrepareDispatch={async (woId) => {
                  await fetch("/api/dispatch/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ WorkOrderId: woId, InventoryOwnerId: currentUser.id })
                  });
                  syncDatabase();
                }}
                onAssignDriver={async (dispId, driverId, vehicleNo) => {
                  await fetch(`/api/dispatch/${dispId}/assign-driver`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ DriverId: driverId, VehicleNumber: vehicleNo })
                  });
                  syncDatabase();
                }}
                onVerifyOTP={async (dispId, otp) => {
                  const res = await fetch(`/api/dispatch/${dispId}/verify-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ otp })
                  });
                  if (res.ok) {
                    setSuccessText("OTP Match Confirmed! Material dispatched & stock balances updated.");
                    setTimeout(() => setSuccessText(""), 4000);
                    syncDatabase();
                  } else {
                    setErrorText("Verification Key Failed. Access Blocked.");
                    setTimeout(() => setErrorText(""), 3000);
                  }
                }}
                onCompanyOTPConfirm={async (retId) => {
                  await fetch(`/api/return/${retId}/company-otp-confirm`, { method: "POST" });
                  setSuccessText("Confirmed company warehouse OTP check! Order Complete.");
                  setTimeout(() => setSuccessText(""), 3500);
                  syncDatabase();
                }}
                onAddStock={async (stockData) => {
                  await fetch("/api/inventory", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(stockData)
                  });
                  syncDatabase();
                }}
                onAcknowledgeReceived={async (retId) => {
                  await fetch(`/api/return/${retId}/received-at-company`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ InventoryOwnerId: currentUser.id })
                  });
                  setSuccessText("Materials marked as chemically/physically verified in store.");
                  setTimeout(() => setSuccessText(""), 3000);
                  syncDatabase();
                }}
              />
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-150 shadow-xs">
                <LogOut className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800">Unsupported simulator landing context</h3>
                <p className="text-xs text-slate-500 mt-1">Please select another active worker role at the top menu bar to proceed.</p>
              </div>
            )
          ) : currentPath.startsWith("/tracking/") ? (
            <TrackingPage
              workOrderId={selectedWorkOrderId || workOrders[0]?.WorkOrderId}
              workOrders={workOrders}
              projects={projects}
              processes={processes}
              subcontractors={subcontractors}
              users={usersList}
            />
          ) : currentPath === "/driver/my-deliveries" ? (
            <DriverDashboard
              currentUser={currentUser}
              onVerifyDeliveryOTP={async (dispId, otp) => {
                const res = await fetch(`/api/delivery/${dispId}/verify-otp`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ otp })
                });
                if (res.ok) {
                  setSuccessText("Subcontractor delivery OTP verification complete!");
                  setTimeout(() => setSuccessText(""), 3000);
                  syncDatabase();
                } else {
                  setErrorText("OTP code mismatch. Materials handover must have valid OTP verification.");
                  setTimeout(() => setErrorText(""), 3000);
                }
              }}
              onUpdateLocation={async (woId, lat, lng, remark) => {
                await fetch("/api/tracking/update", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ workOrderId: woId, driverId: currentUser.id, lat, lng, remark })
                });
                setSuccessText("Dispatched simulated GPS satellite telemetry coordinates.");
                setTimeout(() => setSuccessText(""), 3000);
                syncDatabase();
              }}
            />
          ) : (
            <div className="text-center py-12">
              <h3 className="font-bold text-slate-805">404 - Not found</h3>
              <p className="text-xs text-slate-500 mt-1">Check sandbox routes</p>
            </div>
          )}

        </main>

        {/* Floating Drawer System */}
        <NotificationsDrawer
          userId={currentUser.id}
        />

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-medium">
            <p>© {new Date().getFullYear()} Sakthithara Textile Inc. All system timestamps recorded in UTC, rendered in IST (Asia/Kolkata).</p>
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> SECURE INTEGRITY LAYER ACTIVE</span>
              <span>Version 1.0.4-POC</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// CHILD VIEWS: 1. SUPER ADMIN DASHBOARD
// -------------------------------------------------------------
interface SuperAdminProps {
  projects: Project[];
  workOrders: WorkOrder[];
  subcontractors: Subcontractor[];
  onApproveProject: (id: string) => Promise<void>;
  onRejectProject: (id: string) => Promise<void>;
  onViewProject: (id: string) => void;
  onNavigate: (path: string) => void;
  onSelectWo: (id: string) => void;
}

function SuperAdminDashboard({ projects, workOrders, subcontractors, onApproveProject, onRejectProject, onViewProject, onNavigate, onSelectWo }: SuperAdminProps) {
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

      {/* Banner introduction */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
        <div className="relative z-10 max-w-2xl">
          <span className="rounded-full bg-slate-800 border border-slate-705 px-3 py-1 text-xs text-indigo-300 font-bold tracking-wide">
            SuperAdmin Terminal Workspace
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
            Garment Processing Performance
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mt-2">
            Real-time logistical visibility into chemical dyeing, circular knitting, packing, and embroidery phases at subcontractor centers. Verify OTP signatures, approve pending works, or review pullback compliance metrics.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Dispatch Logistics Total", val: metrics.totalWorkOrders, color: "text-slate-900-val", desc: "Permanent orders logged" },
          { label: "En Route to Subcontractor", val: metrics.inTransitToSubcontractor, color: "text-indigo-600", desc: "Drivers verified on route" },
          { label: "Active Subcontractor Processing", val: metrics.inProcessAtSubcontractor, color: "text-amber-600", desc: "Orders on factory floor" },
          { label: "Awaiting Warehouse Dispatch", val: metrics.pendingDispatch, color: "text-slate-400", desc: "Raised but not on-road" },
          { label: "Return In Transit", val: metrics.returnInTransit, color: "text-teal-600", desc: "Deliveries returning to store" },
          { label: "Completed & Verified", val: metrics.completedThisMonth, color: "text-emerald-600", desc: "Receipt verified in stock" },
          { label: "Active Pullbacks / Recalls", val: metrics.pullbacks, color: "text-rose-500", desc: "Subcontractor timeline delays" },
          { label: "Overdue Delivery Batches", val: metrics.overdue, color: "text-rose-600 font-bold", desc: "Awaiting return window" }
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-slate-150 p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
            <div className="mt-4">
              <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${kpi.color}`}>
                {kpi.val}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left approvals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-slate-500" />
                Onboarding Project Approvals Queue ({pendingApproval.length})
              </h3>
            </div>

            {pendingApproval.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                All onboarded garment contracts currently approve-logged. Use Admin persona to spawn more.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingApproval.map((p) => (
                  <div key={p.ProjectId} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 tracking-tight">{p.ProjectName}</h4>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                          {p.ProjectCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Client: <span className="font-semibold">{p.CustomerName}</span></p>
                      <p className="text-xs text-slate-400 italic mt-1 leading-relaxed">Instructions: "{p.OrderInstruction}"</p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {p.Timeline.map((t, idx) => (
                          <span key={idx} className="bg-slate-50 border border-slate-100 text-[10px] text-slate-500 rounded-md px-2 py-0.5 font-semibold">
                            📅 {t.milestone}: {t.dueDate}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      <button
                        onClick={() => onApproveProject(p.ProjectId)}
                        className="rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-white font-bold px-3 py-1.5 transition-colors cursor-pointer"
                      >
                        Approve Contract
                      </button>
                      <button
                        onClick={() => onRejectProject(p.ProjectId)}
                        className="rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-xs text-slate-500 font-bold px-3 py-1.5 transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logistics Work Orders Database */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-slate-500" />
              Comprehensive Transport Ledger
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-450 uppercase tracking-wider text-[10px] font-bold">
                    <th className="pb-3 font-semibold">Order Details</th>
                    <th className="pb-3 font-semibold">Subcontractor</th>
                    <th className="pb-3 font-semibold">Materials Batch</th>
                    <th className="pb-3 font-semibold">Delivery Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workOrders.map((wo) => {
                    const sub = subcontractors.find((s) => s.SubcontractorId === wo.SubcontractorId);

                    return (
                      <tr key={wo.WorkOrderId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 pr-3">
                          <span className="font-bold text-slate-900 font-mono tracking-tight">{wo.WorkOrderCode}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Ordered: {new Date(wo.CreatedAt).toLocaleDateString()}</span>
                        </td>
                        <td className="py-3.5 text-slate-600">
                          <p className="font-semibold text-slate-800">{sub ? sub.CompanyName : "Alternative Subcontractor"}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{sub ? sub.Email : ""}</span>
                        </td>
                        <td className="py-3.5 font-mono text-slate-700">
                          <p className="font-bold">{wo.TotalQuantity} {wo.Unit}</p>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Return exp: {wo.ExpectedReturnDate}</span>
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${wo.Status === "7_Completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : wo.Status === "2_InTransit_ToSubcontractor"
                                  ? "bg-indigo-100 text-indigo-800 animate-pulse"
                                  : wo.Status === "4_InProcessAtSubcontractor"
                                    ? "bg-amber-100 text-amber-800"
                                    : wo.Status === "PulledBack"
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {wo.Status.replace(/^\d_/, "").replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => onSelectWo(wo.WorkOrderId)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg p-1.5 inline-flex items-center gap-1.5 transition-all text-[11px] font-bold cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" /> Orbit Tracker
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right sidebars/heatmaps */}
        <div className="space-y-6">
          {/* Heatmap and stack charts */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Monthly Dispatch Rate metrics
            </h4>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Knitting Processing Ratio</span>
                  <span>45%</span>
                </div>
                <div className="h-2 w-full bg-slate-105 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Royal Blue/Red Dyeing</span>
                  <span>30%</span>
                </div>
                <div className="h-2 w-full bg-slate-105 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: "30%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Collar Stitch & Finishing</span>
                  <span>15%</span>
                </div>
                <div className="h-2 w-full bg-slate-105 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "15%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Printing & Packaging</span>
                  <span>10%</span>
                </div>
                <div className="h-2 w-full bg-slate-105 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: "10%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Subcontractor Performance Scorecard */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Partner SLA Scorecards
            </h4>

            <div className="space-y-3.5">
              {subcontractors.map((sub) => (
                <div key={sub.SubcontractorId} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{sub.CompanyName}</h5>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Speciality: {sub.ProcessTypes.join(", ")}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 rounded px-1.5 py-0.5">
                      ★ {sub.Rating}
                    </span>
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

// -------------------------------------------------------------
// CHILD VIEWS: 2. ADMIN DASHBOARD
// -------------------------------------------------------------
interface AdminProps {
  projects: Project[];
  subcontractors: Subcontractor[];
  users: any[];
  onOnboardProject: () => void;
  onOnboardProcess: () => void;
  onAddSubcontractor: () => void;
  onAddUser: () => void;
  onNavigate: (path: string) => void;
}

function AdminDashboard({ projects, subcontractors, users, onOnboardProject, onOnboardProcess, onAddSubcontractor, onAddUser, onNavigate }: AdminProps) {
  // Create hooks state
  const [projName, setProjName] = useState("");
  const [custName, setCustName] = useState("");
  const [instruction, setInstruction] = useState("");
  const [ownerId, setOwnerId] = useState("user-3");
  const [milestones, setMilestones] = useState<string>("Knitting Completion:2026-06-30, Dyeing Batch:2026-07-10");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("High");

  const [procProjId, setProcProjId] = useState("");
  const [procName, setProcName] = useState("");
  const [procType, setProcType] = useState<any>("Knitting");
  const [procInstruction, setProcInstruction] = useState("");
  const [procOwner, setProcOwner] = useState("user-5");
  const [qcRequired, setQcRequired] = useState(true);
  const [deliveryDays, setDeliveryDays] = useState(9);

  const [subCompany, setSubCompany] = useState("");
  const [subContact, setSubContact] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [subPhone, setSubPhone] = useState("");
  const [subAddr, setSubAddr] = useState("");
  const [subProcesses, setSubProcesses] = useState("Knitting");
  const [pdfFiles, setPdfFiles] = useState<FileList | null>(null);

  // Combined Onboard Project & Process trigger
  const handleCombinedSubmit = async (e: any) => {
    e.preventDefault();
    if (!projName || !custName || !procName) return;

    // Parse milestone comma sets
    const parsedTimeline = milestones.split(",").map((m) => {
      const parts = m.split(":");
      return {
        milestone: parts[0]?.trim() || "Milestone Item",
        dueDate: parts[1]?.trim() || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      };
    });

    try {
      const projRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ProjectName: projName,
          CustomerName: custName,
          OrderInstruction: instruction,
          ProjectOwnerId: ownerId,
          Timeline: parsedTimeline,
          Priority: priority
        })
      });

      if (projRes.ok) {
        const newProj = await projRes.json();

        const procRes = await fetch("/api/processes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ProjectId: newProj.ProjectId,
            ProcessName: procName,
            ProcessType: procType,
            ProcessInstruction: procInstruction,
            ExpectedDeliveryDays: Number(deliveryDays),
            Priority: priority,
            ProcessOwnerId: procOwner,
            QCRequired: qcRequired
          })
        });

        if (procRes.ok) {
          setProjName("");
          setCustName("");
          setInstruction("");
          setProcName("");
          setProcInstruction("");
          setPdfFiles(null);
          onOnboardProject();
          onOnboardProcess();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add subcontractor
  const handleAddSubSubmit = async (e: any) => {
    e.preventDefault();
    if (!subCompany || !subEmail) return;

    // Subcontractor signup
    try {
      // create simulated user role
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: subContact || subCompany,
          Email: subEmail,
          Phone: subPhone || "+91 9000000000",
          RoleCode: "SUBCONTRACTOR",
          CompanyName: subCompany,
          Address: subAddr,
          ProcessTypes: subProcesses.split(",").map(p => p.trim())
        })
      });

      // Simple set state or list add on server
      onAddSubcontractor();
      setSubCompany("");
      setSubEmail("");
      setSubContact("");
      setSubPhone("");
      setSubAddr("");
      setSubProcesses("Knitting");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
        <span className="rounded-full bg-indigo-500/10 border border-indigo-400/20 px-2.5 py-1 text-[10px] font-bold tracking-wider text-indigo-400 uppercase font-mono z-10 relative">
          ADMIN OPERATIONS COMMAND
        </span>
        <h2 className="text-xl sm:text-2xl font-bold mt-3 tracking-tight">Onboard Projects and Production Chains</h2>
        <p className="text-xs text-slate-350 leading-relaxed max-w-xl mt-1">
          Deploy physical garment weaving, dyeing patterns, and stitches onto company work owners. Supervise partners.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">

        {/* Combined Onboard Project & Process Form */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Plus className="h-4.5 w-4.5 text-slate-650" />
            Unified Project & First Process Onboarding Form
          </h3>

          <form onSubmit={handleCombinedSubmit} className="space-y-6 text-xs">
            <div className="space-y-4">
              <h4 className="font-bold text-indigo-700 uppercase tracking-widest text-[10px]">Project Details</h4>
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Garment Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Knitwear Collection 2026"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Customer / Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Nike Wear India"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Assign Project Owner Lead</label>
                  <select
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-201 rounded-lg px-3 py-2 text-slate-805 font-bold"
                  >
                    <option value="user-3">Project Owner (po1@company.com)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Customer Special Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Double ventilation stitches on rib hem. Non bleaching reactive dyes only."
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Order Instructions</label>
                <input
                  type="file"
                  multiple
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 2) {
                      alert("You can only upload up to 2 PDFs.");
                      e.target.value = "";
                      setPdfFiles(null);
                    } else {
                      setPdfFiles(e.target.files);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Please attach the instructions and QC documents.</span>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Milestone Calendars</label>
                <input
                  type="text"
                  placeholder="Knitting Completion:2026-06-30, Dyeing Batch:2026-07-20"
                  value={milestones}
                  onChange={(e) => setMilestones(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-emerald-700 uppercase tracking-widest text-[10px]">Initial Process Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">First sub-process Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Blue Weaving"
                    value={procName}
                    onChange={(e) => setProcName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 focus:outline-none text-slate-800 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Process Category Type</label>
                  <select
                    value={procType}
                    onChange={(e) => setProcType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-201 rounded-lg px-3 py-2 text-slate-805"
                  >
                    <option value="Knitting">Knitting</option>
                    <option value="Dyeing">Dyeing</option>
                    <option value="Cutting">Cutting</option>
                    <option value="Printing">Printing</option>
                    <option value="Embroidery">Embroidery</option>
                    <option value="Stitching">Stitching</option>
                    <option value="Packing">Packing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Target Production Days</label>
                  <input
                    type="number"
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-slate-800 font-mono"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Assign Process Lead Owner</label>
                  <select
                    value={procOwner}
                    onChange={(e) => setProcOwner(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-201 rounded-lg px-3 py-2 text-slate-805 font-bold"
                  >
                    <option value="user-5">Process Owner (pro1@company.com)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold text-slate-800 font-bold flex items-center gap-1.5 self-center">
                  <input
                    type="checkbox"
                    checked={qcRequired}
                    onChange={(e) => setQcRequired(e.target.checked)}
                    className="rounded border-slate-200 h-4.5 w-4.5"
                  />
                  Strict Quality Check and Lab-testing (QC) Required
                </label>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Process Processing instructions</label>
                <input
                  type="text"
                  placeholder="Weave structured knitting pique structure 220 GSM thick knit only."
                  value={procInstruction}
                  onChange={(e) => setProcInstruction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 font-bold text-center rounded-xl transition duration-150 cursor-pointer text-sm"
            >
              Submit Project & Deploy Initial Process
            </button>
          </form>
        </div>

      </div>

      {/* Global Contract statuses */}
      <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-4">
          Integrated Contract & Timelines Registry ({projects.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-450 uppercase font-bold text-[10px]">
                <th className="pb-3">Code ID</th>
                <th className="pb-3">Project Title</th>
                <th className="pb-3">Active Customer</th>
                <th className="pb-3">Logistical Status</th>
                <th className="pb-3">Due Dateline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => (
                <tr key={p.ProjectId}>
                  <td className="py-3 font-mono font-bold text-slate-900">{p.ProjectCode}</td>
                  <td className="py-3 font-semibold text-slate-800">{p.ProjectName}</td>
                  <td className="py-3 text-slate-600">{p.CustomerName}</td>
                  <td className="py-3">
                    <span className={`rounded-xl px-2 py-0.5 text-[9px] font-bold ${p.Status === "Approved" ? "bg-slate-900 text-white" : p.Status === "InProgress" ? "bg-indigo-100 text-indigo-805" : "bg-slate-100 text-slate-600"
                      }`}>
                      {p.Status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 font-mono">{p.Timeline[0]?.dueDate || "Flexible"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// -------------------------------------------------------------
// CHILD VIEWS: 3. PROJECT OWNER DASHBOARD
// -------------------------------------------------------------
interface ProjectOwnerProps {
  projects: Project[];
  processes: Process[];
  users: User[];
  currentUser: User;
  onAcknowledgeProject: (id: string) => Promise<void>;
  onAssignProcessOwner: () => void;
}

function ProjectOwnerDashboard({ projects, processes, users, currentUser, onAcknowledgeProject, onAssignProcessOwner }: ProjectOwnerProps) {
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
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
        <span className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs text-indigo-400 font-mono uppercase font-bold">
          Project Manager Portal
        </span>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-3">Manager: {currentUser.name} 👔</h2>
        <p className="text-xs text-slate-350 leading-relaxed mt-1">
          Acknowledge new contract entries dispatched by Executive MD Board. Setup sub-processes, review priority status.
        </p>
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
                    <p className="text-xs text-slate-500 mt-1">Client Contract: <span className="font-bold">{p.CustomerName}</span></p>
                  </div>

                  <div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myProcs.map((proc) => (
                        <div key={proc.ProcessId} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="text-xs font-extrabold text-slate-800">{proc.ProcessName}</h5>
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold font-mono bg-indigo-50 border border-indigo-100 text-indigo-600 block w-max mt-1">
                                {proc.ProcessType}
                              </span>
                            </div>
                            <span className={`text-[9px] font-bold uppercase rounded px-2 py-0.5 ${proc.Status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"
                              }`}>
                              {proc.Status}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500">Target duration: <span className="font-bold">{proc.ExpectedDeliveryDays} days</span></p>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                            <span className="text-[10px] text-slate-400">Owner Assigned: {proc.ProcessOwnerId === "user-5" ? "Arun Knitting" : proc.ProcessOwnerId === "user-6" ? "Karthik Dyeing" : "Unassigned"}</span>
                            <button
                              type="button"
                              onClick={() => setAssigningProcId(proc.ProcessId)}
                              className="text-[10px] text-indigo-650 hover:underline font-bold"
                            >
                              {proc.ProcessOwnerId ? "Reassign Owner" : "Assign Owner"}
                            </button>
                          </div>
                        </div>
                      ))}
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
                  {users.filter(u => u.role === "PROCESS_OWNER").map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningProcId(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Save Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// -------------------------------------------------------------
// CHILD VIEWS: 4. PROCESS OWNER DASHBOARD
// -------------------------------------------------------------
interface ProcessOwnerProps {
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
}

function ProcessOwnerDashboard({ processes, subcontractors, workOrders, currentUser, onStartProcess, onRaiseWorkOrder, onPullBackOrder, onAssignReturnPickup, onViewWo, onUpdateStatus }: ProcessOwnerProps) {
  const [activeProcessId, setActiveProcessId] = useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = useState("");
  const [matName, setMatName] = useState("Grey Yarn 40s combed");
  const [matCode, setMatCode] = useState("inv-1"); // grey yarn comb
  const [matQuantity, setMatQuantity] = useState(500);
  const [matUnit, setMatUnit] = useState("kg");
  const [expectedDays, setExpectedDays] = useState(10);

  const [pullingWoId, setPullingWoId] = useState<string | null>(null);
  const [pullReason, setPullReason] = useState<"Delay" | "QualityIssue" | "NonResponse" | "CapacityProblem">("Delay");
  const [alternativeSubId, setAlternativeSubId] = useState("");

  const [assigningDriverWoId, setAssigningDriverWoId] = useState<string | null>(null);
  const [pickupDriverId, setPickupDriverId] = useState("user-9");

  const myProcesses = processes.filter((p) => p.ProcessOwnerId === currentUser.id);

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
      InitiatedBy: currentUser.id,
      OldSubcontractorId: "sub-2", // placeholder kalai
      NewSubcontractorId: alternativeSubId || "sub-1"
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
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
        <span className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs text-indigo-400 font-mono uppercase font-bold">
          Logistical Lead Panel
        </span>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-3">Active Lead: {currentUser.name} 🛠️</h2>
        <p className="text-xs text-slate-350 leading-relaxed mt-1">
          Raise subcontractor transport challenges, assign porter pickups, trigger emergency pullback recalls safely.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left: processes and orders */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-850 tracking-tight">Assigned Subproduction Lines</h3>

          {myProcesses.length === 0 ? (
            <div className="text-slate-550 text-xs py-8 text-center italic">
              No processing steps currently assigned to this mock lead. Swap process person.
            </div>
          ) : (
            <div className="space-y-4.5">
              {myProcesses.map((p) => {
                const wos = workOrders.filter((w) => w.ProcessId === p.ProcessId);
                const hasOrder = wos.length > 0;

                return (
                  <div key={p.ProcessId} className="border border-slate-105 rounded-2xl p-4 bg-slate-50/30 text-xs space-y-3.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{p.ProcessName}</h4>
                        <span className="text-[10px] font-mono text-indigo-655 font-bold mt-1 block">
                          Phase type: {p.ProcessType}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="rounded bg-slate-900 text-white text-[9px] px-2 py-0.5 font-bold uppercase">
                          {p.Status}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-slate-100 flex justify-between items-center">
                      <p className="text-slate-500 text-[11px] leading-tight max-w-[170px]">
                        Instructions: <span className="text-slate-850 font-medium">"{p.ProcessInstruction}"</span>
                      </p>
                      <span className="text-slate-400 font-mono text-[10px]">QC Check: {p.QCRequired ? "★ Strictly Required" : "No"}</span>
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
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${wo.Status === "7_Completed" ? "bg-emerald-100 text-emerald-805" : "bg-indigo-50 text-indigo-700"
                          }`}>
                          {wo.Status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500">
                        <span>Sub: {sub ? sub.CompanyName.split(" ")[0] : "Center"}</span>
                        <span>Quantity: {wo.TotalQuantity} {wo.Unit}</span>
                      </div>

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

                          {wo.Status !== "7_Completed" && wo.Status !== "PulledBack" && (
                            <button
                              onClick={() => {
                                setPullingWoId(wo.WorkOrderId);
                                setAlternativeSubId(wo.SubcontractorId);
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

              <div>
                <label className="block text-slate-500 mb-1">Reroute Reconstituted Order to:</label>
                <select
                  value={alternativeSubId}
                  onChange={(e) => setAlternativeSubId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-201 rounded-lg px-3 py-2 text-slate-805 font-bold"
                >
                  <option value="sub-1">Knitting Company Pvt (Rating 4.8)</option>
                  <option value="sub-3">Sri Stitching Hub (Rating 4.2)</option>
                  <option value="sub-4">Print Masters Ltd (Rating 4.7)</option>
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

// -------------------------------------------------------------
// CHILD VIEWS: 5. INVENTORY OWNER DASHBOARD
// -------------------------------------------------------------
interface InventoryProps {
  workOrders: WorkOrder[];
  inventory: InventoryItem[];
  users: any[];
  onPrepareDispatch: (woId: string) => Promise<void>;
  onAssignDriver: (dispId: string, driverId: string, vehicleNo?: string) => Promise<void>;
  onVerifyOTP: (dispId: string, otp: string) => Promise<void>;
  onCompanyOTPConfirm: (retId: string) => Promise<void>;
  onAddStock: (data: any) => Promise<void>;
  onAcknowledgeReceived: (retId: string) => Promise<void>;
}

function InventoryOwnerDashboard({ workOrders, inventory, users, onPrepareDispatch, onAssignDriver, onVerifyOTP, onCompanyOTPConfirm, onAddStock, onAcknowledgeReceived }: InventoryProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "warehouse" | "returns">("pending");

  // Forms state
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState<any>("Yarn");
  const [itemQty, setItemQty] = useState(1000);
  const [itemUnit, setItemUnit] = useState("kg");
  const [itemLocation, setItemLocation] = useState("Aisle A, Shelf 2");

  const [simulatedOTPInput, setSimulatedOTPInput] = useState<Record<string, string>>({});
  const [selectedDriver, setSelectedDriver] = useState<Record<string, string>>({});
  const [vehicleNumber, setVehicleNumber] = useState<Record<string, string>>({});

  const [selectedModalOrder, setSelectedModalOrder] = useState<WorkOrder | null>(null);

  const [dispatches, setDispatches] = useState<any[]>([]);
  const [returnRecs, setReturnRecs] = useState<any[]>([]);

  const fetchDispatches = async () => {
    try {
      const res = await fetch("/api/dispatches"); // Fetch all dispatches for Store Owner dashboard
      if (res.ok) setDispatches(await res.json());

      const retRes = await fetch("/api/return/history");
      if (retRes.ok) setReturnRecs(await retRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, [workOrders]);

  const handleCreateStock = async (e: any) => {
    e.preventDefault();
    if (!itemName) return;

    await onAddStock({
      ItemName: itemName,
      Category: itemCategory,
      AvailableQuantity: itemQty,
      Unit: itemUnit,
      WarehouseLocation: itemLocation
    });

    setItemName("");
    setItemLocation("Aisle A, Shelf 1");
  };

  const pendingDispatches = workOrders.filter((w) => w.Status === "1_ToBeDispatched");

  return (
    <div className="space-y-8 animate-fade-in text-xs">
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
        <span className="rounded-full bg-slate-800 border border-slate-705 px-3 py-1 text-xs text-indigo-400 font-mono font-bold uppercase">
          Main Warehouse Controller
        </span>
        <h2 className="text-xl sm:text-2xl font-bold mt-3 tracking-tight">Manager: Sivakumar Store Manager 📦</h2>
        <p className="text-xs text-slate-350 leading-relaxed mt-1">
          Verify stock parameters, prepare packages, trigger verification OTP codes for porter drivers, and verify returning processed fabrics.
        </p>
      </div>

      <div className="flex border-b border-slate-150">
        {[
          { code: "pending", label: "Dispatch Requests Board" },
          { code: "warehouse", label: "Inventory Stock level Ledger" },
          { code: "returns", label: "Receive Processed Returns Loop" }
        ].map((tab) => (
          <button
            key={tab.code}
            onClick={() => setActiveTab(tab.code as any)}
            className={`py-3 px-5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${activeTab === tab.code
                ? "border-slate-900 text-slate-900 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-850"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "pending" && (
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Prepared Orders Dispatch Queue ({pendingDispatches.length})</h3>

          {pendingDispatches.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No outstanding dispatch preparation requests logged. Complete "Raise Work Order" from Process Owner.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingDispatches.map((wo) => {
                const activeDisp = dispatches.find((d) => d.workOrder?.WorkOrderId === wo.WorkOrderId)?.dispatch;
                const statusBadge = activeDisp
                  ? <span className="rounded bg-indigo-50 text-indigo-800 text-[9px] px-1.5 py-0.5 font-bold border border-indigo-100">Ready to Dispatch</span>
                  : <span className="rounded bg-rose-50 text-rose-800 text-[9px] px-1.5 py-0.5 font-bold border border-rose-100">Awaiting Prep</span>;

                return (
                  <div
                    key={wo.WorkOrderId}
                    onClick={() => setSelectedModalOrder(wo)}
                    className="border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer hover:border-slate-300 transition-all bg-slate-50/50 flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-slate-900 font-mono text-[13px]">{wo.WorkOrderCode}</span>
                      {statusBadge}
                    </div>
                    <p className="text-slate-500 text-[11px] leading-tight flex-1">
                      Target Quantity: <span className="font-bold text-slate-800">{wo.TotalQuantity} {wo.Unit}</span>
                    </p>
                    <button className="text-[10px] font-bold text-indigo-600 bg-white border border-indigo-100 py-1.5 rounded-lg w-full">
                      Open Dispatch Control
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "warehouse" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Inventory lists */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-150 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Raw Combed Weaves & Fabrics</h3>

            <div className="divide-y divide-slate-100">
              {inventory.map((item) => (
                <div key={item.ItemId} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">{item.ItemName}</h4>
                    <span className="text-[10px] text-slate-400 block font-mono">Location ID: {item.WarehouseLocation} | Code: {item.ItemCode}</span>
                  </div>

                  <div className="text-right">
                    <span className={`text-base font-black font-mono ${item.AvailableQuantity < 1000 ? "text-rose-500 font-bold" : "text-slate-805"}`}>
                      {item.AvailableQuantity} {item.Unit}
                    </span>
                    {item.AvailableQuantity < 1000 && (
                      <span className="block text-[10px] text-rose-600 font-bold">⚠️ LOW STOCK BALANCE ALERT!</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Stock */}
          <details className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs space-y-4 h-max group">
            <summary className="text-sm font-bold text-slate-805 cursor-pointer list-none flex items-center justify-between">
              Optional: Adjust Store Balances (Manual Log Add)
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>

            <form onSubmit={handleCreateStock} className="space-y-4 mt-4">
              <div>
                <label className="block text-slate-500 mb-1">Item Title</label>
                <input
                  type="text"
                  placeholder="Grey Yarn 60s combed carded"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg px-2.5 py-1.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e: any) => setItemCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-201 rounded-lg px-2.5 py-1.5"
                  >
                    <option value="Yarn">Yarn</option>
                    <option value="Fabric">Fabric</option>
                    <option value="DyedMaterial">Dyed Fabric</option>
                    <option value="CutPanels">Cut Panels</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Stock Vol</label>
                  <input
                    type="number"
                    value={itemQty}
                    onChange={(e) => setItemQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Measure Unit</label>
                  <input
                    type="text"
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Location Slot</label>
                  <input
                    type="text"
                    value={itemLocation}
                    onChange={(e) => setItemLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg px-2.5 py-1.5"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl transition duration-150 cursor-pointer text-center"
              >
                Add Inventory item Log and Deduct Add transaction
              </button>
            </form>
          </details>

        </div>
      )}

      {activeTab === "returns" && (
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-805">Awaiting Store Receipt Verification ({returnRecs.length})</h3>

          {returnRecs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No return logistics currently returned to stores checkpoint. Completed subcontractor portal orders.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {returnRecs.map((ret) => {
                const wo = workOrders.find((w) => w.WorkOrderId === ret.WorkOrderId);

                return (
                  <div key={ret.ReturnId} className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <span className="font-bold text-slate-900 font-mono text-[13px]">{wo ? wo.WorkOrderCode : "WO-POLO"}</span>
                      <p className="text-slate-500 mt-1">Returning Quantity: <span className="font-bold text-slate-800">{ret.ReturnQuantity} pcs/kg</span></p>
                    </div>

                    <div>
                      {!ret.ReturnedAt ? (
                        <button
                          onClick={() => onAcknowledgeReceived(ret.ReturnId)}
                          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold text-white px-3.5 py-2 cursor-pointer"
                        >
                          Step 1: Confirm Store Handover arrival
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded px-2.5 py-1 font-bold">
                          Arrived & store-checked
                        </span>
                      )}
                    </div>

                    <div>
                      {ret.ReturnedAt && !wo?.ActualReturnDate && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">Step 2: Sign-off Handover release:</p>
                          <button
                            onClick={() => onCompanyOTPConfirm(ret.ReturnId)}
                            className="bg-slate-950 text-white font-bold py-2 px-4 rounded-xl hover:bg-slate-850 cursor-pointer w-full text-center"
                          >
                            Close Work Order (Issue completion logs)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Overlay */}
      {selectedModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedModalOrder(null)} />

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-indigo-500" />
                Dispatch Control Room — <span className="font-mono">{selectedModalOrder.WorkOrderCode}</span>
              </h3>
              <button onClick={() => setSelectedModalOrder(null)} className="p-1 text-slate-400 hover:text-slate-800 bg-white rounded-lg border border-slate-200 shadow-xs cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
              {/* Left Panel: Driver Email / OTP Simulation */}
              <div className="md:w-1/3 bg-slate-50 rounded-2xl border border-slate-150 p-4 flex flex-col gap-4">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Simulated Driver Email
                </h4>

                {(() => {
                  const activeDisp = dispatches.find((d) => d.workOrder?.WorkOrderId === selectedModalOrder.WorkOrderId)?.dispatch;
                  if (!activeDisp || !activeDisp.DispatchOTP) {
                    return (
                      <div className="flex-1 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-center p-4">
                        <span className="text-[10px] text-slate-400 font-medium">
                          Assign a driver first to automatically dispatch the OTP email.
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-[10px]">
                      <div className="bg-slate-800 text-white p-2.5 font-mono text-[9px] uppercase tracking-widest font-semibold flex items-center justify-between">
                        <span>Incoming Inbox</span>
                        <span className="bg-emerald-500 h-1.5 w-1.5 rounded-full animate-pulse" />
                      </div>
                      <div className="p-3 space-y-2 border-b border-slate-50">
                        <p className="text-slate-400">From: <span className="text-slate-700 font-semibold">dispatch@sakthithara.com</span></p>
                        <p className="font-bold text-slate-800 flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                          Your Pickup Pass & Verification PIN
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 font-mono text-[9px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                        Dear Driver,{"\n\n"}Please arrive at Sakthithara Main Store to collect the packages for {selectedModalOrder.WorkOrderCode}.{"\n\n"}Present this PIN to the Store Manager upon loading to verify your identity:{"\n\n"}<span className="inline-block mt-1 text-base font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">{activeDisp.DispatchOTP}</span>{"\n\n"}Safe travels,{"\n"}Sakthithara Logistics
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Right Panel: Actions */}
              <div className="md:w-2/3 space-y-6 text-xs">
                {(() => {
                  const activeDisp = dispatches.find((d) => d.workOrder?.WorkOrderId === selectedModalOrder.WorkOrderId)?.dispatch;
                  const driverSelected = selectedDriver[selectedModalOrder.WorkOrderId] || "user-9";

                  return (
                    <>
                      {/* Step 1 */}
                      <div className={`p-4 rounded-xl border ${!activeDisp ? "border-indigo-200 bg-indigo-50/50 shadow-sm" : "border-slate-150 bg-white opacity-60"}`}>
                        <h4 className="font-bold text-slate-800 text-xs mb-2">Step 1: Verify Requirements & Prepare Packages</h4>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {selectedModalOrder.MaterialDetails.map((mat: any) => {
                            const stockItem = inventory.find(i => i.ItemId === mat.ItemId);
                            const isLow = (stockItem?.AvailableQuantity || 0) < mat.Quantity;
                            return (
                              <div key={mat.ItemId} className="bg-slate-50 border border-slate-100 p-2 rounded text-[10px] font-mono">
                                <span className="block text-slate-500 mb-0.5">{mat.ItemName}</span>
                                <span className="font-bold text-slate-800">{mat.Quantity} {mat.Unit} req.</span>
                                {isLow ? <span className="block text-rose-600 font-bold mt-0.5">⚠ Low Stock</span> : <span className="block text-emerald-600 font-bold mt-0.5">✔ In Stock</span>}
                              </div>
                            );
                          })}
                        </div>
                        {!activeDisp && (
                          <button
                            onClick={async () => {
                              await onPrepareDispatch(selectedModalOrder.WorkOrderId);
                              fetchDispatches(); // Trigger local refresh to show updated state
                            }}
                            className="rounded-lg bg-slate-900 hover:bg-slate-800 font-bold text-white py-1.5 px-4 text-[11px] cursor-pointer"
                          >
                            Confirm Packages Are Prepared
                          </button>
                        )}
                      </div>

                      {/* Step 2 */}
                      {activeDisp && !activeDisp.DispatchOTP && (
                        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 shadow-sm space-y-3">
                          <h4 className="font-bold text-slate-800 text-xs">Step 2: Assign Driver & Vehicle</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Driver Profile</label>
                              <select
                                value={driverSelected}
                                onChange={(e) => {
                                  const DRIVER_VEHICLES: Record<string, string> = {
                                    "user-9": "TN 38 AB 1111"
                                  };
                                  setSelectedDriver({ ...selectedDriver, [selectedModalOrder.WorkOrderId]: e.target.value });
                                  setVehicleNumber({ ...vehicleNumber, [selectedModalOrder.WorkOrderId]: DRIVER_VEHICLES[e.target.value] || "" });
                                }}
                                className="w-full bg-white border border-slate-205 rounded px-2.5 py-1.5 text-[11px] font-bold focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                              >
                                <option value="user-9">Venkatesh Porter (TN 38 AB 1111)</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Vehicle License Plate</label>
                              <input
                                type="text"
                                readOnly
                                value={vehicleNumber[selectedModalOrder.WorkOrderId] || "TN 38 AB 1111"}
                                className="w-full bg-slate-100 border border-slate-205 rounded px-2.5 py-1.5 text-[11px] font-mono text-slate-500 cursor-not-allowed focus:outline-none"
                              />
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              const vNum = vehicleNumber[selectedModalOrder.WorkOrderId] || "TN 38 AB 1111";
                              await onAssignDriver(activeDisp.DispatchId, driverSelected, vNum);
                              fetchDispatches();
                            }}
                            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold text-white py-1.5 px-4 text-[11px] cursor-pointer"
                          >
                            Assign Driver & Dispatch OTP
                          </button>
                        </div>
                      )}

                      {/* Step 3 */}
                      {activeDisp && activeDisp.DispatchOTP && (
                        <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-sm space-y-3">
                          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            <CheckCheck className="h-4 w-4 text-emerald-500" />
                            Step 3: Verification & Loading
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            Driver has been assigned and their pickup pass was emailed (simulated in the left panel). When they arrive, ask for their 6-digit PIN to verify identity before loading cargo.
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="text"
                              placeholder="Enter 6-Digit Driver PIN"
                              value={simulatedOTPInput[selectedModalOrder.WorkOrderId] || ""}
                              onChange={(e) => setSimulatedOTPInput({ ...simulatedOTPInput, [selectedModalOrder.WorkOrderId]: e.target.value })}
                              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-center text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                              onClick={async () => {
                                await onVerifyOTP(activeDisp.DispatchId, simulatedOTPInput[selectedModalOrder.WorkOrderId] || "");
                                setSelectedModalOrder(null);
                                fetchDispatches();
                              }}
                              className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 text-xs transition-transform hover:scale-105 cursor-pointer shadow-md shadow-slate-900/20"
                            >
                              Verify & Dispatch
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// -------------------------------------------------------------
// CHILD VIEWS: 6. PORTER DRIVER MOBILE PORTAL
// -------------------------------------------------------------
interface DriverProps {
  currentUser: User;
  onVerifyDeliveryOTP: (dispId: string, otp: string) => Promise<void>;
  onUpdateLocation: (woId: string, lat: number, lng: number, remark: string) => Promise<void>;
}

function DriverDashboard({ currentUser, onVerifyDeliveryOTP, onUpdateLocation }: DriverProps) {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [otpVal, setOTPVal] = useState<Record<string, string>>({});

  const listMyRuns = async () => {
    try {
      const res = await fetch("/api/driver/my-deliveries?driverId=" + currentUser.id);
      if (res.ok) setDeliveries(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    listMyRuns();
  }, []);



  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in text-xs">

      <div className="bg-slate-900 rounded-3xl p-6 text-white text-center shadow-xl">
        <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[9px] font-bold tracking-wider text-indigo-400 font-mono">
          DRIVER MOBILE DESK
        </span>
        <h2 className="text-lg font-bold tracking-tight mt-2">Carrier Lead: {currentUser.name} 🚛</h2>
        <p className="text-[11px] text-slate-400 mt-1">Mobile web vehicle cargo verification. Inputs secure subcontractor OTP check keys.</p>
      </div>

      <div className="space-y-4">
        {deliveries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-150 p-12 text-center text-slate-500">
            No driving deliveries currently assigned. Store Managers assign drivers after material prep.
          </div>
        ) : (
          deliveries.map((run) => {
            const d = run.dispatch;
            const wo = run.workOrder;
            if (!wo) return null;

            return (
              <div key={d.DispatchId} className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4">

                <div className="flex justify-between items-start border-b border-slate-50 pb-3">
                  <div>
                    <span className="font-extrabold text-slate-900 font-mono text-sm uppercase">{wo.WorkOrderCode}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Route: Tiruppur Store → Erode SIPCOT</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase rounded px-2.5 py-0.5 ${wo.Status === "7_Completed" || d.OTPVerifiedAt ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-650"
                    }`}>
                    {wo.Status}
                  </span>
                </div>

                {/* Simulated Materials loading checks */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 text-[10px] uppercase">Cargo items loaded verified:</h4>
                  {wo.MaterialDetails.map((mat: any, idx: number) => (
                    <p key={idx} className="font-mono text-[11px] text-slate-600">
                      ✔ {mat.ItemName} — {mat.Quantity} {mat.Unit}
                    </p>
                  ))}
                </div>

                {wo.Status === "1_ToBeDispatched" && (
                  <div className="bg-indigo-50 text-indigo-700 p-3 rounded-xl border border-indigo-100 mt-4">
                    <p className="font-bold text-xs mb-1">Status: Pending Loading</p>
                    <p>Provide your 6-digit Dispatch OTP (sent to your email/SMS) to the Store Manager to verify your identity and receive the cargo.</p>
                  </div>
                )}

                {/* Enter Subcontractor Receipt OTP check */}
                {wo.Status === "2_InTransit_ToSubcontractor" && (
                  <div className="border-t border-slate-50 pt-4 space-y-3">
                    <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                      <h4 className="font-bold text-indigo-900 flex items-center gap-1">
                        <ShieldCheck className="h-4.5 w-4.5 text-indigo-700" />
                        Subcontractor Handover Authentication Check:
                      </h4>
                      <p className="text-[10px] text-indigo-750 mt-1 mb-3">
                        Upon arrival at subcontractor, request the Delivery OTP they received via email to complete the secure handover.
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="6-Digit OTP key code"
                          value={otpVal[d.DispatchId] || ""}
                          onChange={(e) => setOTPVal({ ...otpVal, [d.DispatchId]: e.target.value })}
                          className="bg-white border rounded px-3 py-2 text-center text-sm font-bold w-full focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <button
                          onClick={() => onVerifyDeliveryOTP(d.DispatchId, otpVal[d.DispatchId] || "")}
                          className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 hover:translate-x-0.5 transition-all cursor-pointer"
                        >
                          Verify Handover
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

// -------------------------------------------------------------
// CHILD VIEWS: 8. LIVE SATELLITE ORBIT TRACKING PAGE
// -------------------------------------------------------------
interface TrackingPageProps {
  workOrderId: string | null;
  workOrders: WorkOrder[];
  projects: Project[];
  processes: Process[];
  subcontractors: Subcontractor[];
  users: any[];
}

function TrackingPage({ workOrderId, workOrders, projects, processes, subcontractors, users }: TrackingPageProps) {
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

    </div>
  );
}

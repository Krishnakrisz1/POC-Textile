import { useState, useEffect } from "react";
import {
  Layers, Users, TrendingUp, CheckCircle, Clock, AlertCircle, AlertTriangle, Truck, Eye, FileText, Check, CheckSquare, Sparkles, LogOut, Code, ClipboardList, Info, HelpCircle, X, CheckCheck, Search,
  ArrowRight, ShieldCheck, Mail, Database, RefreshCw, Plus, Trash2, Calendar, RotateCcw, PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import { User, Project, Process, Subcontractor, WorkOrder, InventoryItem, Notification } from "./types";
import NotificationsDrawer from "./components/NotificationsDrawer";
import TrackingTimeline from "./components/TrackingTimeline";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ProjectOwnerDashboard from "./components/ProjectOwnerDashboard";
import ProcessOwnerDashboard from "./components/ProcessOwnerDashboard";
import InventoryOwnerDashboard from "./components/InventoryOwnerDashboard";
import DriverDashboard from "./components/DriverDashboard";
import TrackingPage from "./components/TrackingPage";
import ProjectDetailsModal from "./components/ProjectDetailsModal";

const formatDate = (dateString: string | undefined) => {
  if (!dateString || dateString === 'N/A') return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const formatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return formatter.format(date);
};

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
  const [viewingProjectDetailsId, setViewingProjectDetailsId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "true");

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

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
      <aside className={`hidden lg:flex transition-all duration-300 ease-in-out bg-[#0F172A] text-slate-300 flex-col shrink-0 border-r border-[#1E293B] ${sidebarCollapsed ? "w-20" : "w-64"}`}>
        {/* Top Branding Section with custom spacing */}
        <div className={`${sidebarCollapsed ? "px-0 justify-center" : "px-6"} py-6 border-b border-slate-800 shrink-0 flex items-center justify-between`}>
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center mx-auto" : "gap-3"}`}>
            <div className="rounded-lg bg-blue-600 p-2 text-white shadow-md shadow-blue-500/20 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="transition-opacity duration-300">
              <h1 className="font-bold text-base text-white tracking-tight leading-tight">
                Sakthithara
              </h1>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Textile Systems
              </span>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button onClick={() => setSidebarCollapsed(true)} className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors" title="Collapse Sidebar">
              <PanelLeftClose className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
        {sidebarCollapsed && (
          <div className="flex justify-center pt-3">
            <button onClick={() => setSidebarCollapsed(false)} className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors" title="Expand Sidebar">
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          </div>
        )}

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
            title="My Dashboard"
            className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-0" : "gap-3 px-4"} py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${currentPath === "/" || currentPath.endsWith("dashboard") || currentPath === "/driver/my-deliveries"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
          >
            <ClipboardList className="h-4.5 w-4.5 shrink-0" />
            {!sidebarCollapsed && <span className="transition-opacity duration-300">My Dashboard</span>}
          </button>

          {workOrders.length > 0 && (
            <button
              onClick={() => {
                setSelectedWorkOrderId(workOrders[0].WorkOrderId);
                setCurrentPath(`/tracking/${workOrders[0].WorkOrderId}`);
              }}
              title="Live Tracker"
              className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-0" : "gap-3 px-4"} py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${currentPath.startsWith("/tracking/")
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
            >
              <Truck className="h-4.5 w-4.5 shrink-0" />
              {!sidebarCollapsed && <span className="transition-opacity duration-300">Live Tracker</span>}
            </button>
          )}


        </nav>

        {/* Profile Footer display in Sidebar - elegant avatar indicator */}
        <div className={`${sidebarCollapsed ? "p-4 flex justify-center" : "p-6"} border-t border-slate-800 shrink-0 bg-[#0B1222] text-xs transition-all duration-300`}>
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
            <div title={currentUser.name} className="h-9 w-9 shrink-0 rounded-full bg-slate-800 border border-slate-705 flex items-center justify-center font-bold text-blue-400 font-mono">
              {currentUser.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1 transition-opacity duration-300">
              <h4 className="font-bold text-white truncate leading-none mb-1">{currentUser.name}</h4>
              <p className="text-[10px] text-slate-400 truncate leading-none font-medium">{currentUser.roleName}</p>
              </div>
            )}
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
            <NotificationsDrawer userId={currentUser.id} />
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
                onViewDetails={setViewingProjectDetailsId}
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
                workOrders={workOrders}
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
                onViewDetails={setViewingProjectDetailsId}
              />
            ) : currentUser.role === "PROCESS_OWNER" ? (
              <ProcessOwnerDashboard
                projects={projects}
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
                onCompleteOperation={async (woId, opName) => {
                  await fetch(`/api/work-orders/${woId}/operations/${encodeURIComponent(opName)}/complete`, { method: "POST" });
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
// -------------------------------------------------------------
// CHILD VIEWS: 2. ADMIN DASHBOARD
// -------------------------------------------------------------
// -------------------------------------------------------------
// CHILD VIEWS: 3. PROJECT OWNER DASHBOARD
// -------------------------------------------------------------
// -------------------------------------------------------------
// CHILD VIEWS: 4. PROCESS OWNER DASHBOARD
// -------------------------------------------------------------
// -------------------------------------------------------------
// CHILD VIEWS: 5. INVENTORY OWNER DASHBOARD
// -------------------------------------------------------------
// -------------------------------------------------------------
// CHILD VIEWS: 6. PORTER DRIVER MOBILE PORTAL
// -------------------------------------------------------------
// -------------------------------------------------------------
// CHILD VIEWS: 8. LIVE SATELLITE ORBIT TRACKING PAGE
// -------------------------------------------------------------
// -------------------------------------------------------------
// SHARED COMPONENTS
// -------------------------------------------------------------

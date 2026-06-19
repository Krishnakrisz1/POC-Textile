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

export default function AdminDashboard({ projects, subcontractors, users, onOnboardProject, onOnboardProcess, onAddSubcontractor, onAddUser, onNavigate }: AdminProps) {
  // Create hooks state
  const [projName, setProjName] = useState("");
  const [custName, setCustName] = useState("");
  const [instruction, setInstruction] = useState("");
  const [ownerId, setOwnerId] = useState("user-3");
  const [milestones, setMilestones] = useState<string>("Knitting Completion:2026-06-30, Dyeing Batch:2026-07-10");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("High");

  const [procProjId, setProcProjId] = useState("");
  const [procType, setProcType] = useState<string[]>(["Knitting"]);
  const [procInstruction, setProcInstruction] = useState("");
  const [procOwner, setProcOwner] = useState("user-5");
  const [qcRequired, setQcRequired] = useState(true);
  const [projStartDate, setProjStartDate] = useState("");
  const [projEndDate, setProjEndDate] = useState("");
  const [procStartDate, setProcStartDate] = useState("");
  const [procEndDate, setProcEndDate] = useState("");
  const [orderQuantity, setOrderQuantity] = useState<number | "">("");

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
    if (!projName || !custName || procType.length === 0) return;

    // Generate simple timeline from start and end dates
    const parsedTimeline = [
      { milestone: "Project Start", dueDate: projStartDate || new Date().toISOString().split("T")[0] },
      { milestone: "Project Deadline", dueDate: projEndDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] }
    ];

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
          Priority: priority,
          OrderQuantity: orderQuantity
        })
      });

      if (projRes.ok) {
        const newProj = await projRes.json();

        const procRes = await fetch("/api/processes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ProjectId: newProj.ProjectId,
            ProcessName: procType.join(", "),
            ProcessType: procType[0] || "Knitting",
            ProcessTypes: procType,
            ProcessInstruction: procInstruction,
            StartDate: procStartDate,
            EndDate: procEndDate,
            Priority: priority,
            ProcessOwnerId: "",
            QCRequired: qcRequired
          })
        });

        if (procRes.ok) {
          setProjName("");
          setCustName("");
          setInstruction("");
          setProcInstruction("");
          setOrderQuantity("");
          setProjStartDate("");
          setProjEndDate("");
          setProcStartDate("");
          setProcEndDate("");
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


      <div className="grid grid-cols-1 gap-8">

        {/* Combined Onboard Project & Process Form */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5 border-b border-slate-100 pb-2">
            Add Project
          </h3>

          <form onSubmit={handleCombinedSubmit} className="space-y-6 text-xs">
            <div className="space-y-4">
              <h4 className="font-bold text-indigo-700 uppercase tracking-widest text-[10px]">Project Details</h4>
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Project Name</label>
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
                  <label className="block text-slate-500 mb-1 font-semibold">Customer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Nike Wear India"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 font-semibold"
                    required
                  />
                </div>

              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Order Quantity</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Start Date</label>
                  <input
                    type="date"
                    value={projStartDate}
                    onChange={(e) => setProjStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">End Date</label>
                  <input
                    type="date"
                    value={projEndDate}
                    onChange={(e) => setProjEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
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
                <span className="text-[10px] text-slate-400 mt-1 block">Please attach the customer instruction docs</span>
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Assign Project Owner</label>
                <select
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-201 rounded-lg px-3 py-2 text-slate-805 font-bold"
                >
                  <option value="user-3">Project Owner (po1@company.com)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-emerald-700 uppercase tracking-widest text-[10px]">Process Details</h4>
              <div>
                <label className="block text-slate-500 mb-2 font-semibold">Process Category Type</label>
                <div className="flex flex-wrap gap-4 items-center">
                  {["Knitting", "Dyeing", "Cutting", "Printing", "Embroidery", "Stitching", "Packing"].map(cat => (
                    <label key={cat} className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={procType.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) setProcType([...procType, cat]);
                          else setProcType(procType.filter(p => p !== cat));
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Start Date</label>
                  <input
                    type="date"
                    value={procStartDate}
                    onChange={(e) => setProcStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">End Date</label>
                  <input
                    type="date"
                    value={procEndDate}
                    onChange={(e) => setProcEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Process Document</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">QC Document</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 font-bold text-center rounded-xl transition duration-150 cursor-pointer text-sm"
            >
              Submit Project
            </button>
          </form>
        </div>

      </div>

      {/* Global Contract statuses */}
      <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-4">
          Projects ({projects.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-450 uppercase font-bold text-[10px]">
                <th className="pb-3">Project ID</th>
                <th className="pb-3">Title</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Start Date</th>
                <th className="pb-3">End Date</th>
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
                  <td className="py-3 text-slate-400 font-mono">{formatDate(p.Timeline?.[0]?.dueDate)}</td>
                  <td className="py-3 text-slate-400 font-mono">{formatDate(p.Timeline?.[p.Timeline?.length - 1]?.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
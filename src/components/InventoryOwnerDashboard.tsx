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

export default function InventoryOwnerDashboard({ workOrders, inventory, users, onPrepareDispatch, onAssignDriver, onVerifyOTP, onCompanyOTPConfirm, onAddStock, onAcknowledgeReceived }: InventoryProps) {
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
          { code: "returns", label: "Receive Processed Returns Loop" },
          { code: "pulled_returns", label: "Pulled Back Returns Loop" }
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

      {(activeTab === "returns" || activeTab === "pulled_returns") && (
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-805">
            {activeTab === "pulled_returns" ? "Pulled Back Returns Awaiting Store Receipt" : "Awaiting Store Receipt Verification"}
            ({(activeTab === "pulled_returns" ? returnRecs.filter(r => (r as any).IsPullBack) : returnRecs.filter(r => !(r as any).IsPullBack)).length})
          </h3>

          {(activeTab === "pulled_returns" ? returnRecs.filter(r => (r as any).IsPullBack) : returnRecs.filter(r => !(r as any).IsPullBack)).length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              {activeTab === "pulled_returns" ? "No pulled back logistics currently returned to stores checkpoint." : "No return logistics currently returned to stores checkpoint. Completed subcontractor portal orders."}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {(activeTab === "pulled_returns" ? returnRecs.filter(r => (r as any).IsPullBack) : returnRecs.filter(r => !(r as any).IsPullBack)).map((ret) => {
                const wo = workOrders.find((w) => w.WorkOrderId === ret.WorkOrderId);

                return (
                  <div key={ret.ReturnId} className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <span className="font-bold text-slate-900 font-mono text-[13px]">{wo ? wo.WorkOrderCode : "WO-POLO"}</span>
                      <p className="text-slate-500 mt-1">Returning Quantity: <span className="font-bold text-slate-800">{ret.ReturnQuantity} pcs/kg</span></p>
                    </div>

                    <div>
                      {ret.Status === "PendingAssignment" && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">Step 1: Assign Driver for Pickup</p>
                          <div className="flex flex-col gap-2">
                            <select
                              className="bg-white border border-slate-205 rounded px-2 py-1.5 text-[11px]"
                              value={selectedDriver[ret.ReturnId] || "user-9"}
                              onChange={(e) => setSelectedDriver({ ...selectedDriver, [ret.ReturnId]: e.target.value })}
                            >
                              <option value="user-9">Venkatesh Porter (TN 38 AB 1111)</option>
                            </select>
                            <button
                              onClick={async () => {
                                const dId = selectedDriver[ret.ReturnId] || "user-9";
                                const vNum = "TN 38 AB 1111"; // simplified
                                await fetch("/api/return/assign-driver", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ WorkOrderId: ret.WorkOrderId, DriverId: dId, VehicleNumber: vNum })
                                });
                                fetchDispatches();
                              }}
                              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold text-white px-3.5 py-2 cursor-pointer"
                            >
                              Assign Driver
                            </button>
                          </div>
                        </div>
                      )}

                      {(ret.Status === "Assigned" || ret.Status === "InTransit") && wo?.Status !== "7_Completed" && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">Step 2: Awaiting Driver Drop-off</p>
                          <div className="bg-slate-50 border border-slate-150 rounded-lg p-3">
                            <p className="text-[11px] text-slate-600 font-medium">
                              Current Status: <span className="font-bold text-slate-800">{ret.Status === "Assigned" ? "Driver Assigned" : "Return Transit"}</span>
                            </p>
                            
                            {(ret as any).IsPullBack && ret.Status === "Assigned" ? (
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                <span className="inline-block bg-orange-100 text-orange-800 font-bold px-2 py-1 rounded text-[10px] uppercase tracking-wide">
                                  Waiting For Subcontractor Handover
                                </span>
                                <p className="text-[10px] text-slate-500 mt-1">Receipt OTP generation will unlock after the driver verifies pickup.</p>
                              </div>
                            ) : (
                              <>
                                <p className="text-[11px] text-slate-600 font-medium mt-1">
                                  The driver will request the receipt OTP from you upon arrival at the warehouse.
                                </p>
                                {((ret as any).IsPullBack ? wo?.pullbackReceiptOTP : (ret as any).GoodsReceiptOTP) ? (
                                  <div className="mt-2 pt-2 border-t border-slate-200">
                                    <span className="text-[11px] text-slate-500 font-bold block mb-1">Provide this Receipt OTP to Driver:</span>
                                    <span className="font-mono bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded border border-indigo-200 font-black tracking-widest text-sm inline-block">
                                      {(ret as any).IsPullBack ? wo?.pullbackReceiptOTP : (ret as any).GoodsReceiptOTP}
                                    </span>
                                  </div>
                                ) : (
                                  (ret as any).IsPullBack && ret.Status === "InTransit" && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          await fetch(`/api/work-orders/${ret.WorkOrderId}/generate-pullback-receipt`, { method: "POST" });
                                          fetchDispatches();
                                        } catch (e) {
                                          console.error(e);
                                        }
                                      }}
                                      className="mt-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold text-white px-3 py-1.5 text-[10px]"
                                    >
                                      Generate Receipt OTP
                                    </button>
                                  )
                                )}
                              </>
                            )}
                          </div>
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
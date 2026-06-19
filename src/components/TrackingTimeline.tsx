import { useState, useEffect } from "react";
import { Truck, MapPin, CheckCircle2, AlertTriangle, ArrowRight, Shield, Anchor } from "lucide-react";
import { WorkOrder, TrackingEvent, Subcontractor, User } from "../types";

interface Props {
  workOrder: WorkOrder;
  subcontractor: Subcontractor | null;
  driver: User | null;
}

export default function TrackingTimeline({ workOrder, subcontractor, driver }: Props) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTracking = async () => {
    try {
      const res = await fetch(`/api/tracking/${workOrder.WorkOrderId}`);
      if (res.ok) {
        const data = await res.json();
        // Sort events latest first
        const sorted = data.sort((a: TrackingEvent, b: TrackingEvent) => 
          new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
        );
        setEvents(sorted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 7000); // Poll status/events
    return () => clearInterval(interval);
  }, [workOrder.WorkOrderId]);

  // Status mapping to stepper steps
  const steps = [
    { label: "Material Prep", code: "1_ToBeDispatched", desc: "Order issued at store" },
    { label: "In Transit", code: "2_InTransit_ToSubcontractor", desc: "Dispatched with porter driver" },
    { label: "Delivered", code: "3_ReceivedBySubcontractor", desc: "Received at sub-factory" },
    { label: "Processing", code: "4_InProcessAtSubcontractor", desc: "Work in active production" },
    { label: workOrder.Status.includes("PulledBack") ? "Ready For Pulled Back Return Pickup" : "Process Completed", code: "4.5_ProcessCompleted", desc: workOrder.Status.includes("PulledBack") ? "Emergency pull back ordered" : "Production finished, ready for return" },
    { label: workOrder.Status.includes("PulledBack") ? "Pullback Return Transit" : "Return Transit", code: "5_ReturnInTransit", desc: "Returning to company" },
    { label: "At Store", code: "6_ReceivedAtCompanyStore", desc: "Pending store receipt check" },
    { label: workOrder.Status.includes("PulledBack") ? "Pullback Verified" : "Completed", code: "7_Completed", desc: "Cleared & Complete" }
  ];

  // Determine current active step index
  const getCurrentStepIndex = () => {
    if (workOrder.Status === "Closed") return 8;
    if (workOrder.Status === "7_Completed") return 8;
    if (workOrder.Status === "PulledBack_Verified") return 8;
    if (workOrder.Status === "4.6_ReadyForPickup" || workOrder.Status === "4.7_ReturnDriverAssigned" || workOrder.Status === "PulledBack_ReadyForPickup" || workOrder.Status === "PulledBack") {
      return steps.findIndex(s => s.code === "4.5_ProcessCompleted");
    }
    if (workOrder.Status === "PulledBack_ReturnInTransit") return steps.findIndex(s => s.code === "5_ReturnInTransit");
    if (workOrder.Status === "PulledBack_Received") return steps.findIndex(s => s.code === "6_ReceivedAtCompanyStore");
    return steps.findIndex((s) => s.code === workOrder.Status);
  };

  const activeIdx = getCurrentStepIndex();

  // Draw simulated vehicle map coordinate position percentage
  let progressPercentage = 0;
  let activeStatusLabel = "Warehouse Prep";

  if (workOrder.Status === "2_InTransit_ToSubcontractor") {
    // If we have events, evaluate progress based on coordinate
    if (events.length > 0) {
      const latest = events[0];
      // Simple linear progression between Tiruppur (Lat 11.1085) and Erode (Lat 11.2330)
      const diff = latest.Latitude - 11.1085;
      const totalDiff = 11.2330 - 11.1085;
      progressPercentage = Math.min(95, Math.max(10, Math.round((diff / totalDiff) * 100)));
    } else {
      progressPercentage = 30;
    }
    activeStatusLabel = "Vehicle Transit to Subcontractor Active";
  } else if (workOrder.Status === "3_ReceivedBySubcontractor" || workOrder.Status === "4_InProcessAtSubcontractor" || workOrder.Status === "4.5_ProcessCompleted" || workOrder.Status === "4.6_ReadyForPickup" || workOrder.Status === "4.7_ReturnDriverAssigned" || workOrder.Status === "PulledBack_ReadyForPickup" || workOrder.Status === "PulledBack") {
    progressPercentage = 100;
    activeStatusLabel = workOrder.Status.includes("PulledBack") ? "Pulled Back - Waiting for Pickup" : "Materials Handover Complete";
  } else if (workOrder.Status === "5_ReturnInTransit" || workOrder.Status === "PulledBack_ReturnInTransit") {
    progressPercentage = 60; // returning
    activeStatusLabel = "Return Shipments in Transit";
  } else if (workOrder.Status === "6_ReceivedAtCompanyStore" || workOrder.Status === "7_Completed" || workOrder.Status === "PulledBack_Received" || workOrder.Status === "PulledBack_Verified") {
    progressPercentage = 0; // arrived back
    activeStatusLabel = workOrder.Status === "PulledBack_Verified" ? "Verified Pulled Back Items" : "Arrived Back at Company Stores";
  }

  return (
    <div className="space-y-6">
      {/* Visual Status Stepper */}
      <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-6">
          <CheckCircle2 className="h-5 w-5 text-slate-800" />
          Production Phase Status Tracker
        </h3>

        <div className="relative w-full overflow-x-auto pb-4 scrollbar-hide">
          <div className="min-w-[800px] relative px-2">
            {/* Stepper Line background */}
            <div className="absolute top-5 left-[5%] right-[5%] h-0.5 bg-slate-100 -z-0" />
            
            {/* Stepper Active Highlight */}
            {activeIdx > 0 && (
              <div
                className="absolute top-5 left-[5%] h-0.5 bg-slate-900 duration-500 -z-0"
                style={{ width: `${Math.min(90, (activeIdx / 7) * 90)}%` }}
              />
            )}

            <div className="flex justify-between items-start relative z-10 w-full">
              {steps.map((s, idx) => {
                const isPassed = idx < activeIdx;
                const isCurrent = idx === activeIdx;
                
                return (
                  <div key={s.code} className="flex flex-col items-center text-center w-24 shrink-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-mono text-sm font-bold transition-all ${
                        isPassed
                          ? "bg-slate-900 border-slate-900 text-white"
                          : isCurrent
                          ? "bg-white border-slate-900 text-slate-950 ring-4 ring-slate-100"
                          : "bg-white border-slate-200 text-slate-400"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex flex-col items-center mt-2.5">
                      <span className={`text-[11px] leading-tight font-bold ${isCurrent ? "text-slate-900" : "text-slate-600"}`}>
                        {s.label}
                      </span>
                      <span className="text-[9.5px] text-slate-400 leading-tight mt-1 px-1">
                        {s.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integrated Simulated vector map */}
          <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between" style={{ minHeight: "260px" }}>
            {/* Matrix Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25 -z-0" />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-400 uppercase font-mono">
                  🛰️ Carrier Telemetry Connected
                </span>
                <h4 className="text-white text-base font-bold mt-2 font-mono">{activeStatusLabel}</h4>
              </div>
              {driver && (
                <div className="text-right text-slate-400 font-mono text-[10px]">
                  <p>Driver: {driver.name}</p>
                  <p>Ph: {driver.phone}</p>
                </div>
              )}
            </div>

            {/* Simulated Road Path Graphic */}
            <div className="relative my-8 h-20 bg-slate-800/40 rounded-2xl border border-slate-700/30 flex items-center px-8 z-10">
              <div className="absolute left-8 right-8 h-1 bg-dashed border-t-2 border-dashed border-slate-700 -z-0" />
              
              {/* Origin Marker */}
              <div className="absolute left-8 flex flex-col items-center -translate-x-1/2">
                <MapPin className="h-4.5 w-4.5 text-slate-400" />
                <span className="text-[9px] text-slate-400 font-mono mt-1">HQ Store</span>
              </div>

              {/* Destination Marker */}
              <div className="absolute right-8 flex flex-col items-center translate-x-1/2">
                <MapPin className="h-4.5 w-4.5 text-indigo-400" />
                <span className="text-[9px] text-slate-400 font-mono mt-1 max-w-[80px] truncate text-center">
                  {subcontractor ? subcontractor.CompanyName.split(" ")[0] : "Center"}
                </span>
              </div>

              {/* Live Pulsing Truck Pin */}
              {(workOrder.Status === "2_InTransit_ToSubcontractor" || workOrder.Status === "5_ReturnInTransit") && (
                <div
                  className="absolute transition-all duration-1000 ease-in-out flex flex-col items-center"
                  style={{
                    left: `calc(8px + ${progressPercentage}% * 0.85)`
                  }}
                >
                  <div className="relative">
                    <span className="absolute -inset-2 rounded-full bg-indigo-500/30 animate-ping" />
                    <div className="rounded-full bg-indigo-600 p-1.5 text-white border border-indigo-400 relative">
                      <Truck className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <span className="text-[9px] text-indigo-300 font-bold font-mono mt-1">In-Transit</span>
                </div>
              )}
            </div>

            <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Origin: Tiruppur, IN</span>
              <span>D: Erode/Salem Highway Route 47</span>
              <span>Temp: Ambient 32°C</span>
            </div>
          </div>

          {/* Activity Logs of Milestones */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs flex flex-col max-h-[350px]">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Challan & Handover Ledger Audit
            </h4>
            
            {loading ? (
              <div className="flex h-32 items-center justify-center text-slate-400 text-xs">
                Synchronizing secure tokens...
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Awaiting first carrier dispatch transaction.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {events.map((e, index) => (
                  <div key={e.EventId} className="flex gap-3 text-xs">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`h-2.5 w-2.5 rounded-full ${index === 0 ? "bg-slate-900 ring-4 ring-slate-100" : "bg-slate-300"}`} />
                      {index < events.length - 1 && <div className="w-[1px] bg-slate-200 flex-1 my-1" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 tracking-tight uppercase text-[10px]">
                        {e.EventType} — {e.Remarks}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {new Date(e.Timestamp).toLocaleDateString()} at {new Date(e.Timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  CheckCircle, ShieldCheck
} from "lucide-react";
import { User } from "../types";

interface DriverProps {
  currentUser: User;
  onVerifyDeliveryOTP: (dispId: string, otp: string) => Promise<void>;
  onUpdateLocation: (woId: string, lat: number, lng: number, remark: string) => Promise<void>;
}

export default function DriverDashboard({ currentUser, onVerifyDeliveryOTP, onUpdateLocation }: DriverProps) {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [returnRuns, setReturnRuns] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [otpVal, setOTPVal] = useState<Record<string, string>>({});

  const listMyRuns = async () => {
    try {
      const res = await fetch("/api/driver/my-deliveries?driverId=" + currentUser.id);
      if (res.ok) setDeliveries(await res.json());

      const woRes = await fetch("/api/work-orders");
      if (woRes.ok) setWorkOrders(await woRes.json());

      const retRes = await fetch("/api/return/history");
      if (retRes.ok) {
        const allRet = await retRes.json();
        setReturnRuns(allRet.filter((r: any) => r.DriverId === currentUser.id));
      }
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

      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Return Pickups ({returnRuns.length})</h3>
        {returnRuns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-150 p-6 text-center text-slate-500">
            No return pickups assigned.
          </div>
        ) : (
          returnRuns.map((ret) => {
            const wo = workOrders.find(w => w.WorkOrderId === ret.WorkOrderId);
            if (!wo) return null;

            return (
              <div key={ret.ReturnId} className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-slate-50 pb-3">
                  <div>
                    <span className="font-extrabold text-slate-900 font-mono text-sm uppercase">{wo.WorkOrderCode}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Type: {ret.IsPullBack ? "Emergency Pullback Return" : "Return Pickup"}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase rounded px-2.5 py-0.5 ${wo.Status === "7_Completed" || ret.PickupDate ? "bg-indigo-100 text-indigo-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                    {ret.Status}
                  </span>
                </div>

                {ret.Status === "Assigned" && (
                  <div className="border-t border-slate-50 pt-4 space-y-3">
                    <div className={`rounded-xl ${ret.IsPullBack ? "bg-orange-50 border-orange-100" : "bg-emerald-50 border-emerald-100"} border p-4`}>
                      <h4 className={`font-bold ${ret.IsPullBack ? "text-orange-900" : "text-emerald-900"} flex items-center gap-1`}>
                        <ShieldCheck className={`h-4.5 w-4.5 ${ret.IsPullBack ? "text-orange-700" : "text-emerald-700"}`} />
                        {ret.IsPullBack ? "Pullback Pickup Verification:" : "Subcontractor Handover Pickup Check:"}
                      </h4>
                      <p className={`text-[10px] ${ret.IsPullBack ? "text-orange-800" : "text-emerald-800"} mt-1 mb-3`}>
                        Enter the Pickup OTP provided by the Subcontractor to authenticate the material handover.
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="6-Digit Pickup OTP"
                          value={otpVal[ret.ReturnId] || ""}
                          onChange={(e) => setOTPVal({ ...otpVal, [ret.ReturnId]: e.target.value })}
                          className="bg-white border rounded px-3 py-2 text-center text-sm font-bold w-full focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <button
                          onClick={async () => {
                            try {
                              const endpoint = ret.IsPullBack 
                                ? `/api/work-orders/${ret.WorkOrderId}/verify-pullback-pickup` 
                                : `/api/return/${ret.ReturnId}/pickup-confirm`;
                                
                              const res = await fetch(endpoint, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ otp: otpVal[ret.ReturnId] })
                              });
                              if (!res.ok) {
                                const err = await res.json();
                                alert(err.error || "Invalid OTP");
                              } else {
                                listMyRuns();
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className={`rounded-xl ${ret.IsPullBack ? "bg-orange-600 hover:bg-orange-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white font-bold px-4 transition-all cursor-pointer`}
                        >
                          Verify {ret.IsPullBack ? "Pullback Pickup" : "Pickup"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {ret.Status === "InTransit" && (
                  <div className="border-t border-slate-50 pt-4 space-y-3">
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1">
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                        Store Drop-off Verification:
                      </h4>
                      <p className="text-[10px] text-slate-600 mt-1 mb-3">
                        Status: In Transit. Upon arrival, ask the Store Owner for their Receipt OTP to verify delivery.
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="6-Digit Dropoff OTP"
                          value={otpVal[ret.ReturnId + '_dropoff'] || ""}
                          onChange={(e) => setOTPVal({ ...otpVal, [ret.ReturnId + '_dropoff']: e.target.value })}
                          className="bg-white border rounded px-3 py-2 text-center text-sm font-bold w-full focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <button
                          onClick={async () => {
                            try {
                              const endpoint = ret.IsPullBack 
                                ? `/api/work-orders/${ret.WorkOrderId}/verify-pullback-receipt` 
                                : `/api/return/${ret.ReturnId}/company-otp-confirm`;

                              const res = await fetch(endpoint, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ otp: otpVal[ret.ReturnId + '_dropoff'] })
                              });
                              if (!res.ok) {
                                const err = await res.json();
                                alert(err.error || "Invalid OTP");
                              } else {
                                // @ts-ignore
                                if (typeof listMyRuns === 'function') listMyRuns();
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 transition-all cursor-pointer"
                        >
                          Verify Delivery
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
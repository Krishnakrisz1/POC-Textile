import { useState, useEffect } from "react";
import { Mail, Bell, CheckCheck, Clock, ShieldCheck, X, ChevronRight, RefreshCw, Trash2 } from "lucide-react";
import { Notification, EmailLog } from "../types";

interface Props {
  userId: string;
}

export default function NotificationsDrawer({ userId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [activeTab, setActiveTab] = useState<"notifications" | "emails">("notifications");
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchLogs = async () => {
    try {
      // Fetch in-app notifications
      const nRes = await fetch("/api/notifications");
      if (nRes.ok) {
        const nData = await nRes.json();
        // Filter notifications by active user role or global system
        const filtered = nData.filter(
          (n: Notification) => n.UserId === userId || n.UserId === "system" || userId === "user-1"
        );
        setNotifications(filtered);
        setUnreadCount(filtered.filter((n: Notification) => !n.IsRead).length);
      }

      // Fetch simulated system email logs
      const eRes = await fetch("/api/system/emails");
      if (eRes.ok) {
        const eData = await eRes.json();
        setEmails(eData);
      }
    } catch (e) {
      console.error("Failed to sync notifications", e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Polling every 5 seconds for real-time emulation
    return () => clearInterval(interval);
  }, [userId]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      fetchLogs();
    } catch (e) {
      console.error(e);
    }
  };

  const markSingleRead = async (notifId: string) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, { method: "POST" });
      fetchLogs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            fetchLogs();
          }}
          className="flex h-14 items-center gap-2 rounded-full bg-slate-900 px-5 text-white shadow-xl hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
          id="btn-toggle-drawer"
        >
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-sm font-semibold tracking-wide">System Logs & Alerts</span>
          <div className="relative border-l border-slate-700 pl-3 ml-1 flex items-center">
            <Mail className="h-4 w-4 text-slate-400" />
            {emails.length > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-emerald-400" />
            )}
          </div>
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white border-l border-slate-100 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ height: "100vh" }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                System Log Emulation Terminal
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Monitor backend notifications and simulated email delivery outcomes
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex-1 py-3.5 text-sm font-medium border-b-2 text-center transition-colors ${
                activeTab === "notifications"
                  ? "border-slate-800 text-slate-900 bg-slate-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Bell className="h-4 w-4" />
                <span>In-App Notifications</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-bold">
                  {notifications.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("emails")}
              className={`flex-1 py-3.5 text-sm font-medium border-b-2 text-center transition-colors ${
                activeTab === "emails"
                  ? "border-slate-800 text-slate-900 bg-slate-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Simulated Emails</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-bold">
                  {emails.length}
                </span>
              </div>
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50/50 border-b border-slate-100 text-xs">
            <button
              onClick={fetchLogs}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold"
            >
              <RefreshCw className="h-3 w-3" /> Refresh Logs
            </button>
            {activeTab === "notifications" && unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-slate-800 hover:text-slate-900 font-bold transition-colors"
              >
                <CheckCheck className="h-4 w-4 text-emerald-500" />
                Mark All Read
              </button>
            )}
            {activeTab === "emails" && emails.length > 0 && (
              <button
                onClick={async () => {
                  await fetch("/api/system/emails/clear", { method: "POST" });
                  fetchLogs();
                }}
                className="flex items-center gap-1 text-slate-800 hover:text-rose-600 font-bold transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Clear Emails
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === "notifications" ? (
              notifications.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-slate-50 p-4 text-slate-400">
                    <Bell className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-800">Clear notification queue</h3>
                  <p className="mt-1 text-xs text-slate-400 max-w-xs">
                    Notifications generated during material movements and workflow triggers will be listed here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {notifications.map((n) => (
                    <div
                      key={n.NotifId}
                      className={`relative flex flex-col gap-1 rounded-xl border p-4 transition-all hover:bg-slate-50/50 ${
                        n.IsRead ? "bg-white border-slate-100" : "bg-slate-50/40 border-slate-200 shadow-xs"
                      }`}
                    >
                      {!n.IsRead && (
                        <div className="absolute top-4 right-4 flex h-2 w-2 rounded-full bg-slate-800" />
                      )}
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                            n.Type === "ALERT"
                              ? "bg-amber-100 text-amber-800"
                              : n.Type === "DELIVERY"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {n.Type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(n.CreatedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mt-1">{n.Title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{n.Message}</p>

                      {!n.IsRead && (
                        <button
                          onClick={() => markSingleRead(n.NotifId)}
                          className="mt-2 text-[10px] font-bold text-slate-800 hover:underline text-left"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : emails.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <div className="rounded-full bg-slate-50 p-4 text-slate-400">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-800">No outbound mail records</h3>
                <p className="mt-1 text-xs text-slate-400 max-w-xs">
                  When you dispatch garments to a subcontractor, their unique OTP coordinates are mailed dynamically and logged here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {emails.map((e) => {
                  // Search for 6-digit OTP code in the email body for direct extraction!
                  const matchesObj = e.Body.match(/\b\d{6}\b/);
                  const extractedOTP = matchesObj ? matchesObj[0] : null;

                  return (
                    <div
                      key={e.EmailId}
                      className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
                        <span className="font-semibold text-slate-600">to: {e.RecipientEmail}</span>
                        <span>{new Date(e.SentAt).toLocaleTimeString()}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 leading-snug">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        {e.Subject}
                      </h4>
                      
                      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100 font-mono whitespace-pre-wrap leading-relaxed">
                        {e.Body}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 items-center justify-between border-t border-slate-50 pt-3">
                        {extractedOTP && (
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-slate-450">OTP Pin Code:</span>
                            <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-xs text-white font-mono font-bold font-semibold select-all">
                              {extractedOTP}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

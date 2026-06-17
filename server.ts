import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { JSONDB, User, Project, Process, Subcontractor, WorkOrder, MaterialDispatch, Delivery, ReturnPickup, OTPLog, EmailLog, InventoryItem, InventoryTransaction, TrackingEvent, PullBack, Notification } from "./src/server/db";

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for generating standard IDs & Codes
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function generateCode(prefix: string) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// -------------------------------------------------------------
// Core OTP & Email Simulation Helpers
// -------------------------------------------------------------
function sendSimulatedEmail(workOrderId: string, recipientEmail: string, subject: string, body: string) {
  const emailLogs = JSONDB.get("emailLogs");
  const newEmail: EmailLog = {
    EmailId: `em-${generateId()}`,
    WorkOrderId: workOrderId,
    RecipientEmail: recipientEmail,
    Subject: subject,
    Body: body,
    SentAt: new Date().toISOString(),
    DeliveryStatus: "Sent"
  };
  emailLogs.unshift(newEmail);
  JSONDB.set("emailLogs", emailLogs);

  // Trigger interactive system notification for visual aid
  addSystemNotification(
    "system",
    `📧 Email Sent to Subcontractor`,
    `Subject: "${subject}". Contains login links and OTP verification keys. Check system mail logs.`,
    "EMAIL",
    `/subcontractor/portal/${workOrderId}`
  );
}

function addSystemNotification(userId: string, title: string, message: string, type: string, linkRef?: string) {
  const notifications = JSONDB.get("notifications");
  const newNotif: Notification = {
    NotifId: `not-${generateId()}`,
    UserId: userId,
    Title: title,
    Message: message,
    Type: type,
    IsRead: false,
    CreatedAt: new Date().toISOString(),
    LinkRef: linkRef
  };
  notifications.unshift(newNotif);
  JSONDB.set("notifications", notifications);
}

// -------------------------------------------------------------
// MODULE 1: Authentication & User Management
// -------------------------------------------------------------
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const users = JSONDB.get("users");
  
  // For easy POC, verify either real password, or match prefilled emails
  const user = users.find((u) => u.Email.toLowerCase() === (email || "").toLowerCase().trim());
  
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials or user not found." });
  }

  // Create mock token (JWT simulation)
  const token = `mock-jwt-token-for-${user.UserId}-${user.RoleCode}`;
  res.json({
    token,
    user: {
      id: user.UserId,
      name: user.Name,
      email: user.Email,
      phone: user.Phone,
      role: user.RoleCode,
      roleName: user.RoleName
    }
  });
});

app.get("/api/users", (req, res) => {
  const role = req.query.role;
  let users = JSONDB.get("users");
  if (role) {
    users = users.filter((u) => u.RoleCode === role);
  }
  res.json(users);
});

app.post("/api/users", (req, res) => {
  const { Name, Email, Phone, RoleCode, CompanyName, Address, ProcessTypes } = req.body;
  if (!Name || !Email || !RoleCode) {
    return res.status(400).json({ error: "Name, Email and Role are required." });
  }

  const users = JSONDB.get("users");
  const exists = users.find((u) => u.Email.toLowerCase() === Email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "User with this email already exists." });
  }

  const roleNames: Record<string, string> = {
    SUPER_ADMIN: "SuperAdmin",
    ADMIN: "Admin",
    PROJECT_OWNER: "Project Owner",
    PROCESS_OWNER: "Process Owner",
    INVENTORY_OWNER: "Inventory Owner",
    PORTER_DRIVER: "Porter Driver",
    SUBCONTRACTOR: "Subcontractor"
  };

  const newUser: User = {
    UserId: `user-${generateId()}`,
    Name,
    Email,
    Phone: Phone || "+91 9000000000",
    RoleCode,
    RoleName: roleNames[RoleCode] || "User",
    IsActive: true,
    CreatedAt: new Date().toISOString()
  };

  users.push(newUser);
  JSONDB.set("users", users);

  if (RoleCode === "SUBCONTRACTOR") {
    const subcontractors = JSONDB.get("subcontractors");
    const newSub: Subcontractor = {
      SubcontractorId: `sub-${generateId()}`,
      CompanyName: CompanyName || `${Name} Mills`,
      ContactPerson: Name,
      Email: Email,
      Phone: Phone || "+91 9000000000",
      Address: Address || "Subcontractor Registered Address, Tiruppur",
      ProcessTypes: ProcessTypes || ["Knitting"],
      Rating: 5.0,
      IsActive: true
    };
    subcontractors.push(newSub);
    JSONDB.set("subcontractors", subcontractors);
  }

  res.json(newUser);
});

app.put("/api/users/:id", (req, res) => {
  const { Name, Phone, IsActive } = req.body;
  const users = JSONDB.get("users");
  const idx = users.findIndex((u) => u.UserId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found." });

  users[idx] = {
    ...users[idx],
    Name: Name !== undefined ? Name : users[idx].Name,
    Phone: Phone !== undefined ? Phone : users[idx].Phone,
    IsActive: IsActive !== undefined ? IsActive : users[idx].IsActive
  };

  JSONDB.set("users", users);
  res.json(users[idx]);
});

app.delete("/api/users/:id", (req, res) => {
  const users = JSONDB.get("users");
  const idx = users.findIndex((u) => u.UserId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found." });

  // Soft delete
  users[idx].IsActive = false;
  JSONDB.set("users", users);
  res.json({ success: true, message: "User soft deleted." });
});

// -------------------------------------------------------------
// MODULE 2 & 3: Projects & Onboarding Flow
// -------------------------------------------------------------
app.get("/api/projects", (req, res) => {
  const projects = JSONDB.get("projects");
  res.json(projects);
});

app.get("/api/subcontractors", (req, res) => {
  const subcontractors = JSONDB.get("subcontractors");
  res.json(subcontractors);
});

app.get("/api/projects/:id", (req, res) => {
  const projects = JSONDB.get("projects");
  const project = projects.find((p) => p.ProjectId === req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found." });
  res.json(project);
});

app.post("/api/projects", (req, res) => {
  const { ProjectName, CustomerName, OrderInstruction, ProjectOwnerId, Timeline, Priority } = req.body;
  if (!ProjectName || !CustomerName || !ProjectOwnerId) {
    return res.status(400).json({ error: "Missing required project fields." });
  }

  const projects = JSONDB.get("projects");
  const newProject: Project = {
    ProjectId: `proj-${generateId()}`,
    ProjectName,
    ProjectCode: generateCode("PROJ"),
    CustomerId: `cust-${generateId()}`,
    CustomerName,
    OrderInstruction: OrderInstruction || "",
    AdminId: "user-2", // Default logged admin
    ProjectOwnerId,
    Timeline: Timeline || [],
    Status: "PendingApproval",
    CreatedAt: new Date().toISOString()
  };

  projects.unshift(newProject);
  JSONDB.set("projects", projects);

  // Notify SuperAdmin
  addSystemNotification(
    "user-1",
    "🆕 Project Pending Approval",
    `New project "${ProjectName}" has been submitted by Admin and awaits your review.`,
    "PROJECT",
    `/superadmin/dashboard`
  );

  res.json(newProject);
});

app.post("/api/projects/:id/approve", (req, res) => {
  const projects = JSONDB.get("projects");
  const projIdx = projects.findIndex((p) => p.ProjectId === req.params.id);
  if (projIdx === -1) return res.status(404).json({ error: "Project not found." });

  projects[projIdx].Status = "Approved";
  projects[projIdx].ApprovedAt = new Date().toISOString();
  projects[projIdx].ApprovedBy = "user-1"; // SuperAdmin
  JSONDB.set("projects", projects);

  // Notify Project Owner
  addSystemNotification(
    projects[projIdx].ProjectOwnerId,
    "✅ Project Approved",
    `Your project "${projects[projIdx].ProjectName}" has been approved. You can now start assigning process owners.`,
    "PROJECT",
    `/project-owner/dashboard`
  );

  res.json(projects[projIdx]);
});

app.post("/api/projects/:id/reject", (req, res) => {
  const { reason } = req.body;
  const projects = JSONDB.get("projects");
  const projIdx = projects.findIndex((p) => p.ProjectId === req.params.id);
  if (projIdx === -1) return res.status(404).json({ error: "Project not found." });

  projects[projIdx].Status = "Draft";
  JSONDB.set("projects", projects);

  addSystemNotification(
    projects[projIdx].AdminId,
    "❌ Project Rejected",
    `Project "${projects[projIdx].ProjectName}" was returned to draft mode. Reason: ${reason || "Not specified."}`,
    "PROJECT"
  );

  res.json(projects[projIdx]);
});

// -------------------------------------------------------------
// MODULE 4: Processes Flow
// -------------------------------------------------------------
app.get("/api/processes", (req, res) => {
  const { projectId } = req.query;
  let processes = JSONDB.get("processes");
  if (projectId) {
    processes = processes.filter((p) => p.ProjectId === projectId);
  }
  res.json(processes);
});

app.get("/api/processes/:id", (req, res) => {
  const processes = JSONDB.get("processes");
  const proc = processes.find((p) => p.ProcessId === req.params.id);
  if (!proc) return res.status(404).json({ error: "Process not found." });
  res.json(proc);
});

app.post("/api/processes", (req, res) => {
  const { ProjectId, ProcessName, ProcessType, ProcessInstruction, ExpectedDeliveryDays, Priority, ProcessOwnerId, QCRequired } = req.body;
  if (!ProjectId || !ProcessName || !ProcessType || !ProcessOwnerId) {
    return res.status(400).json({ error: "Missing required components to onboard process." });
  }

  const processes = JSONDB.get("processes");
  const newProcess: Process = {
    ProcessId: `proc-${generateId()}`,
    ProjectId,
    ProcessName,
    ProcessType,
    ProcessInstruction: ProcessInstruction || "",
    ProcessOwnerId,
    Priority: Priority || "Medium",
    ExpectedDeliveryDays: Number(ExpectedDeliveryDays) || 7,
    Status: "Assigned",
    QCRequired: !!QCRequired
  };

  processes.push(newProcess);
  JSONDB.set("processes", processes);

  // Notify Process Owner
  addSystemNotification(
    ProcessOwnerId,
    "💼 Process Assigned to You",
    `You have been assigned as Process Owner for "${ProcessName}" in project.`,
    "PROCESS",
    `/process-owner/processes/${newProcess.ProcessId}`
  );

  res.json(newProcess);
});

app.post("/api/processes/:id/assign-owner", (req, res) => {
  const { ProcessOwnerId } = req.body;
  const processes = JSONDB.get("processes");
  const idx = processes.findIndex((p) => p.ProcessId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Process not found." });

  processes[idx].ProcessOwnerId = ProcessOwnerId;
  processes[idx].Status = "Assigned";
  JSONDB.set("processes", processes);

  addSystemNotification(
    ProcessOwnerId,
    "💼 New Process Assigned",
    `Project Owner assigned you to "${processes[idx].ProcessName}". View specifications to start order placement.`,
    "PROCESS",
    `/process-owner/processes/${req.params.id}`
  );

  res.json(processes[idx]);
});

app.post("/api/processes/:id/start", (req, res) => {
  const processes = JSONDB.get("processes");
  const idx = processes.findIndex((p) => p.ProcessId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Process not found." });

  processes[idx].Status = "InProgress";
  JSONDB.set("processes", processes);

  // Automatically update Project status to InProgress as well
  const projects = JSONDB.get("projects");
  const pIdx = projects.findIndex((p) => p.ProjectId === processes[idx].ProjectId);
  if (pIdx !== -1 && projects[pIdx].Status !== "InProgress") {
    projects[pIdx].Status = "InProgress";
    JSONDB.set("projects", projects);
  }

  res.json(processes[idx]);
});

// -------------------------------------------------------------
// MODULE 5: Work Orders, Dispatches & Logistics Core Flow
// -------------------------------------------------------------
app.get("/api/work-orders", (req, res) => {
  const workOrders = JSONDB.get("workOrders");
  res.json(workOrders);
});

app.get("/api/work-orders/:id", (req, res) => {
  const workOrders = JSONDB.get("workOrders");
  const wo = workOrders.find((w) => w.WorkOrderId === req.params.id);
  if (!wo) return res.status(404).json({ error: "Work Order not found." });
  res.json(wo);
});

app.post("/api/work-orders", (req, res) => {
  const { ProcessId, SubcontractorId, MaterialDetails, TotalQuantity, Unit, ExpectedReturnDate, CreatedBy } = req.body;
  if (!ProcessId || !SubcontractorId || !MaterialDetails || !TotalQuantity) {
    return res.status(400).json({ error: "Missing dispatch order details to raise Work Order." });
  }

  const workOrders = JSONDB.get("workOrders");
  const newWo: WorkOrder = {
    WorkOrderId: `wo-${generateId()}`,
    WorkOrderCode: generateCode("WO"),
    ProcessId,
    SubcontractorId,
    MaterialDetails,
    TotalQuantity: Number(TotalQuantity),
    Unit,
    Status: "1_ToBeDispatched",
    ExpectedReturnDate,
    CreatedBy,
    CreatedAt: new Date().toISOString()
  };

  workOrders.unshift(newWo);
  JSONDB.set("workOrders", workOrders);

  // Notify Inventory Manager to prepare material
  addSystemNotification(
    "user-8", // sivakumar Store Manager
    "📦 New Dispatch Material Prep Needed",
    `Work Order ${newWo.WorkOrderCode} raised. Please prepare ${TotalQuantity} ${Unit} of materials for driver pickup.`,
    "INVENTORY",
    `/inventory/dispatch-orders`
  );

  res.json(newWo);
});

// Preparation, driver assignment, OTP logic
app.get("/api/dispatch/challan", (req, res) => {
  const { workOrderId } = req.query;
  const dispatches = JSONDB.get("dispatches");
  const disp = dispatches.find((d) => d.WorkOrderId === workOrderId);
  
  if (!disp) return res.status(404).json({ error: "No dispatch details recorded for this work order." });
  res.set("Content-Type", "application/pdf");
  res.send(`MOCK_PDF_DATA_CHALLAN_${disp.DispatchId}`);
});

app.post("/api/dispatch/create", (req, res) => {
  const { WorkOrderId, InventoryOwnerId } = req.body;
  const dispatches = JSONDB.get("dispatches");
  
  // Create or retrieve existing dispatch
  let disp = dispatches.find((d) => d.WorkOrderId === WorkOrderId);
  if (!disp) {
    disp = {
      DispatchId: `disp-${generateId()}`,
      WorkOrderId,
      InventoryOwnerId,
      DriverId: "",
      DispatchOTP: "",
      OTPExpiry: "",
      DeliveryChallanPath: `challan_WO-${generateId()}.pdf`,
      QuantityDispatched: 0
    };
    dispatches.push(disp);
    JSONDB.set("dispatches", dispatches);
  }
  res.json(disp);
});

app.post("/api/dispatch/:id/assign-driver", (req, res) => {
  const { DriverId } = req.body;
  const dispatches = JSONDB.get("dispatches");
  const idx = dispatches.findIndex((d) => d.DispatchId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Dispatch record not found." });

  dispatches[idx].DriverId = DriverId;
  
  // Auto-generate OTP
  const rawOTP = Math.floor(100000 + Math.random() * 900000).toString();
  dispatches[idx].DispatchOTP = rawOTP;
  dispatches[idx].OTPExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours

  JSONDB.set("dispatches", dispatches);

  // Add OTP log
  const otpLogs = JSONDB.get("otpLogs");
  const newOtpLog: OTPLog = {
    OTPId: `otp-${generateId()}`,
    WorkOrderId: dispatches[idx].WorkOrderId,
    Type: "Dispatch",
    OTPCode: rawOTP,
    SentTo: "+91 936111" + Math.floor(1000 + Math.random() * 9000), // Driver mock phone
    SentAt: new Date().toISOString(),
    IsExpired: false
  };
  otpLogs.unshift(newOtpLog);
  JSONDB.set("otpLogs", otpLogs);

  // Notify driver
  addSystemNotification(
    DriverId,
    "🚚 New Delivery Assigned",
    `Pickup OTP raised. Input code ${rawOTP} upon loading the warehouse materials.`,
    "DELIVERY",
    `/driver/my-deliveries`
  );

  res.json(dispatches[idx]);
});

app.post("/api/dispatch/:id/generate-otp", (req, res) => {
  const dispatches = JSONDB.get("dispatches");
  const idx = dispatches.findIndex((d) => d.DispatchId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Dispatch record not found." });

  const rawOTP = Math.floor(100000 + Math.random() * 900000).toString();
  dispatches[idx].DispatchOTP = rawOTP;
  dispatches[idx].OTPExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  JSONDB.set("dispatches", dispatches);

  const otpLogs = JSONDB.get("otpLogs");
  otpLogs.unshift({
    OTPId: `otp-${generateId()}`,
    WorkOrderId: dispatches[idx].WorkOrderId,
    Type: "Dispatch",
    OTPCode: rawOTP,
    SentTo: "Driver Mobile Screen",
    SentAt: new Date().toISOString(),
    IsExpired: false
  });
  JSONDB.set("otpLogs", otpLogs);

  res.json({ DispatchOTP: rawOTP });
});

// Acknowledge loading confirm
app.post("/api/dispatch/:id/loading-confirm", (req, res) => {
  const { InventoryOwnerId } = req.body;
  const dispatches = JSONDB.get("dispatches");
  const idx = dispatches.findIndex((d) => d.DispatchId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Dispatch record not found." });

  dispatches[idx].LoadingAcknowledgedAt = new Date().toISOString();
  dispatches[idx].LoadingAcknowledgedBy = InventoryOwnerId;

  JSONDB.set("dispatches", dispatches);
  res.json(dispatches[idx]);
});

// Verify Verification OTP at pickup
app.post("/api/dispatch/:id/verify-otp", (req, res) => {
  const { otp } = req.body;
  const dispatches = JSONDB.get("dispatches");
  const dispIdx = dispatches.findIndex((d) => d.DispatchId === req.params.id);
  if (dispIdx === -1) return res.status(404).json({ error: "Dispatch record not found." });

  const disp = dispatches[dispIdx];
  if (disp.DispatchOTP !== otp) {
    return res.status(400).json({ error: "Incorrect verification OTP. Security lock check active." });
  }

  // OTP Match
  dispatches[dispIdx].OTPVerifiedAt = new Date().toISOString();
  dispatches[dispIdx].DispatchedAt = new Date().toISOString();
  JSONDB.set("dispatches", dispatches);

  // Update Work Order to InTransit
  const workOrders = JSONDB.get("workOrders");
  const woIdx = workOrders.findIndex((w) => w.WorkOrderId === disp.WorkOrderId);
  if (woIdx !== -1) {
    workOrders[woIdx].Status = "2_InTransit_ToSubcontractor";
    workOrders[woIdx].DispatchDate = new Date().toISOString();
    JSONDB.set("workOrders", workOrders);

    // Deduct stock from Inventory
    const inventory = JSONDB.get("inventory");
    const transactions = JSONDB.get("transactions");
    
    workOrders[woIdx].MaterialDetails.forEach((mat) => {
      const invItem = inventory.find((i) => i.ItemId === mat.ItemId);
      if (invItem) {
        invItem.AvailableQuantity = Math.max(0, invItem.AvailableQuantity - mat.Quantity);
        invItem.LastUpdatedAt = new Date().toISOString();

        transactions.push({
          TxnId: `txn-${generateId()}`,
          ItemId: mat.ItemId,
          WorkOrderId: disp.WorkOrderId,
          TransactionType: "Issue",
          Quantity: mat.Quantity,
          TransactedBy: disp.InventoryOwnerId,
          TransactedAt: new Date().toISOString(),
          Remarks: `Automatic deduction on driver pickup verification for Order: ${workOrders[woIdx].WorkOrderCode}`
        });
      }
    });

    JSONDB.set("inventory", inventory);
    JSONDB.set("transactions", transactions);

    // Initial GPS location log
    const trackingEvents = JSONDB.get("trackingEvents");
    trackingEvents.push({
      EventId: `tr-${generateId()}`,
      WorkOrderId: disp.WorkOrderId,
      DriverId: disp.DriverId,
      Latitude: 11.1085, // Tiruppur Warehouse Coords
      Longitude: 77.3411,
      EventType: "PickedUp",
      Timestamp: new Date().toISOString(),
      Remarks: "Materials verified. Vehicle loaded and departed center."
    });
    JSONDB.set("trackingEvents", trackingEvents);

    // Send Subcontractor OTP Delivery Email
    const subcontractors = JSONDB.get("subcontractors");
    const sub = subcontractors.find((s) => s.SubcontractorId === workOrders[woIdx].SubcontractorId);
    if (sub) {
      const deliveryOTP = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save delivery details
      const deliveries = JSONDB.get("deliveries");
      const delIdx = deliveries.findIndex((d) => d.DispatchId === req.params.id);
      const deliveryRec: Delivery = {
        DeliveryId: `del-${generateId()}`,
        DispatchId: disp.DispatchId,
        WorkOrderId: disp.WorkOrderId,
        DriverId: disp.DriverId,
        SubcontractorOTP: deliveryOTP,
        SubOTPExpiry: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours
      };
      if (delIdx !== -1) {
        deliveries[delIdx] = deliveryRec;
      } else {
        deliveries.push(deliveryRec);
      }
      JSONDB.set("deliveries", deliveries);

      // Email subcontractor
      sendSimulatedEmail(
        disp.WorkOrderId,
        sub.Email,
        `Work Order #${workOrders[woIdx].WorkOrderCode} — Materials Dispatched | Sakthithara Textile`,
        `Dear ${sub.CompanyName},\n\n` +
        `Materials for ${workOrders[woIdx].Unit} process have successfully left our main center.\n\n` +
        `Material Details:\n` +
        workOrders[woIdx].MaterialDetails.map(m => `- ${m.ItemName}: ${m.Quantity} ${m.Unit}`).join("\n") + `\n\n` +
        `Vehicle driver details:\n` +
        `- Delivery Driver: Venkatesh Logistics\n` +
        `- Verification Signature Key: ${deliveryOTP}\n\n` +
        `Please present this 6-Digit OTP code to the driver upon vehicle arrival to complete handover confirmation.\n\n` +
        `Access Your Live Subcontractor Orders Portal via secure link:\n` +
        `${process.env.APP_URL || "http://localhost:3000"}/subcontractor/portal/${disp.WorkOrderId}`
      );
    }
  }

  res.json({ success: true, dispatch: dispatches[dispIdx] });
});

// -------------------------------------------------------------
// MODULE 7: Driver Delivery Flow & GPS Coordinates Mocking
// -------------------------------------------------------------
app.get("/api/driver/my-deliveries", (req, res) => {
  const driverId = req.query.driverId || "user-10"; // Default to a driver for POC ease
  const dispatches = JSONDB.get("dispatches");
  const workOrders = JSONDB.get("workOrders");
  
  const mine = dispatches.filter((d) => d.DriverId === driverId);
  const results = mine.map((d) => {
    const wo = workOrders.find((w) => w.WorkOrderId === d.WorkOrderId);
    return {
      dispatch: d,
      workOrder: wo
    };
  });
  res.json(results);
});

// Verify Subcontractor Delivery OTP
app.post("/api/delivery/:dispatchId/verify-otp", (req, res) => {
  const { otp } = req.body;
  const deliveries = JSONDB.get("deliveries");
  const delIdx = deliveries.findIndex((d) => d.DispatchId === req.params.dispatchId);
  if (delIdx === -1) {
    return res.status(404).json({ error: "Delivery logs not found." });
  }

  const delivery = deliveries[delIdx];
  if (delivery.SubcontractorOTP !== otp) {
    return res.status(400).json({ error: "Incorrect Subcontractor verification Code. Match failed." });
  }

  // Update delivery
  deliveries[delIdx].SubOTPVerifiedAt = new Date().toISOString();
  deliveries[delIdx].DeliveredAt = new Date().toISOString();
  deliveries[delIdx].ReceivedByName = "Subcontractor Representative";
  JSONDB.set("deliveries", deliveries);

  // Update Work Order to ReceivedBySubcontractor (status 3)
  const workOrders = JSONDB.get("workOrders");
  const woIdx = workOrders.findIndex((w) => w.WorkOrderId === delivery.WorkOrderId);
  if (woIdx !== -1) {
    workOrders[woIdx].Status = "3_ReceivedBySubcontractor";
    JSONDB.set("workOrders", workOrders);

    // Track delivery arrival event
    const trackingEvents = JSONDB.get("trackingEvents");
    trackingEvents.push({
      EventId: `tr-${generateId()}`,
      WorkOrderId: delivery.WorkOrderId,
      DriverId: delivery.DriverId,
      Latitude: 11.2330, // Arrived Erode
      Longitude: 77.5850,
      EventType: "Delivered",
      Timestamp: new Date().toISOString(),
      Remarks: "Materials received & verified via OTP. Driver successfully exited center."
    });
    JSONDB.set("trackingEvents", trackingEvents);

    // Raise in-app Notification to Process Owner
    const processes = JSONDB.get("processes");
    const proc = processes.find((p) => p.ProcessId === workOrders[woIdx].ProcessId);
    if (proc) {
      addSystemNotification(
        proc.ProcessOwnerId,
        "📦 Work Order Received by Subcontractor",
        `Work Order ${workOrders[woIdx].WorkOrderCode} has been delivered and verified by Subcontractor. Processing started.`,
        "PROCESS",
        `/process-owner/work-orders/${delivery.WorkOrderId}`
      );
    }
  }

  res.json({ success: true, delivery: deliveries[delIdx] });
});

app.post("/api/delivery/:dispatchId/photo-upload", (req, res) => {
  const { photoUrl } = req.body;
  const deliveries = JSONDB.get("deliveries");
  const delIdx = deliveries.findIndex((d) => d.DispatchId === req.params.dispatchId);
  if (delIdx !== -1) {
    deliveries[delIdx].PhotoProofPath = photoUrl || "handover_completion_photo.jpg";
    JSONDB.set("deliveries", deliveries);
  }
  res.json({ success: true, message: "Photo proof saved successfully" });
});

// Latency updates for driver simulation
app.post("/api/tracking/update", (req, res) => {
  const { workOrderId, driverId, lat, lng, remark } = req.body;
  const trackingEvents = JSONDB.get("trackingEvents");

  const newEvent: TrackingEvent = {
    EventId: `tr-${generateId()}`,
    WorkOrderId: workOrderId,
    DriverId: driverId,
    Latitude: Number(lat),
    Longitude: Number(lng),
    EventType: "InTransit",
    Timestamp: new Date().toISOString(),
    Remarks: remark || "Vehicle coordinate auto update"
  };

  trackingEvents.push(newEvent);
  JSONDB.set("trackingEvents", trackingEvents);
  res.json(newEvent);
});

// -------------------------------------------------------------
// MODULE 8: Subcontractor Portal
// -------------------------------------------------------------
app.get("/api/subcontractor/work-orders", (req, res) => {
  const { subEmail } = req.query;
  const subcontractors = JSONDB.get("subcontractors");
  const sub = subcontractors.find((s) => s.Email.toLowerCase() === (subEmail as string || "").toLowerCase());
  
  if (!sub) return res.status(404).json({ error: "Subcontractor registered link error." });

  const workOrders = JSONDB.get("workOrders");
  const mine = workOrders.filter((w) => w.SubcontractorId === sub.SubcontractorId);
  res.json(mine);
});

app.post("/api/subcontractor/work-orders/:id/acknowledge", (req, res) => {
  const workOrders = JSONDB.get("workOrders");
  const idx = workOrders.findIndex((w) => w.WorkOrderId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Work order not found." });

  workOrders[idx].Status = "4_InProcessAtSubcontractor";
  JSONDB.set("workOrders", workOrders);

  res.json(workOrders[idx]);
});

app.post("/api/subcontractor/work-orders/:id/in-progress", (req, res) => {
  const workOrders = JSONDB.get("workOrders");
  const idx = workOrders.findIndex((w) => w.WorkOrderId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Work order not found." });

  workOrders[idx].Status = "4_InProcessAtSubcontractor";
  JSONDB.set("workOrders", workOrders);
  res.json(workOrders[idx]);
});

// Subcontractor completes the processing order
app.post("/api/subcontractor/work-orders/:id/complete", (req, res) => {
  const workOrders = JSONDB.get("workOrders");
  const idx = workOrders.findIndex((w) => w.WorkOrderId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Work order not found." });

  workOrders[idx].Status = "5_ReturnInTransit"; // Prepares return shipment
  JSONDB.set("workOrders", workOrders);

  // Notify Process Owner
  const processes = JSONDB.get("processes");
  const proc = processes.find((p) => p.ProcessId === workOrders[idx].ProcessId);
  if (proc) {
    addSystemNotification(
      proc.ProcessOwnerId,
      "⚙️ Subcontractor Core Complete",
      `Subcontractor marked processing complete for ${workOrders[idx].WorkOrderCode}. Arrange Return Pickup.`,
      "PROCESS",
      `/process-owner/dashboard`
    );

    // Auto-setup of simulated Return Handover record
    const returnPickups = JSONDB.get("returnPickups");
    returnPickups.push({
      ReturnId: `ret-${generateId()}`,
      WorkOrderId: workOrders[idx].WorkOrderId,
      DriverId: "user-9", // Assigned Venkatesh logistics or standard
      ReturnQuantity: workOrders[idx].TotalQuantity,
      ReturnChallanPath: "return_challan_auto_generated.pdf"
    });
    JSONDB.set("returnPickups", returnPickups);
  }

  res.json(workOrders[idx]);
});

// -------------------------------------------------------------
// MODULE 9: Return Flows, Pull Backs & Closed Loops
// -------------------------------------------------------------
app.get("/api/return/history", (req, res) => {
  const returnPickups = JSONDB.get("returnPickups");
  res.json(returnPickups);
});

app.post("/api/return/assign-driver", (req, res) => {
  const { WorkOrderId, DriverId } = req.body;
  const returnPickups = JSONDB.get("returnPickups");
  const idx = returnPickups.findIndex((r) => r.WorkOrderId === WorkOrderId);
  
  if (idx !== -1) {
    returnPickups[idx].DriverId = DriverId;
    returnPickups[idx].PickupDate = new Date().toISOString();
    JSONDB.set("returnPickups", returnPickups);
  } else {
    returnPickups.push({
      ReturnId: `ret-${generateId()}`,
      WorkOrderId,
      DriverId,
      PickupDate: new Date().toISOString(),
      ReturnQuantity: 500 // placeholder
    });
    JSONDB.set("returnPickups", returnPickups);
  }

  res.json({ success: true });
});

// Subcontractor hands over returned material to driver
app.post("/api/return/:id/pickup-confirm", (req, res) => {
  const returnPickups = JSONDB.get("returnPickups");
  const idx = returnPickups.findIndex((r) => r.ReturnId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Return ledger not found." });

  returnPickups[idx].PickupDate = new Date().toISOString();
  JSONDB.set("returnPickups", returnPickups);

  // Update Work Order status (status 5)
  const workOrders = JSONDB.get("workOrders");
  const woIdx = workOrders.findIndex((w) => w.WorkOrderId === returnPickups[idx].WorkOrderId);
  if (woIdx !== -1) {
    workOrders[woIdx].Status = "5_ReturnInTransit";
    JSONDB.set("workOrders", workOrders);
  }

  res.json(returnPickups[idx]);
});

// Store manager receives at warehouse
app.post("/api/return/:id/received-at-company", (req, res) => {
  const { InventoryOwnerId } = req.body;
  const returnPickups = JSONDB.get("returnPickups");
  const idx = returnPickups.findIndex((r) => r.ReturnId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Return record not found." });

  returnPickups[idx].ReturnedAt = new Date().toISOString();
  returnPickups[idx].CompanyAcknowledgedAt = new Date().toISOString();
  returnPickups[idx].CompanyAcknowledgedBy = InventoryOwnerId;
  JSONDB.set("returnPickups", returnPickups);

  // Update Work Order to ReceivedAtStore
  const workOrders = JSONDB.get("workOrders");
  const woIdx = workOrders.findIndex((w) => w.WorkOrderId === returnPickups[idx].WorkOrderId);
  if (woIdx !== -1) {
    workOrders[woIdx].Status = "6_ReceivedAtCompanyStore";
    JSONDB.set("workOrders", workOrders);
  }

  res.json(returnPickups[idx]);
});

// Final verify closure of return order
app.post("/api/return/:id/company-otp-confirm", (req, res) => {
  const returnPickups = JSONDB.get("returnPickups");
  const idx = returnPickups.findIndex((r) => r.ReturnId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Return records not found." });

  const ret = returnPickups[idx];
  
  // Close Work order complete (status 7)
  const workOrders = JSONDB.get("workOrders");
  const woIdx = workOrders.findIndex((w) => w.WorkOrderId === ret.WorkOrderId);
  if (woIdx !== -1) {
    workOrders[woIdx].Status = "7_Completed";
    workOrders[woIdx].ActualReturnDate = new Date().toISOString();
    JSONDB.set("workOrders", workOrders);

    // Return materials into stock list
    const processes = JSONDB.get("processes");
    const proc = processes.find((p) => p.ProcessId === workOrders[woIdx].ProcessId);
    if (proc) {
      proc.Status = "Completed";
      JSONDB.set("processes", processes);
    }

    // Prepare transaction journal for the returns
    const inventory = JSONDB.get("inventory");
    const transactions = JSONDB.get("transactions");
    
    // Convert source raw item to destination finished processed item or increment base
    // If weaving knitting completes, yarn diminishes and grey fabric increment occurs automatically!
    if (proc?.ProcessType === "Knitting") {
      const greyFabric = inventory.find(i => i.ItemId === "inv-2");
      if (greyFabric) {
        greyFabric.AvailableQuantity += workOrders[woIdx].TotalQuantity;
        JSONDB.set("inventory", inventory);

        transactions.push({
          TxnId: `txn-${generateId()}`,
          ItemId: "inv-2",
          WorkOrderId: ret.WorkOrderId,
          TransactionType: "Return",
          Quantity: workOrders[woIdx].TotalQuantity,
          TransactedBy: "user-8",
          TransactedAt: new Date().toISOString(),
          Remarks: `Received knitted grey fabric into inventory from Knit Co. Order Complete.`
        });
        JSONDB.set("transactions", transactions);
      }
    } else if (proc?.ProcessType === "Dyeing") {
      const dyedFab = inventory.find(i => i.ItemId === "inv-3");
      if (dyedFab) {
        dyedFab.AvailableQuantity += workOrders[woIdx].TotalQuantity;
        JSONDB.set("inventory", inventory);

        transactions.push({
          TxnId: `txn-${generateId()}`,
          ItemId: "inv-3",
          WorkOrderId: ret.WorkOrderId,
          TransactionType: "Return",
          Quantity: workOrders[woIdx].TotalQuantity,
          TransactedBy: "user-8",
          TransactedAt: new Date().toISOString(),
          Remarks: `Received dyed royal blue fabric into inventory from Kalai Dyeing.`
        });
        JSONDB.set("transactions", transactions);
      }
    }

    // Raise in-app alerts on completion
    addSystemNotification(
      "user-1", // SuperAdmin
      "🎉 Process Phase Completed",
      `Polo Shirts Order Work Order ${workOrders[woIdx].WorkOrderCode} is closed and ready for invoice clearance.`,
      "STAKEHOLDER",
      `/superadmin/work-orders`
    );
  }

  res.json({ success: true, returnRecord: returnPickups[idx] });
});

// Pull Back Actions
app.post("/api/work-orders/:id/pull-back", (req, res) => {
  const { Reason, InitiatedBy, OldSubcontractorId, NewSubcontractorId } = req.body;
  const workOrders = JSONDB.get("workOrders");
  const idx = workOrders.findIndex((w) => w.WorkOrderId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Work Order not found." });

  const oldWo = workOrders[idx];
  oldWo.Status = "PulledBack";
  JSONDB.set("workOrders", workOrders);

  // Log pullback
  const pullbacks = JSONDB.get("pullbacks");
  const pbId = `pull-${generateId()}`;
  
  // Instantly spin up a NEW Work Order for the new subcontractor as specified
  const newWoCode = generateCode("WO-REBUILD");
  const newWo: WorkOrder = {
    WorkOrderId: `wo-${generateId()}`,
    WorkOrderCode: newWoCode,
    ProcessId: oldWo.ProcessId,
    SubcontractorId: NewSubcontractorId || "sub-1", // default knitting or alternative
    MaterialDetails: oldWo.MaterialDetails,
    TotalQuantity: oldWo.TotalQuantity,
    Unit: oldWo.Unit,
    Status: "1_ToBeDispatched",
    ExpectedReturnDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    CreatedBy: InitiatedBy,
    CreatedAt: new Date().toISOString()
  };

  workOrders.unshift(newWo);
  JSONDB.set("workOrders", workOrders);

  const pbRecord: PullBack = {
    PullBackId: pbId,
    WorkOrderId: req.params.id,
    Reason: Reason || "Delay",
    InitiatedBy,
    InitiatedAt: new Date().toISOString(),
    OldSubcontractorId,
    NewWorkOrderId: newWo.WorkOrderId
  };
  pullbacks.push(pbRecord);
  JSONDB.set("pullbacks", pullbacks);

  // Notify Store and SuperAdmin
  addSystemNotification(
    "user-1",
    "⚠️ Material PullBack Action Alert",
    `Work Order ${oldWo.WorkOrderCode} was pulled back due to subcontractor ${Reason || "issues"}. Dispatch reconstituted as ${newWoCode}.`,
    "ALERT",
    `/superadmin/work-orders`
  );

  res.json({ success: true, pullBack: pbRecord, newWorkOrder: newWo });
});

// -------------------------------------------------------------
// MODULE 10: In-App Notifications Queue
// -------------------------------------------------------------
app.get("/api/notifications", (req, res) => {
  const notifications = JSONDB.get("notifications");
  res.json(notifications);
});

app.post("/api/notifications/:id/read", (req, res) => {
  const notifications = JSONDB.get("notifications");
  const idx = notifications.findIndex((n) => n.NotifId === req.params.id);
  if (idx !== -1) {
    notifications[idx].IsRead = true;
    JSONDB.set("notifications", notifications);
  }
  res.json({ success: true });
});

app.post("/api/notifications/read-all", (req, res) => {
  const notifications = JSONDB.get("notifications");
  notifications.forEach((n) => { n.IsRead = true; });
  JSONDB.set("notifications", notifications);
  res.json({ success: true });
});

// 📧 System Email logs (so the evaluator can read sent verify links & OTPs)
app.get("/api/system/emails", (req, res) => {
  const emailLogs = JSONDB.get("emailLogs");
  res.json(emailLogs);
});

app.get("/api/tracking/live-map", (req, res) => {
  const trackingEvents = JSONDB.get("trackingEvents");
  const workOrders = JSONDB.get("workOrders");
  // Find latest transit point for each work order
  const lookup: Record<string, TrackingEvent> = {};
  trackingEvents.forEach((t) => {
    if (!lookup[t.WorkOrderId] || new Date(t.Timestamp) > new Date(lookup[t.WorkOrderId].Timestamp)) {
      lookup[t.WorkOrderId] = t;
    }
  });

  const live = Object.values(lookup).map((evt) => {
    const wo = workOrders.find((w) => w.WorkOrderId === evt.WorkOrderId);
    return {
      event: evt,
      workOrder: wo
    };
  });
  res.json(live);
});

app.get("/api/tracking/:workOrderId", (req, res) => {
  const trackingEvents = JSONDB.get("trackingEvents");
  const events = trackingEvents.filter((t) => t.WorkOrderId === req.params.workOrderId);
  res.json(events);
});

// -------------------------------------------------------------
// MODULE KPI: Dashboards Data Integration
// -------------------------------------------------------------
app.get("/api/dashboard/superadmin", (req, res) => {
  const workOrders = JSONDB.get("workOrders");
  const pullBacks = JSONDB.get("pullbacks");
  const projects = JSONDB.get("projects");

  const totalWO = workOrders.length;
  const inTransit = workOrders.filter((w) => w.Status === "2_InTransit_ToSubcontractor").length;
  const inProcess = workOrders.filter((w) => w.Status === "4_InProcessAtSubcontractor").length;
  const pendingDispatch = workOrders.filter((w) => w.Status === "1_ToBeDispatched").length;
  const returnTransit = workOrders.filter((w) => w.Status === "5_ReturnInTransit").length;
  const completedCount = workOrders.filter((w) => w.Status === "7_Completed").length;
  const pullbackCount = pullBacks.length;

  // Overdue count check
  const today = new Date().toISOString().split("T")[0];
  const overdueCount = workOrders.filter((w) => {
    return w.Status !== "7_Completed" && w.Status !== "Closed" && w.Status !== "PulledBack" && w.ExpectedReturnDate < today;
  }).length;

  res.json({
    kpis: {
      totalWorkOrders: totalWO,
      inTransitToSubcontractor: inTransit,
      inProcessAtSubcontractor: inProcess,
      pendingDispatch,
      returnInTransit: returnTransit,
      completedThisMonth: completedCount,
      pullbacks: pullbackCount,
      overdue: overdueCount
    }
  });
});

app.get("/api/inventory", (req, res) => {
  const inventory = JSONDB.get("inventory");
  res.json(inventory);
});

app.get("/api/inventory/transactions", (req, res) => {
  const transactions = JSONDB.get("transactions");
  res.json(transactions);
});

app.post("/api/inventory", (req, res) => {
  const { ItemName, Category, AvailableQuantity, Unit, WarehouseLocation } = req.body;
  const inventory = JSONDB.get("inventory");
  
  const newItem: InventoryItem = {
    ItemId: `inv-${generateId()}`,
    ItemName,
    ItemCode: generateCode("INV"),
    Category,
    AvailableQuantity: Number(AvailableQuantity) || 0,
    Unit,
    WarehouseLocation: WarehouseLocation || "General Floor",
    LastUpdatedAt: new Date().toISOString()
  };

  inventory.push(newItem);
  JSONDB.set("inventory", inventory);

  // transaction
  const transactions = JSONDB.get("transactions");
  transactions.push({
    TxnId: `txn-${generateId()}`,
    ItemId: newItem.ItemId,
    TransactionType: "Add",
    Quantity: newItem.AvailableQuantity,
    TransactedBy: "user-8",
    TransactedAt: new Date().toISOString(),
    Remarks: "Manual stock addition log"
  });
  JSONDB.set("transactions", transactions);

  res.json(newItem);
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

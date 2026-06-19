export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "SUPER_ADMIN" | "ADMIN" | "PROJECT_OWNER" | "PROCESS_OWNER" | "INVENTORY_OWNER" | "PORTER_DRIVER" | "SUBCONTRACTOR";
  roleName: string;
}

export interface Project {
  ProjectId: string;
  ProjectName: string;
  ProjectCode: string;
  CustomerId: string;
  CustomerName: string;
  OrderInstruction: string;
  AdminId: string;
  ProjectOwnerId: string;
  Timeline: Array<{ milestone: string; dueDate: string }>;
  Status: "Draft" | "PendingApproval" | "Approved" | "InProgress" | "Completed" | "Closed";
  CreatedAt: string;
  ApprovedAt?: string;
  ApprovedBy?: string;
  OrderQuantity?: number | string;
  QuantityToEnter?: number | string;
  Priority?: string;
}

export interface Process {
  ProcessId: string;
  ProjectId: string;
  ProcessName: string;
  ProcessType: "Knitting" | "Dyeing" | "Cutting" | "Printing" | "Embroidery" | "Stitching" | "Ironing" | "Packing";
  ProcessInstruction: string;
  ProcessOwnerId: string;
  Priority: "High" | "Medium" | "Low";
  ExpectedDeliveryDays: number;
  Status: "Pending" | "Assigned" | "InProgress" | "Completed";
  ProcessPDFPath?: string;
  QCRequired: boolean;
}

export interface Subcontractor {
  SubcontractorId: string;
  CompanyName: string;
  ContactPerson: string;
  Email: string;
  Phone: string;
  Address: string;
  ProcessTypes: string[];
  Rating: number;
  IsActive: boolean;
}


export const STAGE_OPERATIONS_MAPPING: Record<string, string[]> = {
  "Knitting": ["Fabric Knitting", "Loop Formation", "Roll Winding"],
  "Dyeing": ["GSM Verification", "Shade Verification", "Fabric Dyeing"],
  "Cutting": ["Fabric Inspection", "Fabric Spreading", "Pattern Cutting"],
  "Printing": ["Logo Printing", "Heat Transfer Printing", "Drying"],
  "Embroidery": ["Design Punching", "Embroidery Stitching", "Thread Trimming"],
  "Stitching": ["Collar Stitching", "Sleeve Stitching", "Side Stitching"],
  "Ironing": ["Garment Ironing", "Quality Check"],
  "Packing": ["Folding", "Poly Bag Packing", "Carton Packing"]
};

export interface Operation {
  name: string;
  completed: boolean;
  completedAt?: string;
}

export interface WorkOrder {
  WorkOrderId: string;
  WorkOrderCode: string;
  ProcessId: string;
  SubcontractorId: string;
  MaterialDetails: Array<{ ItemId: string; ItemName: string; Quantity: number; Unit: string }>;
  TotalQuantity: number;
  Unit: string;
  Status:
    | "0_AwaitingPulledBackMaterial"
    | "1_ToBeDispatched"
    | "2_InTransit_ToSubcontractor"
    | "3_ReceivedBySubcontractor"
    | "4_InProcessAtSubcontractor"
    | "4.5_ProcessCompleted"
    | "4.6_ReadyForPickup"
    | "4.7_ReturnDriverAssigned"
    | "5_ReturnInTransit"
    | "6_ReceivedAtCompanyStore"
    | "7_Completed"
    | "PulledBack"
    | "PulledBack_ReadyForPickup"
    | "PulledBack_ReturnInTransit"
    | "PulledBack_Received"
    | "PulledBack_Verified"
    | "Closed";
  DispatchDate?: string;
  ExpectedReturnDate: string;
  ActualReturnDate?: string;
  CreatedBy: string;
  CreatedAt: string;
  pullbackReason?: string;
  pullbackRequestedAt?: string;
  pullbackRequestedBy?: string;
  pullbackReceivedAt?: string;
  pullbackVerifiedAt?: string;
  SubcontractorOTP?: string;
  pullbackPickupOTP?: string;
  pullbackPickupOTPGeneratedAt?: string;
  pullbackPickupVerifiedAt?: string;
  pullbackReceiptOTP?: string;
  pullbackReceiptOTPGeneratedAt?: string;
  pullbackReceiptVerifiedAt?: string;
  operations?: Operation[];
}

export interface MaterialDispatch {
  DispatchId: string;
  WorkOrderId: string;
  InventoryOwnerId: string;
  DriverId: string;
  DispatchOTP: string;
  OTPExpiry: string;
  OTPVerifiedAt?: string;
  DeliveryChallanPath: string;
  QuantityDispatched: number;
  DispatchedAt?: string;
  LoadingAcknowledgedAt?: string;
  LoadingAcknowledgedBy?: string;
}

export interface Delivery {
  DeliveryId: string;
  DispatchId: string;
  WorkOrderId: string;
  DriverId: string;
  SubcontractorOTP: string;
  SubOTPExpiry: string;
  SubOTPVerifiedAt?: string;
  DeliveredAt?: string;
  ReceivedByName?: string;
  PhotoProofPath?: string;
}

export interface ReturnPickup {
  ReturnId: string;
  WorkOrderId: string;
  DriverId: string;
  VehicleNumber?: string;
  Status?: string;
  GoodsReceiptOTP?: string;
  PickupOTP?: string;
  PickupDate?: string;
  ReturnedAt?: string;
  CompanyAcknowledgedAt?: string;
  CompanyAcknowledgedBy?: string;
  ReturnQuantity: number;
  ReturnChallanPath?: string;
  IsPullBack?: boolean;
}

export interface OTPLog {
  OTPId: string;
  WorkOrderId: string;
  Type: "Dispatch" | "Delivery" | "Return";
  OTPCode: string;
  SentTo: string;
  SentAt: string;
  VerifiedAt?: string;
  IsExpired: boolean;
}

export interface EmailLog {
  EmailId: string;
  WorkOrderId: string;
  RecipientEmail: string;
  Subject: string;
  Body: string;
  SentAt: string;
  DeliveryStatus: "Sent" | "Failed";
}

export interface InventoryItem {
  ItemId: string;
  ItemName: string;
  ItemCode: string;
  Category: "Yarn" | "Fabric" | "DyedMaterial" | "CutPanels" | "Other";
  AvailableQuantity: number;
  Unit: string;
  WarehouseLocation: string;
  LastUpdatedAt: string;
}

export interface InventoryTransaction {
  TxnId: string;
  ItemId: string;
  WorkOrderId?: string;
  TransactionType: "Issue" | "Return" | "Add";
  Quantity: number;
  TransactedBy: string;
  TransactedAt: string;
  Remarks: string;
}

export interface TrackingEvent {
  EventId: string;
  WorkOrderId: string;
  DriverId: string;
  Latitude: number;
  Longitude: number;
  EventType: "PickedUp" | "InTransit" | "Delivered" | "ReturnPickedUp" | "ReturnedToWarehouse" | "OperationCompleted";
  Timestamp: string;
  Remarks: string;
}

export interface Notification {
  NotifId: string;
  UserId: string;
  Title: string;
  Message: string;
  Type: string;
  IsRead: boolean;
  CreatedAt: string;
  LinkRef?: string;
}

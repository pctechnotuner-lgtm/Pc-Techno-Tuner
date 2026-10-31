export type Language = 'en' | 'hi' | 'gu';

export type ProductCategory =
  | 'Desktop Computers'
  | 'Laptops'
  | 'CCTV Cameras and DVR/NVR'
  | 'Printers and Scanners'
  | 'Computer Accessories'
  | 'Networking Products and Routers'
  | 'Servers and Storage'
  | 'Firewall and Antivirus Software'
  | 'Biometric and Attendance Machines'
  | 'Software and IT Services'
  | 'Other Products';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Desktop Computers',
  'Laptops',
  'CCTV Cameras and DVR/NVR',
  'Printers and Scanners',
  'Computer Accessories',
  'Networking Products and Routers',
  'Servers and Storage',
  'Firewall and Antivirus Software',
  'Biometric and Attendance Machines',
  'Software and IT Services',
  'Other Products',
];

export type ComplaintType =
  | 'Hardware Problem'
  | 'Software Problem'
  | 'CCTV Not Working'
  | 'Camera Offline'
  | 'Printer Problem'
  | 'Network Problem'
  | 'Server Problem'
  | 'Installation Request'
  | 'Warranty Claim'
  | 'Other';

export const COMPLAINT_TYPES: ComplaintType[] = [
  'Hardware Problem',
  'Software Problem',
  'CCTV Not Working',
  'Camera Offline',
  'Printer Problem',
  'Network Problem',
  'Server Problem',
  'Installation Request',
  'Warranty Claim',
  'Other',
];

export type WarrantyStatus =
  | 'Under Warranty'
  | 'Out of Warranty'
  | 'AMC Coverage'
  | 'Not Sure';

export type ComplaintStatus =
  | 'New'
  | 'Pending'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';

export type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Bank Transfer'
  | 'Card'
  | 'Other';

export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid';

export type IncomeCategory =
  | 'Product sales'
  | 'Computer and laptop repair income'
  | 'CCTV installation and service income'
  | 'Software and IT service income'
  | 'Other income';

export type ExpenseCategory =
  | 'Product purchases'
  | 'Shop expenses'
  | 'Transport expenses'
  | 'Technician charges'
  | 'Internet and electricity'
  | 'Other expenses';

export interface CompanyProfile {
  name: string;
  tagline: string;
  location: string;
  address: string;
  pincode: string;
  mobile: string;
  whatsapp: string;
  email: string;
  gstin: string;
  pan: string;
  logoUrl?: string;
  defaultGstRate: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  terms: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  brand: string;
  model: string;
  specifications: string;
  purchasePrice: number; // Internal only (hidden from customers)
  sellingPrice: number;
  stockQuantity: number;
  minStockAlert: number;
  warrantyMonths: number;
  imageUrl: string;
  createdAt: string;
}

export interface Complaint {
  id: string; // e.g. PCT-COMP-2026-001
  customerName: string;
  mobile: string;
  businessName?: string;
  category: ProductCategory;
  brandModel?: string;
  serialNo?: string;
  purchaseDate?: string;
  warrantyStatus: WarrantyStatus;
  complaintType: ComplaintType;
  description: string;
  serviceLocation: string;
  preferredDate?: string;
  photoUrl?: string;
  status: ComplaintStatus;
  assignedTechnician?: string;
  visitDate?: string;
  serviceCharges: number;
  partsUsed?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  productId?: string;
  description: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Invoice {
  id: string; // e.g. PCT-INV-1001
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  customerMobile: string;
  customerBusiness?: string;
  customerAddress: string;
  customerGstin?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface Estimate {
  id: string;
  estimateNo: string;
  estimateDate: string;
  validUntil: string;
  customerName: string;
  customerMobile: string;
  customerBusiness?: string;
  customerAddress: string;
  customerGstin?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  businessName?: string;
  email?: string;
  address: string;
  gstin?: string;
  notes?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: IncomeCategory | ExpenseCategory | string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  partyName: string;
  referenceId?: string; // invoice or complaint id
  notes?: string;
  createdAt: string;
}

export type AppTab =
  | 'catalogue'
  | 'complaint'
  | 'dashboard'
  | 'products'
  | 'customers'
  | 'complaints'
  | 'sales'
  | 'profit'
  | 'accounts'
  | 'reports'
  | 'settings';

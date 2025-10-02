"use client";

export type UserRole = "admin" | "pharmacist" | "cashier";

export interface User {
  id: string;
  name?: string;
  username: string;
  email?: string;
  role: UserRole;
  createdAt?: Date;
}

export interface RefillRecord {
  initialQuantity: number;
  refillDate: Date;
  endDate?: Date;
  batchNumber: string;
}

export interface Refill {
  medicine: string;
  department: string;
  batch_number: string;
  batch_no: string;
  manufacture_date: string;
  expire_date: string;
  price: string;
  quantity: number;
  refill_date: string;
  end_date: string | null;
}

export interface Medicine {
  id: number;
  is_out_of_stock: boolean;
  is_expired: boolean;
  is_nearly_expired: boolean;
  code_no: string;
  brand_name: string;
  generic_name: string;
  batch_no: string;
  manufacture_date: string; // ISO date string
  expire_date: string; // ISO date string
  price: string; // string to keep consistent with user input, e.g. "10.50"
  stock: number;
  low_stock_threshold: number;
  attachment: string | null;
  created_at: string;
  updated_at: string;
  department: number;
  created_by: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  description?: string;
  createdAt: Date;
}

export interface Sale {
  id: string;
  date: Date;
  totalAmount: number;
  cashierId: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: Date;
}

export interface SaleItem {
  id: string;
  saleId: string;
  medicineId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  medicine?: Medicine;
}

export interface DashboardStats {
  todaySales: number;
  weeklySales: number;
  monthlySales: number;
  totalMedicines: number;
  lowStockCount: number;
  expiredCount: number;
  nearExpiryCount: number;
}

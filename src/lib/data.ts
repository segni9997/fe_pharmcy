import type { Medicine, Category, Unit, Sale, SaleItem, DashboardStats } from "./types"

// Mock data for demo
export const mockCategories: Category[] = [
  { id: "1", name: "Prescription", description: "Prescription medications", createdAt: new Date() },
  { id: "2", name: "OTC", description: "Over-the-counter medications", createdAt: new Date() },
  { id: "3", name: "Cosmetic", description: "Beauty and cosmetic products", createdAt: new Date() },
  { id: "4", name: "Supplements", description: "Vitamins and supplements", createdAt: new Date() },
]

export const mockUnits: Unit[] = [
  { id: "1", name: "Tablets", abbreviation: "tabs", description: "Tablet form", createdAt: new Date() },
  { id: "2", name: "Capsules", abbreviation: "caps", description: "Capsule form", createdAt: new Date() },
  { id: "3", name: "Milliliters", abbreviation: "ml", description: "Liquid measurement", createdAt: new Date() },
  { id: "4", name: "Grams", abbreviation: "g", description: "Weight measurement", createdAt: new Date() },
  { id: "5", name: "Milligrams", abbreviation: "mg", description: "Milligram dosage", createdAt: new Date() },
  { id: "6", name: "International Units", abbreviation: "IU", description: "International units", createdAt: new Date() },
  { id: "7", name: "Pieces", abbreviation: "pcs", description: "Individual pieces", createdAt: new Date() },
  { id: "8", name: "Bottles", abbreviation: "btl", description: "Bottle packaging", createdAt: new Date() },
]

export const mockMedicines: Medicine[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    batchNumber: "PAR001",
    manufacturer: "PharmaCorp",
    categoryId: "2",
    unitId: "1",
    price: 5.99,
    stockQuantity: 150,
    expiryDate: new Date("2025-12-31"),
    barcode: "1234567890123",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Amoxicillin 250mg",
    batchNumber: "AMX002",
    manufacturer: "MediLab",
    categoryId: "1",
    unitId: "2",
    price: 12.5,
    stockQuantity: 8,
    expiryDate: new Date("2024-06-30"),
    barcode: "2345678901234",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Vitamin D3 1000IU",
    batchNumber: "VIT003",
    manufacturer: "HealthPlus",
    categoryId: "4",
    unitId: "6",
    price: 18.99,
    stockQuantity: 75,
    expiryDate: new Date("2026-03-15"),
    barcode: "3456789012345",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Face Moisturizer SPF 30",
    batchNumber: "COS004",
    manufacturer: "BeautyMed",
    categoryId: "3",
    unitId: "3",
    price: 24.99,
    stockQuantity: 45,
    expiryDate: new Date("2025-08-20"),
    barcode: "4567890123456",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const mockSales: Sale[] = [
  {
    id: "1",
    date: new Date(),
    totalAmount: 43.48,
    cashierId: "3",
    customerName: "Alice Brown",
    customerPhone: "+1234567890",
    createdAt: new Date(),
  },
]

export const mockSaleItems: SaleItem[] = [
  {
    id: "1",
    saleId: "1",
    medicineId: "1",
    quantity: 2,
    unitPrice: 5.99,
    totalPrice: 11.98,
  },
  {
    id: "2",
    saleId: "1",
    medicineId: "3",
    quantity: 1,
    unitPrice: 18.99,
    totalPrice: 18.99,
  },
]

export function getDashboardStats(): DashboardStats {
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const todaySales = mockSales
    .filter((sale) => sale.date.toDateString() === today.toDateString())
    .reduce((sum, sale) => sum + sale.totalAmount, 0)

  const weeklySales = mockSales.filter((sale) => sale.date >= weekAgo).reduce((sum, sale) => sum + sale.totalAmount, 0)

  const monthlySales = mockSales
    .filter((sale) => sale.date >= monthAgo)
    .reduce((sum, sale) => sum + sale.totalAmount, 0)

  const lowStockCount = mockMedicines.filter((med) => med.stockQuantity < 10).length
  const expiredCount = mockMedicines.filter((med) => med.expiryDate < today).length
  const nearExpiryCount = mockMedicines.filter((med) => {
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    return med.expiryDate <= thirtyDaysFromNow && med.expiryDate > today
  }).length

  return {
    todaySales,
    weeklySales,
    monthlySales,
    totalMedicines: mockMedicines.length,
    lowStockCount,
    expiredCount,
    nearExpiryCount,
  }
}

// New function to get top selling medicines
export function getTopSellingMedicines() {
  // Aggregate sales by medicineId
  const salesByMedicine: Record<string, { sales: number; revenue: number }> = {}

  for (const saleItem of mockSaleItems) {
    if (!salesByMedicine[saleItem.medicineId]) {
      salesByMedicine[saleItem.medicineId] = { sales: 0, revenue: 0 }
    }
    salesByMedicine[saleItem.medicineId].sales += saleItem.quantity
    salesByMedicine[saleItem.medicineId].revenue += saleItem.totalPrice
  }

  // Map to array with medicine name
  const result = Object.entries(salesByMedicine).map(([medicineId, data]) => {
    const medicine = mockMedicines.find((med) => med.id === medicineId)
    return {
      name: medicine ? medicine.name : "Unknown",
      sales: data.sales,
      revenue: data.revenue,
    }
  })

  // Sort by sales descending and take top 5
  result.sort((a, b) => b.sales - a.sales)
  return result.slice(0, 5)
}

import type React from "react";
import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Calendar,
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  History,
  Download,
} from "lucide-react";
import * as XLSX from 'xlsx';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { jwtDecode } from "jwt-decode";
import {
  useCreateUnitMutation,
  useDeleteUnitMutation,
  useGetUnitsQuery,
  useUpdateUnitMutation,
  type Unit,
} from "@/store/unitApi";
import { toast } from "sonner";
import {
  useGetMedicinesQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
  type Medicine,
} from "@/store/medicineApi";
import {
  useCreateRefillMutation,
  // useUpdateRefillMutation,
  useGetRefillsQuery,
} from "@/store/refillApi";

import { useQueryParamsState } from "@/hooks/useQueryParamsState";
import { Pagination } from "@/components/ui/pagination";

export function MedicineManagement() {
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
  } = useQueryParamsState();

  const [unitCurrentPage, setUnitCurrentPage] = useState(1);
  const [unitItemsPerPage, setUnitItemsPerPage] = useState(10);

  // Apis
  const { data: Units, refetch } = useGetUnitsQuery({
    pageNumber: unitCurrentPage,
    pageSize: unitItemsPerPage,
  }, {
    refetchOnMountOrArgChange: true,
  });
  const { data: meds, refetch: refetchMeds } = useGetMedicinesQuery({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
  }, {
    // Refetch when these params change
    refetchOnMountOrArgChange: true,
  }
  
  );
  console.log("object", meds);
  const { data: refills, refetch: refetchRefills } = useGetRefillsQuery();
  const [AddUnit, { isLoading: isUnitAdding }] = useCreateUnitMutation();
  const [UpdateUnit] = useUpdateUnitMutation();
  const [DeleteUnit] = useDeleteUnitMutation();
  const [CreateMedicine, { isLoading: isCreating }] =
    useCreateMedicineMutation();
  const [UpdateMedicine] = useUpdateMedicineMutation();
  const [DeleteMedicine] = useDeleteMedicineMutation();
  const [createRefill, { isLoading: isRefilling }] = useCreateRefillMutation();
  // const [updateRefill, { isLoading: isUpdatingRefill }] = useUpdateRefillMutation();


  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isRefillDialogOpen, setIsRefillDialogOpen] = useState(false);
  const [refillingMedicine, setRefillingMedicine] = useState<Medicine | null>(
    null
  );
  console.log("Units", Units);
  const [refillFormData, setRefillFormData] = useState({
    quantity: "",
    refill_date: new Date().toISOString().split("T")[0],
    end_date: "",
    batch_no: "",
    medicine: "",
    department: "",
    manufacture_date: "",
    expire_date: "",
    price: "",
  });
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [historyMedicine, setHistoryMedicine] = useState<Medicine | null>(null);
  const [isAddUnitDialogOpen, setIsAddUnitDialogOpen] = useState(false);
  const [unitFormData, setUnitFormData] = useState({
    id: "",
    code: "",
    name: "",
  });
  const [formData, setFormData] = useState({
    code_no: "",
    brand_name: "",
    generic_name: "",
    batch_no: "",
    manufacture_date: "",
    unit: "",
    price: "",
    stock: "",
    expire_date: "",
    // barcode: "",
    department: "",
    // imageFile: null,
  });

  const [isUnitSheetOpen, setIsUnitSheetOpen] = useState(false);

  // useEffect(() => {
  //   if (meds?.results) {
  //     setMedicines(meds.results);
  //   }
  // }, [meds]);
  const [inlineEditingUnit, setInlineEditingUnit] = useState<string | null>(
    null
  );
  const [inlineEditData, setInlineEditData] = useState({
    id: "",
    code: "",
    name: "",
  });
  const user: any = jwtDecode(localStorage.getItem("access_token") || "");

  const canEdit = user?.role === "admin";
  // || user?.role === "pharmacist"

  const filteredMedicines = useMemo(() => {
    return (
      meds?.results?.filter((medicine) => {
        const matchesSearch =
          medicine.generic_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          medicine.generic_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          medicine.batch_no.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" || medicine.code_no === selectedCategory;
        return matchesSearch && matchesCategory;
      }) || []
    );
  }, [meds, searchTerm, selectedCategory]);

  const getStockStatus = (quantity: number) => {
    if (quantity === 0)
      return { label: "Out of Stock", variant: "destructive" as const };
    if (quantity < 10)
      return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const getExpiryStatus = (expiryDate: Date) => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    if (expiryDate < today)
      return { label: "Expired", variant: "destructive" as const };
    if (expiryDate <= thirtyDaysFromNow)
      return { label: "Near Expiry", variant: "secondary" as const };
    return { label: "Valid", variant: "default" as const };
  };

  const resetForm = () => {
    setFormData({
      code_no: "",
      brand_name: "",
      generic_name: "",
      batch_no: "",
      manufacture_date: "",
      unit: "",
      price: "",
      stock: "",
      expire_date: "",
      // barcode: "",
      department: "",
      // imageFile: null,
    });
    setEditingMedicine(null);
  };

  const resetUnitForm = () => {
    setUnitFormData({ id: "", code: "", name: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMedicine) {
      console.log(editingMedicine);
      try {
        await UpdateMedicine({
          id: editingMedicine.id,
          code_no: formData.code_no,
          brand_name: formData.brand_name,
          generic_name: formData.generic_name,
          batch_no: formData.batch_no,
          manufacture_date: formData.manufacture_date,
          expire_date: formData.expire_date,
          price: formData.price,
          stock: Number.parseInt(formData.stock),
          department: formData.unit,
        }).unwrap();
        toast.success("Medicine updated successfully");
        refetchMeds();
      } catch (error) {
        toast.error("Failed to update medicine");
      }
    } else {
      const newMed = {
        code_no: formData.code_no,
        brand_name: formData.brand_name,
        generic_name: formData.generic_name,
        batch_no: formData.batch_no,
        manufacture_date: formData.manufacture_date,
        expire_date: formData.expire_date,
        price: formData.price,
        stock: Number.parseInt(formData.stock),
        department: formData.unit,
      };

      console.log("creating medicine", newMed);
      try {
        await CreateMedicine(newMed).unwrap();
        toast.success("Medicine added successfully");
        refetchMeds();
      } catch (error) {
        toast.error("Failed to add medicine");
      }
    }
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      code_no: medicine.code_no,
      brand_name: medicine.brand_name,
      generic_name: medicine.generic_name || "",
      batch_no: medicine.batch_no,
      manufacture_date: medicine.manufacture_date,
      unit: medicine.code_no,
      price: medicine.price.toString(),
      stock: medicine.stock.toString(),
      expire_date: medicine.expire_date.split("T")[0],
      department: medicine.department.toString(),
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (medicineCode: string) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      try {
        await DeleteMedicine(medicineCode).unwrap();
        toast.success("Medicine deleted successfully");
        refetchMeds();
      } catch (error) {
        toast.error("Failed to delete medicine");
      }
    }
  };

  const handleRefill = (medicine: Medicine) => {
    setRefillingMedicine(medicine);
    setRefillFormData({
      quantity: "",
      refill_date: new Date().toISOString().split("T")[0],
      end_date: "",
      batch_no: "",
      medicine: medicine.id,
      department: medicine.department,
      manufacture_date: "",
      expire_date: "",
      price: medicine.price,
    });
    setIsRefillDialogOpen(true);
  };

  const handleRefillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refillingMedicine) return;
    console.log("refillFormData", refillFormData);
    try {
      await createRefill({
        medicine: refillFormData.medicine,
        quantity: Number.parseInt(refillFormData.quantity),
        batch_no: refillFormData.batch_no,
        department: refillFormData.department,
        manufacture_date: refillFormData.manufacture_date,
        expire_date: refillFormData.expire_date,
        price: refillFormData.price,
      }).unwrap();
      refetchRefills();
      refetchMeds();
      toast.success("Refill added successfully");
      refetchMeds();
      setIsRefillDialogOpen(false);
      setRefillingMedicine(null);
    } catch (error) {
      toast.error("Failed to add refill");
      console.error("Refill error:", error);
    }
  };

  const handleHistory = (medicine: Medicine) => {
    setHistoryMedicine(medicine);
    setIsHistoryDialogOpen(true);
  };

  const handleUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCategory: Unit = {
      id: unitFormData.id,
      code: unitFormData.code,
      name: unitFormData.name,
    };
    console.log(newCategory);
    const res = await AddUnit(newCategory).unwrap();
    refetch();
    if (res) {
      toast.success("Unit added successfully");
    }
    setIsAddUnitDialogOpen(false);
    setUnitFormData({ id: "", code: "", name: "" });
  };

  const getCategoryName = (categoryId: string) => {
    return (
      Units?.results.find((unit) => unit.id === categoryId)
        ?.name || "Unknown"
    );
  };

  const handleExport = () => {
    const data = filteredMedicines.map(med => ({
      'Medicine Name': med.brand_name,
      'Generic Name': med.generic_name || '',
      'Code No': med.code_no,
      'Unit': getCategoryName(med.department.toString()),
      'Batch': med.batch_no,
      'Price': med.price,
      'Stock': med.stock,
      'Expiry Date': new Date(med.expire_date).toLocaleDateString(),
      'Status': getExpiryStatus(new Date(med.expire_date)).label,
      'Refills': med.refill_count
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Medicines');
    XLSX.writeFile(wb, 'medicines.xlsx');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-background via-card to-background dark:from-background dark:via-card dark:to-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-md dark:from-primary dark:to-secondary">
        <div className="flex h-16 items-center justify-between px-6 w-full">
          <div className="hidden md:flex items-center gap-4">
            <h1 className="md:text-3xl text-lg font-extrabold text-white tracking-wide">
              Medicine Management
            </h1>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medicine
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingMedicine
                        ? "Update medicine information"
                        : "Enter the details for the new medicine"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="brand_name">Medicine Name *</Label>
                          <Input
                            id="brand_name"
                            value={formData.brand_name}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                brand_name: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="genericName">
                            Generic Name (Optional)
                          </Label>
                          <Input
                            id="genericName"
                            value={formData.generic_name}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                generic_name: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="batchNumber">Batch Number *</Label>
                          <Input
                            id="batchNumber"
                            value={formData.batch_no}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                batch_no: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>{" "}
                        <div className="space-y-2">
                          <Label htmlFor="code_no">Code Number *</Label>
                          <Input
                            id="code_no"
                            value={formData.code_no}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                code_no: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="manufactureDate">
                            Manufacture Date *
                          </Label>
                          <Input
                            id="manufactureDate"
                            type="date"
                            value={formData.manufacture_date}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                manufacture_date: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unit">Unit *</Label>
                          <Select
                            value={formData.unit}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                unit: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {Units?.results.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id.toString()}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Price (Birr) *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                price: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stockQuantity">
                            Stock Quantity *
                          </Label>
                          <Input
                            id="stockQuantity"
                            type="number"
                            value={formData.stock}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                stock: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            type="date"
                            value={formData.expire_date}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                expire_date: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                      {/* <div className="space-y-2">
                        <Label htmlFor="barcode">Barcode (Optional)</Label>
                        <Input
                          id="barcode"
                          value={formData.barcode}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              barcode: e.target.value,
                            }))
                          }
                          placeholder="Enter barcode number"
                        />
                      </div> */}
                      {/* <div className="space-y-2">
                        <Label htmlFor="imageFile">Image File (Optional)</Label>
                        <input
                          id="imageFile"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              imageFile: e.target.files?.[0] || null,
                            }))
                          }
                        />
                      </div> */}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreating}>
                        {editingMedicine ? "Update Medicine" : "Add Medicine"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Sheet open={isUnitSheetOpen} onOpenChange={setIsUnitSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">View Unit</Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-full sm:w-[540px] max-w-full sm:max-w-[540px]"
                >
                  <SheetHeader>
                    <SheetTitle>Unit Management</SheetTitle>
                    <SheetDescription>
                      View and manage units for medicines
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Units?.results.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell className="font-mono">
                              {unit.code}
                            </TableCell>
                            <TableCell>
                              {inlineEditingUnit === unit.id ? (
                                <div className="flex flex-col sm:flex-row gap-2 w-full">
                                  <Input
                                    value={inlineEditData.code}
                                    onChange={(e) =>
                                      setInlineEditData((prev) => ({
                                        ...prev,
                                        code: e.target.value,
                                      }))
                                    }
                                    placeholder="Code"
                                    className="w-full sm:w-24 border-border"
                                  />
                                  <Input
                                    value={inlineEditData.name}
                                    onChange={(e) =>
                                      setInlineEditData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                      }))
                                    }
                                    placeholder="Name"
                                    className="flex-1 border-border"
                                  />
                                  <div className="flex gap-2 justify-end sm:justify-start">
                                    <Button
                                      // variant="outline"
                                      className="bg-primary hover:bg-primary/80 text-white"
                                      size="sm"
                                      onClick={async () => {
                                        try {
                                          await UpdateUnit(
                                            inlineEditData
                                          ).unwrap();
                                          setInlineEditingUnit(null);
                                          setInlineEditData({
                                            id: "",
                                            code: "",
                                            name: "",
                                          });
                                          refetch();
                                          toast.success(
                                            "Unit updated successfully"
                                          );
                                        } catch (error) {
                                          toast.error("Failed to update unit");
                                          console.error(
                                            "Update unit error:",
                                            error
                                          );
                                        }
                                      }}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      className="bg-warning hover:bg-warning/80 text-white"
                                      size="sm"
                                      onClick={() => {
                                        setInlineEditingUnit(null);
                                        setInlineEditData({
                                          id: "",
                                          code: "",
                                          name: "",
                                        });
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                  <div>{unit.name}</div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setInlineEditingUnit(unit.id);
                                        setInlineEditData({
                                          id: unit.id,
                                          code: unit.code,
                                          name: unit.name,
                                        });
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        toast.custom(
                                          (t) => (
                                            <div className="bg-background  text-foreground border rounded-lg p-4 shadow-md flex flex-col gap-2 w-64">
                                              <p className="text-sm">
                                                Are you sure you want to delete{" "}
                                                <b>{unit.name}</b>?
                                              </p>
                                              <div className="flex justify-end gap-2">
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() =>
                                                    toast.dismiss(t)
                                                  }
                                                >
                                                  Cancel
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="destructive"
                                                  onClick={async () => {
                                                    try {
                                                      await DeleteUnit(
                                                        unit.id
                                                      ).unwrap();
                                                      toast.success(
                                                        "Unit deleted successfully"
                                                      );
                                                      refetch();
                                                      toast.dismiss(t);
                                                    } catch (error) {
                                                      toast.error(
                                                        "Failed to delete unit"
                                                      );
                                                      console.error(
                                                        "Delete unit error:",
                                                        error
                                                      );
                                                    } finally {
                                                      toast.dismiss(t);
                                                    }
                                                  }}
                                                >
                                                  Delete
                                                </Button>
                                              </div>
                                            </div>
                                          ),
                                          { duration: 20000 }
                                        );
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Pagination
                      currentPage={unitCurrentPage}
                      totalPages={Units?.pagination.totalPages || 1}
                      itemsPerPage={unitItemsPerPage}
                      onPageChange={setUnitCurrentPage}
                      onItemsPerPageChange={setUnitItemsPerPage}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <Dialog
                open={isAddUnitDialogOpen}
                onOpenChange={setIsAddUnitDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={resetUnitForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Unit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Unit</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new unit
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUnitSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="unitName">Unit Code *</Label>
                        <Input
                          id="UnitCode"
                          value={unitFormData.code}
                          onChange={(e) =>
                            setUnitFormData((prev) => ({
                              ...prev,
                              code: e.target.value,
                            }))
                          }
                          placeholder="Enter unit Code"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unitName">Unit Name *</Label>
                        <Input
                          id="unitName"
                          value={unitFormData.name}
                          onChange={(e) =>
                            setUnitFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter unit name"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddUnitDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isUnitAdding}>
                        Add Unit
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          )}

          {/* Refill Dialog */}
          <Dialog
            open={isRefillDialogOpen}
            onOpenChange={setIsRefillDialogOpen}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Refill Medicine</DialogTitle>
                <DialogDescription>
                  Add stock to {refillingMedicine?.brand_name}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRefillSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity to Add *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={refillFormData.quantity}
                      onChange={(e) =>
                        setRefillFormData((prev) => ({
                          ...prev,
                          quantity: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manufacture_date">
                      Manufuctured Date *
                    </Label>
                    <Input
                      id="manufacture_date"
                      type="date"
                      value={refillFormData.manufacture_date}
                      onChange={(e) =>
                        setRefillFormData((prev) => ({
                          ...prev,
                          manufacture_date: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expire_date">Expire Date (Optional)</Label>
                    <Input
                      id="expire_date"
                      type="date"
                      value={refillFormData.expire_date}
                      onChange={(e) =>
                        setRefillFormData((prev) => ({
                          ...prev,
                          expire_date: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (Birr) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="1.00"
                      value={refillFormData.price}
                      onChange={(e) =>
                        setRefillFormData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batch_number">Batch Number *</Label>
                    <Input
                      id="batch_no"
                      value={refillFormData.batch_no}
                      onChange={(e) =>
                        setRefillFormData((prev) => ({
                          ...prev,
                          batch_no: e.target.value,
                        }))
                      }
                      placeholder="Enter batch number"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRefillDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isRefilling}>
                    Refill
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* History Dialog */}
          <Dialog
            open={isHistoryDialogOpen}
            onOpenChange={setIsHistoryDialogOpen}
          >
            <DialogContent className="w-[95vw] sm:max-w-full lg:max-w-5xl">
              <DialogHeader>
                <DialogTitle>
                  Refill History - {historyMedicine?.brand_name}
                </DialogTitle>
                <DialogDescription>
                  View all refill records for this medicine
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 w-full overflow-x-auto">
                {(() => {
                  const medicineRefills =
                    refills?.results.filter(
                      (r) => r.medicine === historyMedicine?.id.toString()
                    ) || [];

                  return medicineRefills.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                      <Table className="min-w-[800px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Batch No</TableHead>
                            <TableHead>Manufactured Date</TableHead>
                            <TableHead>Refilled Quantity</TableHead>
                            <TableHead>Refill Date</TableHead>
                            <TableHead>Expire Date</TableHead>
                            <TableHead>Refilled By</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {medicineRefills.map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>{record.batch_no}</TableCell>
                              <TableCell>{record.manufacture_date}</TableCell>
                              <TableCell>{record.quantity}</TableCell>
                              <TableCell>
                                {new Date(
                                  record.refill_date
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {record.expire_date
                                  ? new Date(
                                      record.expire_date
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                {record.created_by_username}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No refill history available.
                    </p>
                  );
                })()}
              </div>

              <DialogFooter>
                <Button onClick={() => setIsHistoryDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-8xl mx-auto">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-border focus:border-ring"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-56 h-12 border-border focus:border-ring">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
              {Units?.results.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Alerts */}
        <div className="space-y-6 mb-8">
          {meds?.results &&
            meds.results.filter((med) => med.stock < 10).length > 0 && (
              <Alert className="border-destructive/20 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <AlertDescription className="text-destructive dark:text-destructive">
                  {meds.results.filter((med) => med.stock < 10).length}{" "}
                  medicines have low stock (below 10 units).
                </AlertDescription>
              </Alert>
            )}
          {meds?.results &&
            meds.results.filter((med) => {
              const today = new Date();
              const thirtyDaysFromNow = new Date(
                today.getTime() + 30 * 24 * 60 * 60 * 1000
              );
              const expireDate = new Date(med.expire_date);
              return expireDate <= thirtyDaysFromNow;
            }).length > 0 && (
              <Alert className="border-warning/20 bg-warning/5 dark:border-warning/40 dark:bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
                <AlertDescription className="text-warning dark:text-warning">
                  {
                    meds.results.filter((med) => {
                      const today = new Date();
                      const thirtyDaysFromNow = new Date(
                        today.getTime() + 30 * 24 * 60 * 60 * 1000
                      );
                      const expireDate = new Date(med.expire_date);
                      return expireDate <= thirtyDaysFromNow;
                    }).length
                  }{" "}
                  medicines are expiring within 30 days
                </AlertDescription>
              </Alert>
            )}
        </div>

        {/* Medicine Table */}
        <Card className="shadow-xl border-border">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 dark:from-muted/50 dark:to-muted/30">
            <CardTitle className="flex items-center gap-3 text-foreground">
              <Package className="h-6 w-6" />
              Medicine Inventory ({meds?.pagination.totalItems || 0})
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage your medicine inventory and track stock levels
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">Medicine</TableHead>
                    <TableHead className="text-foreground">Image</TableHead>
                    <TableHead className="text-foreground">Code No</TableHead>
                    <TableHead className="text-foreground">Unit</TableHead>
                    <TableHead className="text-foreground">Batch</TableHead>
                    <TableHead className="text-foreground">Price</TableHead>
                    <TableHead className="text-foreground">Stock</TableHead>
                    <TableHead className="text-foreground">Expiry</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    {canEdit && (
                      <TableHead className="text-foreground">Refills</TableHead>
                    )}
                    {canEdit && (
                      <TableHead className="text-foreground">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((medicine) => {
                    const stockStatus = getStockStatus(medicine.stock);
                    const expiryStatus = getExpiryStatus(
                      new Date(medicine.expire_date)
                    );

                    return (
                      <TableRow key={medicine.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <div className="font-semibold text-foreground">
                              {medicine.brand_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {medicine.generic_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {medicine.attachment ? (
                            <img
                              src={medicine.attachment}
                              alt={medicine.brand_name}
                              className="w-12 h-12 object-cover rounded-lg shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-foreground">
                          {medicine.code_no}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {getCategoryName(medicine.department.toString())}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {medicine.batch_no}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          Birr {parseFloat(medicine.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={stockStatus.variant}
                            className="font-medium"
                          >
                            {medicine.stock} units
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {new Date(
                              medicine.expire_date
                            ).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={expiryStatus.variant}
                            className="font-medium"
                          >
                            {expiryStatus.label}
                          </Badge>
                        </TableCell>
                        {canEdit && (
                          <TableCell className="text-foreground">{medicine.refill_count}</TableCell>
                        )}
                        {canEdit && (
                          <TableCell>
                            <div className="flex gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRefill(medicine)}
                                className="hover:bg-accent"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleHistory(medicine)}
                                className="hover:bg-accent"
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(medicine)}
                                className="hover:bg-accent"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(medicine.id)}
                                className="hover:bg-destructive/50 dark:hover:bg-destructive/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={meds?.pagination.totalPages || 1}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

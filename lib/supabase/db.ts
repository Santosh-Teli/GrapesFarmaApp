// lib/supabase/db.ts
// All CRUD operations for every table — replaces localStorage in use-store.ts

import { getSupabaseClient } from "./client";
import type {
  FarmRow,
  PlotRow,
  PesticideRow,
  LabourerRow,
  SprayRecordRow,
  SprayPesticideUsageRow,
  CuttingRecordRow,
  LabourWorkRow,
  OtherExpenseRow,
  PaymentRow,
} from "./types";
import type {
  Farm, Plot, Pesticide, Labour, SprayRecord,
  CuttingRecord, LabourWork, OtherExpense, Payment, PesticideUsage,
} from "@/types";

// ─── Mappers: DB Row → App Type ───────────────────────────────────────────────

export function mapFarm(row: FarmRow): Farm {
  return {
    id: row.id,
    name: row.name,
    ownerName: row.owner_name,
    totalAcres: row.total_acres,
    location: row.location,
    phone: row.phone,
    createdAt: row.created_at,
    ownerId: row.owner_id,
  };
}

export function mapPlot(row: PlotRow): Plot {
  return {
    id: row.id,
    farmId: row.farm_id,
    name: row.name,
    areaAcres: row.area_acres,
    grapeVariety: row.grape_variety,
    plantingYear: row.planting_year,
    isActive: row.is_active,
    userId: row.user_id,
  };
}

export function mapPesticide(row: PesticideRow): Pesticide {
  return {
    id: row.id,
    name: row.name,
    companyName: row.company_name,
    unitType: row.unit_type,
    pricePerUnit: row.price_per_unit,
    stockQuantity: row.stock_quantity,
    lowStockAlertLevel: row.low_stock_alert_level,
    isActive: row.is_active,
    userId: row.user_id,
  };
}

export function mapLabourer(row: LabourerRow): Labour {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender,
    phone: row.phone,
    perDaySalary: row.per_day_salary,
    skillType: row.skill_type,
    isActive: row.is_active,
    joiningDate: row.joining_date,
    userId: row.user_id,
  };
}

export function mapSprayRecord(
  row: SprayRecordRow,
  usages: SprayPesticideUsageRow[]
): SprayRecord {
  const pesticideDetails: PesticideUsage[] = usages.map((u) => ({
    pesticideId: u.pesticide_id,
    quantityUsed: u.quantity_used,
    priceAtTime: u.price_at_time,
    cost: u.cost,
  }));

  return {
    id: row.id,
    plotId: row.plot_id,
    sprayDate: row.spray_date,
    cropStage: row.crop_stage,
    weatherCondition: row.weather_condition,
    sprayReason: row.spray_reason,
    reasonDetail: row.reason_detail ?? undefined,
    waterMixedLitres: row.water_mixed_litres,
    labourUsed: row.labour_used,
    labourCount: row.labour_count,
    labourCost: row.labour_cost,
    pesticideDetails,
    totalPesticideCost: row.total_pesticide_cost,
    totalSprayCost: row.total_spray_cost,
    notes: row.notes ?? undefined,
    userId: row.user_id,
  };
}

export function mapCuttingRecord(row: CuttingRecordRow): CuttingRecord {
  return {
    id: row.id,
    plotId: row.plot_id,
    cuttingDate: row.cutting_date,
    cuttingType: row.cutting_type,
    labourCount: row.labour_count,
    maleLabourCount: row.male_labour_count,
    femaleLabourCount: row.female_labour_count,
    perDaySalary: row.per_day_salary,
    dayType: row.day_type,
    effectiveSalary: row.effective_salary,
    totalLabourCost: row.total_labour_cost,
    notes: row.notes ?? undefined,
    userId: row.user_id,
  };
}

export function mapLabourWork(row: LabourWorkRow): LabourWork {
  return {
    id: row.id,
    labourId: row.labour_id,
    workDate: row.work_date,
    workType: row.work_type,
    dayType: row.day_type,
    amount: row.amount,
    paymentStatus: row.payment_status,
    paymentDate: row.payment_date ?? undefined,
    paymentMode: row.payment_mode ?? undefined,
    referenceId: row.reference_id ?? undefined,
    notes: row.notes ?? undefined,
    userId: row.user_id,
  };
}

export function mapExpense(row: OtherExpenseRow): OtherExpense {
  return {
    id: row.id,
    expenseDate: row.expense_date,
    category: row.category,
    description: row.description,
    amount: row.amount,
    paymentStatus: row.payment_status,
    userId: row.user_id,
  };
}

export function mapPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    payeeType: row.payee_type,
    payeeId: row.payee_id ?? undefined,
    payeeName: row.payee_name,
    paymentDate: row.payment_date,
    amount: row.amount,
    paymentMode: row.payment_mode,
    referenceNumber: row.reference_number ?? undefined,
    purpose: row.purpose,
    linkedWorkIds: row.linked_work_ids,
    userId: row.user_id,
  };
}

// ─── FARMS ────────────────────────────────────────────────────────────────────

export async function getFarm(userId: string): Promise<Farm | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("farms")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return mapFarm(data);
}

export async function getAllFarms(): Promise<Farm[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("farms").select("*");
  if (error || !data) return [];
  return data.map(mapFarm);
}

export async function upsertFarm(farm: Farm): Promise<Farm | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("farms")
    .upsert({
      id: farm.id,
      owner_id: farm.ownerId,
      name: farm.name,
      owner_name: farm.ownerName,
      total_acres: farm.totalAcres,
      location: farm.location,
      phone: farm.phone,
    } as any)
    .select()
    .single();
  if (error || !data) return null;
  return mapFarm(data);
}

// ─── PLOTS ────────────────────────────────────────────────────────────────────

export async function getPlots(userId: string): Promise<Plot[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("plots")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");
  if (error || !data) return [];
  return data.map(mapPlot);
}

export async function getAllPlots(): Promise<Plot[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("plots").select("*").order("created_at");
  if (error || !data) return [];
  return data.map(mapPlot);
}

export async function upsertPlot(plot: Plot): Promise<Plot | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("plots")
    .upsert({
      id: plot.id,
      farm_id: plot.farmId,
      user_id: plot.userId,
      name: plot.name,
      area_acres: plot.areaAcres,
      grape_variety: plot.grapeVariety,
      planting_year: plot.plantingYear,
      is_active: plot.isActive,
    } as any)
    .select()
    .single();
  if (error || !data) return null;
  return mapPlot(data);
}

export async function deletePlot(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.from("plots").delete().eq("id", id);
}

// ─── PESTICIDES ───────────────────────────────────────────────────────────────

export async function getPesticides(userId: string): Promise<Pesticide[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("pesticides")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");
  if (error || !data) return [];
  return data.map(mapPesticide);
}

export async function getAllPesticides(): Promise<Pesticide[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("pesticides").select("*").order("created_at");
  if (error || !data) return [];
  return data.map(mapPesticide);
}

export async function upsertPesticide(pesticide: Pesticide): Promise<Pesticide | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("pesticides")
    .upsert({
      id: pesticide.id,
      user_id: pesticide.userId,
      name: pesticide.name,
      company_name: pesticide.companyName,
      unit_type: pesticide.unitType,
      price_per_unit: pesticide.pricePerUnit,
      stock_quantity: pesticide.stockQuantity,
      low_stock_alert_level: pesticide.lowStockAlertLevel,
      is_active: pesticide.isActive,
    } as any)
    .select()
    .single();
  if (error || !data) return null;
  return mapPesticide(data);
}

export async function deletePesticide(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.from("pesticides").delete().eq("id", id);
}

// ─── LABOURERS ────────────────────────────────────────────────────────────────

export async function getLabourers(userId: string): Promise<Labour[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("labourers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");
  if (error || !data) return [];
  return data.map(mapLabourer);
}

export async function getAllLabourers(): Promise<Labour[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("labourers").select("*").order("created_at");
  if (error || !data) return [];
  return data.map(mapLabourer);
}

export async function upsertLabourer(labour: Labour): Promise<Labour | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("labourers")
    .upsert({
      id: labour.id,
      user_id: labour.userId,
      name: labour.name,
      gender: labour.gender,
      phone: labour.phone,
      per_day_salary: labour.perDaySalary,
      skill_type: labour.skillType,
      is_active: labour.isActive,
      joining_date: labour.joiningDate,
    } as any)
    .select()
    .single();
  if (error || !data) return null;
  return mapLabourer(data);
}

export async function deleteLabourer(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.from("labourers").delete().eq("id", id);
}

// ─── SPRAY RECORDS ────────────────────────────────────────────────────────────

export async function getSprayRecords(userId: string): Promise<SprayRecord[]> {
  const supabase = getSupabaseClient();
  const { data: rows, error } = await supabase
    .from("spray_records")
    .select("*, spray_pesticide_usages(*)")
    .eq("user_id", userId)
    .order("spray_date", { ascending: false });
  if (error || !rows) return [];

  return rows.map((row: any) =>
    mapSprayRecord(row, row.spray_pesticide_usages ?? [])
  );
}

export async function getAllSprayRecords(): Promise<SprayRecord[]> {
  const supabase = getSupabaseClient();
  const { data: rows, error } = await supabase
    .from("spray_records")
    .select("*, spray_pesticide_usages(*)")
    .order("spray_date", { ascending: false });
  if (error || !rows) return [];
  return rows.map((row: any) =>
    mapSprayRecord(row, row.spray_pesticide_usages ?? [])
  );
}

export async function createSprayRecord(record: SprayRecord): Promise<SprayRecord | null> {
  const supabase = getSupabaseClient();

  // 1. Insert spray record
  const { data: sprayRow, error: sprayError } = await (supabase
    .from("spray_records")
    .insert({
      id: record.id,
      user_id: record.userId,
      plot_id: record.plotId,
      spray_date: record.sprayDate,
      crop_stage: record.cropStage,
      weather_condition: record.weatherCondition,
      spray_reason: record.sprayReason,
      reason_detail: record.reasonDetail ?? null,
      water_mixed_litres: record.waterMixedLitres,
      labour_used: record.labourUsed,
      labour_count: record.labourCount,
      labour_cost: record.labourCost,
      total_pesticide_cost: record.totalPesticideCost,
      total_spray_cost: record.totalSprayCost,
      notes: record.notes ?? null,
    } as any)
    .select()
    .single() as any);

  if (sprayError || !sprayRow) return null;

  // 2. Insert pesticide usages
  if (record.pesticideDetails.length > 0) {
    await supabase.from("spray_pesticide_usages").insert(
      record.pesticideDetails.map((u) => ({
        spray_record_id: sprayRow.id,
        pesticide_id: u.pesticideId,
        quantity_used: u.quantityUsed,
        price_at_time: u.priceAtTime,
        cost: u.cost,
      })) as any
    );
  }

  return mapSprayRecord(sprayRow, []);
}

export async function updateSprayRecord(record: SprayRecord): Promise<void> {
  const supabase = getSupabaseClient();

    await (supabase.from("spray_records") as any)
    .update({
      plot_id: record.plotId,
      spray_date: record.sprayDate,
      crop_stage: record.cropStage,
      weather_condition: record.weatherCondition,
      spray_reason: record.sprayReason,
      reason_detail: record.reasonDetail ?? null,
      water_mixed_litres: record.waterMixedLitres,
      labour_used: record.labourUsed,
      labour_count: record.labourCount,
      labour_cost: record.labourCost,
      total_pesticide_cost: record.totalPesticideCost,
      total_spray_cost: record.totalSprayCost,
      notes: record.notes ?? null,
    })
    .eq("id", record.id);

  // Replace pesticide usages
  await supabase.from("spray_pesticide_usages").delete().eq("spray_record_id", record.id);
  if (record.pesticideDetails.length > 0) {
    await supabase.from("spray_pesticide_usages").insert(
      record.pesticideDetails.map((u) => ({
        spray_record_id: record.id,
        pesticide_id: u.pesticideId,
        quantity_used: u.quantityUsed,
        price_at_time: u.priceAtTime,
        cost: u.cost,
      })) as any
    );
  }
}

export async function deleteSprayRecord(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.from("spray_records").delete().eq("id", id);
}

// ─── CUTTING RECORDS ──────────────────────────────────────────────────────────

export async function getCuttingRecords(userId: string): Promise<CuttingRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("cutting_records")
    .select("*")
    .eq("user_id", userId)
    .order("cutting_date", { ascending: false });
  if (error || !data) return [];
  return data.map(mapCuttingRecord);
}

export async function getAllCuttingRecords(): Promise<CuttingRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("cutting_records")
    .select("*")
    .order("cutting_date", { ascending: false });
  if (error || !data) return [];
  return data.map(mapCuttingRecord);
}

export async function upsertCuttingRecord(record: CuttingRecord): Promise<CuttingRecord | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("cutting_records")
    .upsert({
      id: record.id,
      user_id: record.userId,
      plot_id: record.plotId,
      cutting_date: record.cuttingDate,
      cutting_type: record.cuttingType,
      labour_count: record.labourCount,
      male_labour_count: record.maleLabourCount,
      female_labour_count: record.femaleLabourCount,
      per_day_salary: record.perDaySalary,
      day_type: record.dayType,
      effective_salary: record.effectiveSalary,
      total_labour_cost: record.totalLabourCost,
      notes: record.notes ?? null,
    } as any)
    .select()
    .single();
  if (error || !data) return null;
  return mapCuttingRecord(data);
}

export async function deleteCuttingRecord(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.from("cutting_records").delete().eq("id", id);
}

// ─── LABOUR WORK ──────────────────────────────────────────────────────────────

export async function getLabourWork(userId: string): Promise<LabourWork[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("labour_work")
    .select("*")
    .eq("user_id", userId)
    .order("work_date", { ascending: false });
  if (error || !data) return [];
  return data.map(mapLabourWork);
}

export async function getAllLabourWork(): Promise<LabourWork[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("labour_work")
    .select("*")
    .order("work_date", { ascending: false });
  if (error || !data) return [];
  return data.map(mapLabourWork);
}

export async function upsertLabourWork(work: LabourWork): Promise<LabourWork | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("labour_work")
    .upsert({
      id: work.id,
      user_id: work.userId,
      labour_id: work.labourId,
      work_date: work.workDate,
      work_type: work.workType,
      day_type: work.dayType,
      amount: work.amount,
      payment_status: work.paymentStatus,
      payment_date: work.paymentDate ?? null,
      payment_mode: work.paymentMode ?? null,
      reference_id: work.referenceId ?? null,
      notes: work.notes ?? null,
    } as any)
    .select()
    .single();
  if (error || !data) return null;
  return mapLabourWork(data);
}

export async function deleteLabourWork(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.from("labour_work").delete().eq("id", id);
}

// ─── OTHER EXPENSES ───────────────────────────────────────────────────────────

export async function getExpenses(userId: string): Promise<OtherExpense[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("other_expenses")
    .select("*")
    .eq("user_id", userId)
    .order("expense_date", { ascending: false });
  if (error || !data) return [];
  return data.map(mapExpense);
}

export async function getAllExpenses(): Promise<OtherExpense[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("other_expenses")
    .select("*")
    .order("expense_date", { ascending: false });
  if (error || !data) return [];
  return data.map(mapExpense);
}

export async function upsertExpense(expense: OtherExpense): Promise<OtherExpense | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("other_expenses")
    .upsert({
      id: expense.id,
      user_id: expense.userId,
      expense_date: expense.expenseDate,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      payment_status: expense.paymentStatus,
    } as any)
    .select()
    .single();
  if (error || !data) return null;
  return mapExpense(data);
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.from("other_expenses").delete().eq("id", id);
}

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────

export async function getPayments(userId: string): Promise<Payment[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("payment_date", { ascending: false });
  if (error || !data) return [];
  return data.map(mapPayment);
}

export async function getAllPayments(): Promise<Payment[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("payment_date", { ascending: false });
  if (error || !data) return [];
  return data.map(mapPayment);
}

export async function upsertPayment(payment: Payment): Promise<Payment | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("payments")
    .upsert({
      id: payment.id,
      user_id: payment.userId,
      payee_type: payment.payeeType,
      payee_id: payment.payeeId ?? null,
      payee_name: payment.payeeName,
      payment_date: payment.paymentDate,
      amount: payment.amount,
      payment_mode: payment.paymentMode,
      reference_number: payment.referenceNumber ?? null,
      purpose: payment.purpose,
      linked_work_ids: payment.linkedWorkIds,
    } as any)
    .select()
    .single();
  if (error || !data) return null;
  return mapPayment(data);
}

export async function deletePayment(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.from("payments").delete().eq("id", id);
}

// ==========================================
// FEEDBACK
// ==========================================
export async function createFeedback(userId: string, message: string) {
  const supabase = getSupabaseClient() as any;
  const { error } = await supabase
    .from("user_feedbacks")
    .insert({ user_id: userId, message });
  if (error) throw error;
}

export async function getAllFeedbacks() {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from("user_feedbacks")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  
  return data.map((d: any) => ({
    id: d.id,
    userId: d.user_id,
    message: d.message,
    status: d.status,
    createdAt: d.created_at,
    userFullName: d.profiles?.full_name,
    userEmail: d.profiles?.email,
  }));
}

export async function updateFeedbackStatus(id: string, status: "UNREAD" | "READ" | "RESOLVED") {
  const supabase = getSupabaseClient() as any;
  const { error } = await supabase
    .from("user_feedbacks")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

// ==========================================
// PRODUCT SALES
// ==========================================
export async function getSales(userId: string) {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from("product_sales")
    .select("*")
    .eq("user_id", userId)
    .order("sale_date", { ascending: false });
  if (error || !data) return [];
  
  return data.map((d: any) => ({
    id: d.id,
    productName: d.product_name,
    saleDate: d.sale_date,
    quantity: d.quantity,
    unit: d.unit as "KG" | "Quintal" | "Ton",
    ratePerUnit: d.rate_per_unit,
    totalIncome: d.total_income
  }));
}

export async function upsertSale(userId: string, sale: any) {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from("product_sales")
    .upsert({
      id: sale.id,
      user_id: userId,
      product_name: sale.productName,
      sale_date: sale.saleDate,
      quantity: sale.quantity,
      unit: sale.unit,
      rate_per_unit: sale.ratePerUnit,
      total_income: sale.totalIncome
    })
    .select()
    .single();
  if (error || !data) throw error;
  
  return {
    id: data.id,
    productName: data.product_name,
    saleDate: data.sale_date,
    quantity: data.quantity,
    unit: data.unit as "KG" | "Quintal" | "Ton",
    ratePerUnit: data.rate_per_unit,
    totalIncome: data.total_income
  };
}

export async function deleteSale(id: string) {
  const supabase = getSupabaseClient() as any;
  const { error } = await supabase.from("product_sales").delete().eq("id", id);
  if (error) throw error;
}

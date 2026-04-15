"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Farm, Plot, Pesticide, Labour, SprayRecord,
  CuttingRecord, LabourWork, OtherExpense, Payment,
} from "@/types";
import {
  getFarm, getAllFarms, upsertFarm,
  getPlots, getAllPlots, upsertPlot, deletePlot,
  getPesticides, getAllPesticides, upsertPesticide, deletePesticide,
  getLabourers, getAllLabourers, upsertLabourer, deleteLabourer,
  getSprayRecords, getAllSprayRecords, createSprayRecord, updateSprayRecord, deleteSprayRecord,
  getCuttingRecords, getAllCuttingRecords, upsertCuttingRecord, deleteCuttingRecord,
  getLabourWork, getAllLabourWork, upsertLabourWork, deleteLabourWork,
  getExpenses, getAllExpenses, upsertExpense, deleteExpense,
  getPayments, getAllPayments, upsertPayment, deletePayment,
} from "@/lib/supabase/db";

export function useStore() {
  const { user, isAuthenticated, viewingUserId } = useAuthStore();

  const isAdmin = user?.role === "ADMIN";
  const currentUserId = isAdmin && viewingUserId ? viewingUserId : user?.id;
  const isImpersonating = isAdmin && !!viewingUserId;

  // ─── Local state ────────────────────────────────────────────────────────────
  const [farm, setFarmState] = useState<Farm | null>(null);
  const [plots, setPlotsState] = useState<Plot[]>([]);
  const [pesticides, setPesticidesState] = useState<Pesticide[]>([]);
  const [labourers, setLabourersState] = useState<Labour[]>([]);
  const [sprayRecords, setSprayRecordsState] = useState<SprayRecord[]>([]);
  const [cuttingRecords, setCuttingRecordsState] = useState<CuttingRecord[]>([]);
  const [labourWork, setLabourWorkState] = useState<LabourWork[]>([]);
  const [expenses, setExpensesState] = useState<OtherExpense[]>([]);
  const [payments, setPaymentsState] = useState<Payment[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // ─── Fetch all data when auth/user changes ─────────────────────────────────
  const loadData = useCallback(async () => {
    if (!isAuthenticated || !currentUserId) return;

    try {
      const [
        farmData,
        plotsData,
        pesticidesData,
        labourersData,
        sprayData,
        cuttingData,
        workData,
        expensesData,
        paymentsData,
      ] = await Promise.all([
        isAdmin && !isImpersonating ? getAllFarms().then((f) => f[0] ?? null) : getFarm(currentUserId),
        isAdmin && !isImpersonating ? getAllPlots() : getPlots(currentUserId),
        isAdmin && !isImpersonating ? getAllPesticides() : getPesticides(currentUserId),
        isAdmin && !isImpersonating ? getAllLabourers() : getLabourers(currentUserId),
        isAdmin && !isImpersonating ? getAllSprayRecords() : getSprayRecords(currentUserId),
        isAdmin && !isImpersonating ? getAllCuttingRecords() : getCuttingRecords(currentUserId),
        isAdmin && !isImpersonating ? getAllLabourWork() : getLabourWork(currentUserId),
        isAdmin && !isImpersonating ? getAllExpenses() : getExpenses(currentUserId),
        isAdmin && !isImpersonating ? getAllPayments() : getPayments(currentUserId),
      ]);

      setFarmState(farmData);
      setPlotsState(plotsData);
      setPesticidesState(pesticidesData);
      setLabourersState(labourersData);
      setSprayRecordsState(sprayData);
      setCuttingRecordsState(cuttingData);
      setLabourWorkState(workData);
      setExpensesState(expensesData);
      setPaymentsState(paymentsData);
    } catch (err) {
      console.error("useStore: failed to load data from Supabase", err);
    } finally {
      setIsInitialized(true);
    }
  }, [isAuthenticated, currentUserId, isAdmin, isImpersonating]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Setters (write to Supabase + update local state) ─────────────────────

  const setFarm = async (newFarm: Farm) => {
    const saved = await upsertFarm(newFarm);
    if (saved) setFarmState(saved);
  };

  const setPlots = async (newPlots: Plot[]) => {
    const currentIds = plots.map(p => p.id);
    const newIds = newPlots.map(p => p.id);
    const deletedIds = currentIds.filter(id => !newIds.includes(id));
    await Promise.all(deletedIds.map(id => deletePlot(id)));
    await Promise.all(newPlots.map((p) => upsertPlot({ ...p, userId: currentUserId! })));
    setPlotsState(newPlots.map((p) => ({ ...p, userId: currentUserId! })));
  };

  const setPesticides = async (newPesticides: Pesticide[]) => {
    const currentIds = pesticides.map(p => p.id);
    const newIds = newPesticides.map(p => p.id);
    const deletedIds = currentIds.filter(id => !newIds.includes(id));
    await Promise.all(deletedIds.map(id => deletePesticide(id)));
    await Promise.all(newPesticides.map((p) => upsertPesticide({ ...p, userId: currentUserId! })));
    setPesticidesState(newPesticides.map((p) => ({ ...p, userId: currentUserId! })));
  };

  const setLabourers = async (newLabourers: Labour[]) => {
    const currentIds = labourers.map(l => l.id);
    const newIds = newLabourers.map(l => l.id);
    const deletedIds = currentIds.filter(id => !newIds.includes(id));
    await Promise.all(deletedIds.map(id => deleteLabourer(id)));
    await Promise.all(newLabourers.map((l) => upsertLabourer({ ...l, userId: currentUserId! })));
    setLabourersState(newLabourers.map((l) => ({ ...l, userId: currentUserId! })));
  };

  const setSprayRecords = async (newRecords: SprayRecord[]) => {
    const currentIds = sprayRecords.map(r => r.id);
    const newIds = newRecords.map(r => r.id);
    const deletedIds = currentIds.filter(id => !newIds.includes(id));
    await Promise.all(deletedIds.map(id => deleteSprayRecord(id)));
    
    // For bulk replacement — upsert all
    await Promise.all(newRecords.map((r) =>
      sprayRecords.find((s) => s.id === r.id)
        ? updateSprayRecord({ ...r, userId: currentUserId! })
        : createSprayRecord({ ...r, userId: currentUserId! })
    ));
    setSprayRecordsState(newRecords.map((r) => ({ ...r, userId: currentUserId! })));
  };

  const setCuttingRecords = async (newRecords: CuttingRecord[]) => {
    const currentIds = cuttingRecords.map(r => r.id);
    const newIds = newRecords.map(r => r.id);
    const deletedIds = currentIds.filter(id => !newIds.includes(id));
    await Promise.all(deletedIds.map(id => deleteCuttingRecord(id)));
    await Promise.all(newRecords.map((r) => upsertCuttingRecord({ ...r, userId: currentUserId! })));
    setCuttingRecordsState(newRecords.map((r) => ({ ...r, userId: currentUserId! })));
  };

  const setLabourWork = async (newWork: LabourWork[]) => {
    const currentIds = labourWork.map(w => w.id);
    const newIds = newWork.map(w => w.id);
    const deletedIds = currentIds.filter(id => !newIds.includes(id));
    await Promise.all(deletedIds.map(id => deleteLabourWork(id)));
    await Promise.all(newWork.map((w) => upsertLabourWork({ ...w, userId: currentUserId! })));
    setLabourWorkState(newWork.map((w) => ({ ...w, userId: currentUserId! })));
  };

  const setExpenses = async (newExpenses: OtherExpense[]) => {
    const currentIds = expenses.map(e => e.id);
    const newIds = newExpenses.map(e => e.id);
    const deletedIds = currentIds.filter(id => !newIds.includes(id));
    await Promise.all(deletedIds.map(id => deleteExpense(id)));
    await Promise.all(newExpenses.map((e) => upsertExpense({ ...e, userId: currentUserId! })));
    setExpensesState(newExpenses.map((e) => ({ ...e, userId: currentUserId! })));
  };

  const setPayments = async (newPayments: Payment[]) => {
    const currentIds = payments.map(p => p.id);
    const newIds = newPayments.map(p => p.id);
    const deletedIds = currentIds.filter(id => !newIds.includes(id));
    await Promise.all(deletedIds.map(id => deletePayment(id)));
    await Promise.all(newPayments.map((p) => upsertPayment({ ...p, userId: currentUserId! })));
    setPaymentsState(newPayments.map((p) => ({ ...p, userId: currentUserId! })));
  };

  return {
    farm, setFarm,
    plots, setPlots,
    pesticides, setPesticides,
    labourers, setLabourers,
    sprayRecords, setSprayRecords,
    cuttingRecords, setCuttingRecords,
    labourWork, setLabourWork,
    expenses, setExpenses,
    payments, setPayments,
    isInitialized,
    isAdmin,
    isImpersonating,
    // Expose all-data helpers for admin
    allFarms: farm ? [farm] : [],
    allPlots: plots,
    allLabourers: labourers,
    allExpenses: expenses,
    allSprayRecords: sprayRecords,
    allCuttingRecords: cuttingRecords,
    allLabourWork: labourWork,
    allPesticides: pesticides,
    // Expose reload function
    reload: loadData,
    // Expose delete functions
    deletePlot,
    deletePesticide,
    deleteLabourer,
    deleteSprayRecord,
    deleteCuttingRecord,
    deleteLabourWork,
    deleteExpense,
    deletePayment,
  };
}

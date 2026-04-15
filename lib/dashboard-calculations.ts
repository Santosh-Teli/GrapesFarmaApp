import {
    SprayRecord, CuttingRecord, LabourWork, OtherExpense, Labour, Pesticide
} from "@/types";
import { isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";

interface DashboardData {
    sprayRecords: SprayRecord[];
    cuttingRecords: CuttingRecord[];
    labourWork: LabourWork[];
    expenses: OtherExpense[];
    labourers: Labour[];
    pesticides: Pesticide[];
}

export function calculateDashboardMetrics(data: DashboardData, dateRange: { from: Date; to: Date }) {
    const { sprayRecords, cuttingRecords, labourWork, expenses, labourers, pesticides } = data;
    const { from, to } = dateRange;

    // Helpers
    const filterByDate = (dateStr: string) => {
        const d = parseISO(dateStr);
        return isWithinInterval(d, { start: startOfDay(from), end: endOfDay(to) });
    };

    // Filter Data
    const filteredSpray = sprayRecords.filter(r => filterByDate(r.sprayDate));
    const filteredCutting = cuttingRecords.filter(r => filterByDate(r.cuttingDate));
    // Labour work not linked to spray/cutting (standalone) to avoid double counting costs?
    // Request says: "Total Labour Cost = SUM of all labourWork.amount WHERE referenceId is null"
    const filteredLabourWork = labourWork.filter(r => filterByDate(r.workDate));
    const filteredExpenses = expenses.filter(r => filterByDate(r.expenseDate));

    // 1. Total Pesticide Cost
    const totalPesticideCost = filteredSpray.reduce((sum, r) => sum + r.totalPesticideCost, 0);

    // 2. Total Cutting Cost (Labour included)
    const totalCuttingCost = filteredCutting.reduce((sum, r) => sum + r.totalLabourCost, 0);

    // 3. Total Labour Cost (Standalone)
    const standaloneLabourWork = filteredLabourWork.filter(r => !r.referenceId);
    const totalLabourCost = standaloneLabourWork.reduce((sum, r) => sum + r.amount, 0);

    // 4. Other Expenses
    const totalOtherExpense = filteredExpenses.reduce((sum, r) => sum + r.amount, 0);

    // 5. Total Expenses
    // Note: Spray record has totalSprayCost which includes labourCost. 
    // If we want "Total Labour Cost" to be separate, we should be careful.
    // User logic: "Total Expenses = Pesticide Cost + Cutting Cost + Labour Cost + Other Expense"
    // Pesticide Cost = only pesticides.
    // Cutting Cost = total cost of cutting (labour).
    // Labour Cost = standalone labour.
    // What about Spray Labour?
    // The user says: "Total Pesticide Cost = SUM of all sprayRecords.totalSprayCost". 
    // Wait, the user formula says: "Total Pesticide Cost = SUM of all sprayRecords.totalSprayCost".
    // But sprayRecords.totalSprayCost usually implies Pesticide + Labour.
    // Let's re-read carefully: 
    // "Total Pesticide Cost = SUM of all sprayRecords.totalSprayCost in date range"
    // "totalSprayCost: { pesticide + labour }" defined in Data Models section.
    // So "Total Pesticide Cost" card name is slightly misleading if it includes spray labour, OR the user meant "Total Spray Cost".
    // Actually, later in Summary Table it says:
    // "Total Pesticide Cost | ₹XX,XXX"
    // "Total Labour Cost | ₹XX,XXX"
    // "Total Cutting Cost | ₹XX,XXX"
    // It seems the user wants:
    // - Spray Cost (Pesticide + Spray Labour)
    // - Cutting Cost (Cutting Labour)
    // - General Labour Cost (Standalone Labour)
    // - Other Expense
    //
    // BUT, let's look at Calculation logic again:
    // "Total Pesticide Cost = SUM of all sprayRecords.totalSprayCost" -> This definitely includes spray labour if per model.
    // "Total Labour Cost = SUM of all labourWork.amount WHERE referenceId is null" -> Standalone.
    //
    // So:
    // Spray Cost (labeled "Total Pesticide Cost" by user) = Total Spray Cost.
    // Cutting Cost = Total Cutting Cost.
    // Labour Cost = Standalone Labour Cost.
    // Other Expense.

    const metricPesticideCost = filteredSpray.reduce((sum, r) => sum + r.totalSprayCost, 0);

    const grandTotal = metricPesticideCost + totalCuttingCost + totalLabourCost + totalOtherExpense;

    // 6. Paid Amount
    // "SUM of labourWork.amount WHERE paymentStatus='Paid' + SUM of otherExpenses.amount WHERE paymentStatus='Paid'"
    // This sums up ALL labour work paid (including spray/cutting if they are in labourWork).
    // Note: Data model has `linkedWorkIds` in Payment. 
    // We should rely on `paymentStatus` in `labourWork` and `otherExpenses`.
    const paidLabour = filteredLabourWork.filter(r => r.paymentStatus === "Paid").reduce((sum, r) => sum + r.amount, 0);
    const paidExpenses = filteredExpenses.filter(r => r.paymentStatus === "Paid").reduce((sum, r) => sum + r.amount, 0);
    const totalPaid = paidLabour + paidExpenses;

    // 7. Pending Payments
    const pendingLabour = filteredLabourWork.filter(r => r.paymentStatus === "Not_Paid").reduce((sum, r) => sum + r.amount, 0);
    const pendingExpenses = filteredExpenses.filter(r => r.paymentStatus === "Pending").reduce((sum, r) => sum + r.amount, 0);
    const totalPending = pendingLabour + pendingExpenses;

    // 8. Total Working Days
    // COUNT of unique workDate in labourWork
    const uniqueDates = new Set(filteredLabourWork.map(r => r.workDate));
    const totalWorkingDays = uniqueDates.size;

    // 9. Active Labourers
    const activeLabourers = labourers.filter(l => l.isActive).length;

    // Charts
    // Pie: Category breakdown
    const categoryData = [
        { name: "Spray", value: metricPesticideCost, color: "#10b981" }, // emerald-500
        { name: "Cutting", value: totalCuttingCost, color: "#8b5cf6" }, // violet-500
        { name: "Labour", value: totalLabourCost, color: "#f59e0b" }, // amber-500
        { name: "Other", value: totalOtherExpense, color: "#3b82f6" }, // blue-500
    ];

    // Bar: Monthly expense (last 6 months, ignoring filter for this chart usually, but user said "Last 6 months")
    // We need to calculate this separately from the date filter usually, or if filter is "This Year".
    // For now, allow passing full data for monthly chart? 
    // Let's just return helpers/raw data or calculate it here using ALL records?
    // The user requirement says "Row 3 ... Bar chart ... for the last 6 months". This implies it's fixed range.

    return {
        metrics: {
            totalPesticideCost: metricPesticideCost,
            totalCuttingCost,
            totalLabourCost,
            totalOtherExpense,
            grandTotal,
            totalPaid,
            totalPending,
            totalWorkingDays,
            activeLabourers
        },
        charts: {
            categoryData
        }
    };
}

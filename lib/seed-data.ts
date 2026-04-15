import {
    Farm, Plot, Pesticide, Labour, SprayRecord, CuttingRecord, LabourWork, OtherExpense, Payment,
    PesticideUsage
} from "@/types";
import { subDays, format } from "date-fns";

// Helper to get date string
const getDate = (daysAgo: number) => format(subDays(new Date(), daysAgo), "yyyy-MM-dd");

export const getSeedFarm = (userId: string, fullName: string, phone: string = "", location: string = ""): Farm => ({
    id: `farm_${userId}`,
    name: `${fullName}'s Farm`,
    ownerName: fullName,
    totalAcres: 12,
    location: location,
    phone: phone,
    createdAt: getDate(365),
    ownerId: userId
});

export const getSeedPlots = (userId: string): Plot[] => [
    { id: `plot_${userId}_1`, farmId: `farm_${userId}`, name: "Plot A", areaAcres: 4, grapeVariety: "Thompson Seedless", plantingYear: "2018", isActive: true, userId },
    { id: `plot_${userId}_2`, farmId: `farm_${userId}`, name: "Plot B", areaAcres: 3, grapeVariety: "Sharad Seedless", plantingYear: "2019", isActive: true, userId },
    { id: `plot_${userId}_3`, farmId: `farm_${userId}`, name: "Plot C", areaAcres: 5, grapeVariety: "Flame Seedless", plantingYear: "2020", isActive: true, userId },
];

export const getSeedPesticides = (userId: string): Pesticide[] => [
    { id: `pest_${userId}_1`, name: "Mancozeb", companyName: "Indofil", unitType: "gram", pricePerUnit: 3, stockQuantity: 5000, lowStockAlertLevel: 500, isActive: true, userId },
    { id: `pest_${userId}_2`, name: "Carbendazim", companyName: "BASF", unitType: "gram", pricePerUnit: 8, stockQuantity: 2000, lowStockAlertLevel: 300, isActive: true, userId },
    { id: `pest_${userId}_3`, name: "Imidacloprid", companyName: "Bayer", unitType: "ml", pricePerUnit: 5, stockQuantity: 3000, lowStockAlertLevel: 500, isActive: true, userId },
    { id: `pest_${userId}_4`, name: "Sulphur WDG", companyName: "UPL", unitType: "gram", pricePerUnit: 4, stockQuantity: 4000, lowStockAlertLevel: 600, isActive: true, userId },
    { id: `pest_${userId}_5`, name: "Copper Oxychloride", companyName: "Tata", unitType: "gram", pricePerUnit: 6, stockQuantity: 1500, lowStockAlertLevel: 200, isActive: true, userId },
    { id: `pest_${userId}_6`, name: "Gibberellic Acid", companyName: "Sumitomo", unitType: "gram", pricePerUnit: 120, stockQuantity: 100, lowStockAlertLevel: 20, isActive: true, userId },
];

export const getSeedLabour = (userId: string): Labour[] => [
    { id: `lab_${userId}_1`, name: "Ramesh Jadhav", gender: "Male", phone: "9000000001", perDaySalary: 500, skillType: "General", isActive: true, joiningDate: getDate(300), userId },
    { id: `lab_${userId}_2`, name: "Sunita Pawar", gender: "Female", phone: "9000000002", perDaySalary: 400, skillType: "Cutting", isActive: true, joiningDate: getDate(280), userId },
    { id: `lab_${userId}_3`, name: "Deepak Shinde", gender: "Male", phone: "9000000003", perDaySalary: 550, skillType: "Spraying", isActive: true, joiningDate: getDate(250), userId },
];

export const getSeedSprayRecords = (userId: string, plots: Plot[], pesticides: Pesticide[]): SprayRecord[] => 
  Array.from({ length: 15 }).map((_, i) => {
    const date = getDate(i * 5 + 2);
    const pesticide = pesticides[i % pesticides.length];
    const qty = 100 + (i * 20);
    const cost = qty * pesticide.pricePerUnit;
    const hasLabour = i % 3 === 0;

    return {
        id: `spray_${userId}_${i + 1}`,
        plotId: plots[i % plots.length].id,
        sprayDate: date,
        cropStage: i < 5 ? "Growth" : i < 10 ? "Flowering" : "Fruiting",
        weatherCondition: i % 4 === 0 ? "Cloudy" : "Sunny",
        sprayReason: i % 2 === 0 ? "Preventive" : "Pest",
        waterMixedLitres: 200,
        labourUsed: hasLabour,
        labourCount: hasLabour ? 2 : 0,
        labourCost: hasLabour ? 600 : 0,
        pesticideDetails: [{
            pesticideId: pesticide.id,
            quantityUsed: qty,
            priceAtTime: pesticide.pricePerUnit,
            cost: cost
        }],
        totalPesticideCost: cost,
        totalSprayCost: cost + (hasLabour ? 600 : 0),
        notes: `Scheduled spray #${i + 1}`,
        userId
    };
});

export const getSeedExpenses = (userId: string): OtherExpense[] => [
    { id: `exp_${userId}_1`, expenseDate: getDate(5), category: "Fuel", description: "Tractor Diesel", amount: 2500, paymentStatus: "Paid", userId },
    { id: `exp_${userId}_2`, expenseDate: getDate(15), category: "Fertilizer", description: "DAP bags", amount: 4500, paymentStatus: "Paid", userId },
    { id: `exp_${userId}_3`, expenseDate: getDate(25), category: "Tools", description: "New secateurs", amount: 1200, paymentStatus: "Paid", userId },
];

// Re-export original seeds for legacy compatibility if needed
export const SEED_FARM = getSeedFarm("admin_id", "Basavaraj Teli");
export const SEED_PLOTS = getSeedPlots("admin_id");
export const SEED_PESTICIDES = getSeedPesticides("admin_id");
export const SEED_LABOUR = getSeedLabour("admin_id");
export const SEED_SPRAY_RECORDS = getSeedSprayRecords("admin_id", SEED_PLOTS, SEED_PESTICIDES);
export const SEED_CUTTING_RECORDS: CuttingRecord[] = [];
export const SEED_LABOUR_WORK: LabourWork[] = [];
export const SEED_EXPENSES = getSeedExpenses("admin_id");
export const SEED_PAYMENTS: Payment[] = [];

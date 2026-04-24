import { create } from "zustand";
import { upsertSale as apiUpsertSale, deleteSale as apiDeleteSale } from "@/lib/supabase/db";

export type UnitType = "KG" | "Quintal" | "Ton";

export interface ProductSale {
    id: string;
    productName: string;
    saleDate: string;
    quantity: number;
    unit: UnitType;
    ratePerUnit: number;
    totalIncome: number;
}

interface RevenueState {
    sales: ProductSale[];
    isLoading: boolean;
    initSales: (sales: ProductSale[]) => void;
    addSale: (userId: string, sale: Omit<ProductSale, "id" | "totalIncome">) => Promise<void>;
    updateSale: (userId: string, id: string, sale: Partial<ProductSale>) => Promise<void>;
    deleteSale: (id: string) => Promise<void>;
}

export const useRevenueStore = create<RevenueState>()((set, get) => ({
    sales: [],
    isLoading: false,

    initSales: (sales) => {
        set({ sales });
    },

    addSale: async (userId, saleData) => {
        set({ isLoading: true });
        try {
            const newSale = {
                ...saleData,
                id: crypto.randomUUID(),
                totalIncome: saleData.quantity * saleData.ratePerUnit
            };
            const savedSale = await apiUpsertSale(userId, newSale);
            set({ sales: [...get().sales, savedSale] });
        } finally {
            set({ isLoading: false });
        }
    },

    updateSale: async (userId, id, updatedFields) => {
        set({ isLoading: true });
        try {
            const existing = get().sales.find(s => s.id === id);
            if (!existing) throw new Error("Sale not found");

            const updated = { ...existing, ...updatedFields };
            updated.totalIncome = updated.quantity * updated.ratePerUnit;

            const savedSale = await apiUpsertSale(userId, updated);
            
            set({
                sales: get().sales.map(s => s.id === id ? savedSale : s)
            });
        } finally {
            set({ isLoading: false });
        }
    },

    deleteSale: async (id) => {
        set({ isLoading: true });
        try {
            await apiDeleteSale(id);
            set({ sales: get().sales.filter(s => s.id !== id) });
        } finally {
            set({ isLoading: false });
        }
    }
}));

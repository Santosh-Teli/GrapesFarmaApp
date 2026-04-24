"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/authStore";
import { useRevenueStore, ProductSale } from "@/store/revenueStore";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useEffect } from "react";

const saleSchema = z.object({
    productName: z.string().min(1, "Product name is required"),
    saleDate: z.string().min(1, "Date is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    unit: z.enum(["KG", "Quintal", "Ton"]),
    ratePerUnit: z.number().min(0.01, "Rate must be greater than 0")
});

type SaleFormValues = z.infer<typeof saleSchema>;

interface SaleEntryFormProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: ProductSale | null;
}

export function SaleEntryForm({ isOpen, onClose, initialData }: SaleEntryFormProps) {
    const { user } = useAuthStore();
    const { addSale, updateSale, isLoading } = useRevenueStore();

    const form = useForm<SaleFormValues>({
        resolver: zodResolver(saleSchema),
        defaultValues: {
            productName: "",
            saleDate: new Date().toISOString().split('T')[0],
            quantity: 0,
            unit: "KG",
            ratePerUnit: 0
        }
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                productName: initialData.productName,
                saleDate: initialData.saleDate,
                quantity: initialData.quantity,
                unit: initialData.unit,
                ratePerUnit: initialData.ratePerUnit
            });
        } else {
            form.reset({
                productName: "",
                saleDate: new Date().toISOString().split('T')[0],
                quantity: 0,
                unit: "KG",
                ratePerUnit: 0
            });
        }
    }, [initialData, isOpen, form]);

    const onSubmit = async (data: SaleFormValues) => {
        if (!user?.id) return;
        try {
            if (initialData) {
                await updateSale(user.id, initialData.id, data);
                toast.success("Sale updated successfully!");
            } else {
                await addSale(user.id, data);
                toast.success("Sale added successfully!");
            }
            onClose();
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const q = form.watch("quantity");
    const r = form.watch("ratePerUnit");
    const totalIncome = (q || 0) * (r || 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Sale Entry" : "New Sale Entry"}
        >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Product Name</label>
                    <Input {...form.register("productName")} placeholder="e.g. Thompson Seedless" />
                    {form.formState.errors.productName && <span className="text-xs text-red-500">{form.formState.errors.productName.message}</span>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Sale Date</label>
                    <Input type="date" {...form.register("saleDate")} />
                    {form.formState.errors.saleDate && <span className="text-xs text-red-500">{form.formState.errors.saleDate.message}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Quantity</label>
                        <Input type="number" step="0.01" {...form.register("quantity", { valueAsNumber: true })} />
                        {form.formState.errors.quantity && <span className="text-xs text-red-500">{form.formState.errors.quantity.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Unit</label>
                        <select
                            className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                            {...form.register("unit")}
                        >
                            <option value="KG">KG</option>
                            <option value="Quintal">Quintal</option>
                            <option value="Ton">Ton</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Rate Per Unit (₹)</label>
                    <Input type="number" step="0.01" {...form.register("ratePerUnit", { valueAsNumber: true })} />
                    {form.formState.errors.ratePerUnit && <span className="text-xs text-red-500">{form.formState.errors.ratePerUnit.message}</span>}
                </div>

                <div className="bg-green-50 border border-green-200 p-3 rounded-md mt-4">
                    <p className="text-sm text-green-700 font-medium">Calculated Income</p>
                    <p className="text-xl font-bold text-green-900">₹ {totalIncome.toLocaleString('en-IN')}</p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Sale"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

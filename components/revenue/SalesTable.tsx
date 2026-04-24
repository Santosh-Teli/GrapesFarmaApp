"use client";

import { useRevenueStore, ProductSale } from "@/store/revenueStore";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SalesTableProps {
    sales: ProductSale[];
    onEdit: (sale: ProductSale) => void;
}

export function SalesTable({ sales, onEdit }: SalesTableProps) {
    const { deleteSale, isLoading } = useRevenueStore();

    if (sales.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg bg-muted/10 text-muted-foreground">
                No sales records found for this year.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b">
                    <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium">Quantity</th>
                        <th className="px-4 py-3 font-medium">Rate</th>
                        <th className="px-4 py-3 font-medium text-right">Total Income</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {sales.map(sale => (
                        <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                                {new Date(sale.saleDate).toLocaleDateString("en-IN")}
                            </td>
                            <td className="px-4 py-3 font-medium">{sale.productName}</td>
                            <td className="px-4 py-3">
                                {sale.quantity} <span className="text-xs text-muted-foreground">{sale.unit}</span>
                            </td>
                            <td className="px-4 py-3">{formatCurrency(sale.ratePerUnit)}</td>
                            <td className="px-4 py-3 font-semibold text-green-700 text-right">
                                {formatCurrency(sale.totalIncome)}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <Button variant="ghost" size="icon" onClick={() => onEdit(sale)} disabled={isLoading}>
                                    <Pencil className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => {
                                        if (confirm("Delete this sale record?")) deleteSale(sale.id);
                                    }}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

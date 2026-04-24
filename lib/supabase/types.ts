// lib/supabase/types.ts
// TypeScript types matching the Supabase database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          username: string;
          email: string;
          phone: string;
          role: "FARMER" | "ADMIN";
          status: "ACTIVE" | "SUSPENDED" | "PENDING";
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          username: string;
          email?: string;
          phone?: string;
          role?: "FARMER" | "ADMIN";
          status?: "ACTIVE" | "SUSPENDED" | "PENDING";
          created_at?: string;
        };
        Update: {
          full_name?: string;
          username?: string;
          email?: string;
          phone?: string;
          role?: "FARMER" | "ADMIN";
          status?: "ACTIVE" | "SUSPENDED" | "PENDING";
        };
      };
      farms: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          owner_name: string;
          total_acres: number;
          location: string;
          phone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          owner_name?: string;
          total_acres?: number;
          location?: string;
          phone?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          owner_name?: string;
          total_acres?: number;
          location?: string;
          phone?: string;
        };
      };
      plots: {
        Row: {
          id: string;
          farm_id: string;
          user_id: string;
          name: string;
          area_acres: number;
          grape_variety: string;
          planting_year: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          farm_id: string;
          user_id: string;
          name: string;
          area_acres?: number;
          grape_variety?: string;
          planting_year?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          area_acres?: number;
          grape_variety?: string;
          planting_year?: string;
          is_active?: boolean;
        };
      };
      pesticides: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          company_name: string;
          unit_type: "ml" | "gram" | "litre" | "kg";
          price_per_unit: number;
          stock_quantity: number;
          low_stock_alert_level: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          company_name?: string;
          unit_type: "ml" | "gram" | "litre" | "kg";
          price_per_unit?: number;
          stock_quantity?: number;
          low_stock_alert_level?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          company_name?: string;
          unit_type?: "ml" | "gram" | "litre" | "kg";
          price_per_unit?: number;
          stock_quantity?: number;
          low_stock_alert_level?: number;
          is_active?: boolean;
        };
      };
      labourers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          gender: "Male" | "Female";
          phone: string;
          per_day_salary: number;
          skill_type: "Spraying" | "Cutting" | "General" | "Multi-skill";
          is_active: boolean;
          joining_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          gender: "Male" | "Female";
          phone?: string;
          per_day_salary?: number;
          skill_type: "Spraying" | "Cutting" | "General" | "Multi-skill";
          is_active?: boolean;
          joining_date?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          gender?: "Male" | "Female";
          phone?: string;
          per_day_salary?: number;
          skill_type?: "Spraying" | "Cutting" | "General" | "Multi-skill";
          is_active?: boolean;
          joining_date?: string;
        };
      };
      spray_records: {
        Row: {
          id: string;
          user_id: string;
          plot_id: string;
          spray_date: string;
          crop_stage: "Flowering" | "Fruiting" | "Growth" | "Dormant";
          weather_condition: "Sunny" | "Rainy" | "Cloudy" | "Windy";
          spray_reason: "Disease" | "Pest" | "Preventive" | "Growth";
          reason_detail: string | null;
          water_mixed_litres: number;
          labour_used: boolean;
          labour_count: number;
          labour_cost: number;
          total_pesticide_cost: number;
          total_spray_cost: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plot_id: string;
          spray_date: string;
          crop_stage: "Flowering" | "Fruiting" | "Growth" | "Dormant";
          weather_condition: "Sunny" | "Rainy" | "Cloudy" | "Windy";
          spray_reason: "Disease" | "Pest" | "Preventive" | "Growth";
          reason_detail?: string | null;
          water_mixed_litres?: number;
          labour_used?: boolean;
          labour_count?: number;
          labour_cost?: number;
          total_pesticide_cost?: number;
          total_spray_cost?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          spray_date?: string;
          crop_stage?: "Flowering" | "Fruiting" | "Growth" | "Dormant";
          weather_condition?: "Sunny" | "Rainy" | "Cloudy" | "Windy";
          spray_reason?: "Disease" | "Pest" | "Preventive" | "Growth";
          reason_detail?: string | null;
          water_mixed_litres?: number;
          labour_used?: boolean;
          labour_count?: number;
          labour_cost?: number;
          total_pesticide_cost?: number;
          total_spray_cost?: number;
          notes?: string | null;
        };
      };
      spray_pesticide_usages: {
        Row: {
          id: string;
          spray_record_id: string;
          pesticide_id: string;
          quantity_used: number;
          price_at_time: number;
          cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          spray_record_id: string;
          pesticide_id: string;
          quantity_used: number;
          price_at_time: number;
          cost: number;
          created_at?: string;
        };
        Update: {
          quantity_used?: number;
          price_at_time?: number;
          cost?: number;
        };
      };
      cutting_records: {
        Row: {
          id: string;
          user_id: string;
          plot_id: string;
          cutting_date: string;
          cutting_type: "1st_Cutting" | "2nd_Cutting" | "Summer_Pruning" | "Winter_Pruning" | "Thinning";
          labour_count: number;
          male_labour_count: number;
          female_labour_count: number;
          per_day_salary: number;
          day_type: "Full_Day" | "Half_Day";
          effective_salary: number;
          total_labour_cost: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plot_id: string;
          cutting_date: string;
          cutting_type: "1st_Cutting" | "2nd_Cutting" | "Summer_Pruning" | "Winter_Pruning" | "Thinning";
          labour_count?: number;
          male_labour_count?: number;
          female_labour_count?: number;
          per_day_salary?: number;
          day_type: "Full_Day" | "Half_Day";
          effective_salary?: number;
          total_labour_cost?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          cutting_date?: string;
          cutting_type?: "1st_Cutting" | "2nd_Cutting" | "Summer_Pruning" | "Winter_Pruning" | "Thinning";
          labour_count?: number;
          male_labour_count?: number;
          female_labour_count?: number;
          per_day_salary?: number;
          day_type?: "Full_Day" | "Half_Day";
          effective_salary?: number;
          total_labour_cost?: number;
          notes?: string | null;
        };
      };
      labour_work: {
        Row: {
          id: string;
          user_id: string;
          labour_id: string;
          work_date: string;
          work_type: "Spray" | "Cutting" | "Cleaning" | "Harvesting" | "General" | "Other";
          day_type: "Full_Day" | "Half_Day";
          amount: number;
          payment_status: "Paid" | "Not_Paid" | "Pending";
          payment_date: string | null;
          payment_mode: "Cash" | "UPI" | "Bank_Transfer" | "Cheque" | null;
          reference_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          labour_id: string;
          work_date: string;
          work_type: "Spray" | "Cutting" | "Cleaning" | "Harvesting" | "General" | "Other";
          day_type: "Full_Day" | "Half_Day";
          amount?: number;
          payment_status?: "Paid" | "Not_Paid" | "Pending";
          payment_date?: string | null;
          payment_mode?: "Cash" | "UPI" | "Bank_Transfer" | "Cheque" | null;
          reference_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          work_date?: string;
          work_type?: "Spray" | "Cutting" | "Cleaning" | "Harvesting" | "General" | "Other";
          day_type?: "Full_Day" | "Half_Day";
          amount?: number;
          payment_status?: "Paid" | "Not_Paid" | "Pending";
          payment_date?: string | null;
          payment_mode?: "Cash" | "UPI" | "Bank_Transfer" | "Cheque" | null;
          reference_id?: string | null;
          notes?: string | null;
        };
      };
      other_expenses: {
        Row: {
          id: string;
          user_id: string;
          expense_date: string;
          category: "Fuel" | "Fertilizer" | "Tools" | "Equipment" | "Transport" | "Maintenance" | "Other";
          description: string;
          amount: number;
          payment_status: "Paid" | "Not_Paid" | "Pending";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          expense_date: string;
          category: "Fuel" | "Fertilizer" | "Tools" | "Equipment" | "Transport" | "Maintenance" | "Other";
          description?: string;
          amount?: number;
          payment_status?: "Paid" | "Not_Paid" | "Pending";
          created_at?: string;
        };
        Update: {
          expense_date?: string;
          category?: "Fuel" | "Fertilizer" | "Tools" | "Equipment" | "Transport" | "Maintenance" | "Other";
          description?: string;
          amount?: number;
          payment_status?: "Paid" | "Not_Paid" | "Pending";
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          payee_type: "Labour" | "Vendor" | "Other";
          payee_id: string | null;
          payee_name: string;
          payment_date: string;
          amount: number;
          payment_mode: "Cash" | "UPI" | "Bank_Transfer" | "Cheque";
          reference_number: string | null;
          purpose: string;
          linked_work_ids: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          payee_type: "Labour" | "Vendor" | "Other";
          payee_id?: string | null;
          payee_name: string;
          payment_date: string;
          amount?: number;
          payment_mode: "Cash" | "UPI" | "Bank_Transfer" | "Cheque";
          reference_number?: string | null;
          purpose?: string;
          linked_work_ids?: string[];
          created_at?: string;
        };
        Update: {
          payee_name?: string;
          payment_date?: string;
          amount?: number;
          payment_mode?: "Cash" | "UPI" | "Bank_Transfer" | "Cheque";
          reference_number?: string | null;
          purpose?: string;
          linked_work_ids?: string[];
        };
      };
      user_feedbacks: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          status: "UNREAD" | "READ" | "RESOLVED";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          message: string;
          status?: "UNREAD" | "READ" | "RESOLVED";
          created_at?: string;
        };
        Update: {
          message?: string;
          status?: "UNREAD" | "READ" | "RESOLVED";
        };
      };
      product_sales: {
        Row: {
          id: string;
          user_id: string;
          product_name: string;
          sale_date: string;
          quantity: number;
          unit: "KG" | "Quintal" | "Ton";
          rate_per_unit: number;
          total_income: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_name: string;
          sale_date: string;
          quantity: number;
          unit: "KG" | "Quintal" | "Ton";
          rate_per_unit: number;
          total_income: number;
          created_at?: string;
        };
        Update: {
          product_name?: string;
          sale_date?: string;
          quantity?: number;
          unit?: "KG" | "Quintal" | "Ton";
          rate_per_unit?: number;
          total_income?: number;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
  };
}

// Convenience row types
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type FarmRow = Database["public"]["Tables"]["farms"]["Row"];
export type PlotRow = Database["public"]["Tables"]["plots"]["Row"];
export type PesticideRow = Database["public"]["Tables"]["pesticides"]["Row"];
export type LabourerRow = Database["public"]["Tables"]["labourers"]["Row"];
export type SprayRecordRow = Database["public"]["Tables"]["spray_records"]["Row"];
export type SprayPesticideUsageRow = Database["public"]["Tables"]["spray_pesticide_usages"]["Row"];
export type CuttingRecordRow = Database["public"]["Tables"]["cutting_records"]["Row"];
export type LabourWorkRow = Database["public"]["Tables"]["labour_work"]["Row"];
export type OtherExpenseRow = Database["public"]["Tables"]["other_expenses"]["Row"];
export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
export type UserFeedbackRow = Database["public"]["Tables"]["user_feedbacks"]["Row"];
export type ProductSaleRow = Database["public"]["Tables"]["product_sales"]["Row"];

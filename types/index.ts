export interface Farm {
    id: string;
    name: string;
    ownerName: string;
    totalAcres: number;
    location: string;
    phone: string;
    createdAt: string;
    ownerId: string;
}

export interface Plot {
    id: string;
    farmId: string;
    name: string;
    areaAcres: number;
    grapeVariety: string;
    plantingYear: string;
    isActive: boolean;
    userId: string;
}

export type UnitType = 'ml' | 'gram' | 'litre' | 'kg';

export interface Pesticide {
    id: string;
    name: string;
    companyName: string;
    unitType: UnitType;
    pricePerUnit: number;
    stockQuantity: number;
    lowStockAlertLevel: number;
    isActive: boolean;
    userId: string;
}

export type Gender = 'Male' | 'Female';
export type SkillType = 'Spraying' | 'Cutting' | 'General' | 'Multi-skill';

export interface Labour {
    id: string;
    name: string;
    gender: Gender;
    phone: string;
    perDaySalary: number;
    skillType: SkillType;
    isActive: boolean;
    joiningDate: string;
    userId: string;
}

export type CropStage = 'Dormant' | 'Budding' | 'Flowering' | 'FruitSet' | 'Veraison' | 'Harvest' | 'Fruiting' | 'Growth';
export type WeatherCondition = 'Sunny' | 'Rainy' | 'Cloudy' | 'Windy';
export type SprayReason = 'Disease' | 'Pest' | 'Preventive' | 'Growth';

export interface PesticideUsage {
    pesticideId: string;
    quantityUsed: number; // in unitType of pesticide
    priceAtTime: number;
    cost: number;
}

export interface SprayRecord {
    id: string;
    plotId: string;
    sprayDate: string;
    cropStage: CropStage;
    weatherCondition: WeatherCondition;
    sprayReason: SprayReason;
    reasonDetail?: string;
    waterMixedLitres: number;
    labourUsed: boolean;
    labourCount: number;
    labourCost: number;
    pesticideDetails: PesticideUsage[];
    totalPesticideCost: number;
    totalSprayCost: number;
    notes?: string;
    userId: string;
    // Weather auto-detection fields
    weatherTemperature?: number;
    weatherHumidity?: number;
    weatherWindSpeed?: number;
    weatherLocation?: string;
    weatherDetectedAt?: string;
}

export type ScheduleStatus = 'PLANNED' | 'COMPLETED' | 'CANCELLED';

export interface SpraySchedule {
    id: string;
    userId: string;
    plotId: string;
    plannedDate: string;
    targetDisease?: string;
    targetPest?: string;
    notes?: string;
    status: ScheduleStatus;
    convertedToSprayId?: string;
    createdAt: string;
}

export type PhotoType = 'BEFORE' | 'AFTER';

export interface SprayPhoto {
    id: string;
    userId: string;
    sprayRecordId: string;
    photoUrl: string;
    photoType: PhotoType;
    storagePath: string;
    fileSizeBytes: number;
    createdAt: string;
}

export interface SprayEffectiveness {
    id: string;
    userId: string;
    sprayRecordId: string;
    rating: 1 | 2 | 3 | 4 | 5;
    effectivenessNotes?: string;
    diseaseControlled: boolean;
    reapplicationNeeded: boolean;
    ratedAt: string;
}

export type CuttingType = '1st_Cutting' | '2nd_Cutting' | 'Summer_Pruning' | 'Winter_Pruning' | 'Thinning';
export type DayType = 'Full_Day' | 'Half_Day';

export interface CuttingRecord {
    id: string;
    plotId: string;
    cuttingDate: string;
    cuttingType: CuttingType;
    labourCount: number;
    maleLabourCount: number;
    femaleLabourCount: number;
    perDaySalary: number;
    dayType: DayType;
    effectiveSalary: number;
    totalLabourCost: number;
    notes?: string;
    userId: string;
}

export type WorkType = 'Spray' | 'Cutting' | 'Cleaning' | 'Harvesting' | 'General' | 'Other';
export type PaymentStatus = 'Paid' | 'Not_Paid' | 'Pending';
export type PaymentMode = 'Cash' | 'UPI' | 'Bank_Transfer' | 'Cheque';

export interface LabourWork {
    id: string;
    labourId: string;
    workDate: string;
    workType: WorkType;
    dayType: DayType;
    amount: number;
    paymentStatus: PaymentStatus;
    paymentDate?: string;
    paymentMode?: PaymentMode;
    referenceId?: string; // Linked to Spray or Cutting record if auto-generated
    notes?: string;
    userId: string;
}

export type ExpenseCategory = 'Fuel' | 'Fertilizer' | 'Tools' | 'Equipment' | 'Transport' | 'Maintenance' | 'Other';

export interface OtherExpense {
    id: string;
    expenseDate: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    paymentStatus: PaymentStatus; // Paid or Pending
    userId: string;
}

export type PayeeType = 'Labour' | 'Vendor' | 'Other';

export interface Payment {
    id: string;
    payeeType: PayeeType;
    payeeId?: string; // labourId if payeeType is Labour
    payeeName: string;
    paymentDate: string;
    amount: number;
    paymentMode: PaymentMode;
    referenceNumber?: string;
    purpose: string;
    linkedWorkIds: string[]; // IDs of LabourWork entries paid by this payment
    userId: string;
}

export type FeedbackStatus = 'UNREAD' | 'READ' | 'RESOLVED';

export interface UserFeedback {
    id: string;
    userId: string;
    message: string;
    status: FeedbackStatus;
    createdAt: string;
    // For admin UI display:
    userFullName?: string;
    userEmail?: string;
}

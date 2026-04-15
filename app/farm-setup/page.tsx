import { FarmDetails } from "@/components/farm/FarmDetails";
import { PlotsManager } from "@/components/farm/PlotsManager";

export default function FarmSetupPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Farm Setup</h1>
            <FarmDetails />
            <PlotsManager />
        </div>
    );
}

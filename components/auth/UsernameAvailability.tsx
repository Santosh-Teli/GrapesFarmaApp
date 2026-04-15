import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface UsernameAvailabilityProps {
  status: "idle" | "checking" | "available" | "taken";
}

export function UsernameAvailability({ status }: UsernameAvailabilityProps) {
  if (status === "idle") return null;

  return (
    <div className="flex items-center gap-1.5 text-xs mt-1">
      {status === "checking" && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-text-secondary" />
          <span className="text-brand-text-secondary">Checking availability...</span>
        </>
      )}
      {status === "available" && (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-brand-success" />
          <span className="text-brand-success font-medium">Username is available!</span>
        </>
      )}
      {status === "taken" && (
        <>
          <XCircle className="h-3.5 w-3.5 text-brand-error" />
          <span className="text-brand-error font-medium">Username is already taken.</span>
        </>
      )}
    </div>
  );
}

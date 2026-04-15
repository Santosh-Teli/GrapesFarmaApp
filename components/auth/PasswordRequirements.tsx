import { CheckCircle2, Circle } from "lucide-react";

export function PasswordRequirements({ password }: { password: string }) {
  const reqs = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "One special character", met: /[^a-zA-Z0-9]/.test(password) },
  ];

  return (
    <div className="space-y-1.5 mt-2">
      {reqs.map((req, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          {req.met ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-brand-success" />
          ) : (
            <Circle className="h-3.5 w-3.5 text-brand-text-secondary/50" />
          )}
          <span className={req.met ? "text-brand-success" : "text-brand-text-secondary"}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PasswordStrengthBar({ password }: { password: string }) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const getStrengthMeta = () => {
    switch (score) {
      case 0:
      case 1:
      case 2: return { color: "bg-brand-error", text: "Weak" };
      case 3:
      case 4: return { color: "bg-brand-warning", text: "Medium" };
      case 5: return { color: "bg-brand-success", text: "Strong" };
      default: return { color: "bg-gray-200", text: "" };
    }
  };

  const meta = getStrengthMeta();

  if (password.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`flex-1 rounded-full ${
              level <= score ? meta.color : "bg-gray-200 dark:bg-gray-800"
            } transition-all duration-300`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium text-right ${
        score >= 5 ? "text-brand-success" : score >= 3 ? "text-brand-warning" : "text-brand-error"
      }`}>
        {meta.text}
      </p>
    </div>
  );
}

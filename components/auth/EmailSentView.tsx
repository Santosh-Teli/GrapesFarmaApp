import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmailSentViewProps {
  maskedEmail: string;
}

export function EmailSentView({ maskedEmail }: EmailSentViewProps) {
  return (
    <div className="text-center space-y-6 py-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center">
            <Mail className="h-10 w-10 text-brand-primary" />
          </div>
          <div className="absolute -top-1 -right-1 bg-brand-success rounded-full p-1">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-playfair font-bold text-brand-text-primary">
          Check your email
        </h2>
        <p className="text-brand-text-secondary text-sm leading-relaxed">
          We sent a password reset link to
        </p>
        <p className="text-brand-primary font-semibold text-base">{maskedEmail}</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
        <p className="text-sm text-amber-800 font-medium mb-1">⏱ Link expires in 15 minutes</p>
        <p className="text-xs text-amber-700">
          For demo purposes, the reset token is saved in <code className="bg-amber-100 px-1 rounded">sessionStorage</code>. Click the link in your browser&apos;s console to proceed.
        </p>
      </div>

      <div className="pt-2">
        <Link href="/login">
          <Button variant="ghost" className="w-full gap-2 text-brand-text-secondary hover:text-brand-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Button>
        </Link>
      </div>
    </div>
  );
}

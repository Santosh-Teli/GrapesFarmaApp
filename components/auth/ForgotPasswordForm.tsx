"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

import { forgotPasswordSchema } from "@/lib/validations/auth";
import { supabaseForgotPassword } from "@/lib/supabase/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmailSentView } from "./EmailSentView";

type ForgotValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotValues) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const result = await supabaseForgotPassword(data.email);
      if (!result.success) {
        setServerError(result.message);
        return;
      }
      // Supabase sends the reset email; show a masked confirmation
      const [local, domain] = data.email.split("@");
      const masked =
        local.length <= 2
          ? local[0] + "***"
          : local[0] + "***" + local[local.length - 1];
      setMaskedEmail(`${masked}@${domain}`);
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (maskedEmail) {
    return <EmailSentView maskedEmail={maskedEmail} />;
  }

  return (
    <div className="space-y-6">
      <Link href="/login" className="inline-flex items-center gap-2 text-sm text-brand-text-secondary hover:text-brand-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="flex gap-3 p-4 rounded-xl border bg-red-50 border-red-200 text-red-700 text-sm animate-in fade-in slide-in-from-top-1 duration-300">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {serverError}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your registered email"
              className="pl-10 h-11 border-gray-200 focus:border-brand-primary"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-brand-error">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-xl shadow-lg shadow-brand-primary/30"
        >
          {isLoading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending reset link...</>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
    </div>
  );
}

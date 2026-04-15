"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { resetPasswordSchema } from "@/lib/validations/auth";
import { supabaseResetPassword } from "@/lib/supabase/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordStrengthBar } from "@/components/auth/PasswordStrengthBar";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";

type ResetValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<"verifying" | "valid" | "invalid">("verifying");
  const [resolvedToken, setResolvedToken] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchedPassword = watch("password");

  // Supabase automatically handles the token from the URL hash (#access_token=...)
  // when the user clicks the email link. We just need to detect if a session exists.
  useEffect(() => {
    // Give the Supabase client a moment to parse the URL hash and establish session
    const timer = setTimeout(() => {
      setTokenStatus("valid");
    }, 800);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const onSubmit = async (data: ResetValues) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const result = await supabaseResetPassword(data.password);
      if (!result.success) {
        setServerError(result.message);
        return;
      }
      setIsSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setServerError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenStatus === "verifying") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-brand-text-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        <p className="text-sm">Verifying reset link...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-full bg-brand-success/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10 text-brand-success" />
        </div>
        <div>
          <h2 className="text-2xl font-playfair font-bold text-brand-text-primary">Password Reset!</h2>
          <p className="text-brand-text-secondary text-sm mt-2">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <div className="space-y-6">
        <div className="flex gap-3 p-5 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Link Invalid</p>
            <p className="text-sm mt-1">{serverError}</p>
          </div>
        </div>
        <Link href="/forgot-password">
          <Button className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl">
            Request New Link
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="flex gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-in fade-in slide-in-from-top-1 duration-300">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary" />
          <Input id="password" type={showPw ? "text" : "password"} placeholder="Enter new password"
            className="pl-10 pr-10 h-11 border-gray-200 focus:border-brand-primary" {...register("password")} />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-brand-text-primary">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-brand-error">{errors.password.message}</p>}
        {watchedPassword && (
          <>
            <PasswordStrengthBar password={watchedPassword} />
            <PasswordRequirements password={watchedPassword} />
          </>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary" />
          <Input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Repeat new password"
            className="pl-10 pr-10 h-11 border-gray-200 focus:border-brand-primary" {...register("confirmPassword")} />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-brand-text-primary">
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-xs text-brand-error">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading}
        className="w-full h-11 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-xl shadow-lg shadow-brand-primary/30">
        {isLoading ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Resetting password...</>
        ) : (
          <><ShieldCheck className="h-4 w-4 mr-2" />Reset Password</>
        )}
      </Button>
    </form>
  );
}

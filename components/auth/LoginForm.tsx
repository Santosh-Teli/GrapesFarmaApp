"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, User, Loader2, ShieldCheck, AlertCircle, ShieldAlert } from "lucide-react";

import { loginSchema } from "@/lib/validations/auth";
import { supabaseLogin } from "@/lib/supabase/auth";
import { useAuthStore } from "@/store/authStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type LoginValues = z.infer<typeof loginSchema>;

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdminMode = searchParams.has("admin");

  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    setServerError(null);
    setErrorCode(null);

    try {
      const result = await supabaseLogin(data);

      if (!result.success) {
        setServerError(result.message);
        setErrorCode(result.errorCode || null);
        return;
      }

      login(result.data!.user, result.data!.token);
      toast.success("Welcome back! Logging you in...", { duration: 2000 });
      setTimeout(() => router.push("/"), 800);
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Mode Banner */}
      {isAdminMode && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-300">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Admin login mode — use your administrator credentials to sign in.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Server Error */}
        {serverError && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border text-sm animate-in fade-in slide-in-from-top-1 duration-300 ${
              errorCode === "ACCOUNT_SUSPENDED"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Username */}
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary" />
            <Input
              id="username"
              placeholder="Enter your username"
              className="pl-10 h-12 text-base border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20"
              {...register("username")}
            />
          </div>
          {errors.username && (
            <p className="text-xs text-brand-error">{errors.username.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-brand-primary hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="pl-10 pr-10 h-12 text-base border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-brand-text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-brand-error">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 text-base bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-primary/30"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4 mr-2" />
              {isAdminMode ? "Sign in as Admin" : "Sign in to Dashboard"}
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-brand-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-brand-primary font-semibold hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-gray-100" />}>
      <LoginFormInner />
    </Suspense>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye, EyeOff, Lock, User, Phone, Mail, Loader2, UserCheck, AlertCircle
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { registerSchema } from "@/lib/validations/auth";
import { supabaseRegister, checkUsernameAvailability } from "@/lib/supabase/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordStrengthBar } from "@/components/auth/PasswordStrengthBar";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { UsernameAvailability } from "@/components/auth/UsernameAvailability";
import { useEffect } from "react";

type RegisterValues = z.infer<typeof registerSchema>;
type UsernameStatus = "idle" | "checking" | "available" | "taken";

const inputClass = "h-12 text-base border-gray-200 focus:border-brand-primary pl-10";

function FieldWrapper({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5 animate-in fade-in slide-in-from-left-1 duration-200">
      {children}
      {error && (
        <p className="text-xs text-brand-error flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "", username: "", email: "", phone: "",
      password: "", confirmPassword: "", acceptTerms: false,
    },
    mode: "onChange",
  });

  const { register, handleSubmit, watch, control, setError, formState: { errors } } = form;

  const watchedUsername = watch("username");
  const watchedPassword = watch("password");
  const debouncedUsername = useDebounce(watchedUsername, 600);

  useEffect(() => {
    if (!debouncedUsername || debouncedUsername.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    checkUsernameAvailability(debouncedUsername).then((res) => {
      setUsernameStatus(res.available ? "available" : "taken");
    });
  }, [debouncedUsername]);

  const onSubmit = async (data: RegisterValues) => {
    if (usernameStatus === "taken") {
      setError("username", { message: "This username is already taken." });
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      const result = await supabaseRegister(data);

      if (!result.success) {
        if (result.errorCode === "USERNAME_TAKEN") {
          setError("username", { message: "This username is already taken." });
        } else if (result.errorCode === "EMAIL_TAKEN") {
          setError("email", { message: "Email is already registered. Try logging in." });
        }
        setServerError(result.message || "Registration failed.");
        return;
      }

      toast.success("Account created! Please log in to continue.");
      router.push("/login");
    } catch {
      setServerError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="flex gap-3 p-4 rounded-xl border bg-red-50 border-red-200 text-red-700 text-sm animate-in fade-in slide-in-from-top-1 duration-300">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {serverError}
        </div>
      )}

      {/* Full Name */}
      <FieldWrapper error={errors.fullName?.message}>
        <Label htmlFor="fullName">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary" />
          <Input id="fullName" placeholder="Rahul Sharma" className={inputClass} {...register("fullName")} />
        </div>
      </FieldWrapper>

      {/* Username */}
      <FieldWrapper error={errors.username?.message}>
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary" />
          <Input id="username" placeholder="rahul_sharma" className={inputClass} {...register("username")} />
        </div>
        <UsernameAvailability status={usernameStatus} />
      </FieldWrapper>

      {/* Email */}
      <FieldWrapper error={errors.email?.message}>
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary" />
          <Input id="email" type="email" placeholder="rahul@example.com" className={inputClass} {...register("email")} />
        </div>
      </FieldWrapper>

      {/* Phone */}
      <FieldWrapper error={errors.phone?.message}>
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary" />
          <Input id="phone" placeholder="9876543210" className={inputClass} {...register("phone")} maxLength={10} />
        </div>
      </FieldWrapper>

      {/* Password */}
      <FieldWrapper error={errors.password?.message}>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            className={`${inputClass} pr-10`}
            {...register("password")}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-brand-text-primary transition-colors">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {watchedPassword && (
          <>
            <PasswordStrengthBar password={watchedPassword} />
            <PasswordRequirements password={watchedPassword} />
          </>
        )}
      </FieldWrapper>

      {/* Confirm Password */}
      <FieldWrapper error={errors.confirmPassword?.message}>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary" />
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="Repeat your password"
            className={`${inputClass} pr-10`}
            {...register("confirmPassword")}
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-brand-text-primary transition-colors">
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </FieldWrapper>

      {/* Accept Terms */}
      <div className="space-y-1">
        <Controller
          name="acceptTerms"
          control={control}
          render={({ field }) => (
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                id="acceptTerms"
                checked={field.value}
                onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                className="mt-0.5"
              />
              <span className="text-sm text-brand-text-secondary">
                I agree to the{" "}
                <Link href="#" className="text-brand-primary underline hover:text-brand-primary-dark">Terms of Service</Link>
                {" and "}
                <Link href="#" className="text-brand-primary underline hover:text-brand-primary-dark">Privacy Policy</Link>
              </span>
            </label>
          )}
        />
        {errors.acceptTerms && (
          <p className="text-xs text-brand-error">{errors.acceptTerms.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 text-base bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-xl shadow-lg shadow-brand-primary/30 transition-all duration-200"
      >
        {isLoading ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account...</>
        ) : (
          "Create Account"
        )}
      </Button>

      <p className="text-center text-sm text-brand-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-primary font-semibold hover:underline">Sign in</Link>
      </p>
    </form>
  );
}

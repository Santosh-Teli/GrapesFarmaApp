// lib/supabase/auth.ts
// All auth operations via Supabase (replaces lib/mock/auth.ts)

import { getSupabaseClient } from "./client";
import type { ProfileRow } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
}

// ─── Username availability ────────────────────────────────────────────────────

export async function checkUsernameAvailability(
  username: string
): Promise<{ available: boolean }> {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase.rpc("check_username_exists", {
    p_username: username,
  });

  if (error) {
    console.error("Error checking username:", error);
    return { available: false };
  }
  
  return { available: !data };
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function supabaseRegister(data: {
  fullName: string;
  username: string;
  phone: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const supabase = getSupabaseClient();

  // Check username uniqueness
  const { available } = await checkUsernameAvailability(data.username);
  if (!available) {
    return {
      success: false,
      message: "Validation failed",
      errorCode: "USERNAME_TAKEN",
    };
  }

  // Supabase signUp — metadata will create the profile via trigger
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        username: data.username,
        phone: data.phone,
        role: "FARMER",
      },
      emailRedirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : undefined,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return {
        success: false,
        message: "Email is already registered. Try logging in.",
        errorCode: "EMAIL_TAKEN",
      };
    }
    return { success: false, message: error.message, errorCode: "SIGNUP_ERROR" };
  }

  // Create initial farm for the new user
  if (authData.user) {
    await supabase.from("farms").insert({
      owner_id: authData.user.id,
      name: `${data.fullName}'s Farm`,
      owner_name: data.fullName,
      phone: data.phone,
      total_acres: 0,
      location: "",
    } as any);
  }

  return {
    success: true,
    message: "Registration successful! Welcome to AgriTrack. Please log in.",
  };
}

// ─── Login (by username) ──────────────────────────────────────────────────────

export async function supabaseLogin(data: {
  username: string;
  password: string;
}): Promise<AuthResult<{ user: ProfileRow; token: string }>> {
  const supabase = getSupabaseClient();

  // Step 1: Resolve email from username using secure RPC to bypass RLS
  const supabase2 = getSupabaseClient() as any;
  const { data: profileData, error: profileError } = await supabase2.rpc(
    "get_profile_by_username",
    { p_username: data.username }
  );

  // The RPC returns a set of rows, so we take the first one
  const profile = profileData && profileData.length > 0 ? (profileData[0] as unknown as ProfileRow) : null;

  if (profileError || !profile) {
    return {
      success: false,
      message: "User does not exist. Please register.",
      errorCode: "USER_NOT_FOUND",
    };
  }

  if (profile.status === "SUSPENDED") {
    return {
      success: false,
      message:
        "Your account has been suspended. Please contact support at support@agritrack.com",
      errorCode: "ACCOUNT_SUSPENDED",
    };
  }

  if (profile.status === "PENDING") {
    return {
      success: false,
      message: "Your account is pending approval.",
      errorCode: "ACCOUNT_PENDING",
    };
  }

  // Step 2: Sign in using the email stored in profiles
  const { data: sessionData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: profile.email,
      password: data.password,
    });

  if (signInError) {
    return {
      success: false,
      message: "Invalid username or password.",
      errorCode: "INVALID_CREDENTIALS",
    };
  }

  const token = sessionData.session?.access_token ?? "";

  return {
    success: true,
    message: "Login successful",
    data: { user: profile, token },
  };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function supabaseLogout(): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
}

// ─── Get current user's profile ───────────────────────────────────────────────

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const supabase = getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data ?? null;
}

// ─── Get all profiles (Admin) ─────────────────────────────────────────────────

export async function getAllProfiles(): Promise<ProfileRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function supabaseForgotPassword(
  email: string
): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo:
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : undefined,
  });

  if (error) return { success: false, message: error.message };

  const [local, domain] = email.split("@");
  const maskedLocal =
    local.length <= 2
      ? local[0] + "***"
      : local[0] + "***" + local[local.length - 1];

  return {
    success: true,
    message: `Password reset link sent to ${maskedLocal}@${domain}`,
  };
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function supabaseResetPassword(
  newPassword: string
): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { success: false, message: error.message };
  return { success: true, message: "Password reset successful. Please login." };
}

// ─── Listen to auth state changes ─────────────────────────────────────────────

export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  const supabase = getSupabaseClient();
  return supabase.auth.onAuthStateChange(callback);
}

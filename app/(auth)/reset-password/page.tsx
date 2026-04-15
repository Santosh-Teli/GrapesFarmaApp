import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | AgriTrack Farm Platform",
  description: "Create a new password for your AgriTrack account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthSplitLayout
      title="Create a strong new password"
      subtitle="Choose a password that's difficult to guess and keep it safe. Your account security is our priority."
    >
      <AuthCard
        title="Set new password"
        description="Your reset link has been verified. Please enter your new password below."
      >
        <Suspense fallback={<div className="animate-pulse h-40 bg-gray-100 rounded-xl" />}>
          <ResetPasswordForm />
        </Suspense>
      </AuthCard>
    </AuthSplitLayout>
  );
}

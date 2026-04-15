import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | AgriTrack Farm Platform",
  description: "Reset your AgriTrack account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthSplitLayout
      title="Forgot your password?"
      subtitle="No worries. Just enter your registered email address and we'll send you a secure reset link."
    >
      <AuthCard
        title="Reset password"
        description="Enter the email linked to your account and we'll send you recovery instructions."
      >
        <ForgotPasswordForm />
      </AuthCard>
    </AuthSplitLayout>
  );
}

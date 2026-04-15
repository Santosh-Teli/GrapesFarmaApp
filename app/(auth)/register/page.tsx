import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | AgriTrack Farm Platform",
  description: "Register a new account on AgriTrack to manage your grapes farm.",
};

export default function RegisterPage() {
  return (
    <AuthSplitLayout
      title="Join the AgriTrack farming community"
      subtitle="Complete farm management"
    >
      <AuthCard
        title="Create your account"
        description="Fill in the details below to get started with AgriTrack."
      >
        <RegisterForm />
      </AuthCard>
    </AuthSplitLayout>
  );
}

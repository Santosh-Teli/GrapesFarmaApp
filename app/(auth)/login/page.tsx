import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | AgriTrack Farm Platform",
  description: "Sign in to access your AgriTrack farm management dashboard.",
};

export default function LoginPage() {
  return (
    <AuthSplitLayout
      title="Manage your farm with confidence"
      subtitle="Track sprays, cutting, labour, and expenses — all in one place. Built for grape farmers like you."
    >
      <AuthCard
        title="Welcome back 👋"
        description="Sign in to your farm dashboard to continue where you left off."
      >
        <LoginForm />
      </AuthCard>
    </AuthSplitLayout>
  );
}

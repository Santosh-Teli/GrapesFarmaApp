"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { createFeedback } from "@/lib/supabase/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";

export function FeedbackForm() {
    const { user } = useAuthStore();
    const t = useTranslation();
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !user?.id) return;

        setIsSubmitting(true);
        try {
            await createFeedback(user.id, message.trim());
            toast.success(t.feedbackSuccess);
            setMessage("");
        } catch (error: any) {
            console.error("Error submitting feedback:", error);
            toast.error(t.feedbackError);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="border-t-4 border-t-blue-500 shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquarePlus className="h-5 w-5 text-blue-600" />
                    {t.helpUsImprove}
                </CardTitle>
                <CardDescription>
                    Have a feature request or found a bug? Let the administrator know directly.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={t.feedbackPlaceholder}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isSubmitting}
                        required
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting || !message.trim()}>
                            {isSubmitting ? t.saving : t.submitFeedback}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

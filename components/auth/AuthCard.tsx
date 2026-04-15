import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0 pb-8 text-center lg:text-left">
          <CardTitle className="text-3xl font-playfair font-bold text-brand-text-primary mb-2">
            {title}
          </CardTitle>
          <CardDescription className="text-brand-text-secondary text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

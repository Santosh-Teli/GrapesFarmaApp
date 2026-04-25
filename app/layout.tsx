import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "AgriTrack Farm Manager",
  description: "Comprehensive management system for Grapes Farming & Marketing",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AgriTrack",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",          // iPhone notch safe-area support
  themeColor: "#2D6A4F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-brand-bg text-brand-text-primary">
        <AppLayout>
          {children}
        </AppLayout>
        <Toaster richColors position="top-center" expand={false} closeButton />
      </body>
    </html>
  );
}

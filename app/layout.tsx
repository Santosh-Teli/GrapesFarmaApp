import type { Metadata } from "next";
import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
export const metadata: Metadata = {
  title: "AgriTrack Farm Manager",
  description: "Comprehensive management system for Grapes Farming & Marketing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-brand-bg text-brand-text-primary`}
      >
        <AppLayout>
          {children}
        </AppLayout>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

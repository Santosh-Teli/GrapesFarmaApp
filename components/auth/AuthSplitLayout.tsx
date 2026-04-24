import { Grape } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface AuthSplitLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  imageAlt?: string;
}

export function AuthSplitLayout({
  children,
  title,
  subtitle,
}: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Visual / Marketing Side (Hidden on Mobile) */}
      <div className="hidden w-1/2 lg:flex flex-col justify-between bg-brand-primary p-12 text-brand-surface relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-brand-primary-light blur-3xl" />
          <div className="absolute top-[40%] -left-[20%] w-[60%] h-[60%] rounded-full bg-brand-accent blur-3xl opacity-50" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-16 hover:opacity-90 transition-opacity">
            <div className="bg-brand-surface text-brand-primary p-2 rounded-xl">
              <Grape className="h-8 w-8" />
            </div>
            <span className="font-playfair text-2xl font-bold tracking-tight">AgriTrack</span>
          </Link>

          <div className="max-w-md mt-24">
            <h1 className="font-playfair text-4xl lg:text-5xl font-bold leading-tight mb-6">
              {title}
            </h1>
            <p className="text-brand-surface/80 text-lg leading-relaxed font-sans">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-sm text-brand-surface/60 font-sans">
          <p>© {new Date().getFullYear()} AgriTrack. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-brand-surface transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-brand-surface transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-6 sm:p-12 bg-brand-bg relative">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Tractor, Droplets,
  FileText, Scissors, CalendarCheck, MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";

const PRIMARY_TABS = [
  { href: "/",            label: "Home",     icon: LayoutDashboard },
  { href: "/spray",       label: "Spray",    icon: Droplets },
  { href: "/cutting",     label: "Cutting",  icon: Scissors },
  { href: "/daily-work",  label: "Labour",   icon: CalendarCheck },
  { href: "/reports",     label: "Reports",  icon: FileText },
];

const MORE_ITEMS = [
  { href: "/farm-setup",     label: "Farm Setup" },
  { href: "/pesticides",     label: "Pesticides" },
  { href: "/expenses",       label: "Expenses" },
  { href: "/payments",       label: "Payments" },
  { href: "/spray/schedule", label: "Spray Schedule" },
  { href: "/revenue",        label: "Revenue" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [showMore, setShowMore] = useState(false);

  if (!isAuthenticated || user?.role === "ADMIN") return null;

  return (
    <>
      {/* More drawer overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More drawer */}
      {showMore && (
        <div className="fixed bottom-[65px] left-0 right-0 z-50 bg-background border-t rounded-t-2xl shadow-2xl pb-2 lg:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
          <div className="grid grid-cols-3 gap-1 px-3 pb-safe">
            {MORE_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-[11px] font-semibold transition-colors",
                    isActive
                      ? "bg-[#2D6A4F]/10 text-[#2D6A4F]"
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  <span className="text-lg">
                    {item.label === "Farm Setup" ? "🌾" :
                     item.label === "Pesticides" ? "🧪" :
                     item.label === "Expenses" ? "💰" :
                     item.label === "Payments" ? "💳" :
                     item.label === "Spray Schedule" ? "📅" :
                     item.label === "Revenue" ? "📈" : "📋"}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur border-t shadow-lg lg:hidden pb-safe">
        <div className="flex items-center justify-around h-16">
          {PRIMARY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-semibold transition-colors",
                  isActive ? "text-[#2D6A4F]" : "text-gray-400"
                )}
              >
                <div className={cn(
                  "h-7 w-12 flex items-center justify-center rounded-xl transition-colors",
                  isActive ? "bg-[#2D6A4F]/10" : ""
                )}>
                  <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                </div>
                {tab.label}
              </Link>
            );
          })}

          {/* More button */}
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-semibold transition-colors",
              showMore ? "text-[#2D6A4F]" : "text-gray-400"
            )}
          >
            <div className={cn(
              "h-7 w-12 flex items-center justify-center rounded-xl transition-colors",
              showMore ? "bg-[#2D6A4F]/10" : ""
            )}>
              <MoreHorizontal className={cn("h-5 w-5", showMore ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
            </div>
            More
          </button>
        </div>
      </nav>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ChevronDown, Server, X } from "lucide-react";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 shadow-lg">
              <Sparkles className="size-5 text-white" />
              <span className="absolute -right-0.5 -top-0.5 flex size-2.5">
                <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-emerald-400" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400 ring-2 ring-sidebar" />
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">QA Agent</p>
              <p className="text-[11px] text-emerald-400">● Online</p>
            </div>
          </Link>
          <button onClick={onClose} className="text-sidebar-foreground/60 lg:hidden">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto scrollbar-thin px-3 py-2">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "size-[18px] shrink-0",
                    active ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-white"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-danger/20 px-1.5 py-0.5 text-[10px] font-semibold text-danger">
                    {item.badge}
                  </span>
                )}
                {active && <span className="size-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-white/10 p-4">
          <div className="rounded-lg bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                AI Agent
              </span>
              <span className="text-[11px] text-emerald-400">Active</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-sidebar-foreground/60">
              <Server className="size-3.5" />
              Environment: <span className="text-sidebar-foreground/90">QA</span>
            </div>
          </div>

          <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-white/5">
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold text-white">
              SV
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium">Siva Kumar</p>
              <p className="text-[11px] text-sidebar-foreground/60">QA Lead</p>
            </div>
            <ChevronDown className="size-4 text-sidebar-foreground/50" />
          </button>
        </div>
      </aside>
    </>
  );
}

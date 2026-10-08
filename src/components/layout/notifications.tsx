"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { notifications } from "@/lib/mock-data";
import { ActivityIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  danger: "text-danger bg-danger/10",
  success: "text-success bg-success/10",
  info: "text-sky-400 bg-sky-500/10",
};

export function Notifications() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-9 items-center justify-center rounded-lg hover:bg-accent"
        aria-label="Notifications"
      >
        <Bell className="size-[18px]" />
        <span className="absolute right-2 top-2 flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-danger" />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            <span className="rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-semibold text-danger">
              {notifications.length} new
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 border-b border-border/60 px-4 py-3 last:border-0 hover:bg-accent/50"
              >
                <div className={cn("flex size-8 items-center justify-center rounded-lg", colorMap[n.type])}>
                  <ActivityIcon name={n.icon} className="size-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-snug">{n.text}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 text-center text-xs font-medium text-primary hover:bg-accent/50">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}

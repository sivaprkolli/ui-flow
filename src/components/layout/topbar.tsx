"use client";

import { Menu } from "lucide-react";
import { GlobalSearch } from "./global-search";
import { Notifications } from "./notifications";
import { ThemeToggle } from "./theme-toggle";
import { Badge } from "@/components/ui/badge";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <button onClick={onMenu} className="rounded-lg p-2 hover:bg-accent lg:hidden" aria-label="Menu">
        <Menu className="size-5" />
      </button>

      <div className="flex flex-1 items-center">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-1.5">
        <Badge variant="success" className="hidden md:inline-flex">
          <span className="size-1.5 rounded-full bg-success" />
          Env: QA
        </Badge>
        <ThemeToggle />
        <Notifications />
      </div>
    </header>
  );
}

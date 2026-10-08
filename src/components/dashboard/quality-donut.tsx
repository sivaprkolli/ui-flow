"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { qualityBreakdown } from "@/lib/mock-data";

export function QualityDonut() {
  const total = qualityBreakdown.reduce((s, d) => s + d.value, 0);
  const passed = qualityBreakdown.find((d) => d.name === "Passed")?.value ?? 0;
  const pct = Math.round((passed / total) * 100);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={qualityBreakdown}
              dataKey="value"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={3}
              stroke="none"
            >
              {qualityBreakdown.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold">{pct}%</span>
          <span className="text-xs text-muted-foreground">Pass Rate</span>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-3">
        {qualityBreakdown.map((d) => (
          <div key={d.name} className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <div>
              <p className="text-xs text-muted-foreground">{d.name}</p>
              <p className="text-sm font-semibold">{d.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { executionTrend } from "@/lib/mock-data";

export function TrendChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={executionTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis dataKey="build" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <Line type="monotone" dataKey="passed" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Passed" />
        <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Failed" />
        <Line type="monotone" dataKey="healed" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Healed" />
      </LineChart>
    </ResponsiveContainer>
  );
}

"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { executionByBrowser, executionDurationTrend, failureCategoryBreakdown } from "@/lib/mock-data";

const tooltipStyle = { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: "12px" };

export function FailureCategoryChart() {
  return <ResponsiveContainer width="100%" height={260}><BarChart data={failureCategoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} /><XAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" name="Failures" radius={[5, 5, 0, 0]}>{failureCategoryBreakdown.map((item) => <Cell key={item.category} fill={item.color} />)}</Bar></BarChart></ResponsiveContainer>;
}

export function ExecutionDurationChart() {
  return <ResponsiveContainer width="100%" height={270}><LineChart data={executionDurationTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} /><XAxis dataKey="build" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis yAxisId="duration" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis yAxisId="rate" orientation="right" domain={[85, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: "12px" }} /><Line yAxisId="duration" type="monotone" dataKey="duration" name="Duration (min)" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} /><Line yAxisId="rate" type="monotone" dataKey="passRate" name="Pass rate (%)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} /></LineChart></ResponsiveContainer>;
}

export function BrowserExecutionChart() {
  return <ResponsiveContainer width="100%" height={270}><BarChart data={executionByBrowser} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} /><XAxis dataKey="browser" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: "12px" }} /><Bar dataKey="passed" name="Passed" stackId="status" fill="#22c55e" radius={[0, 0, 0, 0]} /><Bar dataKey="failed" name="Failed" stackId="status" fill="#ef4444" /><Bar dataKey="skipped" name="Skipped" stackId="status" fill="#94a3b8" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>;
}

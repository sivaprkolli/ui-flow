"use client";

import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  PieChart, Pie, RadialBarChart, RadialBar, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import {
  executionByBrowser, executionDurationTrend, failureCategoryBreakdown,
  failureDurationData, investigatedPct, launchStatsTrend, mostFailedTests,
} from "@/lib/mock-data";

const tooltipStyle = { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: "12px" };
const tick = { fill: "hsl(var(--muted-foreground))", fontSize: 11 };

export function FailureCategoryChart() {
  return <ResponsiveContainer width="100%" height={260}><BarChart data={failureCategoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} /><XAxis dataKey="category" tick={tick} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" name="Failures" radius={[5, 5, 0, 0]}>{failureCategoryBreakdown.map((item) => <Cell key={item.category} fill={item.color} />)}</Bar></BarChart></ResponsiveContainer>;
}

export function ExecutionDurationChart() {
  return <ResponsiveContainer width="100%" height={270}><LineChart data={executionDurationTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} /><XAxis dataKey="build" tick={tick} axisLine={false} tickLine={false} /><YAxis yAxisId="duration" tick={tick} axisLine={false} tickLine={false} /><YAxis yAxisId="rate" orientation="right" domain={[85, 100]} tick={tick} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: "12px" }} /><Line yAxisId="duration" type="monotone" dataKey="duration" name="Duration (min)" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} /><Line yAxisId="rate" type="monotone" dataKey="passRate" name="Pass rate (%)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} /></LineChart></ResponsiveContainer>;
}

export function BrowserExecutionChart() {
  return <ResponsiveContainer width="100%" height={270}><BarChart data={executionByBrowser} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} /><XAxis dataKey="browser" tick={tick} axisLine={false} tickLine={false} /><YAxis tick={tick} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: "12px" }} /><Bar dataKey="passed" name="Passed" stackId="status" fill="#22c55e" /><Bar dataKey="failed" name="Failed" stackId="status" fill="#ef4444" /><Bar dataKey="skipped" name="Skipped" stackId="status" fill="#94a3b8" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>;
}

/** ReportPortal — Launch Statistics stacked bar */
export function LaunchStatisticsChart() {
  return <ResponsiveContainer width="100%" height={260}><BarChart data={launchStatsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} /><XAxis dataKey="launch" tick={tick} axisLine={false} tickLine={false} /><YAxis tick={tick} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: "12px" }} /><Bar dataKey="passed" name="Passed" stackId="s" fill="#22c55e" /><Bar dataKey="failed" name="Failed" stackId="s" fill="#ef4444" /><Bar dataKey="skipped" name="Skipped" stackId="s" fill="#94a3b8" /><Bar dataKey="toInvestigate" name="To Investigate" stackId="s" fill="#f59e0b" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>;
}

/** ReportPortal — Failed cases trend line */
export function FailedCasesTrendChart() {
  return <ResponsiveContainer width="100%" height={220}><LineChart data={launchStatsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} /><XAxis dataKey="launch" tick={tick} axisLine={false} tickLine={false} /><YAxis tick={tick} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: "12px" }} /><Line type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: "#ef4444" }} activeDot={{ r: 6 }} /><Line type="monotone" dataKey="toInvestigate" name="To Investigate" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} /></LineChart></ResponsiveContainer>;
}

/** ReportPortal — Investigated % donut */
export function InvestigatedPctChart() {
  const total = investigatedPct.investigated + investigatedPct.toInvestigate;
  const pct = Math.round((investigatedPct.investigated / total) * 100);
  const data = [
    { name: "Automation Bug",  value: investigatedPct.automation,  fill: "#3b82f6" },
    { name: "System Issue",    value: investigatedPct.system,       fill: "#f59e0b" },
    { name: "Product Bug",     value: investigatedPct.productBug,   fill: "#ef4444" },
    { name: "To Investigate",  value: investigatedPct.toInvestigate, fill: "#e2e8f0" },
  ];
  return <div className="flex flex-col items-center gap-3">
    <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={58} outerRadius={82} paddingAngle={2} stroke="none">{data.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer>
    <div className="flex justify-center gap-3 text-xs"><span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-primary inline-block" />Auto</span><span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-warning inline-block" />System</span><span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-danger inline-block" />Bug</span><span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-muted-foreground inline-block" />Pending</span></div>
    <p className="text-2xl font-bold">{pct}%<span className="ml-1.5 text-sm font-normal text-muted-foreground">investigated</span></p>
  </div>;
}

/** ReportPortal — Failure duration range bars */
export function FailureDurationChart() {
  return <ResponsiveContainer width="100%" height={240}><BarChart data={failureDurationData} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} /><XAxis type="number" tick={tick} axisLine={false} tickLine={false} unit="s" /><YAxis type="category" dataKey="test" tick={tick} axisLine={false} tickLine={false} width={90} /><Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}s`]} /><Bar dataKey="avg" name="Avg duration" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>;
}

/** Most failed test sparkline dots */
export function TrendDots({ trend }: { trend: number[] }) {
  return <div className="flex items-center gap-0.5">{trend.map((v, i) => <span key={i} className={`size-2.5 rounded-sm ${v ? "bg-danger" : "bg-success"}`} />)}</div>;
}

import {
  LayoutDashboard, ClipboardList, Brain, FlaskConical, FileText, FileCheck2, Database, Bot,
  Play, Search, FileBarChart, CircleDot, HeartPulse, Bug, BarChart3, GitBranch, BookOpen, Settings, LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requirements", label: "Requirements", icon: ClipboardList },
  { href: "/analysis", label: "AI Analysis", icon: Brain },
  { href: "/scenarios", label: "Test Scenarios", icon: FlaskConical },
  { href: "/test-cases", label: "Test Cases", icon: FileText },
  { href: "/bdd", label: "BDD Builder", icon: FileCheck2 },
  { href: "/test-data", label: "Test Data", icon: Database },
  { href: "/automation", label: "Automation", icon: Bot },
  { href: "/recorder", label: "Recorder", icon: CircleDot },
  { href: "/business-flows", label: "Business Flows", icon: GitBranch },
  { href: "/execution", label: "Test Execution", icon: Play },
  { href: "/failure-analysis", label: "Failure Analysis", icon: Search, badge: "6" },
  { href: "/execution-report", label: "Execution Report", icon: FileBarChart },
  { href: "/self-healing", label: "Self-Healing", icon: HeartPulse },
  { href: "/defects", label: "Defects", icon: Bug, badge: "8" },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/traceability", label: "Traceability", icon: GitBranch },
  { href: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

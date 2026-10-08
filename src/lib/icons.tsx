import {
  Brain, CheckCircle2, FlaskConical, FileText, Bot, Play, AlertTriangle,
  HeartPulse, BarChart3, Search, History, Camera, BookOpen, Lightbulb,
  ClipboardList, Bug, LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  check: CheckCircle2,
  flask: FlaskConical,
  file: FileText,
  bot: Bot,
  play: Play,
  alert: AlertTriangle,
  heal: HeartPulse,
  report: BarChart3,
  search: Search,
  history: History,
  camera: Camera,
  book: BookOpen,
  bulb: Lightbulb,
  clipboard: ClipboardList,
  bug: Bug,
};

export function ActivityIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? CheckCircle2;
  return <Icon className={className} />;
}

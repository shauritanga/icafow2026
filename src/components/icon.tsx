import {
  BookOpen, Lightbulb, Network, MapPin, Briefcase, Scale, Sparkles,
  HeartPulse, Sprout, Landmark, GraduationCap, Building2, Database, Rocket,
  Handshake, TrendingUp, Cpu, Users, Globe, ShieldCheck, type LucideIcon, HelpCircle,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  BookOpen, Lightbulb, Network, MapPin, Briefcase, Scale, Sparkles,
  HeartPulse, Sprout, Landmark, GraduationCap, Building2, Database, Rocket,
  Handshake, TrendingUp, Cpu, Users, Globe, ShieldCheck,
};

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Cmp = map[name] ?? HelpCircle;
  return <Cmp className={className} aria-hidden />;
}

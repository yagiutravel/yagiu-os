import {
  Bot,
  Calendar,
  CalendarClock,
  ClipboardList,
  Compass,
  CreditCard,
  FileBarChart,
  FileText,
  LayoutDashboard,
  Map,
  MessageCircle,
  MessageSquare,
  Settings,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "AI Assistant", href: "/ai", icon: Bot },
  { label: "Clienti", href: "/clienti", icon: Users },
  { label: "Tour", href: "/tour", icon: Compass },
  { label: "Viaggi", href: "/viaggi", icon: Map },
  { label: "Calendario", href: "/calendario", icon: Calendar },
  { label: "Programmazione", href: "/programmazione", icon: CalendarClock },
  { label: "Automazioni", href: "/automazioni", icon: Workflow },
  { label: "Comunicazioni", href: "/comunicazioni", icon: MessageSquare },
  { label: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
  { label: "Pagamenti", href: "/pagamenti", icon: CreditCard },
  { label: "Preventivi", href: "/preventivi", icon: FileText },
  { label: "Report", href: "/report", icon: FileBarChart },
  { label: "Registro", href: "/registro", icon: ClipboardList },
  { label: "Impostazioni", href: "/impostazioni", icon: Settings },
];

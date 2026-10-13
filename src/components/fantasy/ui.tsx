import {
  BookOpen,
  Crosshair,
  Heart,
  House,
  Leaf,
  Map,
  Scale,
  Shield,
  Sparkles,
  Store,
  Swords,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Rarity, Role } from "@/game/characters";

const ROLE_ICON: Record<Role, LucideIcon> = {
  tank: Shield,
  striker: Swords,
  balanced: Scale,
  mage: Sparkles,
  healer: Heart,
  assassin: Zap,
  archer: Crosshair,
  support: Leaf,
};

export function RoleIcon({ role, className }: { role: Role; className?: string }) {
  const Icon = ROLE_ICON[role];
  return <Icon className={className ?? "h-4 w-4"} aria-hidden />;
}

export function Portrait({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      crossOrigin="anonymous"
      draggable={false}
      className={`object-contain ${className ?? ""}`}
    />
  );
}

export function ringClass(rarity: Rarity) {
  if (rarity === "epic") return "ring-epic";
  if (rarity === "rare") return "ring-rare";
  return "ring-common";
}

export function Bar({
  value,
  max,
  tone,
}: {
  value: number;
  max: number;
  tone: "teal" | "coral" | "gold";
}) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  const color = tone === "coral" ? "bg-coral" : tone === "gold" ? "bg-gold" : "bg-teal";
  return (
    <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden>
      <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export const NAV = [
  { id: "camp", label: "营地", icon: House },
  { id: "codex", label: "图鉴", icon: BookOpen },
  { id: "adventure", label: "闯关", icon: Map },
  { id: "arena", label: "竞技", icon: Swords },
  { id: "shop", label: "商店", icon: Store },
] as const;

export type TabId = (typeof NAV)[number]["id"];

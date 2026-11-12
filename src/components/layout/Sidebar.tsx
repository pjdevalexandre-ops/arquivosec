"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  FileText, 
  Folder, 
  Star, 
  Share2, 
  Trash2, 
  Settings, 
  HardDrive,
  ShieldCheck,
  Plus
} from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  storageUsed?: number;
  storageLimit?: number;
  onOpenUpload?: () => void;
  className?: string;
}

export function Sidebar({
  storageUsed = 48920150420, // ~48.9 GB
  storageLimit = 268435456000, // 250 GB
  onOpenUpload,
  className
}: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Início", href: "/", icon: Home },
    { name: "Documentos", href: "/documentos", icon: FileText },
    { name: "Pastas", href: "/pastas", icon: Folder },
    { name: "Favoritos", href: "/favoritos", icon: Star },
    { name: "Compartilhados", href: "/compartilhados", icon: Share2 },
    { name: "Lixeira", href: "/lixeira", icon: Trash2 },
    { name: "Configurações", href: "/configuracoes", icon: Settings },
  ];

  const percentageUsed = Math.min(100, Math.round((storageUsed / storageLimit) * 100));

  return (
    <aside className={cn(
      "w-64 flex-shrink-0 flex flex-col justify-between border-r border-border bg-card/60 backdrop-blur-md min-h-screen p-4 transition-all duration-200 select-none",
      className
    )}>
      <div className="space-y-6">
        {/* Brand Header */}
        <Link href="/" className="flex items-center space-x-2.5 px-2 py-1 group">
          <div className="h-9 w-9 rounded-lg bg-[#0F4C5C] flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-lg text-foreground tracking-tight">ArquivoSec</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#0F4C5C]/10 text-[#0F4C5C]">
                GOV
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">Gestão Documental em Nuvem</p>
          </div>
        </Link>

        {/* Action Button: Enviar Documentos */}
        {onOpenUpload && (
          <div className="px-1">
            <Button 
              onClick={onOpenUpload}
              className="w-full bg-[#0F4C5C] hover:bg-[#09333e] text-white shadow-sm font-medium flex items-center justify-center space-x-2 h-10 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              <span>Enviar documentos</span>
            </Button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#0F4C5C]/10 text-[#0F4C5C] font-semibold dark:bg-[#0F4C5C]/25 dark:text-cyan-400"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-[#0F4C5C] dark:text-cyan-400" : "text-muted-foreground")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Storage Meter - 250 GB Gauge */}
      <div className="mt-auto pt-4 border-t border-border/80">
        <div className="bg-muted/40 rounded-xl p-3 border border-border/60">
          <div className="flex items-center justify-between text-xs font-medium text-foreground mb-1.5">
            <div className="flex items-center space-x-1.5">
              <HardDrive className="h-3.5 w-3.5 text-[#0F4C5C]" />
              <span>Armazenamento</span>
            </div>
            <span className="text-muted-foreground">{percentageUsed}%</span>
          </div>

          <Progress 
            value={percentageUsed} 
            className="h-1.5 bg-muted" 
            indicatorClassName="bg-[#0F4C5C]"
          />

          <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-2">
            <span>{formatBytes(storageUsed, 1)}</span>
            <span>de {formatBytes(storageLimit, 0)}</span>
          </div>

          <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center space-x-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cloudflare R2 Ativo</span>
            </span>
            <span className="font-mono">250 GB</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  FileText, 
  Folder, 
  Plus, 
  Settings, 
  Star 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onOpenUpload?: () => void;
}

export function MobileBottomNav({ onOpenUpload }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Início", href: "/", icon: Home },
    { label: "Documentos", href: "/documentos", icon: FileText },
    { label: "Pastas", href: "/pastas", icon: Folder },
    { label: "Favoritos", href: "/favoritos", icon: Star },
    { label: "Ajustes", href: "/configuracoes", icon: Settings },
  ];

  return (
    <nav 
      aria-label="Navegação inferior mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border shadow-elevated pb-safe"
    >
      <div className="flex items-center justify-around h-16 px-1 relative">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 text-center transition-colors touch-manipulation",
                isActive ? "text-[#0F4C5C] dark:text-cyan-400 font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] leading-tight tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Botão Central de Destaque: Enviar Documentos (FAB) */}
        {onOpenUpload && (
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={onOpenUpload}
              aria-label="Enviar novos documentos"
              className="h-12 w-12 rounded-full bg-[#0F4C5C] hover:bg-[#09333e] text-white shadow-lg flex items-center justify-center -translate-y-2 active:scale-95 transition-all touch-manipulation"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
        )}

        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 text-center transition-colors touch-manipulation",
                isActive ? "text-[#0F4C5C] dark:text-cyan-400 font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] leading-tight tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import React from "react";
import { 
  Upload, 
  Eye, 
  Download, 
  Share2, 
  Trash2, 
  Star, 
  Tag as TagIcon,
  Clock
} from "lucide-react";
import { ActivityLog } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

interface RecentActivityProps {
  activities: ActivityLog[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActionBadge = (action: ActivityLog["action"]) => {
    switch (action) {
      case "upload":
        return { label: "Envio", icon: Upload, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" };
      case "view":
        return { label: "Visualização", icon: Eye, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50" };
      case "download":
        return { label: "Download", icon: Download, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50" };
      case "share":
        return { label: "Compartilhou", icon: Share2, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50" };
      case "delete":
        return { label: "Lixeira", icon: Trash2, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50" };
      case "favorite":
        return { label: "Favoritou", icon: Star, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50" };
      case "tag":
        return { label: "Etiquetou", icon: TagIcon, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50" };
      default:
        return { label: "Ação", icon: Clock, color: "text-slate-600 bg-slate-50 dark:bg-slate-900" };
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-soft">
      <div className="p-4 border-b border-border/80 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Trilha de Auditoria</h3>
          <p className="text-xs text-muted-foreground">Registro automático de operações e segurança</p>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
          Ativo
        </span>
      </div>

      <div className="divide-y divide-border/60">
        {activities.slice(0, 6).map((log) => {
          const actionMeta = getActionBadge(log.action);
          const Icon = actionMeta.icon;

          return (
            <div key={log.id} className="p-3.5 flex items-start space-x-3 text-xs">
              <div className={`p-1.5 rounded-lg ${actionMeta.color} flex-shrink-0 mt-0.5`}>
                <Icon className="h-3.5 w-3.5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-foreground leading-snug">
                  <span className="font-semibold">{actionMeta.label}: </span>
                  <span className="text-muted-foreground">
                    {log.document?.title || "Documento oficial"}
                  </span>
                </p>

                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  {formatRelativeTime(log.created_at)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

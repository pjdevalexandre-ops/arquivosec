"use client";

import React from "react";
import { HardDrive, FileText, CheckCircle2, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";
import { DocumentType } from "@/types";

interface StorageOverviewProps {
  storageUsedBytes: number;
  storageLimitBytes: number;
  totalDocuments: number;
  documentTypes: DocumentType[];
  onUploadClick?: () => void;
}

export function StorageOverview({
  storageUsedBytes = 0,
  storageLimitBytes = 268435456000, // 250 GB
  totalDocuments = 0,
  documentTypes = [],
  onUploadClick,
}: StorageOverviewProps) {
  const percentage = Math.min(100, Math.round((storageUsedBytes / storageLimitBytes) * 100));
  const availableBytes = Math.max(0, storageLimitBytes - storageUsedBytes);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 max-w-full">
      {/* Card 1: Medidor Principal de 250 GB */}
      <Card className="lg:col-span-2 border-border/80 bg-gradient-to-br from-card via-card to-[#0F4C5C]/5">
        <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="h-10 w-10 rounded-xl bg-[#0F4C5C]/10 text-[#0F4C5C] flex items-center justify-center flex-shrink-0">
                <HardDrive className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm sm:text-base font-bold text-foreground truncate">
                  Armazenamento em Nuvem
                </CardTitle>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                  Bucket Seguro Dedicado (Cloudflare R2)
                </p>
              </div>
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#0F4C5C] bg-[#0F4C5C]/10 px-2.5 py-1 rounded-full whitespace-nowrap">
              {percentage}% Usado
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-1 space-y-3 sm:space-y-4">
          <div>
            <Progress 
              value={percentage} 
              className="h-2.5 sm:h-3 rounded-full bg-muted" 
              indicatorClassName="bg-gradient-to-r from-[#0F4C5C] to-teal-600"
            />
            <div className="flex justify-between items-center text-[11px] sm:text-xs text-muted-foreground mt-2 font-medium">
              <span className="font-semibold text-foreground">
                {formatBytes(storageUsedBytes, 1)} ocupados
              </span>
              <span>
                {formatBytes(availableBytes, 1)} livres de <strong>250 GB</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3 border-t border-border/60">
            <div className="p-2 sm:p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground block truncate">Total Arquivos</span>
              <span className="text-base sm:text-lg font-bold text-foreground font-mono">{totalDocuments}</span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground block truncate">Criptografia</span>
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 mt-0.5 truncate">
                <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
                <span>AES-256</span>
              </span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground block truncate">Conformidade</span>
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 mt-0.5 truncate">
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                <span>LGPD</span>
              </span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground block truncate">Busca OCR</span>
              <span className="text-[11px] sm:text-xs font-semibold text-teal-700 dark:text-teal-400 block mt-0.5 truncate">
                Português (BR)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Ação Rápida */}
      <Card className="border-border/80 flex flex-col justify-between">
        <CardHeader className="p-4 sm:p-5 pb-2">
          <CardTitle className="text-xs sm:text-sm font-bold flex items-center justify-between">
            <span>Guarda Oficial</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </CardTitle>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            Digitalização rápida e controle de integridade documental.
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-1 space-y-3">
          <div className="bg-[#0F4C5C]/5 border border-[#0F4C5C]/20 rounded-lg p-2.5 sm:p-3 text-xs text-[#0F4C5C] space-y-1">
            <p className="font-semibold text-xs">Proteção com URLs Assinadas</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              O acesso aos arquivos ocorre somente via tokens com expiração curta de 15 minutos.
            </p>
          </div>

          <button
            onClick={onUploadClick}
            className="w-full min-h-[44px] py-2.5 px-3 bg-[#0F4C5C] hover:bg-[#09333e] text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-sm active:scale-[0.98] touch-manipulation"
          >
            <span>Enviar Documento</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

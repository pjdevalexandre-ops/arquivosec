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
  storageUsedBytes = 48920150420,
  storageLimitBytes = 268435456000,
  totalDocuments = 150,
  documentTypes = [],
  onUploadClick,
}: StorageOverviewProps) {
  const percentage = Math.min(100, Math.round((storageUsedBytes / storageLimitBytes) * 100));
  const availableBytes = Math.max(0, storageLimitBytes - storageUsedBytes);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Card 1: Medidor Principal de 250 GB */}
      <Card className="lg:col-span-2 border-border/80 bg-gradient-to-br from-card via-card to-[#0F4C5C]/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-9 w-9 rounded-lg bg-[#0F4C5C]/10 text-[#0F4C5C] flex items-center justify-center">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Armazenamento Governamental</CardTitle>
                <p className="text-xs text-muted-foreground">Cota dedicada de alta capacidade em nuvem segura (Cloudflare R2)</p>
              </div>
            </div>
            <span className="text-sm font-bold text-[#0F4C5C] bg-[#0F4C5C]/10 px-2.5 py-1 rounded-full">
              {percentage}% Utilizado
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          <div>
            <Progress 
              value={percentage} 
              className="h-3 rounded-full bg-muted" 
              indicatorClassName="bg-gradient-to-r from-[#0F4C5C] to-teal-600"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
              <span className="font-semibold text-foreground">
                {formatBytes(storageUsedBytes, 1)} utilizados
              </span>
              <span>
                {formatBytes(availableBytes, 1)} livres de <strong>250 GB</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/60">
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-[11px] text-muted-foreground block">Total Documentos</span>
              <span className="text-lg font-bold text-foreground">{totalDocuments}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-[11px] text-muted-foreground block">Criptografia</span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 mt-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>AES-256 R2</span>
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-[11px] text-muted-foreground block">Auditoria LGPD</span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 mt-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Ativa</span>
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-[11px] text-muted-foreground block">Indexação OCR</span>
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 block mt-1">
                Português (BR)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Ação Rápida e Destaque de Conformidade */}
      <Card className="border-border/80 flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span>Repositório Oficial</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Acesso rápido à digitalização e guarda permanente de atos administrativos.
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="bg-[#0F4C5C]/5 border border-[#0F4C5C]/20 rounded-lg p-3 text-xs text-[#0F4C5C] space-y-1">
            <p className="font-semibold">Proteção com URLs Assinadas</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Nenhum documento fica público. O acesso aos arquivos ocorre somente via tokens temporários de expiração curta.
            </p>
          </div>

          <button
            onClick={onUploadClick}
            className="w-full py-2.5 px-3 bg-[#0F4C5C] hover:bg-[#09333e] text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <span>Fazer Novo Envio</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

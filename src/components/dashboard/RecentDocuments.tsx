"use client";

import React from "react";
import Link from "next/link";
import { FileText, ArrowRight, Sparkles, Upload, Shield } from "lucide-react";
import { DocumentItem } from "@/types";
import { formatBytes, formatDate, getFileTypeBadge } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RecentDocumentsProps {
  documents: DocumentItem[];
  onShareDoc?: (doc: DocumentItem) => void;
  onOpenUpload?: () => void;
}

export function RecentDocuments({ documents, onShareDoc, onOpenUpload }: RecentDocumentsProps) {
  const recent = documents.filter((d) => !d.is_trashed).slice(0, 6);

  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-soft">
      <div className="p-4 border-b border-border/80 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Documentos Recentes</h3>
          <p className="text-xs text-muted-foreground">Últimos arquivos digitalizados e indexados no sistema</p>
        </div>
        {recent.length > 0 && (
          <Link
            href="/documentos"
            className="text-xs font-medium text-[#0F4C5C] hover:underline flex items-center space-x-1"
          >
            <span>Ver todos</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="p-10 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-[#0F4C5C]/10 text-[#0F4C5C] flex items-center justify-center mx-auto">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Seu acervo seguro está pronto</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              Comece enviando seus primeiros ofícios, contratos, notas fiscais ou processos digitalizados para guarda na nuvem.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/documentos"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#0F4C5C] hover:bg-[#09333e] text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Acessar Documentos</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {recent.map((doc) => {
            const badge = getFileTypeBadge(doc.mime_type, doc.file_extension);

            return (
              <div
                key={doc.id}
                className="p-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-[#0F4C5C] flex-shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <Link
                        href={`/documentos/${doc.id}`}
                        className="text-xs sm:text-sm font-semibold text-foreground hover:text-[#0F4C5C] transition-colors truncate block"
                      >
                        {doc.title}
                      </Link>
                      {doc.ocr_status === "completed" && (
                        <span title="OCR Concluído" className="text-emerald-600 flex-shrink-0">
                          <Sparkles className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-muted-foreground mt-0.5">
                      <span className={`text-[9px] font-bold px-1 rounded border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {doc.document_number && <span>{doc.document_number}</span>}
                      {doc.folder && (
                        <span className="hidden sm:inline">• {doc.folder.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs text-muted-foreground flex-shrink-0">
                  <span className="hidden sm:inline">{formatDate(doc.document_date || doc.created_at)}</span>
                  <span className="font-mono text-[11px]">{formatBytes(doc.file_size_bytes)}</span>
                  <Link
                    href={`/documentos/${doc.id}`}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  >
                    Abrir
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

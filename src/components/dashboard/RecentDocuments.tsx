"use client";

import React from "react";
import Link from "next/link";
import { FileText, ArrowRight, Sparkles } from "lucide-react";
import { DocumentItem } from "@/types";
import { formatBytes, formatDate, getFileTypeBadge } from "@/lib/utils";

interface RecentDocumentsProps {
  documents: DocumentItem[];
  onShareDoc?: (doc: DocumentItem) => void;
}

export function RecentDocuments({ documents, onShareDoc }: RecentDocumentsProps) {
  const recent = documents.filter((d) => !d.is_trashed).slice(0, 6);

  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-soft">
      <div className="p-4 border-b border-border/80 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Documentos Recentes</h3>
          <p className="text-xs text-muted-foreground">Últimos arquivos digitalizados e indexados no sistema</p>
        </div>
        <Link
          href="/documentos"
          className="text-xs font-medium text-[#0F4C5C] hover:underline flex items-center space-x-1"
        >
          <span>Ver todos os documentos</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

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
    </div>
  );
}

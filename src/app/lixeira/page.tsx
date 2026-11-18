"use client";

import React, { useState, useEffect } from "react";
import { 
  Trash2, 
  RotateCcw, 
  FileText, 
  Clock, 
  Loader2 
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { DocumentItem } from "@/types";
import { formatBytes, formatDate } from "@/lib/utils";

export default function LixeiraPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTrash() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/documents?trashed=true");
        if (res.ok) {
          const { documents: dbDocs } = await res.json();
          if (dbDocs) setDocuments(dbDocs);
        }
      } catch (err) {
        console.warn("Erro ao carregar lixeira:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTrash();
  }, []);

  const trashedDocs = documents.filter((d) => d.is_trashed);

  const handleRestore = async (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_trashed: false, trashed_at: null } : d))
    );

    try {
      await fetch(`/api/documents/${id}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
    } catch (_) {}
  };

  const handlePermanentDelete = async (id: string) => {
    if (
      confirm(
        "ATENÇÃO: A exclusão definitiva removerá o arquivo permanentemente do Cloudflare R2 e do banco de dados institucional. Deseja continuar?"
      )
    ) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      try {
        await fetch(`/api/documents/${id}/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "permanent" }),
        });
      } catch (_) {}
    }
  };

  const handleEmptyTrash = async () => {
    if (
      confirm(
        "ATENÇÃO: Deseja esvaziar permanentemente toda a lixeira? Esta ação removerá definitivamente todos os arquivos do bucket R2 e não poderá ser desfeita."
      )
    ) {
      const docsToRemove = [...trashedDocs];
      setDocuments((prev) => prev.filter((d) => !d.is_trashed));

      for (const doc of docsToRemove) {
        try {
          await fetch(`/api/documents/${doc.id}/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "permanent" }),
          });
        } catch (_) {}
      }
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5 sm:space-y-6 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Trash2 className="h-6 w-6 text-rose-500" />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                Lixeira do Sistema
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Itens excluídos permanecem retidos preventivamente contra perdas acidentais.
            </p>
          </div>

          {trashedDocs.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="touch-target min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 active:scale-95 self-start sm:self-auto shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span>Esvaziar Lixeira</span>
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-[#0F4C5C] animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Carregando itens da lixeira...</p>
          </div>
        ) : trashedDocs.length === 0 ? (
          <div className="p-10 sm:p-12 text-center bg-card border border-border rounded-2xl space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-foreground">A lixeira está vazia</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Nenhum documento foi descartado recentemente. Arquivos excluídos no acervo aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-border">
              {trashedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start sm:items-center space-x-3">
                    <div className="h-9 w-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-1">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground flex items-center space-x-2 mt-0.5">
                        <span>{formatBytes(doc.file_size_bytes)}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                          <Clock className="h-3 w-3" />
                          <span>Excluído em {formatDate(doc.trashed_at || doc.updated_at)}</span>
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleRestore(doc.id)}
                      className="touch-target px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold flex items-center space-x-1.5 text-foreground active:scale-95 transition-all"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-[#0F4C5C]" />
                      <span>Restaurar</span>
                    </button>

                    <button
                      onClick={() => handlePermanentDelete(doc.id)}
                      className="touch-target px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95 transition-all"
                    >
                      Expurgar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

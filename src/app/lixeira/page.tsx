"use client";

import React, { useState } from "react";
import { 
  Trash2, 
  RotateCcw, 
  FileText, 
  XOctagon, 
  Clock 
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { mockDocuments } from "@/lib/mock-data";
import { DocumentItem } from "@/types";
import { formatBytes, formatDate } from "@/lib/utils";

export default function LixeiraPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);

  const trashedDocs = documents.filter((d) => d.is_trashed);

  const handleRestore = async (id: string) => {
    try {
      await fetch(`/api/documents/${id}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      }).catch(() => {});
    } finally {
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, is_trashed: false, trashed_at: null } : d))
      );
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirm("ATENÇÃO: A exclusão definitiva removerá o arquivo permanentemente do Cloudflare R2 e do banco de dados. Deseja continuar?")) {
      try {
        await fetch(`/api/documents/${id}/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "permanent" }),
        }).catch(() => {});
      } finally {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (confirm("ATENÇÃO: Deseja esvaziar toda a lixeira? Esta ação não pode ser desfeita.")) {
      for (const doc of trashedDocs) {
        try {
          await fetch(`/api/documents/${doc.id}/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "permanent" }),
          }).catch(() => {});
        } catch (_) {}
      }
      setDocuments((prev) => prev.filter((d) => !d.is_trashed));
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
              Itens excluídos permanecem retidos por 30 dias para prevenção contra perdas acidentais.
            </p>
          </div>

          {trashedDocs.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="touch-target min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 active:scale-95 self-start sm:self-auto"
            >
              <XOctagon className="h-4 w-4" />
              <span>Esvaziar Lixeira</span>
            </button>
          )}
        </div>

        {/* Aviso de Política de Retenção */}
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start space-x-3 text-xs text-amber-800 dark:text-amber-300">
          <Clock className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <p className="leading-relaxed text-[11px] sm:text-xs">
            Seus arquivos originais permanecem protegidos no Cloudflare R2 enquanto estiverem na lixeira. Você pode restaurá-los a qualquer momento antes do expurgo automático de 30 dias.
          </p>
        </div>

        {/* Lista de Itens na Lixeira */}
        <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-soft">
          {trashedDocs.length === 0 ? (
            <div className="p-10 sm:p-12 text-center space-y-2">
              <Trash2 className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <h3 className="font-bold text-sm text-foreground">A lixeira está vazia</h3>
              <p className="text-xs text-muted-foreground">
                Nenhum documento aguardando expiração ou descarte.
              </p>
            </div>
          ) : (
            <>
              {/* Tabela Desktop (sm:table) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3 pl-4">Documento</th>
                      <th className="p-3">Excluído em</th>
                      <th className="p-3">Tamanho</th>
                      <th className="p-3 text-right pr-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {trashedDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 pl-4">
                          <div className="flex items-center space-x-2.5">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <span className="font-semibold text-foreground truncate block">
                                {doc.title}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                {doc.file_name}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-muted-foreground whitespace-nowrap">
                          {formatDate(doc.trashed_at || doc.updated_at)}
                        </td>

                        <td className="p-3 text-muted-foreground whitespace-nowrap font-mono">
                          {formatBytes(doc.file_size_bytes)}
                        </td>

                        <td className="p-3 text-right pr-4 whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRestore(doc.id)}
                              className="h-7 text-xs flex items-center space-x-1"
                            >
                              <RotateCcw className="h-3 w-3 text-emerald-600" />
                              <span>Restaurar</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handlePermanentDelete(doc.id)}
                              className="h-7 text-xs flex items-center space-x-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Excluir Definitivo</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards Mobile (sm:hidden) */}
              <div className="block sm:hidden divide-y divide-border/60">
                {trashedDocs.map((doc) => (
                  <div key={doc.id} className="p-3.5 space-y-2.5">
                    <div>
                      <p className="font-bold text-xs text-foreground line-clamp-1 truncate">
                        {doc.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {formatBytes(doc.file_size_bytes)} • Excluído: {formatDate(doc.trashed_at || doc.updated_at)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => handleRestore(doc.id)}
                        className="flex-1 touch-target min-h-[44px] rounded-xl border border-border bg-background text-xs font-bold flex items-center justify-center space-x-1.5 active:bg-muted text-emerald-700"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Restaurar</span>
                      </button>

                      <button
                        onClick={() => handlePermanentDelete(doc.id)}
                        className="flex-1 touch-target min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 active:scale-95"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

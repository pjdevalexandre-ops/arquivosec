"use client";

import React, { useState } from "react";
import { 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
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

  const handleRestore = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_trashed: false, trashed_at: null } : d))
    );
  };

  const handlePermanentDelete = (id: string) => {
    if (confirm("ATENÇÃO: A exclusão definitiva removerá o arquivo permanentemente do Cloudflare R2 e do banco de dados. Deseja continuar?")) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const handleEmptyTrash = () => {
    if (confirm("ATENÇÃO: Deseja esvaziar toda a lixeira? Esta ação não pode ser desfeita.")) {
      setDocuments((prev) => prev.filter((d) => !d.is_trashed));
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
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
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEmptyTrash}
              className="h-9 text-xs flex items-center space-x-1.5"
            >
              <XOctagon className="h-4 w-4" />
              <span>Esvaziar Lixeira</span>
            </Button>
          )}
        </div>

        {/* Aviso de Política de Retenção */}
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start space-x-3 text-xs text-amber-800 dark:text-amber-300">
          <Clock className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <p className="leading-relaxed">
            Conforme política de segurança, documentos nesta pasta serão automaticamente purgados após 30 dias a partir da data de exclusão.
          </p>
        </div>

        {/* Lista de Itens na Lixeira */}
        <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-soft">
          {trashedDocs.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Trash2 className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <h3 className="font-semibold text-sm text-foreground">A lixeira está vazia</h3>
              <p className="text-xs text-muted-foreground">
                Nenhum documento aguardando expiração ou descarte.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3 pl-4">Documento</th>
                    <th className="p-3 hidden sm:table-cell">Excluído em</th>
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
                            <span className="text-[11px] text-muted-foreground">
                              {doc.file_name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
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
          )}
        </div>
      </div>
    </AppLayout>
  );
}

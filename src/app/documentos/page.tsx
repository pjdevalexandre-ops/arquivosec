"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentFilterBar } from "@/components/documents/DocumentFilterBar";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentTableRow } from "@/components/documents/DocumentTableRow";
import { BatchActionBar } from "@/components/documents/BatchActionBar";
import { ShareModal } from "@/components/sharing/ShareModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DocumentItem, Folder, DocumentType, Tag } from "@/types";
import { FileQuestion, FolderInput, Loader2, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function DocumentosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("busca") || "";

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [sharingDoc, setSharingDoc] = useState<DocumentItem | null>(null);

  // Modal para mover documento(s) em lote ou individualmente
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [targetMoveFolderId, setTargetMoveFolderId] = useState<string>("");
  const [isMoving, setIsMoving] = useState(false);

  // Busca documentos e metadados dinâmicos da API
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [docsRes, foldersRes, typesRes, tagsRes] = await Promise.all([
        fetch("/api/documents"),
        fetch("/api/folders"),
        fetch("/api/types"),
        fetch("/api/tags"),
      ]);

      if (docsRes.ok) {
        const data = await docsRes.json();
        if (data.documents) {
          setDocuments(data.documents);
        }
      }

      if (foldersRes.ok) {
        const fData = await foldersRes.json();
        if (fData.folders) setFolders(fData.folders);
      }

      if (typesRes.ok) {
        const tData = await typesRes.json();
        if (tData.types) setDocumentTypes(tData.types);
      }

      if (tagsRes.ok) {
        const tgData = await tagsRes.json();
        if (tgData.tags) setTags(tgData.tags);
      }
    } catch (err) {
      console.warn("Erro ao carregar acervo documental:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtragem e busca
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        if (doc.is_trashed) return false;

        // Filtro por termo de busca
        if (queryParam) {
          const q = queryParam.toLowerCase();
          const matchesTitle = doc.title.toLowerCase().includes(q);
          const matchesNum = doc.document_number?.toLowerCase().includes(q);
          const matchesNotes = doc.notes?.toLowerCase().includes(q);
          const matchesOcr = doc.ocr_text?.toLowerCase().includes(q);
          const matchesSector = doc.origin_sector?.toLowerCase().includes(q);
          const matchesTags = doc.tags?.some((t) => t.name.toLowerCase().includes(q));

          if (
            !matchesTitle &&
            !matchesNum &&
            !matchesNotes &&
            !matchesOcr &&
            !matchesSector &&
            !matchesTags
          ) {
            return false;
          }
        }

        // Filtro por pasta
        if (selectedFolderId && doc.folder_id !== selectedFolderId) {
          return false;
        }

        // Filtro por tipo
        if (selectedTypeId && doc.type_id !== selectedTypeId) {
          return false;
        }

        // Filtro por tag
        if (selectedTagId && !doc.tags?.some((t) => t.id === selectedTagId)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date_doc":
            return (
              new Date(b.document_date || b.created_at).getTime() -
              new Date(a.document_date || a.created_at).getTime()
            );
          case "title_asc":
            return a.title.localeCompare(b.title);
          case "title_desc":
            return b.title.localeCompare(a.title);
          case "size_desc":
            return b.file_size_bytes - a.file_size_bytes;
          case "size_asc":
            return a.file_size_bytes - b.file_size_bytes;
          case "recent":
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [documents, queryParam, selectedFolderId, selectedTypeId, selectedTagId, sortBy]);

  // Limpa seleção se os filtros mudarem e os selecionados não existirem mais na lista
  useEffect(() => {
    const validIds = new Set(filteredDocuments.map((d) => d.id));
    setSelectedDocIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [filteredDocuments]);

  const handleSelectDoc = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedDocIds((prev) => Array.from(new Set([...prev, id])));
    } else {
      setSelectedDocIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocIds(filteredDocuments.map((d) => d.id));
    } else {
      setSelectedDocIds([]);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    const newFav = !doc?.is_favorite;

    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_favorite: newFav } : d))
    );

    try {
      await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_favorite: newFav }),
      });
    } catch (_) {}
  };

  const handleDeleteDoc = async (id: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, is_trashed: true, trashed_at: new Date().toISOString() }
          : d
      )
    );

    try {
      await fetch(`/api/documents/${id}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trash" }),
      });
    } catch (_) {}
  };

  const handleBatchDelete = async () => {
    const idsToDelete = [...selectedDocIds];
    if (idsToDelete.length === 0) return;

    if (
      !confirm(
        `Deseja mover os ${idsToDelete.length} documento(s) selecionado(s) para a lixeira?`
      )
    ) {
      return;
    }

    setDocuments((prev) =>
      prev.map((d) =>
        idsToDelete.includes(d.id)
          ? { ...d, is_trashed: true, trashed_at: new Date().toISOString() }
          : d
      )
    );
    setSelectedDocIds([]);

    try {
      await fetch("/api/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsToDelete, action: "trash" }),
      });
    } catch (_) {}
  };

  const handleBatchFavorite = async () => {
    const idsToFav = [...selectedDocIds];
    if (idsToFav.length === 0) return;

    setDocuments((prev) =>
      prev.map((d) =>
        idsToFav.includes(d.id) ? { ...d, is_favorite: true } : d
      )
    );
    setSelectedDocIds([]);

    try {
      await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsToFav, is_favorite: true }),
      });
    } catch (_) {}
  };

  const handleExecuteBatchMove = async () => {
    if (selectedDocIds.length === 0) return;
    setIsMoving(true);

    try {
      const folderVal = targetMoveFolderId === "__none__" ? null : targetMoveFolderId;
      const targetFolderObj = folders.find((f) => f.id === folderVal) || null;

      await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedDocIds,
          folder_id: folderVal,
        }),
      });

      setDocuments((prev) =>
        prev.map((d) =>
          selectedDocIds.includes(d.id)
            ? { ...d, folder_id: folderVal, folder: targetFolderObj }
            : d
        )
      );

      setSelectedDocIds([]);
      setIsMoveModalOpen(false);
    } catch (e) {
      console.error("Erro ao mover em lote:", e);
    } finally {
      setIsMoving(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedFolderId("");
    setSelectedTypeId("");
    setSelectedTagId("");
    setSelectedDocIds([]);
    if (queryParam) {
      router.push("/documentos");
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Documentos Oficiais
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {queryParam ? (
              <span>
                Resultados da busca por: <strong>&ldquo;{queryParam}&rdquo;</strong>
              </span>
            ) : (
              "Gerencie e localize processos, ofícios, notas fiscais e contratos digitalizados."
            )}
          </p>
        </div>
      </div>

      {/* Barra de Filtros e Visualização */}
      <DocumentFilterBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        folders={folders}
        documentTypes={documentTypes}
        tags={tags}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        selectedTypeId={selectedTypeId}
        onSelectType={setSelectedTypeId}
        selectedTagId={selectedTagId}
        onSelectTag={setSelectedTagId}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        totalCount={filteredDocuments.length}
      />

      {/* Carregamento com Skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        /* Estados Vazios */
        <div className="p-10 sm:p-14 text-center bg-card border border-border rounded-2xl space-y-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <FileQuestion className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base text-foreground">
            {queryParam || selectedFolderId || selectedTypeId || selectedTagId
              ? "Nenhum documento encontrado com os filtros aplicados"
              : "Nenhum documento cadastrado no acervo"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {queryParam || selectedFolderId || selectedTypeId || selectedTagId
              ? "Tente ajustar os termos de pesquisa ou remover as opções de filtros selecionadas."
              : "Utilize o botão '+ Novo Documento' no topo ou na barra de navegação para iniciar a guarda digital."}
          </p>
          {(queryParam || selectedFolderId || selectedTypeId || selectedTagId) && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="rounded-xl text-xs"
              >
                Limpar todos os filtros
              </Button>
            </div>
          )}
        </div>
      ) : viewMode === "list" ? (
        /* Modo Lista / Tabela */
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-3 bg-muted/40 border-b border-border flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                aria-label="Selecionar todos os documentos visíveis"
                checked={
                  filteredDocuments.length > 0 &&
                  filteredDocuments.every((d) => selectedDocIds.includes(d.id))
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-input text-[#0F4C5C] focus:ring-[#0F4C5C] h-4 w-4"
              />
              <span>Documento / Título Oficial</span>
            </div>
            <span className="hidden sm:inline">Ações</span>
          </div>

          <div className="divide-y divide-border">
            {filteredDocuments.map((doc) => (
              <DocumentTableRow
                key={doc.id}
                document={doc}
                isSelected={selectedDocIds.includes(doc.id)}
                onSelect={(id, selected) => handleSelectDoc(id, selected)}
                onToggleFavorite={handleToggleFavorite}
                onShare={setSharingDoc}
                onDelete={handleDeleteDoc}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Modo Grade / Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              isSelected={selectedDocIds.includes(doc.id)}
              onSelect={(id, selected) => handleSelectDoc(id, selected)}
              onToggleFavorite={handleToggleFavorite}
              onShare={setSharingDoc}
              onDelete={handleDeleteDoc}
            />
          ))}
        </div>
      )}

      {/* Barra de Ações em Lote */}
      <BatchActionBar
        selectedIds={selectedDocIds}
        onClearSelection={() => setSelectedDocIds([])}
        onBatchMove={() => {
          setTargetMoveFolderId(folders[0]?.id || "__none__");
          setIsMoveModalOpen(true);
        }}
        onBatchFavorite={handleBatchFavorite}
        onBatchDelete={handleBatchDelete}
      />

      {/* Modal para Mover em Lote */}
      <Dialog open={isMoveModalOpen} onOpenChange={setIsMoveModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-base font-bold">
              <FolderInput className="h-5 w-5 text-[#0F4C5C]" />
              <span>Mover {selectedDocIds.length} documento(s) para pasta</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <label className="text-xs font-semibold text-foreground block">
              Selecione a pasta de destino:
            </label>
            <select
              value={targetMoveFolderId}
              onChange={(e) => setTargetMoveFolderId(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-[#0F4C5C]"
            >
              <option value="__none__">Sem pasta (Raiz / Geral)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isMoving}
              onClick={() => setIsMoveModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={isMoving}
              onClick={handleExecuteBatchMove}
              className="bg-[#0F4C5C] hover:bg-[#0c3e4b] text-white rounded-xl text-xs font-semibold"
            >
              {isMoving ? "Movendo..." : "Confirmar Movimentação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Compartilhamento Temporário */}
      <ShareModal
        isOpen={Boolean(sharingDoc)}
        onClose={() => setSharingDoc(null)}
        document={sharingDoc}
      />
    </div>
  );
}

export default function DocumentosPage() {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-muted-foreground">
            Carregando acervo documental...
          </div>
        }
      >
        <DocumentosContent />
      </Suspense>
    </AppLayout>
  );
}

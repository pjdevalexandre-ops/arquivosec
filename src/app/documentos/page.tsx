"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentFilterBar } from "@/components/documents/DocumentFilterBar";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentTableRow } from "@/components/documents/DocumentTableRow";
import { BatchActionBar } from "@/components/documents/BatchActionBar";
import { ShareModal } from "@/components/sharing/ShareModal";
import { 
  mockDocuments as initialDocs, 
  mockFolders, 
  mockDocumentTypes, 
  mockTags 
} from "@/lib/mock-data";
import { DocumentItem } from "@/types";
import { FileQuestion } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function DocumentosContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("busca") || "";

  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocs);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [sharingDoc, setSharingDoc] = useState<DocumentItem | null>(null);

  // Filtragem e busca
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
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

        if (!matchesTitle && !matchesNum && !matchesNotes && !matchesOcr && !matchesSector && !matchesTags) {
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
    }).sort((a, b) => {
      switch (sortBy) {
        case "date_doc":
          return new Date(b.document_date || b.created_at).getTime() - new Date(a.document_date || a.created_at).getTime();
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

  const handleSelectDoc = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedDocIds((prev) => [...prev, id]);
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

  const handleToggleFavorite = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_favorite: !d.is_favorite } : d))
    );
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_trashed: true, trashed_at: new Date().toISOString() } : d))
    );
  };

  const handleBatchDelete = () => {
    setDocuments((prev) =>
      prev.map((d) =>
        selectedDocIds.includes(d.id)
          ? { ...d, is_trashed: true, trashed_at: new Date().toISOString() }
          : d
      )
    );
    setSelectedDocIds([]);
  };

  const handleBatchFavorite = () => {
    setDocuments((prev) =>
      prev.map((d) =>
        selectedDocIds.includes(d.id) ? { ...d, is_favorite: true } : d
      )
    );
    setSelectedDocIds([]);
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
              "Gerencie e localize processos, ofícios e contratos digitalizados."
            )}
          </p>
        </div>
      </div>

      {/* Barra de Filtros e Visualização */}
      <DocumentFilterBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        folders={mockFolders}
        documentTypes={mockDocumentTypes}
        tags={mockTags}
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

      {/* Lista ou Grade de Documentos */}
      {filteredDocuments.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/80 rounded-2xl space-y-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <FileQuestion className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base text-foreground">Nenhum documento encontrado</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Tente ajustar os filtros selecionados ou digite outros termos de busca.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              isSelected={selectedDocIds.includes(doc.id)}
              onSelect={handleSelectDoc}
              onToggleFavorite={handleToggleFavorite}
              onShare={setSharingDoc}
              onDelete={handleDeleteDoc}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3 pl-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredDocuments.length > 0 &&
                        selectedDocIds.length === filteredDocuments.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-[#0F4C5C] focus:ring-[#0F4C5C] cursor-pointer"
                    />
                  </th>
                  <th className="p-3 w-10 text-center">Fav</th>
                  <th className="p-3">Documento</th>
                  <th className="p-3 hidden md:table-cell">Pasta</th>
                  <th className="p-3 hidden sm:table-cell">Data do Doc</th>
                  <th className="p-3">Tamanho</th>
                  <th className="p-3 hidden lg:table-cell">Tags</th>
                  <th className="p-3 text-right pr-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <DocumentTableRow
                    key={doc.id}
                    document={doc}
                    isSelected={selectedDocIds.includes(doc.id)}
                    onSelect={handleSelectDoc}
                    onToggleFavorite={handleToggleFavorite}
                    onShare={setSharingDoc}
                    onDelete={handleDeleteDoc}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Barra Flutuante de Ações em Lote */}
      <BatchActionBar
        selectedIds={selectedDocIds}
        onClearSelection={() => setSelectedDocIds([])}
        onBatchFavorite={handleBatchFavorite}
        onBatchDelete={handleBatchDelete}
      />

      {/* Modal de Compartilhamento */}
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
      <Suspense fallback={<div className="p-8"><Skeleton className="h-32 w-full rounded-xl" /></div>}>
        <DocumentosContent />
      </Suspense>
    </AppLayout>
  );
}

"use client";

import React from "react";
import { 
  LayoutGrid, 
  List, 
  Filter, 
  Folder as FolderIcon, 
  Tag as TagIcon, 
  FileCheck, 
  X
} from "lucide-react";
import { Folder, DocumentType, Tag } from "@/types";

interface DocumentFilterBarProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  folders: Folder[];
  documentTypes: DocumentType[];
  tags: Tag[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  selectedTypeId: string;
  onSelectType: (id: string) => void;
  selectedTagId: string;
  onSelectTag: (id: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  totalCount: number;
}

export function DocumentFilterBar({
  viewMode,
  onViewModeChange,
  folders,
  documentTypes,
  tags,
  selectedFolderId,
  onSelectFolder,
  selectedTypeId,
  onSelectType,
  selectedTagId,
  onSelectTag,
  sortBy,
  onSortByChange,
  totalCount,
}: DocumentFilterBarProps) {
  const hasActiveFilters = Boolean(selectedFolderId || selectedTypeId || selectedTagId);

  const clearFilters = () => {
    onSelectFolder("");
    onSelectType("");
    onSelectTag("");
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl p-3 sm:p-4 shadow-soft space-y-3 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Contagem e Limpar Filtros */}
        <div className="flex items-center space-x-2">
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            {totalCount} {totalCount === 1 ? "documento" : "documentos"}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center space-x-1 pl-2 border-l border-border touch-manipulation min-h-[32px]"
            >
              <X className="h-3.5 w-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        {/* Ordenação e Alternador de Visualização (Grade / Lista) */}
        <div className="flex items-center justify-between sm:justify-end space-x-2">
          <div className="flex items-center space-x-1.5 flex-1 sm:flex-initial">
            <span className="text-xs text-muted-foreground hidden md:inline">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full sm:w-auto min-h-[40px] sm:min-h-[32px] h-10 sm:h-8 text-base sm:text-xs rounded-lg border border-input bg-background px-2.5 text-foreground focus:ring-1 focus:ring-[#0F4C5C]"
            >
              <option value="recent">Mais recentes</option>
              <option value="date_doc">Data do documento</option>
              <option value="title_asc">Título (A-Z)</option>
              <option value="title_desc">Título (Z-A)</option>
              <option value="size_desc">Tamanho (Maior)</option>
              <option value="size_asc">Tamanho (Menor)</option>
            </select>
          </div>

          <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/40">
            <button
              onClick={() => onViewModeChange("list")}
              className={`touch-target p-2 sm:p-1.5 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-card shadow-sm text-[#0F4C5C] font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Visualização em Lista"
              aria-label="Visualização em Lista"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              className={`touch-target p-2 sm:p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-card shadow-sm text-[#0F4C5C] font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Visualização em Grade"
              aria-label="Visualização em Grade"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Linha de Filtros Responsivos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/60">
        {/* Filtro por Pasta */}
        <div className="flex items-center space-x-1.5">
          <FolderIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <select
            value={selectedFolderId}
            onChange={(e) => onSelectFolder(e.target.value)}
            className="w-full min-h-[40px] sm:min-h-[32px] h-10 sm:h-8 text-base sm:text-xs rounded-lg border border-input bg-background px-2 text-foreground"
          >
            <option value="">Todas as Pastas</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Tipo */}
        <div className="flex items-center space-x-1.5">
          <FileCheck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <select
            value={selectedTypeId}
            onChange={(e) => onSelectType(e.target.value)}
            className="w-full min-h-[40px] sm:min-h-[32px] h-10 sm:h-8 text-base sm:text-xs rounded-lg border border-input bg-background px-2 text-foreground"
          >
            <option value="">Todos os Tipos</option>
            {documentTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Tag */}
        <div className="flex items-center space-x-1.5">
          <TagIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <select
            value={selectedTagId}
            onChange={(e) => onSelectTag(e.target.value)}
            className="w-full min-h-[40px] sm:min-h-[32px] h-10 sm:h-8 text-base sm:text-xs rounded-lg border border-input bg-background px-2 text-foreground"
          >
            <option value="">Todas as Tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>#{t.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

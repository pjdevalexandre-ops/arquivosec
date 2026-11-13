"use client";

import React from "react";
import Link from "next/link";
import { 
  FileText, 
  Star, 
  Share2, 
  Trash2, 
  Sparkles,
  Folder as FolderIcon
} from "lucide-react";
import { DocumentItem } from "@/types";
import { formatBytes, formatDate, getFileTypeBadge } from "@/lib/utils";

interface DocumentTableRowProps {
  document: DocumentItem;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onToggleFavorite?: (id: string) => void;
  onShare?: (doc: DocumentItem) => void;
  onDelete?: (id: string) => void;
}

export function DocumentTableRow({
  document,
  isSelected = false,
  onSelect,
  onToggleFavorite,
  onShare,
  onDelete,
}: DocumentTableRowProps) {
  const badge = getFileTypeBadge(document.mime_type, document.file_extension);

  return (
    <tr className={`border-b border-border/80 transition-colors hover:bg-muted/40 ${
      isSelected ? "bg-[#0F4C5C]/5" : ""
    }`}>
      {/* Checkbox com área de toque */}
      <td className="p-3 pl-4 w-10">
        <label className="touch-target p-1 -m-1 cursor-pointer flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect?.(document.id, e.target.checked)}
            className="h-4 w-4 rounded border-border text-[#0F4C5C] focus:ring-[#0F4C5C] cursor-pointer"
          />
        </label>
      </td>

      {/* Favorito */}
      <td className="p-3 w-10 text-center">
        <button
          onClick={() => onToggleFavorite?.(document.id)}
          aria-label={document.is_favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="touch-target p-1 text-muted-foreground hover:text-amber-500 transition-colors"
          title={document.is_favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Star
            className={`h-4 w-4 ${
              document.is_favorite ? "fill-amber-400 text-amber-500" : ""
            }`}
          />
        </button>
      </td>

      {/* Documento (Título, Número, Tipo) */}
      <td className="p-3 min-w-[260px]">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-[#0F4C5C] flex-shrink-0">
            <FileText className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <Link
                href={`/documentos/${document.id}`}
                className="font-bold text-xs sm:text-sm text-foreground hover:text-[#0F4C5C] transition-colors truncate max-w-md block"
              >
                {document.title}
              </Link>
              {document.ocr_status === "completed" && (
                <span title="Texto extraído com OCR" className="text-emerald-600 flex-shrink-0">
                  <Sparkles className="h-3 w-3" />
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-muted-foreground mt-0.5">
              <span className={`text-[9px] font-bold px-1 rounded border ${badge.bg}`}>
                {badge.label}
              </span>
              {document.document_number && (
                <span className="font-mono">{document.document_number}</span>
              )}
              {document.origin_sector && (
                <span className="hidden sm:inline">• {document.origin_sector}</span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Pasta */}
      <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">
        <div className="flex items-center space-x-1.5">
          <FolderIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="truncate max-w-[130px]">{document.folder?.name || "Sem pasta"}</span>
        </div>
      </td>

      {/* Data */}
      <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">
        {formatDate(document.document_date || document.created_at)}
      </td>

      {/* Tamanho */}
      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap font-mono">
        {formatBytes(document.file_size_bytes)}
      </td>

      {/* Tags */}
      <td className="p-3 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {document.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
            >
              #{tag.name}
            </span>
          ))}
          {(document.tags?.length || 0) > 2 && (
            <span className="text-[10px] text-muted-foreground font-mono">
              +{(document.tags?.length || 0) - 2}
            </span>
          )}
        </div>
      </td>

      {/* Ações */}
      <td className="p-3 text-right whitespace-nowrap pr-4">
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => onShare?.(document)}
            aria-label="Compartilhar documento"
            className="touch-target p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
            title="Compartilhar"
          >
            <Share2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDelete?.(document.id)}
            aria-label="Excluir documento"
            className="touch-target p-1.5 text-muted-foreground hover:text-rose-600 rounded-lg"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

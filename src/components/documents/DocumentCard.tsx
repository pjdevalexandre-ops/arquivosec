"use client";

import React from "react";
import Link from "next/link";
import { 
  FileText, 
  Star, 
  Share2, 
  Trash2, 
  Sparkles,
  Calendar
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { DocumentItem } from "@/types";
import { formatBytes, formatDate, getFileTypeBadge } from "@/lib/utils";

interface DocumentCardProps {
  document: DocumentItem;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onToggleFavorite?: (id: string) => void;
  onShare?: (doc: DocumentItem) => void;
  onDelete?: (id: string) => void;
}

export function DocumentCard({
  document,
  isSelected = false,
  onSelect,
  onToggleFavorite,
  onShare,
  onDelete,
}: DocumentCardProps) {
  const badge = getFileTypeBadge(document.mime_type, document.file_extension);

  return (
    <Card className={`group relative flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:shadow-card hover:border-[#0F4C5C]/40 rounded-2xl ${
      isSelected ? "border-[#0F4C5C] bg-[#0F4C5C]/5" : "bg-card"
    }`}>
      {/* Top Bar inside Card com Touch Targets */}
      <div className="p-3.5 sm:p-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          {/* Checkbox de Seleção */}
          <div className="flex items-center space-x-2">
            <label className="touch-target p-1 -m-1 cursor-pointer flex items-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect?.(document.id, e.target.checked)}
                className="h-5 w-5 rounded border-border text-[#0F4C5C] focus:ring-[#0F4C5C] cursor-pointer"
              />
            </label>
            <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border ${badge.bg}`}>
              {badge.label}
            </span>
            {document.type && (
              <span 
                className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full truncate max-w-[100px]"
                style={{ backgroundColor: `${document.type.color}15`, color: document.type.color }}
              >
                {document.type.name}
              </span>
            )}
          </div>

          {/* Favoritar Touch-Friendly */}
          <button
            onClick={() => onToggleFavorite?.(document.id)}
            aria-label={document.is_favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            className="touch-target text-muted-foreground hover:text-amber-500 transition-colors p-2 -mr-1"
            title={document.is_favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Star
              className={`h-4 w-4 ${
                document.is_favorite ? "fill-amber-400 text-amber-500" : ""
              }`}
            />
          </button>
        </div>

        {/* Thumbnail / Card Central */}
        <Link href={`/documentos/${document.id}`} className="block my-2.5 touch-manipulation">
          <div className="h-24 sm:h-28 rounded-xl bg-muted/40 border border-border/60 flex flex-col items-center justify-center p-3 text-center group-hover:bg-[#0F4C5C]/5 transition-colors relative overflow-hidden">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#0F4C5C]/10 text-[#0F4C5C] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground truncate w-full px-2">
              {document.file_name}
            </span>

            {/* Status do OCR */}
            {document.ocr_status === "completed" && (
              <span className="absolute bottom-1.5 right-1.5 flex items-center space-x-1 text-[9px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="h-2.5 w-2.5" />
                <span>OCR</span>
              </span>
            )}
          </div>
        </Link>

        {/* Título e Número */}
        <div>
          <Link href={`/documentos/${document.id}`} className="touch-manipulation">
            <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 hover:text-[#0F4C5C] transition-colors leading-snug">
              {document.title}
            </h4>
          </Link>

          {document.document_number && (
            <p className="text-[10px] sm:text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
              Ref: {document.document_number}
            </p>
          )}
        </div>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {document.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rodapé do Card com Metadados e Ações com Touch Targets */}
      <div className="p-3 sm:p-4 pt-2 border-t border-border/80 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex flex-col text-[10px] sm:text-[11px]">
          <span className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(document.document_date || document.created_at)}</span>
          </span>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-mono mt-0.5">
            {formatBytes(document.file_size_bytes)}
          </span>
        </div>

        <div className="flex items-center space-x-0.5">
          <button
            onClick={() => onShare?.(document)}
            aria-label="Compartilhar documento"
            className="touch-target p-2 text-muted-foreground hover:text-foreground rounded-lg"
            title="Compartilhar"
          >
            <Share2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDelete?.(document.id)}
            aria-label="Mover para lixeira"
            className="touch-target p-2 text-muted-foreground hover:text-rose-600 rounded-lg"
            title="Mover para lixeira"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { 
  FileText, 
  Star, 
  MoreVertical, 
  Download, 
  Share2, 
  Trash2, 
  Folder as FolderIcon,
  Sparkles,
  Calendar
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <Card className={`group relative flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:shadow-card hover:border-[#0F4C5C]/40 ${
      isSelected ? "border-[#0F4C5C] bg-[#0F4C5C]/5" : "bg-card"
    }`}>
      {/* Top Bar inside Card */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          {/* Checkbox de Seleção Múltipla */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect?.(document.id, e.target.checked)}
              className="h-4 w-4 rounded border-border text-[#0F4C5C] focus:ring-[#0F4C5C] cursor-pointer"
            />
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badge.bg}`}>
              {badge.label}
            </span>
            {document.type && (
              <span 
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${document.type.color}15`, color: document.type.color }}
              >
                {document.type.name}
              </span>
            )}
          </div>

          {/* Favoritar rápido */}
          <button
            onClick={() => onToggleFavorite?.(document.id)}
            className="text-muted-foreground hover:text-amber-500 transition-colors p-1"
            title={document.is_favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Star
              className={`h-4 w-4 ${
                document.is_favorite ? "fill-amber-400 text-amber-500" : ""
              }`}
            />
          </button>
        </div>

        {/* Thumbnail ou Ícone de Pré-visualização */}
        <Link href={`/documentos/${document.id}`} className="block my-3">
          <div className="h-28 rounded-lg bg-muted/40 border border-border/60 flex flex-col items-center justify-center p-3 text-center group-hover:bg-[#0F4C5C]/5 transition-colors relative overflow-hidden">
            <div className="h-10 w-10 rounded-lg bg-[#0F4C5C]/10 text-[#0F4C5C] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-mono text-muted-foreground truncate w-full px-2">
              {document.file_name}
            </span>

            {/* Status do OCR */}
            {document.ocr_status === "completed" && (
              <span className="absolute bottom-1.5 right-1.5 flex items-center space-x-1 text-[9px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="h-2.5 w-2.5" />
                <span>OCR Pronto</span>
              </span>
            )}
            {document.ocr_status === "processing" && (
              <span className="absolute bottom-1.5 right-1.5 flex items-center space-x-1 text-[9px] text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200">
                <Sparkles className="h-2.5 w-2.5 animate-spin" />
                <span>OCR...</span>
              </span>
            )}
          </div>
        </Link>

        {/* Título e Número */}
        <div>
          <Link href={`/documentos/${document.id}`}>
            <h4 className="text-sm font-semibold text-foreground line-clamp-2 hover:text-[#0F4C5C] transition-colors leading-snug">
              {document.title}
            </h4>
          </Link>

          {document.document_number && (
            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
              Ref: {document.document_number}
            </p>
          )}
        </div>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {document.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rodapé do Card com Metadados e Ações */}
      <div className="p-4 pt-2 border-t border-border/80 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex flex-col text-[11px]">
          <span className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(document.document_date || document.created_at)}</span>
          </span>
          <span className="text-[10px] text-muted-foreground/80 mt-0.5">
            {formatBytes(document.file_size_bytes)}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onShare?.(document)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Compartilhar"
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete?.(document.id)}
            className="h-7 w-7 text-muted-foreground hover:text-rose-600"
            title="Mover para lixeira"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

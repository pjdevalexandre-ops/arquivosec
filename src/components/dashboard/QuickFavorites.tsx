"use client";

import React from "react";
import Link from "next/link";
import { Star, FileText, ArrowRight } from "lucide-react";
import { DocumentItem } from "@/types";
import { formatBytes, formatDate } from "@/lib/utils";

interface QuickFavoritesProps {
  documents: DocumentItem[];
}

export function QuickFavorites({ documents }: QuickFavoritesProps) {
  const favorites = documents.filter((d) => d.is_favorite && !d.is_trashed).slice(0, 4);

  if (favorites.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">Favoritos Recentes</h3>
        </div>
        <Link
          href="/favoritos"
          className="text-xs font-medium text-[#0F4C5C] hover:underline flex items-center space-x-1"
        >
          <span>Ver todos</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {favorites.map((doc) => (
          <Link
            key={doc.id}
            href={`/documentos/${doc.id}`}
            className="p-3 min-h-[56px] bg-card border border-border/80 rounded-xl hover:border-[#0F4C5C]/50 hover:shadow-soft transition-all flex items-center group touch-manipulation"
          >
            <div className="flex items-start space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#0F4C5C]/10 text-[#0F4C5C] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate group-hover:text-[#0F4C5C] transition-colors">
                  {doc.title}
                </p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                  <span>{formatDate(doc.document_date || doc.created_at)}</span>
                  <span>{formatBytes(doc.file_size_bytes)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

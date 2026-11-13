"use client";

import React from "react";
import { 
  FolderInput, 
  Tag as TagIcon, 
  Star, 
  Trash2, 
  X, 
  CheckSquare 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BatchActionBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onBatchMove?: () => void;
  onBatchFavorite?: () => void;
  onBatchTag?: () => void;
  onBatchDelete?: () => void;
}

export function BatchActionBar({
  selectedIds,
  onClearSelection,
  onBatchMove,
  onBatchFavorite,
  onBatchTag,
  onBatchDelete,
}: BatchActionBarProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white px-3 sm:px-4 py-2 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center space-x-2 sm:space-x-3 text-xs animate-in slide-in-from-bottom-5 w-[92vw] sm:w-auto max-w-lg justify-between backdrop-blur-md">
      <div className="flex items-center space-x-1.5 sm:space-x-2 pr-2 sm:pr-3 border-r border-slate-700">
        <CheckSquare className="h-4 w-4 text-cyan-400 flex-shrink-0" />
        <span className="font-semibold whitespace-nowrap">{selectedIds.length} sel.</span>
        <button
          onClick={onClearSelection}
          className="touch-target p-1 text-slate-400 hover:text-white"
          title="Desmarcar todos"
          aria-label="Desmarcar seleção"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-1.5">
        <button
          onClick={onBatchFavorite}
          className="touch-target px-2 sm:px-3 py-1.5 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-slate-800 flex items-center space-x-1 active:scale-95"
        >
          <Star className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden sm:inline">Favoritar</span>
        </button>

        <button
          onClick={onBatchDelete}
          className="touch-target px-2 sm:px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 flex items-center space-x-1 active:scale-95"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Excluir</span>
        </button>
      </div>
    </div>
  );
}

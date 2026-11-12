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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-xs animate-in slide-in-from-bottom-5">
      <div className="flex items-center space-x-2 pr-3 border-r border-slate-700">
        <CheckSquare className="h-4 w-4 text-cyan-400" />
        <span className="font-semibold">{selectedIds.length} selecionado{selectedIds.length > 1 ? "s" : ""}</span>
        <button
          onClick={onClearSelection}
          className="text-slate-400 hover:text-white p-0.5 ml-1"
          title="Desmarcar todos"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center space-x-1.5">
        <Button
          size="sm"
          variant="ghost"
          onClick={onBatchMove}
          className="h-8 text-xs text-slate-200 hover:text-white hover:bg-slate-800 flex items-center space-x-1"
        >
          <FolderInput className="h-3.5 w-3.5" />
          <span>Mover</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onBatchFavorite}
          className="h-8 text-xs text-slate-200 hover:text-white hover:bg-slate-800 flex items-center space-x-1"
        >
          <Star className="h-3.5 w-3.5 text-amber-400" />
          <span>Favoritar</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onBatchTag}
          className="h-8 text-xs text-slate-200 hover:text-white hover:bg-slate-800 flex items-center space-x-1"
        >
          <TagIcon className="h-3.5 w-3.5 text-blue-400" />
          <span>Etiquetar</span>
        </Button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <Button
          size="sm"
          variant="ghost"
          onClick={onBatchDelete}
          className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 flex items-center space-x-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Excluir</span>
        </Button>
      </div>
    </div>
  );
}

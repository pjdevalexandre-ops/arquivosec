"use client";

import React, { useState } from "react";
import { 
  Folder as FolderIcon, 
  FolderPlus, 
  ChevronRight, 
  ChevronDown, 
  Edit2, 
  Trash2, 
  FolderOpen 
} from "lucide-react";
import { Folder } from "@/types";

interface FolderTreeProps {
  folders: Folder[];
  activeFolderId?: string;
  onSelectFolder: (folder: Folder) => void;
  onCreateSubfolder?: (parentId: string) => void;
  onRenameFolder?: (folder: Folder) => void;
  onDeleteFolder?: (folderId: string) => void;
}

export function FolderTree({
  folders,
  activeFolderId,
  onSelectFolder,
  onCreateSubfolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    f2: true,
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const rootFolders = folders.filter((f) => !f.parent_id);
  const getSubfolders = (parentId: string) => folders.filter((f) => f.parent_id === parentId);

  const renderFolderItem = (folder: Folder, depth = 0) => {
    const subfolders = getSubfolders(folder.id);
    const hasChildren = subfolders.length > 0;
    const isExpanded = Boolean(expanded[folder.id]);
    const isActive = activeFolderId === folder.id;

    return (
      <div key={folder.id} className="space-y-0.5">
        <div
          onClick={() => onSelectFolder(folder)}
          className={`flex items-center justify-between min-h-[44px] sm:min-h-[38px] py-2 px-2.5 rounded-xl text-xs cursor-pointer group transition-colors touch-manipulation active:scale-[0.99] ${
            isActive
              ? "bg-[#0F4C5C]/10 text-[#0F4C5C] font-semibold dark:bg-[#0F4C5C]/30 dark:text-cyan-400"
              : "text-foreground hover:bg-muted/70"
          }`}
          style={{ paddingLeft: `${Math.max(10, depth * 18)}px` }}
        >
          <div className="flex items-center space-x-2 truncate min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => toggleExpand(folder.id, e)}
                aria-label={isExpanded ? "Recolher subpasta" : "Expandir subpasta"}
                className="touch-target p-1 hover:bg-muted rounded text-muted-foreground flex-shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-5 flex-shrink-0" />
            )}

            {isActive ? (
              <FolderOpen className="h-4 w-4 text-[#0F4C5C] dark:text-cyan-400 flex-shrink-0" />
            ) : (
              <FolderIcon
                className="h-4 w-4 flex-shrink-0"
                style={{ color: folder.color || "#0F4C5C" }}
              />
            )}

            <span className="truncate text-xs sm:text-sm font-medium">{folder.name}</span>
            {folder.document_count !== undefined && (
              <span className="text-[10px] text-muted-foreground font-mono">
                ({folder.document_count})
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateSubfolder?.(folder.id);
              }}
              title="Nova subpasta"
              aria-label="Criar subpasta"
              className="touch-target p-1.5 text-muted-foreground hover:text-foreground"
            >
              <FolderPlus className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRenameFolder?.(folder);
              }}
              title="Renomear"
              aria-label="Renomear pasta"
              className="touch-target p-1.5 text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFolder?.(folder.id);
              }}
              title="Excluir"
              aria-label="Excluir pasta"
              className="touch-target p-1.5 text-muted-foreground hover:text-rose-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {subfolders.map((sub) => renderFolderItem(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1 max-w-full">
      {rootFolders.map((root) => renderFolderItem(root, 0))}
    </div>
  );
}

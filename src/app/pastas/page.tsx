"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Folder as FolderIcon, 
  FolderPlus, 
  ChevronRight, 
  Home, 
  FileText, 
  Plus, 
  Edit2, 
  Trash2 
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FolderTree } from "@/components/folders/FolderTree";
import { DocumentTableRow } from "@/components/documents/DocumentTableRow";
import { ShareModal } from "@/components/sharing/ShareModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { mockFolders, mockDocuments } from "@/lib/mock-data";
import { Folder, DocumentItem } from "@/types";

export default function PastasPage() {
  const [folders, setFolders] = useState<Folder[]>(mockFolders);
  const [activeFolder, setActiveFolder] = useState<Folder>(mockFolders[0]);
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);
  const [sharingDoc, setSharingDoc] = useState<DocumentItem | null>(null);

  // Modal para criar/renomear pasta
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "rename">("create");
  const [folderName, setFolderName] = useState("");
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  const folderDocuments = documents.filter(
    (d) => d.folder_id === activeFolder.id && !d.is_trashed
  );

  const handleOpenCreateModal = (parentId: string | null = null) => {
    setModalMode("create");
    setFolderName("");
    setParentFolderId(parentId);
    setIsFolderModalOpen(true);
  };

  const handleOpenRenameModal = (folder: Folder) => {
    setModalMode("rename");
    setEditingFolder(folder);
    setFolderName(folder.name);
    setIsFolderModalOpen(true);
  };

  const handleSaveFolder = () => {
    if (!folderName.trim()) return;

    if (modalMode === "create") {
      const newFolder: Folder = {
        id: `f-${Date.now()}`,
        user_id: activeFolder.user_id,
        parent_id: parentFolderId,
        name: folderName.trim(),
        color: "#0F4C5C",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        document_count: 0,
      };
      setFolders((prev) => [...prev, newFolder]);
      setActiveFolder(newFolder);
    } else if (editingFolder) {
      setFolders((prev) =>
        prev.map((f) => (f.id === editingFolder.id ? { ...f, name: folderName.trim() } : f))
      );
      if (activeFolder.id === editingFolder.id) {
        setActiveFolder((prev) => ({ ...prev, name: folderName.trim() }));
      }
    }

    setIsFolderModalOpen(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (confirm("Tem certeza que deseja excluir esta pasta? Documentos dentro dela serão mantidos sem pasta.")) {
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      if (activeFolder.id === folderId) {
        setActiveFolder(folders[0]);
      }
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Gerenciamento de Pastas
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Estruturação hierárquica por setores, secretarias e exercícios fiscais.
            </p>
          </div>

          <Button
            onClick={() => handleOpenCreateModal(null)}
            className="bg-[#0F4C5C] hover:bg-[#09333e] text-white flex items-center space-x-1.5 h-9 text-xs"
          >
            <FolderPlus className="h-4 w-4" />
            <span>Nova Pasta Raiz</span>
          </Button>
        </div>

        {/* Grade: Árvore à Esquerda + Conteúdo da Pasta à Direita */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Coluna 1: Árvore de Pastas (4 colunas) */}
          <div className="md:col-span-4 bg-card border border-border/80 rounded-xl p-4 shadow-soft space-y-3">
            <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
              <span className="text-xs font-semibold text-foreground">Diretórios Oficiais</span>
              <span className="text-[10px] text-muted-foreground">{folders.length} pastas</span>
            </div>

            <FolderTree
              folders={folders}
              activeFolderId={activeFolder.id}
              onSelectFolder={setActiveFolder}
              onCreateSubfolder={(parentId) => handleOpenCreateModal(parentId)}
              onRenameFolder={handleOpenRenameModal}
              onDeleteFolder={handleDeleteFolder}
            />
          </div>

          {/* Coluna 2: Documentos da Pasta Selecionada (8 colunas) */}
          <div className="md:col-span-8 space-y-4">
            {/* Breadcrumb da Navegação */}
            <div className="p-3 bg-muted/30 border border-border/80 rounded-xl flex items-center justify-between text-xs">
              <nav className="flex items-center space-x-2 text-muted-foreground">
                <Link href="/" className="hover:text-foreground">
                  <Home className="h-3.5 w-3.5" />
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="hover:text-foreground">Pastas</span>
                <ChevronRight className="h-3 w-3" />
                <span className="font-semibold text-[#0F4C5C] dark:text-cyan-400">
                  {activeFolder.name}
                </span>
              </nav>

              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenRenameModal(activeFolder)}
                  className="h-7 text-xs text-muted-foreground"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Renomear
                </Button>
              </div>
            </div>

            {/* Lista de Documentos da Pasta */}
            <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-soft">
              <div className="p-3.5 border-b border-border/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-foreground">
                    Documentos em &ldquo;{activeFolder.name}&rdquo;
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {folderDocuments.length} arquivo{folderDocuments.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {folderDocuments.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <FolderIcon className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                  <p className="text-xs font-medium text-foreground">Esta pasta está vazia</p>
                  <p className="text-[11px] text-muted-foreground">
                    Arraste documentos para cá ou utilize o botão &ldquo;Enviar documentos&rdquo;.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-2.5 pl-4 w-10">Sel</th>
                        <th className="p-2.5 w-8">Fav</th>
                        <th className="p-2.5">Documento</th>
                        <th className="p-2.5 hidden sm:table-cell">Data</th>
                        <th className="p-2.5">Tamanho</th>
                        <th className="p-2.5 text-right pr-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {folderDocuments.map((doc) => (
                        <DocumentTableRow
                          key={doc.id}
                          document={doc}
                          onShare={setSharingDoc}
                          onToggleFavorite={(id) => {
                            setDocuments((prev) =>
                              prev.map((d) => (d.id === id ? { ...d, is_favorite: !d.is_favorite } : d))
                            );
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Criação / Edição de Pasta */}
        <Dialog open={isFolderModalOpen} onOpenChange={setIsFolderModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#0F4C5C]">
                {modalMode === "create" ? "Criar Nova Pasta" : "Renomear Pasta"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <label className="text-xs font-medium text-foreground block">Nome da Pasta</label>
              <Input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Ex: Contratos de Obras 2025"
                className="h-9 text-xs"
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button variant="ghost" size="sm" onClick={() => setIsFolderModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveFolder}
                disabled={!folderName.trim()}
                className="bg-[#0F4C5C] text-white"
              >
                Salvar Pasta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Compartilhamento */}
        <ShareModal
          isOpen={Boolean(sharingDoc)}
          onClose={() => setSharingDoc(null)}
          document={sharingDoc}
        />
      </div>
    </AppLayout>
  );
}

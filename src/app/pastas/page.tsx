"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Folder as FolderIcon, 
  FolderPlus, 
  ChevronRight, 
  Home, 
  FileText, 
  Edit2, 
  Trash2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FolderTree } from "@/components/folders/FolderTree";
import { DocumentTableRow } from "@/components/documents/DocumentTableRow";
import { ShareModal } from "@/components/sharing/ShareModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Folder, DocumentItem } from "@/types";
import { formatBytes, formatDate } from "@/lib/utils";

export default function PastasPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolder, setActiveFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [sharingDoc, setSharingDoc] = useState<DocumentItem | null>(null);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);

  // Modal para criar/renomear pasta
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "rename">("create");
  const [folderName, setFolderName] = useState("");
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);

  // Carrega pastas e documentos reais do banco
  const loadData = async () => {
    try {
      setIsLoadingFolders(true);
      const [foldersRes, docsRes] = await Promise.all([
        fetch("/api/folders"),
        fetch("/api/documents"),
      ]);

      if (foldersRes.ok) {
        const { folders: dbFolders } = await foldersRes.json();
        if (dbFolders) {
          setFolders(dbFolders);
          if (dbFolders.length > 0) {
            setActiveFolder(dbFolders[0]);
          } else {
            setActiveFolder(null);
          }
        }
      }

      if (docsRes.ok) {
        const { documents: dbDocs } = await docsRes.json();
        if (dbDocs) {
          setDocuments(dbDocs);
        }
      }
    } catch (err) {
      console.warn("Erro ao carregar dados de pastas:", err);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const folderDocuments = activeFolder
    ? documents.filter((d) => d.folder_id === activeFolder.id && !d.is_trashed)
    : [];

  const handleOpenCreateModal = (parentId: string | null = null) => {
    setModalMode("create");
    setFolderName("");
    setFolderError(null);
    setParentFolderId(parentId);
    setIsFolderModalOpen(true);
  };

  const handleOpenRenameModal = (folder: Folder) => {
    setModalMode("rename");
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderError(null);
    setIsFolderModalOpen(true);
  };

  const handleSaveFolder = async () => {
    if (!folderName.trim()) {
      setFolderError("Digite um nome para a pasta.");
      return;
    }
    setIsSaving(true);
    setFolderError(null);

    try {
      if (modalMode === "create") {
        const res = await fetch("/api/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: folderName.trim(),
            parent_id: parentFolderId,
            color: "#0F4C5C",
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Falha ao criar pasta.");
        }

        setFolders((prev) => [...prev, data.folder]);
        setActiveFolder(data.folder);
        setIsFolderModalOpen(false);
      } else if (editingFolder) {
        const res = await fetch("/api/folders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingFolder.id,
            name: folderName.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Falha ao renomear pasta.");
        }

        setFolders((prev) =>
          prev.map((f) => (f.id === editingFolder.id ? { ...f, name: folderName.trim() } : f))
        );
        if (activeFolder?.id === editingFolder.id) {
          setActiveFolder((prev) => (prev ? { ...prev, name: folderName.trim() } : null));
        }
        setIsFolderModalOpen(false);
      }
    } catch (err: any) {
      setFolderError(err.message || "Erro ao salvar pasta.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (
      confirm(
        "Tem certeza que deseja excluir esta pasta? Documentos dentro dela serão mantidos sem pasta (Raiz)."
      )
    ) {
      try {
        await fetch(`/api/folders?id=${folderId}`, { method: "DELETE" });
        setFolders((prev) => {
          const remaining = prev.filter((f) => f.id !== folderId);
          if (activeFolder?.id === folderId) {
            setActiveFolder(remaining.length > 0 ? remaining[0] : null);
          }
          return remaining;
        });
        // Atualiza documentos locais
        setDocuments((prev) =>
          prev.map((d) => (d.folder_id === folderId ? { ...d, folder_id: null } : d))
        );
      } catch (err) {
        console.error("Erro ao excluir pasta:", err);
      }
    }
  };

  const handleDeleteDoc = async (id: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, is_trashed: true, trashed_at: new Date().toISOString() }
          : d
      )
    );

    try {
      await fetch(`/api/documents/${id}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trash" }),
      });
    } catch (_) {}
  };

  const handleToggleFavorite = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    const newFav = !doc?.is_favorite;

    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_favorite: newFav } : d))
    );

    try {
      await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_favorite: newFav }),
      });
    } catch (_) {}
  };

  return (
    <AppLayout>
      <div className="space-y-5 sm:space-y-6 max-w-full">
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

          <button
            onClick={() => handleOpenCreateModal(null)}
            className="touch-target min-h-[44px] px-4 py-2 bg-[#0F4C5C] hover:bg-[#09333e] text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 active:scale-95 shadow-sm self-start sm:self-auto"
          >
            <FolderPlus className="h-4 w-4" />
            <span>Nova Pasta</span>
          </button>
        </div>

        {/* Loading ou Conteúdo */}
        {isLoadingFolders ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-[#0F4C5C] animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Carregando estrutura de pastas...</p>
          </div>
        ) : folders.length === 0 ? (
          /* Estado Vazio de Pastas */
          <div className="p-12 text-center bg-card border border-border rounded-2xl max-w-lg mx-auto space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <FolderIcon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-base text-foreground">Nenhuma pasta cadastrada</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Crie pastas temáticas para classificar e organizar os documentos da sua repartição (ex: Gabinete, Licitações, Recursos Humanos).
            </p>
            <div className="pt-2">
              <Button
                onClick={() => handleOpenCreateModal(null)}
                className="bg-[#0F4C5C] hover:bg-[#09333e] text-white rounded-xl text-xs font-semibold"
              >
                <FolderPlus className="h-4 w-4 mr-1.5" />
                Criar Primeira Pasta
              </Button>
            </div>
          </div>
        ) : (
          /* Grade: Árvore à Esquerda + Conteúdo da Pasta à Direita */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* Coluna 1: Árvore de Pastas */}
            <div className="md:col-span-4 bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-xs font-bold text-foreground">Diretórios Cadastrados</span>
                <span className="text-[10px] text-muted-foreground font-mono">{folders.length} pasta(s)</span>
              </div>

              <FolderTree
                folders={folders}
                activeFolderId={activeFolder?.id || ""}
                onSelectFolder={setActiveFolder}
                onCreateSubfolder={(parentId) => handleOpenCreateModal(parentId)}
                onRenameFolder={handleOpenRenameModal}
                onDeleteFolder={handleDeleteFolder}
              />
            </div>

            {/* Coluna 2: Documentos da Pasta Selecionada */}
            <div className="md:col-span-8 space-y-3 sm:space-y-4">
              {activeFolder && (
                <>
                  {/* Breadcrumb da Navegação */}
                  <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-center justify-between text-xs gap-2">
                    <nav className="flex items-center space-x-1.5 sm:space-x-2 text-muted-foreground truncate">
                      <Link href="/" aria-label="Início" className="hover:text-foreground touch-target p-1">
                        <Home className="h-4 w-4" />
                      </Link>
                      <ChevronRight className="h-3 w-3 flex-shrink-0" />
                      <span className="hidden sm:inline">Pastas</span>
                      <ChevronRight className="h-3 w-3 flex-shrink-0 hidden sm:inline" />
                      <span className="font-bold text-[#0F4C5C] dark:text-cyan-400 truncate">
                        {activeFolder.name}
                      </span>
                    </nav>

                    <button
                      onClick={() => handleOpenRenameModal(activeFolder)}
                      className="touch-target px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground rounded-lg flex items-center space-x-1 flex-shrink-0"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Renomear</span>
                    </button>
                  </div>

                  {/* Conteúdo da Pasta */}
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-3.5 border-b border-border flex items-center justify-between">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-foreground">
                          Documentos em &ldquo;{activeFolder.name}&rdquo;
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          {folderDocuments.length} arquivo{folderDocuments.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {folderDocuments.length === 0 ? (
                      <div className="p-8 sm:p-10 text-center space-y-2">
                        <FolderIcon className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                        <p className="text-xs sm:text-sm font-semibold text-foreground">Esta pasta está vazia</p>
                        <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                          Arraste documentos para cá ou selecione esta pasta ao fazer upload de novos arquivos.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {folderDocuments.map((doc) => (
                          <DocumentTableRow
                            key={doc.id}
                            document={doc}
                            onToggleFavorite={handleToggleFavorite}
                            onShare={setSharingDoc}
                            onDelete={handleDeleteDoc}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Modal de Criação / Edição de Pasta */}
        <Dialog open={isFolderModalOpen} onOpenChange={setIsFolderModalOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                {modalMode === "create" ? "Criar Nova Pasta" : "Renomear Pasta"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-3">
              {folderError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{folderError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Nome da Pasta
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Contratos 2026, Ofícios, Gabinete"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveFolder();
                    }
                  }}
                  className="w-full px-3 min-h-[44px] rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter className="flex sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setIsFolderModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={isSaving || !folderName.trim()}
                onClick={handleSaveFolder}
                className="bg-[#0F4C5C] hover:bg-[#09333e] text-white rounded-xl text-xs font-semibold"
              >
                {isSaving ? "Salvando..." : "Salvar Pasta"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Compartilhamento Temporário */}
        <ShareModal
          isOpen={Boolean(sharingDoc)}
          onClose={() => setSharingDoc(null)}
          document={sharingDoc}
        />
      </div>
    </AppLayout>
  );
}

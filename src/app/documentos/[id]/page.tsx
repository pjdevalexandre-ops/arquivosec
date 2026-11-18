"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Star, 
  Trash2, 
  FolderInput, 
  Edit3, 
  Sparkles, 
  Calendar, 
  Clock, 
  Building2,
  Loader2,
  FileQuestion,
  Tag as TagIcon
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { ShareModal } from "@/components/sharing/ShareModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBytes, formatDate, formatDateTime, getFileTypeBadge } from "@/lib/utils";
import type { DocumentItem } from "@/types";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "ocr" | "history">("info");

  // Edição de Metadados Principais
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDocNumber, setEditDocNumber] = useState("");
  const [editOriginSector, setEditOriginSector] = useState("");

  // Carrega documento real e URL assinada do Cloudflare R2
  useEffect(() => {
    async function fetchDoc() {
      try {
        setIsLoading(true);
        setIsNotFound(false);
        const res = await fetch(`/api/documents/${docId}/view`);
        
        if (res.status === 404) {
          setIsNotFound(true);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.document) {
            setDoc(data.document);
            setIsFavorite(data.document.is_favorite);
            setNotes(data.document.notes || "");
            setEditTitle(data.document.title);
            setEditDocNumber(data.document.document_number || "");
            setEditOriginSector(data.document.origin_sector || "");
          }
          if (data.url) {
            setFileUrl(data.url);
          }
        } else {
          setIsNotFound(true);
        }
      } catch (err) {
        console.error("Erro ao carregar documento do R2:", err);
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    if (docId) {
      fetchDoc();
    }
  }, [docId]);

  const handleToggleFavorite = async () => {
    if (!doc) return;
    const next = !isFavorite;
    setIsFavorite(next);
    setDoc((prev) => (prev ? { ...prev, is_favorite: next } : null));

    try {
      await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doc.id, is_favorite: next }),
      });
    } catch (e) {
      console.error("Erro ao favoritar:", e);
    }
  };

  const handleSaveNotes = async () => {
    if (!doc) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doc.id, notes }),
      });
      if (res.ok) {
        setDoc((prev) => (prev ? { ...prev, notes } : null));
        setIsEditingNotes(false);
      }
    } catch (e) {
      console.error("Erro ao salvar nota:", e);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doc) return;
    setIsSavingMeta(true);
    try {
      const res = await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: doc.id,
          title: editTitle,
          document_number: editDocNumber,
          origin_sector: editOriginSector,
        }),
      });
      if (res.ok) {
        setDoc((prev) =>
          prev
            ? {
                ...prev,
                title: editTitle,
                document_number: editDocNumber,
                origin_sector: editOriginSector,
              }
            : null
        );
        setIsEditingMeta(false);
      }
    } catch (e) {
      console.error("Erro ao salvar metadados:", e);
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleDownload = () => {
    if (!doc) return;
    if (fileUrl) {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = doc.file_name;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.open(`/api/documents/${doc.id}/view`, "_blank");
    }
  };

  const handleDelete = async () => {
    if (!doc) return;
    if (confirm("Deseja enviar este documento oficial para a lixeira?")) {
      try {
        await fetch(`/api/documents/${doc.id}/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "trash" }),
        });
      } catch (e) {
        console.error(e);
      }
      router.push("/documentos");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-[#0F4C5C] animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">
            Carregando documento oficial e gerando visualização segura...
          </p>
        </div>
      </AppLayout>
    );
  }

  if (isNotFound || !doc) {
    return (
      <AppLayout>
        <div className="p-12 text-center bg-card border border-border rounded-2xl max-w-md mx-auto my-12 space-y-4">
          <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <FileQuestion className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Documento Não Encontrado</h2>
          <p className="text-xs text-muted-foreground">
            O documento solicitado não existe, foi expurgado ou pertence a outro perfil de acesso.
          </p>
          <div className="pt-2">
            <Link
              href="/documentos"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#0F4C5C] text-white text-xs font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para o acervo</span>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const badge = getFileTypeBadge(doc.mime_type, doc.file_extension);

  return (
    <AppLayout>
      <div className="space-y-4 max-w-full">
        {/* Barra Superior de Navegação e Ações Rápidas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <Link
              href="/documentos"
              aria-label="Voltar para a lista de documentos"
              className="touch-target p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              title="Voltar para o acervo"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${badge.bg}`}>
                  {badge.label}
                </span>
                <h1 className="text-sm sm:text-lg font-bold text-foreground line-clamp-1 truncate">
                  {doc.title}
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                {doc.document_number ? `Ref: ${doc.document_number}` : "Documento Digitalizado"} • {formatDate(doc.created_at)}
              </p>
            </div>
          </div>

          {/* Botões de Ação com Touch Targets de 44px */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={handleToggleFavorite}
              aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              className="touch-target px-3 py-2 rounded-xl border border-border bg-background text-xs font-semibold flex items-center space-x-1.5 active:bg-muted"
            >
              <Star className={`h-4 w-4 ${isFavorite ? "fill-amber-400 text-amber-500" : ""}`} />
              <span className="hidden sm:inline">{isFavorite ? "Favorito" : "Favoritar"}</span>
            </button>

            <button
              onClick={() => setIsShareOpen(true)}
              aria-label="Compartilhar documento"
              className="touch-target px-3 py-2 rounded-xl border border-border bg-background text-xs font-semibold flex items-center space-x-1.5 active:bg-muted"
            >
              <Share2 className="h-4 w-4" />
              <span>Compartilhar</span>
            </button>

            <button
              onClick={handleDownload}
              aria-label="Baixar documento"
              className="touch-target px-3.5 py-2 rounded-xl bg-[#0F4C5C] hover:bg-[#09333e] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Baixar</span>
            </button>

            <button
              onClick={handleDelete}
              aria-label="Excluir documento"
              className="touch-target p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
              title="Excluir documento"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Layout Dividido: Visualizador (Esquerda) e Painel Lateral (Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Visualizador In-Page */}
          <div className="lg:col-span-8 space-y-3 sm:space-y-4">
            <DocumentViewer
              url={fileUrl}
              fileName={doc.file_name}
              mimeType={doc.mime_type}
              ocrText={doc.ocr_text}
            />

            {/* Status OCR em Destaque */}
            <div className="p-3 bg-muted/40 border border-border rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-[#0F4C5C] flex-shrink-0" />
                <span className="font-semibold text-foreground">Status do Reconhecimento (OCR):</span>
                {doc.ocr_status === "completed" && (
                  <Badge variant="emerald" className="text-[10px]">Indexado</Badge>
                )}
                {doc.ocr_status === "processing" && (
                  <Badge variant="amber" className="text-[10px]">Processando...</Badge>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                Pesquisável em consultas globais
              </span>
            </div>
          </div>

          {/* Painel Lateral com Informações e Metadados */}
          <div className="lg:col-span-4 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Abas */}
            <div className="flex border-b border-border text-xs font-semibold">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex-1 py-3 text-center transition-colors border-b-2 min-h-[44px] ${
                  activeTab === "info"
                    ? "border-[#0F4C5C] text-[#0F4C5C] bg-muted/30"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Informações
              </button>
              <button
                onClick={() => setActiveTab("ocr")}
                className={`flex-1 py-3 text-center transition-colors border-b-2 min-h-[44px] ${
                  activeTab === "ocr"
                    ? "border-[#0F4C5C] text-[#0F4C5C] bg-muted/30"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Texto (OCR)
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-3 text-center transition-colors border-b-2 min-h-[44px] ${
                  activeTab === "history"
                    ? "border-[#0F4C5C] text-[#0F4C5C] bg-muted/30"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Histórico
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              {activeTab === "info" && (
                <>
                  {isEditingMeta ? (
                    <form onSubmit={handleSaveMeta} className="space-y-3 p-3 bg-muted/40 rounded-xl border border-border">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-xs">Editar Informações</span>
                        <button
                          type="button"
                          onClick={() => setIsEditingMeta(false)}
                          className="text-[11px] text-muted-foreground hover:underline"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-0.5 font-medium">Título Oficial</label>
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full text-base sm:text-xs p-2 rounded-lg border border-input bg-background"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-0.5 font-medium">Número de Registro / Referência</label>
                        <input
                          value={editDocNumber}
                          onChange={(e) => setEditDocNumber(e.target.value)}
                          className="w-full text-base sm:text-xs p-2 rounded-lg border border-input bg-background"
                          placeholder="Ex: OF-2024-001"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-0.5 font-medium">Origem / Órgão Expedidor</label>
                        <input
                          value={editOriginSector}
                          onChange={(e) => setEditOriginSector(e.target.value)}
                          className="w-full text-base sm:text-xs p-2 rounded-lg border border-input bg-background"
                          placeholder="Ex: Gabinete Geral"
                        />
                      </div>

                      <div className="pt-1 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSavingMeta}
                          className="min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0F4C5C] text-white shadow-sm flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
                        >
                          {isSavingMeta ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Salvando...</span>
                            </>
                          ) : (
                            <span>Salvar Alterações</span>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-border">
                        <span className="font-bold text-foreground">Metadados Oficiais</span>
                        <button
                          onClick={() => setIsEditingMeta(true)}
                          className="touch-target text-[11px] text-[#0F4C5C] font-semibold hover:underline flex items-center space-x-1"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Editar</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Título Completo:</span>
                          <span className="font-semibold text-foreground text-xs">{doc.title}</span>
                        </div>
                        {doc.document_number && (
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Número / Referência:</span>
                            <span className="font-mono text-xs">{doc.document_number}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Órgão / Setor:</span>
                          <span className="text-xs">{doc.origin_sector || "Gabinete Geral"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Data do Expediente:</span>
                          <span className="text-xs">{formatDate(doc.document_date || doc.created_at)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Pasta:</span>
                          <span className="text-xs">{doc.folder?.name || "Sem pasta (Geral)"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Tamanho e Formato:</span>
                          <span className="text-xs">{formatBytes(doc.file_size_bytes)} ({doc.file_extension.toUpperCase()})</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notas e Observações */}
                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">Despacho / Observações Internas</span>
                      {!isEditingNotes && (
                        <button
                          onClick={() => setIsEditingNotes(true)}
                          className="text-[11px] text-[#0F4C5C] font-semibold hover:underline"
                        >
                          {doc.notes ? "Editar" : "+ Adicionar"}
                        </button>
                      )}
                    </div>

                    {isEditingNotes ? (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Digite anotações ou orientações de arquivamento..."
                          className="w-full text-base sm:text-xs p-2 rounded-lg border border-input bg-background"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingNotes(false)}
                            className="px-2.5 py-1 text-xs text-muted-foreground hover:underline"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            disabled={isSavingNotes}
                            onClick={handleSaveNotes}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#0F4C5C] text-white"
                          >
                            {isSavingNotes ? "Salvando..." : "Salvar"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic bg-muted/30 p-2.5 rounded-lg border border-border">
                        {doc.notes || "Nenhuma observação interna registrada para este documento."}
                      </p>
                    )}
                  </div>
                </>
              )}

              {activeTab === "ocr" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Conteúdo Textual Extraído</span>
                    <span className="text-[10px] text-muted-foreground">Tesseract OCR</span>
                  </div>
                  {doc.ocr_text ? (
                    <div className="p-3 bg-muted/40 rounded-xl border border-border text-[11px] font-mono leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {doc.ocr_text}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic p-4 text-center">
                      Nenhum texto pôde ser indexado automaticamente neste documento.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-3">
                  <span className="font-bold text-foreground block">Trilha de Custódia Digital</span>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 bg-muted/30 rounded-lg border border-border flex items-start space-x-2">
                      <Clock className="h-4 w-4 text-[#0F4C5C] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground block">Documento Cadastrado</span>
                        <span className="text-muted-foreground">{formatDateTime(doc.created_at)}</span>
                      </div>
                    </div>
                    {doc.updated_at && doc.updated_at !== doc.created_at && (
                      <div className="p-2.5 bg-muted/30 rounded-lg border border-border flex items-start space-x-2">
                        <Clock className="h-4 w-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-foreground block">Metadados Atualizados</span>
                          <span className="text-muted-foreground">{formatDateTime(doc.updated_at)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Compartilhamento Temporário */}
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          document={doc}
        />
      </div>
    </AppLayout>
  );
}

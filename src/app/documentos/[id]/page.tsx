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
  Loader2
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { ShareModal } from "@/components/sharing/ShareModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockDocuments } from "@/lib/mock-data";
import { formatBytes, formatDate, formatDateTime, getFileTypeBadge } from "@/lib/utils";
import type { DocumentItem } from "@/types";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const fallbackDoc: DocumentItem = {
    id: docId,
    user_id: "gestor",
    title: "Carregando documento...",
    document_number: "",
    document_date: new Date().toISOString().split("T")[0],
    origin_sector: "Gabinete Geral",
    folder_id: null,
    type_id: null,
    file_key: "docs/sample.pdf",
    file_name: "documento.pdf",
    mime_type: "application/pdf",
    file_extension: "pdf",
    file_size_bytes: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_favorite: false,
    is_trashed: false,
    ocr_status: "processing",
    notes: "",
  };

  const initialDoc = mockDocuments.find((d) => d.id === docId) || fallbackDoc;
  const [doc, setDoc] = useState<DocumentItem>(initialDoc);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(initialDoc.is_favorite);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notes, setNotes] = useState(initialDoc.notes || "");
  const [activeTab, setActiveTab] = useState<"info" | "ocr" | "history">("info");

  // Edição de Metadados Principais
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [editTitle, setEditTitle] = useState(initialDoc.title);
  const [editDocNumber, setEditDocNumber] = useState(initialDoc.document_number || "");
  const [editOriginSector, setEditOriginSector] = useState(initialDoc.origin_sector || "");

  // Carrega documento real e URL assinada do Cloudflare R2
  useEffect(() => {
    async function fetchDoc() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/documents/${docId}/view`);
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
        }
      } catch (err) {
        console.error("Erro ao carregar documento do R2:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (docId) {
      fetchDoc();
    }
  }, [docId]);

  const badge = getFileTypeBadge(doc.mime_type, doc.file_extension);

  const handleToggleFavorite = async () => {
    const next = !isFavorite;
    setIsFavorite(next);
    setDoc((prev) => ({ ...prev, is_favorite: next }));
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
    setIsSavingNotes(true);
    try {
      const res = await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doc.id, notes }),
      });
      if (res.ok) {
        setDoc((prev) => ({ ...prev, notes }));
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
        setDoc((prev) => ({
          ...prev,
          title: editTitle,
          document_number: editDocNumber,
          origin_sector: editOriginSector,
        }));
        setIsEditingMeta(false);
      }
    } catch (e) {
      console.error("Erro ao salvar metadados:", e);
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleDownload = () => {
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
    if (confirm("Deseja enviar este documento para a lixeira?")) {
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

  return (
    <AppLayout>
      <div className="space-y-4 max-w-full">
        {/* Barra Superior de Navegação e Ações Rápidas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <Link
              href="/documentos"
              aria-label="Voltar para a lista de documentos"
              className="touch-target p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              title="Voltar para a lista"
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
              className="touch-target px-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold flex items-center space-x-1.5 active:bg-muted"
            >
              <Star className={`h-4 w-4 ${isFavorite ? "fill-amber-400 text-amber-500" : ""}`} />
              <span className="hidden sm:inline">{isFavorite ? "Favorito" : "Favoritar"}</span>
            </button>

            <button
              onClick={() => setIsShareOpen(true)}
              aria-label="Compartilhar documento"
              className="touch-target px-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold flex items-center space-x-1.5 active:bg-muted"
            >
              <Share2 className="h-4 w-4" />
              <span>Compartilhar</span>
            </button>

            <button
              onClick={handleDownload}
              aria-label="Baixar documento"
              className="touch-target px-3.5 py-2 rounded-lg bg-[#0F4C5C] hover:bg-[#09333e] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Baixar</span>
            </button>

            <button
              onClick={handleDelete}
              aria-label="Excluir documento"
              className="touch-target p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
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
            <div className="p-3 bg-muted/30 border border-border/80 rounded-xl flex items-center justify-between text-xs">
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
          <div className="lg:col-span-4 bg-card border border-border/80 rounded-xl overflow-hidden shadow-soft">
            {/* Abas com Touch Target */}
            <div className="flex border-b border-border text-xs font-semibold">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex-1 py-3 text-center transition-colors border-b-2 min-h-[44px] ${
                  activeTab === "info"
                    ? "border-[#0F4C5C] text-[#0F4C5C] bg-muted/20"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Informações
              </button>
              <button
                onClick={() => setActiveTab("ocr")}
                className={`flex-1 py-3 text-center transition-colors border-b-2 min-h-[44px] ${
                  activeTab === "ocr"
                    ? "border-[#0F4C5C] text-[#0F4C5C] bg-muted/20"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Texto (OCR)
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-3 text-center transition-colors border-b-2 min-h-[44px] ${
                  activeTab === "history"
                    ? "border-[#0F4C5C] text-[#0F4C5C] bg-muted/20"
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
                          className="min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0F4C5C] text-white shadow-sm flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
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
                      <div className="flex items-center justify-between pb-1 border-b border-border/40">
                        <span className="text-[11px] font-bold text-foreground">Metadados Oficiais</span>
                        <button
                          type="button"
                          onClick={() => setIsEditingMeta(true)}
                          className="text-[11px] text-[#0F4C5C] hover:underline flex items-center space-x-1 font-semibold"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Editar</span>
                        </button>
                      </div>

                      <div>
                        <span className="text-[11px] text-muted-foreground block">Tipo de Documento</span>
                        <span className="font-semibold text-foreground text-sm">
                          {doc.type?.name || "Ofício / Documento Oficial"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-muted-foreground block">Número de Registro</span>
                        <span className="font-mono text-foreground font-medium text-xs sm:text-sm">
                          {doc.document_number || "Não informado"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[11px] text-muted-foreground block">Data do Documento</span>
                          <span className="text-foreground">
                            {formatDate(doc.document_date)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-muted-foreground block">Tamanho</span>
                          <span className="font-mono text-foreground">
                            {formatBytes(doc.file_size_bytes)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-muted-foreground block">Origem / Órgão Expedidor</span>
                        <span className="text-foreground flex items-center space-x-1.5 mt-0.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span>{doc.origin_sector || "Gabinete Geral"}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-muted-foreground block">Pasta de Arquivamento</span>
                        <span className="text-foreground flex items-center space-x-1.5 mt-0.5">
                          <FolderInput className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span>{doc.folder?.name || "Gabinete do Gestor"}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Observações com Edição Touch-Friendly */}
                  <div className="pt-3 border-t border-border/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-muted-foreground font-medium">Observações Internas</span>
                      <button
                        onClick={() => setIsEditingNotes(!isEditingNotes)}
                        className="text-[11px] text-[#0F4C5C] hover:underline flex items-center space-x-1 py-1 touch-manipulation"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>{isEditingNotes ? "Cancelar" : "Editar"}</span>
                      </button>
                    </div>

                    {isEditingNotes ? (
                      <div className="space-y-2">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full h-24 text-base sm:text-xs p-2.5 rounded-lg border border-input bg-background focus:ring-1 focus:ring-[#0F4C5C]"
                          placeholder="Adicione anotações sobre tramitação ou auditoria..."
                        />
                        <button
                          onClick={handleSaveNotes}
                          disabled={isSavingNotes}
                          className="min-h-[40px] px-3.5 rounded-lg text-xs font-semibold bg-[#0F4C5C] text-white active:scale-95 flex items-center space-x-1.5 disabled:opacity-50"
                        >
                          {isSavingNotes ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Salvando...</span>
                            </>
                          ) : (
                            <span>Salvar Nota</span>
                          )}
                        </button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/60">
                        {notes || "Nenhuma observação registrada para este documento."}
                      </p>
                    )}
                  </div>
                </>
              )}

              {activeTab === "ocr" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Conteúdo Textual Indexado</span>
                    <Badge variant="outline" className="text-[10px]">Tesseract OCR (pt)</Badge>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-3 bg-muted/40 rounded-lg border border-border/80 text-[11px] font-mono leading-relaxed whitespace-pre-wrap text-foreground">
                    {doc.ocr_text || "Nenhum texto pôde ser extraído."}
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-foreground">Trilha de Eventos</span>
                  <div className="space-y-2.5 border-l-2 border-border pl-3 ml-1">
                    <div className="relative pb-2">
                      <div className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-[#0F4C5C]" />
                      <p className="font-semibold text-foreground">Guarda Segura</p>
                      <p className="text-[10px] text-muted-foreground">{formatDateTime(doc.created_at)}</p>
                    </div>

                    <div className="relative pb-2">
                      <div className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-emerald-500" />
                      <p className="font-semibold text-foreground">Indexação OCR</p>
                      <p className="text-[10px] text-muted-foreground">Indexado no motor PostgreSQL FTS</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-blue-500" />
                      <p className="font-semibold text-foreground">Visualização Registrada</p>
                      <p className="text-[10px] text-muted-foreground">Consulta por gestor autorizado</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Compartilhamento */}
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          document={doc}
        />
      </div>
    </AppLayout>
  );
}

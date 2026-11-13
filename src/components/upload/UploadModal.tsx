"use client";

import React, { useState, useRef } from "react";
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Folder as FolderIcon,
  Tag as TagIcon,
  Layers,
  Sparkles,
  ArrowRight,
  RotateCcw
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatBytes, sanitizeFileName } from "@/lib/utils";
import { Folder, DocumentType, Tag, UploadQueueItem } from "@/types";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  documentTypes: DocumentType[];
  tags: Tag[];
  onUploadComplete?: () => void;
}

export function UploadModal({
  isOpen,
  onClose,
  folders,
  documentTypes,
  tags,
  onUploadComplete,
}: UploadModalProps) {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metadados em lote (aplicar a todos)
  const [batchFolderId, setBatchFolderId] = useState<string>("");
  const [batchTypeId, setBatchTypeId] = useState<string>("");
  const [batchOrigin, setBatchOrigin] = useState<string>("");

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newItems: UploadQueueItem[] = Array.from(fileList).map((file) => {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      return {
        id: Math.random().toString(36).substring(2, 9),
        file,
        title: cleanTitle,
        document_number: "",
        document_date: new Date().toISOString().split("T")[0],
        origin_sector: batchOrigin || "",
        folder_id: batchFolderId || (folders[0]?.id || ""),
        type_id: batchTypeId || (documentTypes[0]?.id || ""),
        tag_ids: [],
        notes: "",
        progress: 0,
        status: "pending",
      };
    });

    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const applyBatchMetadata = () => {
    setQueue((prev) =>
      prev.map((item) => ({
        ...item,
        folder_id: batchFolderId || item.folder_id,
        type_id: batchTypeId || item.type_id,
        origin_sector: batchOrigin || item.origin_sector,
      }))
    );
  };

  // Upload com monitoramento real de progresso e resiliência
  const uploadSingleItem = async (item: UploadQueueItem) => {
    setQueue((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, status: "uploading", progress: 5, error_message: undefined } : it))
    );

    try {
      const presignRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: item.file.name,
          mimeType: item.file.type || "application/pdf",
          fileSizeBytes: item.file.size,
        }),
      });

      if (!presignRes.ok) {
        const errJson = await presignRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Falha na autorização com Cloudflare R2.");
      }

      const { uploadUrl, fileKey } = await presignRes.json();

      await new Promise<void>((resolve, reject) => {
        if (!uploadUrl || uploadUrl.includes("/api/mock-upload")) {
          let progress = 10;
          const interval = setInterval(() => {
            progress += 30;
            if (progress >= 95) {
              clearInterval(interval);
              resolve();
            } else {
              setQueue((prev) =>
                prev.map((it) => (it.id === item.id ? { ...it, progress } : it))
              );
            }
          }, 150);
          return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", item.file.type || "application/octet-stream");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 90);
            setQueue((prev) =>
              prev.map((it) => (it.id === item.id ? { ...it, progress: percentComplete } : it))
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Falha no envio para o R2 (${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error("Erro de conexão de rede durante o upload."));
        xhr.onabort = () => reject(new Error("Upload cancelado pelo usuário."));

        xhr.send(item.file);
      });

      setQueue((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: "processing_ocr", progress: 95 } : it))
      );

      const completeRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          document_number: item.document_number,
          document_date: item.document_date,
          origin_sector: item.origin_sector,
          folder_id: item.folder_id,
          type_id: item.type_id,
          tag_ids: item.tag_ids,
          notes: item.notes,
          file_key: fileKey,
          file_name: item.file.name,
          file_size_bytes: item.file.size,
          mime_type: item.file.type || "application/pdf",
        }),
      });

      if (!completeRes.ok) {
        const completeErr = await completeRes.json().catch(() => ({}));
        throw new Error(completeErr.error || "Falha ao registrar documento no banco.");
      }

      const completeData = await completeRes.json();

      setQueue((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                progress: 100,
                status: "completed",
                created_document_id: completeData.document?.id,
              }
            : it
        )
      );
    } catch (err: any) {
      setQueue((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                status: "error",
                error_message: err.message || "Erro durante o envio.",
              }
            : it
        )
      );
    }
  };

  const startUploads = async () => {
    const pendingItems = queue.filter((it) => it.status === "pending" || it.status === "error");
    for (const item of pendingItems) {
      await uploadSingleItem(item);
    }
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  const removeItem = (id: string) => {
    setQueue((prev) => prev.filter((it) => it.id !== id));
  };

  const allCompleted = queue.length > 0 && queue.every((it) => it.status === "completed");
  const isUploading = queue.some((it) => it.status === "uploading" || it.status === "processing_ocr");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden pt-safe pb-safe rounded-none sm:rounded-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg sm:text-xl flex items-center space-x-2 text-[#0F4C5C]">
            <Upload className="h-5 w-5 flex-shrink-0" />
            <span>Enviar Documentos para Nuvem</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Envio direto para bucket seguro Cloudflare R2 com indexação automática via OCR.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-1">
          {/* Zona de Drop / Seleção Touch */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all active:scale-[0.99] touch-manipulation ${
              isDragging
                ? "border-[#0F4C5C] bg-[#0F4C5C]/5"
                : "border-border hover:border-[#0F4C5C]/50 hover:bg-muted/40"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff"
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-[#0F4C5C]/10 text-[#0F4C5C] flex items-center justify-center">
                <Upload className="h-6 w-6" />
              </div>
              <p className="font-bold text-xs sm:text-sm text-foreground">
                Toque para selecionar PDFs ou fotos digitalizadas
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Cota de 250 GB com suporte a envio em partes.
              </p>
              <div className="flex items-center space-x-1.5 pt-1 flex-wrap justify-center">
                <Badge variant="outline" className="text-[9px]">PDF</Badge>
                <Badge variant="outline" className="text-[9px]">JPEG / PNG</Badge>
                <Badge variant="outline" className="text-[9px]">TIFF / WEBP</Badge>
              </div>
            </div>
          </div>

          {/* Configuração em Lote */}
          {queue.length > 1 && (
            <div className="bg-muted/30 border border-border/80 rounded-xl p-3 sm:p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center space-x-1.5">
                  <Layers className="h-4 w-4 text-[#0F4C5C]" />
                  <span>Aplicar a Todos ({queue.length})</span>
                </span>
                <button
                  type="button"
                  onClick={applyBatchMetadata}
                  className="touch-target px-3 py-1 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted"
                >
                  Aplicar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] sm:text-[11px] text-muted-foreground block mb-1">Pasta</label>
                  <select
                    value={batchFolderId}
                    onChange={(e) => setBatchFolderId(e.target.value)}
                    className="w-full min-h-[40px] sm:min-h-[32px] h-10 sm:h-8 text-base sm:text-xs rounded-lg border border-input bg-background px-2"
                  >
                    <option value="">Selecione uma pasta...</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] sm:text-[11px] text-muted-foreground block mb-1">Tipo</label>
                  <select
                    value={batchTypeId}
                    onChange={(e) => setBatchTypeId(e.target.value)}
                    className="w-full min-h-[40px] sm:min-h-[32px] h-10 sm:h-8 text-base sm:text-xs rounded-lg border border-input bg-background px-2"
                  >
                    <option value="">Selecione o tipo...</option>
                    {documentTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] sm:text-[11px] text-muted-foreground block mb-1">Origem / Setor</label>
                  <input
                    placeholder="Ex: Gabinete, Fazenda..."
                    value={batchOrigin}
                    onChange={(e) => setBatchOrigin(e.target.value)}
                    className="w-full min-h-[40px] sm:min-h-[32px] h-10 sm:h-8 text-base sm:text-xs rounded-lg border border-input bg-background px-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Fila de Arquivos Selecionados */}
          {queue.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Fila ({queue.length})
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatBytes(queue.reduce((acc, it) => acc + it.file.size, 0))}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 border rounded-xl space-y-2 text-xs transition-colors ${
                      item.status === "error" 
                        ? "border-rose-300 bg-rose-50/40 dark:bg-rose-950/20" 
                        : "border-border/80 bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <FileText className="h-4 w-4 text-[#0F4C5C] flex-shrink-0" />
                        <span className="font-semibold text-foreground truncate block max-w-[150px] sm:max-w-xs">{item.file.name}</span>
                        <span className="text-muted-foreground flex-shrink-0 font-mono text-[10px]">
                          ({formatBytes(item.file.size)})
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        {item.status === "completed" && (
                          <span className="flex items-center space-x-1 text-emerald-600 font-medium text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="hidden xs:inline">Enviado</span>
                          </span>
                        )}
                        {item.status === "processing_ocr" && (
                          <span className="flex items-center space-x-1 text-amber-600 font-medium text-[11px]">
                            <Sparkles className="h-3.5 w-3.5 animate-spin" />
                            <span className="hidden xs:inline">OCR...</span>
                          </span>
                        )}
                        {item.status === "uploading" && (
                          <span className="text-[#0F4C5C] font-semibold text-[11px] font-mono">
                            {item.progress}%
                          </span>
                        )}
                        {item.status === "error" && (
                          <div className="flex items-center space-x-1">
                            <span className="text-rose-600 font-medium text-[11px]">Falha</span>
                            <button
                              onClick={() => uploadSingleItem(item)}
                              className="touch-target p-1 text-[#0F4C5C] hover:underline"
                              title="Tentar novamente"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}

                        {item.status !== "uploading" && item.status !== "processing_ocr" && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="touch-target p-1 text-muted-foreground hover:text-foreground"
                            title="Remover"
                            aria-label="Remover arquivo"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {(item.status === "uploading" || item.status === "processing_ocr") && (
                      <Progress value={item.progress} className="h-1.5" indicatorClassName="bg-[#0F4C5C]" />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-border/40">
                      <div>
                        <label className="text-[10px] text-muted-foreground block">Título Oficial</label>
                        <input
                          value={item.title}
                          onChange={(e) =>
                            setQueue((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, title: e.target.value } : it))
                            )
                          }
                          className="w-full min-h-[40px] sm:min-h-[28px] h-10 sm:h-7 text-base sm:text-xs rounded-lg border border-input bg-background px-2"
                          placeholder="Título oficial"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block">Número / Ref.</label>
                        <input
                          value={item.document_number}
                          onChange={(e) =>
                            setQueue((prev) =>
                              prev.map((it) =>
                                it.id === item.id ? { ...it, document_number: e.target.value } : it
                              )
                            )
                          }
                          className="w-full min-h-[40px] sm:min-h-[28px] h-10 sm:h-7 text-base sm:text-xs rounded-lg border border-input bg-background px-2"
                          placeholder="Ex: OF-102/2024"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block">Pasta</label>
                        <select
                          value={item.folder_id}
                          onChange={(e) =>
                            setQueue((prev) =>
                              prev.map((it) =>
                                it.id === item.id ? { ...it, folder_id: e.target.value } : it
                              )
                            )
                          }
                          className="w-full min-h-[40px] sm:min-h-[28px] h-10 sm:h-7 text-base sm:text-xs rounded-lg border border-input bg-background px-2"
                        >
                          {folders.map((f) => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de Ações com Touch Targets */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isUploading}
            className="touch-target px-4 py-2 text-xs font-semibold rounded-lg hover:bg-muted text-muted-foreground"
          >
            {allCompleted ? "Fechar" : "Cancelar"}
          </button>

          <div>
            {allCompleted ? (
              <button
                onClick={onClose}
                className="touch-target min-h-[44px] px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs active:scale-95"
              >
                Concluído
              </button>
            ) : (
              <button
                onClick={startUploads}
                disabled={queue.length === 0 || isUploading}
                className="touch-target min-h-[44px] px-5 py-2 bg-[#0F4C5C] hover:bg-[#09333e] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar ({queue.length})</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

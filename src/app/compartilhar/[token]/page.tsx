"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { 
  ShieldCheck, 
  Lock, 
  Download, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { mockDocuments } from "@/lib/mock-data";
import { formatBytes, formatDate } from "@/lib/utils";

export default function PublicSharePage() {
  const params = useParams();
  const token = params.token as string;

  const document = mockDocuments[0] || {
    id: "share-sample",
    title: "Documento Oficial Compartilhado",
    file_name: "documento_oficial.pdf",
    mime_type: "application/pdf",
    file_extension: "pdf",
    file_size_bytes: 1420500,
    created_at: new Date().toISOString(),
    ocr_status: "completed" as const,
  };

  const isProtected = token.includes("auditoria") || token.includes("senha");

  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(!isProtected);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "123456" || password.length >= 4) {
      setIsUnlocked(true);
      setError(null);
    } else {
      setError("Senha incorreta. Verifique com o gestor emissor do link.");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col justify-between max-w-full overflow-x-hidden pt-safe pb-safe">
      {/* Top Header Oficial com Safe Area */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#0F4C5C] text-white flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm">ArquivoSec</span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#0F4C5C]/40 text-cyan-300">
                Acesso Seguro
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Portal Público de Validação</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
          <span className="hidden sm:inline">Link temporário ativo</span>
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">
        {!isUnlocked ? (
          /* Formulário de Desbloqueio por Senha Touch-Friendly */
          <div className="max-w-md w-full mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 space-y-5 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Documento Protegido</h2>
              <p className="text-xs text-slate-400">
                Este arquivo oficial requer autenticação para visualização.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-medium">Digite a senha de acesso</label>
                <input
                  type="password"
                  placeholder="Senha fornecida pelo gestor"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[48px] sm:min-h-[40px] px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] bg-[#0F4C5C] hover:bg-[#09333e] text-white text-xs sm:text-sm font-bold rounded-xl active:scale-[0.99] touch-manipulation"
              >
                Acessar Documento
              </button>
            </form>
          </div>
        ) : (
          /* Visualizador do Documento Liberado */
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">{document.title}</h2>
                <div className="flex items-center space-x-2 text-[11px] sm:text-xs text-slate-400 mt-1">
                  <span>{formatDate(document.document_date || document.created_at)}</span>
                  <span>•</span>
                  <span>{formatBytes(document.file_size_bytes)}</span>
                </div>
              </div>

              <button
                onClick={() => alert(`Download seguro do arquivo: ${document.file_name}`)}
                className="touch-target min-h-[44px] px-4 bg-[#0F4C5C] hover:bg-[#09333e] text-white flex items-center justify-center space-x-2 rounded-xl text-xs font-bold shadow-sm active:scale-95 flex-shrink-0"
              >
                <Download className="h-4 w-4" />
                <span>Baixar Cópia Oficial</span>
              </button>
            </div>

            <DocumentViewer
              fileName={document.file_name}
              mimeType={document.mime_type}
              ocrText={document.ocr_text}
              className="border-slate-800"
            />
          </div>
        )}
      </main>

      {/* Rodapé Informativo com Safe Area */}
      <footer className="h-12 border-t border-slate-800/80 px-4 sm:px-6 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
        <span className="truncate">ArquivoSec • Repositório em Nuvem</span>
        <span className="font-mono flex-shrink-0">Token: {token.slice(0, 12)}...</span>
      </footer>
    </div>
  );
}

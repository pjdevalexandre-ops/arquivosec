"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  ShieldCheck, 
  Lock, 
  Download, 
  Clock, 
  AlertCircle, 
  FileText,
  FileX2,
  Calendar,
  Building2,
  Loader2
} from "lucide-react";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { formatBytes, formatDate } from "@/lib/utils";
import type { DocumentItem } from "@/types";

export default function PublicSharePage() {
  const params = useParams();
  const token = params.token as string;

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusState, setStatusState] = useState<"loading" | "ready" | "password" | "expired" | "not_found" | "error">("loading");

  const fetchSharedDoc = async (pwd?: string) => {
    try {
      if (pwd) setIsUnlocking(true);
      else setIsLoading(true);
      setErrorMessage(null);

      const res = await fetch(`/api/share/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd || "" }),
      });

      const data = await res.json();

      if (res.status === 403 && data.requiresPassword) {
        setRequiresPassword(true);
        setStatusState("password");
        if (pwd) setErrorMessage(data.error || "Senha incorreta.");
        return;
      }

      if (res.status === 410) {
        setStatusState("expired");
        setErrorMessage(data.error || "Este link de compartilhamento temporário expirou.");
        return;
      }

      if (res.status === 404) {
        setStatusState("not_found");
        setErrorMessage(data.error || "Documento não encontrado ou link revogado pelo órgão emissor.");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Falha ao validar link de compartilhamento.");
      }

      setDocument(data.document);
      setFileUrl(data.fileUrl);
      setStatusState("ready");
    } catch (err: any) {
      setErrorMessage(err.message || "Erro de conexão ao acessar documento.");
      setStatusState("error");
    } finally {
      setIsLoading(false);
      setIsUnlocking(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSharedDoc();
    }
  }, [token]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage("Por favor, digite a senha.");
      return;
    }
    fetchSharedDoc(password.trim());
  };

  const handleDownload = () => {
    if (fileUrl && document) {
      const a = window.document.createElement("a");
      a.href = fileUrl;
      a.download = document.file_name;
      a.target = "_blank";
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-900 text-slate-100 flex flex-col justify-between max-w-full overflow-x-hidden pt-safe pb-safe">
      {/* Top Header Oficial */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#0F4C5C] text-white flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight">ArquivoSec</span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#0F4C5C]/40 text-cyan-300">
                Acesso Seguro
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Portal Público de Validação Documental</p>
          </div>
        </div>

        {document && (
          <button
            onClick={handleDownload}
            className="touch-target px-3.5 py-1.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0c3e4b] text-white text-xs font-semibold flex items-center space-x-1.5 active:scale-95 transition-all shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Baixar Arquivo Oficial</span>
          </button>
        )}
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">
        {isLoading ? (
          <div className="text-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 text-[#0F4C5C] animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-medium">Validando autenticidade do link institucional...</p>
          </div>
        ) : statusState === "password" ? (
          /* Formulário de Desbloqueio por Senha */
          <div className="max-w-md w-full mx-auto bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl backdrop-blur-sm">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Documento Protegido por Senha</h2>
              <p className="text-xs text-slate-400">
                Este arquivo oficial requer código de acesso fornecido pelo gestor emissor.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                  Senha de Acesso
                </label>
                <input
                  type="password"
                  required
                  placeholder="Digite a senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 min-h-[44px] rounded-xl border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
              </div>

              <button
                type="submit"
                disabled={isUnlocking}
                className="w-full min-h-[44px] bg-[#0F4C5C] hover:bg-[#0c3e4b] text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
              >
                {isUnlocking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <span>Desbloquear Documento</span>
                )}
              </button>
            </form>
          </div>
        ) : statusState === "expired" || statusState === "not_found" ? (
          /* Tela Formal de Link Expirado ou Revogado */
          <div className="max-w-md w-full mx-auto bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-4 text-center shadow-2xl">
            <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <FileX2 className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-white">Documento Indisponível</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {errorMessage || "Este link de compartilhamento temporário foi revogado ou expirou. Para obter uma nova via oficial, solicite ao órgão emissor."}
            </p>
          </div>
        ) : statusState === "ready" && document ? (
          /* Visualizador e Dados Oficiais */
          <div className="space-y-4">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0F4C5C]/30 text-cyan-300 border border-[#0F4C5C]/40">
                  {document.document_number ? `Ref: ${document.document_number}` : "Documento Oficial"}
                </span>
                <h1 className="text-base sm:text-lg font-bold text-white mt-1">
                  {document.title}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Emitido em: {formatDate(document.document_date || document.created_at)} • Tamanho: {formatBytes(document.file_size_bytes)}
                </p>
              </div>

              <button
                onClick={handleDownload}
                className="touch-target px-4 py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0c3e4b] text-white text-xs font-semibold flex items-center justify-center space-x-2 active:scale-95 transition-all self-start sm:self-auto"
              >
                <Download className="h-4 w-4" />
                <span>Baixar Cópia Oficial</span>
              </button>
            </div>

            {/* Renderização real do arquivo */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden min-h-[600px] shadow-2xl">
              <DocumentViewer
                url={fileUrl || undefined}
                mimeType={document.mime_type}
                fileName={document.file_name}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm">
            {errorMessage || "Não foi possível carregar o documento compartilhado."}
          </div>
        )}
      </main>

      {/* Rodapé Oficial */}
      <footer className="border-t border-slate-800 py-3 text-center text-[11px] text-slate-500">
        ArquivoSec — Repositório de Documentos Digitais com Armazenamento Seguro e Criptografia.
      </footer>
    </div>
  );
}

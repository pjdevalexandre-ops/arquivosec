"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { 
  ShieldCheck, 
  Lock, 
  Download, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { mockDocuments } from "@/lib/mock-data";
import { formatBytes, formatDate } from "@/lib/utils";

export default function PublicSharePage() {
  const params = useParams();
  const token = params.token as string;

  // Em modo demonstração, vinculamos ao primeiro ou segundo documento
  const document = mockDocuments[0];
  const isProtected = token.includes("auditoria"); // simula proteção por senha se contém auditoria

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header Oficial */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-lg bg-[#0F4C5C] text-white flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm">ArquivoSec</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#0F4C5C]/40 text-cyan-300">
                Acesso Seguro
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Portal Público de Validação Documental</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden sm:inline">Link temporário ativo</span>
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {!isUnlocked ? (
          /* Formulário de Desbloqueio por Senha */
          <div className="max-w-md w-full mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Documento Protegido</h2>
              <p className="text-xs text-slate-400">
                Este arquivo oficial requer autenticação para visualização.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1.5">Digite a senha de acesso</label>
                <Input
                  type="password"
                  placeholder="Senha fornecida pelo gestor (ex: 123456)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white h-10 text-xs"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0F4C5C] hover:bg-[#09333e] text-white h-10 text-xs font-semibold"
              >
                Acessar Documento
              </Button>
            </form>
          </div>
        ) : (
          /* Visualizador do Documento Liberado */
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">{document.title}</h2>
                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                  <span>Ref: {document.document_number || "Sem número"}</span>
                  <span>•</span>
                  <span>{formatDate(document.document_date)}</span>
                  <span>•</span>
                  <span>{formatBytes(document.file_size_bytes)}</span>
                </div>
              </div>

              <Button
                onClick={() => alert(`Download seguro do arquivo: ${document.file_name}`)}
                className="bg-[#0F4C5C] hover:bg-[#09333e] text-white flex items-center space-x-1.5 h-9 text-xs"
              >
                <Download className="h-4 w-4" />
                <span>Baixar Cópia Oficial</span>
              </Button>
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

      {/* Rodapé Informativo */}
      <footer className="h-12 border-t border-slate-800/80 px-6 flex items-center justify-between text-[11px] text-slate-500">
        <span>ArquivoSec • Repositório em Nuvem Criptografada</span>
        <span className="font-mono">Token: {token}</span>
      </footer>
    </div>
  );
}

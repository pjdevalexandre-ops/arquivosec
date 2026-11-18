"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Share2, 
  ExternalLink, 
  Clock, 
  Lock, 
  Eye, 
  Trash2, 
  Copy, 
  Check, 
  FileText,
  AlertCircle,
  Loader2
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { ShareLink } from "@/types";
import { formatDateTime } from "@/lib/utils";

export default function CompartilhadosPage() {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadShareLinks() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/share");
        if (res.ok) {
          const { links: dbLinks } = await res.json();
          if (dbLinks) setLinks(dbLinks);
        }
      } catch (err) {
        console.warn("Erro ao carregar links:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadShareLinks();
  }, []);

  const handleCopyLink = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/compartilhar/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRevokeLink = async (id: string) => {
    if (confirm("Deseja realmente revogar este link? O acesso público será cancelado imediatamente.")) {
      setLinks((prev) =>
        prev.map((l) => (l.id === id ? { ...l, is_active: false } : l))
      );
      try {
        await fetch(`/api/share?id=${id}`, { method: "DELETE" });
      } catch (e) {
        console.error("Erro ao revogar:", e);
      }
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5 sm:space-y-6 max-w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Links de Compartilhamento Temporário
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Controle de acessos externos concedidos a auditores, cidadãos e outros órgãos públicos.
          </p>
        </div>

        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-[#0F4C5C] animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Carregando links de compartilhamento...</p>
          </div>
        ) : links.length === 0 ? (
          <div className="p-10 text-center bg-card border border-border rounded-2xl space-y-3">
            <div className="h-12 w-12 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-[#0F4C5C] flex items-center justify-center mx-auto">
              <Share2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-foreground">Nenhum link ativo gerado</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Você pode gerar links temporários com validade (24h, 7d, 30d) e senha em qualquer documento do acervo.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Modo Tabela Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3 pl-4">Documento</th>
                    <th className="p-3">Validade</th>
                    <th className="p-3">Segurança</th>
                    <th className="p-3">Visualizações</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {links.map((link) => {
                    const isExpired = new Date(link.expires_at).getTime() < Date.now();
                    const isActive = link.is_active && !isExpired;

                    return (
                      <tr key={link.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 pl-4">
                          <div className="flex items-center space-x-2.5">
                            <FileText className="h-4 w-4 text-[#0F4C5C] flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-foreground block">
                                {link.document?.title || "Documento Oficial"}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                Token: <span className="font-mono">{link.token}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="flex items-center space-x-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDateTime(link.expires_at)}</span>
                          </span>
                        </td>

                        <td className="p-3">
                          {link.has_password ? (
                            <span className="inline-flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                              <Lock className="h-3 w-3" />
                              <span>Protegido por senha</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">Acesso direto</span>
                          )}
                        </td>

                        <td className="p-3 font-mono">
                          <span className="flex items-center space-x-1">
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{link.view_count || 0}</span>
                          </span>
                        </td>

                        <td className="p-3">
                          {isActive ? (
                            <Badge variant="emerald" className="text-[10px]">Ativo</Badge>
                          ) : isExpired ? (
                            <Badge variant="amber" className="text-[10px]">Expirado</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">Revogado</Badge>
                          )}
                        </td>

                        <td className="p-3 pr-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {isActive && (
                              <>
                                <button
                                  onClick={() => handleCopyLink(link.token)}
                                  className="touch-target p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                                  title="Copiar link"
                                >
                                  {copiedToken === link.token ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>

                                <Link
                                  href={`/compartilhar/${link.token}`}
                                  target="_blank"
                                  className="touch-target p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                                  title="Abrir página pública"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Link>

                                <button
                                  onClick={() => handleRevokeLink(link.id)}
                                  className="touch-target p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                                  title="Revogar link"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modo Cards Mobile */}
            <div className="sm:hidden divide-y divide-border">
              {links.map((link) => {
                const isExpired = new Date(link.expires_at).getTime() < Date.now();
                const isActive = link.is_active && !isExpired;

                return (
                  <div key={link.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-[#0F4C5C] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-xs text-foreground">
                            {link.document?.title || "Documento Oficial"}
                          </h4>
                          <span className="text-[10px] text-muted-foreground font-mono block">
                            Token: {link.token}
                          </span>
                        </div>
                      </div>
                      {isActive ? (
                        <Badge variant="emerald" className="text-[9px]">Ativo</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[9px]">Inativo</Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Validade: {formatDateTime(link.expires_at)}</span>
                      <span>Visualizações: {link.view_count || 0}</span>
                    </div>

                    {isActive && (
                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
                        <button
                          onClick={() => handleCopyLink(link.token)}
                          className="touch-target px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-semibold flex items-center space-x-1"
                        >
                          {copiedToken === link.token ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copiar Link</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleRevokeLink(link.id)}
                          className="touch-target px-3 py-1.5 text-xs text-rose-600 font-semibold"
                        >
                          Revogar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

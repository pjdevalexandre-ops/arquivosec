"use client";

import React, { useState } from "react";
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
  AlertCircle 
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockShareLinks } from "@/lib/mock-data";
import { ShareLink } from "@/types";
import { formatDateTime } from "@/lib/utils";

export default function CompartilhadosPage() {
  const [links, setLinks] = useState<ShareLink[]>(mockShareLinks);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCopyLink = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/compartilhar/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRevokeLink = (id: string) => {
    if (confirm("Deseja realmente revogar este link? O acesso público será cancelado imediatamente.")) {
      setLinks((prev) =>
        prev.map((l) => (l.id === id ? { ...l, is_active: false } : l))
      );
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
            Controle de acessos externos concedidos a auditores, cidadãos e outros órgãos.
          </p>
        </div>

        {links.length === 0 ? (
          <div className="p-10 text-center bg-card border border-border/80 rounded-2xl space-y-3">
            <div className="h-12 w-12 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-[#0F4C5C] flex items-center justify-center mx-auto">
              <Share2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-foreground">Nenhum link ativo gerado</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Você pode gerar links temporários com validade (24h, 7d, 30d) e senha em qualquer documento.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-soft">
            {/* Modo Tabela Desktop (sm:table) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3 pl-4">Documento</th>
                    <th className="p-3">Validade</th>
                    <th className="p-3">Expira em</th>
                    <th className="p-3">Segurança</th>
                    <th className="p-3">Visualizações</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right pr-4">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {links.map((link) => {
                    const isExpired = new Date(link.expires_at).getTime() < Date.now();
                    const isActive = link.is_active && !isExpired;

                    return (
                      <tr key={link.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 pl-4">
                          <div className="flex items-center space-x-2.5">
                            <FileText className="h-4 w-4 text-[#0F4C5C] flex-shrink-0" />
                            <div className="min-w-0">
                              <span className="font-semibold text-foreground truncate block max-w-xs">
                                {link.document?.title || "Documento Oficial"}
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                token: {link.token}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 font-medium">
                          {link.duration_label}
                        </td>

                        <td className="p-3 text-muted-foreground whitespace-nowrap">
                          {formatDateTime(link.expires_at)}
                        </td>

                        <td className="p-3">
                          {link.has_password ? (
                            <Badge variant="outline" className="flex items-center space-x-1 text-[10px] w-fit">
                              <Lock className="h-2.5 w-2.5 text-amber-500" />
                              <span>Com senha</span>
                            </Badge>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Público</span>
                          )}
                        </td>

                        <td className="p-3 font-mono">
                          {link.view_count} visualizaç{link.view_count === 1 ? "ão" : "ões"}
                        </td>

                        <td className="p-3">
                          {isActive ? (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Ativo</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              Revogado
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right pr-4 whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            {isActive && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyLink(link.token)}
                                  className="h-7 text-xs flex items-center space-x-1"
                                >
                                  {copiedToken === link.token ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-600" />
                                      <span>Copiado</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Copiar</span>
                                    </>
                                  )}
                                </Button>

                                <Link
                                  href={`/compartilhar/${link.token}`}
                                  target="_blank"
                                  className="p-1 text-muted-foreground hover:text-foreground"
                                  title="Abrir página pública"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Link>

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleRevokeLink(link.id)}
                                  className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                  title="Revogar acesso"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
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

            {/* Modo Cards Mobile (sm:hidden) */}
            <div className="block sm:hidden divide-y divide-border/60">
              {links.map((link) => {
                const isExpired = new Date(link.expires_at).getTime() < Date.now();
                const isActive = link.is_active && !isExpired;

                return (
                  <div key={link.id} className="p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-foreground line-clamp-1 truncate">
                          {link.document?.title || "Documento Oficial"}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          Expira: {formatDateTime(link.expires_at)}
                        </p>
                      </div>

                      {isActive ? (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">
                          Ativo
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
                          Revogado
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <span>Validade: {link.duration_label}</span>
                      <span>{link.view_count} visualizações</span>
                    </div>

                    {isActive && (
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => handleCopyLink(link.token)}
                          className="flex-1 touch-target min-h-[44px] rounded-xl border border-border bg-background text-xs font-bold flex items-center justify-center space-x-1 active:bg-muted"
                        >
                          {copiedToken === link.token ? (
                            <>
                              <Check className="h-4 w-4 text-emerald-600" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              <span>Copiar Link</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleRevokeLink(link.id)}
                          aria-label="Revogar link"
                          className="touch-target p-2 text-rose-600 rounded-xl hover:bg-rose-50 border border-rose-200"
                        >
                          <Trash2 className="h-4 w-4" />
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

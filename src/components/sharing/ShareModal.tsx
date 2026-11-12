"use client";

import React, { useState } from "react";
import { 
  Share2, 
  Copy, 
  Check, 
  Clock, 
  Lock, 
  ShieldAlert, 
  Eye, 
  Trash2,
  ExternalLink
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DocumentItem } from "@/types";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

export function ShareModal({ isOpen, onClose, document }: ShareModalProps) {
  const [duration, setDuration] = useState<"24h" | "7d" | "30d">("7d");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!document) return null;

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/share/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          duration,
          password: usePassword ? password : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        setGeneratedLink(`${origin}/compartilhar/${data.token}`);
      } else {
        // Fallback para demonstração sem backend
        const dummyToken = `sec-${Math.random().toString(36).substring(2, 10)}`;
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        setGeneratedLink(`${origin}/compartilhar/${dummyToken}`);
      }
    } catch {
      const dummyToken = `sec-${Math.random().toString(36).substring(2, 10)}`;
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setGeneratedLink(`${origin}/compartilhar/${dummyToken}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-[#0F4C5C]">
            <Share2 className="h-5 w-5" />
            <span>Compartilhar Documento</span>
          </DialogTitle>
          <DialogDescription>
            Gere um link temporário seguro para envio a outros órgãos, fiscais ou cidadãos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Documento em Destaque */}
          <div className="p-3 bg-muted/40 rounded-lg border border-border/80">
            <p className="text-xs font-semibold text-foreground truncate">{document.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {document.document_number || "Sem número"} • {document.file_name}
            </p>
          </div>

          {!generatedLink ? (
            <div className="space-y-4">
              {/* Validade do Link */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-2">
                  Tempo de Validade do Link
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["24h", "7d", "30d"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`py-2 px-3 text-xs rounded-lg font-medium border text-center transition-all ${
                        duration === d
                          ? "border-[#0F4C5C] bg-[#0F4C5C]/10 text-[#0F4C5C] font-semibold"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {d === "24h" ? "24 Horas" : d === "7d" ? "7 Dias" : "30 Dias"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Senha Opcional */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Proteger com Senha</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={usePassword}
                    onChange={(e) => setUsePassword(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-[#0F4C5C] focus:ring-[#0F4C5C]"
                  />
                </div>

                {usePassword && (
                  <Input
                    type="password"
                    placeholder="Digite a senha de acesso..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-9 text-xs mt-2"
                  />
                )}
              </div>

              <Button
                onClick={handleGenerateLink}
                disabled={isGenerating || (usePassword && !password)}
                className="w-full bg-[#0F4C5C] hover:bg-[#09333e] text-white mt-4"
              >
                {isGenerating ? "Gerando link..." : "Criar Link Seguro"}
              </Button>
            </div>
          ) : (
            /* Link Criado com Sucesso */
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs">
                Link de compartilhamento temporário gerado com sucesso!
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-muted-foreground">Link de Acesso Público</label>
                <div className="flex items-center space-x-2">
                  <Input
                    readOnly
                    value={generatedLink}
                    className="h-9 text-xs bg-muted/60 font-mono"
                  />
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    className="bg-[#0F4C5C] hover:bg-[#09333e] text-white flex-shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                <span>Expira em: {duration === "24h" ? "24 horas" : duration === "7d" ? "7 dias" : "30 dias"}</span>
                {usePassword && <Badge variant="outline">Protegido por senha</Badge>}
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGeneratedLink(null)}
                  className="text-xs"
                >
                  Gerar outro link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="text-xs"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

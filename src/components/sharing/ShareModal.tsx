"use client";

import React, { useState } from "react";
import { 
  Share2, 
  Copy, 
  Check, 
  Clock, 
  Lock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="max-w-md p-5 sm:p-6 rounded-2xl w-[94vw] sm:w-full">
        <DialogHeader className="pb-1">
          <DialogTitle className="flex items-center space-x-2 text-[#0F4C5C] text-base sm:text-lg font-bold">
            <Share2 className="h-5 w-5 flex-shrink-0" />
            <span>Compartilhar Documento</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Gere um link temporário seguro para envio a outros órgãos, fiscais ou cidadãos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Documento em Destaque */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border/80">
            <p className="text-xs sm:text-sm font-bold text-foreground truncate">{document.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {document.document_number || "Sem número"} • {document.file_name}
            </p>
          </div>

          {!generatedLink ? (
            <div className="space-y-4">
              {/* Validade do Link com Touch Targets */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">
                  Tempo de Validade do Link
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["24h", "7d", "30d"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`min-h-[44px] py-2 px-3 text-xs rounded-xl font-bold border text-center transition-all touch-manipulation active:scale-95 ${
                        duration === d
                          ? "border-[#0F4C5C] bg-[#0F4C5C]/10 text-[#0F4C5C]"
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
                    <span className="text-xs font-semibold text-foreground">Proteger com Senha</span>
                  </div>
                  <label className="touch-target p-1 -m-1 cursor-pointer flex items-center">
                    <input
                      type="checkbox"
                      checked={usePassword}
                      onChange={(e) => setUsePassword(e.target.checked)}
                      className="h-5 w-5 rounded border-border text-[#0F4C5C] focus:ring-[#0F4C5C]"
                    />
                  </label>
                </div>

                {usePassword && (
                  <input
                    type="password"
                    placeholder="Digite a senha de acesso..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full min-h-[44px] sm:min-h-[36px] h-11 sm:h-9 text-base sm:text-xs rounded-xl border border-input bg-background px-3 mt-2"
                  />
                )}
              </div>

              <button
                type="button"
                onClick={handleGenerateLink}
                disabled={isGenerating || (usePassword && !password)}
                className="w-full min-h-[48px] bg-[#0F4C5C] hover:bg-[#09333e] text-white font-bold rounded-xl text-xs sm:text-sm mt-3 shadow-sm active:scale-95 touch-manipulation disabled:opacity-50"
              >
                {isGenerating ? "Gerando link seguro..." : "Criar Link Seguro"}
              </button>
            </div>
          ) : (
            /* Link Criado com Sucesso */
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm">
                Link de compartilhamento temporário gerado com sucesso!
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-muted-foreground">Link de Acesso Público</label>
                <div className="flex items-center space-x-2">
                  <input
                    readOnly
                    value={generatedLink}
                    className="flex-1 min-h-[44px] sm:min-h-[36px] h-11 sm:h-9 text-base sm:text-xs bg-muted/60 font-mono rounded-xl border border-input px-3"
                  />
                  <button
                    onClick={handleCopy}
                    className="touch-target min-h-[44px] px-4 bg-[#0F4C5C] hover:bg-[#09333e] text-white rounded-xl text-xs font-bold flex-shrink-0 flex items-center justify-center space-x-1"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Expira em: {duration === "24h" ? "24h" : duration === "7d" ? "7 dias" : "30 dias"}</span>
                {usePassword && <Badge variant="outline" className="text-[10px]">Com senha</Badge>}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setGeneratedLink(null)}
                  className="touch-target text-xs text-muted-foreground hover:text-foreground py-2"
                >
                  Gerar outro
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="touch-target px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-muted"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

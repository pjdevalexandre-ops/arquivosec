"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("gestor@orgao.gov.br");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }

      router.push("/");
    } catch (err: any) {
      setErrorMessage(err.message || "E-mail ou senha incorretos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center items-center p-4 sm:p-6 bg-gradient-to-b from-background via-muted/30 to-background pt-safe pb-safe">
      <div className="w-full max-w-md space-y-5 sm:space-y-6">
        {/* Logotipo e Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-[#0F4C5C] text-white flex items-center justify-center shadow-elevated">
            <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <div className="flex items-center justify-center space-x-1.5 pt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              ArquivoSec
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#0F4C5C]/10 text-[#0F4C5C]">
              OFICIAL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground px-2">
            Acesso restrito ao repositório digital de documentos públicos
          </p>
        </div>

        {/* Card de Formulário */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-8 shadow-card space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-foreground block">
                E-mail Institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gestor@orgao.gov.br"
                  className="w-full pl-11 pr-3 min-h-[48px] sm:min-h-[44px] rounded-xl border border-input bg-background text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-foreground">
                  Senha de Acesso
                </label>
                <Link
                  href="/recuperar-senha"
                  className="text-xs text-[#0F4C5C] hover:underline touch-manipulation py-1"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 min-h-[48px] sm:min-h-[44px] rounded-xl border border-input bg-background text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="touch-target absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] bg-[#0F4C5C] hover:bg-[#09333e] text-white font-bold flex items-center justify-center space-x-2 rounded-xl mt-3 shadow-sm text-sm sm:text-base active:scale-[0.99] touch-manipulation"
            >
              <span>{isLoading ? "Autenticando..." : "Entrar no ArquivoSec"}</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

          {/* Dica de Segurança */}
          <div className="pt-3 border-t border-border/60 text-center">
            <p className="text-[11px] text-muted-foreground">
              Ambiente protegido por RLS (Row Level Security) e Cloudflare R2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

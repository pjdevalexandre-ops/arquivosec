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
  const [email, setEmail] = useState("gestor@prefeitura.gov.br");
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
        // Modo demonstração
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
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="w-full max-w-md space-y-6">
        {/* Logotipo e Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-[#0F4C5C] text-white flex items-center justify-center shadow-elevated">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div className="flex items-center justify-center space-x-1.5 pt-1">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">ArquivoSec</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#0F4C5C]/10 text-[#0F4C5C]">
              OFICIAL
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Acesso restrito ao repositório digital de documentos públicos
          </p>
        </div>

        {/* Card de Formulário */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-card space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground block">
                E-mail Institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gestor@orgao.gov.br"
                  className="pl-9 h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">
                  Senha de Acesso
                </label>
                <Link
                  href="/recuperar-senha"
                  className="text-xs text-[#0F4C5C] hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 h-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-[#0F4C5C] hover:bg-[#09333e] text-white font-medium flex items-center justify-center space-x-2 rounded-lg mt-2 shadow-sm"
            >
              <span>{isLoading ? "Autenticando..." : "Entrar no ArquivoSec"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Dica de Demonstração */}
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

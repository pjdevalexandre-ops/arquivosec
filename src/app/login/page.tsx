"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "unconfigured") {
      setErrorMessage(
        "Serviço de autenticação institucional não configurado. Contate o administrador do sistema para provisionar o ambiente."
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!isSupabaseConfigured()) {
        throw new Error(
          "O serviço de autenticação está temporariamente indisponível. Chaves institucionais não configuradas."
        );
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("E-mail institucional ou senha incorretos.");
        }
        if (error.message.includes("Email not confirmed")) {
          throw new Error("O e-mail cadastrado ainda não foi confirmado.");
        }
        throw new Error(error.message || "Falha na autenticação de acesso.");
      }

      // Redireciona para o painel principal após autenticação com sucesso
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Erro inesperado ao realizar login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center items-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 pt-safe pb-safe">
      <div className="w-full max-w-md space-y-5 sm:space-y-6">
        {/* Logotipo e Cabeçalho Institucional */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-[#0F4C5C] text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <div className="flex items-center justify-center space-x-2 pt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              ArquivoSec
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#0F4C5C]/10 text-[#0F4C5C]">
              OFICIAL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground px-2">
            Repositório Digital de Armazenamento e Gestão Documental Pública
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-8 shadow-sm space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start space-x-2.5 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
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
                  placeholder="servidor@orgao.gov.br"
                  className="w-full pl-11 pr-3 min-h-[44px] rounded-xl border border-input bg-background text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 min-h-[44px] rounded-xl border border-input bg-background text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
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
              className="w-full min-h-[46px] bg-[#0F4C5C] hover:bg-[#09333e] text-white font-semibold flex items-center justify-center space-x-2 rounded-xl mt-3 shadow-sm text-sm sm:text-base active:scale-[0.99] touch-manipulation"
            >
              <span>{isLoading ? "Autenticando..." : "Entrar no Sistema"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Dica de Segurança Institucional */}
          <div className="pt-3 border-t border-border/80 text-center space-y-1">
            <p className="text-[11px] text-muted-foreground">
              Acesso exclusivo para servidores públicos cadastrados.
            </p>
            <p className="text-[10px] text-muted-foreground/80">
              Novas contas institucionais devem ser criadas pelo Administrador no painel interno.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 rounded-full border-4 border-[#0F4C5C] border-t-transparent animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

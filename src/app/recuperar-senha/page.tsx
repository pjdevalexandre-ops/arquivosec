"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!isSupabaseConfigured()) {
        throw new Error("Serviço de autenticação temporariamente indisponível.");
      }

      const supabase = createClient();
      const redirectUrl = typeof window !== "undefined" 
        ? `${window.location.origin}/configuracoes` 
        : "";

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Falha ao enviar e-mail de recuperação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center items-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 pt-safe pb-safe">
      <div className="w-full max-w-md space-y-5 sm:space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-[#0F4C5C] text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Recuperação de Senha
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground px-2">
            Instruções seguras serão enviadas para redefinição do seu acesso institucional
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 sm:p-8 shadow-sm">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start space-x-2 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground block">
                  E-mail Institucional Cadastrado
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

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full min-h-[46px] bg-[#0F4C5C] hover:bg-[#09333e] text-white font-semibold rounded-xl shadow-sm text-sm sm:text-base mt-2 touch-manipulation active:scale-[0.99]"
              >
                {isLoading ? "Enviando link..." : "Enviar link de recuperação"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-3 py-2">
              <div className="h-12 w-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-foreground">Solicitação Enviada!</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Se houver uma conta institucional vinculada a <strong>{email}</strong>, você receberá um link temporário para registrar uma nova senha com segurança.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-border/80 text-center mt-5">
            <Link
              href="/login"
              className="text-xs sm:text-sm text-[#0F4C5C] hover:underline inline-flex items-center space-x-1.5 touch-manipulation py-2 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para o login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

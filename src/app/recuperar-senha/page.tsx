"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-[#0F4C5C] text-white flex items-center justify-center shadow-elevated">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Recuperação de Senha</h1>
          <p className="text-xs text-muted-foreground">
            Instruções seguras serão enviadas para redefinição do seu acesso
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-card">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground block">
                  E-mail Cadastrado
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gestor@prefeitura.gov.br"
                    className="pl-9 h-10 text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-10 bg-[#0F4C5C] hover:bg-[#09333e] text-white font-medium rounded-lg shadow-sm"
              >
                {isLoading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-3 py-2">
              <div className="h-10 w-10 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">E-mail enviado!</h3>
              <p className="text-xs text-muted-foreground">
                Se houver uma conta associada a <strong>{email}</strong>, você receberá um link temporário para criar uma nova senha.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-border/60 text-center mt-5">
            <Link
              href="/login"
              className="text-xs text-[#0F4C5C] hover:underline inline-flex items-center space-x-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar para o login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

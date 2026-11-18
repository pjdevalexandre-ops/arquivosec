"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Lock, 
  Tags, 
  FileCheck, 
  ShieldCheck, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentType, Tag } from "@/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "types" | "tags">("profile");

  // Perfil
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Tipos de Documento
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [isSavingType, setIsSavingType] = useState(false);

  // Tags
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isSavingTag, setIsSavingTag] = useState(false);

  // Senha
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Carrega configurações reais do banco Supabase
  useEffect(() => {
    async function loadConfig() {
      try {
        setIsLoadingProfile(true);
        const [profRes, typesRes, tagsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/types"),
          fetch("/api/tags"),
        ]);

        if (profRes.ok) {
          const { profile } = await profRes.json();
          if (profile) {
            setFullName(profile.full_name || "");
            setDepartment(profile.department || "");
            setEmail(profile.email || "");
          }
        }

        if (typesRes.ok) {
          const { types: dbTypes } = await typesRes.json();
          if (dbTypes) setTypes(dbTypes);
        }

        if (tagsRes.ok) {
          const { tags: dbTags } = await tagsRes.json();
          if (dbTags) setTags(dbTags);
        }
      } catch (err) {
        console.warn("Erro ao carregar configurações:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadConfig();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          department: department,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        const { error } = await res.json();
        throw new Error(error || "Falha ao salvar perfil.");
      }
    } catch (err: any) {
      console.error("Erro ao salvar perfil:", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "A confirmação de senha não confere.", error: true });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ text: "A nova senha deve ter no mínimo 6 caracteres.", error: true });
      return;
    }
    if (!isSupabaseConfigured()) {
      setPasswordMessage({ text: "Serviço de autenticação não configurado.", error: true });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        throw error;
      }

      setPasswordMessage({ text: "Senha atualizada com sucesso!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage({ text: err.message || "Erro ao atualizar senha.", error: true });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAddType = async () => {
    if (!newTypeName.trim()) return;
    setIsSavingType(true);

    try {
      const res = await fetch("/api/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName.trim() }),
      });

      if (res.ok) {
        const { type } = await res.json();
        setTypes((prev) => [...prev, type]);
        setNewTypeName("");
      } else {
        const { error } = await res.json();
        console.error("Erro ao criar tipo:", error);
      }
    } catch (err) {
      console.error("Erro ao criar tipo:", err);
    } finally {
      setIsSavingType(false);
    }
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm("Deseja excluir este tipo de documento? Documentos já classificados não serão afetados.")) return;
    try {
      const res = await fetch(`/api/types?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTypes((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Erro ao excluir tipo:", err);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    setIsSavingTag(true);

    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (res.ok) {
        const { tag } = await res.json();
        setTags((prev) => [...prev, tag]);
        setNewTagName("");
      } else {
        const { error } = await res.json();
        console.error("Erro ao criar tag:", error);
      }
    } catch (err) {
      console.error("Erro ao criar tag:", err);
    } finally {
      setIsSavingTag(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      const res = await fetch(`/api/tags?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTags((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Erro ao excluir tag:", err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5 sm:space-y-6 max-w-4xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Configurações do Sistema
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gerenciamento de perfil, parâmetros de segurança e taxonomia documental.
          </p>
        </div>

        {/* Abas Horizontais */}
        <div className="flex border-b border-border text-xs font-semibold overflow-x-auto pb-px space-x-1">
          {[
            { id: "profile", label: "Perfil do Gestor", icon: User },
            { id: "security", label: "Segurança & Senha", icon: Lock },
            { id: "types", label: "Tipos de Documento", icon: FileCheck },
            { id: "tags", label: "Gerenciar Tags", icon: Tags },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`min-h-[44px] py-2.5 px-3.5 sm:px-4 rounded-t-xl transition-colors border-b-2 flex items-center space-x-1.5 whitespace-nowrap flex-shrink-0 touch-manipulation ${
                activeTab === id
                  ? "border-[#0F4C5C] text-[#0F4C5C] bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Conteúdo da Aba */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>Configurações salvas com sucesso!</span>
            </div>
          )}

          {/* ABA: PERFIL */}
          {activeTab === "profile" && (
            isLoadingProfile ? (
              <div className="py-8 text-center">
                <Loader2 className="h-6 w-6 text-[#0F4C5C] animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground mt-2">Carregando dados do perfil...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-foreground block">Nome Completo</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nome do Servidor Público"
                      className="w-full min-h-[44px] rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-foreground block">E-mail Institucional</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full min-h-[44px] rounded-xl border border-input bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed"
                      title="O e-mail não pode ser alterado diretamente"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs sm:text-sm font-semibold text-foreground block">Órgão / Gabinete de Lotação</label>
                    <input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Ex: Secretaria Municipal de Administração"
                      className="w-full min-h-[44px] rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="touch-target min-h-[44px] px-5 py-2 bg-[#0F4C5C] hover:bg-[#09333e] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Salvar Perfil</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          )}

          {/* ABA: SEGURANÇA */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-foreground">Alteração de Senha de Acesso</h3>

                {passwordMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-start space-x-2 border ${
                      passwordMessage.error
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300"
                        : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                    }`}
                  >
                    {passwordMessage.error ? (
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{passwordMessage.text}</span>
                  </div>
                )}

                <div className="max-w-md space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1 font-medium">Nova Senha</label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo de 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1 font-medium">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      required
                      placeholder="Repita a nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="touch-target min-h-[44px] px-5 py-2 bg-[#0F4C5C] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm active:scale-95 disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Atualizando...</span>
                    </>
                  ) : (
                    <span>Atualizar Senha</span>
                  )}
                </button>
              </form>

              {/* Bloco 2FA informativo */}
              <div className="pt-6 border-t border-border space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center space-x-1.5">
                      <ShieldCheck className="h-4 w-4 text-[#0F4C5C]" />
                      <span>Autenticação em Dois Fatores (2FA)</span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Camada adicional de segurança via aplicativo autenticador OTP. Configure via painel do Supabase.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA: TIPOS DE DOCUMENTO */}
          {activeTab === "types" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Tipos Personalizados de Documento</h3>
                <p className="text-xs text-muted-foreground">Classifique seus arquivos para relatórios e pesquisas institucionais rápidas.</p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 max-w-md">
                <input
                  placeholder="Novo tipo (ex: Portaria, Ata, Contrato...)"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddType())}
                  className="flex-1 min-h-[44px] rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
                <button
                  onClick={handleAddType}
                  disabled={isSavingType || !newTypeName.trim()}
                  className="touch-target min-h-[44px] px-4 bg-[#0F4C5C] text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 disabled:opacity-50"
                >
                  {isSavingType ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span>Adicionar</span>
                </button>
              </div>

              {types.length === 0 ? (
                <p className="text-xs text-muted-foreground italic p-4 text-center border border-border rounded-xl">
                  Nenhum tipo documental cadastrado ainda.
                </p>
              ) : (
                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                  {types.map((type) => (
                    <div key={type.id} className="p-3 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-2.5">
                        <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: type.color || "#0F4C5C" }} />
                        <span className="font-semibold text-foreground">{type.name}</span>
                        <span className="text-muted-foreground text-[10px] font-mono">({type.slug})</span>
                      </div>
                      {!type.is_default && (
                        <button
                          onClick={() => handleDeleteType(type.id)}
                          aria-label={`Excluir tipo ${type.name}`}
                          className="touch-target p-2 text-muted-foreground hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA: TAGS */}
          {activeTab === "tags" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Taxonomia de Tags</h3>
                <p className="text-xs text-muted-foreground">Etiquetas para cruzamento temático e classificação de acervo.</p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 max-w-md">
                <input
                  placeholder="Nome da tag (ex: TCE-2025, Urgente, Sigiloso...)"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  className="flex-1 min-h-[44px] rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
                <button
                  onClick={handleAddTag}
                  disabled={isSavingTag || !newTagName.trim()}
                  className="touch-target min-h-[44px] px-4 bg-[#0F4C5C] text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 disabled:opacity-50"
                >
                  {isSavingTag ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span>Criar Tag</span>
                </button>
              </div>

              {tags.length === 0 ? (
                <p className="text-xs text-muted-foreground italic p-4 text-center border border-border rounded-xl">
                  Nenhuma tag cadastrada ainda.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 text-xs text-foreground min-h-[36px]"
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color || "#0F4C5C" }} />
                      <span className="font-semibold">#{tag.name}</span>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        aria-label={`Remover tag ${tag.name}`}
                        className="touch-target text-muted-foreground hover:text-rose-600 pl-1 p-1 transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

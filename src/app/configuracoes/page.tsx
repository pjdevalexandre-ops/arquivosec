"use client";

import React, { useState } from "react";
import { 
  User, 
  Lock, 
  Palette, 
  Tags, 
  FileCheck, 
  ShieldCheck, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2 
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { mockProfile, mockDocumentTypes, mockTags } from "@/lib/mock-data";
import { DocumentType, Tag } from "@/types";

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "types" | "tags">("profile");

  // Perfil
  const [fullName, setFullName] = useState(mockProfile.full_name);
  const [department, setDepartment] = useState(mockProfile.department);
  const [email, setEmail] = useState(mockProfile.email);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Tipos de Documento
  const [types, setTypes] = useState<DocumentType[]>(mockDocumentTypes);
  const [newTypeName, setNewTypeName] = useState("");

  // Tags
  const [tags, setTags] = useState<Tag[]>(mockTags);
  const [newTagName, setNewTagName] = useState("");

  // Senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddType = () => {
    if (!newTypeName.trim()) return;
    const newT: DocumentType = {
      id: `t-${Date.now()}`,
      name: newTypeName.trim(),
      slug: newTypeName.toLowerCase().replace(/\s+/g, "-"),
      color: "#0F4C5C",
      is_default: false,
    };
    setTypes([...types, newT]);
    setNewTypeName("");
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const newTg: Tag = {
      id: `tag-${Date.now()}`,
      user_id: mockProfile.id,
      name: newTagName.trim(),
      color: "#3B82F6",
    };
    setTags([...tags, newTg]);
    setNewTagName("");
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

        {/* Abas Horizontais com Rolagem Suave no Mobile */}
        <div className="flex border-b border-border/80 text-xs font-semibold overflow-x-auto pb-px space-x-1 no-scrollbar">
          <button
            onClick={() => setActiveTab("profile")}
            className={`min-h-[44px] py-2.5 px-3.5 sm:px-4 rounded-t-xl transition-colors border-b-2 flex items-center space-x-2 whitespace-nowrap flex-shrink-0 touch-manipulation ${
              activeTab === "profile"
                ? "border-[#0F4C5C] text-[#0F4C5C] bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Perfil do Gestor</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`min-h-[44px] py-2.5 px-3.5 sm:px-4 rounded-t-xl transition-colors border-b-2 flex items-center space-x-2 whitespace-nowrap flex-shrink-0 touch-manipulation ${
              activeTab === "security"
                ? "border-[#0F4C5C] text-[#0F4C5C] bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>Segurança & Senha</span>
          </button>

          <button
            onClick={() => setActiveTab("types")}
            className={`min-h-[44px] py-2.5 px-3.5 sm:px-4 rounded-t-xl transition-colors border-b-2 flex items-center space-x-2 whitespace-nowrap flex-shrink-0 touch-manipulation ${
              activeTab === "types"
                ? "border-[#0F4C5C] text-[#0F4C5C] bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileCheck className="h-4 w-4" />
            <span>Tipos de Documento</span>
          </button>

          <button
            onClick={() => setActiveTab("tags")}
            className={`min-h-[44px] py-2.5 px-3.5 sm:px-4 rounded-t-xl transition-colors border-b-2 flex items-center space-x-2 whitespace-nowrap flex-shrink-0 touch-manipulation ${
              activeTab === "tags"
                ? "border-[#0F4C5C] text-[#0F4C5C] bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tags className="h-4 w-4" />
            <span>Gerenciar Tags</span>
          </button>
        </div>

        {/* Conteúdo da Aba com Campos Touch-Friendly */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-6 shadow-soft space-y-6">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>Configurações salvas com sucesso!</span>
            </div>
          )}

          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-foreground block">Nome Completo</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full min-h-[44px] sm:min-h-[36px] h-11 sm:h-9 text-base sm:text-xs rounded-xl border border-input bg-background px-3"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-foreground block">E-mail Institucional</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full min-h-[44px] sm:min-h-[36px] h-11 sm:h-9 text-base sm:text-xs rounded-xl border border-input bg-background px-3"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs sm:text-sm font-semibold text-foreground block">Órgão / Gabinete de Lotação</label>
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full min-h-[44px] sm:min-h-[36px] h-11 sm:h-9 text-base sm:text-xs rounded-xl border border-input bg-background px-3"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <button
                  type="submit"
                  className="touch-target min-h-[44px] px-5 py-2 bg-[#0F4C5C] hover:bg-[#09333e] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm flex items-center space-x-1.5 active:scale-95"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar Perfil</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-foreground">Alteração de Senha</h3>

                <div className="max-w-md space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Senha Atual</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full min-h-[44px] sm:min-h-[36px] h-11 sm:h-9 text-base sm:text-xs rounded-xl border border-input bg-background px-3"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Nova Senha</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full min-h-[44px] sm:min-h-[36px] h-11 sm:h-9 text-base sm:text-xs rounded-xl border border-input bg-background px-3"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full min-h-[44px] sm:min-h-[36px] h-11 sm:h-9 text-base sm:text-xs rounded-xl border border-input bg-background px-3"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="touch-target min-h-[44px] px-5 py-2 bg-[#0F4C5C] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm active:scale-95"
                >
                  Atualizar Senha
                </button>
              </form>

              {/* 2FA */}
              <div className="pt-6 border-t border-border space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center space-x-1.5">
                      <ShieldCheck className="h-4 w-4 text-[#0F4C5C]" />
                      <span>Autenticação em Dois Fatores (2FA)</span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Camada adicional de segurança com aplicativo autenticador OTP.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="touch-target min-h-[44px] px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted self-start sm:self-auto"
                  >
                    Configurar 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "types" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Tipos Personalizados de Documento</h3>
                <p className="text-xs text-muted-foreground">Classifique seus arquivos para relatórios e pesquisas rápidas</p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 max-w-md">
                <input
                  placeholder="Novo tipo (ex: Portaria, Ata...)"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="flex-1 min-h-[44px] sm:min-h-[36px] h-11 sm:h-9 text-base sm:text-xs rounded-xl border border-input bg-background px-3"
                />
                <button
                  onClick={handleAddType}
                  className="touch-target min-h-[44px] px-4 bg-[#0F4C5C] text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar</span>
                </button>
              </div>

              <div className="divide-y divide-border/60 border border-border/80 rounded-xl overflow-hidden">
                {types.map((type) => (
                  <div key={type.id} className="p-3 flex items-center justify-between text-xs hover:bg-muted/30">
                    <div className="flex items-center space-x-2.5">
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: type.color }} />
                      <span className="font-semibold text-foreground text-xs sm:text-sm">{type.name}</span>
                      <span className="text-muted-foreground text-[10px]">({type.slug})</span>
                    </div>

                    {!type.is_default && (
                      <button
                        onClick={() => setTypes(types.filter((t) => t.id !== type.id))}
                        aria-label="Excluir tipo"
                        className="touch-target p-2 text-muted-foreground hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "tags" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Taxonomia de Tags</h3>
                <p className="text-xs text-muted-foreground">Etiquetas para cruzamento de dados e classificação temática</p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 max-w-md">
                <input
                  placeholder="Nome da tag (ex: TCE-2025, Sigiloso...)"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-1 min-h-[44px] sm:min-h-[36px] h-11 sm:h-9 text-base sm:text-xs rounded-xl border border-input bg-background px-3"
                />
                <button
                  onClick={handleAddTag}
                  className="touch-target min-h-[44px] px-4 bg-[#0F4C5C] text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Criar Tag</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 text-xs text-foreground min-h-[36px]"
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                    <span className="font-semibold">#{tag.name}</span>
                    <button
                      onClick={() => setTags(tags.filter((t) => t.id !== tag.id))}
                      aria-label={`Remover tag ${tag.name}`}
                      className="touch-target text-muted-foreground hover:text-rose-600 pl-1 p-1"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

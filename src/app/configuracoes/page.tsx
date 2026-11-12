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
import { Input } from "@/components/ui/input";
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
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Configurações do Sistema
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gerenciamento de perfil, parâmetros de segurança, tipos de documentos e taxonomia de tags.
          </p>
        </div>

        {/* Abas Superiores */}
        <div className="flex border-b border-border/80 text-xs font-medium space-x-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-2.5 px-4 rounded-t-lg transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === "profile"
                ? "border-[#0F4C5C] text-[#0F4C5C] font-semibold bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Perfil do Gestor</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`py-2.5 px-4 rounded-t-lg transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === "security"
                ? "border-[#0F4C5C] text-[#0F4C5C] font-semibold bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>Segurança & Senha</span>
          </button>

          <button
            onClick={() => setActiveTab("types")}
            className={`py-2.5 px-4 rounded-t-lg transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === "types"
                ? "border-[#0F4C5C] text-[#0F4C5C] font-semibold bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileCheck className="h-4 w-4" />
            <span>Tipos de Documento</span>
          </button>

          <button
            onClick={() => setActiveTab("tags")}
            className={`py-2.5 px-4 rounded-t-lg transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === "tags"
                ? "border-[#0F4C5C] text-[#0F4C5C] font-semibold bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tags className="h-4 w-4" />
            <span>Gerenciar Tags</span>
          </button>
        </div>

        {/* Conteúdo da Aba */}
        <div className="bg-card border border-border/80 rounded-xl p-6 shadow-soft space-y-6">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>Configurações salvas com sucesso!</span>
            </div>
          )}

          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground block">Nome Completo</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground block">E-mail Institucional</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-foreground block">Órgão / Lotação</label>
                  <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button type="submit" className="bg-[#0F4C5C] hover:bg-[#09333e] text-white text-xs h-9">
                  <Save className="h-4 w-4 mr-1.5" />
                  Salvar Perfil
                </Button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Alteração de Senha</h3>

                <div className="max-w-md space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Senha Atual</label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Nova Senha</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Confirmar Nova Senha</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <Button type="submit" className="bg-[#0F4C5C] text-white text-xs h-9">
                  Atualizar Senha
                </Button>
              </form>

              {/* 2FA */}
              <div className="pt-6 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground flex items-center space-x-1.5">
                      <ShieldCheck className="h-4 w-4 text-[#0F4C5C]" />
                      <span>Autenticação em Dois Fatores (2FA)</span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Protege sua conta com uma camada adicional de confirmação por aplicativo OTP.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Configurar 2FA
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "types" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Tipos Personalizados de Documento</h3>
                  <p className="text-xs text-muted-foreground">Classifique seus arquivos para relatórios e pesquisas rápidas</p>
                </div>
              </div>

              <div className="flex space-x-2 max-w-md">
                <Input
                  placeholder="Novo tipo (ex: Portaria, Ata de Reunião...)"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="h-9 text-xs"
                />
                <Button onClick={handleAddType} className="bg-[#0F4C5C] text-white h-9 text-xs flex-shrink-0">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Adicionar
                </Button>
              </div>

              <div className="divide-y divide-border/60 border border-border/80 rounded-lg overflow-hidden">
                {types.map((type) => (
                  <div key={type.id} className="p-3 flex items-center justify-between text-xs hover:bg-muted/30">
                    <div className="flex items-center space-x-2.5">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color }} />
                      <span className="font-semibold text-foreground">{type.name}</span>
                      <span className="text-muted-foreground text-[11px]">({type.slug})</span>
                    </div>

                    {!type.is_default && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setTypes(types.filter((t) => t.id !== type.id))}
                        className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "tags" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Taxonomia de Tags</h3>
                <p className="text-xs text-muted-foreground">Etiquetas para cruzamento de dados e classificação temática</p>
              </div>

              <div className="flex space-x-2 max-w-md">
                <Input
                  placeholder="Nome da nova tag (ex: TCE-2025, Sigiloso...)"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="h-9 text-xs"
                />
                <Button onClick={handleAddTag} className="bg-[#0F4C5C] text-white h-9 text-xs flex-shrink-0">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Criar Tag
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg border border-border bg-muted/40 text-xs text-foreground"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                    <span className="font-medium">#{tag.name}</span>
                    <button
                      onClick={() => setTags(tags.filter((t) => t.id !== tag.id))}
                      className="text-muted-foreground hover:text-rose-600 pl-1"
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

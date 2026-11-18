"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  UserPlus, 
  Activity, 
  ShieldCheck, 
  Circle, 
  Clock, 
  HardDrive, 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Upload, 
  Download, 
  Trash2, 
  Share2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileText
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfile, ActivityLog } from "@/types";
import { formatBytes, formatRelativeTime, formatDateTime } from "@/lib/utils";

export default function UsuariosAdminPage() {
  const [activeTab, setActiveTab] = useState<"online" | "audit" | "new_user">("online");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form Novo Usuário
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDepartment, setNewDepartment] = useState("Gabinete / Gestão Pública");
  const [newRole, setNewRole] = useState<"admin" | "gestor" | "operador">("gestor");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [userSuccessMessage, setUserSuccessMessage] = useState<string | null>(null);
  const [userErrorMessage, setUserErrorMessage] = useState<string | null>(null);

  // Filtro de auditoria
  const [filterAction, setFilterAction] = useState<string>("all");

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        if (data.users) setUsers(data.users);
      }
    } catch (e) {
      console.warn("Erro ao buscar usuários:", e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadActivities = async () => {
    try {
      setIsLoadingAudit(true);
      const res = await fetch("/api/admin/activity?limit=100");
      if (res.ok) {
        const data = await res.json();
        if (data.activities) setActivities(data.activities);
      }
    } catch (e) {
      console.warn("Erro ao buscar auditoria:", e);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadUsers(), loadActivities()]);
    setIsRefreshing(false);
  };

  // Carregamento inicial e atualização periódica a cada 20 segundos
  useEffect(() => {
    loadUsers();
    loadActivities();

    const interval = setInterval(() => {
      loadUsers();
      loadActivities();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingUser(true);
    setUserSuccessMessage(null);
    setUserErrorMessage(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: newFullName.trim(),
          email: newEmail.trim(),
          password: newPassword,
          department: newDepartment.trim(),
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao criar usuário.");
      }

      setUserSuccessMessage(`Usuário ${newEmail} cadastrado com sucesso!`);
      setNewFullName("");
      setNewEmail("");
      setNewPassword("");
      setNewDepartment("Gabinete / Gestão Pública");
      setNewRole("gestor");

      // Atualiza lista
      loadUsers();
      loadActivities();
    } catch (err: any) {
      setUserErrorMessage(err.message || "Erro inesperado ao cadastrar usuário.");
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const onlineUsers = users.filter((u) => u.is_online);
  const offlineUsers = users.filter((u) => !u.is_online);

  const filteredActivities = activities.filter((act) => {
    if (filterAction === "all") return true;
    return act.action === filterAction;
  });

  const getActionDetails = (action: string) => {
    switch (action) {
      case "upload":
        return { label: "Enviou documento", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200", icon: Upload };
      case "view":
        return { label: "Visualizou arquivo", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200", icon: Eye };
      case "download":
        return { label: "Baixou arquivo", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200", icon: Download };
      case "delete":
        return { label: "Moveu para lixeira", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200", icon: Trash2 };
      case "share":
        return { label: "Gerou link de compartilhamento", color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200", icon: Share2 };
      case "update":
        return { label: "Atualizou dados/perfil", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200", icon: Edit3 };
      default:
        return { label: "Ação no sistema", color: "text-slate-600 bg-slate-50 dark:bg-slate-900 border-slate-200", icon: Activity };
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5 sm:space-y-6 max-w-full">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/80">
          <div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-xl bg-[#0F4C5C] text-white flex items-center justify-center shadow-soft">
                <Users className="h-4 w-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                Gestão de Equipe & Monitoramento
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-[#0F4C5C] dark:text-cyan-400 font-mono">
                ADMIN
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Painel exclusivo para controle de acessos, presença em tempo real e trilha de auditoria.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="touch-target px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
              title="Atualizar dados agora"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#0F4C5C]" : ""}`} />
              <span>{isRefreshing ? "Atualizando..." : "Atualizar"}</span>
            </button>
            <button
              onClick={() => setActiveTab("new_user")}
              className="touch-target px-3.5 py-2 rounded-xl bg-[#0F4C5C] hover:bg-[#09333e] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              <span>Novo Usuário</span>
            </button>
          </div>
        </div>

        {/* Resumo Rápido no Topo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-soft flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Online Agora</span>
              <span className="text-xl sm:text-2xl font-extrabold text-foreground font-mono">
                {onlineUsers.length}
              </span>
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-soft flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-[#0F4C5C]/10 text-[#0F4C5C] flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Total de Usuários</span>
              <span className="text-xl sm:text-2xl font-extrabold text-foreground font-mono">
                {users.length}
              </span>
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-soft flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 flex items-center justify-center flex-shrink-0">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Ações Registradas</span>
              <span className="text-xl sm:text-2xl font-extrabold text-foreground font-mono">
                {activities.length}
              </span>
            </div>
          </div>
        </div>

        {/* Abas Superiores */}
        <div className="flex border-b border-border/80 text-xs font-semibold overflow-x-auto pb-px space-x-1 no-scrollbar">
          <button
            onClick={() => setActiveTab("online")}
            className={`min-h-[44px] py-2.5 px-4 rounded-t-xl transition-colors border-b-2 flex items-center space-x-2 whitespace-nowrap touch-manipulation ${
              activeTab === "online"
                ? "border-[#0F4C5C] text-[#0F4C5C] bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pessoas Online & Equipe ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`min-h-[44px] py-2.5 px-4 rounded-t-xl transition-colors border-b-2 flex items-center space-x-2 whitespace-nowrap touch-manipulation ${
              activeTab === "audit"
                ? "border-[#0F4C5C] text-[#0F4C5C] bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Trilha de Auditoria Ao Vivo</span>
          </button>

          <button
            onClick={() => setActiveTab("new_user")}
            className={`min-h-[44px] py-2.5 px-4 rounded-t-xl transition-colors border-b-2 flex items-center space-x-2 whitespace-nowrap touch-manipulation ${
              activeTab === "new_user"
                ? "border-[#0F4C5C] text-[#0F4C5C] bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Cadastrar Novo Usuário</span>
          </button>
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === "online" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Status em Tempo Real dos Usuários</h3>
              <span className="text-[11px] text-muted-foreground">Atualiza automaticamente a cada 20 segundos</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {users.map((user) => {
                const isOnline = user.is_online;
                const isAdmin = user.role === "admin";

                return (
                  <div
                    key={user.id}
                    className={`p-4 bg-card border rounded-2xl shadow-soft space-y-3 transition-all ${
                      isOnline ? "border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-500/10" : "border-border/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0F4C5C] to-[#2563EB] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                            {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                          </div>
                          {isOnline ? (
                            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-card" title="Online Agora" />
                          ) : (
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-card" title="Offline" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                            {user.full_name || "Servidor Público"}
                          </h4>
                          <p className="text-[11px] text-muted-foreground truncate flex items-center space-x-1">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span>{user.email}</span>
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant={isAdmin ? "default" : "outline"}
                        className={`text-[9px] uppercase font-bold tracking-wider flex-shrink-0 ${
                          isAdmin ? "bg-[#0F4C5C] text-white" : ""
                        }`}
                      >
                        {isAdmin ? "Admin" : user.role || "Operador"}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-border/60 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground flex items-center space-x-1">
                          <Building2 className="h-3 w-3" />
                          <span>Lotação:</span>
                        </span>
                        <span className="font-medium text-foreground truncate max-w-[150px]">
                          {user.department || "Gabinete Oficial"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground flex items-center space-x-1">
                          <Activity className="h-3 w-3" />
                          <span>Local Atual:</span>
                        </span>
                        <span className={`font-semibold truncate max-w-[160px] ${
                          isOnline ? "text-[#0F4C5C] dark:text-cyan-400" : "text-muted-foreground"
                        }`}>
                          {isOnline ? (user.current_page || "No Sistema") : "Desconectado"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Última Atividade:</span>
                        </span>
                        <span className="font-mono">
                          {isOnline ? "Agora mesmo" : formatRelativeTime(user.last_seen_at || user.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Aba 2: Trilha de Auditoria Ao Vivo */}
        {activeTab === "audit" && (
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-6 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
              <div>
                <h3 className="text-sm font-bold text-foreground">Registro de Ações em Tempo Real</h3>
                <p className="text-xs text-muted-foreground">Histórico auditável de tudo o que os usuários fazem no acervo oficial.</p>
              </div>

              {/* Filtro de Ação */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setFilterAction("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    filterAction === "all" ? "bg-[#0F4C5C] text-white" : "border border-border text-muted-foreground"
                  }`}
                >
                  Todas ({activities.length})
                </button>
                <button
                  onClick={() => setFilterAction("upload")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    filterAction === "upload" ? "bg-[#0F4C5C] text-white" : "border border-border text-muted-foreground"
                  }`}
                >
                  Envios
                </button>
                <button
                  onClick={() => setFilterAction("view")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    filterAction === "view" ? "bg-[#0F4C5C] text-white" : "border border-border text-muted-foreground"
                  }`}
                >
                  Visualizações
                </button>
                <button
                  onClick={() => setFilterAction("delete")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    filterAction === "delete" ? "bg-[#0F4C5C] text-white" : "border border-border text-muted-foreground"
                  }`}
                >
                  Exclusões
                </button>
              </div>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground space-y-2">
                <Activity className="h-8 w-8 mx-auto text-muted-foreground/60" />
                <p className="text-xs">Nenhum evento registrado nesta categoria até o momento.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {filteredActivities.map((act) => {
                  const meta = getActionDetails(act.action);
                  const Icon = meta.icon;
                  const docTitle = act.document?.title || act.details?.file_name || act.details?.action_description || "Item do acervo";

                  return (
                    <div key={act.id} className="py-3.5 flex items-start space-x-3 text-xs">
                      <div className={`p-2 rounded-xl border flex-shrink-0 mt-0.5 ${meta.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <p className="text-foreground leading-snug">
                            <span className="font-bold text-[#0F4C5C] dark:text-cyan-400">
                              {act.user?.full_name || act.user?.email || "Servidor"}:{" "}
                            </span>
                            <span className="font-semibold">{meta.label}</span>
                            <span className="text-muted-foreground"> — &ldquo;{docTitle}&rdquo;</span>
                          </p>

                          <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                            {formatDateTime(act.created_at)} ({formatRelativeTime(act.created_at)})
                          </span>
                        </div>

                        {act.user?.department && (
                          <p className="text-[10px] text-muted-foreground flex items-center space-x-1">
                            <span>Lotação: {act.user.department}</span>
                            {act.user.role && (
                              <span className="font-mono font-semibold">({act.user.role})</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Aba 3: Cadastrar Novo Usuário */}
        {activeTab === "new_user" && (
          <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-7 shadow-card space-y-5 max-w-2xl">
            <div className="pb-3 border-b border-border/80">
              <h3 className="text-base font-bold text-foreground flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-[#0F4C5C]" />
                <span>Cadastro de Servidor / Gestor Oficial</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Crie um novo acesso interno com e-mail institucional e senha definida pelo Administrador.
              </p>
            </div>

            {userSuccessMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                <span>{userSuccessMessage}</span>
              </div>
            )}

            {userErrorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600" />
                <span>{userErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground block">
                  Nome Completo do Servidor
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ex: Dr. Carlos Eduardo Silva"
                  className="w-full px-3 min-h-[44px] rounded-xl border border-input bg-background text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-foreground block">
                    E-mail Institucional
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="carlos.silva@orgao.gov.br"
                    className="w-full px-3 min-h-[44px] rounded-xl border border-input bg-background text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-foreground block">
                    Senha Provisória
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Mínimo 6 dígitos"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-3 pr-10 min-h-[44px] rounded-xl border border-input bg-background text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="touch-target absolute right-1 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-foreground block">
                    Secretaria / Departamento
                  </label>
                  <input
                    type="text"
                    required
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="Ex: Secretaria de Finanças"
                    className="w-full px-3 min-h-[44px] rounded-xl border border-input bg-background text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-foreground block">
                    Nível de Acesso (Perfil)
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 min-h-[44px] rounded-xl border border-input bg-background text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                  >
                    <option value="gestor">Gestor Padrão (Acesso ao Acervo e Pastas)</option>
                    <option value="operador">Operador (Envio e Consulta)</option>
                    <option value="admin">Administrador (Controle Total + Monitoramento)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="min-h-[44px] px-6 bg-[#0F4C5C] hover:bg-[#09333e] text-white font-bold rounded-xl shadow-sm active:scale-95 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSubmittingUser ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Cadastrando Usuário...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Confirmar e Criar Acesso</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

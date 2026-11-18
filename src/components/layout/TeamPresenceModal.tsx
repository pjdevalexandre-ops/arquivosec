"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  MessageSquare, 
  Send, 
  X, 
  Check, 
  CheckCheck, 
  Clock, 
  Building2, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle,
  Eye,
  CheckCircle2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

interface InternalMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface TeamPresenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export function TeamPresenceModal({
  isOpen,
  onClose,
  currentUserId,
}: TeamPresenceModalProps) {
  const [activeTab, setActiveTab] = useState<"team" | "messages">("team");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Estado para envio de mensagem
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, messagesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/messages"),
      ]);

      if (usersRes.ok) {
        const uData = await usersRes.json();
        if (uData.users) setUsers(uData.users);
      }

      if (messagesRes.ok) {
        const mData = await messagesRes.json();
        if (mData.messages) setMessages(mData.messages);
        if (mData.unreadCount !== undefined) setUnreadCount(mData.unreadCount);
      }
    } catch (e) {
      console.warn("Erro ao carregar dados de presença:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !messageText.trim()) return;

    try {
      setIsSending(true);
      setSendError(null);
      setSendSuccess(null);

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: selectedUser.id,
          message: messageText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao enviar mensagem.");
      }

      setSendSuccess(`Mensagem enviada com sucesso para ${selectedUser.full_name}!`);
      setMessageText("");
      setTimeout(() => {
        setSelectedUser(null);
        setSendSuccess(null);
      }, 1500);
    } catch (err: any) {
      setSendError(err.message || "Erro ao enviar recado.");
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_all: true }),
      });
      setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
      setUnreadCount(0);
    } catch (_) {}
  };

  const onlineCount = users.filter((u) => u.is_online).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl bg-card border border-border shadow-2xl">
        {/* Cabeçalho do Modal */}
        <div className="bg-[#0F4C5C] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>Equipe Institucional</span>
                <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{onlineCount} online</span>
                </span>
              </DialogTitle>
              <p className="text-xs text-white/80 mt-0.5">
                Presença em tempo real e comunicação interna da equipe.
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            aria-label="Atualizar dados de presença"
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
            title="Atualizar lista"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-border bg-muted/40 px-4 pt-2">
          <button
            onClick={() => setActiveTab("team")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === "team"
                ? "border-[#0F4C5C] text-[#0F4C5C]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Membros ({users.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("messages");
              if (unreadCount > 0) handleMarkAllRead();
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 relative ${
              activeTab === "messages"
                ? "border-[#0F4C5C] text-[#0F4C5C]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Mensagens</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-4">
          {activeTab === "team" && (
            <div className="space-y-2.5">
              {users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  {isLoading ? "Consultando equipe no servidor..." : "Nenhum membro encontrado."}
                </div>
              ) : (
                users.map((u) => {
                  const isMe = currentUserId && (u.id === currentUserId || u.email === currentUserId);
                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-background hover:bg-muted/30 transition-colors gap-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* Avatar com Indicador Verde */}
                        <div className="relative flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-[#0F4C5C]/10 text-[#0F4C5C] flex items-center justify-center font-bold text-xs">
                            {u.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          {u.is_online ? (
                            <span 
                              className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" 
                              title="Online agora"
                            />
                          ) : (
                            <span 
                              className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600 ring-2 ring-card" 
                              title="Offline"
                            />
                          )}
                        </div>

                        {/* Dados do Usuário */}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="text-xs font-bold text-foreground truncate max-w-[150px] sm:max-w-[200px]">
                              {u.full_name}
                            </span>
                            {isMe && (
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-semibold">
                                Você
                              </span>
                            )}
                            <Badge
                              variant={u.role === "admin" ? "default" : "outline"}
                              className="text-[9px] uppercase px-1 py-0"
                            >
                              {u.role || "gestor"}
                            </Badge>
                          </div>

                          <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>

                          {/* Página Atual e Presença */}
                          <div className="flex items-center space-x-2 mt-0.5 text-[10px]">
                            {u.is_online ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                                <span>Online em: {u.current_page || "Painel"}</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                {u.last_seen_at
                                  ? `Visto ${formatRelativeTime(u.last_seen_at)}`
                                  : "Ainda não acessou"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botão para Enviar Mensagem */}
                      {!isMe && (
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setSendSuccess(null);
                            setSendError(null);
                            setMessageText("");
                          }}
                          className="touch-target px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold flex items-center space-x-1.5 text-foreground hover:text-[#0F4C5C] active:scale-95 transition-all flex-shrink-0"
                          title={`Enviar mensagem para ${u.full_name}`}
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-[#0F4C5C]" />
                          <span className="hidden sm:inline">Mensagem</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "messages" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-foreground">Recados e Avisos Recebidos</span>
                {messages.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-[#0F4C5C] hover:underline font-medium"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs space-y-2">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p>Nenhuma mensagem recebida ainda.</p>
                  <p className="text-[11px] text-muted-foreground/80">
                    Você pode mandar um recado para qualquer colega clicando na aba Membros.
                  </p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-1.5 ${
                      !m.is_read
                        ? "bg-[#0F4C5C]/5 border-[#0F4C5C]/30 shadow-xs"
                        : "bg-background border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-foreground">{m.sender_name}</span>
                        {!m.is_read && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" title="Não lida" />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(m.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {m.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Card Flutuante de Envio de Mensagem para o Usuário Selecionado */}
          {selectedUser && (
            <div className="mt-4 p-4 rounded-xl border border-[#0F4C5C]/40 bg-[#0F4C5C]/5 shadow-sm space-y-3 animate-in fade-in-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#0F4C5C]">
                  <Send className="h-3.5 w-3.5" />
                  <span>Enviar Recado para: {selectedUser.full_name}</span>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {sendError && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{sendError}</span>
                </div>
              )}

              {sendSuccess && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{sendSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="space-y-2.5">
                <textarea
                  rows={2}
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Escreva uma mensagem rápida para ${selectedUser.full_name}...`}
                  className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                    className="h-8 text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSending || !messageText.trim()}
                    className="h-8 text-xs bg-[#0F4C5C] hover:bg-[#09333e] text-white flex items-center space-x-1.5"
                  >
                    <Send className="h-3 w-3" />
                    <span>{isSending ? "Enviando..." : "Enviar Recado"}</span>
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

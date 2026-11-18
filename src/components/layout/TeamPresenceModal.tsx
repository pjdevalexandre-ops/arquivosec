"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  Send, 
  X, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Check,
  CheckCheck,
  Circle,
  MessageSquare
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/types";
import { formatRelativeTime, formatDateTime } from "@/lib/utils";

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
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Destinatário selecionado para envio
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, messagesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/messages"),
      ]);

      if (usersRes.ok) {
        const uData = await usersRes.json();
        if (uData.users) {
          setUsers(uData.users);
          // Se não houver destinatário selecionado, pré-seleciona o primeiro que não seja eu
          setSelectedUser((prev) => {
            if (prev) return prev;
            const otherUser = uData.users.find(
              (u: UserProfile) => u.id !== currentUserId && u.email !== currentUserId
            );
            return otherUser || uData.users[0] || null;
          });
        }
      }

      if (messagesRes.ok) {
        const mData = await messagesRes.json();
        if (mData.messages) {
          setMessages(mData.messages);
        }
        if (mData.unreadCount !== undefined) {
          setUnreadCount(mData.unreadCount);
        }
      }
    } catch (e) {
      console.warn("Erro ao carregar dados:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Marca mensagens como lidas ao abrir o chat
      fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_all: true }),
      }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser) return;

    const textToSend = messageText.trim();
    setMessageText("");
    setIsSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: selectedUser.id,
          message: textToSend,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao enviar.");
      }

      // Adiciona imediatamente na lista de mensagens na tela
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      } else {
        loadData();
      }

      setStatusFeedback(`Enviado para ${selectedUser.full_name}`);
      setTimeout(() => setStatusFeedback(null), 3000);
    } catch (err: any) {
      setStatusFeedback(err.message || "Erro ao enviar.");
      setMessageText(textToSend); // restaura o texto se der erro
    } finally {
      setIsSending(false);
    }
  };

  const onlineUsers = users.filter((u) => u.is_online);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl bg-card border border-border shadow-2xl flex flex-col h-[85vh] max-h-[700px]">
        {/* 1. Cabeçalho Principal */}
        <div className="bg-[#0F4C5C] text-white p-3.5 sm:p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
                <span>Comunicação da Equipe</span>
                <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{onlineUsers.length} online</span>
                </span>
              </DialogTitle>
              <p className="text-[11px] text-white/80">
                Veja quem está online e envie recados instantâneos em um só lugar.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              title="Atualizar agora"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 2. Barra de Seleção Rápida de Usuários (Quem está online / Membros) */}
        <div className="p-2.5 sm:p-3 border-b border-border bg-muted/30 flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Clique em um membro para mandar mensagem:
            </span>
            {selectedUser && (
              <span className="text-[11px] text-[#0F4C5C] font-semibold flex items-center space-x-1">
                <span>Destinatário:</span>
                <span className="font-bold underline">{selectedUser.full_name}</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
            {users.map((u) => {
              const isSelected = selectedUser?.id === u.id;
              const isMe = currentUserId && (u.id === currentUserId || u.email === currentUserId);

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUser(u)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all flex-shrink-0 select-none ${
                    isSelected
                      ? "bg-[#0F4C5C] text-white border-[#0F4C5C] shadow-sm scale-102"
                      : "bg-background hover:bg-muted/60 text-foreground border-border"
                  }`}
                >
                  {/* Avatar com Indicador */}
                  <div className="relative">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isSelected ? "bg-white/20 text-white" : "bg-[#0F4C5C]/10 text-[#0F4C5C]"
                      }`}
                    >
                      {u.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    {u.is_online ? (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-1 ring-card" />
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600 ring-1 ring-card" />
                    )}
                  </div>

                  {/* Nome e Status */}
                  <div className="text-left leading-tight">
                    <p className="text-xs font-semibold truncate max-w-[110px]">
                      {u.full_name.split(" ")[0]} {isMe ? "(Você)" : ""}
                    </p>
                    <p
                      className={`text-[9px] truncate max-w-[110px] ${
                        isSelected ? "text-white/80" : "text-muted-foreground"
                      }`}
                    >
                      {u.is_online ? (u.current_page || "Online") : "Offline"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Área Central: Histórico de Conversas e Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs space-y-2">
              <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="font-medium text-foreground">Nenhuma mensagem recente.</p>
              <p className="text-[11px] max-w-xs mx-auto">
                Digite um recado abaixo e envie imediatamente para o colega selecionado.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine =
                m.sender_name === "Você" ||
                (currentUserId && (m.sender_id === currentUserId || m.sender_name.includes(currentUserId)));

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center space-x-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-foreground">
                      {isMine ? "Você" : m.sender_name}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {formatRelativeTime(m.created_at)}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                      isMine
                        ? "bg-[#0F4C5C] text-white rounded-tr-none"
                        : "bg-card border border-border text-foreground rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 4. Rodapé Fixo: Digitação e Envio Direto em Bloco Único */}
        <div className="p-3 border-t border-border bg-card flex-shrink-0 space-y-2">
          {statusFeedback && (
            <div className="text-[11px] text-[#0F4C5C] font-semibold flex items-center space-x-1 animate-in fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{statusFeedback}</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={
                  selectedUser
                    ? `Enviar recado para ${selectedUser.full_name}... (Pressione Enter)`
                    : "Selecione um usuário acima para enviar..."
                }
                disabled={!selectedUser}
                className="w-full px-3.5 py-2.5 bg-background border border-input rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] disabled:opacity-50"
              />
            </div>

            <Button
              type="submit"
              disabled={isSending || !messageText.trim() || !selectedUser}
              className="bg-[#0F4C5C] hover:bg-[#09333e] text-white h-10 px-4 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm active:scale-95 disabled:opacity-50 flex-shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

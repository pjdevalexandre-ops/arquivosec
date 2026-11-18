"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Upload, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  Menu, 
  X,
  FileText,
  SlidersHorizontal,
  Folder,
  Trash2,
  Share2,
  Users,
  MessageSquare,
  Bell
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types";
import { TeamPresenceModal } from "./TeamPresenceModal";

interface TopbarProps {
  userProfile?: UserProfile;
  onOpenUpload?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Topbar({
  userProfile,
  onOpenUpload,
  onToggleMobileMenu,
  isMobileMenuOpen,
}: TopbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  // Estados para Equipe & Mensagens no Cabeçalho
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [incomingNotification, setIncomingNotification] = useState<{ sender: string; text: string } | null>(null);

  // Monitoramento de presença de usuários e mensagens não lidas
  useEffect(() => {
    let lastUnread = 0;

    const checkTeamAndMessages = async () => {
      try {
        const [usersRes, messagesRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/messages"),
        ]);

        if (usersRes.ok) {
          const uData = await usersRes.json();
          if (uData.users) {
            const count = uData.users.filter((u: any) => u.is_online).length;
            setOnlineCount(Math.max(1, count));
          }
        }

        if (messagesRes.ok) {
          const mData = await messagesRes.json();
          const currentUnread = mData.unreadCount || 0;
          setUnreadMessagesCount(currentUnread);

          // Se recebeu nova mensagem, dispara alerta popup no topo
          if (currentUnread > lastUnread && mData.messages && mData.messages.length > 0) {
            const latest = mData.messages[0];
            if (!latest.is_read) {
              setIncomingNotification({
                sender: latest.sender_name || "Colega de Trabalho",
                text: latest.message,
              });
              setTimeout(() => setIncomingNotification(null), 6000);
            }
          }
          lastUnread = currentUnread;
        }
      } catch (_) {}
    };

    checkTeamAndMessages();
    const interval = setInterval(checkTeamAndMessages, 20000); // atualiza a cada 20s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.remove("dark");
        setIsDarkMode(false);
        localStorage.setItem("theme", "light");
      } else {
        root.classList.add("dark");
        setIsDarkMode(true);
        localStorage.setItem("theme", "dark");
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMobileSearchExpanded(false);
      router.push(`/documentos?busca=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Atalho de teclado universal Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("global-search-input");
        input?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const profile = userProfile || {
    id: "",
    full_name: "Gestor Público",
    email: "gestor@orgao.gov.br",
    department: "Gabinete / Gestão Pública",
  };

  return (
    <header className="h-16 border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between gap-2 max-w-full">
      {/* Mobile: Modo de Busca Expandida */}
      {isMobileSearchExpanded ? (
        <div className="flex items-center w-full space-x-2 animate-in fade-in duration-150">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar título, OCR ou tags..."
              className="w-full pl-9 pr-3 h-11 bg-muted/60 border border-input rounded-lg text-base text-foreground focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
            />
          </form>
          <button
            onClick={() => setIsMobileSearchExpanded(false)}
            aria-label="Fechar busca"
            className="touch-target p-2 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <>
          {/* Lado Esquerdo: Menu Hamburger e Logotipo Mobile */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={onToggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
              className="touch-target text-muted-foreground hover:text-foreground rounded-lg md:hidden p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base sm:text-lg tracking-tight text-foreground truncate max-w-[120px] sm:max-w-none">
                ArquivoSec
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#0F4C5C]/10 text-[#0F4C5C] hidden xs:inline-block">
                GOV
              </span>
            </div>
          </div>

          {/* Campo de Busca Global Desktop */}
          <div className="hidden sm:block flex-1 max-w-lg mx-2 lg:mx-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="global-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por título, número, OCR... (Ctrl + K)"
                className="w-full pl-9 pr-14 h-9 bg-muted/40 border-border/80 rounded-lg text-sm focus-visible:bg-background transition-all"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-0.5 text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded bg-muted/70 font-mono">
                <span>⌘K</span>
              </div>
            </form>
          </div>

          {/* Controles do Lado Direito */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Botão de Busca Rápida Mobile */}
            <button
              onClick={() => setIsMobileSearchExpanded(true)}
              aria-label="Abrir campo de busca"
              className="sm:hidden touch-target text-muted-foreground hover:text-foreground p-2 rounded-lg"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Botão Enviar Documentos Desktop */}
            {onOpenUpload && (
              <Button
                onClick={onOpenUpload}
                className="hidden sm:flex bg-[#0F4C5C] hover:bg-[#09333e] text-white shadow-sm items-center space-x-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold"
              >
                <Upload className="h-4 w-4" />
                <span>Enviar</span>
              </Button>
            )}

            {/* Botão Equipe & Presença Online com Indicador Verde */}
            <button
              onClick={() => setIsTeamModalOpen(true)}
              aria-label="Equipe e Usuários Online"
              className="touch-target relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors flex items-center space-x-1"
              title="Equipe & Presença Online"
            >
              <div className="relative flex items-center justify-center">
                <Users className="h-5 w-5" />
                {/* Indicador Online Verde com Ping */}
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-1 ring-card" />
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono hidden xs:inline-block">
                {onlineCount}
              </span>
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-bold rounded-full animate-bounce shadow-sm">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Alternador de Tema */}
            <button
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
              className="touch-target text-muted-foreground hover:text-foreground p-2 rounded-lg"
              title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Menu do Gestor */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="Abrir menu do usuário"
                aria-expanded={isUserMenuOpen}
                className="touch-target flex items-center space-x-2 p-1.5 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className="h-8 w-8 sm:h-8 sm:w-8 rounded-full bg-[#0F4C5C] text-white flex items-center justify-center font-bold text-xs shadow-soft">
                  {profile.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "GP"}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <p className="font-semibold text-foreground leading-tight truncate max-w-[120px]">
                    {profile.full_name}
                  </p>
                  <p className="text-muted-foreground text-[10px] truncate max-w-[120px]">
                    {profile.department}
                  </p>
                </div>
              </button>

              {/* Popup do Menu do Usuário */}
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsUserMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-2 shadow-elevated z-50 text-sm animate-in fade-in-50 zoom-in-95">
                    <div className="px-3 py-2.5 border-b border-border/80">
                      <p className="font-semibold text-foreground text-xs">{profile.full_name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{profile.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        Sessão Oficial Autenticada
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          router.push("/configuracoes");
                        }}
                        className="w-full flex items-center space-x-2.5 min-h-[44px] px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted transition-colors text-left"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Meu Perfil e Ajustes</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          router.push("/pastas");
                        }}
                        className="w-full flex items-center space-x-2.5 min-h-[44px] px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted transition-colors text-left"
                      >
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        <span>Gerenciar Pastas</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          router.push("/lixeira");
                        }}
                        className="w-full flex items-center space-x-2.5 min-h-[44px] px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted transition-colors text-left"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                        <span>Lixeira (30 dias)</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-border/80">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          router.push("/login");
                        }}
                        className="w-full flex items-center space-x-2.5 min-h-[44px] px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left font-medium"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Encerrar Sessão</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
      {/* Toast Flutuante de Notificação no Site quando chega mensagem */}
      {incomingNotification && (
        <div 
          onClick={() => {
            setIncomingNotification(null);
            setIsTeamModalOpen(true);
          }}
          className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm w-full bg-card border-2 border-[#0F4C5C] shadow-2xl rounded-2xl p-3.5 flex items-start space-x-3 cursor-pointer animate-in slide-in-from-top duration-200"
        >
          <div className="h-9 w-9 rounded-xl bg-[#0F4C5C] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground truncate">
                Recado de {incomingNotification.sender}
              </span>
              <span className="text-[10px] text-[#0F4C5C] font-semibold">Agora</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-tight">
              {incomingNotification.text}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIncomingNotification(null);
            }}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Modal de Equipe, Presença e Envio de Mensagens */}
      <TeamPresenceModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        currentUserId={profile.id}
        currentUserEmail={profile.email}
      />
    </header>
  );
}

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
  SlidersHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types";

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
      router.push(`/documentos?busca=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Keyboard shortcut Ctrl/Cmd + K for fast search
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
    full_name: "Dr. Alexandre Miranda",
    email: "gestor@prefeitura.gov.br",
    department: "Gabinete do Secretário",
  };

  return (
    <header className="h-16 border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Mobile Toggle & Brand */}
      <div className="flex items-center space-x-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobileMenu}
          aria-label="Abrir menu de navegação"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <span className="font-semibold text-foreground">ArquivoSec</span>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-xl">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="global-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por título, número, texto interno ou tags... (Ctrl + K)"
            className="w-full pl-9 pr-16 h-10 bg-muted/40 border-border/80 rounded-lg text-sm focus-visible:bg-background transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center space-x-0.5 text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded bg-muted/70 font-mono">
            <span>⌘K</span>
          </div>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Upload Button */}
        {onOpenUpload && (
          <Button
            onClick={onOpenUpload}
            className="bg-[#0F4C5C] hover:bg-[#09333e] text-white shadow-sm flex items-center space-x-1.5 h-9 px-3.5 rounded-lg text-sm"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Enviar documentos</span>
          </Button>
        )}

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground h-9 w-9"
          title={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
            aria-expanded={isUserMenuOpen}
          >
            <div className="h-8 w-8 rounded-full bg-[#0F4C5C] text-white flex items-center justify-center font-medium text-xs shadow-soft">
              {profile.full_name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <p className="font-semibold text-foreground leading-tight truncate max-w-[130px]">
                {profile.full_name}
              </p>
              <p className="text-muted-foreground text-[10px] truncate max-w-[130px]">
                {profile.department}
              </p>
            </div>
          </button>

          {/* User Menu Popup */}
          {isUserMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsUserMenuOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-elevated z-50 text-sm">
                <div className="px-3 py-2 border-b border-border/80">
                  <p className="font-semibold text-foreground text-xs">{profile.full_name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{profile.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                    Sessão Segura
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push("/configuracoes");
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-xs text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Meu Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push("/documentos");
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-xs text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Meus Documentos</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-border/80">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push("/login");
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Encerrar Sessão</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileBottomNav } from "./MobileBottomNav";
import { UploadModal } from "@/components/upload/UploadModal";
import { Folder, DocumentType, Tag, UserProfile } from "@/types";

interface AppLayoutProps {
  children: React.ReactNode;
}

const defaultProfile: UserProfile = {
  id: "",
  full_name: "Servidor Público",
  email: "",
  department: "Gabinete / Gestão Pública",
  role: "gestor",
  storage_limit_bytes: 268435456000,
  storage_used_bytes: 0,
  theme_preference: "system",
  two_factor_enabled: false,
  created_at: "",
  updated_at: "",
};

export function AppLayout({ children }: AppLayoutProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Carrega dados dinâmicos do Supabase para toda a aplicação
  useEffect(() => {
    async function loadAppContext() {
      try {
        const [profRes, foldersRes, typesRes, tagsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/folders"),
          fetch("/api/types"),
          fetch("/api/tags"),
        ]);

        if (profRes.ok) {
          const { profile: dbProfile } = await profRes.json();
          if (dbProfile) setProfile(dbProfile);
        }
        if (foldersRes.ok) {
          const { folders: dbFolders } = await foldersRes.json();
          if (dbFolders) setFolders(dbFolders);
        }
        if (typesRes.ok) {
          const { types: dbTypes } = await typesRes.json();
          if (dbTypes) setDocumentTypes(dbTypes);
        }
        if (tagsRes.ok) {
          const { tags: dbTags } = await tagsRes.json();
          if (dbTags) setTags(dbTags);
        }
      } catch (err) {
        console.warn("Aviso ao carregar contexto dinâmico:", err);
      }
    }

    loadAppContext();
  }, []);

  // Monitoramento de presença em tempo real (heartbeat)
  useEffect(() => {
    const sendHeartbeat = () => {
      const pageTitle = typeof document !== "undefined" ? document.title.split("|")[0].trim() : "Navegando";
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: pageTitle || "Painel" }),
      }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 45000); // pulso a cada 45s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background text-foreground max-w-full overflow-x-hidden">
      {/* Sidebar Desktop */}
      <Sidebar
        storageUsed={profile.storage_used_bytes}
        storageLimit={profile.storage_limit_bytes}
        role={profile.role || "gestor"}
        onOpenUpload={() => setIsUploadOpen(true)}
        className="hidden md:flex sticky top-0"
      />

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <Sidebar
            storageUsed={profile.storage_used_bytes}
            storageLimit={profile.storage_limit_bytes}
            role={profile.role || "gestor"}
            onOpenUpload={() => {
              setIsMobileMenuOpen(false);
              setIsUploadOpen(true);
            }}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            className="relative z-50 w-72 max-w-[85vw] bg-card shadow-2xl"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        <Topbar
          userProfile={profile}
          onOpenUpload={() => setIsUploadOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Padding inferior reservado para o MobileBottomNav */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </main>

        {/* Navegação Inferior Mobile */}
        <MobileBottomNav onOpenUpload={() => setIsUploadOpen(true)} />
      </div>

      {/* Modal Global de Upload */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        folders={folders}
        documentTypes={documentTypes}
        tags={tags}
        onUploadComplete={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}

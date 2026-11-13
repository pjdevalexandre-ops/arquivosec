"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileBottomNav } from "./MobileBottomNav";
import { UploadModal } from "@/components/upload/UploadModal";
import { mockFolders, mockDocumentTypes, mockTags, mockProfile } from "@/lib/mock-data";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background text-foreground max-w-full overflow-x-hidden">
      {/* Sidebar Desktop */}
      <Sidebar
        storageUsed={mockProfile.storage_used_bytes}
        storageLimit={mockProfile.storage_limit_bytes}
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
            storageUsed={mockProfile.storage_used_bytes}
            storageLimit={mockProfile.storage_limit_bytes}
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
          userProfile={mockProfile}
          onOpenUpload={() => setIsUploadOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Padding inferior reservado para o MobileBottomNav (pb-24 no mobile, pb-8 no desktop) */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </main>

        {/* Navegação Inferior Mobile (Otimizada para iPhone e Android) */}
        <MobileBottomNav onOpenUpload={() => setIsUploadOpen(true)} />
      </div>

      {/* Modal Global de Upload */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        folders={mockFolders}
        documentTypes={mockDocumentTypes}
        tags={mockTags}
        onUploadComplete={() => {
          // recarrega lista
        }}
      />
    </div>
  );
}

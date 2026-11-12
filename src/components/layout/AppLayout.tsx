"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { UploadModal } from "@/components/upload/UploadModal";
import { mockFolders, mockDocumentTypes, mockTags, mockProfile } from "@/lib/mock-data";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar Desktop */}
      <Sidebar
        storageUsed={mockProfile.storage_used_bytes}
        storageLimit={mockProfile.storage_limit_bytes}
        onOpenUpload={() => setIsUploadOpen(true)}
        className="hidden md:flex"
      />

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <Sidebar
            storageUsed={mockProfile.storage_used_bytes}
            storageLimit={mockProfile.storage_limit_bytes}
            onOpenUpload={() => {
              setIsMobileMenuOpen(false);
              setIsUploadOpen(true);
            }}
            className="relative z-50 w-72 bg-card"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          userProfile={mockProfile}
          onOpenUpload={() => setIsUploadOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Modal Global de Upload */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        folders={mockFolders}
        documentTypes={mockDocumentTypes}
        tags={mockTags}
        onUploadComplete={() => {
          // feedback ou recarregamento
        }}
      />
    </div>
  );
}

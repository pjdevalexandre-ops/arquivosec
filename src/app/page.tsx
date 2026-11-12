"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StorageOverview } from "@/components/dashboard/StorageOverview";
import { QuickFavorites } from "@/components/dashboard/QuickFavorites";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { 
  mockProfile, 
  mockDocuments, 
  mockDocumentTypes, 
  mockActivityLogs 
} from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Saudação e Boas-vindas */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Painel do Gestor
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Visão consolidada do acervo documental oficial e capacidade de armazenamento.
          </p>
        </div>

        {/* 1. Medidor de Armazenamento de 250 GB */}
        <StorageOverview
          storageUsedBytes={mockProfile.storage_used_bytes}
          storageLimitBytes={mockProfile.storage_limit_bytes}
          totalDocuments={mockDocuments.length}
          documentTypes={mockDocumentTypes}
        />

        {/* 2. Acesso Rápido a Favoritos */}
        <QuickFavorites documents={mockDocuments} />

        {/* 3. Documentos Recentes e Trilha de Auditoria */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentDocuments documents={mockDocuments} />
          </div>
          <div>
            <RecentActivity activities={mockActivityLogs} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

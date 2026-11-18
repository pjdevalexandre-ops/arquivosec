"use client";

import React, { useState, useEffect } from "react";
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
import { DocumentItem, UserProfile, DocumentType, ActivityLog } from "@/types";

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);
  const [types, setTypes] = useState<DocumentType[]>(mockDocumentTypes);
  const [activities, setActivities] = useState<ActivityLog[]>(mockActivityLogs);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [docsRes, profRes, typesRes] = await Promise.all([
          fetch("/api/documents"),
          fetch("/api/profile"),
          fetch("/api/types"),
        ]);

        if (docsRes.ok) {
          const { documents: dbDocs } = await docsRes.json();
          if (dbDocs) setDocuments(dbDocs);
        }

        if (profRes.ok) {
          const { profile: dbProfile } = await profRes.json();
          if (dbProfile) setProfile(dbProfile);
        }

        if (typesRes.ok) {
          const { types: dbTypes } = await typesRes.json();
          if (dbTypes && dbTypes.length > 0) setTypes(dbTypes);
        }
      } catch (err) {
        console.warn("Aviso ao carregar dados do painel:", err);
      }
    }

    loadDashboardData();
  }, []);

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
          storageUsedBytes={profile.storage_used_bytes}
          storageLimitBytes={profile.storage_limit_bytes}
          totalDocuments={documents.length}
          documentTypes={types}
        />

        {/* 2. Acesso Rápido a Favoritos */}
        <QuickFavorites documents={documents} />

        {/* 3. Documentos Recentes e Trilha de Auditoria */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentDocuments documents={documents} />
          </div>
          <div>
            <RecentActivity activities={activities} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

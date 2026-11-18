"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StorageOverview } from "@/components/dashboard/StorageOverview";
import { QuickFavorites } from "@/components/dashboard/QuickFavorites";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentItem, UserProfile, DocumentType, ActivityLog } from "@/types";

const defaultProfile: UserProfile = {
  id: "",
  full_name: "Servidor Público",
  email: "",
  department: "Gabinete / Gestão Pública",
  role: "admin",
  storage_limit_bytes: 268435456000,
  storage_used_bytes: 0,
  theme_preference: "system",
  two_factor_enabled: false,
  created_at: "",
  updated_at: "",
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [docsRes, profRes, typesRes] = await Promise.all([
          fetch("/api/documents"),
          fetch("/api/profile"),
          fetch("/api/types"),
        ]);

        let currentDocs: DocumentItem[] = [];

        if (docsRes.ok) {
          const { documents: dbDocs } = await docsRes.json();
          if (dbDocs) {
            setDocuments(dbDocs);
            currentDocs = dbDocs;
          }
        }

        if (profRes.ok) {
          const { profile: dbProfile } = await profRes.json();
          if (dbProfile) setProfile(dbProfile);
        }

        if (typesRes.ok) {
          const { types: dbTypes } = await typesRes.json();
          if (dbTypes) setTypes(dbTypes);
        }

        // Tenta carregar atividades reais da auditoria
        try {
          const actRes = await fetch("/api/admin/activity?limit=15");
          if (actRes.ok) {
            const { activities: dbActivities } = await actRes.json();
            if (dbActivities) setActivities(dbActivities);
          } else {
            // Se for gestor comum (não admin), sintetiza histórico a partir dos documentos reais do usuário
            const userActivities: ActivityLog[] = currentDocs.slice(0, 8).map((d) => ({
              id: `act-${d.id}`,
              user_id: d.user_id,
              document_id: d.id,
              action: "upload" as const,
              details: { file_name: d.file_name, size: d.file_size_bytes },
              created_at: d.created_at,
              document: d,
            }));
            setActivities(userActivities);
          }
        } catch (_) {}
      } catch (err) {
        console.warn("Aviso ao carregar dados do painel:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Saudação e Boas-vindas Institucional */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Painel de Gestão Documental
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Visão consolidada do repositório oficial e capacidade de armazenamento em nuvem.
          </p>
        </div>

        {/* 1. Medidor de Armazenamento de 250 GB */}
        {isLoading ? (
          <div className="h-44 rounded-2xl border border-border bg-card p-6 animate-pulse" />
        ) : (
          <StorageOverview
            storageUsedBytes={profile.storage_used_bytes}
            storageLimitBytes={profile.storage_limit_bytes}
            totalDocuments={documents.length}
            documentTypes={types}
          />
        )}

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

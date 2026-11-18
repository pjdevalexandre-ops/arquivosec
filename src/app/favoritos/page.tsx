"use client";

import React, { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { ShareModal } from "@/components/sharing/ShareModal";
import { DocumentItem } from "@/types";

export default function FavoritosPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [sharingDoc, setSharingDoc] = useState<DocumentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/documents?favorite=true");
        if (res.ok) {
          const { documents: dbDocs } = await res.json();
          if (dbDocs) setDocuments(dbDocs);
        }
      } catch (err) {
        console.warn("Erro ao carregar favoritos:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFavorites();
  }, []);

  const favorites = documents.filter((d) => d.is_favorite && !d.is_trashed);

  const handleToggleFavorite = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    const newFav = !doc?.is_favorite;

    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_favorite: newFav } : d))
    );

    try {
      await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_favorite: newFav }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5 sm:space-y-6 max-w-full">
        <div>
          <div className="flex items-center space-x-2">
            <Star className="h-6 w-6 fill-amber-400 text-amber-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Documentos Favoritos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Acesso prioritário a processos e expedientes marcados com estrela.
          </p>
        </div>

        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-[#0F4C5C] animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Carregando documentos favoritos...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="p-10 sm:p-12 text-center bg-card border border-border rounded-2xl space-y-3">
            <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-foreground">Nenhum favorito adicionado</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Clique no ícone de estrela em qualquer documento do acervo para fixá-lo aqui para acesso instantâneo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {favorites.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onToggleFavorite={handleToggleFavorite}
                onShare={setSharingDoc}
              />
            ))}
          </div>
        )}

        <ShareModal
          isOpen={Boolean(sharingDoc)}
          onClose={() => setSharingDoc(null)}
          document={sharingDoc}
        />
      </div>
    </AppLayout>
  );
}

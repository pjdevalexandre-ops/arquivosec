import { DocumentItem, Folder, DocumentType, Tag, UserProfile, ActivityLog, ShareLink } from "@/types";

export const mockProfile: UserProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  full_name: "Gestor Público",
  email: "gestor@orgao.gov.br",
  avatar_url: null,
  department: "Gabinete / Gestão Pública",
  storage_limit_bytes: 268435456000, // 250 GB
  storage_used_bytes: 0,             // Zerado para início do acervo oficial
  theme_preference: "light",
  two_factor_enabled: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockDocumentTypes: DocumentType[] = [
  { id: "t1", name: "Ofício", slug: "oficio", description: "Comunicações oficiais entre órgãos públicos", color: "#0F4C5C", is_default: true },
  { id: "t2", name: "Contrato", slug: "contrato", description: "Contratos administrativos, convênios e aditivos", color: "#2563EB", is_default: true },
  { id: "t3", name: "Nota Fiscal", slug: "nota-fiscal", description: "Comprovantes fiscais e ordens de pagamento", color: "#059669", is_default: true },
  { id: "t4", name: "Processo", slug: "processo", description: "Autos de processos administrativos e pareceres", color: "#7C3AED", is_default: true },
  { id: "t5", name: "Relatório", slug: "relatorio", description: "Relatórios técnicos e vistorias de engenharia", color: "#D97706", is_default: true },
  { id: "t6", name: "Outros", slug: "outros", description: "Documentações complementares digitalizadas", color: "#64748B", is_default: true },
];

export const mockFolders: Folder[] = [
  {
    id: "f1",
    user_id: mockProfile.id,
    name: "Gabinete do Gestor",
    color: "#0F4C5C",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    document_count: 0,
  },
  {
    id: "f2",
    user_id: mockProfile.id,
    name: "Licitações e Contratos",
    color: "#2563EB",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    document_count: 0,
  },
  {
    id: "f3",
    user_id: mockProfile.id,
    name: "Secretaria de Finanças & NF",
    color: "#059669",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    document_count: 0,
  },
  {
    id: "f4",
    user_id: mockProfile.id,
    name: "Obras e Infraestrutura",
    color: "#D97706",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    document_count: 0,
  },
  {
    id: "f5",
    user_id: mockProfile.id,
    name: "Recursos Humanos & Portarias",
    color: "#7C3AED",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    document_count: 0,
  },
];

export const mockTags: Tag[] = [
  { id: "tag1", user_id: mockProfile.id, name: "Urgente", color: "#EF4444" },
  { id: "tag2", user_id: mockProfile.id, name: "Prioritário", color: "#F59E0B" },
  { id: "tag3", user_id: mockProfile.id, name: "Em Análise", color: "#3B82F6" },
  { id: "tag4", user_id: mockProfile.id, name: "Liquidado", color: "#10B981" },
  { id: "tag5", user_id: mockProfile.id, name: "Sigiloso", color: "#8B5CF6" },
];

// Inicia com ZERO documentos para o gestor começar seu acervo real do zero
export const mockDocuments: DocumentItem[] = [];

// Histórico e links iniciam vazios
export const mockShareLinks: ShareLink[] = [];
export const mockActivityLogs: ActivityLog[] = [];

# ArquivoSec - Sistema Seguro de Gestão Documental em Nuvem

O **ArquivoSec** é um sistema web moderno, rápido e intuitivo desenvolvido para a guarda, organização e localização ágil de documentos digitalizados (PDFs e imagens em alta resolução). Projetado especificamente para as necessidades de um gestor público que gerencia cerca de **250 GB de documentos oficiais** (ofícios, contratos, notas fiscais, processos e relatórios técnicos), com foco absoluto em confiabilidade, facilidade de uso e segurança da informação.

---

## 🏛️ Destaques e Funcionalidades

- **Capacidade Governamental**: Medidor visual em tempo real para a cota de 250 GB no Cloudflare R2.
- **Upload Direto e Confiável (Browser-to-R2)**: Envio direto do navegador via URLs assinadas (*presigned URLs*), com suporte a *multipart upload* para arquivos pesados, sem onerar o servidor da aplicação.
- **Visualizador Integrado In-Page**: Pré-visualização de PDFs e imagens sem sair do sistema, com controles de zoom, rotação, tela cheia e impressão.
- **Busca Global Full-Text em Português**: Pesquisa instantânea por título, número de protocolo, tags, observações ou conteúdo interno do documento extraído via **OCR** (PostgreSQL `tsvector`).
- **Segurança de Nível Oficial**: Todas as tabelas protegidas por **Row Level Security (RLS)** do Supabase, bucket Cloudflare R2 100% privado (acesso exclusivo por URLs temporárias de 15 minutos) e trilha de auditoria completa (*activity_logs*).
- **Compartilhamento Temporário**: Geração de links seguros com expiração (24 horas, 7 dias ou 30 dias), contadores de visualização e proteção opcional por senha.
- **Lixeira com Retenção de 30 Dias**: Proteção contra exclusões acidentais, permitindo restaurar arquivos ou expurgá-los definitivamente.
- **Interface 100% em Português (Linear/Notion/Drive)**: Design minimalista com a paleta oficial em azul-petróleo (`#0F4C5C`), tipografia Inter, cantos arredondados, modo claro/escuro e acessibilidade de teclado (atalho universal `Ctrl + K` / `Cmd + K` para busca).

---

## 🛠️ Stack Tecnológica

- **Framework Web**: [Next.js](https://nextjs.org/) (App Router, Server Actions, API Routes) com TypeScript
- **Estilização & UI**: [Tailwind CSS](https://tailwindcss.com/), Radix UI e [Lucide React](https://lucide.dev/)
- **Banco de Dados & Autenticação**: [Supabase](https://supabase.com/) (PostgreSQL 15+, Auth com JWT, RLS e FTS em português)
- **Armazenamento de Arquivos**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (compatível com AWS S3 SDK v3)
- **OCR (Optical Character Recognition)**: Tesseract.js / pipeline de processamento em segundo plano

---

## 📋 Pré-requisitos

- **Node.js** v18.17+ ou v20+
- Conta gratuita no **Supabase**
- Conta na **Cloudflare** com o R2 ativado (plano gratuito inclui 10 GB e operações ilimitadas; para 250 GB o custo é de apenas ~\$3,75/mês sem taxa de egresso)

---

## 🚀 Guia de Configuração Passo a Passo

### 1. Clonar o repositório e instalar as dependências

```bash
git clone https://github.com/seu-usuario/arquivosec.git
cd arquivosec
npm install
```

---

### 2. Configurar o Supabase

1. Crie um novo projeto no painel do [Supabase](https://supabase.com/dashboard).
2. Acesse a aba **SQL Editor** no menu lateral esquerdo.
3. Abra o arquivo [`supabase/schema.sql`](./supabase/schema.sql) deste repositório, cole o código no editor SQL e clique em **Run**.
   - Isso criará as tabelas (`profiles`, `folders`, `document_types`, `tags`, `documents`, `document_tags`, `share_links`, `activity_logs`), índices GIN, funções de busca full-text e todas as políticas RLS.
4. *(Opcional)* Execute também o arquivo [`supabase/seed.sql`](./supabase/seed.sql) para popular o sistema com dados e documentos oficiais de teste.
5. Acesse **Project Settings > API** e copie:
   - **Project URL**
   - **anon / public key**
   - **service_role key** (mantenha em sigilo)

---

### 3. Configurar o Cloudflare R2

1. No painel da [Cloudflare](https://dash.cloudflare.com/), acesse **R2 > Overview**.
2. Clique em **Create Bucket** e nomeie como `arquivosec-documentos`. Mantenha o bucket como **Private**.
3. Na página inicial do R2, clique em **Manage R2 API Tokens > Create API Token**:
   - Permissões: **Object Read & Write**
   - TTL: De acordo com sua preferência
4. Anote as credenciais geradas:
   - **Access Key ID**
   - **Secret Access Key**
   - **Account ID** (encontrado na barra lateral da Cloudflare ou na URL)
5. No bucket criado, vá em **Settings > CORS Policy** e adicione a regra abaixo para permitir que o navegador envie arquivos via `PUT`:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://*.vercel.app", "https://seu-dominio.gov.br"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

---

### 4. Configurar as Variáveis de Ambiente

Copie o modelo de variáveis de ambiente:

```bash
cp .env.example .env.local
```

Abra o arquivo `.env.local` e preencha com suas chaves:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudflare R2
R2_ACCOUNT_ID=sua_account_id_cloudflare
R2_ACCESS_KEY_ID=sua_r2_access_key_id
R2_SECRET_ACCESS_KEY=seu_r2_secret_access_key
R2_BUCKET_NAME=arquivosec-documentos
R2_ENDPOINT=https://sua_account_id_cloudflare.r2.cloudflarestorage.com

# Aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEFAULT_STORAGE_LIMIT_BYTES=268435456000
```

> **Nota:** Caso execute sem preencher as chaves de nuvem imediatamente, o ArquivoSec ativa automaticamente um modo de demonstração seguro com dados pré-carregados para que você possa testar e navegar por todas as telas do sistema!

---

### 5. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

### 6. Deploy na Vercel

O ArquivoSec está 100% pronto para deploy na **Vercel**:

1. Suba o código para o seu repositório GitHub / GitLab.
2. No painel da [Vercel](https://vercel.com/), clique em **Add New Project** e selecione o repositório.
3. Na seção **Environment Variables**, adicione as mesmas variáveis configuradas no `.env.local`.
4. Clique em **Deploy**.

---

## 🗂️ Estrutura do Projeto

```
arquivosec/
├── src/
│   ├── app/                      # Rotas e Telas (App Router Next.js)
│   │   ├── api/                  # Endpoints de Upload, OCR, Busca e Compartilhamento
│   │   ├── compartilhados/       # Gestão e revogação de links ativos
│   │   ├── compartilhar/[token]/ # Portal público seguro para terceiros
│   │   ├── configuracoes/        # Perfil, 2FA, tipos e tags
│   │   ├── documentos/           # Listagem, filtros e busca full-text
│   │   ├── documentos/[id]/      # Visualizador de documento in-page com OCR
│   │   ├── favoritos/            # Acesso rápido a documentos prioritários
│   │   ├── lixeira/              # Retenção de 30 dias e restauração
│   │   ├── login/                # Tela de acesso institucional
│   │   ├── pastas/               # Árvore hierárquica e navegação em pastas
│   │   ├── recuperar-senha/      # Fluxo de redefinição de credenciais
│   │   ├── globals.css           # Estilos base e variáveis do tema (#0F4C5C)
│   │   ├── layout.tsx            # Layout raiz com fontes e tema
│   │   └── page.tsx              # Painel principal do Gestor (Dashboard)
│   ├── components/               # Componentes modulares
│   │   ├── dashboard/            # Medidor de 250 GB, documentos recentes e auditoria
│   │   ├── documents/            # Visualizador in-page, cards, tabelas e filtros
│   │   ├── folders/              # Árvore interativa de pastas
│   │   ├── layout/               # Sidebar com medidor R2 e Topbar com busca Ctrl+K
│   │   ├── sharing/              # Modal de compartilhamento temporário
│   │   ├── ui/                   # Botões, inputs, diálogos, barras de progresso
│   │   └── upload/               # Modal de envio múltiplo com barra individual
│   ├── lib/
│   │   ├── ocr/                  # Processador Tesseract OCR em português
│   │   ├── r2/                   # Cliente S3 Cloudflare R2 e URLs assinadas
│   │   ├── supabase/             # Clientes browser e server do Supabase
│   │   ├── mock-data.ts          # Dados de teste para demonstração imediata
│   │   └── utils.ts              # Formatadores de bytes, datas e classes
│   └── types/                    # Tipagem TypeScript estrita de todo o sistema
├── supabase/
│   ├── schema.sql                # Schema SQL completo, gatilhos, FTS e RLS
│   └── seed.sql                  # Dados de exemplo para o setor público
├── .env.example                  # Documentação das variáveis de ambiente
├── tailwind.config.ts            # Configuração do Tailwind CSS
├── tsconfig.json                 # Configuração do TypeScript
└── package.json                  # Dependências e scripts do projeto
```

---

## 🔒 Segurança e Conformidade

1. **Bucket 100% Privado**: Arquivos nunca possuem URLs públicas estáticas no R2. O acesso ocorre exclusivamente por assinaturas HMAC de curta duração geradas pelo backend autenticado.
2. **Row Level Security (RLS)**: Cada registro no PostgreSQL pertence a `auth.uid() = user_id`. Mesmo em requisições diretas ao Supabase, nenhum usuário consegue ler ou modificar dados de terceiros.
3. **Auditoria de Operações**: Todos os eventos críticos (upload, download, visualização, exclusão, restauração, compartilhamento) são gravados na tabela `activity_logs`.
4. **Validação de Conteúdo**: Verificação rigorosa de tipo MIME e tamanho de arquivo antes de gerar URLs de upload, bloqueando arquivos executáveis ou formatos não autorizados.

---

## 📄 Licença

Desenvolvido para uso governamental e institucional. Distribuído sob licença MIT.

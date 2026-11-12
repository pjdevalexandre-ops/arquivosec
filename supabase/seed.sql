-- ==============================================================================
-- ArquivoSec - Dados de Exemplo (Seed) para Demonstração e Testes
-- ==============================================================================

-- Observação: Substitua o UUID abaixo pelo UUID do seu usuário de teste no Supabase
-- Exemplo: '00000000-0000-0000-0000-000000000001' ou o id retornado no cadastro.

DO $$
DECLARE
    v_user_id UUID := '00000000-0000-0000-0000-000000000001'; -- Substituir se necessário
    v_folder_gabinete UUID;
    v_folder_licitacoes UUID;
    v_folder_financas UUID;
    v_folder_obras UUID;
    v_type_oficio UUID;
    v_type_contrato UUID;
    v_type_nota UUID;
    v_type_processo UUID;
    v_type_relatorio UUID;
    v_tag_urgente UUID;
    v_tag_sigiloso UUID;
    v_tag_em_analise UUID;
    v_tag_aprovado UUID;
    v_doc1 UUID;
    v_doc2 UUID;
    v_doc3 UUID;
    v_doc4 UUID;
    v_doc5 UUID;
BEGIN
    -- 1. Garante perfil
    INSERT INTO public.profiles (id, full_name, email, department, storage_limit_bytes, storage_used_bytes)
    VALUES (
        v_user_id,
        'Dr. Alexandre Miranda',
        'gestor@prefeitura.gov.br',
        'Gabinete do Secretário de Administração',
        268435456000, -- 250 GB
        185420000     -- ~185 MB
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Pastas
    INSERT INTO public.folders (id, user_id, name, color)
    VALUES 
        (gen_random_uuid(), v_user_id, 'Gabinete do Secretário', '#0F4C5C')
    RETURNING id INTO v_folder_gabinete;

    INSERT INTO public.folders (id, user_id, name, color)
    VALUES 
        (gen_random_uuid(), v_user_id, 'Licitações e Contratos 2024', '#2563EB')
    RETURNING id INTO v_folder_licitacoes;

    INSERT INTO public.folders (id, user_id, name, color)
    VALUES 
        (gen_random_uuid(), v_user_id, 'Secretaria da Fazenda & NF', '#059669')
    RETURNING id INTO v_folder_financas;

    INSERT INTO public.folders (id, user_id, name, color)
    VALUES 
        (gen_random_uuid(), v_user_id, 'Obras e Infraestrutura Urbana', '#D97706')
    RETURNING id INTO v_folder_obras;

    -- Subpasta de Licitações
    INSERT INTO public.folders (user_id, parent_id, name, color)
    VALUES (v_user_id, v_folder_licitacoes, 'Pregão Eletrônico 045/2024 - Tecnologia', '#3B82F6');

    -- 3. Tipos de Documento
    INSERT INTO public.document_types (id, user_id, name, slug, description, color, is_default)
    VALUES 
        (gen_random_uuid(), v_user_id, 'Ofício', 'oficio', 'Comunicações formais interdepartamentais', '#0F4C5C', true)
    RETURNING id INTO v_type_oficio;

    INSERT INTO public.document_types (id, user_id, name, slug, description, color, is_default)
    VALUES 
        (gen_random_uuid(), v_user_id, 'Contrato Administrativo', 'contrato', 'Termos contratuais e aditivos', '#2563EB', true)
    RETURNING id INTO v_type_contrato;

    INSERT INTO public.document_types (id, user_id, name, slug, description, color, is_default)
    VALUES 
        (gen_random_uuid(), v_user_id, 'Nota Fiscal Eletrônica', 'nota-fiscal', 'Comprovantes de fornecimento e liquidação', '#059669', true)
    RETURNING id INTO v_type_nota;

    INSERT INTO public.document_types (id, user_id, name, slug, description, color, is_default)
    VALUES 
        (gen_random_uuid(), v_user_id, 'Processo Administrativo', 'processo', 'Autos de processos e pareceres jurídicos', '#7C3AED', true)
    RETURNING id INTO v_type_processo;

    INSERT INTO public.document_types (id, user_id, name, slug, description, color, is_default)
    VALUES 
        (gen_random_uuid(), v_user_id, 'Relatório Técnico', 'relatorio', 'Vistorias, medições e auditorias', '#D97706', true)
    RETURNING id INTO v_type_relatorio;

    -- 4. Tags
    INSERT INTO public.tags (id, user_id, name, color)
    VALUES (gen_random_uuid(), v_user_id, 'Urgente', '#EF4444')
    RETURNING id INTO v_tag_urgente;

    INSERT INTO public.tags (id, user_id, name, color)
    VALUES (gen_random_uuid(), v_user_id, 'Prioritário', '#F59E0B')
    RETURNING id INTO v_tag_sigiloso;

    INSERT INTO public.tags (id, user_id, name, color)
    VALUES (gen_random_uuid(), v_user_id, 'Em Análise', '#3B82F6')
    RETURNING id INTO v_tag_em_analise;

    INSERT INTO public.tags (id, user_id, name, color)
    VALUES (gen_random_uuid(), v_user_id, 'Liquidado', '#10B981')
    RETURNING id INTO v_tag_aprovado;

    -- 5. Documentos exemplares com OCR completo
    -- Doc 1: Ofício
    INSERT INTO public.documents (
        id, user_id, folder_id, type_id, title, document_number, document_date, 
        origin_sector, notes, file_key, file_name, file_size_bytes, mime_type, 
        file_extension, ocr_text, ocr_status, is_favorite
    ) VALUES (
        gen_random_uuid(), v_user_id, v_folder_gabinete, v_type_oficio,
        'Ofício nº 412/2024 - Solicitação de Auditoria Preventiva nos Contratos de TI',
        'OF-412/2024-GAB', '2024-10-15', 'Gabinete do Secretário Municipal',
        'Encaminhado à Controladoria Geral do Município para análise dos aditivos contratuais de fibra óptica.',
        'demo/oficio_412_2024.pdf', 'Oficio_412_2024_Auditoria_TI.pdf', 1420500, 'application/pdf', 'pdf',
        'REPÚBLICA FEDERATIVA DO BRASIL. PREFEITURA MUNICIPAL. GABINETE DO SECRETÁRIO. OFÍCIO Nº 412/2024-GAB. Assunto: Auditoria preventiva ordinária nos contratos de tecnologia da informação e comunicação. Senhor Controlador Geral, solicitamos por meio deste a instauração de procedimento de auditoria nos contratos vigentes de fornecimento de links de internet e computação em nuvem referente ao exercício corrente.',
        'completed', true
    ) RETURNING id INTO v_doc1;

    -- Doc 2: Contrato
    INSERT INTO public.documents (
        id, user_id, folder_id, type_id, title, document_number, document_date, 
        origin_sector, notes, file_key, file_name, file_size_bytes, mime_type, 
        file_extension, ocr_text, ocr_status, is_favorite
    ) VALUES (
        gen_random_uuid(), v_user_id, v_folder_licitacoes, v_type_contrato,
        'Contrato Administrativo nº 088/2024 - Prestação de Serviços de Nuvem e Backup Seguro',
        'CT-088/2024-SMA', '2024-08-20', 'Comissão Permanente de Licitação',
        'Contrato assinado após homologação do Pregão Eletrônico nº 012/2024. Prazo de vigência: 24 meses.',
        'demo/contrato_088_2024.pdf', 'Contrato_088_2024_Nuvem_Segura.pdf', 4850000, 'application/pdf', 'pdf',
        'CONTRATO ADMINISTRATIVO Nº 088/2024 QUE ENTRE SI CELEBRAM O MUNICÍPIO E A EMPRESA CLOUDSEC TECNOLOGIA LTDA. CLÁUSULA PRIMEIRA - DO OBJETO: O presente contrato tem por objeto a contratação de solução integrada de armazenamento em nuvem com conformidade à LGPD, criptografia ponta a ponta e disponibilidade 99.9%. VALOR TOTAL: R$ 340.000,00.',
        'completed', true
    ) RETURNING id INTO v_doc2;

    -- Doc 3: Nota Fiscal
    INSERT INTO public.documents (
        id, user_id, folder_id, type_id, title, document_number, document_date, 
        origin_sector, notes, file_key, file_name, file_size_bytes, mime_type, 
        file_extension, ocr_text, ocr_status, is_favorite
    ) VALUES (
        gen_random_uuid(), v_user_id, v_folder_financas, v_type_nota,
        'Nota Fiscal Eletrônica nº 9410 - Licenciamento e Suporte Técnico Especializado',
        'NF-009410', '2024-11-01', 'Secretaria Municipal de Fazenda',
        'Atestada pelo fiscal do contrato. Empenho nº 2024NE00142, liquidada e encaminhada para pagamento.',
        'demo/nf_9410.pdf', 'Danfe_NF_009410_CloudSec.pdf', 890200, 'application/pdf', 'pdf',
        'DANFE - DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA. NÚMERO 000.009.410 SÉRIE 1. NATUREZA DA OPERAÇÃO: PRESTAÇÃO DE SERVIÇOS DE TECNOLOGIA DA INFORMAÇÃO. DESTINATÁRIO: PREFEITURA MUNICIPAL. VALOR TOTAL DA NOTA: R$ 28.333,33. RETENÇÕES: ISS R$ 1.416,66, INSS R$ 3.116,66. DADOS DO EMPENHO: 2024NE00142.',
        'completed', false
    ) RETURNING id INTO v_doc3;

    -- Doc 4: Processo Administrativo
    INSERT INTO public.documents (
        id, user_id, folder_id, type_id, title, document_number, document_date, 
        origin_sector, notes, file_key, file_name, file_size_bytes, mime_type, 
        file_extension, ocr_text, ocr_status, is_favorite
    ) VALUES (
        gen_random_uuid(), v_user_id, v_folder_licitacoes, v_type_processo,
        'Processo Administrativo nº 2024/04812 - Parecer Jurídico sobre Prorrogação de Convênio',
        'PA-2024-04812', '2024-09-18', 'Procuradoria Geral do Município',
        'Parecer favorável à assinatura do termo aditivo com o Governo Estadual para repasse de verbas.',
        'demo/processo_parecer_pgm.pdf', 'PA_2024_04812_Parecer_PGM.pdf', 3120000, 'application/pdf', 'pdf',
        'PROCURADORIA GERAL DO MUNICÍPIO. PARECER JURÍDICO Nº 778/2024/PGM. EMENTA: DIREITO ADMINISTRATIVO. CONVÊNIO DE COOPERAÇÃO TÉCNICA E FINANCEIRA Nº 003/2022. TERMO ADITIVO DE PRAZO E ACRÉSCIMO QUANTITATIVO. LEGALIDADE. Em análise a minuta do 2º Termo Aditivo, constata-se atendimento aos requisitos da Lei 14.133/2021 e existência de dotação orçamentária.',
        'completed', false
    ) RETURNING id INTO v_doc4;

    -- Doc 5: Relatório Técnico de Obras
    INSERT INTO public.documents (
        id, user_id, folder_id, type_id, title, document_number, document_date, 
        origin_sector, notes, file_key, file_name, file_size_bytes, mime_type, 
        file_extension, ocr_text, ocr_status, is_favorite
    ) VALUES (
        gen_random_uuid(), v_user_id, v_folder_obras, v_type_relatorio,
        'Relatório de Vistoria nº 14/2024 - Medição de Terraplanagem do Hospital Central',
        'REL-VIS-14/2024', '2024-11-05', 'Secretaria Municipal de Infraestrutura',
        'Acompanha registro fotográfico em alta resolução e planilha de controle tecnológico do concreto.',
        'demo/relatorio_vistoria_obras.pdf', 'Relatorio_Medicao_Obra_Hospital_Central.pdf', 12450000, 'application/pdf', 'pdf',
        'SECRETARIA DE INFRAESTRUTURA E OBRAS PÚBLICAS. RELATÓRIO TÉCNICO DE MEDIÇÃO Nº 14/2024. OBRA: CONSTRUÇÃO DO NOVO HOSPITAL DE URGÊNCIAS MUNICIPAL. Atestamos que 87,4% dos serviços de fundações e terraplanagem foram executados em estrita conformidade com as normas ABNT NBR 6122 e cronograma físico-financeiro pactuado.',
        'completed', true
    ) RETURNING id INTO v_doc5;

    -- 6. Associação Documentos e Tags
    INSERT INTO public.document_tags (document_id, tag_id) VALUES (v_doc1, v_tag_urgente);
    INSERT INTO public.document_tags (document_id, tag_id) VALUES (v_doc2, v_tag_sigiloso);
    INSERT INTO public.document_tags (document_id, tag_id) VALUES (v_doc3, v_tag_aprovado);
    INSERT INTO public.document_tags (document_id, tag_id) VALUES (v_doc4, v_tag_em_analise);
    INSERT INTO public.document_tags (document_id, tag_id) VALUES (v_doc5, v_tag_urgente);

    -- 7. Histórico de Atividades
    INSERT INTO public.activity_logs (user_id, document_id, action, details)
    VALUES 
        (v_user_id, v_doc1, 'upload', '{"file_name": "Oficio_412_2024_Auditoria_TI.pdf", "size": 1420500}'::jsonb),
        (v_user_id, v_doc1, 'favorite', '{"status": "adicionado aos favoritos"}'::jsonb),
        (v_user_id, v_doc2, 'upload', '{"file_name": "Contrato_088_2024_Nuvem_Segura.pdf", "size": 4850000}'::jsonb),
        (v_user_id, v_doc3, 'upload', '{"file_name": "Danfe_NF_009410_CloudSec.pdf", "size": 890200}'::jsonb),
        (v_user_id, v_doc3, 'tag', '{"tag": "Liquidado"}'::jsonb),
        (v_user_id, v_doc5, 'view', '{"screen": "visualizador_web"}'::jsonb);

END $$;

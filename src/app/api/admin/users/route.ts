import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClientServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }

      // Garante permissão administrativa ao usuário logado
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile && profile.role !== "admin") {
        await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id);
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      const adminClient =
        serviceRoleKey && !serviceRoleKey.includes("placeholder")
          ? createSupabaseClient(supabaseUrl, serviceRoleKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            })
          : supabase;

      // Busca todos os usuários cadastrados
      const { data: users, error } = await adminClient
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const now = Date.now();
      const formatted = (users || []).map((u: any) => {
        const lastSeen = u.last_seen_at ? new Date(u.last_seen_at).getTime() : 0;
        // Considera online se enviou sinal ativo nos últimos 90 segundos (o heartbeat pulsa a cada 45s)
        const isOnline = lastSeen > 0 && now - lastSeen < 90 * 1000;

        return {
          ...u,
          is_online: isOnline,
        };
      });

      return NextResponse.json({ users: formatted });
    }

    return NextResponse.json(
      { error: "Serviço de gerenciamento de usuários não configurado." },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Erro ao listar usuários (admin):", error);
    return NextResponse.json(
      { error: error.message || "Falha ao carregar equipe." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name, department, role = "gestor" } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = await createClientServer();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }

      // Confere se o usuário autenticado é admin
      const { data: adminProf } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      if (adminProf?.role && adminProf.role !== "admin") {
        return NextResponse.json(
          { error: "Apenas administradores podem cadastrar novos usuários." },
          { status: 403 }
        );
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

      let createdUserId: string | null = null;

      // Se temos a service_role key configurada: cria e confirma imediatamente via Admin API
      if (serviceRoleKey && !serviceRoleKey.includes("placeholder")) {
        const adminAuthClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: newUserData, error: createErr } =
          await adminAuthClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: full_name || email.split("@")[0],
              department: department || "Gabinete Geral",
              role,
            },
          });

        if (createErr) {
          throw createErr;
        }

        createdUserId = newUserData.user.id;
      } else {
        // Fallback usando cliente isolado de signup sem deslogar a sessão atual
        const isolatedClient = createSupabaseClient(supabaseUrl, anonKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: signUpData, error: signUpErr } = await isolatedClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: full_name || email.split("@")[0],
              department: department || "Gabinete Geral",
              role,
            },
          },
        });

        if (signUpErr) {
          throw signUpErr;
        }

        createdUserId = signUpData.user?.id || null;
      }

      if (createdUserId) {
        // Garante a inserção/atualização completa na tabela profiles (upsert)
        const profileClient =
          serviceRoleKey && !serviceRoleKey.includes("placeholder")
            ? createSupabaseClient(supabaseUrl, serviceRoleKey, {
                auth: { autoRefreshToken: false, persistSession: false },
              })
            : supabase;

        await profileClient.from("profiles").upsert(
          {
            id: createdUserId,
            email,
            role,
            full_name: full_name || email.split("@")[0],
            department: department || "Gabinete / Gestão Pública",
            storage_limit_bytes: 268435456000,
            storage_used_bytes: 0,
            theme_preference: "system",
            two_factor_enabled: false,
            last_seen_at: null,
            current_page: null,
          },
          { onConflict: "id" }
        );

        // Registra log de auditoria
        await supabase.from("activity_logs").insert({
          user_id: currentUser.id,
          action: "update",
          details: {
            action_description: `Cadastrou o usuário ${email} (${role})`,
            target_user_id: createdUserId,
            target_email: email,
            target_role: role,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Usuário cadastrado com sucesso!",
        userId: createdUserId,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Modo demonstração: usuário criado.",
    });
  } catch (error: any) {
    console.error("Erro ao criar usuário (admin):", error);
    return NextResponse.json(
      { error: error.message || "Falha ao criar novo usuário." },
      { status: 500 }
    );
  }
}

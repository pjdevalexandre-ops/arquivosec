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

      // Verifica se o solicitante é Administrador
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role && profile.role !== "admin") {
        return NextResponse.json(
          { error: "Acesso restrito apenas a Administradores." },
          { status: 403 }
        );
      }

      // Busca todos os usuários cadastrados
      const { data: users, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const now = Date.now();
      const formatted = (users || []).map((u: any) => {
        const lastSeen = u.last_seen_at ? new Date(u.last_seen_at).getTime() : 0;
        // Considera online se enviou sinal nos últimos 3 minutos
        const isOnline = now - lastSeen < 3 * 60 * 1000;

        return {
          ...u,
          is_online: isOnline,
        };
      });

      return NextResponse.json({ users: formatted });
    }

    return NextResponse.json({
      users: [
        {
          id: "admin-1",
          full_name: "Administrador Geral",
          email: "admin@orgao.gov.br",
          department: "Gabinete Oficial",
          role: "admin",
          is_online: true,
          current_page: "Painel do Gestor",
          last_seen_at: new Date().toISOString(),
          storage_used_bytes: 1048576,
          storage_limit_bytes: 268435456000,
          created_at: new Date().toISOString(),
        },
      ],
    });
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
        // Garante que a role seja atualizada na tabela profiles
        await supabase
          .from("profiles")
          .update({
            role,
            full_name: full_name || email.split("@")[0],
            department: department || "Gabinete Geral",
          })
          .eq("id", createdUserId);

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

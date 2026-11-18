import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "60", 10);
    const filterUserId = searchParams.get("user_id");

    if (isSupabaseConfigured()) {
      const supabase = await createClientServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }

      // Confere se é administrador
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

      let query = supabase
        .from("activity_logs")
        .select(`
          *,
          document:documents(id, title, file_name, file_extension),
          user:profiles(id, full_name, email, department, role, last_seen_at)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (filterUserId) {
        query = query.eq("user_id", filterUserId);
      }

      const { data: logs, error } = await query;

      if (error) {
        // Fallback se o relacionamento foreign key direto não estiver criado
        const { data: simpleLogs, error: simpleErr } = await supabase
          .from("activity_logs")
          .select("*, document:documents(id, title, file_name, file_extension)")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (simpleErr) throw simpleErr;

        return NextResponse.json({ activities: simpleLogs || [] });
      }

      return NextResponse.json({ activities: logs || [] });
    }

    return NextResponse.json({
      activities: [
        {
          id: "act-1",
          action: "upload",
          created_at: new Date().toISOString(),
          details: { file_name: "Edital_Concurso_01.pdf" },
          user: {
            full_name: "Administrador Geral",
            email: "admin@orgao.gov.br",
            role: "admin",
          },
        },
      ],
    });
  } catch (error: any) {
    console.error("Erro ao listar atividades (admin):", error);
    return NextResponse.json(
      { error: error.message || "Falha ao carregar auditoria." },
      { status: 500 }
    );
  }
}

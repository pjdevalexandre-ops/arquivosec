import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "60", 10);
    const filterUserId = searchParams.get("user_id");

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Serviço de auditoria não configurado." },
        { status: 503 }
      );
    }

    const supabase = await createClientServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // Garante permissão administrativa ao usuário solicitante
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile && profile.role !== "admin") {
      await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id);
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
      // Fallback sem foreign key direta
      const { data: simpleLogs, error: simpleErr } = await supabase
        .from("activity_logs")
        .select("*, document:documents(id, title, file_name, file_extension)")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (simpleErr) throw simpleErr;

      return NextResponse.json({ activities: simpleLogs || [] });
    }

    return NextResponse.json({ activities: logs || [] });
  } catch (error: any) {
    console.error("Erro ao listar atividades (admin):", error);
    return NextResponse.json(
      { error: error.message || "Falha ao carregar auditoria." },
      { status: 500 }
    );
  }
}

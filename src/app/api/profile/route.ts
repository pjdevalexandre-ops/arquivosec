import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Serviço de banco de dados não configurado." },
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

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!profile) {
      // Cria perfil sob demanda se ainda não existir
      const newProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Gestor",
        email: user.email || "",
        department: "Gabinete / Gestão Pública",
        storage_limit_bytes: 268435456000,
        storage_used_bytes: 0,
      };
      await supabase.from("profiles").insert(newProfile);
      return NextResponse.json({ profile: newProfile });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("Erro ao obter perfil:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao obter perfil." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { full_name, department, theme_preference } = await req.json();

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Serviço de banco de dados não configurado." },
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

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (full_name !== undefined) updateData.full_name = full_name.trim();
    if (department !== undefined) updateData.department = department.trim();
    if (theme_preference !== undefined) updateData.theme_preference = theme_preference;

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao atualizar perfil." },
      { status: 500 }
    );
  }
}

import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type SettingsRow = Tables<"settings">;
export type SettingsInsert = TablesInsert<"settings">;
export type SettingsUpdate = TablesUpdate<"settings">;

export async function getSettings() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function saveSettings(settings: SettingsInsert | SettingsUpdate) {
  const supabase = createServiceRoleSupabaseClient();

  if ("id" in settings && settings.id) {
    const { data, error } = await supabase
      .from("settings")
      .update(settings)
      .eq("id", settings.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  const { data, error } = await supabase
    .from("settings")
    .insert(settings as SettingsInsert)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

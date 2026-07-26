import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SuperAdminClient from "./client";

export default async function SuperAdminPage() {
  const supabase = createServerSupabase();
  const { data: userData } = await supabase.auth.getUser();

  const { data: isSuper } = await supabase
    .from("super_admins")
    .select("user_id")
    .eq("user_id", userData.user!.id)
    .maybeSingle();

  if (!isSuper) redirect("/admin/citas");

  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });

  const stats = {
    total: businesses?.length ?? 0,
    activos: businesses?.filter((b) => b.plan_status === "active").length ?? 0,
    demo: businesses?.filter((b) => b.plan_status === "demo").length ?? 0,
    inactivos: businesses?.filter((b) => b.plan_status === "inactive").length ?? 0,
  };

  return <SuperAdminClient businesses={businesses ?? []} stats={stats} />;
}

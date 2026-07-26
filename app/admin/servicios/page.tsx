import { createServerSupabase } from "@/lib/supabase/server";
import ServiciosClient from "./client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ServiciosPage() {
  const supabase = createServerSupabase();
  const { data: userData } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", userData.user!.id)
    .maybeSingle();

  if (!business) redirect("/admin/onboarding");

  const [{ data: services }, { data: workers }] = await Promise.all([
    supabase.from("services").select("*").eq("business_id", business!.id).order("created_at"),
    supabase.from("workers").select("*").eq("business_id", business!.id).order("created_at"),
  ]);

  return <ServiciosClient businessId={business!.id} initialServices={services ?? []} initialWorkers={workers ?? []} />;
}

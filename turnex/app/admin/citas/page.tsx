import { createServerSupabase } from "@/lib/supabase/server";
import CitasClient from "./client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CitasPage() {
  const supabase = createServerSupabase();
  const { data: userData } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", userData.user!.id)
    .maybeSingle();

  if (!business) redirect("/admin/onboarding");

  const [{ data: appointments }, { data: workers }] = await Promise.all([
    supabase
      .from("appointments")
      .select("*, services(name, price)")
      .eq("business_id", business!.id)
      .order("starts_at", { ascending: true }),
    supabase.from("workers").select("*").eq("business_id", business!.id).eq("active", true),
  ]);

  return <CitasClient businessId={business!.id} initialAppointments={appointments ?? []} workers={workers ?? []} />;
}

import { createServerSupabase } from "@/lib/supabase/server";
import BookingFlow from "./booking-flow";
import { notFound } from "next/navigation";

type PublicBusiness = {
  id: string;
  name: string;
  niche: string | null;
  description: string | null;
  logo_url: string | null;
  address: string | null;
  timezone: string;
  plan_status: string;
  demo_expires_at: string | null;
};

export default async function PublicBookingPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();

  const { data: business } = await supabase
    .rpc("get_business_public", { p_slug: params.slug })
    .single<PublicBusiness>();

  if (!business) return notFound();

  const [{ data: services }, { data: workers }, { data: hours }] = await Promise.all([
    supabase.rpc("get_services_public", { p_business_id: business.id }),
    supabase.rpc("get_workers_public", { p_business_id: business.id }),
    supabase.rpc("get_hours_public", { p_business_id: business.id }),
  ]);

  return (
    <BookingFlow
      business={business}
      services={services ?? []}
      workers={workers ?? []}
      hours={hours ?? []}
    />
  );
}

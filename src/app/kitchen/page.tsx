import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import KitchenClientPage from "./KitchenClientPage";

export default async function KitchenPage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return <KitchenClientPage />;
}

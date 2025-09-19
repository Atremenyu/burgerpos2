import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InventoryClientPage from "./InventoryClientPage";

export default async function InventoryPage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return <InventoryClientPage />;
}

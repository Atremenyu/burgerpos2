
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CashierClientPage from "./CashierClientPage";

export default async function Page() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return <CashierClientPage />;
}

    
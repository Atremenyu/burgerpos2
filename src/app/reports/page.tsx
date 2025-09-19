import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReportsClientPage from "./ReportsClientPage";

export default async function ReportsPage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return <ReportsClientPage />;
}

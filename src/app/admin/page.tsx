import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminClientPage from "./AdminClientPage";

export default async function AdminPage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return <AdminClientPage />;
}

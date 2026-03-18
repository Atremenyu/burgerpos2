"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InventoryClientPage from "./InventoryClientPage";
import { getSession } from "@/lib/auth";

export default function InventoryPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userSession = getSession();
    if (!userSession) {
      router.push("/login");
    } else {
      setSession(userSession);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!session) {
    return null;
  }

  return <InventoryClientPage />;
}

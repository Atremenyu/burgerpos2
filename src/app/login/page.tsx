"use client";

import { loginLocal, signupLocal } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { seedDatabase } from "@/lib/db";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>, type: 'login' | 'signup') {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = type === 'login' ? await loginLocal(formData) : await signupLocal(formData);

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Inicia sesión para administrar el sistema.
          </CardDescription>
        </CardHeader>
        <form>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Admin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button onClick={(e) => {
              const form = e.currentTarget.closest('form');
              if (form?.checkValidity()) {
                handleSubmit({ preventDefault: () => {}, currentTarget: form } as any, 'login');
              } else {
                form?.reportValidity();
              }
            }} className="w-full">
              Iniciar Sesión
            </Button>
            <Button variant="outline" onClick={(e) => {
                const form = e.currentTarget.closest('form');
                if (form?.checkValidity()) {
                  handleSubmit({ preventDefault: () => {}, currentTarget: form } as any, 'signup');
                } else {
                  form?.reportValidity();
                }
              }} className="w-full">
              Registrarse (Primer Usuario)
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

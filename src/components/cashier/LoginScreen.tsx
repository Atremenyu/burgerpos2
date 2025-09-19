
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";

const loginSchema = z.object({
  userId: z.string().min(1, "Debes seleccionar un usuario."),
  pin: z.string().length(4, "El PIN debe tener 4 dígitos."),
});

export default function LoginScreen() {
  const { users, startShift } = useAppContext();
  const { toast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userId: "", pin: "" },
  });

  const handleLogin = (data: z.infer<typeof loginSchema>) => {
    const selectedUser = users.find(u => u.id === data.userId);
    if (selectedUser && selectedUser.pin === data.pin) {
      startShift(selectedUser);
    } else {
      toast({
        title: "Error",
        description: "El PIN es incorrecto. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Iniciar Turno</CardTitle>
          <CardDescription>
            Selecciona tu usuario e ingresa tu PIN para comenzar.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(handleLogin)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Controller
                name="userId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.userId && (
                <p className="text-sm text-destructive">{errors.userId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Controller
                name="pin"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="password"
                    placeholder="PIN de 4 dígitos"
                    maxLength={4}
                    className="text-center text-lg tracking-[0.5em]"
                  />
                )}
              />
              {errors.pin && <p className="text-sm text-destructive">{errors.pin.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar Turno
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

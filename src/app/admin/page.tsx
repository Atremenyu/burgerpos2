
"use client";

import * as React from "react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { PlusCircle, Users, PowerOff, Trash2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const cashierSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  pin: z.string().length(4, "El PIN debe tener 4 dígitos.").regex(/^\d{4}$/, "El PIN debe contener solo números."),
});

export default function AdminPage() {
  const { cashiers, addCashier, deleteCashier, endDay, activeShift } = useAppContext();
  const { toast } = useToast();

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [cashierToDelete, setCashierToDelete] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof cashierSchema>>({
    resolver: zodResolver(cashierSchema),
  });

  const handleAddCashier = (data: z.infer<typeof cashierSchema>) => {
    addCashier(data.name, data.pin);
    toast({
      title: "Cajero añadido",
      description: `El cajero "${data.name}" ha sido creado exitosamente.`,
    });
    reset();
  };

  const handleEndDay = () => {
    endDay();
    toast({
      title: "Día finalizado",
      description: "El turno activo ha sido cerrado. El sistema está listo para un nuevo día.",
    });
  };

  const openDeleteDialog = (cashierId: string) => {
    setCashierToDelete(cashierId);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (cashierToDelete) {
      const success = deleteCashier(cashierToDelete);
      if (success) {
        toast({
          title: "Cajero eliminado",
          description: "El cajero ha sido eliminado correctamente.",
        });
      } else {
        toast({
          title: "Error al eliminar",
          description: "No se puede eliminar un cajero con turnos activos o pasados.",
          variant: "destructive",
        });
      }
      setIsDeleteAlertOpen(false);
      setCashierToDelete(null);
    }
  };


  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PlusCircle /> Añadir Nuevo Cajero</CardTitle>
              <CardDescription>
                Crea una nueva cuenta para un cajero.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(handleAddCashier)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Cajero</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Ej: Juan Pérez"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN (4 dígitos)</Label>
                  <Input
                    id="pin"
                    type="password"
                    maxLength={4}
                    {...register("pin")}
                    placeholder="****"
                  />
                  {errors.pin && (
                    <p className="text-sm text-destructive">{errors.pin.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  Guardar Cajero
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PowerOff /> Controles del Sistema</CardTitle>
              <CardDescription>
                Acciones administrativas para la gestión de turnos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  La función "Finalizar Día" cerrará la sesión del cajero activo, si hay alguna, y guardará el resumen del turno.
                </p>
                 <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleEndDay}
                    disabled={!activeShift}
                  >
                    Finalizar Día
                  </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> Cajeros Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashiers.map((cashier) => (
                  <TableRow key={cashier.id}>
                    <TableCell className="font-mono text-xs">{cashier.id}</TableCell>
                    <TableCell className="font-medium">{cashier.name}</TableCell>
                     <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => openDeleteDialog(cashier.id)}
                        disabled={cashier.id === 'cashier1'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
         <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará el cajero permanentemente. No se puede eliminar un cajero que ya tenga turnos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCashierToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}

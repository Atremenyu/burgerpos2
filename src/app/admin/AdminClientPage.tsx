"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { PlusCircle, Users, Trash2, Edit, ShieldCheck, UserCog, Settings } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { User, Role } from "@/types";
import { addUserAction, updateUserAction, deleteUserAction, addRoleAction, updateRoleAction, deleteRoleAction } from "./actions";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const userSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  pin: z.string().length(4, "El PIN debe tener 4 dígitos.").regex(/^\d{4}$/, "El PIN debe contener solo números."),
  roleId: z.string().min(1, "El rol es requerido."),
});

const PERMISSIONS = [
    { id: 'caja', label: 'Caja' },
    { id: 'kitchen', label: 'Cocina' },
    { id: 'inventory', label: 'Inventario' },
    { id: 'reports', label: 'Informes' },
    { id: 'admin', label: 'Admin' },
];

const roleSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  permissions: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Debes seleccionar al menos un permiso.",
  }),
});

type DeletableItem =
  | { type: 'user'; item: User }
  | { type: 'role'; item: Role };

export default function AdminClientPage() {
  const { users, roles, currentUser } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  const [adminUser, setAdminUser] = React.useState<SupabaseUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClient();
    const getAdminUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAdminUser(user);
      setIsCheckingAuth(false);
    }
    getAdminUser();
  }, []);

  const [isUserDialogOpen, setIsUserDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);

  const [isRoleDialogOpen, setIsRoleDialogOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<DeletableItem | null>(null);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const userForm = useForm<z.infer<typeof userSchema>>({ resolver: zodResolver(userSchema) });
  const roleForm = useForm<z.infer<typeof roleSchema>>({ resolver: zodResolver(roleSchema) });

  React.useEffect(() => {
    if (isUserDialogOpen) {
      userForm.reset(editingUser || { name: "", pin: "", roleId: undefined });
    } else {
      setEditingUser(null);
    }
  }, [isUserDialogOpen, editingUser, userForm]);

  React.useEffect(() => {
    if (isRoleDialogOpen) roleForm.reset(editingRole || { name: "", permissions: [] });
    else setEditingRole(null);
  }, [isRoleDialogOpen, editingRole, roleForm]);

  const handleUserSubmit = async (data: z.infer<typeof userSchema>) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await updateUserAction({ ...editingUser, ...data });
      } else {
        await addUserAction(data);
      }
      toast({ title: `Usuario ${editingUser ? 'actualizado' : 'añadido'}`, description: `El usuario "${data.name}" ha sido guardado.`});
      setIsUserDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSubmit = async (data: z.infer<typeof roleSchema>) => {
    setIsSubmitting(true);
    try {
      if (editingRole) {
        await updateRoleAction({ ...editingRole, ...data });
      } else {
        await addRoleAction(data);
      }
      toast({ title: `Rol ${editingRole ? 'actualizado' : 'añadido'}`, description: `El rol "${data.name}" ha sido guardado.`});
      setIsRoleDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
      if (itemToDelete.type === 'user') {
        await deleteUserAction(itemToDelete.item.id);
      } else if (itemToDelete.type === 'role') {
        const isRoleInUse = users.some(u => u.roleId === itemToDelete.item.id);
        if (isRoleInUse) {
          throw new Error("No se puede eliminar un rol que está asignado a uno o más usuarios.");
        }
        await deleteRoleAction(itemToDelete.item.id);
      }
      toast({ title: "Elemento eliminado", description: `El elemento "${itemToDelete.item.name}" ha sido eliminado.` });
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (item: DeletableItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const hasPermission = React.useMemo(() => {
    if (adminUser) return true; // Admin always has access
    if (currentUser) return currentUser.role?.permissions?.includes('admin') ?? false; // Employee needs specific permission
    return false;
  }, [currentUser, adminUser]);

  if (isCheckingAuth) {
    return <AppShell><div>Loading...</div></AppShell>; // Or a proper skeleton loader
  }

  if (!hasPermission) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-2xl font-bold">Acceso Denegado</h1>
            <p className="text-muted-foreground">No tienes permiso para acceder a esta sección.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>

        <Tabs defaultValue="users">
            <TabsList className="grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2">
                <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
                <TabsTrigger value="roles">Gestión de Roles</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
                 <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2"><UserCog /> Usuarios del Sistema</CardTitle>
                            <CardDescription>Añade, edita o elimina empleados y sus PINs.</CardDescription>
                        </div>
                        <Button onClick={() => { setEditingUser(null); setIsUserDialogOpen(true); }} className="w-full sm:w-auto">
                           <PlusCircle className="mr-2 h-4 w-4"/> Añadir Usuario
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{roles.find(r => r.id === user.roleId)?.name || 'N/A'}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingUser(user); setIsUserDialogOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog({type: 'user', item: user})}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="roles" className="mt-6">
                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2"><ShieldCheck /> Roles y Permisos</CardTitle>
                            <CardDescription>Define roles y los permisos asociados a cada uno.</CardDescription>
                        </div>
                        <Button onClick={() => { setEditingRole(null); setIsRoleDialogOpen(true); }} className="w-full sm:w-auto">
                           <PlusCircle className="mr-2 h-4 w-4"/> Añadir Rol
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rol</TableHead>
                                <TableHead>Permisos</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell className="font-medium">{role.name}</TableCell>
                                <TableCell className="text-xs">{role.permissions.join(', ')}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingRole(role); setIsRoleDialogOpen(true);}}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog({type: 'role', item: role})}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

        {/* User Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</DialogTitle>
                </DialogHeader>
                <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit(handleUserSubmit)} className="space-y-4 py-4">
                        <FormField control={userForm.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre del Usuario</FormLabel><FormControl><Input {...field} placeholder="Ej: Juan Pérez" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={userForm.control} name="pin" render={({ field }) => (
                            <FormItem><FormLabel>PIN (4 dígitos)</FormLabel><FormControl><Input {...field} type="password" maxLength={4} placeholder="****" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={userForm.control} name="roleId" render={({ field }) => (
                            <FormItem><FormLabel>Rol</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {roles.map(role => (<SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>))}
                                </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )}/>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting}>Guardar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

        {/* Role Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingRole ? 'Editar Rol' : 'Añadir Nuevo Rol'}</DialogTitle>
                </DialogHeader>
                 <Form {...roleForm}>
                    <form onSubmit={roleForm.handleSubmit(handleRoleSubmit)} className="space-y-4 py-4">
                        <FormField control={roleForm.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre del Rol</FormLabel><FormControl><Input {...field} placeholder="Ej: Gerente" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={roleForm.control} name="permissions" render={() => (
                            <FormItem>
                                <FormLabel>Permisos</FormLabel>
                                {PERMISSIONS.map(permission => (
                                     <FormField
                                        key={permission.id}
                                        control={roleForm.control}
                                        name="permissions"
                                        render={({ field }) => {
                                        return (
                                            <FormItem key={permission.id} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                checked={field.value?.includes(permission.id)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                    ? field.onChange([...(field.value || []), permission.id])
                                                    : field.onChange(field.value?.filter((value) => value !== permission.id))
                                                }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">{permission.label}</FormLabel>
                                            </FormItem>
                                        )
                                        }}
                                    />
                                ))}
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting}>Guardar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

         <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el elemento "{itemToDelete?.item.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} disabled={isSubmitting}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}


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
import { PlusCircle, Users, Trash2, Edit, ShieldCheck, UserCog } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { User, Role } from "@/types";

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


export default function AdminPage() {
  const { 
    users, 
    roles, 
    addUser, 
    updateUser,
    deleteUser, 
    addRole, 
    updateRole, 
    deleteRole,
    currentUser,
  } = useAppContext();
  const { toast } = useToast();

  const [isUserDialogOpen, setIsUserDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  
  const [isRoleDialogOpen, setIsRoleDialogOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<{ type: 'user' | 'role'; id: string; name: string } | null>(null);

  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
  });

  const roleForm = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema)
  });

  React.useEffect(() => {
    if (isUserDialogOpen) {
      userForm.reset(editingUser || { name: "", pin: "", roleId: "" });
    } else {
        setEditingUser(null);
    }
  }, [isUserDialogOpen, editingUser, userForm]);
  
  React.useEffect(() => {
    if (isRoleDialogOpen) {
      roleForm.reset(editingRole || { name: "", permissions: [] });
    } else {
      setEditingRole(null);
    }
  }, [isRoleDialogOpen, editingRole, roleForm]);


  const handleUserSubmit = (data: z.infer<typeof userSchema>) => {
    if(editingUser) {
        updateUser({ ...editingUser, ...data });
        toast({ title: "Usuario actualizado", description: `El usuario "${data.name}" ha sido actualizado.`});
    } else {
        addUser(data);
        toast({ title: "Usuario añadido", description: `El usuario "${data.name}" ha sido creado.` });
    }
    setIsUserDialogOpen(false);
  };

  const handleRoleSubmit = (data: z.infer<typeof roleSchema>) => {
    if(editingRole) {
        updateRole({ ...editingRole, ...data });
        toast({ title: "Rol actualizado", description: `El rol "${data.name}" ha sido actualizado.`});
    } else {
        addRole(data);
        toast({ title: "Rol añadido", description: `El rol "${data.name}" ha sido creado.` });
    }
    setIsRoleDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    
    let success = false;
    let message: { title: string, description: string } | null = null;

    if (itemToDelete.type === 'user') {
      success = deleteUser(itemToDelete.id);
      message = success 
        ? { title: "Usuario eliminado", description: "El usuario ha sido eliminado correctamente." }
        : { title: "Error al eliminar", description: "No se puede eliminar un usuario con turnos asociados." };
    } else if (itemToDelete.type === 'role') {
      success = deleteRole(itemToDelete.id);
      message = success
        ? { title: "Rol eliminado", description: "El rol ha sido eliminado correctamente." }
        : { title: "Error al eliminar", description: "No se puede eliminar un rol asignado a uno o más usuarios." };
    }

    toast({ ...message, variant: success ? 'default' : 'destructive' });
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const openDeleteDialog = (type: 'user' | 'role', item: User | Role) => {
    setItemToDelete({ type, id: item.id, name: item.name });
    setIsDeleteDialogOpen(true);
  };
  
  if (!currentUser?.role.permissions.includes('admin')) {
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
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
                <TabsTrigger value="roles">Gestión de Roles</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
                 <Card>
                    <CardHeader className="flex-row justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2"><UserCog /> Usuarios del Sistema</CardTitle>
                            <CardDescription>Añade, edita o elimina usuarios.</CardDescription>
                        </div>
                        <Button onClick={() => { setEditingUser(null); setIsUserDialogOpen(true); }}>
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
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog('user', user)} disabled={user.id === 'user1'}>
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
                    <CardHeader className="flex-row justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2"><ShieldCheck /> Roles y Permisos</CardTitle>
                            <CardDescription>Define roles y los permisos asociados a cada uno.</CardDescription>
                        </div>
                        <Button onClick={() => { setEditingRole(null); setIsRoleDialogOpen(true); }}>
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
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog('role', role)} disabled={role.id === 'role1'}>
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
                            <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

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
                                                    ? field.onChange([...field.value, permission.id])
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
                            <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit">Guardar</Button>
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
                Esta acción no se puede deshacer. Se eliminará permanentemente el {itemToDelete?.type === 'user' ? 'usuario' : 'rol'}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}

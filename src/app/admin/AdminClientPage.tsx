
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
import { PlusCircle, Users, Trash2, Edit, ShieldCheck, UserCog, Settings, ToggleLeft } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import type { User, Role, OrderType, PaymentMethod, DeliveryPlatform } from "@/types";
import LoginScreen from "@/components/cashier/LoginScreen";

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

const orderTypeSchema = z.object({ name: z.string().min(1, "El nombre es requerido.") });
const paymentMethodSchema = z.object({ name: z.string().min(1, "El nombre es requerido."), isPlatformPayment: z.boolean() });
const deliveryPlatformSchema = z.object({ name: z.string().min(1, "El nombre es requerido."), requiresPlatformPayment: z.boolean() });

type DeletableItem =
  | { type: 'user'; item: User }
  | { type: 'role'; item: Role }
  | { type: 'orderType'; item: OrderType }
  | { type: 'paymentMethod'; item: PaymentMethod }
  | { type: 'deliveryPlatform'; item: DeliveryPlatform };

export default function AdminPage() {
  const context = useAppContext();
  const { toast } = useToast();

  const [isUserDialogOpen, setIsUserDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);

  const [isRoleDialogOpen, setIsRoleDialogOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<DeletableItem | null>(null);

  const [isSettingDialogOpen, setIsSettingDialogOpen] = React.useState(false);
  const [editingSetting, setEditingSetting] = React.useState<DeletableItem | null>(null);


  const userForm = useForm<z.infer<typeof userSchema>>({ resolver: zodResolver(userSchema) });
  const roleForm = useForm<z.infer<typeof roleSchema>>({ resolver: zodResolver(roleSchema) });
  const orderTypeForm = useForm<z.infer<typeof orderTypeSchema>>({ resolver: zodResolver(orderTypeSchema) });
  const paymentMethodForm = useForm<z.infer<typeof paymentMethodSchema>>({ resolver: zodResolver(paymentMethodSchema) });
  const deliveryPlatformForm = useForm<z.infer<typeof deliveryPlatformSchema>>({ resolver: zodResolver(deliveryPlatformSchema) });

  React.useEffect(() => {
    if (isUserDialogOpen) userForm.reset(editingUser || { name: "", pin: "", roleId: "" });
    else setEditingUser(null);
  }, [isUserDialogOpen, editingUser, userForm]);

  React.useEffect(() => {
    if (isRoleDialogOpen) roleForm.reset(editingRole || { name: "", permissions: [] });
    else setEditingRole(null);
  }, [isRoleDialogOpen, editingRole, roleForm]);

  React.useEffect(() => {
    if (isSettingDialogOpen && editingSetting) {
      switch (editingSetting.type) {
        case 'orderType': orderTypeForm.reset(editingSetting.item); break;
        case 'paymentMethod': paymentMethodForm.reset(editingSetting.item); break;
        case 'deliveryPlatform': deliveryPlatformForm.reset(editingSetting.item); break;
      }
    } else {
      setEditingSetting(null);
      orderTypeForm.reset({ name: '' });
      paymentMethodForm.reset({ name: '', isPlatformPayment: false });
      deliveryPlatformForm.reset({ name: '', requiresPlatformPayment: false });
    }
  }, [isSettingDialogOpen, editingSetting, orderTypeForm, paymentMethodForm, deliveryPlatformForm]);

  const handleUserSubmit = (data: z.infer<typeof userSchema>) => {
    if(editingUser) context.updateUser({ ...editingUser, ...data });
    else context.addUser(data);
    toast({ title: `Usuario ${editingUser ? 'actualizado' : 'añadido'}`, description: `El usuario "${data.name}" ha sido ${editingUser ? 'actualizado' : 'creado'}.`});
    setIsUserDialogOpen(false);
  };

  const handleRoleSubmit = (data: z.infer<typeof roleSchema>) => {
    if(editingRole) context.updateRole({ ...editingRole, ...data });
    else context.addRole(data);
    toast({ title: `Rol ${editingRole ? 'actualizado' : 'añadido'}`, description: `El rol "${data.name}" ha sido ${editingRole ? 'actualizado' : 'creado'}.`});
    setIsRoleDialogOpen(false);
  };

  const handleSettingSubmit = (data: any) => {
    if (!editingSetting) return;
    const type = editingSetting.type;
    if (editingSetting.item.id) { // Editing existing
      const updatedItem = { ...editingSetting.item, ...data };
      if (type === 'orderType') context.updateOrderType(updatedItem);
      else if (type === 'paymentMethod') context.updatePaymentMethod(updatedItem);
      else if (type === 'deliveryPlatform') context.updateDeliveryPlatform(updatedItem);
    } else { // Adding new
      if (type === 'orderType') context.addOrderType(data);
      else if (type === 'paymentMethod') context.addPaymentMethod(data);
      else if (type === 'deliveryPlatform') context.addDeliveryPlatform(data);
    }
    toast({ title: "Configuración guardada", description: `El elemento "${data.name}" ha sido guardado.` });
    setIsSettingDialogOpen(false);
  };


  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;

    let success = false;
    let message: { title: string, description: string } | null = null;
    let variant: "default" | "destructive" = "default";

    switch (itemToDelete.type) {
      case 'user': success = context.deleteUser(itemToDelete.item.id); break;
      case 'role': success = context.deleteRole(itemToDelete.item.id); break;
      case 'orderType': success = context.deleteOrderType(itemToDelete.item.id); break;
      case 'paymentMethod': success = context.deletePaymentMethod(itemToDelete.item.id); break;
      case 'deliveryPlatform': success = context.deleteDeliveryPlatform(itemToDelete.item.id); break;
    }

    if (success) {
      message = { title: "Elemento eliminado", description: `El elemento "${itemToDelete.item.name}" ha sido eliminado.` };
    } else {
      message = { title: "Error al eliminar", description: `El elemento "${itemToDelete.item.name}" está en uso y no puede ser eliminado.` };
      variant = 'destructive';
    }

    if (!success && (itemToDelete.type === 'user' || itemToDelete.type === 'role')) {
       message!.description = `No se puede eliminar porque está asignado o tiene registros asociados.`
    }

    toast({ ...message, variant });
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const openDeleteDialog = (item: DeletableItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const openSettingDialog = (item: DeletableItem) => {
    setEditingSetting(item);
    setIsSettingDialogOpen(true);
  };

  if (!context.currentUser) {
    return <LoginScreen />;
  }

  if (!context.currentUser.role.permissions.includes('admin')) {
    return (
        <AppShell>
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-2xl font-bold">Acceso Denegado</h1>
                <p className="text-muted-foreground">No tienes permiso para acceder a esta sección.</p>
            </div>
        </AppShell>
    );
  }

  const renderSettingDialogContent = () => {
    if (!editingSetting) return null;
    switch(editingSetting.type) {
      case 'orderType':
        return <Form {...orderTypeForm}><form onSubmit={orderTypeForm.handleSubmit(handleSettingSubmit)} className="space-y-4 py-4">
          <FormField control={orderTypeForm.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} placeholder="Ej: Para Comer Aquí" /></FormControl><FormMessage /></FormItem>
          )} />
          <DialogFooter><Button type="button" variant="outline" onClick={() => setIsSettingDialogOpen(false)}>Cancelar</Button><Button type="submit">Guardar</Button></DialogFooter>
        </form></Form>;
      case 'paymentMethod':
        return <Form {...paymentMethodForm}><form onSubmit={paymentMethodForm.handleSubmit(handleSettingSubmit)} className="space-y-4 py-4">
          <FormField control={paymentMethodForm.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} placeholder="Ej: Tarjeta de Crédito" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={paymentMethodForm.control} name="isPlatformPayment" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>¿Es un pago de plataforma?</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
          )} />
          <DialogFooter><Button type="button" variant="outline" onClick={() => setIsSettingDialogOpen(false)}>Cancelar</Button><Button type="submit">Guardar</Button></DialogFooter>
        </form></Form>;
      case 'deliveryPlatform':
        return <Form {...deliveryPlatformForm}><form onSubmit={deliveryPlatformForm.handleSubmit(handleSettingSubmit)} className="space-y-4 py-4">
          <FormField control={deliveryPlatformForm.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} placeholder="Ej: Uber Eats" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={deliveryPlatformForm.control} name="requiresPlatformPayment" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>¿Requiere pago automático en plataforma?</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
          )} />
          <DialogFooter><Button type="button" variant="outline" onClick={() => setIsSettingDialogOpen(false)}>Cancelar</Button><Button type="submit">Guardar</Button></DialogFooter>
        </form></Form>;
      default: return null;
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>

        <Tabs defaultValue="users">
            <TabsList className="grid w-full grid-cols-1 gap-1.5 sm:grid-cols-3">
                <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
                <TabsTrigger value="roles">Gestión de Roles</TabsTrigger>
                <TabsTrigger value="settings">Configuración del Sistema</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
                 <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2"><UserCog /> Usuarios del Sistema</CardTitle>
                            <CardDescription>Añade, edita o elimina usuarios.</CardDescription>
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
                            {context.users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{context.roles.find(r => r.id === user.roleId)?.name || 'N/A'}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingUser(user); setIsUserDialogOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog({type: 'user', item: user})} disabled={user.id === 'user1'}>
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
                            {context.roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell className="font-medium">{role.name}</TableCell>
                                <TableCell className="text-xs">{role.permissions.join(', ')}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingRole(role); setIsRoleDialogOpen(true);}}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog({type: 'role', item: role})} disabled={role.id === 'role1'}>
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

            <TabsContent value="settings" className="mt-6 space-y-6">
                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="flex items-center gap-2"><Settings /> Tipos de Pedido</CardTitle>
                        <Button onClick={() => openSettingDialog({ type: 'orderType', item: { id: '', name: '' } })} className="w-full sm:w-auto">
                           <PlusCircle className="mr-2 h-4 w-4"/> Añadir
                        </Button>
                    </CardHeader>
                    <CardContent><Table><TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
                        <TableBody>{context.orderTypes.map(item => (<TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell><Button variant="ghost" size="icon" onClick={() => openSettingDialog({type: 'orderType', item})}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog({type: 'orderType', item})}><Trash2 className="h-4 w-4" /></Button></TableCell>
                        </TableRow>))}</TableBody>
                    </Table></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="flex items-center gap-2"><Settings /> Métodos de Pago</CardTitle>
                        <Button onClick={() => openSettingDialog({ type: 'paymentMethod', item: { id: '', name: '', isPlatformPayment: false } })} className="w-full sm:w-auto">
                           <PlusCircle className="mr-2 h-4 w-4"/> Añadir
                        </Button>
                    </CardHeader>
                    <CardContent><Table><TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Es de Plataforma</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
                        <TableBody>{context.paymentMethods.map(item => (<TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.isPlatformPayment ? 'Sí' : 'No'}</TableCell>
                            <TableCell><Button variant="ghost" size="icon" onClick={() => openSettingDialog({type: 'paymentMethod', item})}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog({type: 'paymentMethod', item})}><Trash2 className="h-4 w-4" /></Button></TableCell>
                        </TableRow>))}</TableBody>
                    </Table></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="flex items-center gap-2"><Settings /> Plataformas de Delivery</CardTitle>
                        <Button onClick={() => openSettingDialog({ type: 'deliveryPlatform', item: { id: '', name: '', requiresPlatformPayment: false } })} className="w-full sm:w-auto">
                           <PlusCircle className="mr-2 h-4 w-4"/> Añadir
                        </Button>
                    </CardHeader>
                    <CardContent><Table><TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Pago Automático</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
                        <TableBody>{context.deliveryPlatforms.map(item => (<TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.requiresPlatformPayment ? 'Sí' : 'No'}</TableCell>
                            <TableCell><Button variant="ghost" size="icon" onClick={() => openSettingDialog({type: 'deliveryPlatform', item})}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog({type: 'deliveryPlatform', item})}><Trash2 className="h-4 w-4" /></Button></TableCell>
                        </TableRow>))}</TableBody>
                    </Table></CardContent>
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
                                    {context.roles.map(role => (<SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>))}
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
                            <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={isSettingDialogOpen} onOpenChange={setIsSettingDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingSetting?.item.id ? 'Editar' : 'Añadir'} Configuración</DialogTitle>
                </DialogHeader>
                {renderSettingDialogContent()}
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
              <AlertDialogAction onClick={handleDeleteConfirm}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}

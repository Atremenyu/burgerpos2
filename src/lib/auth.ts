import { db } from '@/lib/db';

export async function loginLocal(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const authUser = await db.auth.where('email').equals(email).first();

  if (!authUser || authUser.password !== password) {
    return { error: 'Credenciales inválidas' };
  }

  const user = await db.users.get(authUser.userId);
  if (!user) {
      return { error: 'Usuario no encontrado' };
  }

  const role = await db.roles.get(user.roleId);
  if (!role) {
      return { error: 'Rol no encontrado' };
  }

  const currentUser = { ...user, role };
  localStorage.setItem('pos_session', JSON.stringify(currentUser));

  return { success: true, user: currentUser };
}

export async function signupLocal(formData: FormData) {
  // Solo permitir registro si no hay usuarios (primer usuario) o si es admin
  const userCount = await db.users.count();
  if (userCount > 0) {
      return { error: 'El registro manual está desactivado. Contacte al administrador.' };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const adminRoleId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  await db.roles.add({
    id: adminRoleId,
    name: 'Administrador',
    permissions: ['admin', 'caja', 'cocina', 'inventario', 'reportes']
  });

  await db.users.add({
    id: userId,
    name: 'Admin',
    pin: password, // Usamos la misma password como pin inicial
    roleId: adminRoleId
  });

  await db.auth.add({
    id: crypto.randomUUID(),
    email,
    password,
    userId
  });

  const user = await db.users.get(userId);
  const role = await db.roles.get(adminRoleId);
  const currentUser = { ...user!, role: role! };
  localStorage.setItem('pos_session', JSON.stringify(currentUser));

  return { success: true, user: currentUser };
}

export function logoutLocal() {
    localStorage.removeItem('pos_session');
}

export function getSession() {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem('pos_session');
    return session ? JSON.parse(session) : null;
}

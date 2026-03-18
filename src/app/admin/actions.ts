import {
  addUser, updateUser, deleteUser,
  addRole, updateRole, deleteRole
} from "@/lib/database";
import type { User, Role } from "@/types";

export async function addUserAction(user: Omit<User, 'id'>) {
  return await addUser(user);
}

export async function updateUserAction(user: User) {
  return await updateUser(user);
}

export async function deleteUserAction(userId: string) {
  return await deleteUser(userId);
}

export async function addRoleAction(role: Omit<Role, 'id'>) {
  return await addRole(role);
}

export async function updateRoleAction(role: Role) {
  return await updateRole(role);
}

export async function deleteRoleAction(roleId: string) {
  return await deleteRole(roleId);
}

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { User, Role } from '@/types'

// --- User Management Actions ---
export async function addUserAction(userData: Omit<User, 'id'>) {
  const supabase = createClient()
  const { roleId, ...rest } = userData;
  const userToInsert = { ...rest, role_id: roleId };
  const { data, error } = await supabase.from('users').insert(userToInsert).select().single()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function updateUserAction(userData: User) {
  const supabase = createClient()
  const { roleId, ...rest } = userData;
  const { data, error } = await supabase.from('users').update({ ...rest, role_id: roleId }).eq('id', userData.id).select().single()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function deleteUserAction(userId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('users').delete().eq('id', userId)
  if (error) {
    throw new Error(error.message)
  }
}


// --- Role Management Actions ---
export async function addRoleAction(roleData: Omit<Role, 'id'>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('roles').insert(roleData).select().single()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function updateRoleAction(roleData: Role) {
  const supabase = createClient()
  const { data, error } = await supabase.from('roles').update(roleData).eq('id', roleData.id).select().single()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function deleteRoleAction(roleId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('roles').delete().eq('id', roleId)
  if (error) {
    throw new Error(error.message)
  }
}

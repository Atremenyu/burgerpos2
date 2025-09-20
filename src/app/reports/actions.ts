'use server'

import { createClient } from '@/lib/supabase/server'
import type { Expense } from '@/types'
import { revalidatePath } from 'next/cache'

export async function addExpenseAction(expenseData: Omit<Expense, 'id' | 'timestamp'>) {
  const supabase = createClient()
  const expensePayload = { ...expenseData, timestamp: new Date().toISOString() };
  const { data, error } = await supabase.from('expenses').insert(expensePayload).select().single()
  if (error) throw new Error(error.message)
  revalidatePath('/reports')
  return data
}

export async function deleteExpenseAction(expenseId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', expenseId)
  if (error) throw new Error(error.message)
  revalidatePath('/reports')
}

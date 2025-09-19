'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()

  // type-casting here for convenience
  // in a real app you should use something like Zod to validate
  const data = Object.fromEntries(formData)

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return redirect(`/login?message=${error.message}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  // type-casting here for convenience
  // in a real app you should use something like Zod to validate
  const data = Object.fromEntries(formData)

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return redirect(`/login?message=${error.message}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

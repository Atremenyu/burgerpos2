'use server'

import { createClient } from '@/lib/supabase/server'
import type { Product, Ingredient, Category } from '@/types'
import { revalidatePath } from 'next/cache'

// --- Product Actions ---
export async function addProductAction(productData: Omit<Product, 'id' | 'ingredients'>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('products').insert(productData).select().single()
  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
  return data
}

export async function updateProductAction(productData: Product) {
  const supabase = createClient()
  const { data, error } = await supabase.from('products').update(productData).eq('id', productData.id).select().single()
  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
  return data
}

export async function deleteProductAction(productId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('products').delete().eq('id', productId)
  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
}


// --- Ingredient Actions ---
export async function addIngredientAction(ingredientData: Omit<Ingredient, 'id'>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('ingredients').insert(ingredientData).select().single()
  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
  return data
}

export async function updateIngredientAction(ingredientData: Ingredient) {
  const supabase = createClient()
  const { data, error } = await supabase.from('ingredients').update(ingredientData).eq('id', ingredientData.id).select().single()
  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
  return data
}

export async function deleteIngredientAction(ingredientId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('ingredients').delete().eq('id', ingredientId)
  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
}


// --- Category Actions ---
export async function addCategoryAction(categoryData: Omit<Category, 'id'>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('categories').insert(categoryData).select().single()
  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
  return data
}

export async function updateCategoryAction(categoryData: Category) {
  const supabase = createClient()
  const { data, error } = await supabase.from('categories').update(categoryData).eq('id', categoryData.id).select().single()
  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
  return data
}

export async function deleteCategoryAction(categoryId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('categories').delete().eq('id', categoryId)
  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
}

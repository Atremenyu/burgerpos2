import { supabase } from './supabaseClient';
import type { Category } from '@/types';

import { supabase } from './supabaseClient';
import type { Category, Product, Ingredient, User, Role, OrderType, PaymentMethod, DeliveryPlatform } from '@/types';

export const getCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) console.error('Error fetching categories:', error);
    return data || [];
};

export const getProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) console.error('Error fetching products:', error);
    return data || [];
};

export const getIngredients = async (): Promise<Ingredient[]> => {
    const { data, error } = await supabase.from('ingredients').select('*');
    if (error) console.error('Error fetching ingredients:', error);
    return data || [];
};

export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) console.error('Error fetching users:', error);
    return data || [];
};

export const getRoles = async (): Promise<Role[]> => {
    const { data, error } = await supabase.from('roles').select('*');
    if (error) console.error('Error fetching roles:', error);
    return data || [];
};

export const getOrderTypes = async (): Promise<OrderType[]> => {
    const { data, error } = await supabase.from('order_types').select('*');
    if (error) console.error('Error fetching order types:', error);
    return data || [];
};

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    const { data, error } = await supabase.from('payment_methods').select('*');
    if (error) console.error('Error fetching payment methods:', error);
    return data || [];
};

export const getDeliveryPlatforms = async (): Promise<DeliveryPlatform[]> => {
    const { data, error } = await supabase.from('delivery_platforms').select('*');
    if (error) console.error('Error fetching delivery platforms:', error);
    return data || [];
};

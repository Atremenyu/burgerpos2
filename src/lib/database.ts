import { createClient } from './supabase/server';
import type { Category, Product, Ingredient, User, Role, OrderType, PaymentMethod, DeliveryPlatform } from '@/types';

export const getCategories = async (): Promise<Category[]> => {
    const supabase = createClient();
    const { data, error } = await supabase.from('categories').select('*');
    if (error) console.error('Error fetching categories:', error);
    return data || [];
};

export const getProducts = async (): Promise<Product[]> => {
    const supabase = createClient();
    const { data, error } = await supabase.from('products').select('*');
    if (error) console.error('Error fetching products:', error);
    return data || [];
};

export const getIngredients = async (): Promise<Ingredient[]> => {
    const supabase = createClient();
    const { data, error } = await supabase.from('ingredients').select('*');
    if (error) console.error('Error fetching ingredients:', error);
    return data || [];
};

export const getUsers = async (): Promise<User[]> => {
    const supabase = createClient();
    const { data, error } = await supabase.from('users').select('*');
    if (error) console.error('Error fetching users:', error);
    return data || [];
};

export const getRoles = async (): Promise<Role[]> => {
    const supabase = createClient();
    const { data, error } = await supabase.from('roles').select('*');
    if (error) console.error('Error fetching roles:', error);
    return data || [];
};

export const getOrderTypes = async (): Promise<OrderType[]> => {
    const supabase = createClient();
    const { data, error } = await supabase.from('order_types').select('*');
    if (error) console.error('Error fetching order types:', error);
    return data || [];
};

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    const supabase = createClient();
    const { data, error } = await supabase.from('payment_methods').select('*');
    if (error) console.error('Error fetching payment methods:', error);
    return data || [];
};

export const getDeliveryPlatforms = async (): Promise<DeliveryPlatform[]> => {
    const supabase = createClient();
    const { data, error } = await supabase.from('delivery_platforms').select('*');
    if (error) console.error('Error fetching delivery platforms:', error);
    return data || [];
};

// --- User Management ---
export const addUser = async (user: Omit<User, 'id'>): Promise<User | null> => {
    const supabase = createClient();
    const { data, error } = await supabase.from('users').insert(user).select().single();
    if (error) {
        console.error('Error adding user:', error);
        return null;
    }
    return data;
};

export const updateUser = async (user: User): Promise<User | null> => {
    const supabase = createClient();
    const { data, error } = await supabase.from('users').update(user).eq('id', user.id).select().single();
    if (error) {
        console.error('Error updating user:', error);
        return null;
    }
    return data;
};

export const deleteUser = async (userId: string): Promise<boolean> => {
    const supabase = createClient();
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
        console.error('Error deleting user:', error);
        return false;
    }
    return true;
};

// --- Role Management ---
export const addRole = async (role: Omit<Role, 'id'>): Promise<Role | null> => {
    const supabase = createClient();
    const { data, error } = await supabase.from('roles').insert(role).select().single();
    if (error) {
        console.error('Error adding role:', error);
        return null;
    }
    return data;
};

export const updateRole = async (role: Role): Promise<Role | null> => {
    const supabase = createClient();
    const { data, error } = await supabase.from('roles').update(role).eq('id', role.id).select().single();
    if (error) {
        console.error('Error updating role:', error);
        return null;
    }
    return data;
};

export const deleteRole = async (roleId: string): Promise<boolean> => {
    const supabase = createClient();
    const { error } = await supabase.from('roles').delete().eq('id', roleId);
    if (error) {
        console.error('Error deleting role:', error);
        return false;
    }
    return true;
};

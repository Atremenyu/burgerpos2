import { db } from './db';
import type { Category, Product, Ingredient, User, Role, OrderType, PaymentMethod, DeliveryPlatform, Order, Expense, Shift } from '@/types';

export const getCategories = async (): Promise<Category[]> => {
    return await db.categories.toArray();
};

export const getProducts = async (): Promise<Product[]> => {
    return await db.products.toArray();
};

export const getIngredients = async (): Promise<Ingredient[]> => {
    return await db.ingredients.toArray();
};

export const getUsers = async (): Promise<User[]> => {
    return await db.users.toArray();
};

export const getRoles = async (): Promise<Role[]> => {
    return await db.roles.toArray();
};

export const getOrderTypes = async (): Promise<OrderType[]> => {
    return await db.orderTypes.toArray();
};

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    return await db.paymentMethods.toArray();
};

export const getDeliveryPlatforms = async (): Promise<DeliveryPlatform[]> => {
    return await db.deliveryPlatforms.toArray();
};

export const getOrders = async (): Promise<Order[]> => {
    return await db.orders.toArray();
};

export const getExpenses = async (): Promise<Expense[]> => {
    return await db.expenses.toArray();
};

export const getShifts = async (): Promise<Shift[]> => {
    return await db.shifts.toArray();
};

// --- User Management ---
export const addUser = async (user: Omit<User, 'id'>): Promise<User | null> => {
    const id = crypto.randomUUID();
    const newUser = { ...user, id };
    await db.users.add(newUser);
    return newUser;
};

export const updateUser = async (user: User): Promise<User | null> => {
    await db.users.update(user.id, user);
    return user;
};

export const deleteUser = async (userId: string): Promise<boolean> => {
    await db.users.delete(userId);
    return true;
};

// --- Role Management ---
export const addRole = async (role: Omit<Role, 'id'>): Promise<Role | null> => {
    const id = crypto.randomUUID();
    const newRole = { ...role, id };
    await db.roles.add(newRole);
    return newRole;
};

export const updateRole = async (role: Role): Promise<Role | null> => {
    await db.roles.update(role.id, role);
    return role;
};

export const deleteRole = async (roleId: string): Promise<boolean> => {
    await db.roles.delete(roleId);
    return true;
};

// --- Product Management ---
export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
    const id = crypto.randomUUID();
    const newProduct = { ...product, id };
    await db.products.add(newProduct);
    return newProduct;
};

export const updateProduct = async (product: Product): Promise<Product | null> => {
    await db.products.update(product.id, product);
    return product;
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
    await db.products.delete(productId);
    return true;
};

// --- Order Management ---
export const addOrder = async (order: Omit<Order, 'id'>): Promise<Order | null> => {
    const id = crypto.randomUUID();
    const newOrder = { ...order, id };
    await db.orders.add(newOrder);
    return newOrder;
};

export const updateOrder = async (order: Order): Promise<Order | null> => {
    await db.orders.update(order.id, order);
    return order;
};

// --- Shift Management ---
export const addShift = async (shift: Omit<Shift, 'id'>): Promise<Shift | null> => {
    const id = crypto.randomUUID();
    const newShift = { ...shift, id };
    await db.shifts.add(newShift);
    return newShift;
};

export const updateShift = async (shift: Shift): Promise<Shift | null> => {
    await db.shifts.update(shift.id, shift);
    return shift;
};

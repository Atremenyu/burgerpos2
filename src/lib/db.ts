import Dexie, { type EntityTable } from 'dexie';
import type {
  Category, Product, Ingredient, User, Role,
  OrderType, PaymentMethod, DeliveryPlatform, Order, Expense, Shift
} from '@/types';

export class POSDatabase extends Dexie {
  categories!: EntityTable<Category, 'id'>;
  products!: EntityTable<Product, 'id'>;
  ingredients!: EntityTable<Ingredient, 'id'>;
  users!: EntityTable<User, 'id'>;
  roles!: EntityTable<Role, 'id'>;
  orderTypes!: EntityTable<OrderType, 'id'>;
  paymentMethods!: EntityTable<PaymentMethod, 'id'>;
  deliveryPlatforms!: EntityTable<DeliveryPlatform, 'id'>;
  orders!: EntityTable<Order, 'id'>;
  expenses!: EntityTable<Expense, 'id'>;
  shifts!: EntityTable<Shift, 'id'>;
  auth!: EntityTable<{ id: string; email: string; password: string; userId: string }, 'id'>;

  constructor() {
    super('POSDatabase');
    this.version(1).stores({
      categories: 'id, name',
      products: 'id, name, category',
      ingredients: 'id, name',
      users: 'id, name, pin, roleId',
      roles: 'id, name',
      orderTypes: 'id, name',
      paymentMethods: 'id, name',
      deliveryPlatforms: 'id, name',
      orders: 'id, timestamp, status, userId, shiftId',
      expenses: 'id, timestamp',
      shifts: 'id, userId, startTime',
      auth: 'id, email, password, userId'
    });
  }
}

export const db = new POSDatabase();

// Initial seed data
export async function seedDatabase() {
  const roleCount = await db.roles.count();
  if (roleCount === 0) {
    const adminRoleId = crypto.randomUUID();
    const adminUserId = crypto.randomUUID();

    await db.roles.add({
      id: adminRoleId,
      name: 'Administrador',
      permissions: ['admin', 'caja', 'cocina', 'inventario', 'reportes']
    });

    await db.users.add({
      id: adminUserId,
      name: 'Admin',
      pin: '1234',
      roleId: adminRoleId
    });

    await db.auth.add({
      id: crypto.randomUUID(),
      email: 'admin@admin.com',
      password: '1234',
      userId: adminUserId
    });

    // Seed some basic categories and methods
    await db.categories.bulkAdd([
      { id: crypto.randomUUID(), name: 'Comida' },
      { id: crypto.randomUUID(), name: 'Bebidas' }
    ]);

    await db.orderTypes.bulkAdd([
      { id: crypto.randomUUID(), name: 'Para comer aquí' },
      { id: crypto.randomUUID(), name: 'Para llevar' },
      { id: crypto.randomUUID(), name: 'A domicilio' }
    ]);

    await db.paymentMethods.bulkAdd([
      { id: crypto.randomUUID(), name: 'Efectivo', isPlatformPayment: false },
      { id: crypto.randomUUID(), name: 'Tarjeta', isPlatformPayment: false }
    ]);
  }
}

if (typeof window !== 'undefined') {
    (window as any).db = db;
    (window as any).seedDatabase = seedDatabase;
}

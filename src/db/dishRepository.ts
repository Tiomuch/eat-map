import { getDatabase } from './database';
import { CreateDishInput, Dish, UpdateDishInput } from '@/types/dish';

interface DishRow {
  id: number;
  name: string;
  description: string;
  category: string;
  photo_uri: string | null;
  created_at: string;
}

function mapRowToDish(row: DishRow): Dish {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category as Dish['category'],
    photoUri: row.photo_uri,
    createdAt: row.created_at,
  };
}

export async function getAllDishes(): Promise<Dish[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DishRow>('SELECT * FROM dishes ORDER BY created_at DESC');
  return rows.map(mapRowToDish);
}

export async function getDishesByCategory(category: string): Promise<Dish[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DishRow>(
    'SELECT * FROM dishes WHERE category = ? ORDER BY name ASC',
    [category],
  );
  return rows.map(mapRowToDish);
}

export async function getDishById(id: number): Promise<Dish | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<DishRow>('SELECT * FROM dishes WHERE id = ?', [id]);
  return row ? mapRowToDish(row) : null;
}

export async function createDish(input: CreateDishInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO dishes (name, description, category, photo_uri) VALUES (?, ?, ?, ?)',
    [input.name, input.description, input.category, input.photoUri],
  );
  return result.lastInsertRowId;
}

export async function updateDish(id: number, input: UpdateDishInput): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | null)[] = [];

  if (input.name !== undefined) {
    fields.push('name = ?');
    values.push(input.name);
  }
  if (input.description !== undefined) {
    fields.push('description = ?');
    values.push(input.description);
  }
  if (input.category !== undefined) {
    fields.push('category = ?');
    values.push(input.category);
  }
  if (input.photoUri !== undefined) {
    fields.push('photo_uri = ?');
    values.push(input.photoUri);
  }

  if (fields.length > 0) {
    values.push(String(id));
    await db.runAsync(`UPDATE dishes SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deleteDish(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM dishes WHERE id = ?', [id]);
}

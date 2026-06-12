export const CATEGORIES = [
  'Breakfast',
  'Soup',
  'Main Course',
  'Salad',
  'Dessert',
  'Drink',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Dish {
  id: number;
  name: string;
  description: string;
  category: Category;
  photoUri: string | null;
  createdAt: string;
}

export interface CreateDishInput {
  name: string;
  description: string;
  category: Category;
  photoUri: string | null;
}

export interface UpdateDishInput {
  name?: string;
  description?: string;
  category?: Category;
  photoUri?: string | null;
}

export interface ScheduleItem {
  id: number;
  dishId: number;
  date: string; // 'YYYY-MM-DD'
  category: Category;
  dishName: string;
  dishPhotoUri: string | null;
}

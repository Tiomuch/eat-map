import * as SQLite from 'expo-sqlite'
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system/legacy'
import { CATEGORIES, Category } from '@/types/dish'

let db: SQLite.SQLiteDatabase | null = null

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('eatmap.db')
  }
  return db
}

export async function initDatabase(): Promise<void> {
  const database = await getDatabase()

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS dishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      photo_uri TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)

  await database.execAsync(`PRAGMA foreign_keys = ON;`)

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schedule_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dish_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
    );
  `)

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS template_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      dish_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
      FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
    );
  `)

  // Check if we need to seed data
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM dishes',
  )

  if (result && result.count === 0) {
    await seedTestData(database)
  }
}

async function getPlaceholderUri(): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const asset = Asset.fromModule(require('@/assets/images/placeholder-dish.png'))
    await asset.downloadAsync()

    if (asset.localUri) {
      // Copy to document directory for persistence
      const destUri = `${FileSystem.documentDirectory}placeholder-dish.png`
      const fileInfo = await FileSystem.getInfoAsync(destUri)
      if (!fileInfo.exists) {
        await FileSystem.copyAsync({
          from: asset.localUri,
          to: destUri,
        })
      }
      return destUri
    }
  } catch {
    // Fallback if asset loading fails
  }
  return ''
}

const TEST_DISHES: Record<Category, { name: string; description: string }[]> = {
  Breakfast: [
    {
      name: 'Fluffy Pancakes',
      description: 'Golden buttermilk pancakes with maple syrup and fresh berries',
    },
    {
      name: 'French Toast',
      description: 'Brioche bread dipped in vanilla custard, caramelized to perfection',
    },
    {
      name: 'Eggs Benedict',
      description: 'Poached eggs on English muffin with silky hollandaise sauce',
    },
    {
      name: 'Avocado Toast',
      description: 'Sourdough topped with smashed avocado, cherry tomatoes and microgreens',
    },
    {
      name: 'Oatmeal Bowl',
      description: 'Creamy steel-cut oats with honey, banana and toasted almonds',
    },
    {
      name: 'Smoothie Bowl',
      description: 'Thick acai blend topped with granola, coconut and fresh fruit',
    },
    {
      name: 'Belgian Waffles',
      description: 'Crispy outside, fluffy inside — served with whipped cream',
    },
    {
      name: 'Breakfast Burrito',
      description: 'Scrambled eggs, black beans, cheese and salsa in a warm tortilla',
    },
    {
      name: 'Granola Parfait',
      description: 'Layers of Greek yogurt, crunchy granola and seasonal berries',
    },
    {
      name: 'Butter Croissant',
      description: 'Flaky, golden French pastry with layers of buttery dough',
    },
  ],
  Soup: [
    {
      name: 'Tomato Bisque',
      description: 'Creamy roasted tomato soup with a hint of basil and cream',
    },
    {
      name: 'Chicken Noodle',
      description: 'Classic comfort soup with tender chicken, vegetables and egg noodles',
    },
    { name: 'Minestrone', description: 'Hearty Italian vegetable soup with pasta and parmesan' },
    {
      name: 'French Onion',
      description: 'Caramelized onion broth topped with crusty bread and melted gruyère',
    },
    {
      name: 'Clam Chowder',
      description: 'New England style — creamy, loaded with clams and potatoes',
    },
    {
      name: 'Vietnamese Pho',
      description: 'Aromatic beef broth with rice noodles, herbs and tender sliced beef',
    },
    {
      name: 'Miso Soup',
      description: 'Traditional Japanese soup with tofu, wakame seaweed and scallions',
    },
    {
      name: 'Gazpacho',
      description: 'Chilled Spanish tomato soup with cucumber, peppers and olive oil',
    },
    {
      name: 'Red Lentil Soup',
      description: 'Warming Middle Eastern soup with cumin, lemon and crispy pita',
    },
    {
      name: 'Borscht',
      description: 'Ruby-red beetroot soup served with sour cream and fresh dill',
    },
  ],
  'Main Course': [
    {
      name: 'Grilled Salmon',
      description: 'Atlantic salmon fillet with lemon-dill sauce and asparagus',
    },
    {
      name: 'Beef Steak',
      description: 'Perfectly seared ribeye with herb butter and roasted vegetables',
    },
    {
      name: 'Chicken Parmesan',
      description: 'Breaded chicken breast with marinara sauce and melted mozzarella',
    },
    {
      name: 'Pad Thai',
      description: 'Stir-fried rice noodles with shrimp, peanuts and tamarind sauce',
    },
    {
      name: 'Lamb Chops',
      description: 'Herb-crusted lamb chops with mint sauce and roasted potatoes',
    },
    {
      name: 'Sushi Platter',
      description: 'Assorted nigiri and maki rolls with fresh wasabi and pickled ginger',
    },
    {
      name: 'Pasta Carbonara',
      description: 'Creamy Roman pasta with guanciale, pecorino and black pepper',
    },
    {
      name: 'Butter Chicken',
      description: 'Tender chicken in rich, creamy tomato-spiced curry with naan',
    },
    {
      name: 'Tacos Al Pastor',
      description: 'Marinated pork with pineapple, cilantro and salsa verde',
    },
    {
      name: 'Mushroom Risotto',
      description: 'Arborio rice slowly cooked with wild mushrooms and parmesan',
    },
  ],
  Salad: [
    {
      name: 'Caesar Salad',
      description: 'Crisp romaine with parmesan, croutons and creamy Caesar dressing',
    },
    {
      name: 'Greek Salad',
      description: 'Fresh tomatoes, cucumber, olives, feta cheese and oregano',
    },
    {
      name: 'Caprese Salad',
      description: 'Sliced mozzarella, ripe tomatoes, basil and balsamic glaze',
    },
    { name: 'Cobb Salad', description: 'Loaded with chicken, avocado, bacon, egg and blue cheese' },
    {
      name: 'Waldorf Salad',
      description: 'Crisp apples, celery, walnuts and grapes in creamy dressing',
    },
    {
      name: 'Niçoise Salad',
      description: 'Seared tuna, green beans, olives, egg and Dijon vinaigrette',
    },
    {
      name: 'Asian Sesame Salad',
      description: 'Crunchy vegetables with edamame and toasted sesame dressing',
    },
    {
      name: 'Quinoa Power Bowl',
      description: 'Protein-packed quinoa with roasted vegetables and tahini drizzle',
    },
    {
      name: 'Fattoush',
      description: 'Lebanese salad with crispy pita chips, sumac and pomegranate',
    },
    {
      name: 'Garden Salad',
      description: 'Mixed greens with seasonal vegetables and light vinaigrette',
    },
  ],
  Dessert: [
    {
      name: 'Tiramisu',
      description: 'Italian classic — espresso-soaked ladyfingers with mascarpone cream',
    },
    {
      name: 'Crème Brûlée',
      description: 'Silky vanilla custard with a crispy caramelized sugar top',
    },
    {
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with a molten center, served with ice cream',
    },
    {
      name: 'New York Cheesecake',
      description: 'Dense, creamy cheesecake with graham cracker crust and berry sauce',
    },
    {
      name: 'Panna Cotta',
      description: 'Italian cream dessert with vanilla bean and raspberry coulis',
    },
    {
      name: 'French Macarons',
      description: 'Delicate almond cookies with assorted ganache fillings',
    },
    {
      name: 'Apple Pie',
      description: 'Warm cinnamon-spiced apples in a flaky, golden pastry crust',
    },
    {
      name: 'Mochi Ice Cream',
      description: 'Japanese rice cake filled with creamy ice cream in various flavors',
    },
    { name: 'Baklava', description: 'Layers of phyllo pastry with honey, walnuts and pistachios' },
    {
      name: 'Churros',
      description: 'Crispy cinnamon-sugar pastry sticks with rich chocolate dipping sauce',
    },
  ],
  Drink: [
    { name: 'Espresso', description: 'Rich, intense Italian coffee shot with golden crema' },
    { name: 'Matcha Latte', description: 'Ceremonial grade matcha whisked with steamed oat milk' },
    {
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed oranges — pure sunshine in a glass',
    },
    {
      name: 'Berry Smoothie',
      description: 'Blended mixed berries with yogurt, honey and chia seeds',
    },
    {
      name: 'Hot Chocolate',
      description: 'Luxurious Belgian chocolate melted into steamed milk with marshmallows',
    },
    {
      name: 'Chai Tea Latte',
      description: 'Spiced black tea with cardamom, cinnamon and frothy milk',
    },
    {
      name: 'Pink Lemonade',
      description: 'Refreshing lemon juice with a splash of raspberry and mint',
    },
    { name: 'Iced Coffee', description: 'Cold-brewed coffee over ice with vanilla and cream' },
    { name: 'Kombucha', description: 'Naturally fermented tea with ginger and lemon probiotics' },
    {
      name: 'Virgin Mojito',
      description: 'Fresh lime, mint leaves, sparkling water and a touch of sugar',
    },
  ],
}

async function seedTestData(database: SQLite.SQLiteDatabase): Promise<void> {
  const placeholderUri = await getPlaceholderUri()

  for (const category of CATEGORIES) {
    const dishes = TEST_DISHES[category]
    for (const dish of dishes) {
      await database.runAsync(
        'INSERT INTO dishes (name, description, category, photo_uri) VALUES (?, ?, ?, ?)',
        [dish.name, dish.description, category, placeholderUri || null],
      )
    }
  }
}

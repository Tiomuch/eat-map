import { getDatabase } from '../database/database'
import { Template, TemplateItem, CreateTemplateInput, Category } from '@/types/dish'

export async function createTemplate(input: CreateTemplateInput): Promise<number> {
  const db = await getDatabase()
  
  let templateId: number = 0

  await db.withTransactionAsync(async () => {
    const result = await db.runAsync('INSERT INTO templates (name) VALUES (?)', [input.name])
    templateId = result.lastInsertRowId

    for (const item of input.items) {
      await db.runAsync(
        'INSERT INTO template_items (template_id, dish_id, category) VALUES (?, ?, ?)',
        [templateId, item.dishId, item.category]
      )
    }
  })

  return templateId
}

export async function getTemplates(): Promise<Template[]> {
  const db = await getDatabase()
  const rows = await db.getAllAsync<{ id: number; name: string; created_at: string }>(
    'SELECT * FROM templates ORDER BY created_at DESC'
  )
  
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    createdAt: r.created_at,
  }))
}

export async function getTemplateItems(templateId: number): Promise<TemplateItem[]> {
  const db = await getDatabase()
  const rows = await db.getAllAsync<{
    id: number
    template_id: number
    dish_id: number
    category: string
    dish_name: string
    dish_photo_uri: string | null
  }>(
    `SELECT 
      ti.id, ti.template_id, ti.dish_id, ti.category,
      d.name as dish_name, d.photo_uri as dish_photo_uri
     FROM template_items ti
     JOIN dishes d ON ti.dish_id = d.id
     WHERE ti.template_id = ?
     ORDER BY ti.created_at ASC`,
    [templateId]
  )

  return rows.map((r) => ({
    id: r.id,
    templateId: r.template_id,
    dishId: r.dish_id,
    category: r.category as Category,
    dishName: r.dish_name,
    dishPhotoUri: r.dish_photo_uri,
  }))
}

export async function deleteTemplate(templateId: number): Promise<void> {
  const db = await getDatabase()
  // With ON DELETE CASCADE, template_items should be deleted automatically
  await db.runAsync('DELETE FROM templates WHERE id = ?', [templateId])
}

export async function updateTemplateItems(templateId: number, items: { dishId: number; category: Category }[]): Promise<void> {
  const db = await getDatabase()

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM template_items WHERE template_id = ?', [templateId])

    for (const item of items) {
      await db.runAsync(
        'INSERT INTO template_items (template_id, dish_id, category) VALUES (?, ?, ?)',
        [templateId, item.dishId, item.category]
      )
    }
  })
}
